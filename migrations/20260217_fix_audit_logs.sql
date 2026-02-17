-- Fix Audit Logs and ensure proper RLS policies
-- This ensures the sovereign network can record all tactical administrative actions.

-- 1. Ensure Table Structure (Matching current implementation)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Reset and Re-enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. Public/Authenticated INSERT Policy
-- This allows the frontend components to log actions while authenticated.
DROP POLICY IF EXISTS "Allow INSERT for authenticated users" ON audit_logs;
CREATE POLICY "Allow INSERT for authenticated users" ON audit_logs 
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Admin Read Policy
-- This ensures only administrators can view the historical tactical logs.
DROP POLICY IF EXISTS "Admins read all logs" ON audit_logs;
CREATE POLICY "Admins read all logs" ON audit_logs 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND (role = 'admin' OR email = 'admin@transhub.com')
    )
);

-- 5. Seed initial tactical log entry
INSERT INTO audit_logs (user_id, action, details)
SELECT id, 'System Audit Protocol Initialized', '{"reason": "Manual fix applied to logging system"}'
FROM profiles
WHERE role = 'admin' OR email = 'admin@transhub.com'
LIMIT 1;
