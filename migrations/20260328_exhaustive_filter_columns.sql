-- migration/20260328_exhaustive_filter_columns.sql

-- Add technical and status columns to the cars table
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS powertrain TEXT DEFAULT '2WD',
ADD COLUMN IF NOT EXISTS registered_car BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS exchange_possible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS second_condition TEXT;

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_cars_powertrain ON cars(powertrain);
CREATE INDEX IF NOT EXISTS idx_cars_registered ON cars(registered_car);
