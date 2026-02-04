-- NUCLEAR OPTION: Disable RLS temporarily to test if that's the issue
-- WARNING: This removes ALL security temporarily - only for testing!

-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- After running this, try approving the vendor
-- If it works, we know the issue is with the RLS policies
-- Then we can re-enable RLS and fix the policies properly
