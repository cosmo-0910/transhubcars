-- Add status column to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'suspended', 'banned', 'disabled')) DEFAULT 'active';

-- Update existing profiles to have 'active' status if null
UPDATE profiles SET status = 'active' WHERE status IS NULL;

-- Enable admins to update profile status
-- (This relies on the existing "Admin Update Profiles" policy which uses is_admin())
