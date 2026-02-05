-- Add preorder columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS preorder_status TEXT CHECK (preorder_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS store_video_url TEXT,
ADD COLUMN IF NOT EXISTS store_image_url TEXT;

-- Update existing profiles to have 'none' status if null
UPDATE profiles SET preorder_status = 'none' WHERE preorder_status IS NULL;

-- Policy notes:
-- Existing "Public Profiles are viewable by everyone" covers reading these fields.
-- Existing "Users can update own profile" covers submitting the application (video/image/status='pending').
-- Existing "Admins can update everything" covers approving/rejecting.
