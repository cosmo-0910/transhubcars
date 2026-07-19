import { useState, useEffect } from 'react';
import { useAuth } from '../../shared/lib/AuthContext';
import { MessagingPanel } from './MessagingPanel';
import { AuthForm } from './AuthForms';
import { db } from '../../shared/lib/db';
import {
  ShieldCheck,
  User,
  ChevronRight,
  MessageSquare,
  Car,
  Bell,
  MapPin,
  Wallet,
  ShoppingBag,
  Heart,
  Lock,
  Camera,
  LayoutDashboard,
  Edit,
  X
} from 'lucide-react';

export const UserProfile = ({ onClose, onApplyVendor }: { onClose: () => void, onApplyVendor?: () => void }) => {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'messages' | 'verification' | 'security' | 'watchlist' | 'orders'>('profile');
  const [unreadCounts, setUnreadCounts] = useState({ unreadMessages: 0, unreadNotifications: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({ listings: 0, saved: 0, purchases: 0 });
  const [editForm, setEditForm] = useState({
    full_name: '',
    phone: '',
    state: ''
  });

  useEffect(() => {
    if (user?.id) {
      const loadCounts = async () => {
        const counts = await db.getUnreadCounts(user.id);
        setUnreadCounts(counts);
      };
      const loadStats = async () => {
        try {
          const cars = await db.getVendorCars(user.id);
          setUserStats(prev => ({ ...prev, listings: cars.length }));
        } catch (err) {
          console.error('Failed to load stats:', err);
        }
      };
      loadCounts();
      loadStats();
    }
  }, [user?.id]);

  useEffect(() => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        state: profile.state || ''
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await db.updateProfile(user.id, editForm);
      setIsEditing(false);
      window.location.reload(); 
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setLoading(true);
    try {
      const publicUrl = await db.uploadImage(file, 'avatars');
      await db.updateProfile(user.id, { avatar_url: publicUrl });
      window.location.reload();
    } catch (err) {
      console.error('Avatar upload failed:', err);
      alert('Failed to upload image.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-[1000] w-full h-screen bg-black overflow-y-auto flex flex-col justify-center items-center p-4">
        <div className="text-center max-w-sm w-full space-y-6">
          <div className="w-16 h-16 bg-luxury-gold/10 text-luxury-gold rounded-full flex items-center justify-center mx-auto">
            <User size={36} />
          </div>
          <div>
            <h2 className="font-headline-lg text-2xl font-bold text-on-surface">Sign In To Profile</h2>
            <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
              Manage your acquisition portfolio, view direct messages, and secure preorders.
            </p>
          </div>
          <AuthForm type="login" onSuccess={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  const isVendor = profile?.role === 'vendor';
  const isAdmin = profile?.role === 'admin';
  const isAdminOrVendor = isAdmin || isVendor;

  return (
    <div className="fixed inset-0 z-[1000] w-full h-screen bg-background text-on-surface overflow-y-auto">
      
      {loading && (
        <div className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-glass-border border-t-luxury-gold rounded-full animate-spin"></div>
        </div>
      )}

      {/* Header Area */}
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-glass-border p-4">
        <div className="max-w-container-max mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose} 
              className="w-9 h-9 rounded-full bg-surface-container/50 border border-glass-border flex items-center justify-center text-on-surface hover:text-luxury-gold transition-colors"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <h1 className="font-headline-md text-lg font-bold text-luxury-gold">Account Settings</h1>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors border ${
                isEditing 
                  ? 'bg-luxury-gold border-luxury-gold text-black' 
                  : 'bg-surface-container/50 border-glass-border text-on-surface hover:text-luxury-gold'
              }`}
            >
              {isEditing ? <X size={16} /> : <Edit size={16} />}
            </button>
            <div className="relative">
              <Bell size={20} className="text-on-surface-variant" />
              {unreadCounts.unreadNotifications > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-luxury-gold text-black text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCounts.unreadNotifications}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12 pb-32 text-left">
        
        {/* Profile Card Header */}
        <section className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-12 border-b border-glass-border pb-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            
            {/* Avatar input */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-2 border-luxury-gold p-0.5 overflow-hidden">
                <img 
                  src={profile?.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200"} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <label className="absolute -bottom-1 -right-1 bg-luxury-gold text-black p-1.5 rounded-full flex items-center justify-center border-2 border-background cursor-pointer hover:scale-105 transition-transform shadow-lg">
                <Camera size={12} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>

            {/* Profile Info */}
            <div className="text-center md:text-left space-y-1">
              <span className="text-[10px] font-label-caps text-luxury-gold tracking-widest block font-bold">
                {profile?.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : isVendor ? 'REGISTERED DEALER' : 'ELITE MEMBER'}
              </span>
              <h2 className="text-2xl font-bold font-headline-lg text-on-surface">{profile?.full_name || 'Acquisition Member'}</h2>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1"><MapPin size={12} /> {profile?.state || 'Lagos, Nigeria'}</span>
                <span>•</span>
                <span>Registered since 2026</span>
              </div>
            </div>

          </div>

          <div className="flex gap-2">
            {isAdminOrVendor && (
              <button 
                onClick={() => window.location.href = isAdmin ? '/admin.html' : '/vendor.html'}
                className="bg-luxury-gold text-on-primary px-5 py-2.5 rounded font-label-caps text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <LayoutDashboard size={14} />
                <span>{isAdmin ? 'ADMIN CONTROL' : 'VENDOR PORTAL'}</span>
              </button>
            )}
          </div>
        </section>

        {isEditing ? (
          <section className="max-w-xl glass-card p-8 rounded-xl border border-glass-border space-y-6">
            <h3 className="font-headline-md text-lg font-bold text-on-surface border-b border-glass-border pb-2.5">Edit Personal Details</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-label-caps font-bold tracking-wider text-on-surface-variant block">Full Name</label>
                <input 
                  type="text"
                  value={editForm.full_name}
                  onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                  className="w-full bg-surface border border-glass-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-label-caps font-bold tracking-wider text-on-surface-variant block">Phone Number</label>
                <input 
                  type="tel"
                  value={editForm.phone}
                  onChange={e => setEditForm({...editForm, phone: e.target.value})}
                  className="w-full bg-surface border border-glass-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-label-caps font-bold tracking-wider text-on-surface-variant block">Location State</label>
                <input 
                  type="text"
                  value={editForm.state}
                  onChange={e => setEditForm({...editForm, state: e.target.value})}
                  className="w-full bg-surface border border-glass-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleSaveProfile}
                className="flex-1 bg-luxury-gold text-on-primary py-3 rounded font-label-caps text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
              >
                SAVE PROFILE
              </button>
              <button 
                onClick={() => setIsEditing(false)}
                className="flex-1 border border-glass-border text-on-surface py-3 rounded font-label-caps text-xs font-bold hover:bg-surface-variant"
              >
                CANCEL
              </button>
            </div>
          </section>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Metrics & Actions */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MetricCard icon={<ShoppingBag size={20} />} label="PURCHASES" value={userStats.purchases.toString()} />
                <MetricCard icon={<Heart size={20} />} label="FAVORITES" value={userStats.saved.toString()} />
                <MetricCard icon={<Car size={20} />} label="LISTINGS" value={userStats.listings.toString()} />
                <MetricCard icon={<Wallet size={20} />} label="WALLET" value="₦0" />
              </div>

              {/* Vendor Apply Promo banner */}
              {!isAdminOrVendor && profile?.vendor_status === 'none' && (
                <div className="glass-card rounded-xl p-8 bg-gradient-to-r from-luxury-gold/10 to-transparent border border-glass-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="space-y-1.5">
                    <span className="text-luxury-gold font-bold text-[10px] tracking-wider uppercase">PARTNER PROGRAM</span>
                    <h3 className="text-xl font-headline-lg font-bold text-on-surface">Become a Transhub Partner</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Register as a verified automotive dealer or mechanic center to list your inventories and services.
                    </p>
                  </div>
                  <button 
                    onClick={onApplyVendor}
                    className="bg-luxury-gold text-on-primary px-6 py-2.5 rounded font-label-caps text-xs font-bold hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
                  >
                    APPLY NOW
                  </button>
                </div>
              )}

              {/* Management grids */}
              <div className="space-y-4">
                <h3 className="font-headline-md text-lg font-bold text-on-surface">Management</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  <button 
                    onClick={() => setActiveTab('messages')}
                    className="flex justify-between items-center p-5 glass-card rounded-xl border border-glass-border hover:border-luxury-gold/40 text-left"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="text-luxury-gold"><MessageSquare size={20} /></div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">Messages</h4>
                        <p className="text-[10px] text-on-surface-variant">Acquisition conversations</p>
                      </div>
                    </div>
                    {unreadCounts.unreadMessages > 0 && (
                      <span className="bg-luxury-gold text-black text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {unreadCounts.unreadMessages} NEW
                      </span>
                    )}
                  </button>

                  <button 
                    onClick={() => setActiveTab('watchlist')}
                    className="flex justify-between items-center p-5 glass-card rounded-xl border border-glass-border hover:border-luxury-gold/40 text-left"
                  >
                    <div className="flex gap-4 items-center">
                      <div className="text-luxury-gold"><Heart size={20} /></div>
                      <div>
                        <h4 className="font-bold text-sm text-on-surface">Watchlist</h4>
                        <p className="text-[10px] text-on-surface-variant">Saved vehicle listings</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-on-surface-variant" />
                  </button>

                </div>
              </div>

            </div>

            {/* Right Column: Preferences Links & Logout */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="glass-card rounded-xl overflow-hidden border border-glass-border">
                <div className="p-5 border-b border-glass-border">
                  <h3 className="font-headline-md text-base font-bold text-on-surface">Preferences</h3>
                </div>
                <div className="divide-y divide-glass-border/40">
                  <button 
                    onClick={() => setActiveTab('security')}
                    className="w-full flex justify-between items-center px-6 py-4 hover:bg-surface-container/20 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Lock size={16} className="text-luxury-gold" />
                      <div>
                        <h4 className="font-bold text-xs text-on-surface">Security</h4>
                        <p className="text-[9px] text-on-surface-variant">Passwords & MFA keypads</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-on-surface-variant" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('verification')}
                    className="w-full flex justify-between items-center px-6 py-4 hover:bg-surface-container/20 text-left transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={16} className="text-luxury-gold" />
                      <div>
                        <h4 className="font-bold text-xs text-on-surface">Identity Verification</h4>
                        <p className="text-[9px] text-on-surface-variant">Government-issued document audits</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-luxury-gold uppercase tracking-wider bg-luxury-gold/10 px-2 py-0.5 rounded">
                      {profile?.status === 'active' ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Logout button */}
              <button 
                onClick={signOut}
                className="w-full bg-red-950/20 border border-red-900/30 text-red-500 py-3.5 rounded-lg font-label-caps text-xs font-bold hover:bg-red-900/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <span>SIGN OUT OF ACCOUNT</span>
              </button>

            </div>

          </div>
        )}

      </div>
      
      {/* Messages Tab View Overlay */}
      {activeTab === 'messages' && (
        <div className="fixed inset-0 z-[1100] bg-background flex flex-col">
          <header className="bg-surface border-b border-glass-border p-4 flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('profile')} 
              className="w-9 h-9 rounded-full bg-surface-container/50 border border-glass-border flex items-center justify-center text-on-surface"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <h2 className="font-headline-md text-lg font-bold text-on-surface">Direct Conversations</h2>
          </header>
          <div className="flex-1 bg-deep-charcoal">
            <MessagingPanel userId={user.id} role={profile?.role || 'customer'} height="calc(100vh - 72px)" />
          </div>
        </div>
      )}

      {/* Mock preferences content overlays */}
      {['verification', 'security', 'watchlist', 'orders'].includes(activeTab) && (
        <div className="fixed inset-0 z-[1100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card p-8 rounded-xl border border-glass-border text-center space-y-6 relative">
            <button 
              onClick={() => setActiveTab('profile')}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <X size={20} />
            </button>
            
            <div className="w-16 h-16 bg-luxury-gold/10 text-luxury-gold rounded-full flex items-center justify-center mx-auto">
              {activeTab === 'security' && <Lock size={28} />}
              {activeTab === 'verification' && <ShieldCheck size={28} />}
              {activeTab === 'watchlist' && <Heart size={28} />}
              {activeTab === 'orders' && <ShoppingBag size={28} />}
            </div>

            <div>
              <h3 className="font-headline-md text-lg font-bold text-on-surface capitalize">{activeTab} Panel</h3>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                {activeTab === 'security' && 'You can update user passwords and multi-factor credentials here.'}
                {activeTab === 'verification' && 'Verified users unlock elite bidding structures and concierge options.'}
                {activeTab === 'watchlist' && 'Save vehicle listings inside showrooms to view them in this watchlist.'}
                {activeTab === 'orders' && 'Your vehicle preorder lists and delivery updates are logged here.'}
              </p>
            </div>

            <button 
              onClick={() => setActiveTab('profile')}
              className="w-full bg-luxury-gold text-on-primary py-3 rounded-lg text-xs font-bold"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

const MetricCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div className="bg-surface-container/10 border border-glass-border/60 rounded-xl p-4 flex flex-col items-center text-center space-y-1 justify-center">
    <div className="text-luxury-gold mb-1">{icon}</div>
    <div className="text-xl font-bold text-on-surface font-headline-md">{value}</div>
    <div className="text-[8px] font-label-caps text-on-surface-variant tracking-wider font-bold">{label}</div>
  </div>
);
