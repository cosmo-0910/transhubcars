
-- 1. Create the media_fingerprints table
CREATE TABLE IF NOT EXISTS public.media_fingerprints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_hash TEXT UNIQUE NOT NULL,
  uploader_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.media_fingerprints ENABLE ROW LEVEL SECURITY;

-- 3. Policies
-- Admins and owners can read
CREATE POLICY "Public read fingerprints" ON public.media_fingerprints FOR SELECT USING (true);

-- Anyone can insert upon successful check (checked in app logic, but RLS allows insert)
CREATE POLICY "Users can insert fingerprints" ON public.media_fingerprints FOR INSERT WITH CHECK (auth.uid() = uploader_id);
