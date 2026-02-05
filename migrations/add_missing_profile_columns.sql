-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preorder_status TEXT CHECK (preorder_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'suspended', 'banned', 'disabled')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS store_video_url TEXT,
ADD COLUMN IF NOT EXISTS store_image_url TEXT;

-- Update existing profiles to have default values if null
UPDATE profiles SET preorder_status = 'none' WHERE preorder_status IS NULL;
UPDATE profiles SET status = 'active' WHERE status IS NULL;
