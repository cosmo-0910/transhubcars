-- Migration: 20260218_ranking_system
-- Description: Adds pinning support, global scoring view, and recommendation RPC

-- 1. Add Pinning Support to Cars
ALTER TABLE cars 
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMP WITH TIME ZONE;

-- 2. Create Global Score Calculation View
-- Calculates a dynamic score based on recency and engagement (views/carts/inquiries)
CREATE OR REPLACE VIEW car_global_scores AS
WITH metrics AS (
    SELECT 
        (metadata->>'car_id')::uuid as car_id,
        COUNT(*) FILTER (WHERE event_name = 'view_car') as views,
        COUNT(*) FILTER (WHERE event_name = 'cart_add') as cart_adds,
        COUNT(*) FILTER (WHERE event_name = 'inquiry') as inquiries
    FROM usage_logs
    WHERE created_at > (now() - INTERVAL '30 days') -- 30-day rolling window for hotness
    GROUP BY (metadata->>'car_id')::uuid
)
SELECT 
    c.id as car_id,
    c.is_pinned,
    c.pinned_at,
    COALESCE(m.views, 0) as views,
    COALESCE(m.inquiries, 0) as inquiries,
    COALESCE(m.cart_adds, 0) as cart_adds,
    -- Scoring Algorithm:
    -- 1. Pinned items get massive boost (1,000,000)
    -- 2. Engagement score: Inquiries(10x) + Cart(5x) + Views(1x)
    -- 3. Recency decay: Score decays by ~10% per day since listing
    (
        CASE WHEN c.is_pinned THEN 1000000 ELSE 0 END +
        (COALESCE(m.inquiries, 0) * 10 + COALESCE(m.cart_adds, 0) * 5 + COALESCE(m.views, 0) * 1) * 
        EXP(-0.1 * EXTRACT(DAY FROM (now() - c.created_at)))
    ) as global_score
FROM cars c
LEFT JOIN metrics m ON c.id = m.car_id;

-- 3. Recommendation RPC Function
-- Returns sorted cars based on Global Score + Personal Preference Bonus
CREATE OR REPLACE FUNCTION get_recommended_cars(p_user_id UUID DEFAULT NULL)
RETURNS SETOF cars
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_preferred_brand text;
    v_preferred_price_min decimal;
    v_preferred_price_max decimal;
BEGIN
    -- Attempt to build a user profile if user_id is provided
    IF p_user_id IS NOT NULL THEN
        -- Find most viewed brand and price range
        SELECT 
            metadata->>'brand',
            MIN((metadata->>'price')::decimal) * 0.8, -- -20%
            MAX((metadata->>'price')::decimal) * 1.2  -- +20%
        INTO v_preferred_brand, v_preferred_price_min, v_preferred_price_max
        FROM usage_logs
        WHERE user_id = p_user_id 
          AND event_name = 'view_car'
          AND created_at > (now() - INTERVAL '60 days')
        GROUP BY metadata->>'brand'
        ORDER BY count(*) DESC
        LIMIT 1;
    END IF;

    RETURN QUERY
    SELECT c.*
    FROM cars c
    JOIN car_global_scores s ON c.id = s.car_id
    ORDER BY 
        -- Pinned items first (handled by global_score magnitude)
        (
            s.global_score +
            -- Personalization Boosts
            CASE 
                -- Boost Brand Match
                WHEN p_user_id IS NOT NULL AND v_preferred_brand IS NOT NULL AND c.make = v_preferred_brand 
                THEN 30 
                ELSE 0 
            END +
            CASE 
                -- Boost Price Range Match
                WHEN p_user_id IS NOT NULL AND v_preferred_price_min IS NOT NULL AND c.price BETWEEN v_preferred_price_min AND v_preferred_price_max 
                THEN 50
                ELSE 0 
            END
        ) DESC,
        c.created_at DESC; -- Fallback sort
END;
$$;

-- 4. Admin Policy for Pinning
-- Ensure only admins can update is_pinned
DROP POLICY IF EXISTS "Admins can pin cars" ON cars;
-- We reuse the existing "Admin All Access" policy for UPDATE, but we can be explicit if needed.
-- The existing policy `create policy "Admin All Access" on cars for all ...` covers this.
