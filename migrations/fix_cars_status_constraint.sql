-- Ultra-Safe Force Repair Migration for Car Status
-- This version handles "constraint already exists" errors by searching for ALL existing status constraints.

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- 1. Drop ALL potentially conflicting constraints (Case Insensitive search)
    -- This handles cases where the constraint might have a slightly different name or capitalization
    FOR r IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.cars'::regclass 
          AND conname ILIKE '%status_check%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.cars DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        RAISE NOTICE 'Dropped constraint: %', r.conname;
    END LOOP;

    -- 2. Super-Nuclear Force Normalization
    -- Step a: Handle NULLs, empties, and obvious partial matches
    UPDATE public.cars 
    SET status = 'Readily Available' 
    WHERE status IS NULL 
       OR status = '' 
       OR TRIM(status) = ''
       OR status ILIKE 'readily available%' 
       OR status ILIKE 'ready%' 
       OR status ILIKE 'avail%';

    -- Step b: Force the exact string for 'Preorder'
    UPDATE public.cars 
    SET status = 'Preorder' 
    WHERE status ILIKE 'preorder%' 
       OR status ILIKE 'pre-order%' 
       OR status ILIKE 'pre order%';

    -- Step c: Final catch-all to ensure the 'ADD CONSTRAINT' below CANNOT fail
    -- Any leftover values are forced to 'Readily Available'
    UPDATE public.cars 
    SET status = 'Readily Available' 
    WHERE status NOT IN ('Readily Available', 'Preorder');

    -- 3. Re-apply the standardized constraint
    ALTER TABLE public.cars ADD CONSTRAINT cars_status_check 
    CHECK (status IN ('Readily Available', 'Preorder'));

END $$;
