-- Migration: Admin Oversight for Chat & Notifications
-- Date: 2026-02-21

-- 1. Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Conversations Policies
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations" ON conversations
FOR SELECT USING (
  auth.uid() = buyer_id OR 
  auth.uid() = vendor_id OR 
  is_admin()
);

DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;
CREATE POLICY "Users can insert conversations" ON conversations
FOR INSERT WITH CHECK (
  auth.uid() = buyer_id
);

-- 3. Update Messages Policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations" ON messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = messages.conversation_id 
    AND (buyer_id = auth.uid() OR vendor_id = auth.uid() OR is_admin())
  )
);

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;
CREATE POLICY "Users can send messages in their conversations" ON messages
FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = messages.conversation_id 
    AND (buyer_id = auth.uid() OR vendor_id = auth.uid() OR is_admin())
  )
);

-- 4. Update Notifications Policies
-- Note: Notifications are still private for SELECT, but Admins can INSERT for any user
DROP POLICY IF EXISTS "Admins can insert notifications" ON notifications;
CREATE POLICY "Admins can insert notifications" ON notifications
FOR INSERT WITH CHECK (is_admin());
