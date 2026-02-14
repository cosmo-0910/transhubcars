-- Migration: Create spare_parts table
-- Description: Table for spare part inventory with vendor management and public browsing.

CREATE TABLE IF NOT EXISTS public.spare_parts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    vehicle_make TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_year INTEGER NOT NULL,
    price DECIMAL NOT NULL,
    image_url TEXT,
    description TEXT,
    condition TEXT CHECK (condition IN ('New', 'Used', 'Refurbished')) DEFAULT 'New',
    stock_quantity INTEGER DEFAULT 1,
    status TEXT CHECK (status IN ('active', 'out_of_stock', 'discontinued')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS POLICIES
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;

-- 1. Public can read active spare parts
DROP POLICY IF EXISTS "Public Read Spare Parts" ON public.spare_parts;
CREATE POLICY "Public Read Spare Parts" ON public.spare_parts FOR SELECT 
USING (status = 'active' OR vendor_id = auth.uid() OR is_admin());

-- 2. Vendors can manage their own spare parts
DROP POLICY IF EXISTS "Vendors Manage Own Parts" ON public.spare_parts;
CREATE POLICY "Vendors Manage Own Parts" ON public.spare_parts FOR ALL 
USING (vendor_id = auth.uid());

-- 3. Admins have full access
DROP POLICY IF EXISTS "Admin All Access Parts" ON public.spare_parts;
CREATE POLICY "Admin All Access Parts" ON public.spare_parts FOR ALL 
USING (is_admin());

-- 4. Enable full text search on parts name and vehicle details
-- (Optional but recommended for the filter system)
CREATE INDEX IF NOT EXISTS spare_parts_search_idx ON public.spare_parts 
USING gin(to_tsvector('english', name || ' ' || vehicle_make || ' ' || vehicle_model || ' ' || category));
