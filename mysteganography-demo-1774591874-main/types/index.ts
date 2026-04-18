// TypeScript interfaces for MySteganography

export interface UserProfile {
  id: string;
  display_name: string | null;
  openai_key_encrypted: string | null;
  created_at: string;
}

export interface SignedImage {
  id: string;
  user_id: string;
  original_path: string;
  signed_path: string;
  signature_hash: string;
  created_at: string;
}

export interface ScanHistory {
  id: string;
  scanned_by: string;
  image_url: string;
  trust_score: number;
  label: string;
  likely_source: string;
  our_signature_found: boolean;
  matched_artist: string | null;
  raw_results: any;
  created_at: string;
}

export interface SignResult {
  signed_url: string;
  image_id: string;
  signature_hash: string;
  error?: string;
  code?: string;
}

export interface AIAnalysis {
  confidence_human: number;
  confidence_ai: number;
  likely_source: string;
  key_findings: string[];
  verdict: string;
}

export interface ScanResult {
  scan_id: string;
  trust_score: number;
  label: 'Human-Made Art' | 'AI Generated' | 'Uncertain';
  likely_source: string;
  our_signature: {
    found: boolean;
    matched_artist: string | null;
  };
  c2pa: {
    found: boolean;
  };
  ai_software_tag: string | null;
  ai_analysis: AIAnalysis | null;
  needs_openai_key: boolean;
  openai_error?: boolean;
  error?: string;
  code?: string;
}

export interface AuthUser {
  id: string;
  email: string;
}
