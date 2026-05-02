import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
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
import { HomeSections } from './components/HomeSections.tsx';
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
            {/* Elevated Hero Redesign */}
            <Hero 
              onBrowse={() => document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' })} 
              onPreorder={() => setShowInquiry({ type: 'Preorder' })} 
            />

            <section id="inventory" style={{ padding: '4rem 2rem' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Available Inventory.</h2>
                <Inventory 
                  onInquiry={(car) => setSelectedCar(car)} 
                  externalSearchQuery={globalSearchQuery}
                  isHomeWidget={true}
                />
              </div>
            </section>

            <HomeSections 
              onBrowseCategory={(cat) => {
                if (cat === 'All') {
                   document.getElementById('inventory')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                   setDiscoveryFilter({ type: 'body', value: cat });
                }
              }} 
            />
          </>
        )}

        {currentView === 'preorder' && (
          <Preorder onInquiry={(car) => setSelectedCar(car)} />
        )}

        {currentView === 'services' && (
          <Services />
        )}

        <Footer />
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
