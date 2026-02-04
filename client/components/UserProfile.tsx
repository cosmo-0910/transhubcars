import { motion, AnimatePresence } from 'framer-motion';
import { db, type Order } from '../../shared/lib/db';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../shared/lib/AuthContext';
import { VendorApplication } from './VendorApplication';
import {
  Package,
  Clock,
  ShieldCheck,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronRight,
  Store,
  ExternalLink,
  CreditCard,
  Settings,
  LayoutGrid,
  Gem,
  Building2
} from 'lucide-react';

export const UserProfile = ({ onClose }: { onClose: () => void }) => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'acquisitions' | 'details' | 'membership' | 'vendor'>('acquisitions');
  const [showVendorApp, setShowVendorApp] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const data = await db.getOrders();
        setOrders(data.filter(o => o.user_id === user.id));
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const stats = useMemo(() => ({
    totalInvestment: orders.reduce((acc, o) => acc + (o.amount || 0), 0),
    acquisitionCount: orders.length,
    membershipTier: orders.length > 5 ? 'PLATINUM' : orders.length > 2 ? 'GOLD' : 'SILVER'
  }), [orders]);

  if (showVendorApp) {
    return <VendorApplication onClose={() => setShowVendorApp(false)} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="luxury-form-card"
      style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '0',
        borderRadius: '2.5rem',
        position: 'relative'
      }}
    >
      <div className="floating-shimmer" />

      {/* Close Button */}
      <button 
        onClick={onClose}
        style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', zIndex: 100, padding: '0.5rem', borderRadius: '50%' }}
      >
        <X size={20} />
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', minHeight: '600px' }}>
        {/* Sidebar */}
        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '3rem 2rem', borderRight: '1px solid var(--border-glass)' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ 
              width: '100px', 
              height: '100px', 
              borderRadius: '50%', 
              background: 'var(--accent-gold-soft)', 
              border: '2px solid var(--accent-gold)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              position: 'relative'
            }}>
              <User size={48} color="var(--accent-gold)" />
              <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--accent-gold)', borderRadius: '50%', padding: '4px', border: '3px solid #0a0a0a' }}>
                <ShieldCheck size={14} color="black" />
              </div>
            </div>
            <h4 className="luxury-font" style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{profile?.full_name || 'Valued Client'}</h4>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--accent-gold)', fontSize: '0.65rem', fontWeight: 800, letterSpacing: '2px' }}>
              <Gem size={12} /> {stats.membershipTier} MEMBER
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <NavTab active={activeTab === 'acquisitions'} onClick={() => setActiveTab('acquisitions')} icon={<LayoutGrid size={18} />} label="ACQUISITIONS" />
            <NavTab active={activeTab === 'details'} onClick={() => setActiveTab('details')} icon={<User size={18} />} label="ACCOUNT INFO" />
            <NavTab active={activeTab === 'membership'} onClick={() => setActiveTab('membership')} icon={<ShieldCheck size={18} />} label="MEMBERSHIP" />
            <NavTab active={activeTab === 'vendor'} onClick={() => setActiveTab('vendor')} icon={<Store size={18} />} label="VENDOR PORTAL" />
            <div style={{ height: '1px', background: 'var(--border-glass)', margin: '1rem 0' }} />
            <NavTab active={false} onClick={() => {}} icon={<Settings size={18} />} label="SETTINGS" />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '4rem' }}>
          <AnimatePresence mode="wait">
            {activeTab === 'acquisitions' && (
              <motion.div
                key="acquisitions"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <header style={{ marginBottom: '3rem' }}>
                  <h3 className="luxury-font" style={{ fontSize: '2.2rem' }}>Portfolio Ledger.</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Track your curated automotive investments.</p>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                  <StatCard label="TOTAL VALUE" value={`$${stats.totalInvestment.toLocaleString()}`} />
                  <StatCard label="ASSETS" value={stats.acquisitionCount} />
                </div>

                {loading ? (
                  <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', letterSpacing: '2px', fontSize: '0.7rem' }}>SYNCHRONIZING SECURE LEDGER...</div>
                ) : orders.length === 0 ? (
                  <div style={{ padding: '4rem', textAlign: 'center', border: '1px dashed var(--border-glass)', borderRadius: '2rem' }}>
                    <Package size={48} color="var(--border-glass)" style={{ marginBottom: '1.5rem' }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your boutique portfolio is currently awaiting its first acquisition.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map(order => (
                      <div key={order.id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1.2rem', border: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: '0.3s' }} className="glass-hover">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                          <div style={{ width: '50px', height: '50px', background: 'var(--accent-gold-soft)', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={20} color="var(--accent-gold)" />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', letterSpacing: '1.5px', fontWeight: 800 }}>{order.status.toUpperCase()}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.2rem' }}>{order.cars?.make} {order.cars?.model}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>ID: {order.payment_ref || order.id.slice(0, 8)}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>${order.amount.toLocaleString()}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <Clock size={12} /> {new Date(order.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <header style={{ marginBottom: '3rem' }}>
                  <h3 className="luxury-font" style={{ fontSize: '2.2rem' }}>Member Profile.</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Confidential identity and secure contact information.</p>
                </header>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <InfoItem icon={<User size={20} />} label="FULL NAME" value={profile?.full_name || 'Not Provided'} />
                  <InfoItem icon={<Mail size={20} />} label="SECURE EMAIL" value={user?.email || 'Not Provided'} />
                  <InfoItem icon={<Calendar size={20} />} label="MEMBER SINCE" value={new Date(profile?.created_at || user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />
                  <InfoItem icon={<CreditCard size={20} />} label="PREFERRED CURRENCY" value="USD ($)" />
                </div>
              </motion.div>
            )}

            {activeTab === 'membership' && (
              <motion.div
                key="membership"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <header style={{ marginBottom: '3rem' }}>
                  <h3 className="luxury-font" style={{ fontSize: '2.2rem' }}>Access.</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Your status within the Transhub ecosystem.</p>
                </header>

                <div className="glass" style={{ padding: '2.5rem', borderRadius: '2rem', border: '1px solid var(--accent-gold)', background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.05) 0%, transparent 100%)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={{ width: '60px', height: '60px', background: 'var(--accent-gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Gem size={30} color="black" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '3px', fontWeight: 800 }}>CURRENT STANDING</div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.membershipTier} ACCOUNT</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Benefit label="Priority Auction Access" active={true} />
                    <Benefit label="Complimentary Global Freight" active={stats.membershipTier !== 'SILVER'} />
                    <Benefit label="Concierge Sourcing" active={stats.membershipTier === 'PLATINUM'} />
                    <Benefit label="Pre-market Catalog Previews" active={true} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'vendor' && (
              <motion.div
                key="vendor"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <header style={{ marginBottom: '3rem' }}>
                  <h3 className="luxury-font" style={{ fontSize: '2.2rem' }}>Vendor Portal.</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Manage your dealership presence and inventory.</p>
                </header>

                {(!profile?.vendor_status || profile.vendor_status === 'none' || profile.vendor_status === 'rejected') && (
                  <div className="glass" style={{ padding: '3rem', borderRadius: '2rem', textAlign: 'center', border: '1px solid var(--border-glass)' }}>
                    <div style={{ width: '80px', height: '80px', margin: '0 auto 2rem', background: 'rgba(255,255,255,0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={40} color="var(--accent-gold)" />
                    </div>
                    <h4 className="luxury-font" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Become a Partner</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                      Join our exclusive network of certified dealers. List your luxury inventory on Transhub and reach discerning clients worldwide.
                      {profile?.vendor_status === 'rejected' && <span style={{ display: 'block', color: '#ef4444', marginTop: '1rem' }}>Your previous application was passed. You may re-apply below.</span>}
                    </p>
                    <button onClick={() => setShowVendorApp(true)} className="btn-gold">APPLY FOR PARTNERSHIP</button>
                  </div>
                )}

                {profile?.vendor_status === 'pending' && (
                  <div className="glass" style={{ padding: '3rem', borderRadius: '2rem', textAlign: 'center', border: '1px solid var(--border-glass)' }}>
                     <div style={{ width: '80px', height: '80px', margin: '0 auto 2rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={40} color="#eab308" />
                    </div>
                    <h4 className="luxury-font" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Application Under Review</h4>
                    <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto' }}>
                      Your application is currently being reviewed by our administrative team. We will notify you once a decision has been made.
                    </p>
                  </div>
                )}

                {profile?.vendor_status === 'approved' && (
                  <div className="glass" style={{ padding: '3rem', borderRadius: '2rem', textAlign: 'center', border: '1px solid var(--accent-gold)' }}>
                     <div style={{ width: '80px', height: '80px', margin: '0 auto 2rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={40} color="#4ade80" />
                    </div>
                    <h4 className="luxury-font" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Verified Partner</h4>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                      Welcome back, <strong style={{ color: 'white' }}>{profile.business_name}</strong>. Access your dashboard to manage inventory and view insights.
                    </p>
                    <button 
                      onClick={() => window.location.href = '/vendor.html'} 
                      className="btn-gold" 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                    >
                      <Store size={18} />
                      OPEN VENDOR PORTAL
                      <ExternalLink size={14} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const NavTab = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    style={{
      width: '100%',
      padding: '1.2rem',
      borderRadius: '1rem',
      border: 'none',
      background: active ? 'var(--accent-gold-soft)' : 'transparent',
      color: active ? 'var(--accent-gold)' : 'var(--text-muted)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontWeight: 600,
      fontSize: '0.75rem',
      letterSpacing: '1.5px'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      {icon}
      <span>{label}</span>
    </div>
    {active && <ChevronRight size={14} />}
  </button>
);

const StatCard = ({ label, value }: { label: string, value: any }) => (
  <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1.2rem', border: '1px solid var(--border-glass)' }}>
    <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', letterSpacing: '2px', fontWeight: 800, marginBottom: '0.5rem' }}>{label}</div>
    <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{value}</div>
  </div>
);

const InfoItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
    <div style={{ width: '45px', height: '45px', background: 'rgba(255,255,255,0.03)', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.2rem' }}>{value}</div>
    </div>
  </div>
);

const Benefit = ({ label, active }: { label: string, active: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: active ? 1 : 0.3 }}>
    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: active ? 'var(--accent-gold)' : 'transparent', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {active && <ShieldCheck size={12} color="black" />}
    </div>
    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{label}</span>
  </div>
);
