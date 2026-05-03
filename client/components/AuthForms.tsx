import { useState, useMemo } from 'react';
import { supabase } from '../../shared/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Smartphone, Check } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
    <path d="M17.05 20.28c-.96.7-2.21 1.72-3.76 1.72-1.52 0-2.01-.98-3.77-.98-1.78 0-2.31.96-3.72.96-1.46 0-2.81-1.2-3.69-2.55-1.8-2.74-1.38-7.14.77-9.45.98-1.05 2.1-1.68 3.14-1.68 1.09 0 1.94.67 2.68.67.72 0 1.9-.84 3.23-.84 1.15 0 2.22.42 2.97 1.15-2.73 1.64-2.28 5.6.53 7.03-.66 1.66-1.54 3.3-2.36 3.97zM12.03 5.43c-.04-1.92 1.58-3.53 3.39-3.41.22 2.13-2.18 3.93-3.39 3.41z"/>
  </svg>
);

export const AuthForm = ({ type: initialType, onSuccess }: { type: 'login' | 'signup', onSuccess?: () => void }) => {
  const [authType, setAuthType] = useState<'login' | 'signup'>(initialType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [vendorType, setVendorType] = useState<'car' | 'parts' | 'both'>('car');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const isEmailValid = useMemo(() => {
    return email.length > 3 && email.includes('@') && email.includes('.');
  }, [email]);

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
        
        if (newUser) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({ 
              id: newUser.id, 
              full_name: fullName,
              role: email.toLowerCase() === 'admin@transhub.com' ? 'admin' : 'customer',
              vendor_type: vendorType
            });
          
          if (profileError) console.error('Error creating profile:', profileError);
        }

        setMessage({ type: 'success', text: 'Verification link sent to your email.' });
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
      <div className="auth-top-icon">
        <Lock size={28} color="#c5a059" strokeWidth={1.5} />
      </div>

      <div className="auth-header">
        <motion.div
          key={authType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="luxury-font" style={{ fontSize: '1.5rem', color: 'white', marginBottom: '0.05rem' }}>
            {authType === 'login' ? 'Welcome Back 👋' : 'Join the Elite.'}
          </h2>
          <p className="auth-subtitle">
            {authType === 'login' ? 'Sign in to continue to your Transhub account' : 'Begin your acquisition journey with Transhub.'}
          </p>
        </motion.div>
      </div>

      <form onSubmit={handleAuth}>
        <AnimatePresence mode="popLayout">
          {authType === 'signup' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="auth-input-group"
            >
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User size={12} className="auth-input-icon" />
                <input 
                  type="text" 
                  required 
                  className="auth-input" 
                  placeholder="e.g. Alexander Pierce"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="auth-input-group">
          <label className="auth-label">Email Address</label>
          <div className="auth-input-wrapper">
            <Mail size={12} className="auth-input-icon" />
            <input 
              type="email" 
              required 
              className="auth-input" 
              placeholder="client@transhub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {isEmailValid && (
              <div className="auth-input-right valid">
                <CheckCircle2 size={12} />
              </div>
            )}
          </div>
        </div>

        <div className="auth-input-group">
          <label className="auth-label">Password</label>
          <div className="auth-input-wrapper">
            <Lock size={12} className="auth-input-icon" />
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              className="auth-input" 
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              className="auth-input-right" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none' }}
            >
              {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>
        </div>

        {authType === 'login' && (
          <div className="auth-checkbox-row">
            <label className="auth-checkbox">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <div className="checkbox-visual">
                <Check size={8} />
              </div>
              <span>Remember me</span>
            </label>
            <a href="#" className="auth-forgot" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
          </div>
        )}

        {authType === 'signup' && (
          <div className="auth-input-group">
            <label className="auth-label">Vendor Specialization</label>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem' }}>
              {(['car', 'parts', 'both'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVendorType(type)}
                  className={`glass ${vendorType === type ? 'active-gold' : ''}`}
                  style={{ 
                    flex: 1, 
                    padding: '0.7rem', 
                    borderRadius: '8px', 
                    fontSize: '0.65rem', 
                    fontWeight: 700,
                    border: vendorType === type ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                    background: vendorType === type ? 'rgba(191, 149, 63, 0.1)' : 'transparent',
                    color: vendorType === type ? 'var(--accent-gold)' : 'var(--text-muted)'
                  }}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}

        {message && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ 
              padding: '0.8rem', 
              borderRadius: '8px', 
              background: message.type === 'error' ? 'rgba(255, 50, 50, 0.08)' : 'rgba(50, 255, 50, 0.08)',
              color: message.type === 'error' ? '#ff6b6b' : '#63e6be',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '1.25rem'
            }}
          >
            {message.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            {message.text}
          </motion.div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="btn-auth-primary"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              {authType === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div className="auth-divider-wrap">
        <div className="auth-divider-line" />
        OR CONTINUE WITH
        <div className="auth-divider-line" />
      </div>

      <div className="auth-social-row">
        <button className="social-button-card" type="button">
          <GoogleIcon />
        </button>
        <button className="social-button-card" type="button">
          <AppleIcon />
        </button>
        <button className="social-button-card" type="button">
          <Smartphone size={18} color="#c5a059" />
          <span>OTP Login</span>
        </button>
      </div>

      <div className="auth-footer">
        {authType === 'login' ? (
          <>
            New here? 
            <span className="auth-footer-link" onClick={() => { setAuthType('signup'); setMessage(null); }}>
              Create account <ArrowRight size={12} />
            </span>
          </>
        ) : (
          <>
            Already a member? 
            <span className="auth-footer-link" onClick={() => { setAuthType('login'); setMessage(null); }}>
              Sign In <ArrowRight size={12} />
            </span>
          </>
        )}
      </div>
    </div>
  );
};
