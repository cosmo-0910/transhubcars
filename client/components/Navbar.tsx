import { useState, useEffect } from 'react';
import { Search, Menu, User, LogOut, Shield, X } from 'lucide-react';
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
  currentView: 'home' | 'preorder' | 'services' | 'inventory' | 'collections' | 'brands' | 'categories' | 'messages' | 'profile' | 'vendor' | 'privacy' | 'terms';
  onViewChange: (view: 'home' | 'preorder' | 'services' | 'inventory' | 'collections' | 'brands' | 'categories' | 'messages' | 'profile' | 'vendor' | 'privacy' | 'terms') => void;
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

  const navLinks: { label: string, view: 'home' | 'preorder' | 'services' | 'inventory' | 'collections' | 'brands' | 'categories' | 'messages' | 'profile' | 'vendor' | 'privacy' | 'terms' }[] = [
    { label: 'HOME', view: 'home' },
    { label: 'INVENTORY', view: 'inventory' },
    { label: 'SOURCE', view: 'preorder' },
    { label: 'SERVICES', view: 'services' },
    { label: 'MESSAGES', view: 'messages' },
    { label: 'PROFILE', view: 'profile' },
  ];

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-glass-border shadow-sm smooth-transition ${scrolled ? 'py-3 bg-surface/95' : 'py-4'}`}>
        <div className="flex justify-between items-center w-full px-4 md:px-margin-desktop max-w-container-max mx-auto">
          
          {/* Mobile Menu Toggle & Brand */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-luxury-gold p-1 hover:opacity-85"
            >
              <Menu size={24} />
            </button>
            <div 
              onClick={() => onViewChange('home')}
              className="flex items-center gap-2 cursor-pointer active:opacity-80"
            >
              <img src="/logo.png" alt="Transhub Logo" className="h-8 w-auto" />
              <span className="font-headline-md text-headline-md font-bold tracking-tighter text-on-surface">
                TRANSHUB.
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => {
              const isActive = currentView === link.view;
              return (
                <button 
                  key={link.label} 
                  onClick={() => onViewChange(link.view)} 
                  className={`text-label-caps font-label-caps tracking-wider transition-colors duration-300 ${
                    isActive 
                      ? 'text-primary border-b-2 border-primary pb-1 font-bold' 
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Actions: Search, Theme, Auth */}
          <div className="flex items-center gap-4 md:gap-6">
            
            {/* Search Input Box */}
            <div className="hidden lg:flex items-center bg-surface-container rounded-full px-4 py-1.5 border border-glass-border">
              <Search size={16} className="text-luxury-gold mr-2" />
              <input 
                type="text"
                placeholder="Search showroom..."
                className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-on-surface-variant/50 w-36 xl:w-48 text-on-surface outline-none"
                onChange={(e) => onSearch && onSearch(e.target.value)}
              />
            </div>

            {/* Mobile / Medium Screen Search Button */}
            <div className="lg:hidden flex items-center relative">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: '180px', opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 overflow-hidden mr-2"
                  >
                    <SearchAutocomplete 
                      placeholder="SEARCH..." 
                      onSearch={(query) => {
                        if (query && onSearch) onSearch(query);
                      }}
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-on-surface-variant hover:text-primary transition-colors p-1"
              >
                <Search size={20} />
              </button>
            </div>

            <ThemeToggle />
            
            {user && <NotificationInbox />}
            
            <div className="hidden md:flex items-center">
              {user ? (
                <div className="flex items-center gap-4">
                  {isAdmin && (
                    <button 
                      onClick={onAdminToggle} 
                      className="bg-luxury-gold/10 border border-luxury-gold text-luxury-gold px-4 py-1.5 rounded-full text-label-caps font-label-caps font-bold hover:bg-luxury-gold/20 transition-all flex items-center gap-1.5"
                    >
                      <Shield size={14} />
                      <span>MANAGEMENT</span>
                    </button>
                  )}
                  
                  <div 
                    onClick={onProfileClick}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-85 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-full border border-glass-border flex items-center justify-center bg-surface-container overflow-hidden">
                      <User size={16} className="text-luxury-gold" />
                    </div>
                    <span className="text-xs font-bold tracking-wider text-on-surface uppercase">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>

                  <button 
                    onClick={onSignOut} 
                    className="text-on-surface-variant hover:text-error transition-colors p-1"
                    title="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onAuthClick}
                  className="bg-luxury-gold text-on-primary px-6 py-2 text-label-caps font-label-caps font-bold hover:opacity-90 scale-95 active:scale-90 transition-all shadow-lg shadow-luxury-gold/10"
                >
                  SIGN IN
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[10000] bg-surface flex flex-col p-8 md:hidden"
          >
            <div className="flex justify-between items-center mb-10">
              <span className="font-headline-md text-headline-md font-bold text-luxury-gold">TRANSHUB.</span>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-on-surface hover:text-luxury-gold transition-colors p-1"
              >
                <X size={28} />
              </button>
            </div>

            <div className="flex flex-col gap-6 mb-10">
              {navLinks.map(link => (
                <button 
                  key={link.label} 
                  className={`text-left text-xl font-bold tracking-wide ${
                    currentView === link.view ? 'text-luxury-gold' : 'text-on-surface-variant'
                  }`}
                  onClick={() => {
                    onViewChange(link.view);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="h-px bg-glass-border w-full mb-8" />

            <div className="mt-auto flex flex-col gap-4">
              {user ? (
                <>
                  <button 
                    onClick={() => { onProfileClick?.(); setIsMobileMenuOpen(false); }} 
                    className="text-left text-lg text-on-surface hover:text-luxury-gold transition-colors flex items-center gap-3"
                  >
                    <User size={20} className="text-luxury-gold" />
                    <span>My Profile</span>
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => { onAdminToggle(); setIsMobileMenuOpen(false); }} 
                      className="text-left text-lg text-luxury-gold hover:opacity-80 transition-colors flex items-center gap-3"
                    >
                      <Shield size={20} />
                      <span>Admin Command Center</span>
                    </button>
                  )}
                  <button 
                    onClick={() => { onSignOut?.(); setIsMobileMenuOpen(false); }}
                    className="border border-error/30 text-error hover:bg-error/10 w-full py-3 rounded-lg text-center font-bold tracking-wide mt-4"
                  >
                    SIGN OUT
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => { onAuthClick?.(); setIsMobileMenuOpen(false); }}
                  className="bg-luxury-gold text-on-primary w-full py-4 text-center font-bold tracking-wide shadow-lg shadow-luxury-gold/10"
                >
                  SIGN IN
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
