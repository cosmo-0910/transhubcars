-- Safely add body_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cars' AND column_name = 'body_type') THEN
        ALTER TABLE cars ADD COLUMN body_type TEXT;
    END IF;
END $$;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_cars_body_type ON cars(body_type);

-- Drop the old constraint if it exists so we can apply the new one
ALTER TABLE cars DROP CONSTRAINT IF EXISTS check_body_type;

-- Add the updated constraint with prioritized list (Saloon, Sports, etc.)
ALTER TABLE cars ADD CONSTRAINT check_body_type CHECK (
  body_type IN (
    'SUV', 'Saloon', 'Coupe', 'Convertible', 'Sports', 'Pickup', 'Crossover', 
    'Hatchback', 'Van', 'Wagon', 'Limousine', 'Other'
  )
);
