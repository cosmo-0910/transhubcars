import { supabase } from '../lib/supabase';
import type { Conversation, Message } from '../types/chat';

export const chatService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        buyer:buyer_id(id, full_name, avatar_url),
        vendor:vendor_id(id, full_name, avatar_url, business_name),
        car:car_id(id, make, model, year, image_url)
      `)
      .or(`buyer_id.eq.${userId},vendor_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllConversations(): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        buyer:buyer_id(id, full_name, avatar_url),
        vendor:vendor_id(id, full_name, avatar_url, business_name),
        car:car_id(id, make, model, year, image_url)
      `)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async sendMessage(message: Omit<Message, 'id' | 'created_at' | 'is_read'>): Promise<Message> {
    const { data, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from('conversations')
      .update({ 
        last_message: message.text,
        updated_at: new Date().toISOString()
      })
      .eq('id', message.conversation_id);

    return data;
  },

  async startConversation(carId: string | null, buyerId: string, vendorId: string | null): Promise<Conversation> {
    // Check for existing conversation for this car and buyer
    let query = supabase
      .from('conversations')
      .select(`
        *,
        buyer:buyer_id(id, full_name, avatar_url),
        vendor:vendor_id(id, full_name, avatar_url, business_name),
        car:car_id(id, make, model, year, image_url)
      `)
      .eq('buyer_id', buyerId);
    
    if (carId) {
      query = query.eq('car_id', carId);
    } else {
      query = query.is('car_id', null);
    }

    const { data: existing } = await query.maybeSingle();

    if (existing) return existing;

    // Create new one
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        car_id: carId,
        buyer_id: buyerId,
        vendor_id: vendorId, // Can be null if Transhub Official
        last_message: 'Started a new inquiry'
      }])
      .select(`
        *,
        buyer:buyer_id(id, full_name, avatar_url),
        vendor:vendor_id(id, full_name, avatar_url, business_name),
        car:car_id(id, make, model, year, image_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  subscribeToMessages(conversationId: string, onMessage: (message: Message) => void) {
    return supabase
      .channel(`chat_${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          onMessage(payload.new as Message);
        }
      )
      .subscribe();
  },

  // Subscribe to all new messages where user is buyer or vendor (for unread badge)
  subscribeToAllMessages(userId: string, onNewMessage: () => void) {
    return supabase
      .channel(`chat_all_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const msg = payload.new as Message;
          // Ignore messages sent by the current user
          if (msg.sender_id === userId) return;
          onNewMessage();
        }
      )
      .subscribe();
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    if (error) throw error;
  }
};
