-- Comprehensive migration to fix missing columns in profiles table
-- 1. Add vendor_status if missing (with default 'none')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vendor_status TEXT CHECK (vendor_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none';

-- 2. Add business_name if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name TEXT;

-- 3. Add business_details if missing (JSON structure)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_details JSONB;
