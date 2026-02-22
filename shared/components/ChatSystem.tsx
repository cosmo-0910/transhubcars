import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, User } from 'lucide-react';
import { chatService } from '../services/chat.service';
import { useAuth } from '../lib/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation, Message } from '../../mobile/src/types';

export const ChatSystem = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && isOpen) {
      loadConversations();
    }
  }, [user, isOpen]);

  useEffect(() => {
    // Listener for external triggers (e.g. from VehicleDetail)
    const handleOpenChat = async (e: any) => {
      const { carId, vendorId, autoSendMessage } = e.detail;
      if (!user) return;
      
      try {
        setLoading(true);
        setIsOpen(true);
        const conv = await chatService.startConversation(carId, user.id, vendorId);
        setActiveConversation(conv);

        // If autoSendMessage is requested (e.g. from VendorProfile click)
        if (autoSendMessage && carId) {
          const carContext = conv.car ? `${conv.car.make} ${conv.car.model}` : 'this car';
          await chatService.sendMessage({
            conversation_id: conv.id,
            sender_id: user.id,
            text: `I am interested in inquiring about the ${carContext}.`
          });
          loadConversations(); // Refresh list
        }
      } catch (err) {
        console.error('Failed to open specific chat:', err);
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, [user]);

  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      const subscription = chatService.subscribeToMessages(activeConversation.id, (msg) => {
        setMessages(prev => [...prev, msg]);
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations(user!.id);
      setConversations(data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (id: string) => {
    try {
      const data = await chatService.getMessages(id);
      setMessages(data);
      chatService.markAsRead(id, user!.id);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    try {
      const msgText = newMessage;
      setNewMessage('');
      await chatService.sendMessage({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        text: msgText,
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 5000 }}>
      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--accent-gold)',
          color: 'black',
          border: 'none',
          boxShadow: '0 10px 25px rgba(197,160,89,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            style={{
              position: 'absolute',
              bottom: '80px',
              right: 0,
              width: '400px',
              height: '600px',
              maxWidth: '90vw',
              background: 'var(--bg-deep)',
              border: '1px solid var(--border-glass)',
              borderRadius: '1.5rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ 
              padding: '1.5rem', 
              background: 'rgba(255,255,255,0.03)', 
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {activeConversation ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <button 
                    onClick={() => setActiveConversation(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={20} />
                  </button>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {profile?.role === 'customer' 
                        ? activeConversation.vendor?.business_name || activeConversation.vendor?.full_name || 'Transhub Concierge'
                        : activeConversation.buyer?.full_name}
                    </div>
                    {activeConversation.car && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>
                        Regarding: {activeConversation.car.make} {activeConversation.car.model}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontWeight: 700, letterSpacing: '1px', fontSize: '0.85rem' }}>MESSAGES</div>
                  {user && (
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const conv = await chatService.startConversation(null, user.id, null);
                          setActiveConversation(conv);
                          loadConversations();
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      style={{ background: 'rgba(197, 160, 89, 0.1)', border: 'none', color: 'var(--accent-gold)', borderRadius: '0.5rem', padding: '0.4rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                      title="Start New Inquiry"
                    >
                      <MessageSquare size={18} />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* List / Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {activeConversation ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === user.id;
                    return (
                      <div 
                        key={msg.id}
                        style={{
                          alignSelf: isOwn ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          padding: '0.8rem 1rem',
                          borderRadius: isOwn ? '1rem 1rem 0 1rem' : '1rem 1rem 1rem 0',
                          background: isOwn ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                          color: isOwn ? 'black' : 'white',
                          fontSize: '0.9rem'
                        }}
                      >
                        {msg.text}
                        <div style={{ 
                          fontSize: '0.65rem', 
                          opacity: 0.6, 
                          marginTop: '0.3rem',
                          textAlign: 'right'
                        }}>
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : loading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="loader"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={40} opacity={0.2} />
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 600, marginBottom: '0.5rem' }}>No active conversations</p>
                    <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>Our concierge team is ready to assist with your acquisitions.</p>
                  </div>
                  <button 
                    onClick={async () => {
                      if (!user) return;
                      setLoading(true);
                      try {
                        const conv = await chatService.startConversation(null, user.id, null);
                        setActiveConversation(conv);
                        loadConversations();
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="btn-gold"
                    style={{ padding: '0.8rem 1.5rem', fontSize: '0.8rem', width: 'auto' }}
                  >
                    START NEW INQUIRY
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setActiveConversation(conv)}
                      className="glass-hover"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        borderRadius: '1rem',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '50%', 
                        background: 'var(--accent-gold-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-gold)'
                      }}>
                        <User size={24} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                          {profile?.role === 'customer' 
                            ? conv.vendor?.business_name || conv.vendor?.full_name || 'Transhub Concierge'
                            : conv.buyer?.full_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>
                          {conv.last_message || 'No messages yet'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                          {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Area */}
            {activeConversation && (
              <form 
                onSubmit={handleSendMessage}
                style={{ 
                  padding: '1.5rem', 
                  borderTop: '1px solid var(--border-glass)',
                  display: 'flex',
                  gap: '0.8rem'
                }}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '2rem',
                    padding: '0.8rem 1.2rem',
                    color: 'white',
                    outline: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'var(--accent-gold)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    opacity: newMessage.trim() ? 1 : 0.5
                  }}
                >
                  <Send size={18} color="black" />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
