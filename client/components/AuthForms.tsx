import { useState, useMemo } from 'react';
import { supabase } from '../../shared/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Smartphone, Chrome, Apple as AppleIcon, Check } from 'lucide-react';

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
      {/* Top Lock Icon */}
      <div className="auth-top-icon">
        <Lock size={30} color="#c5a059" strokeWidth={1.5} />
      </div>

      <div className="auth-header">
        <motion.div
          key={authType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="luxury-font" style={{ fontSize: '2.2rem', color: 'white', marginBottom: '0.2rem' }}>
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
                <User size={18} className="auth-input-icon" />
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
            <Mail size={18} className="auth-input-icon" />
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
                <CheckCircle2 size={18} />
              </div>
            )}
          </div>
        </div>

        <div className="auth-input-group">
          <label className="auth-label">Password</label>
          <div className="auth-input-wrapper">
            <Lock size={18} className="auth-input-icon" />
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
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                <Check size={14} />
              </div>
              <span>Remember me</span>
            </label>
            <a href="#" className="auth-forgot" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
          </div>
        )}

        {authType === 'signup' && (
          <div className="auth-input-group">
            <label className="auth-label">Vendor Specialization</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              {(['car', 'parts', 'both'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setVendorType(type)}
                  className={`glass ${vendorType === type ? 'active-gold' : ''}`}
                  style={{ 
                    flex: 1, 
                    padding: '0.8rem', 
                    borderRadius: '0.5rem', 
                    fontSize: '0.7rem', 
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
              padding: '1rem', 
              borderRadius: '10px', 
              background: message.type === 'error' ? 'rgba(255, 50, 50, 0.08)' : 'rgba(50, 255, 50, 0.08)',
              color: message.type === 'error' ? '#ff6b6b' : '#63e6be',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '1.5rem'
            }}
          >
            {message.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {message.text}
          </motion.div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="btn-auth-primary"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              {authType === 'login' ? 'Sign In' : 'Create Account'}
              <ArrowRight size={20} />
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
          <Chrome size={20} color="#4285F4" />
        </button>
        <button className="social-button-card" type="button">
          <AppleIcon size={20} color="white" />
        </button>
        <button className="social-button-card" type="button">
          <Smartphone size={20} color="#c5a059" />
          <span>OTP Login</span>
        </button>
      </div>

      <div className="auth-footer">
        {authType === 'login' ? (
          <>
            New here? 
            <span className="auth-footer-link" onClick={() => { setAuthType('signup'); setMessage(null); }}>
              Create account <ArrowRight size={14} />
            </span>
          </>
        ) : (
          <>
            Already a member? 
            <span className="auth-footer-link" onClick={() => { setAuthType('login'); setMessage(null); }}>
              Sign In <ArrowRight size={14} />
            </span>
          </>
        )}
      </div>
    </div>
  );
};
