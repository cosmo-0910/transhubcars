-- Migration: Fix cars table RLS so vendors can see their own listings
-- Date: 2026-03-28
-- Issue: No RLS SELECT policy existed on the cars table, causing vendors 
--        (and all authenticated users) to potentially have no access depending 
--        on the default security setting.

-- 1. Enable RLS on the cars table (safe if already enabled)
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing policies to avoid duplicates
DROP POLICY IF EXISTS "Public can view approved cars" ON cars;
DROP POLICY IF EXISTS "Vendors can view their own cars" ON cars;
DROP POLICY IF EXISTS "Vendors can insert their own cars" ON cars;
DROP POLICY IF EXISTS "Vendors can update their own cars" ON cars;
DROP POLICY IF EXISTS "Vendors can delete their own cars" ON cars;
DROP POLICY IF EXISTS "Admins can manage all cars" ON cars;

-- 3. Anyone (including anonymous) can view approved cars (public facing website)
CREATE POLICY "Public can view approved cars" ON cars
FOR SELECT USING (approval_status = 'approved');

-- 4. Vendors can view ALL their own cars (approved, pending, rejected)
CREATE POLICY "Vendors can view their own cars" ON cars
FOR SELECT USING (vendor_id = auth.uid());

-- 5. Vendors can insert cars (their vendor_id must match auth.uid())
CREATE POLICY "Vendors can insert their own cars" ON cars
FOR INSERT WITH CHECK (vendor_id = auth.uid());

-- 6. Vendors can update their own cars
CREATE POLICY "Vendors can update their own cars" ON cars
FOR UPDATE USING (vendor_id = auth.uid())
WITH CHECK (vendor_id = auth.uid());

-- 7. Vendors can delete their own cars
CREATE POLICY "Vendors can delete their own cars" ON cars
FOR DELETE USING (vendor_id = auth.uid());

-- 8. Admins can do anything on the cars table
CREATE POLICY "Admins can manage all cars" ON cars
FOR ALL USING (is_admin())
WITH CHECK (is_admin());

-- 9. Verify
SELECT policyname, cmd, permissive, qual
FROM pg_policies
WHERE tablename = 'cars'
ORDER BY cmd, policyname;
