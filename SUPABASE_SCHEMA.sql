-- 1. PROFILES TABLE (Role Management)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT CHECK (role IN ('customer', 'admin', 'vendor')) DEFAULT 'customer',
  vendor_status TEXT CHECK (vendor_status IN ('none', 'pending', 'approved', 'rejected')) DEFAULT 'none',
  business_name TEXT,
  business_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CARS TABLE (Inventory)
CREATE TABLE IF NOT EXISTS cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  status TEXT CHECK (status IN ('Ready to Ship', 'Preorder')) NOT NULL,
  description TEXT,
  image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  mileage INTEGER DEFAULT 0,
  vin TEXT,
  transmission TEXT CHECK (transmission IN ('Automatic', 'Manual', 'Semi-Auto')),
  fuel_type TEXT CHECK (fuel_type IN ('Petrol', 'Diesel', 'Hybrid', 'Electric')),
  interior_color TEXT,
  exterior_color TEXT,
  engine TEXT,
  stock_number TEXT,
  vendor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ORDERS TABLE (Lifecycle tracking)
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  amount DECIMAL NOT NULL,
  status TEXT CHECK (status IN ('Pending', 'Paid', 'Processing', 'Shipped', 'Delivered')) DEFAULT 'Pending',
  payment_ref TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. INQUIRIES & PREORDERS (Lead Generation)
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES cars(id) ON DELETE SET NULL,
  car_name TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  type TEXT CHECK (type IN ('Inspection', 'Purchase')) NOT NULL,
  message TEXT,
  status TEXT CHECK (status IN ('New', 'Contacted', 'Archived')) DEFAULT 'New',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS preorders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  budget DECIMAL,
  message TEXT,
  status TEXT CHECK (status IN ('Searching', 'Sourced', 'Delivered')) DEFAULT 'Searching',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CART ITEMS (Shopping Cart)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  car_id UUID REFERENCES cars(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, car_id)
);

-- RLS POLICIES

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Profiles" ON profiles;
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users Insert Own Profile" ON profiles;
CREATE POLICY "Users Insert Own Profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users Update Own Profile" ON profiles;
CREATE POLICY "Users Update Own Profile" ON profiles FOR UPDATE USING (auth.uid() = id);


-- Function to check if current user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

DROP POLICY IF EXISTS "Admin Update Profiles" ON profiles;
CREATE POLICY "Admin Update Profiles" ON profiles FOR UPDATE USING (is_admin());

-- CARS
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Access" ON cars;
CREATE POLICY "Public Read Access" ON cars FOR SELECT USING (
  approval_status = 'approved' OR 
  (vendor_id = auth.uid()) OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admin All Access" ON cars;
CREATE POLICY "Admin All Access" ON cars FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Vendors Manage Own Cars" ON cars;
CREATE POLICY "Vendors Manage Own Cars" ON cars FOR ALL USING (
  vendor_id = auth.uid()
);

-- ORDERS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users Read Own Orders" ON orders;
CREATE POLICY "Users Read Own Orders" ON orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users Create Orders" ON orders;
CREATE POLICY "Users Create Orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin All Access Orders" ON orders;
CREATE POLICY "Admin All Access Orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- INQUIRIES
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Insert Inquiries" ON inquiries;
CREATE POLICY "Public Insert Inquiries" ON inquiries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Access Inquiries" ON inquiries;
CREATE POLICY "Admin All Access Inquiries" ON inquiries FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- PREORDERS
ALTER TABLE preorders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Insert Preorders" ON preorders;
CREATE POLICY "Public Insert Preorders" ON preorders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Access Preorders" ON preorders;
CREATE POLICY "Admin All Access Preorders" ON preorders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- CART ITEMS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users Read Own Cart" ON cart_items;
CREATE POLICY "Users Read Own Cart" ON cart_items FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users Add To Cart" ON cart_items;
CREATE POLICY "Users Add To Cart" ON cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users Update Own Cart" ON cart_items;
CREATE POLICY "Users Update Own Cart" ON cart_items FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users Delete Own Cart" ON cart_items;
CREATE POLICY "Users Delete Own Cart" ON cart_items FOR DELETE USING (auth.uid() = user_id);

-- AUTOMATIC PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, vendor_status)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    CASE 
      WHEN new.email = 'admin@transhub.com' THEN 'admin'
      ELSE 'customer'
    END,
    'none'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
