import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, User, ChevronLeft, Car, Loader, MessageSquarePlus, MoreVertical, BadgeCheck, Search, Phone, Video, CheckCheck, Image } from 'lucide-react';
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

      if (carId || vendorId) {
        const conv = await chatService.startConversation(carId || null, userId, vendorId || null);
        setActiveConversation(conv);
        
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
    <div className="w-full flex overflow-hidden border border-glass-border rounded-xl bg-surface-container-lowest" style={{ height }}>
      
      {/* Sidebar Panel: Conversations List */}
      <div 
        className={`${
          activeConversation ? 'hidden md:flex' : 'flex'
        } w-full md:w-96 flex-col border-r border-glass-border overflow-hidden shrink-0 bg-surface-container/20`}
      >
        {/* Panel Header */}
        <div className="p-5 flex justify-between items-center text-left">
          <h2 className="font-headline-md text-xl font-bold text-on-surface">Conversations</h2>
          <div className="flex gap-3 text-luxury-gold">
            <button className="hover:text-primary transition-colors"><MessageSquarePlus size={20} /></button>
            <button className="hover:text-primary transition-colors"><MoreVertical size={20} /></button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2 bg-surface border border-glass-border/60 rounded-lg px-3 py-2">
            <Search size={16} className="text-on-surface-variant/60" />
            <input 
              type="text" 
              placeholder="Search chats..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xs text-on-surface w-full p-0"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-5 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {['All', 'Buyers', 'Sellers'].map(f => {
            const isActive = activeFilter === f;
            return (
              <button 
                key={f}
                onClick={() => setActiveFilter(f as any)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[10px] uppercase font-bold tracking-wider border transition-all ${
                  isActive 
                    ? 'border-luxury-gold bg-luxury-gold/5 text-luxury-gold' 
                    : 'border-glass-border/60 text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto divide-y divide-glass-border/30">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader size={20} className="animate-spin text-luxury-gold" /></div>
          ) : conversations.length === 0 ? (
            <div className="py-20 text-center text-on-surface-variant/60">
              <MessageSquare size={36} className="mx-auto opacity-30 mb-3" />
              <p className="text-xs">No active chats.</p>
            </div>
          ) : (
            conversations
              .filter(c => getDisplayName(c).toLowerCase().includes(searchQuery.toLowerCase()))
              .map(conv => {
                const isSelected = activeConversation?.id === conv.id;
                const isOnline = conv.id.length % 2 === 0;

                return (
                  <button 
                    key={conv.id}
                    onClick={() => setActiveConversation(conv)}
                    className={`w-full p-4 flex gap-3 text-left transition-colors ${
                      isSelected ? 'bg-surface-variant/40' : 'hover:bg-surface-variant/20'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full bg-surface-container border border-glass-border flex items-center justify-center overflow-hidden">
                        {conv.car?.image_url ? (
                          <img src={conv.car.image_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <User size={18} className="text-luxury-gold" />
                        )}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${isOnline ? 'bg-green-500' : 'bg-zinc-600'}`}></div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h4 className="font-bold text-xs text-on-surface truncate flex items-center gap-1">
                          {getDisplayName(conv)}
                          {conv.vendor?.id && <BadgeCheck size={13} className="text-luxury-gold" />}
                        </h4>
                        <span className="text-[9px] text-on-surface-variant">
                          {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: false }).replace('about ', '')}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant truncate">
                        {conv.last_message || 'Start conversation...'}
                      </p>
                      {conv.car && (
                        <div className="text-[9px] font-bold text-luxury-gold tracking-wide mt-1.5 uppercase truncate flex items-center gap-1">
                          <Car size={10} /> {conv.car.make} {conv.car.model}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-surface-container/10 overflow-hidden">
        {activeConversation ? (
          <>
            {/* Chat header bar */}
            <div className="p-4 border-b border-glass-border flex justify-between items-center bg-surface-container-lowest shrink-0">
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setActiveConversation(null)}
                  className="md:hidden w-8 h-8 rounded-full border border-glass-border flex items-center justify-center text-on-surface hover:text-luxury-gold"
                >
                  <ChevronLeft size={16} />
                </button>
                
                <div className="relative">
                  <div className="w-10 h-10 rounded-full border border-glass-border overflow-hidden bg-surface-container flex items-center justify-center">
                    {activeConversation.car?.image_url ? (
                      <img src={activeConversation.car.image_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User size={16} className="text-luxury-gold" />
                    )}
                  </div>
                </div>

                <div className="text-left">
                  <h3 className="font-bold text-xs text-on-surface flex items-center gap-1">
                    {getDisplayName(activeConversation)}
                    {activeConversation.vendor?.id && <BadgeCheck size={14} className="text-luxury-gold" />}
                  </h3>
                  <span className="text-[9px] text-green-500 font-bold block uppercase tracking-wider">ACTIVE ONLINE</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-on-surface-variant">
                <button className="hover:text-luxury-gold"><Phone size={16} /></button>
                <button className="hover:text-luxury-gold"><Video size={18} /></button>
              </div>
            </div>

            {/* Context details banner */}
            {activeConversation.car && (
              <div className="p-3 bg-surface-container-low border-b border-glass-border flex justify-between items-center text-left">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-8 rounded bg-black/40 border border-glass-border overflow-hidden shrink-0">
                    <img src={activeConversation.car.image_url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-on-surface">{activeConversation.car.make} {activeConversation.car.model}</h4>
                    <span className="text-[10px] text-luxury-gold font-bold">₦{parseInt(activeConversation.car.price || '0').toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Messages box list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col scrollbar-hide bg-surface-container-lowest/30">
              
              <div className="text-[9px] font-label-caps font-bold tracking-widest text-on-surface-variant/40 text-center uppercase my-2">
                Security Checklist: Deal Verification Locked
              </div>

              {messages.map(msg => {
                const isOwn = msg.sender_id === userId;
                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${
                      isOwn ? 'align-self-end items-end ml-auto' : 'align-self-start items-start mr-auto'
                    }`}
                  >
                    <div 
                      className={`p-3 rounded-lg text-xs leading-relaxed text-left ${
                        isOwn 
                          ? 'bg-luxury-gold text-black rounded-br-none font-semibold' 
                          : 'bg-surface-container border border-glass-border/40 text-on-surface rounded-bl-none'
                      }`}
                    >
                      {msg.image_url && (
                        <div className="rounded-lg overflow-hidden mb-2">
                          <img src={msg.image_url} className="w-full object-cover" alt="" />
                        </div>
                      )}
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-on-surface-variant/50 mt-1 flex items-center gap-1">
                      {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true }).replace('about ', '')}
                      {isOwn && <CheckCheck size={11} className="text-luxury-gold" />}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat inputs footer */}
            <form onSubmit={handleSend} className="p-3 border-t border-glass-border bg-surface-container-lowest flex items-center gap-3 shrink-0">
              <input 
                type="file" 
                id="msg-img-input"
                className="hidden"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !activeConversation) return;
                  try {
                    setLoading(true);
                    const publicUrl = await chatService.uploadChatImage(file);
                    const sent = await chatService.sendMessage({
                      conversation_id: activeConversation.id,
                      sender_id: userId,
                      text: '',
                      image_url: publicUrl
                    });
                    setMessages(prev => [...prev, sent]);
                  } catch (err) {
                    console.error(err);
                    alert('Attachment upload failed.');
                  } finally {
                    setLoading(false);
                  }
                }}
              />
              
              <label 
                htmlFor="msg-img-input"
                className="w-10 h-10 border border-glass-border/60 hover:border-luxury-gold/50 rounded-full flex items-center justify-center text-luxury-gold cursor-pointer transition-colors"
              >
                <Image size={16} />
              </label>

              <div className="flex-1 relative flex items-center">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type secure message..."
                  className="w-full bg-surface border border-glass-border/60 focus:ring-1 focus:ring-luxury-gold rounded-full pl-4 pr-10 py-2.5 text-xs text-on-surface outline-none"
                />
              </div>

              <button 
                type="submit"
                disabled={!newMessage.trim()}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  newMessage.trim() 
                    ? 'bg-luxury-gold text-black' 
                    : 'bg-surface-container text-on-surface-variant/40'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="translate-x-0.5">
                  <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant/40 gap-3 py-20">
            <MessageSquare size={44} className="opacity-20" />
            <p className="text-xs">Select active conversation channel to start inquiry.</p>
          </div>
        )}
      </div>

    </div>
  );
};
