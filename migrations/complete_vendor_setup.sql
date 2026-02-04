-- COMPLETE VENDOR APPLICATION SETUP
-- Run this entire script in your Supabase SQL Editor

-- 1. Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vendor_status TEXT CHECK (vendor_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_details JSONB;

-- 2. Update role constraint to include 'vendor'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin', 'vendor'));

-- 3. Allow users to insert their own profile (required for UPSERT)
DROP POLICY IF EXISTS "Users Insert Own Profile" ON profiles;
CREATE POLICY "Users Insert Own Profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Allow admins to update any profile (CRITICAL for approving vendors)
DROP POLICY IF EXISTS "Admin Update Profiles" ON profiles;
CREATE POLICY "Admin Update Profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
