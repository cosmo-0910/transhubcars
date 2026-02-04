-- FINAL SOLUTION: Complete vendor setup with working admin permissions
-- Copy and paste this ENTIRE script into your Supabase SQL Editor and click RUN

-- 1. Add missing columns (safe to run multiple times)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT 'none';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_details JSONB;

-- 2. Add constraint for vendor_status if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'profiles_vendor_status_check'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT profiles_vendor_status_check 
        CHECK (vendor_status IN ('none', 'pending', 'approved', 'rejected'));
    END IF;
END $$;

-- 3. Update role constraint to include 'vendor'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('customer', 'admin', 'vendor'));

-- 4. Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Public Read Profiles" ON profiles;
DROP POLICY IF EXISTS "Users Insert Own Profile" ON profiles;
DROP POLICY IF EXISTS "Users Update Own Profile" ON profiles;
DROP POLICY IF EXISTS "Admin Update Profiles" ON profiles;

-- 5. Recreate policies in correct order
CREATE POLICY "Public Read Profiles" ON profiles 
FOR SELECT USING (true);

CREATE POLICY "Users Insert Own Profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users Update Own Profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin Update Profiles" ON profiles 
FOR UPDATE USING (auth.email() = 'admin@transhub.com');

-- 6. Verify policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';
