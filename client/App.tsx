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
import { MessagingPanel } from './components/MessagingPanel.tsx';
import { Services } from './components/Services.tsx';
import { Footer } from './components/Footer.tsx';
import { HomeSections } from './components/HomeSections.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { MessageVendorModal } from './components/MessageVendorModal.tsx';
import { BrandsPage } from './components/BrandsPage.tsx';
import { CollectionsPage } from './components/CollectionsPage.tsx';
import { CategoriesPage } from './components/CategoriesPage.tsx';
import { VendorApplication } from './components/VendorApplication.tsx';
import { LegalPages } from './components/LegalPages.tsx';
import SEO from './components/SEO.tsx';

import { InstallPrompt } from '../shared/components/InstallPrompt.tsx';
import { AuthProvider, useAuth } from '../shared/lib/AuthContext.tsx';
import { ThemeProvider } from '../shared/context/ThemeContext.tsx';
import { AlertProvider } from '../shared/context/AlertContext.tsx';
import { MaintenanceGuard } from '../shared/components/MaintenanceGuard.tsx';
import { ChatSystem } from '../shared/components/ChatSystem.tsx';
import type { Car } from '../shared/lib/db.ts';

function AppContent() {
  const [currentView, setCurrentView] = useState<'home' | 'preorder' | 'services' | 'inventory' | 'collections' | 'brands' | 'categories' | 'messages' | 'profile' | 'vendor' | 'privacy' | 'terms'>('home');
  const [showInquiry, setShowInquiry] = useState<{ type: 'Inspection' | 'Purchase' | 'Preorder', carName?: string } | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);

  const [discoveryFilter, setDiscoveryFilter] = useState<{ type: 'body' | 'brand', value: string } | null>(null);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [chatModal, setChatModal] = useState<{ carId?: string | null, vendorId?: string | null } | null>(null);
  const [showVendorApp, setShowVendorApp] = useState(false);

  const { user, profile, signOut } = useAuth();
  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    const handleSelectCar = (e: any) => {
      setSelectedCar(e.detail.car);
    };
    const handleOpenChat = (e: any) => {
      if (window.innerWidth < 768) {
         setCurrentView('messages');
         setChatModal({ carId: e.detail.carId, vendorId: e.detail.vendorId });
      } else {
         setChatModal({ carId: e.detail.carId, vendorId: e.detail.vendorId });
      }
    };

    window.addEventListener('select-car', handleSelectCar);
    window.addEventListener('open-chat', handleOpenChat);

    return () => {
      window.removeEventListener('select-car', handleSelectCar);
      window.removeEventListener('open-chat', handleOpenChat);
    };
  }, []);

  const handleMobileNavChange = (view: any) => {
    if (view === 'sell') {
      setShowInquiry({ type: 'Preorder' });
      return;
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen" style={{ background: '#000' }}>
      
      <SEO 
        title={currentView === 'home' ? 'The Elite Collection' : currentView.charAt(0).toUpperCase() + currentView.slice(1)} 
        description={
          currentView === 'preorder' 
            ? 'Preorder your dream luxury car from our global network of verified vendors.' 
            : currentView === 'services'
            ? 'Professional automotive services including maintenance, logistics, and inspections.'
            : undefined
        }
      />
      
      {currentView !== 'vendor' && (
        <Navbar 
          onAdminToggle={() => window.location.href = '/admin.html'} 
          isAdmin={isAdmin} 
          onAuthClick={() => setShowAuth('login')}
          onProfileClick={() => setCurrentView('profile')}
          user={user}
          onSignOut={signOut}
          currentView={currentView}
          onViewChange={(view) => {
            setCurrentView(view);
            window.scrollTo(0, 0);
          }}
          onSearch={(query) => {
            setGlobalSearchQuery(query);
            if (currentView !== 'inventory') setCurrentView('inventory');
          }}
        />
      )}
      
      <main style={{ paddingTop: currentView === 'vendor' ? 0 : '0' }}>
        {currentView === 'home' && (
          <>
            {/* Elevated Hero Redesign */}
            <Hero 
              onBrowse={() => { setCurrentView('inventory'); window.scrollTo(0, 0); }} 
              onPreorder={() => setShowInquiry({ type: 'Preorder' })} 
            />

            <section id="inventory-preview" style={{ padding: '4rem 2rem' }}>
              <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
                   setCurrentView('categories');
                } else {
                   setDiscoveryFilter({ type: 'body', value: cat });
                }
              }} 
              onViewAllBrands={() => setCurrentView('brands')}
            />
          </>
        )}

        {currentView === 'inventory' && (
          <section style={{ padding: '8rem 2rem' }}>
             <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
               <Inventory 
                 onInquiry={(car) => setSelectedCar(car)} 
                 externalSearchQuery={globalSearchQuery}
                 isHomeWidget={false}
                 title="The Inventory."
               />
             </div>
          </section>
        )}

        {currentView === 'collections' && (
          <CollectionsPage onClose={() => setCurrentView('home')} />
        )}

        {currentView === 'brands' && (
          <BrandsPage 
            onClose={() => setCurrentView('home')} 
            onSelectBrand={(brand) => {
               setGlobalSearchQuery(brand);
               setCurrentView('inventory');
            }}
          />
        )}

        {currentView === 'categories' && (
          <CategoriesPage 
            onClose={() => setCurrentView('home')} 
            onSelectCategory={(cat) => {
               setDiscoveryFilter({ type: 'body', value: cat });
            }}
          />
        )}

        {currentView === 'preorder' && (
          <Preorder onInquiry={(car) => setSelectedCar(car)} />
        )}

        {currentView === 'services' && (
          <Services />
        )}

        {currentView === 'messages' && (
          <div style={{ paddingTop: '5rem', height: '100vh', background: '#000' }}>
            {user ? (
               <MessagingPanel 
                 userId={user.id} 
                 role={profile?.role || 'customer'} 
                 height="calc(100vh - 5rem)"
                 carId={chatModal?.carId}
                 vendorId={chatModal?.vendorId}
               />
            ) : (
               <div style={{ padding: '8rem 2rem', textAlign: 'center' }}>
                 <h1 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Messages.</h1>
                 <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Sign in to view your conversations.</p>
                 <button onClick={() => setShowAuth('login')} className="btn-gold" style={{ padding: '1rem 2rem' }}>Sign In</button>
               </div>
            )}
          </div>
        )}

        {currentView === 'vendor' && selectedVendorId && (
          <VendorProfile 
            vendorId={selectedVendorId} 
            onClose={() => setCurrentView('home')} 
          />
        )}

        {currentView === 'profile' && (
           <UserProfile 
            onClose={() => setCurrentView('home')} 
            onApplyVendor={() => setShowVendorApp(true)}
           />
        )}

        {(currentView === 'privacy' || currentView === 'terms') && (
          <LegalPages 
            initialTab={currentView}
            onClose={() => setCurrentView('home')}
            onViewChange={(v) => setCurrentView(v)}
          />
        )}

        <Footer onViewChange={(v) => { setCurrentView(v); window.scrollTo(0, 0); }} />
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
              console.log('Navigating to vendor:', vendorId);
              setSelectedVendorId(vendorId);
              setCurrentView('vendor');
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
        {chatModal && (
          <MessageVendorModal 
            carId={chatModal.carId} 
            vendorId={chatModal.vendorId} 
            onClose={() => setChatModal(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(showInquiry || showAuth || selectedVendorId) && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
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

              <button 
                onClick={() => { setShowInquiry(null); setShowAuth(null); setSelectedVendorId(null); }}
                style={{ 
                  position: 'absolute', 
                  top: '2.5rem', 
                  right: '2.5rem', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  color: 'white', 
                  cursor: 'pointer', 
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  transition: 'all 0.3s ease'
                }}
                className="glass-hover"
              >✕</button>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showVendorApp && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <VendorApplication onClose={() => setShowVendorApp(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Real-time Chat System */}
      <ChatSystem isHidden={!!showInquiry || !!selectedCar || !!showVendorApp || currentView === 'profile' || currentView === 'messages'} />



      {/* Mobile Bottom Navigation */}
      <MobileBottomNav 
        currentView={currentView as any} 
        onViewChange={handleMobileNavChange}
      />

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
