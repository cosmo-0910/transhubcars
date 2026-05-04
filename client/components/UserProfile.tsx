import { useState, useEffect } from 'react';
import { useAuth } from '../../shared/lib/AuthContext';
import { MessagingPanel } from './MessagingPanel';
import { AuthForm } from './AuthForms';
import { db } from '../../shared/lib/db';
import {
  ShieldCheck,
  User,
  Mail,
  ChevronRight,
  Gem,
  MessageSquare,
  TrendingUp,
  Car,
  Headphones,
  Bell,
  MapPin,
  Phone,
  Wallet,
  ShoppingBag,
  Tag,
  History,
  Heart,
  Lock,
  Camera,
  LayoutDashboard,
  CreditCard,
  Edit,
  X
} from 'lucide-react';


/* ─── colours & tokens ────────────────────────────────────── */
const GOLD = 'var(--accent-gold)';

/* ═══════════════════════════════════════════════════════════ */
export const UserProfile = ({ onClose, onApplyVendor }: { onClose: () => void, onApplyVendor?: () => void }) => {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'messages' | 'verification' | 'security' | 'notifications' | 'payment' | 'watchlist' | 'orders'>('profile');
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
          // In a real app, we'd also fetch saved cars and purchases from respective tables
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
      // AuthContext should automatically refresh profile if implemented correctly, 
      // otherwise we might need a manual refresh call.
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

  // Handle Authentication Inline
  if (!user) {
    return (
      <div className="profile-fullscreen-mobile" style={{ background: '#000', minHeight: '100vh', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <User size={64} color="var(--accent-gold)" style={{ margin: '0 auto 1.5rem' }} />
          <h2 className="luxury-font" style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '1rem' }}>SIGN IN TO VIEW PROFILE</h2>
          <p style={{ color: '#888', maxWidth: '300px', margin: '0 auto' }}>Manage your listings, view your portfolio, and track your acquisitions.</p>
        </div>
        <AuthForm type="login" onSuccess={() => window.location.reload()} />
      </div>
    );
  }

  const isVendor = profile?.role === 'vendor';
  const isAdmin = profile?.role === 'admin';
  const isAdminOrVendor = isAdmin || isVendor;

  if (activeTab === 'messages') {
    return (
      <div className="profile-fullscreen-mobile" style={{ background: '#000', minHeight: '100vh', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
           <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: '#fff' }}><ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} /></button>
           <h2 className="luxury-font" style={{ fontSize: '1.5rem' }}>Messages</h2>
           <div style={{ width: '24px' }} />
        </div>
        <MessagingPanel userId={user?.id || ''} role={profile?.role || 'customer'} height="calc(100vh - 150px)" />
      </div>
    );
  }

  if (activeTab !== 'profile') {
    const tabTitles: Record<string, string> = {
      verification: 'Identity Verification',
      security: 'Security & MFA',
      notifications: 'Notification Preferences',
      payment: 'Payment Methods',
      watchlist: 'My Watchlist',
      orders: 'Order History',
    };

    return (
      <div className="profile-fullscreen-mobile" style={{ background: '#000', minHeight: '100vh', padding: '2rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
           <button onClick={() => setActiveTab('profile')} style={{ background: 'none', border: 'none', color: '#fff' }}><ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} /></button>
           <h2 className="luxury-font" style={{ fontSize: '1.3rem' }}>{tabTitles[activeTab] || 'Section'}</h2>
           <div style={{ width: '24px' }} />
        </div>
        
        <div style={{ color: '#888', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center', color: GOLD }}>
            {activeTab === 'security' ? <Lock size={40} /> :
             activeTab === 'verification' ? <ShieldCheck size={40} /> :
             activeTab === 'payment' ? <CreditCard size={40} /> :
             activeTab === 'watchlist' ? <Heart size={40} /> :
             activeTab === 'orders' ? <ShoppingBag size={40} /> :
             <Bell size={40} />}
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1rem' }}>{tabTitles[activeTab]}</h3>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: '2rem' }}>
            {activeTab === 'verification' ? 'Upload your government-issued ID to become verified and unlock premium bidding status.' :
             activeTab === 'security' ? 'Update your password and enable Two-Factor Authentication for enhanced account security.' :
             activeTab === 'payment' ? 'Manage your saved cards and bank accounts for seamless transactions.' :
             activeTab === 'watchlist' ? 'Your curated list of saved masterpieces will appear here.' :
             activeTab === 'orders' ? 'A complete history of your acquisitions and reservations.' :
             'Manage your email and SMS alert preferences.'}
          </p>
          
          {['verification', 'security', 'payment', 'notifications'].includes(activeTab) ? (
            <form onSubmit={e => { e.preventDefault(); alert('Saved successfully.'); setActiveTab('profile'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
              {activeTab === 'security' && (
                <>
                  <input type="password" placeholder="Current Password" required style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '0.5rem', width: '100%' }} />
                  <input type="password" placeholder="New Password" required style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '0.5rem', width: '100%' }} />
                </>
              )}
              {activeTab === 'payment' && (
                <>
                  <input type="text" placeholder="Card Number" required style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '0.5rem', width: '100%' }} />
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <input type="text" placeholder="MM/YY" required style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '0.5rem', width: '100%' }} />
                    <input type="text" placeholder="CVC" required style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', borderRadius: '0.5rem', width: '100%' }} />
                  </div>
                </>
              )}
              {activeTab === 'verification' && (
                <div style={{ border: '1px dashed rgba(255,255,255,0.2)', padding: '2rem', textAlign: 'center', borderRadius: '0.5rem', color: '#888' }}>
                  Tap to upload ID / Passport Document
                </div>
              )}
              
              <button type="submit" className="btn-gold" style={{ marginTop: '1rem', width: '100%' }}>SAVE {activeTab.toUpperCase()}</button>
            </form>
          ) : null}
        </div>
      </div>
    );
  }


  return (
    <div
      className="profile-fullscreen-mobile"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#000',
        color: '#fff',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 5000 /* Ensure it overlays the Navbar */
      }}
    >
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="loading-spinner" />
        </div>
      )}

      {/* ── Header ── */}
      <header style={{ 
        padding: '1.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} /></button>
          <h1 className="luxury-font" style={{ fontSize: '1.8rem', margin: 0 }}>Account.</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            style={{ 
              background: isEditing ? GOLD : 'rgba(255,255,255,0.05)', 
              border: isEditing ? 'none' : '1px solid rgba(255,255,255,0.1)', 
              color: isEditing ? '#000' : '#fff', 
              width: '36px', height: '36px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
            title={isEditing ? 'Cancel Edit' : 'Edit Profile'}
          >
            {isEditing ? <X size={16} /> : <Edit size={16} />}
          </button>
          <div style={{ position: 'relative' }}>

            <Bell size={22} />
            {unreadCounts.unreadNotifications > 0 && <span style={{ position: 'absolute', top: -3, right: -3, background: GOLD, color: '#000', fontSize: '0.6rem', fontWeight: 900, padding: '2px 5px', borderRadius: '10px' }}>{unreadCounts.unreadNotifications}</span>}
          </div>
        </div>
      </header>

      <div style={{ padding: '0 1.5rem 8rem 1.5rem' }}>
        {/* ── User Info Section ── */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
           <div style={{ position: 'relative' }}>
             <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${GOLD}`, background: '#111' }}>
               <img src={profile?.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200"} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             </div>
             <label style={{ position: 'absolute', bottom: 0, right: 0, background: GOLD, border: '2px solid #000', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
               <Camera size={14} color="#000" />
               <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
             </label>
           </div>
           
           <div style={{ flex: 1, minWidth: '200px' }}>
             {isEditing ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                 <div className="luxury-input-group">
                   <label style={{ fontSize: '0.65rem', color: GOLD, fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>FULL NAME</label>
                   <input 
                    type="text" 
                    value={editForm.full_name} 
                    onChange={e => setEditForm({...editForm, full_name: e.target.value})} 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '0.5rem', width: '100%', fontSize: '0.9rem' }}
                   />
                 </div>
                 <div className="luxury-input-group">
                   <label style={{ fontSize: '0.65rem', color: GOLD, fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>PHONE NUMBER</label>
                   <input 
                    type="tel" 
                    value={editForm.phone} 
                    onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '0.5rem', width: '100%', fontSize: '0.9rem' }}
                   />
                 </div>
                 <div className="luxury-input-group">
                   <label style={{ fontSize: '0.65rem', color: GOLD, fontWeight: 800, marginBottom: '0.3rem', display: 'block' }}>LOCATION (STATE)</label>
                   <input 
                    type="text" 
                    value={editForm.state} 
                    onChange={e => setEditForm({...editForm, state: e.target.value})} 
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '0.8rem', borderRadius: '0.5rem', width: '100%', fontSize: '0.9rem' }}
                   />
                 </div>
                 <button onClick={handleSaveProfile} className="btn-gold" style={{ padding: '0.8rem', borderRadius: '0.5rem', marginTop: '0.5rem', fontWeight: 800 }}>SAVE CHANGES</button>
               </div>
             ) : (
               <>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                   <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>{profile?.full_name || 'Member'}</h2>
                   {isAdminOrVendor && <ShieldCheck size={18} color={GOLD} />}
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#888', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                   <span style={{ color: GOLD, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                     {profile?.role === 'admin' ? 'Administrator' : profile?.role === 'vendor' ? 'Verified Vendor' : 'Verified Member'}
                   </span>
                 </div>
                 <div style={{ marginTop: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem', fontSize: '0.85rem', color: '#888' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1rem', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.05)', minWidth: 0 }}>
                     <Mail size={14} color={GOLD} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1rem', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.05)', minWidth: 0 }}>
                     <Phone size={14} color={GOLD} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.phone || 'No phone'}</span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.03)', padding: '0.6rem 1rem', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.05)', minWidth: 0 }}>
                     <MapPin size={14} color={GOLD} style={{ flexShrink: 0 }} /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile?.state || 'Not set'}</span>
                   </div>
                 </div>
               </>
             )}
           </div>
        </div>

        {/* ── Vendor Application Section ── */}
        {!isAdminOrVendor && profile?.vendor_status === 'none' && (
          <div style={{ background: 'linear-gradient(135deg, rgba(197,160,89,0.15) 0%, rgba(0,0,0,0) 100%)', border: `1px solid ${GOLD}44`, borderRadius: '1.2rem', padding: '1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(197,160,89,0.1)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gem size={28} color={GOLD} />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.3rem' }}>Partner with Transhub.</div>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>Sell your cars, parts, or services to our elite clientele.</div>
            </div>
            <button 
              onClick={() => onApplyVendor?.()} 
              className="btn-gold" 
              style={{ padding: '0.8rem 1.5rem', borderRadius: '0.8rem', fontWeight: 800, fontSize: '0.8rem' }}
            >
              APPLY NOW
            </button>

          </div>
        )}

        {/* ── Overview Section ── */}
        <div style={{ marginBottom: '2.5rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
             <h3 className="luxury-font" style={{ fontSize: '1.2rem' }}>{isAdminOrVendor ? 'Portfolio Metrics.' : 'Activity.'}</h3>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '1rem' }}>
             {isAdminOrVendor ? (
               <>
                 <OverviewItem icon={<Car size={20} />} label="Listings" value={userStats.listings.toString()} />
                 <OverviewItem icon={<Wallet size={20} />} label="Wallet" value="₦0" />
                 <OverviewItem icon={<TrendingUp size={20} />} label="Active" value="0" />
                 <OverviewItem icon={<Heart size={20} />} label="Saved" value={userStats.saved.toString()} />
               </>
             ) : (
               <>
                 <OverviewItem icon={<ShoppingBag size={20} />} label="Purchases" value={userStats.purchases.toString()} />
                 <OverviewItem icon={<Heart size={20} />} label="Favorites" value={userStats.saved.toString()} />
                 <OverviewItem icon={<History size={20} />} label="Viewed" value="12" />
                 <OverviewItem icon={<Tag size={20} />} label="Offers" value="0" />
               </>
             )}
           </div>
        </div>

        {/* ── Main Actions Grid ── */}
        <div style={{ marginBottom: '2.5rem' }}>
           <h3 className="luxury-font" style={{ fontSize: '1.2rem', marginBottom: '1.2rem' }}>Management.</h3>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
             {isAdminOrVendor && (
               <ActivityItem 
                icon={<LayoutDashboard size={18} />} 
                label={isAdmin ? "Superadmin Portal" : "Vendor Dashboard"} 
                subText="Manage inventory & sales" 
                onClick={() => window.location.href = isAdmin ? '/admin.html' : '/vendor.html'} 
               />
             )}
             <ActivityItem icon={<MessageSquare size={18} />} label="Messages" subText="Acquisition conversations" badge={unreadCounts.unreadMessages} onClick={() => setActiveTab('messages')} />
             <ActivityItem icon={<Heart size={18} />} label="Watchlist" subText="Saved masterpieces" onClick={() => setActiveTab('watchlist')} />
             <ActivityItem icon={<ShoppingBag size={18} />} label="Orders" subText="Acquisition history" onClick={() => setActiveTab('orders')} />
             <ActivityItem icon={<History size={18} />} label="Activity" subText="Recent interactions" />
             <ActivityItem icon={<CreditCard size={18} />} label="Payments" subText="Billing & wallet" onClick={() => setActiveTab('payment')} />
           </div>
        </div>

        {/* ── Account Settings List ── */}
        <div style={{ marginBottom: '2.5rem' }}>
           <h3 className="luxury-font" style={{ fontSize: '1.2rem', marginBottom: '1.2rem' }}>Preferences.</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.05)', borderRadius: '1.2rem', overflow: 'hidden' }}>
             <AccountLink 
               icon={<User size={18} />} 
               label="Personal Information" 
               subText="Update your personal details" 
               onClick={() => {
                 setIsEditing(true);
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               }}
             />
             <AccountLink icon={<ShieldCheck size={18} />} label="Identity Verification" subText="Verify your status" badgeText={profile?.status === 'active' ? "Verified" : "Pending"} badgeColor={profile?.status === 'active' ? "#4ade80" : GOLD} onClick={() => setActiveTab('verification')} />
             <AccountLink icon={<Lock size={18} />} label="Security" subText="Password and MFA" onClick={() => setActiveTab('security')} />
             <AccountLink icon={<Bell size={18} />} label="Notifications" subText="Manage alerts" onClick={() => setActiveTab('notifications')} />
           </div>

        </div>

        {/* ── Logout Button ── */}
        <button 
          onClick={signOut}
          style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', background: 'rgba(255,0,0,0.05)', border: '1px solid rgba(255,0,0,0.1)', color: '#ff4444', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '2rem' }}
        >
          <History size={18} style={{ transform: 'rotate(180deg)' }} /> SIGN OUT
        </button>

        {/* ── Support Section ── */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.2rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
           <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(197,160,89,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Headphones size={22} color={GOLD} />
           </div>
           <div style={{ flex: 1, minWidth: '150px' }}>
             <div style={{ fontSize: '1rem', fontWeight: 700 }}>Exclusive Support.</div>
             <div style={{ fontSize: '0.75rem', color: '#888' }}>Our concierge team is here for you</div>
           </div>
           <button style={{ background: GOLD, color: '#000', fontWeight: 800, padding: '0.8rem 1.2rem', borderRadius: '0.8rem', fontSize: '0.8rem' }}>Enquire</button>
        </div>
      </div>
    </div>
  );
};

const OverviewItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1.2rem 0.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
    <div style={{ color: GOLD }}>{icon}</div>
    <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{value}</div>
    <div style={{ fontSize: '0.65rem', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
  </div>
);

const ActivityItem = ({ icon, label, subText, badge, onClick }: { icon: React.ReactNode, label: string, subText: string, badge?: number, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.2rem', padding: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: onClick ? 'pointer' : 'default' }}
  >
    <div style={{ color: GOLD }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: '0.7rem', color: '#888' }}>{subText}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {badge ? <span style={{ background: GOLD, color: '#000', fontSize: '0.65rem', fontWeight: 900, padding: '2px 6px', borderRadius: '10px' }}>{badge}</span> : null}
      <ChevronRight size={14} color="#333" />
    </div>
  </div>
);

const AccountLink = ({ icon, label, subText, badgeText, badgeColor, onClick }: { icon: React.ReactNode, label: string, subText: string, badgeText?: string, badgeColor?: string, onClick?: () => void }) => (
  <div onClick={onClick} style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'center', cursor: onClick ? 'pointer' : 'default' }}>

    <div style={{ color: GOLD }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: '0.7rem', color: '#888' }}>{subText}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {badgeText && <span style={{ color: badgeColor, fontSize: '0.65rem', fontWeight: 700 }}>{badgeText}</span>}
      <ChevronRight size={16} color="#333" />
    </div>
  </div>
);

