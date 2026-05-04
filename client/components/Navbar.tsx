import { useState, useEffect } from 'react';
import { Car, Search, Menu, User, LogOut, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchAutocomplete from '../../shared/components/SearchAutocomplete';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
import { NotificationInbox } from '../../shared/components/NotificationInbox';

interface NavbarProps {
  onAdminToggle: () => void;
  isAdmin: boolean;
  onAuthClick?: () => void;
  onProfileClick?: () => void;
  user?: any | null;
  onSignOut?: () => void;
  currentView: 'home' | 'preorder' | 'services' | 'inventory' | 'collections' | 'brands' | 'categories' | 'messages' | 'profile' | 'vendor';
  onViewChange: (view: 'home' | 'preorder' | 'services' | 'inventory' | 'collections' | 'brands' | 'categories' | 'messages' | 'profile' | 'vendor') => void;
  onSearch?: (query: string) => void;
}

export const Navbar = ({ onAdminToggle, isAdmin, onAuthClick, onProfileClick, user, onSignOut, currentView, onViewChange, onSearch }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: { label: string, view: 'home' | 'preorder' | 'services' | 'inventory' | 'collections' | 'brands' | 'categories' | 'messages' | 'profile' | 'vendor' }[] = [
    { label: 'HOME', view: 'home' },
    { label: 'INVENTORY', view: 'inventory' },
    { label: 'PREORDER', view: 'preorder' },
    { label: 'SERVICES', view: 'services' },
    { label: 'MESSAGES', view: 'messages' },
    { label: 'PROFILE', view: 'profile' },
  ];

  return (
    <>
      <nav 
        className={`glass smooth-transition ${scrolled ? 'navbar-scrolled' : ''}`} 
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 1000,
          padding: '1.4rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          borderBottom: scrolled ? '1px solid rgba(197,160,89,0.1)' : '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div className="mobile-only-flex" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={20} color="var(--accent-gold)" />
        </div>

        {/* Brand Area */}
        <div 
          onClick={() => onViewChange('home')}
          className="navbar-brand-group"
        >
          <img src="/logo.png" alt="Transhub Logo" style={{ height: '32px', width: 'auto' }} />
          <span className="luxury-font brand-text" style={{ fontSize: '1.4rem', letterSpacing: '2px', fontWeight: 800 }}>
            TRANSHUB<span style={{ color: 'var(--accent-gold)' }}>.</span>
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav" style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
          {navLinks.map(link => (
            <button 
              key={link.label} 
              onClick={() => onViewChange(link.view)} 
              className={`nav-link ${currentView === link.view ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Functional Icons & Auth */}
        <div className="navbar-actions-group" style={{ display: 'flex', gap: '1.8rem', alignItems: 'center' }}>
          <div className="desktop-flex" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <AnimatePresence>
              {isSearchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: '250px', opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  style={{ overflow: 'hidden', marginRight: '1rem' }}
                >
                  <SearchAutocomplete 
                    placeholder="SEARCH MODELS..." 
                    onSearch={(query) => {
                      if (query) {
                        if (onSearch) onSearch(query);
                      }
                    }}
                    autoFocus
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>
            <Search 
              size={20} 
              color={isSearchOpen ? 'var(--accent-gold)' : 'var(--text-muted)'} 
              style={{ cursor: 'pointer' }} 
              className="smooth-transition" 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            />
          </div>

          <div className="desktop-flex"><ThemeToggle /></div>
          
          {user && <NotificationInbox />}
          
          <div className="desktop-nav">
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {isAdmin && (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    onClick={onAdminToggle} 
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold)', background: 'var(--accent-gold-soft)', padding: '0.4rem 0.8rem', borderRadius: '2rem' }}
                  >
                    <Shield size={16} />
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px' }}>MANAGEMENT</span>
                  </motion.div>
                )}
                
                <div 
                  onClick={onProfileClick}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', cursor: 'pointer' }}
                >
                  <div className="glass" style={{ width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--accent-gold)' }}>
                    <User size={16} color="var(--accent-gold)" />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1.5px', color: 'var(--text-main)' }}>
                    {user.email?.split('@')[0].toUpperCase()}
                  </span>
                </div>

                <div className="glass" style={{ height: '20px', width: '1px' }}></div>

                <motion.button 
                  whileHover={{ x: 3 }}
                  onClick={onSignOut} 
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <LogOut size={18} />
                </motion.button>
              </div>
            ) : (
              <button 
                onClick={onAuthClick}
                className="btn-gold luxury-font" 
                style={{ padding: '0.6rem 1.8rem', fontSize: '0.75rem', letterSpacing: '2px', borderRadius: '0' }}
              >
                SIGN IN
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Fullscreen Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="mobile-menu-overlay"
          >
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <X size={32} />
            </button>

            <Car size={64} color="var(--accent-gold)" style={{ marginBottom: '2rem' }} />

            {navLinks.map(link => (
              <button 
                key={link.label} 
                className={`nav-link luxury-font ${currentView === link.view ? 'active' : ''}`} 
                style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => {
                  onViewChange(link.view);
                  setIsMobileMenuOpen(false);
                }}
              >
                {link.label}
              </button>
            ))}

            <div style={{ padding: '1px', background: 'var(--accent-gold-soft)', width: '60%', margin: '1rem 0' }}></div>

            {user ? (
              <>
                <div onClick={onProfileClick} style={{ color: 'white', fontSize: '1rem', letterSpacing: '2px', fontWeight: 600 }}>MY ACQUISITIONS</div>
                {isAdmin && <div onClick={onAdminToggle} style={{ color: 'var(--accent-gold)', fontSize: '1rem', letterSpacing: '2px', fontWeight: 600 }}>ADMIN PORTAL</div>}
                <button 
                  onClick={() => { onSignOut?.(); setIsMobileMenuOpen(false); }}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', padding: '0.8rem 2rem', letterSpacing: '2px' }}
                >
                  SIGN OUT
                </button>
              </>
            ) : (
              <button 
                onClick={() => { onAuthClick?.(); setIsMobileMenuOpen(false); }}
                className="btn-gold"
                style={{ width: '200px' }}
              >
                SIGN IN
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
