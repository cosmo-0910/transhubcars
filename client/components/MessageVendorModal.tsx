import { motion } from 'framer-motion';
import { X, MessageSquare } from 'lucide-react';
import { MessagingPanel } from './MessagingPanel';
import { useAuth } from '../../shared/lib/AuthContext';

interface MessageVendorModalProps {
  carId?: string | null;
  vendorId?: string | null;
  onClose: () => void;
}

export const MessageVendorModal = ({ carId, vendorId, onClose }: MessageVendorModalProps) => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="elite-modal-overlay"
      onClick={onClose}
      style={{ zIndex: 6000 }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        className="glass luxury-form-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '900px',
          height: 'min(85vh, 700px)',
          padding: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: '2rem',
          border: '1px solid var(--border-glass)'
        }}
      >
        {/* Header */}
        <div style={{ 
          padding: '1.5rem 2rem', 
          borderBottom: '1px solid var(--border-glass)', 
          background: 'rgba(255,255,255,0.02)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '0.8rem', 
              background: 'var(--accent-gold-soft)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <MessageSquare size={22} color="var(--accent-gold)" />
            </div>
            <div>
              <h3 className="luxury-font" style={{ fontSize: '1.4rem' }}>Vendor Correspondence</h3>
              <p style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '1.5px', marginTop: '2px' }}>
                DIRECT SECURE MESSAGING
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="glass-hover smooth-transition"
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--text-muted)', 
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '50%'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <MessagingPanel 
            userId={user.id} 
            role={user.role || 'customer'} 
            height="100%" 
            carId={carId}
            vendorId={vendorId}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};
