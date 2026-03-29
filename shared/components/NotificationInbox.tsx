import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, CheckCircle, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';
import { notificationService } from '../services/notification.service';
import { useAuth } from '../lib/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import type { Notification } from '../types/notification';

export const NotificationInbox = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      loadNotifications();
      const subscription = notificationService.subscribeToNotifications(user.id, (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const [data, count] = await Promise.all([
        notificationService.getNotifications(user!.id),
        notificationService.getUnreadCount(user!.id)
      ]);
      setNotifications(data);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(user!.id);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Re-fetch count to be safe
      const count = await notificationService.getUnreadCount(user!.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} color="#4ade80" />;
      case 'warning': return <AlertTriangle size={18} color="#eab308" />;
      case 'error': return <AlertCircle size={18} color="#ef4444" />;
      default: return <Info size={18} color="var(--accent-gold)" />;
    }
  };

  if (!user) return null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Icon Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          color: isOpen ? 'var(--accent-gold)' : 'var(--text-muted)',
          cursor: 'pointer',
          padding: '0.5rem',
          position: 'relative'
        }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '0px',
            right: '2px',
            background: '#ef4444',
            color: 'white',
            fontSize: '10px',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            border: '2px solid var(--bg-deep)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </motion.button>

      {/* Dropdown Inbox */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              onClick={() => setIsOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 4000 }}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '1rem',
                width: '350px',
                maxHeight: '500px',
                background: 'var(--bg-deep)',
                border: '1px solid var(--border-glass)',
                borderRadius: '1.2rem',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                zIndex: 4001,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div style={{ 
                padding: '1.2rem', 
                borderBottom: '1px solid var(--border-glass)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>NOTIFICATIONS</div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Bell size={32} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                    <p style={{ fontSize: '0.9rem' }}>No notifications yet</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                        style={{
                          padding: '1.2rem',
                          borderBottom: '1px solid var(--border-glass)',
                          background: n.is_read ? 'transparent' : 'rgba(212, 175, 55, 0.03)',
                          cursor: 'pointer',
                          display: 'flex',
                          gap: '1rem',
                          position: 'relative'
                        }}
                      >
                        <div style={{ marginTop: '0.2rem' }}>{getIcon(n.type)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.2rem', color: n.is_read ? 'var(--text-main)' : 'white' }}>
                            {n.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                            {n.body}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', opacity: 0.6 }}>
                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleDelete(e, n.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            opacity: 0,
                            transition: 'opacity 0.2s'
                          }}
                          className="delete-notif-btn"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <style>{`
                div:hover > .delete-notif-btn { opacity: 1 !important; }
              `}</style>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
