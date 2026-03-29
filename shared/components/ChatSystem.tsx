import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, User, ChevronLeft, Car } from 'lucide-react';
import { chatService } from '../services/chat.service';
import { useAuth } from '../lib/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import type { Conversation, Message } from '../types/chat';

export const ChatSystem = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load conversations when chat is opened
  useEffect(() => {
    if (user && isOpen) {
      loadConversations();
    }
  }, [user, isOpen]);

  // Subscribe to new messages across all conversations to update unread badge
  useEffect(() => {
    if (!user) return;

    const channel = chatService.subscribeToAllMessages(user.id, () => {
      if (!isOpen) {
        setUnreadCount((prev) => prev + 1);
      }
      if (isOpen) {
        loadConversations();
      }
    });

    return () => { channel.unsubscribe(); };
  }, [user, isOpen]);

  // Reset unread badge when opened
  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // Listen for external open-chat events (e.g. from VehicleDetail / VendorProfile)
  useEffect(() => {
    const handleOpenChat = async (e: any) => {
      const { carId, vendorId, autoSendMessage } = e.detail;
      if (!user) return;

      try {
        setLoading(true);
        setIsOpen(true);
        const conv = await chatService.startConversation(carId, user.id, vendorId);
        setActiveConversation(conv);

        if (autoSendMessage && carId) {
          const carContext = conv.car ? `${conv.car.make} ${conv.car.model}` : 'this car';
          await chatService.sendMessage({
            conversation_id: conv.id,
            sender_id: user.id,
            text: `I am interested in inquiring about the ${carContext}.`,
          });
          loadConversations();
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

  // Load messages + subscribe to real-time updates for the active conversation
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation.id);
      const subscription = chatService.subscribeToMessages(activeConversation.id, (msg) => {
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      });
      return () => { subscription.unsubscribe(); };
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeConversation) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [activeConversation]);

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

    const msgText = newMessage;
    setNewMessage('');
    try {
      const sent = await chatService.sendMessage({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        text: msgText,
      });
      setMessages((prev) => {
        if (prev.find((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(msgText); // restore on failure
    }
  };

  const startNewConversation = async () => {
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
  };

  const getDisplayName = (conv: Conversation) => {
    if (profile?.role === 'customer') {
      return conv.vendor?.business_name || conv.vendor?.full_name || 'Transhub Concierge';
    }
    return conv.buyer?.full_name || 'Customer';
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
          boxShadow: '0 10px 25px rgba(197,160,89,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}

        {/* Unread Badge */}
        <AnimatePresence>
          {!isOpen && unreadCount > 0 && (
            <motion.div
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#ef4444',
                color: 'white',
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                fontSize: '0.65rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #0a0a0a',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            style={{
              position: 'absolute',
              bottom: '80px',
              right: 0,
              width: '400px',
              height: '600px',
              maxWidth: '92vw',
              background: 'var(--bg-deep)',
              border: '1px solid var(--border-glass)',
              borderRadius: '1.5rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid var(--border-glass)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexShrink: 0,
            }}>
              {activeConversation ? (
                <>
                  <button
                    onClick={() => { setActiveConversation(null); setMessages([]); }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {getDisplayName(activeConversation)}
                    </div>
                    {activeConversation.car && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '2px' }}>
                        <Car size={10} />
                        {activeConversation.car.make} {activeConversation.car.model}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ flex: 1, fontWeight: 700, letterSpacing: '2px', fontSize: '0.8rem' }}>MESSAGES</div>
                  <button
                    onClick={startNewConversation}
                    style={{ background: 'rgba(197, 160, 89, 0.1)', border: 'none', color: 'var(--accent-gold)', borderRadius: '0.5rem', padding: '0.4rem 0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.5px' }}
                    title="New Inquiry"
                  >
                    <MessageSquare size={14} /> NEW
                  </button>
                </>
              )}
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', scrollbarWidth: 'none' }}>
              {activeConversation ? (
                // Messages view
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '2rem', opacity: 0.6 }}>
                      Send the first message to begin.
                    </div>
                  )}
                  {messages.map((msg) => {
                    const isOwn = msg.sender_id === user.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          alignSelf: isOwn ? 'flex-end' : 'flex-start',
                          maxWidth: '80%',
                          padding: '0.75rem 1rem',
                          borderRadius: isOwn ? '1rem 1rem 0.2rem 1rem' : '1rem 1rem 1rem 0.2rem',
                          background: isOwn ? 'var(--accent-gold)' : 'rgba(255,255,255,0.07)',
                          color: isOwn ? 'black' : 'white',
                          fontSize: '0.88rem',
                          lineHeight: 1.5,
                        }}
                      >
                        {msg.text}
                        <div style={{ fontSize: '0.6rem', opacity: 0.55, marginTop: '0.3rem', textAlign: 'right' }}>
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : loading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '28px', height: '28px', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                </div>
              ) : conversations.length === 0 ? (
                // Empty state
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1.5rem', padding: '2rem', textAlign: 'center' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={36} opacity={0.2} />
                  </div>
                  <div>
                    <p style={{ color: 'white', fontWeight: 600, marginBottom: '0.4rem' }}>No conversations yet</p>
                    <p style={{ fontSize: '0.78rem', opacity: 0.55 }}>Our concierge team is ready to assist with your acquisitions.</p>
                  </div>
                  <button onClick={startNewConversation} className="btn-gold" style={{ padding: '0.8rem 1.6rem', fontSize: '0.78rem', width: 'auto' }}>
                    START NEW INQUIRY
                  </button>
                </div>
              ) : (
                // Conversation list
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {conversations.map((conv) => (
                    <motion.button
                      key={conv.id}
                      whileHover={{ x: 4 }}
                      onClick={() => setActiveConversation(conv)}
                      className="glass-hover"
                      style={{
                        width: '100%',
                        padding: '0.9rem 1rem',
                        borderRadius: '0.9rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      {/* Avatar / Car thumbnail */}
                      <div style={{
                        width: '46px',
                        height: '46px',
                        borderRadius: '0.6rem',
                        background: conv.car?.image_url ? 'black' : 'var(--accent-gold-soft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                      }}>
                        {conv.car?.image_url ? (
                          <img src={conv.car.image_url} alt={conv.car.make} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={22} color="var(--accent-gold)" />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {getDisplayName(conv)}
                        </div>
                        {conv.car && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--accent-gold)', marginBottom: '2px' }}>
                            {conv.car.make} {conv.car.model}
                          </div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                          {conv.last_message || 'No messages yet'}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true })}
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input */}
            {activeConversation && (
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: '1rem 1.25rem',
                  borderTop: '1px solid var(--border-glass)',
                  display: 'flex',
                  gap: '0.7rem',
                  flexShrink: 0,
                  alignItems: 'flex-end',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSendMessage(e as any); }}
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
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: newMessage.trim() ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    flexShrink: 0,
                  }}
                >
                  <Send size={16} color={newMessage.trim() ? 'black' : 'rgba(255,255,255,0.3)'} />
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
