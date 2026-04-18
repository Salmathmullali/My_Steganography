-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- MySteganography - Supabase SQL Schema
-- Run this entire script in Supabase SQL Editor
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- User profiles (extends auth.users)
create table if not exists public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  openai_key_encrypted text,
  created_at timestamptz default now()
);

-- Signed images
create table if not exists public.signed_images (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  original_path text,
  signed_path text,
  signature_hash text,
  created_at timestamptz default now()
);

-- Scan history
create table if not exists public.scan_history (
  id uuid default gen_random_uuid() primary key,
  scanned_by uuid references auth.users(id) on delete set null,
  image_url text,
  trust_score integer,
  label text,
  likely_source text,
  our_signature_found boolean default false,
  matched_artist text,
  raw_results jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.user_profiles enable row level security;
alter table public.signed_images enable row level security;
alter table public.scan_history enable row level security;

-- RLS Policies
create policy "Own profile only" on public.user_profiles
  for all using (auth.uid() = id);

create policy "Own images only" on public.signed_images
  for all using (auth.uid() = user_id);

create policy "Own scans only" on public.scan_history
  for all using (auth.uid() = scanned_by);

-- Public read for verify page (anyone can verify a signed image by id)
create policy "Public verify read" on public.signed_images
  for select using (true);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- STORAGE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- Create "images" bucket in Supabase Storage Dashboard (private bucket)
-- File path convention:
--   {user_id}/originals/{uuid}.jpg
--   {user_id}/signed/{uuid}.jpg
--   {user_id}/signatures/{uuid}.png
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- EDGE FUNCTION SECRETS (set in Supabase Dashboard → Edge Functions → Secrets)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- SUPABASE_URL=https://bldvsglqzptpnasinmyi.supabase.co
-- SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
-- OPENAI_ENCRYPTION_KEY=any_32_char_string_you_choose_here!!
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
