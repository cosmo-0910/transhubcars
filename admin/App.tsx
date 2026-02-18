import { AdminDashboard } from './AdminDashboard.tsx';
import { AuthProvider, useAuth } from '../shared/lib/AuthContext.tsx';
import { ThemeProvider } from '../shared/context/ThemeContext.tsx';
import { motion } from 'framer-motion';

function AdminContent() {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="luxury-font" style={{ color: 'var(--accent-gold)', letterSpacing: '4px' }}>VERIFYING CREDENTIALS...</div>
    </div>
  );

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="luxury-font" style={{ fontSize: '8rem', color: 'var(--accent-gold)', opacity: 0.1, marginBottom: '-4rem' }}>404</h1>
          <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '1rem', position: 'relative' }}>PAGE NOT FOUND<span style={{ color: 'var(--accent-gold)' }}>.</span></h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 2rem', letterSpacing: '1px' }}>
            The requested destination does not exist or has been permanently moved from this registry.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-gold"
            style={{ padding: '1rem 2rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}
          >
            RETURN TO SHOWROOM
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminDashboard />
    </div>
  );
}

import { AlertProvider } from '../shared/context/AlertContext.tsx';

import { MaintenanceGuard } from '../shared/components/MaintenanceGuard.tsx';

function App() {
  return (
    <ThemeProvider>
      <AlertProvider>
        <AuthProvider>
          <MaintenanceGuard>
            <AdminContent />
          </MaintenanceGuard>
        </AuthProvider>
      </AlertProvider>
    </ThemeProvider>
  );
}

export default App;
