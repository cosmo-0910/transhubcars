import { useState, useMemo, useEffect } from 'react';
import { supabase } from '../../shared/lib/supabase';
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff, Check } from 'lucide-react';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const AuthForm = ({ type: initialType, onSuccess }: { type: 'login' | 'signup', onSuccess?: () => void }) => {
  const [authType, setAuthType] = useState<'login' | 'signup' | 'forgot-password' | 'update-password'>(initialType);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const isEmailValid = useMemo(() => {
    return email.length > 3 && email.includes('@') && email.includes('.');
  }, [email]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('type') === 'recovery') {
      setAuthType('update-password');
    }
  }, []);

  const handleSocialLogin = async (provider: 'google') => {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const backendUrl = import.meta.env.VITE_API_URL;

      if (backendUrl) {
        window.location.href = `${backendUrl}/api/auth/google?redirectTo=${encodeURIComponent(redirectUrl)}`;
      } else {
        // Direct Supabase OAuth redirect if VITE_API_URL is not configured
        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo: redirectUrl
          }
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (authType === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { 
              full_name: fullName
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (signUpError) throw signUpError;
        
        setMessage({ 
          type: 'success', 
          text: 'Verification link sent! Check your email to secure your account.' 
        });
      } else if (authType === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
        });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
      } else if (authType === 'update-password') {
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setMessage({ type: 'success', text: 'Password updated. Returning to sign in.' });
        setTimeout(() => setAuthType('login'), 2000);
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

  const getTitle = () => {
    switch (authType) {
      case 'login': return 'Welcome Back';
      case 'signup': return 'Join Transhub';
      case 'forgot-password': return 'Restore Access';
      case 'update-password': return 'Secure Account';
      default: return '';
    }
  };

  const getSubtitle = () => {
    switch (authType) {
      case 'login': return 'Enter your credentials to access your collection.';
      case 'signup': return 'Step into the future of automotive acquisition.';
      case 'forgot-password': return 'Enter your email to receive a reset link.';
      case 'update-password': return 'Enter your new secure password.';
      default: return '';
    }
  };

  return (
    <div className="w-full text-left space-y-8">
      
      {/* Header */}
      <div>
        <h2 className="font-headline-lg text-2xl font-bold text-on-surface mb-2">
          {getTitle()}
        </h2>
        <p className="text-xs text-on-surface-variant font-body-md">
          {getSubtitle()}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-5">
        
        {/* Full Name */}
        {authType === 'signup' && (
          <div className="space-y-1">
            <label className="font-label-caps text-label-caps text-muted-gold text-[10px] tracking-wider font-bold block mb-1">
              FULL NAME
            </label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-0 text-on-surface-variant/40" />
              <input 
                type="text" 
                required 
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-glass-border py-3 pl-7 pr-0 text-sm text-on-surface focus:ring-0 focus:border-luxury-gold transition-all outline-none"
              />
            </div>
          </div>
        )}

        {/* Email Address */}
        {(authType === 'login' || authType === 'signup' || authType === 'forgot-password') && (
          <div className="space-y-1">
            <label className="font-label-caps text-label-caps text-muted-gold text-[10px] tracking-wider font-bold block mb-1">
              EMAIL ADDRESS
            </label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-0 text-on-surface-variant/40" />
              <input 
                type="email" 
                required 
                placeholder="name@prestige.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-glass-border py-3 pl-7 pr-0 text-sm text-on-surface focus:ring-0 focus:border-luxury-gold transition-all outline-none"
              />
              {isEmailValid && (
                <Check className="absolute right-0 text-luxury-gold" size={16} />
              )}
            </div>
          </div>
        )}

        {/* Password */}
        {(authType === 'login' || authType === 'signup' || authType === 'update-password') && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-label-caps text-label-caps text-muted-gold text-[10px] tracking-wider font-bold block mb-1">
                {authType === 'update-password' ? 'NEW PASSWORD' : 'PASSWORD'}
              </label>
              {authType === 'login' && (
                <button 
                  type="button" 
                  onClick={() => { setAuthType('forgot-password'); setMessage(null); }}
                  className="text-[10px] font-bold text-luxury-gold hover:text-primary transition-colors tracking-wider uppercase"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-0 text-on-surface-variant/40" />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-glass-border py-3 pl-7 pr-8 text-sm text-on-surface focus:ring-0 focus:border-luxury-gold transition-all outline-none"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 text-on-surface-variant/60 hover:text-luxury-gold transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {/* Confirm password */}
        {authType === 'update-password' && (
          <div className="space-y-1">
            <label className="font-label-caps text-label-caps text-muted-gold text-[10px] tracking-wider font-bold block mb-1">
              CONFIRM PASSWORD
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-0 text-on-surface-variant/40" />
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-glass-border py-3 pl-7 pr-0 text-sm text-on-surface focus:ring-0 focus:border-luxury-gold transition-all outline-none"
              />
            </div>
          </div>
        )}

        {message && (
          <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            message.type === 'error' 
              ? 'bg-red-950/20 border-red-900/30 text-red-400' 
              : 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
          }`}>
            {message.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
            <span>{message.text}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-luxury-gold text-black font-bold py-3.5 rounded hover:bg-primary transition-colors flex justify-center items-center gap-2 mt-4 text-xs tracking-widest font-label-caps"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <>
              <span>
                {authType === 'login' ? 'SIGN IN' : 
                 authType === 'signup' ? 'CREATE PROFILE' : 
                 authType === 'forgot-password' ? 'SEND RESET LINK' : 
                 'UPDATE PASSWORD'}
              </span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

      </form>

      {/* Social login divider */}
      {(authType === 'login' || authType === 'signup') && (
        <div className="space-y-4 pt-4">
          <div className="relative text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-glass-border/40"></div></div>
            <span className="relative px-3 bg-surface-container text-[10px] font-label-caps text-on-surface-variant tracking-wider">
              OR CONTINUE WITH
            </span>
          </div>
          
          <button 
            type="button" 
            onClick={() => handleSocialLogin('google')}
            className="w-full bg-surface-container-high hover:bg-surface-container-highest border border-glass-border text-on-surface text-xs font-bold py-3.5 px-4 rounded-md flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <GoogleIcon />
            <span className="tracking-wide">CONTINUE WITH GOOGLE</span>
          </button>
        </div>
      )}

      {/* Form Switch Footer Links */}
      <div className="text-center text-xs text-on-surface-variant pt-6 border-t border-glass-border/40">
        {authType === 'login' ? (
          <p>
            Don't have an account? 
            <button 
              onClick={() => { setAuthType('signup'); setMessage(null); }}
              className="text-luxury-gold font-bold hover:underline ml-1 cursor-pointer"
            >
              Create Profile
            </button>
          </p>
        ) : (
          <p>
            Already have an account? 
            <button 
              onClick={() => { setAuthType('login'); setMessage(null); }}
              className="text-luxury-gold font-bold hover:underline ml-1 cursor-pointer"
            >
              Sign In
            </button>
          </p>
        )}
      </div>

    </div>
  );
};
