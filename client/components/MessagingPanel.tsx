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
import { MessageSquare, User, ChevronLeft, Car, Loader, SlidersHorizontal, MessageSquarePlus, MoreVertical, BadgeCheck, Search, ChevronRight, Phone, Video, ShieldAlert, CheckCheck, Smile, X } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Buyers' | 'Sellers' | 'System'>('All');

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
      <div className="messaging-list-pane" style={{
        width: activeConversation ? '0' : '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        flexShrink: 0,
      }}>
        {/* List header */}
        <div style={{ padding: '1.5rem 1.5rem 1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h1 className="luxury-font" style={{ fontSize: '1.8rem', margin: 0 }}>Messages</h1>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--accent-gold)' }}>
            <MessageSquarePlus size={20} style={{ cursor: 'pointer' }} />
            <MoreVertical size={20} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '0 1.5rem 1rem 1.5rem', display: 'flex', gap: '0.8rem', flexShrink: 0 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
            <Search size={16} color="rgba(255,255,255,0.4)" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', padding: '0.8rem 0.5rem', width: '100%', outline: 'none', fontSize: '0.85rem' }} 
            />
          </div>
          <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.8rem', width: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}>
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {/* Filter Pills */}
        <div style={{ padding: '0 1.5rem 1rem 1.5rem', display: 'flex', gap: '0.8rem', flexShrink: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {['All', 'Buyers', 'Sellers', 'System'].map(f => {
             const isActive = activeFilter === f;
             return (
               <button 
                 key={f}
                 onClick={() => setActiveFilter(f as any)}
                 style={{ 
                   background: isActive ? 'rgba(197,160,89,0.05)' : 'rgba(255,255,255,0.03)', 
                   border: isActive ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.05)', 
                   color: isActive ? 'var(--accent-gold)' : 'rgba(255,255,255,0.6)', 
                   borderRadius: '2rem', padding: '0.35rem 1rem', fontSize: '0.75rem', fontWeight: isActive ? 700 : 500,
                   display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap'
                 }}
               >
                 {f} {f === 'All' && <span style={{ background: isActive ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)', color: isActive ? '#000' : '#fff', padding: '1px 6px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 800 }}>{conversations.length}</span>}
               </button>
             )
          })}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem 1rem', scrollbarWidth: 'none' }}>
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
            conversations.filter(c => getDisplayName(c).toLowerCase().includes(searchQuery.toLowerCase())).map((conv) => {
              const isVendorAccount = conv.vendor?.id ? true : false;
              // Mock unread count logic for visual parity
              const mockUnread = conv.id.length % 3 === 0 ? 2 : 0; 
              const isOnline = conv.id.length % 2 === 0;

              return (
                <motion.button
                  key={conv.id}
                  whileHover={{ x: 3 }}
                  onClick={() => setActiveConversation(conv)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    background: activeConversation?.id === conv.id ? '#0d0d0d' : 'transparent',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    marginBottom: '0.25rem',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.02)'
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)', border: isVendorAccount ? '1px solid var(--accent-gold)' : '1px solid transparent',
                      flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                       <User size={20} color={isVendorAccount ? "var(--accent-gold)" : "rgba(255,255,255,0.5)"} />
                    </div>
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: isOnline ? '#22c55e' : '#555', borderRadius: '50%', border: '2px solid #000' }} />
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.2rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {getDisplayName(conv)}
                        {isVendorAccount && <BadgeCheck size={14} color="var(--accent-gold)" />}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', flexShrink: 0, marginTop: '2px' }}>
                        {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: true }).replace('about ', '').replace(' minutes', 'm').replace(' hours', 'h').replace(' days', 'd')}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '0.8rem', color: mockUnread > 0 ? '#fff' : 'rgba(255,255,255,0.6)', fontWeight: mockUnread > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.4rem' }}>
                      {conv.last_message || 'Start chatting…'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {conv.car ? (
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
                          <Car size={12} /> {conv.car.make} {conv.car.model}
                        </div>
                      ) : <div />}
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                        {conv.car?.image_url && (
                          <div style={{ width: '40px', height: '24px', borderRadius: '4px', overflow: 'hidden', background: '#222' }}>
                            <img src={conv.car.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        {mockUnread > 0 ? (
                          <div style={{ background: 'var(--accent-gold)', color: '#000', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800 }}>
                            {mockUnread}
                          </div>
                        ) : (
                          <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>
      </div>


      {/* Chat Pane */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '1rem 1.2rem',
              borderBottom: '1px solid rgba(255,255,255,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              background: '#0a0a0a',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                  onClick={() => { setActiveConversation(null); setMessages([]); }}
                  style={{ background: 'none', color: 'white', cursor: 'pointer', padding: '0.4rem', border: 'none', display: 'flex' }}
                >
                  <ChevronLeft size={20} />
                </button>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: activeConversation.car?.image_url ? 'black' : 'rgba(255,255,255,0.05)',
                    flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-gold)'
                  }}>
                    {activeConversation.car?.image_url
                      ? <img src={activeConversation.car.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <User size={18} color="var(--accent-gold)" />
                    }
                  </div>
                  <div style={{ position: 'absolute', bottom: -2, right: -2, width: '12px', height: '12px', background: '#22c55e', borderRadius: '50%', border: '2px solid #000' }} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {getDisplayName(activeConversation)}
                    {activeConversation.vendor?.id && <BadgeCheck size={14} color="var(--accent-gold)" />}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#22c55e', fontWeight: 600 }}>Online</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', color: 'rgba(255,255,255,0.7)' }}>
                <Phone size={18} style={{ cursor: 'pointer' }} />
                <Video size={20} style={{ cursor: 'pointer' }} />
                <MoreVertical size={20} style={{ cursor: 'pointer', color: 'var(--accent-gold)' }} />
              </div>
            </div>

            {/* Pinned Context Banner */}
            {activeConversation.car && (
              <div style={{ padding: '1rem', background: '#111', borderBottom: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  {activeConversation.car.image_url ? (
                    <div style={{ width: '70px', height: '45px', borderRadius: '0.4rem', overflow: 'hidden', background: '#222', flexShrink: 0 }}>
                      <img src={activeConversation.car.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ width: '70px', height: '45px', borderRadius: '0.4rem', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Car size={20} color="var(--accent-gold)" />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{activeConversation.car.make} {activeConversation.car.model}</div>
                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{activeConversation.car.year} • Automatic • Petrol</div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--accent-gold)', marginTop: '2px' }}>₦{parseInt(activeConversation.car.price || '0').toLocaleString()}</div>
                  </div>
                </div>
                <button style={{ background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}>
                  View Listing
                </button>
              </div>
            )}

            {/* Safety Toast */}
            <div style={{ margin: '1rem', background: 'rgba(197,160,89,0.05)', border: '1px solid rgba(197,160,89,0.2)', borderRadius: '0.6rem', padding: '0.8rem 1rem', display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
              <ShieldAlert size={18} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
                For your safety, keep all conversations within Transhub. Never pay or share personal details outside the platform.
              </div>
              <X size={16} color="rgba(255,255,255,0.4)" style={{ cursor: 'pointer', flexShrink: 0 }} />
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 1.25rem 1.25rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', scrollbarWidth: 'none' }}>
              <div style={{ textAlign: 'center', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', margin: '1rem 0' }}>Today</div>
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
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      alignSelf: isOwn ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.3rem',
                      alignItems: isOwn ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {!isOwn && (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-gold)', marginBottom: '-0.5rem', zIndex: 1, marginLeft: '-0.5rem' }}>
                         <User size={14} color="var(--accent-gold)" />
                      </div>
                    )}
                    <div style={{
                        padding: '0.8rem 1rem',
                        borderRadius: isOwn ? '0.8rem 0.8rem 0.1rem 0.8rem' : '0.8rem 0.8rem 0.8rem 0.1rem',
                        background: isOwn ? 'var(--accent-gold)' : '#222',
                        color: isOwn ? '#000' : '#fff',
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        fontWeight: isOwn ? 600 : 500,
                        marginLeft: !isOwn ? '1rem' : 0,
                        marginRight: isOwn ? '0' : 0,
                        position: 'relative'
                      }}>
                      {msg.image_url && (
                        <div style={{ marginBottom: '0.5rem', borderRadius: '0.4rem', overflow: 'hidden', maxWidth: '100%' }}>
                          <img src={msg.image_url} alt="Shared" style={{ width: '100%', display: 'block' }} />
                        </div>
                      )}
                      {msg.text}
                    </div>
                    
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: !isOwn ? '1.2rem' : 0 }}>
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }).replace('about ', '').replace(' minutes', 'm').replace(' hours', 'h')}
                      {isOwn && <CheckCheck size={12} color="var(--accent-gold)" />}
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
                padding: '1rem',
                borderTop: '1px solid rgba(255,255,255,0.03)',
                display: 'flex',
                gap: '0.8rem',
                alignItems: 'center',
                flexShrink: 0,
                background: '#050505'
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
                  width: '36px', height: '36px', borderRadius: '0.4rem', border: '1px solid var(--accent-gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
                }}
              >
                <div style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', fontWeight: 300, marginTop: '-2px' }}>+</div>
              </label>
              
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSend(e as any); }}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '2rem',
                    padding: '0.8rem 2.8rem 0.8rem 1rem',
                    color: 'white',
                    outline: 'none',
                    fontSize: '0.85rem',
                  }}
                />
                <Smile size={18} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', right: '1rem', cursor: 'pointer' }} />
              </div>

              <button
                type="submit"
                disabled={!newMessage.trim()}
                style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: newMessage.trim() ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: newMessage.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', flexShrink: 0
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'translateX(1px)' }}>
                  <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill={newMessage.trim() ? '#000' : 'rgba(255,255,255,0.3)'}/>
                </svg>
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
