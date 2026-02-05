-- Add INSERT policy for audit_logs to allow frontend logging
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON audit_logs;
CREATE POLICY "Allow INSERT for authenticated users" ON audit_logs 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Ensure admins can read all logs
DROP POLICY IF EXISTS "Admins read all logs" ON audit_logs;
CREATE POLICY "Admins read all logs" ON audit_logs 
FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
