-- NEW SERVICE TABLES

-- 1. MECHANICS TABLE
CREATE TABLE IF NOT EXISTS mechanics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  location TEXT NOT NULL,
  rating DECIMAL DEFAULT 0,
  is_approved BOOLEAN DEFAULT false,
  phone TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. SPARE PART ORDERS TABLE
CREATE TABLE IF NOT EXISTS spare_part_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  part_name TEXT NOT NULL,
  vehicle_make TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year TEXT,
  quantity INTEGER DEFAULT 1,
  description TEXT,
  status TEXT CHECK (status IN ('Pending', 'Sourced', 'Shipped', 'Delivered')) DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TOW REQUESTS TABLE
CREATE TABLE IF NOT EXISTS tow_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  pickup_address TEXT NOT NULL,
  destination_address TEXT,
  vehicle_type TEXT NOT NULL,
  notes TEXT,
  status TEXT CHECK (status IN ('Searching', 'En Route', 'Completed', 'Cancelled')) DEFAULT 'Searching',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS POLICIES FOR MECHANICS
ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Mechanics" ON mechanics;
CREATE POLICY "Public Read Mechanics" ON mechanics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Access Mechanics" ON mechanics;
CREATE POLICY "Admin All Access Mechanics" ON mechanics FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS POLICIES FOR SPARE PART ORDERS
ALTER TABLE spare_part_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users Read Own Part Orders" ON spare_part_orders;
CREATE POLICY "Users Read Own Part Orders" ON spare_part_orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users Insert Own Part Orders" ON spare_part_orders;
CREATE POLICY "Users Insert Own Part Orders" ON spare_part_orders FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin All Access Part Orders" ON spare_part_orders;
CREATE POLICY "Admin All Access Part Orders" ON spare_part_orders FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS POLICIES FOR TOW REQUESTS
ALTER TABLE tow_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users Read Own Tow Requests" ON tow_requests;
CREATE POLICY "Users Read Own Tow Requests" ON tow_requests FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users Insert Own Tow Requests" ON tow_requests;
CREATE POLICY "Users Insert Own Tow Requests" ON tow_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin All Access Tow Requests" ON tow_requests;
CREATE POLICY "Admin All Access Tow Requests" ON tow_requests FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
