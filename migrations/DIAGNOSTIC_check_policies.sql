-- DIAGNOSTIC: Check current RLS policies on profiles table
-- Run this to see what policies are actually configured

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;
