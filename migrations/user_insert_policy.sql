-- Allow users to insert their own profile (required for UPSERT operations)
CREATE POLICY "Users Insert Own Profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
