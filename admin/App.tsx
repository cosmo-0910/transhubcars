import { AdminDashboard } from './AdminDashboard.tsx';
import { AuthProvider, useAuth } from '../shared/lib/AuthContext.tsx';
import { AuthForm } from '../client/components/AuthForms.tsx';
import { ThemeProvider } from '../shared/context/ThemeContext.tsx';

function AdminContent() {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="luxury-font" style={{ color: 'var(--accent-gold)', letterSpacing: '4px' }}>VERIFYING CREDENTIALS...</div>
    </div>
  );

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>SECURE ACCESS<span style={{ color: 'var(--accent-gold)' }}>.</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Administrative credentials required to proceed.</p>
        </div>
        <AuthForm type="login" />
        <button 
          onClick={() => window.location.href = '/'}
          style={{ marginTop: '2rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '2px' }}
        >
          RETURN TO SHOWROOM
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminDashboard />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AdminContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
