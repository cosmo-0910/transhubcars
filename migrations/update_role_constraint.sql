-- Drop the old constraint that only allowed 'customer' and 'admin'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the new constraint including 'vendor'
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin', 'vendor'));
