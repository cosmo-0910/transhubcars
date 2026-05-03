import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth } from '../../shared/lib/AuthContext';
import { MessagingPanel } from './MessagingPanel';
import { AuthForm } from './AuthForms';
import {
  ShieldCheck,
  User,
  Mail,
  ChevronRight,
  Settings,
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
  CheckCircle2,
  LayoutDashboard,
  CreditCard
} from 'lucide-react';

/* ─── colours & tokens ────────────────────────────────────── */
const GOLD = 'var(--accent-gold)';

/* ═══════════════════════════════════════════════════════════ */
export const UserProfile = ({ onClose }: { onClose: () => void }) => {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'messages'>('profile');

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

  const isAdminOrVendor = profile?.role === 'admin' || profile?.role === 'vendor';

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

  return (
    <div
      className="profile-fullscreen-mobile"
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#000',
        color: '#fff',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch'
      }}
    >
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
          <h1 className="luxury-font" style={{ fontSize: '1.8rem', margin: 0 }}>Profile</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button style={{ background: 'none', border: 'none', color: '#fff' }}><Settings size={22} /></button>
          <div style={{ position: 'relative' }}>
            <Bell size={22} />
            <span style={{ position: 'absolute', top: -3, right: -3, background: GOLD, color: '#000', fontSize: '0.6rem', fontWeight: 900, padding: '2px 5px', borderRadius: '10px' }}>3</span>
          </div>
        </div>
      </header>

      <div style={{ padding: '0 1.5rem 8rem 1.5rem' }}>
        {/* ── User Info Section ── */}
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', alignItems: 'flex-start' }}>
           <div style={{ position: 'relative' }}>
             <div style={{ width: '90px', height: '90px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${GOLD}` }}>
               <img src={profile?.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200"} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
             </div>
             <button style={{ position: 'absolute', bottom: 0, right: 0, background: GOLD, border: '2px solid #000', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Camera size={14} color="#000" />
             </button>
           </div>
           
           <div style={{ flex: 1, paddingTop: '0.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>{profile?.full_name || 'David John'}</h2>
               <CheckCircle2 size={18} color="#4ade80" />
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#888', fontSize: '0.8rem', marginTop: '0.3rem' }}>
               <div style={{ width: '12px', height: '12px', borderRadius: '50%', border: `1px solid ${GOLD}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ width: '6px', height: '6px', background: GOLD, borderRadius: '50%' }} />
               </div>
               <span style={{ color: GOLD, fontWeight: 700 }}>{isAdminOrVendor ? 'Silver Member' : 'Verified User'}</span>
             </div>
             <div style={{ marginTop: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', color: '#888' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                 <Mail size={14} /> <span>{user?.email}</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                 <Phone size={14} /> <span>{profile?.phone || '+234 812 345 6789'}</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                 <MapPin size={14} /> <span>{profile?.state || 'Lagos, Nigeria'}</span>
               </div>
             </div>
           </div>

           {/* Wallet Balance (Floating) */}
           {isAdminOrVendor && (
             <div style={{ 
               background: 'rgba(212, 175, 55, 0.05)', 
               border: '1px solid rgba(212, 175, 55, 0.2)', 
               borderRadius: '1rem', 
               padding: '1rem',
               minWidth: '160px',
               backdropFilter: 'blur(5px)'
             }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                 <span style={{ fontSize: '0.7rem', color: '#888', fontWeight: 600 }}>Wallet Balance</span>
                 <Wallet size={16} color={GOLD} />
               </div>
               <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>₦2,450,000</div>
               <button style={{ color: GOLD, fontSize: '0.75rem', fontWeight: 700, background: 'none', border: 'none', marginTop: '0.5rem', padding: 0 }}>View Wallet →</button>
             </div>
           )}
        </div>

        {/* ── Membership Progress Card ── */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.2rem', padding: '1.5rem', marginBottom: '2.5rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem' }}>
             <div style={{ width: '48px', height: '48px', background: 'rgba(197,160,89,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Gem size={24} color={GOLD} />
             </div>
             <div style={{ flex: 1 }}>
               <div style={{ fontSize: '1rem', fontWeight: 700 }}>{isAdminOrVendor ? 'Silver Member' : 'Bronze Member'}</div>
               <div style={{ fontSize: '0.75rem', color: '#888' }}>Member since {new Date(profile?.created_at || '').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</div>
             </div>
             <button style={{ background: 'rgba(212, 175, 55, 0.05)', border: `1px solid ${GOLD}`, color: GOLD, fontSize: '0.7rem', fontWeight: 800, padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>View Benefits</button>
           </div>
           
           <div style={{ position: 'relative', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
             <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '45%', background: GOLD, borderRadius: '3px', boxShadow: `0 0 10px ${GOLD}` }} />
           </div>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', fontSize: '0.7rem', color: '#888' }}>
             <span>{isAdminOrVendor ? 'Next Tier: Gold' : 'Next Tier: Silver'}</span>
             <span>1,200 / 2,000 pts</span>
           </div>
        </div>

        {/* ── Overview Section ── */}
        <div style={{ marginBottom: '2.5rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
             <h3 className="luxury-font" style={{ fontSize: '1.2rem' }}>{isAdminOrVendor ? 'Portfolio Overview' : 'My Overview'}</h3>
             <button style={{ color: GOLD, fontSize: '0.75rem', fontWeight: 700, background: 'none', border: 'none' }}>View All →</button>
           </div>
           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
             {isAdminOrVendor ? (
               <>
                 <OverviewItem icon={<Car size={20} />} label="Total Cars" value="0" />
                 <OverviewItem icon={<Wallet size={20} />} label="Total Value" value="₦0" />
                 <OverviewItem icon={<TrendingUp size={20} />} label="Active" value="0" />
                 <OverviewItem icon={<Heart size={20} />} label="Saved" value="0" />
               </>
             ) : (
               <>
                 <OverviewItem icon={<Car size={20} />} label="My Listings" value="2" />
                 <OverviewItem icon={<Heart size={20} />} label="Saved Cars" value="3" />
                 <OverviewItem icon={<ShoppingBag size={20} />} label="Purchased" value="1" />
                 <OverviewItem icon={<Tag size={20} />} label="Offers" value="0" />
               </>
             )}
           </div>
        </div>

        {/* ── My Services / Activity Grid ── */}
        <div style={{ marginBottom: '2.5rem' }}>
           <h3 className="luxury-font" style={{ fontSize: '1.2rem', marginBottom: '1.2rem' }}>{isAdminOrVendor ? 'My Services' : 'My Activity'}</h3>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             {isAdminOrVendor && <ActivityItem icon={<LayoutDashboard size={18} />} label="Admin Dashboard" subText="Management portal" onClick={() => window.location.href = '/admin.html'} />}
             <ActivityItem icon={<Car size={18} />} label="My Listings" subText="Manage your car listings" />
             <ActivityItem icon={<Heart size={18} />} label="Saved Cars" subText="Cars you've saved" />
             <ActivityItem icon={<ShoppingBag size={18} />} label="Buying History" subText="Cars you've purchased" />
             <ActivityItem icon={<Tag size={18} />} label="Offers" subText={isAdminOrVendor ? "Offers on your listings" : "Offers you've made"} />
             <ActivityItem icon={<MessageSquare size={18} />} label="Messages" subText="Your conversations" badge={3} onClick={() => setActiveTab('messages')} />
             {!isAdminOrVendor && <ActivityItem icon={<History size={18} />} label="Recently Viewed" subText="Cars you looked at" />}
           </div>
        </div>

        {/* ── Account List ── */}
        <div style={{ marginBottom: '2.5rem' }}>
           <h3 className="luxury-font" style={{ fontSize: '1.2rem', marginBottom: '1.2rem' }}>Account</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255,255,255,0.05)', borderRadius: '1.2rem', overflow: 'hidden' }}>
             <AccountLink icon={<User size={18} />} label="Personal Information" subText="Update your personal details" />
             <AccountLink icon={<CreditCard size={18} />} label="Payment Methods" subText="Manage your payment options" />
             <AccountLink icon={<ShieldCheck size={18} />} label="Verification" subText="Verify your account" badgeText="Verified" badgeColor="#4ade80" />
             <AccountLink icon={<Lock size={18} />} label="Security" subText="Password and security settings" />
           </div>
        </div>

        {/* ── Logout Button ── */}
        <button 
          onClick={signOut}
          style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', background: 'rgba(255,0,0,0.05)', border: '1px solid rgba(255,0,0,0.1)', color: '#ff4444', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', marginBottom: '2rem' }}
        >
          <History size={18} style={{ transform: 'rotate(180deg)' }} /> LOGOUT
        </button>

        {/* ── Need Help Section ── */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.2rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
           <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(197,160,89,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <Headphones size={22} color={GOLD} />
           </div>
           <div style={{ flex: 1 }}>
             <div style={{ fontSize: '1rem', fontWeight: 700 }}>Need Help?</div>
             <div style={{ fontSize: '0.75rem', color: '#888' }}>Our support team is here to help you</div>
           </div>
           <button style={{ background: GOLD, color: '#000', fontWeight: 800, padding: '0.8rem 1.2rem', borderRadius: '0.8rem', fontSize: '0.8rem' }}>Contact Support</button>
        </div>
      </div>
    </div>
  );
};

const OverviewItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1rem 0.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
    <div style={{ color: GOLD }}>{icon}</div>
    <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{value}</div>
    <div style={{ fontSize: '0.65rem', color: '#888', fontWeight: 600 }}>{label}</div>
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
      <ChevronRight size={14} color="#555" />
    </div>
  </div>
);

const AccountLink = ({ icon, label, subText, badgeText, badgeColor }: { icon: React.ReactNode, label: string, subText: string, badgeText?: string, badgeColor?: string }) => (
  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
    <div style={{ color: GOLD }}>{icon}</div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: '0.7rem', color: '#888' }}>{subText}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {badgeText && <span style={{ color: badgeColor, fontSize: '0.65rem', fontWeight: 700 }}>{badgeText}</span>}
      <ChevronRight size={16} color="#555" />
    </div>
  </div>
);
