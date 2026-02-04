import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/Navbar.tsx';
import { Inventory } from './components/Inventory.tsx';
import { InquiryForm } from './components/Forms.tsx';
import { VehicleDetail } from './components/VehicleDetail.tsx';
import { DiscoveryGallery } from './components/DiscoveryGallery.tsx';
import { AuthForm } from './components/AuthForms.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { AuthProvider, useAuth } from '../shared/lib/AuthContext.tsx';

import type { Car } from '../shared/lib/db.ts';

function AppContent() {
  const [showInquiry, setShowInquiry] = useState<{ type: 'Inspection' | 'Purchase' | 'Preorder', carName?: string } | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [showAuth, setShowAuth] = useState<'login' | 'signup' | null>(null);

  const [showProfile, setShowProfile] = useState(false);
  const [discoveryFilter, setDiscoveryFilter] = useState<{ type: 'body' | 'brand', value: string } | null>(null);
  const { user, profile, signOut } = useAuth();
  const isAdmin = profile?.role === 'admin';



  return (
    <div className="min-h-screen">
      <Navbar 
        onAdminToggle={() => window.location.href = '/admin.html'} 
        isAdmin={isAdmin} 
        onAuthClick={() => setShowAuth('login')}
        onProfileClick={() => setShowProfile(true)}
        user={user}
        onSignOut={signOut}
      />
      
      <main>
        {/* Hero Section */}
        <section className="animate-fade-in" style={{ 
          position: 'relative',
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          overflow: 'hidden'
        }}>
          {/* Subtle Background Image */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: 'url("https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=2070&auto=format&fit=crop")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
            zIndex: -1
          }} />
          
          {/* Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60vw',
            height: '60vh',
            background: 'radial-gradient(circle, rgba(197, 160, 89, 0.1) 0%, transparent 70%)',
            zIndex: -1,
            filter: 'blur(60px)'
          }} />

          <div style={{ maxWidth: '800px', textAlign: 'center' }}>
            <h1 className="luxury-font" style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', marginBottom: '1.5rem', lineHeight: '1' }}>
              Transhub.
            </h1>
            <p style={{ 
              textAlign: 'center', 
              color: 'var(--text-muted)', 
              maxWidth: '600px', 
              margin: '0 auto 3rem',
              fontSize: '1.1rem',
              lineHeight: '1.8',
              letterSpacing: '0.5px'
            }}>
              Elevating the automotive experience with a premium selection of curated preorders and ready-to-ship luxury vehicles.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '4rem' }}>
              <button className="btn-gold" onClick={() => setShowInquiry({ type: 'Preorder' })}>
                {user ? 'PREORDER NOW' : 'SIGN UP TO ORDER'}
              </button>
              <button 
                className="smooth-transition" 
                style={{ 
                  background: 'transparent', 
                  border: '1px solid var(--border-glass)', 
                  color: 'white', 
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
          </div>
        </section>

        <section id="inventory" style={{ padding: '4rem 2rem' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'center' }}>Available Inventory.</h2>
            <Inventory 
              onInquiry={(car) => setSelectedCar(car)} 
              onDiscoverySelect={(filter) => setDiscoveryFilter(filter)}
            />
          </div>
        </section>
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
        {(showInquiry || showAuth || showProfile) && (
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
            padding: '1rem'
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

              <button 
                onClick={() => { setShowInquiry(null); setShowAuth(null); setShowProfile(false); }}
                style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}
              >✕</button>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
