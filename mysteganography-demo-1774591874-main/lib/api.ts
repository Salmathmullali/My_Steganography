import { supabase } from './supabase';
import { SignResult, ScanResult, SignedImage, ScanHistory } from '../types';

// ─── Sign Image ───────────────────────────────────────────────────────────────

export async function signImage(
  artworkUri: string,
  signatureBase64: string
): Promise<SignResult> {
  try {
    // Build FormData
    const formData = new FormData();

    // Fetch the file and append it
    const artworkResponse = await fetch(artworkUri);
    const artworkBlob = await artworkResponse.blob();
    formData.append('artwork', artworkBlob, 'artwork.jpg');
    formData.append('signature', signatureBase64);

    const { data, error } = await supabase.functions.invoke('sign-image', {
      body: formData,
    });

    if (error) throw error;
    return data as SignResult;
  } catch (err: any) {
    return {
      signed_url: '',
      image_id: '',
      signature_hash: '',
      error: err.message || 'Failed to sign image',
      code: 'SIGN_ERROR',
    };
  }
}

// ─── Scan Image ───────────────────────────────────────────────────────────────

export async function scanImage(imageUri: string): Promise<ScanResult> {
  try {
    const formData = new FormData();

    const imageResponse = await fetch(imageUri);
    const imageBlob = await imageResponse.blob();
    formData.append('image', imageBlob, 'scan.jpg');

    const { data, error } = await supabase.functions.invoke('scan-image', {
      body: formData,
    });

    if (error) throw error;
    return data as ScanResult;
  } catch (err: any) {
    return {
      scan_id: '',
      trust_score: 50,
      label: 'Uncertain',
      likely_source: 'Scan failed',
      our_signature: { found: false, matched_artist: null },
      c2pa: { found: false },
      ai_software_tag: null,
      ai_analysis: null,
      needs_openai_key: false,
      error: err.message || 'Failed to scan image',
      code: 'SCAN_ERROR',
    };
  }
}

// ─── Save OpenAI Key ──────────────────────────────────────────────────────────

export async function saveOpenAIKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.functions.invoke('save-openai-key', {
      body: JSON.stringify({ api_key: apiKey }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save key' };
  }
}

// ─── Portfolio ────────────────────────────────────────────────────────────────

export async function getPortfolio(): Promise<SignedImage[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('signed_images')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Portfolio fetch error:', error);
      return [];
    }
    return data as SignedImage[];
  } catch (err) {
    console.error('Portfolio fetch error (no auth?):', err);
    return [];
  }
}

// ─── Scan History ─────────────────────────────────────────────────────────────

export async function getScanHistory(): Promise<ScanHistory[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('scan_history')
      .select('*')
      .eq('scanned_by', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Scan history fetch error:', error);
      return [];
    }
    return data as ScanHistory[];
  } catch (err) {
    console.error('Scan history fetch error (no auth?):', err);
    return [];
  }
}

// ─── Update Display Name ──────────────────────────────────────────────────────

export async function updateDisplayName(name: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const { error } = await supabase
      .from('user_profiles')
      .upsert({ id: user.id, display_name: name });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Not authenticated' };
  }
}

// ─── Get Signed Image URL ─────────────────────────────────────────────────────

export async function getSignedImageUrl(path: string): Promise<string> {
  const { data } = await supabase.storage
    .from('images')
    .createSignedUrl(path, 3600);

  return data?.signedUrl || '';
}
