-- Migration: Add columns for advanced filtering
-- 1. Add state column for location filtering
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS state TEXT;

-- 2. Add original_price for discount calculation
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS original_price NUMERIC;

-- 3. Add condition column for categorization
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS condition TEXT CHECK (condition IN ('Foreign Used', 'Nigerian Used', 'New'));

-- 4. Create index for faster filtering
CREATE INDEX IF NOT EXISTS idx_cars_state ON cars(state);
CREATE INDEX IF NOT EXISTS idx_cars_condition ON cars(condition);
CREATE INDEX IF NOT EXISTS idx_cars_original_price ON cars(original_price);
