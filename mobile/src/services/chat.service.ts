import { supabase } from './supabase';
import { Conversation, Message } from '../types';

export const chatService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        buyer:buyer_id(full_name, avatar_url),
        vendor:vendor_id(full_name, avatar_url, business_name),
        car:car_id(make, model, year, image_url)
      `)
      .or(`buyer_id.eq.${userId},vendor_id.eq.${userId}`)
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

    // Update conversation last message and timestamp
    await supabase
      .from('conversations')
      .update({ 
        last_message: message.text,
        updated_at: new Date().toISOString()
      })
      .eq('id', message.conversation_id);

    return data;
  },

  async startConversation(carId: string, buyerId: string, vendorId: string): Promise<Conversation> {
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('car_id', carId)
      .eq('buyer_id', buyerId)
      .eq('vendor_id', vendorId)
      .single();

    if (existing) return existing;

    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        car_id: carId,
        buyer_id: buyerId,
        vendor_id: vendorId,
        last_message: 'Started a new inquiry'
      }])
      .select()
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

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    if (error) throw error;
  }
};
