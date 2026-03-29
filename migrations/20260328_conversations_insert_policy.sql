-- Migration to update conversation insert policy
-- This ensures any authenticated user can start a conversation,
-- provided they are either the buyer or the vendor in the conversation.

DROP POLICY IF EXISTS "Users can insert conversations" ON conversations;

CREATE POLICY "Users can insert conversations" ON conversations
FOR INSERT WITH CHECK (
  auth.uid() = buyer_id OR auth.uid() = vendor_id
);

-- Ensure that the creator's ID is set correctly
-- (This is usually handled by the application, but the policy enforces it)
