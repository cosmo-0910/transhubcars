import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../shared/lib/AuthContext';
import VendorDashboard from './VendorDashboard.tsx';

function VendorApp() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    console.log('Vendor Portal Auth Check:', { loading, user: user?.email, role: profile?.role });
    
    // Redirect non-vendors to client portal
    if (!loading) {
      if (!user) {
        console.log('No user found, redirecting to home...');
        window.location.href = '/';
      } else if (profile && profile.role !== 'vendor') {
        console.log(`User role is ${profile.role}, not 'vendor'. Redirecting...`);
        window.location.href = '/';
      }
    }
  }, [user, profile, loading]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#000'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="luxury-font" style={{ fontSize: '2rem', marginBottom: '1rem' }}>
            Transhub
          </div>
          <div style={{ color: 'var(--text-muted)' }}>Loading vendor portal...</div>
        </div>
      </div>
    );
  }

  if (!user || profile?.role !== 'vendor') {
    return null; // Will redirect
  }

  return <VendorDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <VendorApp />
    </AuthProvider>
  );
}
