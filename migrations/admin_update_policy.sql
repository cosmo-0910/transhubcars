-- Allow Admins to update any profile (e.g., to approve vendors)
CREATE POLICY "Admin Update Profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
