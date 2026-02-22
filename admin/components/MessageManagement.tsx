import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  User, 
  MessageSquare, 
  CarFront, 
  Send, 
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { chatService } from '../../shared/services/chat.service';
import type { Conversation, Message } from '../../mobile/src/types';
import { useAuth } from '../../shared/lib/AuthContext';
import { formatDistanceToNow } from 'date-fns';

export const MessageManagement = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConv) {
      loadMessages();
      const subscription = chatService.subscribeToMessages(selectedConv.id, (msg) => {
        setMessages(prev => [...prev, msg]);
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [selectedConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getAllConversations();
      setConversations(data);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConv) return;
    try {
      const data = await chatService.getMessages(selectedConv.id);
      setMessages(data);
      if (user) {
        chatService.markAsRead(selectedConv.id, user.id);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv || !user) return;

    try {
      await chatService.sendMessage({
        conversation_id: selectedConv.id,
        sender_id: user.id,
        text: newMessage,
      });
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(c => {
    const q = searchQuery.toLowerCase();
    const buyerName = c.buyer?.full_name?.toLowerCase() || '';
    const vendorName = c.vendor?.business_name?.toLowerCase() || c.vendor?.full_name?.toLowerCase() || '';
    const carName = `${c.car?.make} ${c.car?.model}`.toLowerCase();
    return buyerName.includes(q) || vendorName.includes(q) || carName.includes(q);
  });

  if (loading && conversations.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <Loader2 className="animate-spin" size={32} color="var(--accent-gold)" />
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 350px) 1fr', gap: '1px', background: 'var(--border-glass)', borderRadius: '1.5rem', overflow: 'hidden', height: 'calc(100vh - 250px)', border: '1px solid var(--border-glass)' }}>
      {/* Sidebar: Conv List */}
      <div style={{ background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-glass)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              placeholder="Filter communications..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input"
              style={{ width: '100%', paddingLeft: '2.8rem', fontSize: '0.85rem' }} 
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {filteredConversations.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <MessageSquare size={32} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <div style={{ fontSize: '0.8rem' }}>No matching streams</div>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const isActive = selectedConv?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConv(conv)}
                  style={{
                    width: '100%',
                    padding: '1.2rem',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    background: isActive ? 'rgba(197, 160, 89, 0.1)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    transition: '0.2s',
                    borderLeft: isActive ? '4px solid var(--accent-gold)' : '4px solid transparent'
                  }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <User size={20} color={isActive ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: isActive ? 'var(--accent-gold)' : 'white' }}>{conv.buyer?.full_name || 'Buyer'}</span>
                      {conv.updated_at && (
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 500, marginBottom: '0.4rem' }}>
                      {conv.car ? `${conv.car.make} ${conv.car.model}` : 'General Inquiry'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.last_message || 'No messages yet'}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Area: Chat */}
      <div style={{ background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column' }}>
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(197, 160, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={18} color="var(--accent-gold)'" />
                </div>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>{selectedConv.buyer?.full_name} ↔ {selectedConv.vendor?.business_name || 'Admin'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CarFront size={12} /> {selectedConv.car ? `${selectedConv.car.year} ${selectedConv.car.make} ${selectedConv.car.model}` : 'Platform Consultation'}
                  </div>
                </div>
              </div>
              <div style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={12} /> ADMIN OVERSIGHT
              </div>
            </div>

            {/* Messages List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.map((msg) => {
                const isSystem = msg.sender_id === user?.id;
                const senderName = isSystem ? 'You (Admin)' : (msg.sender_id === selectedConv.buyer_id ? selectedConv.buyer?.full_name : (selectedConv.vendor?.business_name || 'Vendor'));
                
                return (
                  <div key={msg.id} style={{ alignSelf: isSystem ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem', textAlign: isSystem ? 'right' : 'left' }}>
                      {senderName} • {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                    </div>
                    <div style={{ 
                      padding: '1rem 1.2rem', 
                      borderRadius: '1.2rem', 
                      background: isSystem ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)', 
                      color: isSystem ? 'black' : 'white',
                      border: '1px solid var(--border-glass)',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      borderBottomRightRadius: isSystem ? '0.2rem' : '1.2rem',
                      borderBottomLeftRadius: isSystem ? '1.2rem' : '0.2rem'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.1)' }}>
              <div style={{ position: 'relative', display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type an administrative message..." 
                  className="admin-input"
                  style={{ flex: 1, paddingRight: '4rem' }} 
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="btn-gold"
                  style={{ padding: '0 1.5rem', width: 'auto' }}
                >
                  <Send size={18} />
                </button>
              </div>
              <div style={{ marginTop: '0.8rem', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={10} /> Your messages will be marked as "Official Transhub Support"
              </div>
            </form>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '1.5rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={40} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h3 className="luxury-font" style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'white' }}>Imperial Communications</h3>
              <p style={{ fontSize: '0.9rem', maxWidth: '300px' }}>Select a conversation from the sidebar to engage in administrative oversight.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
