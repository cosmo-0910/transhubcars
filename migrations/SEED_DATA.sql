-- SEED DATA for Nigerian Market Alignment

-- 1. Clear existing sample cars (optional, but good for alignment)
-- DELETE FROM cars WHERE vendor_id IS NULL;

-- 2. Insert Popular Nigerian Models
INSERT INTO cars (
  make, model, year, price, status, description, image_url, gallery_urls, 
  mileage, vin, transmission, fuel_type, interior_color, exterior_color, engine, stock_number, approval_status
) VALUES 
(
  'Mercedes-Benz', 'G-Wagon G63', 2024, 250000000, 'Readily Available', 
  'The pinnacle of luxury SUVs, finished in obsidian black with cranberry leather interior.', 
  'https://images.unsplash.com/photo-1520031441872-265e4ff70366?q=80&w=2070&auto=format&fit=crop', 
  '{"https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2070&auto=format&fit=crop", "https://images.unsplash.com/photo-1541443131876-44b03de101c5?q=80&w=2070&auto=format&fit=crop"}', 
  45, 'WDCYC7CH5RX001923', 'Automatic', 'Petrol', 'Cranberry Red', 'Obsidian Black', '4.0L V8 Biturbo', 'TH-2024-G63', 'approved'
),
(
  'Lexus', 'RX 350 Luxury', 2023, 85000000, 'Readily Available', 
  'The definitive Nigerian luxury crossover. Exceptional comfort, reliability, and resale value.', 
  'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop', 
  '{}', 
  5000, '2T2HZMHA5PC001234', 'Automatic', 'Petrol', 'Parchment', 'Eminent White Pearl', '2.4L Turbo I4', 'TH-2023-LX-RX', 'approved'
),
(
  'Toyota', 'Camry XSE', 2022, 45000000, 'Readily Available', 
  'Sporty and sophisticated, the Camry remains a king on Nigerian roads. Low maintenance and high performance.', 
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=2070&auto=format&fit=crop', 
  '{}', 
  12000, '4T1B11AK5NU004567', 'Automatic', 'Petrol', 'Black Leather', 'Celestial Silver', '2.5L I4', 'TH-2022-TY-CM', 'approved'
),
(
  'Toyota', 'Land Cruiser 300', 2024, 195000000, 'Preorder', 
  'The King of all terrain. The Land Cruiser 300 series combines rugged capability with ultimate luxury.', 
  'https://images.unsplash.com/photo-1611859328053-3cbc9f9399f4?q=80&w=1965&auto=format&fit=crop', 
  '{}', 
  0, 'JTMHU01J5P0009876', 'Automatic', 'Diesel', 'Neutral Beige', 'Precious White', '3.3L V6 Twin-Turbo Diesel', 'TH-2024-TY-LC300', 'approved'
),
(
  'Honda', 'Civic Touring', 2023, 38000000, 'Readily Available', 
  'Efficiency meets elegance. The Honda Civic is the perfect daily driver for the modern Nigerian professional.', 
  'https://images.unsplash.com/photo-1629904869392-ae2a682d4d01?q=80&w=2070&auto=format&fit=crop', 
  '{}', 
  3500, '1HGFE2F89PA005678', 'Automatic', 'Petrol', 'Gray', 'Meteorite Gray Metallic', '1.5L Turbo I4', 'TH-2023-HD-CV', 'approved'
);
