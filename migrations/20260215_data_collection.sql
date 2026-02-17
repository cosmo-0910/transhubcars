-- Operational Data Collection Migration
-- 1. Extend Profiles with Device Info
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS device_os TEXT,
ADD COLUMN IF NOT EXISTS device_model TEXT,
ADD COLUMN IF NOT EXISTS unique_hardware_id TEXT,
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 2. Create User Location History Table
CREATE TABLE IF NOT EXISTS user_location_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Usage Logs Table (Replacing/Enhancing audit_logs for high-volume operational events)
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE user_location_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- 5. Policies
DROP POLICY IF EXISTS "Users can insert their own locations" ON user_location_history;
CREATE POLICY "Users can insert their own locations" ON user_location_history 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all location history" ON user_location_history;
CREATE POLICY "Admins read all location history" ON user_location_history 
FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Users can insert their own usage logs" ON usage_logs;
CREATE POLICY "Users can insert their own usage logs" ON usage_logs 
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins read all usage logs" ON usage_logs;
CREATE POLICY "Admins read all usage logs" ON usage_logs 
FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 6. Enable Realtime
BEGIN;
  DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE user_location_history;
    END IF;
  END $$;
COMMIT;
