-- FIX SERVICE RELATIONSHIPS
-- Add direct foreign key constraints from service tables to profiles table
-- This allows PostgREST (Supabase) to understand the relationship for joins

-- 1. Fix tow_requests
ALTER TABLE tow_requests
DROP CONSTRAINT IF EXISTS tow_requests_user_id_fkey,
ADD CONSTRAINT tow_requests_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- 2. Fix spare_part_orders
ALTER TABLE spare_part_orders
DROP CONSTRAINT IF EXISTS spare_part_orders_user_id_fkey,
ADD CONSTRAINT spare_part_orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Note: user_id already exists and typically maps to auth.uid(), 
-- but referencing profiles(id) enables easier joins in Supabase.
