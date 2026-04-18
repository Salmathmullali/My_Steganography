// supabase/functions/scan-image/index.ts
// Two-stage AI image authenticity scanner

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// @deno-types="https://deno.land/x/imagescript@1.2.15/mod.d.ts"
import { Image } from "https://deno.land/x/imagescript@1.2.15/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AI_SOFTWARE_TAGS = [
  "DALL-E", "Midjourney", "Stable Diffusion", "Adobe Firefly",
  "Bing Image Creator", "Canva AI", "Runway", "Pika", "Leonardo AI",
  "Imagen", "Firefly", "DreamStudio", "NightCafe", "Craiyon",
];

// ── Helper: decode AES-GCM encrypted key ─────────────────────────────────────
async function decryptOpenAIKey(encryptedString: string): Promise<string> {
  const [ivB64, cipherB64] = encryptedString.split(":");
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));
  const ciphertext = Uint8Array.from(atob(cipherB64), (c) => c.charCodeAt(0));

  const encKeyStr = Deno.env.get("OPENAI_ENCRYPTION_KEY");
  if (!encKeyStr) throw new Error("OPENAI_ENCRYPTION_KEY not set");

  const keyBytes = new TextEncoder().encode(encKeyStr.padEnd(32).slice(0, 32));
  const cryptoKey = await crypto.subtle.importKey(
    "raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertext);
  return new TextDecoder().decode(decrypted);
}

// ── Helper: extract text from raw bytes ──────────────────────────────────────
function extractTextFromBytes(bytes: Uint8Array): string {
  // Convert bytes to string, only keep printable ASCII
  let result = "";
  for (let i = 0; i < Math.min(bytes.length, 500000); i++) {
    if (bytes[i] >= 32 && bytes[i] < 127) {
      result += String.fromCharCode(bytes[i]);
    } else {
      result += " ";
    }
  }
  return result;
}

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

    // ── 2. Parse multipart form ─────────────────────────────────────────────────
    const formData = await req.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: "image file is required", code: "BAD_REQUEST" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "Image too large. Max 10MB.", code: "FILE_TOO_LARGE" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(imageFile.type)) {
      return new Response(
        JSON.stringify({ error: "Only JPEG, PNG, WEBP supported.", code: "INVALID_TYPE" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const imageBytes = new Uint8Array(await imageFile.arrayBuffer());

    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 1: Metadata + Signature Check
    // ═══════════════════════════════════════════════════════════════════════

    // ── 3. EXIF/XMP metadata scan ─────────────────────────────────────────────
    const rawText = extractTextFromBytes(imageBytes);
    let aiSoftwareTag: string | null = null;

    for (const tag of AI_SOFTWARE_TAGS) {
      if (rawText.toLowerCase().includes(tag.toLowerCase())) {
        aiSoftwareTag = tag;
        break;
      }
    }

    // ── 4. C2PA detection ─────────────────────────────────────────────────────
    let c2paFound = false;
    const xpacketIdx = rawText.indexOf("<?xpacket");
    if (xpacketIdx !== -1) {
      const xmpBlock = rawText.slice(xpacketIdx, xpacketIdx + 5000);
      if (xmpBlock.includes("c2pa") || xmpBlock.includes("cai:") || xmpBlock.includes("Cr3")) {
        c2paFound = true;
      }
    }
    // Also check for C2PA manifest JUMBF box marker
    if (rawText.includes("c2pa") || rawText.includes("content credentials")) {
      c2paFound = true;
    }

    // ── 5. LSB Signature Extraction ───────────────────────────────────────────
    let ourSignatureFound = false;
    let matchedArtist: string | null = null;
    let matchedImageId: string | null = null;

    try {
      const img = await Image.decode(imageBytes);
      const extractedBits: number[] = [];

      // Extract first 64x64 = 4096 bits (enough for a small signature)
      const sampleCount = Math.min(4096, img.width * img.height);
      for (let i = 0; i < sampleCount; i++) {
        const x = (i % img.width) + 1;
        const y = Math.floor(i / img.width) + 1;
        const pixel = img.getPixelAt(x, y);
        const b = (pixel >> 8) & 0xff;
        extractedBits.push(b & 1); // LSB of blue
      }

      // Hash the extracted bits
      const bitArray = new Uint8Array(extractedBits);
      const hashBuffer = await crypto.subtle.digest("SHA-256", bitArray);
      const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Query signed_images for matching hash
      const { data: matchData } = await supabase
        .from("signed_images")
        .select("id, user_id")
        .eq("signature_hash", hashHex)
        .single();

      if (matchData) {
        ourSignatureFound = true;
        matchedImageId = matchData.id;

        // Get artist name
        const { data: profileData } = await supabase
          .from("user_profiles")
          .select("display_name")
          .eq("id", matchData.user_id)
          .single();

        matchedArtist = profileData?.display_name || "Unknown Artist";
      }
    } catch (lsbErr) {
      console.warn("LSB extraction error:", lsbErr);
    }

    const stage1Result = {
      ai_software_tag: aiSoftwareTag,
      c2pa_found: c2paFound,
      our_signature_found: ourSignatureFound,
      matched_artist: matchedArtist,
      matched_image_id: matchedImageId,
    };

    // ═══════════════════════════════════════════════════════════════════════
    // STAGE 2: OpenAI Vision Deep Scan
    // ═══════════════════════════════════════════════════════════════════════

    let aiAnalysis: any = null;
    let needsOpenAIKey = false;
    let openaiError = false;

    // ── 6. Get user's or system's OpenAI key ──────────────────────────────────
    let openaiKeyToUse = "";
    const systemOpenAIKey = Deno.env.get("OPENAI_API_KEY");

    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("openai_key_encrypted")
      .eq("id", user.id)
      .single();

    if (profileData?.openai_key_encrypted) {
      try {
        openaiKeyToUse = await decryptOpenAIKey(profileData.openai_key_encrypted);
      } catch (err) {
        console.warn("Failed to decrypt user key", err);
      }
    }

    if (!openaiKeyToUse && systemOpenAIKey) {
      openaiKeyToUse = systemOpenAIKey;
    }

    if (!openaiKeyToUse) {
      needsOpenAIKey = true;
    } else {
      try {
        // ── 8. Convert image to base64 ────────────────────────────────────────
        const base64Image = btoa(String.fromCharCode(...imageBytes));
        const mimeType = imageFile.type || "image/jpeg";

        // ── 9. Call OpenAI Vision API ─────────────────────────────────────────
        const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openaiKeyToUse}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            max_tokens: 500,
            messages: [
              {
                role: "system",
                content: `You are a forensic image analyst detecting AI-generated images. Analyze the image for: unnatural skin or texture smoothness, inconsistent lighting or impossible shadows, artifacts around hair/fingers/teeth/edges, unnaturally tiling patterns, garbled text, mismatched eye reflections, extreme facial asymmetry, background objects that morph or repeat, and overall aesthetic that feels algorithmically generated rather than photographed or hand-drawn. Return ONLY valid JSON, no markdown, no explanation, exactly this format: {"confidence_human": <integer 0-100>, "confidence_ai": <integer 0-100>, "likely_source": "<Human | DALL-E | Midjourney | Stable Diffusion | Adobe Firefly | GAN | Unknown AI>", "key_findings": ["<finding>", "<finding>", "<finding>"], "verdict": "<one sentence>"}`,
              },
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: { url: `data:${mimeType};base64,${base64Image}` },
                  },
                ],
              },
            ],
          }),
        });

        if (!openaiResponse.ok) {
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const openaiData = await openaiResponse.json();
        const rawContent = openaiData.choices?.[0]?.message?.content || "";

        // ── 10. Parse JSON response ───────────────────────────────────────────
        try {
          // Strip any markdown code fences if present
          const jsonStr = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          aiAnalysis = JSON.parse(jsonStr);
        } catch {
          console.warn("OpenAI returned non-JSON:", rawContent);
          openaiError = true;
        }
      } catch (openaiErr: any) {
        console.warn("OpenAI call failed:", openaiErr);
        openaiError = true;
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TRUST SCORE AGGREGATION
    // ═══════════════════════════════════════════════════════════════════════

    let trustScore: number;
    let label: string;
    let likelySource: string;

    if (ourSignatureFound) {
      trustScore = 100;
      label = "Human-Made Art";
      likelySource = `Verified by MySteganography — artist: ${matchedArtist}`;
    } else if (aiSoftwareTag) {
      trustScore = 0;
      label = "AI Generated";
      likelySource = aiSoftwareTag;
    } else if (c2paFound) {
      trustScore = 5;
      label = "AI Generated";
      likelySource = "C2PA credential detected";
    } else if (aiAnalysis) {
      trustScore = aiAnalysis.confidence_human || 50;
      label = trustScore >= 70 ? "Human-Made Art" : trustScore >= 40 ? "Uncertain" : "AI Generated";
      likelySource = aiAnalysis.likely_source || "Unknown";
    } else {
      trustScore = 50;
      label = "Uncertain";
      likelySource = "Could not determine (no OpenAI key)";
    }

    // ── 11. Insert scan history ───────────────────────────────────────────────
    const scanId = crypto.randomUUID();
    await supabase.from("scan_history").insert({
      id: scanId,
      scanned_by: user.id,
      image_url: "",
      trust_score: trustScore,
      label,
      likely_source: likelySource,
      our_signature_found: ourSignatureFound,
      matched_artist: matchedArtist,
      raw_results: { stage1: stage1Result, ai_analysis: aiAnalysis },
    });

    // ── 12. Return full result ────────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        scan_id: scanId,
        trust_score: trustScore,
        label,
        likely_source: likelySource,
        our_signature: { found: ourSignatureFound, matched_artist: matchedArtist },
        c2pa: { found: c2paFound },
        ai_software_tag: aiSoftwareTag,
        ai_analysis: aiAnalysis,
        needs_openai_key: needsOpenAIKey,
        openai_error: openaiError,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("scan-image error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
