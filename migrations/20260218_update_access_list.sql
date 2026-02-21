-- 1. Update the handle_new_user function to ensure admin@transhub.com always gets full permissions
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
    CASE 
      WHEN new.email = 'admin@transhub.com' THEN '["inventory", "vendors", "users", "orders", "sales", "ledger", "audit", "settings", "admins", "inquiries", "preorders", "parts-requests"]'::jsonb
      ELSE COALESCE(new.raw_user_meta_data->'permissions', '[]'::jsonb)
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update existing admin@transhub.com profile if it exists
UPDATE profiles 
SET 
  role = 'admin',
  permissions = '["inventory", "vendors", "users", "orders", "sales", "ledger", "audit", "settings", "admins", "inquiries", "preorders", "parts-requests"]'::jsonb
WHERE 
  id IN (SELECT id FROM auth.users WHERE email = 'admin@transhub.com');

-- 3. Ensure 'admin@transhub.com' can bypass RLS on profiles (redundant but safe)
-- The existing policy "Admin Update Profiles" checks for is_admin() or specific email, 
-- but let's make sure we have a specific policy for the root admin if needed.
-- (The existing policies in simple_admin_policy.sql seem to handle this via auth.email() check)
