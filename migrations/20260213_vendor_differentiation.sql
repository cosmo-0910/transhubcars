-- Migration: Add vendor type differentiation
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS vendor_type TEXT CHECK (vendor_type IN ('car', 'parts', 'both')) DEFAULT 'car';

-- Update the handle_new_user function to extract vendor_type from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, vendor_status, vendor_type)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    CASE 
      WHEN new.email = 'admin@transhub.com' THEN 'admin'
      ELSE 'customer'
    END,
    'none',
    COALESCE(new.raw_user_meta_data->>'vendor_type', 'car')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
