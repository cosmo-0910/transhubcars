/**
 * MessagingPanel — a reusable full-height messaging UI for embedding
 * inside other pages (VendorDashboard, UserProfile, etc.)
 *
 * Props:
 *  - userId:  the current user's id
 *  - role:    'customer' | 'vendor' | 'admin'
 *  - height:  CSS height string (default '100%')
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, User, ChevronLeft, Car, Loader } from 'lucide-react';
import { chatService } from '../../shared/services/chat.service';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation, Message } from '../../shared/types/chat';

interface MessagingPanelProps {
  userId: string;
  role: string;
  height?: string;
  carId?: string | null;
  vendorId?: string | null;
}

export const MessagingPanel = ({ userId, role, height = '100%', carId, vendorId }: MessagingPanelProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadConversations();
  }, [userId, carId, vendorId]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      const sub = chatService.subscribeToMessages(activeConversation.id, (msg) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      });
      setTimeout(() => inputRef.current?.focus(), 200);
      return () => { sub.unsubscribe(); };
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Subscribe to updates so the conversation list stays fresh
  useEffect(() => {
    const sub = chatService.subscribeToAllMessages(userId, () => {
      loadConversations();
    });
    return () => { sub.unsubscribe(); };
  }, [userId]);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await chatService.getConversations(userId);
      setConversations(data);

      // Auto-select or start conversation if props provided
      if (carId || vendorId) {
        const conv = await chatService.startConversation(carId || null, userId, vendorId || null);
        setActiveConversation(conv);
        
        // If it's a new conversation, add to list if not present
        if (!data.find(c => c.id === conv.id)) {
          setConversations(prev => [conv, ...prev]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (id: string) => {
    try {
      const data = await chatService.getMessages(id);
      setMessages(data);
      chatService.markAsRead(id, userId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;
    const msgText = newMessage;
    setNewMessage('');
    try {
      const sent = await chatService.sendMessage({
        conversation_id: activeConversation.id,
        sender_id: userId,
        text: msgText,
      });
      setMessages((prev) => {
        if (prev.find((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
    } catch (err) {
      console.error(err);
      setNewMessage(msgText);
    }
  };

  const getDisplayName = (conv: Conversation) => {
    if (role === 'customer') {
      return conv.vendor?.business_name || conv.vendor?.full_name || 'Transhub Concierge';
    }
    return conv.buyer?.full_name || 'Customer';
  };

  return (
    <div style={{ height, display: 'flex', overflow: 'hidden' }}>
      {/* Conversation List */}
      <div style={{
        width: activeConversation ? '0' : '100%',
        maxWidth: '340px',
        minWidth: activeConversation ? '0' : '260px',
        borderRight: '1px solid var(--border-glass)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        flexShrink: 0,
      }}>
        {/* List header */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontWeight: 700, letterSpacing: '2px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONVERSATIONS</div>
          <span style={{ background: 'var(--accent-gold-soft)', color: 'var(--accent-gold)', borderRadius: '1rem', padding: '0.2rem 0.7rem', fontSize: '0.7rem', fontWeight: 700 }}>
            {conversations.length}
          </span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', scrollbarWidth: 'none' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
              <Loader size={20} color="var(--accent-gold)" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <MessageSquare size={36} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
              <p style={{ fontSize: '0.82rem' }}>No messages yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <motion.button
                key={conv.id}
                whileHover={{ x: 3 }}
                onClick={() => setActiveConversation(conv)}
                style={{
                  width: '100%',
                  padding: '0.85rem',
                  borderRadius: '0.85rem',
                  background: activeConversation?.id === conv.id ? 'rgba(197,160,89,0.08)' : 'transparent',
                  border: activeConversation?.id === conv.id ? '1px solid rgba(197,160,89,0.2)' : '1px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  marginBottom: '0.35rem',
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  width: '44px', height: '44px', borderRadius: '0.6rem',
                  background: conv.car?.image_url ? 'black' : 'var(--accent-gold-soft)',
                  flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {conv.car?.image_url
                    ? <img src={conv.car.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={20} color="var(--accent-gold)" />
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {getDisplayName(conv)}
                  </div>
                  {conv.car && (
                    <div style={{ fontSize: '0.66rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Car size={9} /> {conv.car.make} {conv.car.model}
                    </div>
                  )}
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conv.last_message || 'Start chatting…'}
                  </div>
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0, textAlign: 'right' }}>
                  {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Chat Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexShrink: 0,
              background: 'rgba(255,255,255,0.02)',
            }}>
              <button
                onClick={() => { setActiveConversation(null); setMessages([]); }}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.5rem', display: 'flex' }}
              >
                <ChevronLeft size={18} />
              </button>
              <div style={{
                width: '38px', height: '38px', borderRadius: '0.5rem',
                background: activeConversation.car?.image_url ? 'black' : 'var(--accent-gold-soft)',
                flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {activeConversation.car?.image_url
                  ? <img src={activeConversation.car.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <User size={18} color="var(--accent-gold)" />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {getDisplayName(activeConversation)}
                </div>
                {activeConversation.car && (
                  <div style={{ fontSize: '0.68rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Car size={10} /> {activeConversation.car.make} {activeConversation.car.model} ({activeConversation.car.year})
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', scrollbarWidth: 'none' }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', opacity: 0.55, margin: 'auto' }}>
                  Start the conversation below.
                </div>
              )}
              {messages.map((msg) => {
                const isOwn = msg.sender_id === userId;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      alignSelf: isOwn ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      padding: '0.75rem 1rem',
                      borderRadius: isOwn ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                      background: isOwn ? 'var(--accent-gold)' : 'rgba(255,255,255,0.07)',
                      color: isOwn ? 'black' : 'white',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  >
                    {msg.image_url && (
                      <div style={{ marginBottom: '0.5rem', borderRadius: '0.5rem', overflow: 'hidden', maxWidth: '300px' }}>
                        <img src={msg.image_url} alt="Shared" style={{ width: '100%', display: 'block' }} />
                      </div>
                    )}
                    {msg.text}
                    <div style={{ fontSize: '0.6rem', opacity: 0.55, marginTop: '0.25rem', textAlign: 'right' }}>
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              style={{
                padding: '1rem 1.25rem',
                borderTop: '1px solid var(--border-glass)',
                display: 'flex',
                gap: '0.7rem',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <input 
                type="file" 
                id="msg-image-upload" 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !activeConversation) return;
                  
                  try {
                    setLoading(true);
                    // Upload to storage
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `chat-images/${fileName}`;
                    
                    const { error: uploadError } = await chatService.supabase.storage
                      .from('car-images')
                      .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    const { data: { publicUrl } } = chatService.supabase.storage
                      .from('car-images')
                      .getPublicUrl(filePath);

                    // Send message with image
                    const sent = await chatService.sendMessage({
                      conversation_id: activeConversation.id,
                      sender_id: userId,
                      text: '',
                      image_url: publicUrl
                    });

                    setMessages(prev => [...prev, sent]);
                  } catch (err) {
                    console.error('Upload failed:', err);
                    alert('Failed to send image');
                  } finally {
                    setLoading(false);
                  }
                }}
              />
              <label 
                htmlFor="msg-image-upload"
                style={{ 
                  width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                <Car size={18} color="rgba(255,255,255,0.6)" />
              </label>
              
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message…"
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e as any); }}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '2rem',
                  padding: '0.75rem 1.1rem',
                  color: 'white',
                  outline: 'none',
                  fontSize: '0.88rem',
                }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: newMessage.trim() ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: newMessage.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease',
                }}
              >
                <Send size={16} color={newMessage.trim() ? 'black' : 'rgba(255,255,255,0.3)'} />
              </button>
            </form>
          </>
        ) : (
          // No conversation selected placeholder
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-muted)', gap: '1rem', textAlign: 'center', padding: '2rem'
          }}>
            <MessageSquare size={48} opacity={0.12} />
            <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Select a conversation to begin</p>
          </div>
        )}
      </div>
    </div>
  );
};
