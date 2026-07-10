-- 1. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Platform Settings Table
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. RLS Policies for Audit Logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read all logs" ON audit_logs;
CREATE POLICY "Admins read all logs" ON audit_logs 
FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 4. RLS Policies for Platform Settings
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read settings" ON platform_settings;
CREATE POLICY "Public read settings" ON platform_settings 
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage settings" ON platform_settings;
CREATE POLICY "Admins manage settings" ON platform_settings 
FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 5. Seed initial settings
INSERT INTO platform_settings (key, value)
VALUES 
  ('branding', '{"name": "Transhub Luxury", "logo": "/logo.png", "primary_color": "#c5a059"}'),
  ('contact', '{"email": "contact@transhub.com", "phone": "+234 808 678 8983"}')
ON CONFLICT (key) DO NOTHING;
