-- Populate body_type for existing cars based on Model names
-- This corresponds to the logic in the Admin Dashboard

UPDATE cars
SET body_type = CASE
    -- SUVs
    WHEN model ILIKE '%Rx%' OR model ILIKE '%Lx%' OR model ILIKE '%Gx%' OR model ILIKE '%Nx%' THEN 'SUV'
    WHEN model ILIKE '%G-Class%' OR model ILIKE '%Gle%' OR model ILIKE '%Glc%' OR model ILIKE '%Gls%' THEN 'SUV'
    WHEN model ILIKE '%X1%' OR model ILIKE '%X3%' OR model ILIKE '%X5%' OR model ILIKE '%X6%' OR model ILIKE '%X7%' THEN 'SUV'
    WHEN model ILIKE '%Range Rover%' OR model ILIKE '%Defender%' OR model ILIKE '%Discovery%' OR model ILIKE '%Velar%' THEN 'SUV'
    WHEN model ILIKE '%Cullinan%' OR model ILIKE '%Urus%' OR model ILIKE '%Bentayga%' OR model ILIKE '%Cayenne%' OR model ILIKE '%Macan%' THEN 'SUV'
    WHEN model ILIKE '%Land Cruiser%' OR model ILIKE '%Prado%' OR model ILIKE '%Highlander%' OR model ILIKE '%Rav4%' OR model ILIKE '%Fortuner%' THEN 'SUV'
    
    -- Saloons (Sedans)
    WHEN model ILIKE '%Es%' OR model ILIKE '%Ls%' OR model ILIKE '%Is%' OR model ILIKE '%Gs%' THEN 'Saloon'
    WHEN model ILIKE '%S-Class%' OR model ILIKE '%E-Class%' OR model ILIKE '%C-Class%' OR model ILIKE '%A-Class%' THEN 'Saloon'
    WHEN model ILIKE '%7 Series%' OR model ILIKE '%5 Series%' OR model ILIKE '%3 Series%' THEN 'Saloon'
    WHEN model ILIKE '%Camry%' OR model ILIKE '%Corolla%' OR model ILIKE '%Avalon%' THEN 'Saloon'
    WHEN model ILIKE '%Ghost%' OR model ILIKE '%Phantom%' OR model ILIKE '%Flying Spur%' OR model ILIKE '%Maybach%' THEN 'Saloon'

    -- Sports / Supercars
    WHEN model ILIKE '%911%' OR model ILIKE '%718%' OR model ILIKE '%Huracan%' OR model ILIKE '%Aventador%' THEN 'Sports'
    WHEN model ILIKE '%Revuelto%' OR model ILIKE '%F8%' OR model ILIKE '%Roma%' OR model ILIKE '%812%' OR model ILIKE '%R8%' THEN 'Sports'
    WHEN model ILIKE '%Amg Gt%' THEN 'Sports'

    -- Coupes
    WHEN model ILIKE '%Mustang%' OR model ILIKE '%Camaro%' OR model ILIKE '%Challenger%' THEN 'Coupe'
    WHEN model ILIKE '%Lc%' OR model ILIKE '%Rc%' OR model ILIKE '%Supra%' OR model ILIKE '%Cle%' THEN 'Coupe'

    -- Convertibles
    WHEN model ILIKE '%Sl%' OR model ILIKE '%Convertible%' THEN 'Convertible'

    -- Pickups
    WHEN model ILIKE '%Hilux%' OR model ILIKE '%Tacoma%' OR model ILIKE '%Tundra%' OR model ILIKE '%Raptor%' THEN 'Pickup'

    ELSE body_type -- Keep existing if no match
END
WHERE body_type IS NULL;

-- Cleanup: Ensure no 'Sedan' remains if any slipped in
UPDATE cars SET body_type = 'Saloon' WHERE body_type = 'Sedan';
