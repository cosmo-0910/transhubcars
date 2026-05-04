-- 20260504_profile_enhancements.sql

-- 1. Add phone and state to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS state TEXT;

-- 2. Ensure avatar_url exists (just in case)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 3. Ensure is_pinned and pinned_at exist in cars table
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP WITH TIME ZONE;

-- 4. Update existing profiles with default role if missing (safety check)
UPDATE profiles SET role = 'customer' WHERE role IS NULL;
