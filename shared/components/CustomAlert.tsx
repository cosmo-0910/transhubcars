import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttons?: {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
  }[];
}

export const CustomAlert: React.FC<CustomAlertProps> = ({ 
  visible, 
  title, 
  message, 
  onClose, 
  buttons 
}) => {
  const handleButtonPress = (onPress?: () => void) => {
    if (onPress) onPress();
    onClose();
  };

  const defaultButtons = [
    { text: 'OK', onPress: onClose, style: 'default' as const }
  ];

  const actionButtons = buttons && buttons.length > 0 ? buttons : defaultButtons;

  return (
    <AnimatePresence>
      {visible && (
        <div 
          className="elite-modal-overlay" 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 10000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass"
            style={{
              width: '100%',
              maxWidth: '450px',
              padding: '2.5rem',
              borderRadius: '2rem',
              border: '1px solid var(--border-glass)',
              background: 'var(--bg-form-card)',
              boxShadow: 'var(--shadow-luxury)',
              position: 'relative',
              textAlign: 'center'
            }}
          >
            {/* Elegant Close Button */}
            <button 
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: '0.3s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'var(--accent-gold-soft)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '1px solid var(--accent-gold)'
              }}>
                <AlertCircle size={32} color="var(--accent-gold)" />
              </div>
            </div>

            <h2 className="luxury-font" style={{ fontSize: '1.8rem', marginBottom: '1rem', color: 'var(--text-main)' }}>
              {title}
            </h2>
            
            <p style={{ 
              color: 'var(--text-muted)', 
              fontSize: '1rem', 
              lineHeight: '1.6', 
              marginBottom: '2.5rem',
              letterSpacing: '0.5px'
            }}>
              {message}
            </p>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              flexDirection: actionButtons.length > 2 ? 'column' : 'row'
            }}>
              {actionButtons.map((btn, index) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';
                
                return (
                  <button
                    key={index}
                    onClick={() => handleButtonPress(btn.onPress)}
                    className={!isCancel && !isDestructive ? 'btn-gold' : ''}
                    style={{
                      padding: '0.8rem 2rem',
                      borderRadius: '1rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: '0.3s',
                      flex: 1,
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      border: isCancel ? '1px solid var(--border-glass)' : 'none',
                      background: isCancel ? 'rgba(255,255,255,0.05)' : isDestructive ? '#ef4444' : (index === actionButtons.length - 1 && actionButtons.length > 1 ? 'var(--accent-gold)' : 'var(--accent-gold)'),
                      color: isCancel ? 'var(--text-main)' : isDestructive ? 'white' : 'black',
                    }}
                    onMouseEnter={(e) => {
                      if (isCancel) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                      else if (isDestructive) e.currentTarget.style.opacity = '0.9';
                    }}
                    onMouseLeave={(e) => {
                      if (isCancel) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                      else if (isDestructive) e.currentTarget.style.opacity = '1';
                    }}
                  >
                    {btn.text}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
