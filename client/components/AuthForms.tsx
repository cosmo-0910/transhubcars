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

  const socialLogins = [
    { icon: <Chrome size={20} className="text-blue-500" />, name: 'Google' },
    { icon: <AppleIcon size={20} />, name: 'Apple' },
    { icon: <Smartphone size={20} />, name: 'OTP Login' }
  ];

  return (
    <div className="auth-container">
      <div className="floating-shimmer" />
      
      {/* Top Lock Icon */}
      <div className="auth-top-icon">
        <Lock size={32} color="var(--accent-gold)" />
      </div>

      <div className="auth-header">
        <motion.div
          key={authType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="luxury-font" style={{ fontSize: '2.4rem', marginBottom: '0.8rem', color: 'white' }}>
            {authType === 'login' ? 'Welcome Back 👋' : 'Join the Elite.'}
          </h2>
          <p className="auth-subtitle" style={{ fontSize: '0.9rem' }}>
            {authType === 'login' ? 'Sign in to continue to your Transhub account' : 'Begin your acquisition journey with Transhub.'}
          </p>
        </motion.div>
      </div>

      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="popLayout">
          {authType === 'signup' && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="luxury-input-group"
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

        <div className="luxury-input-group">
          <label className="luxury-label">Email Address</label>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)', opacity: 0.5 }} />
            <input 
              type="email" 
              required 
              className="luxury-input" 
              placeholder="client@transhub.com"
              style={{ paddingLeft: '3.5rem', paddingRight: '3.5rem' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {isEmailValid && (
              <div className="input-icon-right" style={{ color: '#4ade80' }}>
                <CheckCircle2 size={18} />
              </div>
            )}
          </div>
        </div>

        <div className="luxury-input-group">
          <label className="luxury-label">Password</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '1.2rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)', opacity: 0.5 }} />
            <input 
              type={showPassword ? "text" : "password"} 
              required 
              className="luxury-input" 
              placeholder="••••••••••••"
              style={{ paddingLeft: '3.5rem', paddingRight: '3.5rem' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="button" 
              className="input-icon-right" 
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none' }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {authType === 'login' && (
          <div className="auth-checkbox-group">
            <label className="custom-checkbox">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <div className="checkbox-box">
                <Check size={14} />
              </div>
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
          </div>
        )}

        {authType === 'signup' && (
          <div className="luxury-input-group">
            <label className="luxury-label">Vendor Specialization</label>
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
              borderRadius: '0.75rem', 
              background: message.type === 'error' ? 'rgba(255, 50, 50, 0.08)' : 'rgba(50, 255, 50, 0.08)',
              color: message.type === 'error' ? '#ff6b6b' : '#63e6be',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              border: `1px solid ${message.type === 'error' ? 'rgba(255,50,50,0.15)' : 'rgba(50,255,50,0.15)'}`,
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
          className="btn-gold" 
          style={{ 
            height: '3.8rem', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            fontSize: '1rem',
            width: '100%',
            fontWeight: 700
          }}
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

      <div className="auth-divider" style={{ margin: '2rem 0', fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-muted)' }}>
        OR CONTINUE WITH
      </div>

      <div className="social-login-grid">
        {socialLogins.map((social) => (
          <button key={social.name} className="social-btn">
            {social.icon}
            {social.name}
          </button>
        ))}
      </div>

      <div style={{ textAlign: 'center' }}>
        {authType === 'login' ? (
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            New here? 
            <button 
              onClick={() => { setAuthType('signup'); setMessage(null); }}
              className="create-account-link"
              style={{ display: 'inline-flex', marginLeft: '0.5rem', background: 'none', border: 'none', padding: 0 }}
            >
              Create account <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Already a member? 
            <button 
              onClick={() => { setAuthType('login'); setMessage(null); }}
              className="create-account-link"
              style={{ display: 'inline-flex', marginLeft: '0.5rem', background: 'none', border: 'none', padding: 0 }}
            >
              Sign In <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
