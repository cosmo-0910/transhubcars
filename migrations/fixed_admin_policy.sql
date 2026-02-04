-- FIXED: Admin Update Policy without circular dependency
-- The previous policy had a circular dependency issue where it tried to query
-- the profiles table (which is protected by RLS) to check if user is admin.
-- This version uses a security definer function to bypass RLS for the admin check.

-- Step 1: Create a function to check if current user is admin (runs with elevated privileges)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Step 2: Add missing columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vendor_status TEXT CHECK (vendor_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_details JSONB;

-- Step 3: Update role constraint to include 'vendor'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin', 'vendor'));

-- Step 4: Allow users to insert their own profile (required for UPSERT)
DROP POLICY IF EXISTS "Users Insert Own Profile" ON profiles;
CREATE POLICY "Users Insert Own Profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 5: Allow admins to update any profile (FIXED - uses security definer function)
DROP POLICY IF EXISTS "Admin Update Profiles" ON profiles;
CREATE POLICY "Admin Update Profiles" ON profiles FOR UPDATE USING (is_admin());
