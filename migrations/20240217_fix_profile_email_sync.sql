
-- 1. Add email column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Update the handle_new_user function to sync email and full_name correctly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    email,
    role, 
    vendor_status, 
    vendor_type,
    permissions
  )
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'System User'),
    new.email,
    CASE 
      WHEN new.email = 'admin@transhub.com' THEN 'admin'
      WHEN new.raw_user_meta_data->>'is_admin' = 'true' THEN 'admin'
      ELSE 'customer'
    END,
    'none',
    COALESCE(new.raw_user_meta_data->>'vendor_type', 'car'),
    COALESCE(new.raw_user_meta_data->'permissions', '[]'::jsonb)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill emails if possible (Note: This normally needs service role or to be run in Supabase SQL editor)
-- UPDATE profiles p SET email = u.email FROM auth.users u WHERE p.id = u.id AND p.email IS NULL;
