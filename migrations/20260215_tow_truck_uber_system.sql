-- Uber-like Tow Truck System Enhancements

-- 1. Profile Enhancements for Drivers
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_lat DECIMAL,
ADD COLUMN IF NOT EXISTS last_long DECIMAL;

-- 2. Update vendor_type constraint to include 'tow_truck'
-- We need to drop the old constraint and add a new one
DO $$
BEGIN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_vendor_type_check;
    ALTER TABLE profiles ADD CONSTRAINT profiles_vendor_type_check 
    CHECK (vendor_type IN ('car', 'parts', 'both', 'tow_truck'));
END $$;

-- 3. Enhance tow_requests for real-time tracking
ALTER TABLE tow_requests
ADD COLUMN IF NOT EXISTS pickup_lat DECIMAL,
ADD COLUMN IF NOT EXISTS pickup_long DECIMAL,
ADD COLUMN IF NOT EXISTS destination_lat DECIMAL,
ADD COLUMN IF NOT EXISTS destination_long DECIMAL,
ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS price DECIMAL,
ADD COLUMN IF NOT EXISTS estimated_arrival_time TIMESTAMP WITH TIME ZONE;

-- 4. Create function to find nearest online driver
-- Using simple distance formula for now, can be optimized with PostGIS if available
CREATE OR REPLACE FUNCTION find_nearest_tow_driver(
  p_lat DECIMAL,
  p_long DECIMAL,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  distance DOUBLE PRECISION,
  last_lat DECIMAL,
  last_long DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    (3959 * acos(cos(radians(p_lat)) * cos(radians(p.last_lat)) * cos(radians(p.last_long) - radians(p_long)) + sin(radians(p_lat)) * sin(radians(p.last_lat)))) AS distance,
    p.last_lat,
    p.last_long
  FROM profiles p
  WHERE p.role = 'vendor' 
    AND p.vendor_type = 'tow_truck' 
    AND p.is_online = true
  ORDER BY distance
  LIMIT p_limit;
END;
$$;

-- 5. Enable Realtime for relevant tables
BEGIN;
  -- Add tables to the realtime publication
  -- Check if publication exists first (Supabase default is 'supabase_realtime')
  DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE tow_requests;
      ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
    END IF;
  END $$;
COMMIT;
