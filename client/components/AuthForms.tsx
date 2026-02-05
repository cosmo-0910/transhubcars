import { useState } from 'react';
import { supabase } from '../../shared/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AuthForm = ({ type: initialType, onSuccess }: { type: 'login' | 'signup', onSuccess?: () => void }) => {
  const [authType, setAuthType] = useState<'login' | 'signup'>(initialType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (authType === 'signup') {
        const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        
        if (signUpError) throw signUpError;
        
        // Manual profile creation (helpful if triggers aren't set up)
        if (newUser) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: newUser.id, 
              full_name: fullName,
              role: email.toLowerCase() === 'admin@transhub.com' ? 'admin' : 'customer'
            });
          
          if (profileError) console.error('Error creating profile:', profileError);
        }

        setMessage({ type: 'success', text: 'An invitation has been sent to your email. Please verify to continue.' });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="floating-shimmer" />
      
      <div className="auth-header">
        <motion.div
          key={authType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="luxury-font auth-title" style={{ fontSize: 'clamp(2rem, 8vw, 2.5rem)' }}>
            {authType === 'login' ? 'Welcome Back.' : 'Join the Elite.'}
          </h2>
          <p className="auth-subtitle" style={{ letterSpacing: '1px' }}>
            {authType === 'login' ? 'Access your private automotive portfolio.' : 'Begin your acquisition journey with Transhub.'}
          </p>
        </motion.div>
      </div>

      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <AnimatePresence mode="popLayout">
          {authType === 'signup' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="luxury-input-group"
              style={{ marginBottom: '1rem' }}
            >
              <label className="luxury-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)', opacity: 0.5 }} />
                <input 
                  type="text" 
                  required 
                  className="luxury-input" 
                  placeholder="e.g. Alexander Pierce"
                  style={{ paddingLeft: '3.5rem' }}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="luxury-input-group" style={{ marginBottom: '1.25rem' }}>
          <label className="luxury-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)', opacity: 0.5 }} />
            <input 
              type="email" 
              required 
              className="luxury-input" 
              placeholder="client@transhub.com"
              style={{ paddingLeft: '3.5rem' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="luxury-input-group" style={{ marginBottom: '1rem' }}>
          <label className="luxury-label">Secure Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)', opacity: 0.5 }} />
            <input 
              type="password" 
              required 
              className="luxury-input" 
              placeholder="••••••••••••"
              style={{ paddingLeft: '3.5rem' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              padding: '1.25rem', 
              borderRadius: '1rem', 
              background: message.type === 'error' ? 'rgba(255, 50, 50, 0.08)' : 'rgba(50, 255, 50, 0.08)',
              color: message.type === 'error' ? '#ff6b6b' : '#63e6be',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: `1px solid ${message.type === 'error' ? 'rgba(255,50,50,0.15)' : 'rgba(50,255,50,0.15)'}`,
              marginBottom: '1rem'
            }}
          >
            {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            {message.text}
          </motion.div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="btn-gold" 
          style={{ 
            height: '4rem', 
            marginTop: '1rem', 
            letterSpacing: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            borderRadius: '1rem',
            fontSize: '0.9rem'
          }}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              {authType === 'login' ? 'ENTER THE HUB' : 'CREATE PORTFOLIO'}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="auth-divider">OR</div>

      <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p className="auth-subtitle">
          {authType === 'login' ? "Don't have an account?" : "Already a member?"}
          <button 
            type="button"
            onClick={() => {
              setAuthType(authType === 'login' ? 'signup' : 'login');
              setMessage(null);
            }}
            className="auth-toggle-btn"
          >
            {authType === 'login' ? 'Register Now' : 'Sign In'}
          </button>
        </p>

        {authType === 'login' && (
          <button
            type="button"
            onClick={() => {
              setEmail('admin@transhub.com');
              setPassword('p0p0p0');
            }}
            style={{
              background: 'var(--accent-gold-soft)',
              border: '1px solid var(--border-glass)',
              color: 'var(--accent-gold)',
              padding: '0.6rem',
              borderRadius: '0.5rem',
              fontSize: '0.7rem',
              letterSpacing: '2px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: '0.3s'
            }}
            className="glass-hover"
          >
            FAST-TRACK ADMIN ACCESS
          </button>
        )}
      </div>
    </div>
  );
};
