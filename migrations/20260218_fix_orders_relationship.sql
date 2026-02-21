-- FIX ORDERS RELATIONSHIP
-- Add direct foreign key constraint from orders to profiles table
-- This enables Supabase joins with the profiles table

ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey,
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL;
