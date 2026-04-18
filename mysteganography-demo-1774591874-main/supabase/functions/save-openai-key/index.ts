// supabase/functions/save-openai-key/index.ts
// Encrypts and stores the user's OpenAI API key in user_profiles

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // ── 2. Parse body ─────────────────────────────────────────────────────────
    const { api_key } = await req.json();
    if (!api_key || typeof api_key !== "string") {
      return new Response(
        JSON.stringify({ error: "api_key is required", code: "BAD_REQUEST" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 3. Encrypt with AES-GCM ───────────────────────────────────────────────
    const encryptionKeyStr = Deno.env.get("OPENAI_ENCRYPTION_KEY");
    if (!encryptionKeyStr) throw new Error("OPENAI_ENCRYPTION_KEY not set");

    // Derive a 32-byte key from the env var string
    const keyBytes = new TextEncoder().encode(encryptionKeyStr.padEnd(32).slice(0, 32));
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-GCM" },
      false,
      ["encrypt"]
    );

    // Generate random 12-byte IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedKey = new TextEncoder().encode(api_key);
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      encodedKey
    );

    // Store as base64(iv):base64(ciphertext)
    const ivB64 = btoa(String.fromCharCode(...iv));
    const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
    const encryptedString = `${ivB64}:${cipherB64}`;

    // ── 4. Upsert into user_profiles ─────────────────────────────────────────
    const { error: upsertError } = await supabase
      .from("user_profiles")
      .upsert({ id: user.id, openai_key_encrypted: encryptedString });

    if (upsertError) throw upsertError;

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("save-openai-key error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error", code: "INTERNAL_ERROR" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
