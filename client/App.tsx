import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar.tsx';
import { Inventory } from './components/Inventory.tsx';
import { InquiryForm } from './components/Forms.tsx';
import { VehicleDetail } from './components/VehicleDetail.tsx';
import { DiscoveryGallery } from './components/DiscoveryGallery.tsx';
import { AuthForm } from './components/AuthForms.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { Preorder } from './components/Preorder.tsx';
import { VendorProfile } from './components/VendorProfile.tsx';
import { Services } from './components/Services.tsx';
import { Footer } from './components/Footer.tsx';
import { InstallPrompt } from '../shared/components/InstallPrompt.tsx';
import { AuthProvider, useAuth } from '../shared/lib/AuthContext.tsx';
import { ThemeProvider } from '../shared/context/ThemeContext.tsx';
import { AlertProvider } from '../shared/context/AlertContext.tsx';
import { MaintenanceGuard } from '../shared/components/MaintenanceGuard.tsx';
import { ChatSystem } from '../shared/components/ChatSystem.tsx';
import type { Car } from '../shared/lib/db.ts';

function LogoBackground() {
  const columns = Array.from({ length: 20 });
  return (
    <div className="logo-column-container">
      {columns.map((_, i) => (
        <div 
          key={i} 
          className={`logo-column ${i % 2 === 0 ? 'logo-move-up' : 'logo-move-down'}`} 
        />
      ))}
    </div>
  );
}

function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'preorder' | 'services'>('home');
  const [showInquiry, setShowInquiry] = useState<{ type: 'Inspection' | 'Purchase' | 'Preorder', carName?: string } | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);

  const [showProfile, setShowProfile] = useState(false);
  const [discoveryFilter, setDiscoveryFilter] = useState<{ type: 'body' | 'brand', value: string } | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const { user, profile, signOut } = useAuth();
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const handleSelectCar = (e: any) => {
      setSelectedCar(e.detail.car);
    };
    window.addEventListener('select-car', handleSelectCar);
    return () => window.removeEventListener('select-car', handleSelectCar);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Animated Logo Background (Global) */}
      <LogoBackground />
      
      <Navbar 
        onAdminToggle={() => window.location.href = '/admin.html'} 
        isAdmin={isAdmin} 
        onAuthClick={() => setShowAuth('login')}
        onProfileClick={() => setShowProfile(true)}
        user={user}
        onSignOut={signOut}
        currentView={currentView}
        onViewChange={setCurrentView}
        onSearch={(query) => {
          setGlobalSearchQuery(query);
          if (currentView !== 'home') setCurrentView('home');
          setTimeout(() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }}
      />
      
      <main>
        {currentView === 'home' && (
          <>
            {/* Hero Section */}
            <section className="animate-fade-in" style={{ 
              position: 'relative',
              minHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem',
              paddingTop: '100px',
              overflow: 'hidden',
              background: 'var(--bg-deep)'
            }}>
              {/* Subtle Background Image */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'url("https://images.unsplash.com/photo-1619767886558-efdc259cde1a?q=80&w=2070&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 'var(--hero-img-opacity)',
                zIndex: -1
              }} />
              
              {/* Elite Gradient Mask */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'var(--hero-overlay-gradient)',
                zIndex: -1,
                mixBlendMode: 'multiply',
                opacity: 'var(--hero-mask-opacity)'
              }} />
              
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60vw',
                height: '60vh',
                background: 'var(--hero-ambient-glow)',
                zIndex: -1,
                filter: 'blur(60px)',
                opacity: 'var(--hero-glow-opacity)'
              }} />

              {/* Animated Lines */}
              <div className="animated-line line-up" style={{ left: '15%' }} />
              <div className="animated-line line-down" style={{ right: '15%' }} />

              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 1, ease: "easeOut" }} 
                style={{ 
                  maxWidth: '900px', 
                  textAlign: 'center',
                  background: 'var(--hero-text-bg)',
                  backdropFilter: 'var(--hero-text-blur)',
                  padding: 'clamp(2rem, 8vw, 4rem)',
                  borderRadius: '2rem',
                  border: '1px solid var(--hero-text-border)',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <h1 className="luxury-font" style={{ 
                  fontSize: 'min(15vw, 10rem)', 
                  lineHeight: 0.9, 
                  marginBottom: '1.5rem',
                  color: 'var(--text-main)',
                  fontWeight: 800,
                  textShadow: '0 0 40px rgba(0,0,0,0.1)'
                }}>
                  Transhub<span style={{ color: 'var(--accent-gold)' }}>.</span>
                </h1>
                <p style={{ 
                  color: 'var(--text-main)', 
                  fontSize: 'min(1.5rem, 4vw)', 
                  opacity: 0.9,
                  maxWidth: '800px', 
                  margin: '0 auto 3rem',
                  lineHeight: '1.6',
                  fontWeight: 500,
                  letterSpacing: '0.01em'
                }}>
                  Elevating the automotive experience with a premium selection of curated preorders and readily available luxury vehicles.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                  <button className="btn-gold" onClick={() => setShowInquiry({ type: 'Preorder' })}>
                    {user ? 'PREORDER NOW' : 'SIGN UP TO ORDER'}
                  </button>
                  <button 
                    className="smooth-transition glass-hover" 
                    style={{ 
                      background: 'var(--bg-glass)', 
                      border: '1px solid var(--border-glass)', 
                      color: 'var(--text-main)', 
                      padding: '1rem 2rem', 
                      cursor: 'pointer',
                      borderRadius: '0.25rem',
                      fontWeight: 600
                    }}
                    onClick={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    VIEW CATALOG
                  </button>
                </div>
              </motion.div>
            </section>

            <section id="inventory" style={{ padding: '4rem 2rem' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Available Inventory.</h2>
                <Inventory 
                  onInquiry={(car) => setSelectedCar(car)} 
                  externalSearchQuery={globalSearchQuery}
                />
              </div>
            </section>
          </>
        )}

        {currentView === 'preorder' && (
          <Preorder onInquiry={(car) => setSelectedCar(car)} />
        )}

        {currentView === 'services' && (
          <Services />
        )}

        <Footer onDiscoverySelect={(filter) => {
          setCurrentView('home');
          setDiscoveryFilter(filter);
          setTimeout(() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' }), 100);
        }} />
      </main>

      <AnimatePresence mode="wait">
        {selectedCar && (
          <VehicleDetail 
            car={selectedCar} 
            onClose={() => setSelectedCar(null)} 
            onInquiry={() => {
              setShowInquiry({ type: 'Purchase', carName: `${selectedCar.make} ${selectedCar.model}` });
              setSelectedCar(null);
            }}
            onVendorClick={(vendorId) => {
              setSelectedVendorId(vendorId);
              setSelectedCar(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {discoveryFilter && (
          <DiscoveryGallery 
            filter={discoveryFilter}
            onClose={() => setDiscoveryFilter(null)}
            onInquiry={(car: Car) => {
              setSelectedCar(car);
              setDiscoveryFilter(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showInquiry || showAuth || showProfile || selectedVendorId) && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(10px)',
            padding: '2rem 1rem',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch'
          }}>
            {showInquiry && (
              <InquiryForm 
                type={showInquiry.type} 
                carName={showInquiry.carName} 
                onClose={() => setShowInquiry(null)} 
              />
            )}
            {showAuth && (
              <AuthForm 
                type={showAuth} 
                onSuccess={() => setShowAuth(null)} 
              />
            )}
            {showProfile && (
              <UserProfile onClose={() => setShowProfile(false)} />
            )}
            {selectedVendorId && (
              <VendorProfile 
                vendorId={selectedVendorId} 
                onClose={() => setSelectedVendorId(null)} 
              />
            )}

              <button 
                onClick={() => { setShowInquiry(null); setShowAuth(null); setShowProfile(false); }}
                style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}
              >✕</button>
          </div>
        )}
      </AnimatePresence>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Real-time Chat System */}
      <ChatSystem />
    </div>
  );
}



function App() {
  return (
    <ThemeProvider>
      <AlertProvider>
        <AuthProvider>
          <MaintenanceGuard>
            <AppContent />
          </MaintenanceGuard>
        </AuthProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
