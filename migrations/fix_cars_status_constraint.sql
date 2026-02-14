-- Migration: Fix cars_status_check constraint
-- This script drops the existing constraint and recreates it to ensure 'Readily Available' is allowed.

DO $$ 
BEGIN
    -- 1. Drop the existing constraint if it exists
    -- PostgreSQL usually names inline constraints as table_column_check
    ALTER TABLE cars DROP 
    CONSTRAINT IF EXISTS cars_status_check;

    -- 2. Super-Nuclear Normalization
    -- a. Trim whitespace and replace multiple spaces/tabs with single space
    UPDATE public.cars SET status = TRIM(REGEXP_REPLACE(status, '\s+', ' ', 'g'));
    
    -- b. Fix variations using ILIKE
    UPDATE public.cars 
    SET status = 'Readily Available' 
    WHERE status ILIKE 'readily available' 
       OR status ILIKE 'ready%' 
       OR status ILIKE 'avail%'
       OR status ILIKE 'in stock%';

    UPDATE public.cars 
    SET status = 'Preorder' 
    WHERE status ILIKE 'preorder' 
       OR status ILIKE 'pre-order'
       OR status ILIKE 'pre order';

    -- c. Safety default for anything else (including NULLs)
    UPDATE public.cars 
    SET status = 'Readily Available' 
    WHERE status NOT IN ('Readily Available', 'Preorder')
       OR status IS NULL
       OR status = '';

    -- 3. Add the correct constraint
    ALTER TABLE public.cars ADD CONSTRAINT cars_status_check 
    CHECK (status IN ('Readily Available', 'Preorder'));

END $$;
