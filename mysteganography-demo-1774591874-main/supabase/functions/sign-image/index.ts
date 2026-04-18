// supabase/functions/sign-image/index.ts
// LSB-embeds the user's drawn signature into artwork's blue channel

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @deno-types="https://deno.land/x/imagescript@1.2.15/mod.d.ts"
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Verify JWT ──────────────────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token", code: "UNAUTHORIZED" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Parse multipart form data ─────────────────────────────────────────
    const formData = await req.formData();
    const artworkFile = formData.get("artwork") as File | null;
    const signatureBase64 = formData.get("signature") as string | null;

    if (!artworkFile || !signatureBase64) {
      return new Response(
        JSON.stringify({ error: "artwork file and signature are required", code: "BAD_REQUEST" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file size (10MB max)
    if (artworkFile.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Image too large. Max 10MB.", code: "FILE_TOO_LARGE" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(artworkFile.type)) {
      return new Response(
        JSON.stringify({ error: "Only JPEG, PNG, WEBP supported.", code: "INVALID_TYPE" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 3. Decode artwork image ────────────────────────────────────────────────
    const artworkBytes = new Uint8Array(await artworkFile.arrayBuffer());
    const artworkImage = await Image.decode(artworkBytes);

    // ── 4. Decode signature from base64 PNG ────────────────────────────────────
    // Remove data:image/png;base64, prefix if present
    const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, "");
    const sigBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const sigImage = await Image.decode(sigBytes);

    // ── 5. LSB Steganography ───────────────────────────────────────────────────
    // Convert signature to bit array (brightness threshold: 128)
    const sigBits: number[] = [];
    for (let y = 0; y < sigImage.height; y++) {
      for (let x = 0; x < sigImage.width; x++) {
        const pixel = sigImage.getPixelAt(x + 1, y + 1); // 1-indexed
        // Extract R, G, B from RGBA pixel value
        const r = (pixel >> 24) & 0xff;
        const g = (pixel >> 16) & 0xff;
        const b = (pixel >> 8) & 0xff;
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        sigBits.push(brightness > 128 ? 1 : 0);
      }
    }

    // Embed bits into LSB of Blue channel of artwork pixels
    const totalArtworkPixels = artworkImage.width * artworkImage.height;
    const bitsToEmbed = Math.min(sigBits.length, totalArtworkPixels);

    for (let i = 0; i < bitsToEmbed; i++) {
      const x = (i % artworkImage.width) + 1; // 1-indexed
      const y = Math.floor(i / artworkImage.width) + 1;
      const pixel = artworkImage.getPixelAt(x, y);
      const r = (pixel >> 24) & 0xff;
      const g = (pixel >> 16) & 0xff;
      let b = (pixel >> 8) & 0xff;
      const a = pixel & 0xff;
      // Set LSB of blue channel
      b = (b & 0xfe) | sigBits[i];
      artworkImage.setPixelAt(x, y, Image.rgbaToColor(r, g, b, a));
    }

    // ── 6. Compute SHA-256 hash of signature bits ─────────────────────────────
    const sigBitArray = new Uint8Array(sigBits);
    const hashBuffer = await crypto.subtle.digest("SHA-256", sigBitArray);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // ── 7. Re-encode signed image ─────────────────────────────────────────────
    const signedImageBytes = await artworkImage.encode(0); // 0 = JPEG compression quality default

    // ── 8. Upload to Supabase Storage ─────────────────────────────────────────
    const fileUuid = crypto.randomUUID();
    const originalPath = `${user.id}/originals/${fileUuid}.jpg`;
    const signedPath = `${user.id}/signed/${fileUuid}.jpg`;

    // Upload original
    const { error: origUploadError } = await supabase.storage
      .from("images")
      .upload(originalPath, artworkBytes, { contentType: "image/jpeg", upsert: false });

    if (origUploadError) {
      // Retry once
      const { error: retryError } = await supabase.storage
        .from("images")
        .upload(originalPath, artworkBytes, { contentType: "image/jpeg", upsert: true });
      if (retryError) throw new Error("Upload failed: " + retryError.message);
    }

    // Upload signed image
    const { error: signedUploadError } = await supabase.storage
      .from("images")
      .upload(signedPath, signedImageBytes, { contentType: "image/jpeg", upsert: false });

    if (signedUploadError) {
      const { error: retryError } = await supabase.storage
        .from("images")
        .upload(signedPath, signedImageBytes, { contentType: "image/jpeg", upsert: true });
      if (retryError) throw new Error("Upload failed: " + retryError.message);
    }

    // ── 9. Insert record into signed_images ────────────────────────────────────
    const imageId = crypto.randomUUID();
    const { error: insertError } = await supabase
      .from("signed_images")
      .insert({
        id: imageId,
        user_id: user.id,
        original_path: originalPath,
        signed_path: signedPath,
        signature_hash: hashHex,
      });

    if (insertError) throw insertError;

    // ── 10. Generate signed URL ────────────────────────────────────────────────
    const { data: urlData } = await supabase.storage
      .from("images")
      .createSignedUrl(signedPath, 3600);

    return new Response(
      JSON.stringify({
        signed_url: urlData?.signedUrl || "",
        image_id: imageId,
        signature_hash: hashHex,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("sign-image error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
