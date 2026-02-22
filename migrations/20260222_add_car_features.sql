-- Add features/options array to cars table
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}';

-- Update SUPABASE_SCHEMA.sql reference comment
COMMENT ON COLUMN cars.features IS 'Array of feature tags/options for the vehicle (e.g., Air Conditioning, Alloy Wheels, etc.)';
