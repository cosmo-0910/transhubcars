-- 1. Add permissions column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]';

-- 2. Update existing admins to have full permissions by default
UPDATE profiles 
SET permissions = '["inventory", "vendors", "users", "orders", "sales", "ledger", "audit", "settings", "admins"]'::jsonb
WHERE role = 'admin' AND (permissions IS NULL OR permissions::text = '[]');

-- 3. Update the handle_new_user function to respect permissions from metadata if present
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, vendor_status, permissions)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'System User'),
    CASE 
      WHEN new.email = 'admin@transhub.com' THEN 'admin'
      WHEN new.raw_user_meta_data->>'is_admin' = 'true' THEN 'admin'
      ELSE 'customer'
    END,
    'none',
    COALESCE(new.raw_user_meta_data->'permissions', '[]'::jsonb)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
