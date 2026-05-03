import { motion, AnimatePresence } from 'framer-motion';
import { db, type Order } from '../../shared/lib/db';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../shared/lib/AuthContext';
import { formatPrice } from '../../shared/lib/formatters';
import { generateInvoice } from '../utils/invoiceGenerator';
import { VendorApplication } from './VendorApplication';
import { MessagingPanel } from './MessagingPanel';
import {
  Package,
  Clock,
  ShieldCheck,
  X,
  User,
  Mail,
  Calendar,
  ChevronRight,
  Store,
  ExternalLink,
  CreditCard,
  Settings,
  LayoutGrid,
  Gem,
  Building2,
  MessageSquare,
  TrendingUp,
  Car,
  Hourglass,
  Box,
  Headphones
} from 'lucide-react';

/* ─── colours & tokens ────────────────────────────────────── */
const GOLD = 'var(--accent-gold)';
const MUTED = 'var(--text-muted)';
const BORDER = 'var(--border-glass)';

/* ═══════════════════════════════════════════════════════════ */
export const UserProfile = ({ onClose }: { onClose: () => void }) => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [platformSettings, setPlatformSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'acquisitions' | 'messages' | 'details' | 'membership' | 'vendor'
  >('acquisitions');
  const [showVendorApp, setShowVendorApp] = useState(false);
  // track unread message count (placeholder – wire up to real data later)
  const unreadMessages = 2;

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const data = await db.getOrders();
        const settings = await db.getPlatformSettings();
        setOrders(data.filter(o => o.user_id === user.id));
        setPlatformSettings(settings);
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
    inProgress: orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length,
    membershipTier: orders.length > 5 ? 'PLATINUM' : orders.length > 2 ? 'GOLD' : 'SILVER',
  }), [orders]);

  if (showVendorApp) {
    return <VendorApplication onClose={() => setShowVendorApp(false)} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 16 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '1.5rem',
        overflow: 'hidden',
        background: '#111008',
        border: `1px solid ${BORDER}`,
        boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        position: 'relative',
      }}
    >
      {/* ── Close ── */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: '1rem', right: '1rem',
          background: 'rgba(255,255,255,0.06)', border: 'none',
          color: 'rgba(255,255,255,0.6)', cursor: 'pointer',
          zIndex: 100, padding: '6px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
        aria-label="Close"
      >
        <X size={18} />
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* ════════════════ SIDEBAR ════════════════ */}
        <aside style={{
          background: 'rgba(255,255,255,0.02)',
          borderRight: `1px solid ${BORDER}`,
          display: 'flex', flexDirection: 'column',
          padding: '2.5rem 1.2rem 1.5rem',
          gap: '0',
          overflowY: 'auto',
        }}>
          {/* Avatar */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              position: 'relative', width: '80px', height: '80px',
              margin: '0 auto 1rem',
            }}>
              {/* ring */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                border: `2px solid ${GOLD}`,
                boxShadow: `0 0 18px rgba(197,160,89,0.25)`,
              }} />
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%',
                background: 'rgba(197,160,89,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={34} color={GOLD} strokeWidth={1.5} />
              </div>
              {/* shield badge */}
              <div style={{
                position: 'absolute', bottom: 1, right: 1,
                background: GOLD, borderRadius: '50%',
                width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid #111008',
              }}>
                <ShieldCheck size={10} color="#000" strokeWidth={2.5} />
              </div>
            </div>

            <div style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: '0.35rem' }}>
              {profile?.full_name || user?.email?.split('@')[0] || 'admin'}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: '0.3rem',
              color: GOLD, fontSize: '0.6rem', fontWeight: 800,
              letterSpacing: '2px',
            }}>
              <ShieldCheck size={10} />
              {stats.membershipTier} MEMBER
            </div>
          </div>

          {/* Nav */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            <SidebarTab
              active={activeTab === 'acquisitions'}
              onClick={() => setActiveTab('acquisitions')}
              icon={<LayoutGrid size={16} />}
              label="ACQUISITIONS"
            />
            <SidebarTab
              active={activeTab === 'messages'}
              onClick={() => setActiveTab('messages')}
              icon={<MessageSquare size={16} />}
              label="MESSAGES"
              badge={unreadMessages}
            />
            <SidebarTab
              active={activeTab === 'details'}
              onClick={() => setActiveTab('details')}
              icon={<User size={16} />}
              label="ACCOUNT INFO"
            />
            <SidebarTab
              active={activeTab === 'membership'}
              onClick={() => setActiveTab('membership')}
              icon={<ShieldCheck size={16} />}
              label="MEMBERSHIP"
            />
            <SidebarTab
              active={activeTab === 'vendor'}
              onClick={() => setActiveTab('vendor')}
              icon={<Store size={16} />}
              label="VENDOR PORTAL"
            />

            {/* Contact Concierge */}
            <div style={{ margin: '1rem 0 0.5rem' }}>
              <button
                onClick={() => {
                  const event = new CustomEvent('open-chat', { detail: { carId: null, vendorId: null } });
                  window.dispatchEvent(event);
                  onClose();
                }}
                style={{
                  width: '100%', padding: '0.85rem 1rem',
                  borderRadius: '0.7rem',
                  border: `1px solid ${GOLD}`,
                  background: 'rgba(197,160,89,0.06)',
                  color: GOLD,
                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                  cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.65rem', letterSpacing: '1.5px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(197,160,89,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(197,160,89,0.06)')}
              >
                <Headphones size={16} />
                CONTACT CONCIERGE
              </button>
            </div>

            <SidebarTab
              active={false}
              onClick={() => {}}
              icon={<Settings size={16} />}
              label="SETTINGS"
            />
          </div>
        </aside>

        {/* ════════════════ CONTENT ════════════════ */}
        <main style={{ overflowY: 'auto', padding: '2.5rem 2.2rem' }}>
          <AnimatePresence mode="wait">

            {/* ── ACQUISITIONS ── */}
            {activeTab === 'acquisitions' && (
              <motion.div
                key="acquisitions"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.6rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>
                      Portfolio{' '}
                      <span style={{ color: GOLD, fontStyle: 'italic' }}>Ledger.</span>
                    </h2>
                    <p style={{ color: MUTED, fontSize: '0.82rem', marginTop: '0.4rem' }}>
                      Track and manage your curated automotive investments.
                    </p>
                  </div>
                  <button
                    style={{
                      padding: '0.55rem 1rem',
                      border: `1px solid ${GOLD}`,
                      borderRadius: '0.5rem',
                      background: 'transparent',
                      color: GOLD,
                      fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      transition: 'background 0.2s',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(197,160,89,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    View Full Portfolio <ExternalLink size={12} />
                  </button>
                </div>

                {/* 3-col stat cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <StatCard
                    label="TOTAL PORTFOLIO VALUE"
                    value={stats.totalInvestment ? formatPrice(stats.totalInvestment) : '₦0'}
                    icon={<TrendingUp size={30} color={GOLD} strokeWidth={1.5} />}
                    sub={`• 0% vs last month`}
                  />
                  <StatCard
                    label="TOTAL ASSETS"
                    value={String(stats.acquisitionCount)}
                    icon={<Car size={30} color={GOLD} strokeWidth={1.5} />}
                    sub={`• ${stats.acquisitionCount} active`}
                  />
                  <StatCard
                    label="ACQUISITIONS IN PROGRESS"
                    value={String(stats.inProgress)}
                    icon={<Hourglass size={30} color={GOLD} strokeWidth={1.5} />}
                    sub={`• ${stats.inProgress} pending`}
                  />
                </div>

                {/* Orders list / empty state */}
                {loading ? (
                  <div style={{ padding: '4rem', textAlign: 'center', color: MUTED, letterSpacing: '2px', fontSize: '0.7rem' }}>
                    SYNCHRONIZING SECURE LEDGER...
                  </div>
                ) : orders.length === 0 ? (
                  <EmptyAcquisitions onBrowse={onClose} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {orders.map(order => (
                      <OrderRow key={order.id} order={order} platformSettings={platformSettings} />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── MESSAGES ── */}
            {activeTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
                style={{ height: '500px', display: 'flex', flexDirection: 'column' }}
              >
                <header style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.1 }}>
                    Messages<span style={{ color: GOLD, fontStyle: 'italic' }}>.</span>
                  </h2>
                  <p style={{ color: MUTED, fontSize: '0.82rem', marginTop: '0.4rem' }}>
                    Your conversations with vendors and concierge.
                  </p>
                </header>
                <div style={{ flex: 1, border: `1px solid ${BORDER}`, borderRadius: '1rem', overflow: 'hidden' }}>
                  <MessagingPanel userId={user?.id || ''} role={profile?.role || 'customer'} height="100%" />
                </div>
              </motion.div>
            )}

            {/* ── ACCOUNT INFO ── */}
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                <header style={{ marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Member <span style={{ color: GOLD, fontStyle: 'italic' }}>Profile.</span>
                  </h2>
                  <p style={{ color: MUTED, fontSize: '0.82rem', marginTop: '0.4rem' }}>
                    Confidential identity and secure contact information.
                  </p>
                </header>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                  <InfoItem icon={<User size={20} />} label="FULL NAME" value={profile?.full_name || 'Not Provided'} />
                  <InfoItem icon={<Mail size={20} />} label="SECURE EMAIL" value={user?.email || 'Not Provided'} />
                  <InfoItem
                    icon={<Calendar size={20} />}
                    label="MEMBER SINCE"
                    value={new Date(profile?.created_at || user?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  />
                  <InfoItem icon={<CreditCard size={20} />} label="PREFERRED CURRENCY" value="NGN (₦)" />
                </div>
              </motion.div>
            )}

            {/* ── MEMBERSHIP ── */}
            {activeTab === 'membership' && (
              <motion.div
                key="membership"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                <header style={{ marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Member <span style={{ color: GOLD, fontStyle: 'italic' }}>Access.</span>
                  </h2>
                  <p style={{ color: MUTED, fontSize: '0.82rem', marginTop: '0.4rem' }}>
                    Your status within the Transhub ecosystem.
                  </p>
                </header>
                <div style={{
                  padding: '2rem', borderRadius: '1.2rem',
                  border: `1px solid ${GOLD}`,
                  background: 'linear-gradient(135deg, rgba(197,160,89,0.06) 0%, transparent 100%)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.8rem' }}>
                    <div style={{ width: '52px', height: '52px', background: GOLD, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Gem size={26} color="#000" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.6rem', color: GOLD, letterSpacing: '3px', fontWeight: 800 }}>CURRENT STANDING</div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800 }}>{stats.membershipTier} ACCOUNT</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                    <Benefit label="Priority Auction Access" active={true} />
                    <Benefit label="Complimentary Global Freight" active={stats.membershipTier !== 'SILVER'} />
                    <Benefit label="Concierge Sourcing" active={stats.membershipTier === 'PLATINUM'} />
                    <Benefit label="Pre-market Catalog Previews" active={true} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── VENDOR PORTAL ── */}
            {activeTab === 'vendor' && (
              <motion.div
                key="vendor"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25 }}
              >
                <header style={{ marginBottom: '2.5rem' }}>
                  <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Vendor <span style={{ color: GOLD, fontStyle: 'italic' }}>Portal.</span>
                  </h2>
                  <p style={{ color: MUTED, fontSize: '0.82rem', marginTop: '0.4rem' }}>
                    Manage your dealership presence and inventory.
                  </p>
                </header>

                {(!profile?.vendor_status || profile.vendor_status === 'none' || profile.vendor_status === 'rejected') && (
                  <div style={{ padding: '3rem', borderRadius: '1.2rem', textAlign: 'center', border: `1px solid ${BORDER}` }}>
                    <div style={{ width: '72px', height: '72px', margin: '0 auto 1.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={36} color={GOLD} />
                    </div>
                    <h4 className="luxury-font" style={{ fontSize: '1.4rem', marginBottom: '0.8rem' }}>Become a Partner</h4>
                    <p style={{ color: MUTED, marginBottom: '2rem', maxWidth: '360px', margin: '0 auto 2rem' }}>
                      Join our exclusive network of certified dealers. List your luxury inventory on Transhub.
                      {profile?.vendor_status === 'rejected' && (
                        <span style={{ display: 'block', color: '#ef4444', marginTop: '0.8rem' }}>
                          Your previous application was passed. You may re-apply below.
                        </span>
                      )}
                    </p>
                    <button onClick={() => setShowVendorApp(true)} className="btn-gold">APPLY FOR PARTNERSHIP</button>
                  </div>
                )}

                {profile?.vendor_status === 'pending' && (
                  <div style={{ padding: '3rem', borderRadius: '1.2rem', textAlign: 'center', border: `1px solid ${BORDER}` }}>
                    <div style={{ width: '72px', height: '72px', margin: '0 auto 1.5rem', background: 'rgba(234,179,8,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Clock size={36} color="#eab308" />
                    </div>
                    <h4 className="luxury-font" style={{ fontSize: '1.4rem', marginBottom: '0.8rem' }}>Application Under Review</h4>
                    <p style={{ color: MUTED, maxWidth: '360px', margin: '0 auto' }}>
                      Your application is currently being reviewed by our team. We'll notify you of the decision.
                    </p>
                  </div>
                )}

                {profile?.vendor_status === 'approved' && (
                  <div style={{ padding: '3rem', borderRadius: '1.2rem', textAlign: 'center', border: `1px solid ${GOLD}` }}>
                    <div style={{ width: '72px', height: '72px', margin: '0 auto 1.5rem', background: 'rgba(74,222,128,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={36} color="#4ade80" />
                    </div>
                    <h4 className="luxury-font" style={{ fontSize: '1.4rem', marginBottom: '0.8rem' }}>Verified Partner</h4>
                    <p style={{ color: MUTED, marginBottom: '2rem' }}>
                      Welcome back, <strong style={{ color: '#fff' }}>{profile.business_name}</strong>. Access your dashboard to manage inventory.
                    </p>
                    <button
                      onClick={() => window.location.href = '/vendor.html'}
                      className="btn-gold"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}
                    >
                      <Store size={16} /> OPEN VENDOR PORTAL <ExternalLink size={13} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* SUB-COMPONENTS                                              */
/* ─────────────────────────────────────────────────────────── */

const GOLD_C = '#c5a059';
const BORDER_C = 'rgba(255,255,255,0.07)';
const MUTED_C = 'rgba(255,255,255,0.42)';

const SidebarTab = ({
  active, onClick, icon, label, badge
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; badge?: number }) => (
  <button
    onClick={onClick}
    style={{
      width: '100%', padding: '0.85rem 1rem',
      borderRadius: '0.6rem', border: 'none',
      background: active ? 'rgba(197,160,89,0.12)' : 'transparent',
      color: active ? GOLD_C : MUTED_C,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      cursor: 'pointer', transition: 'all 0.2s',
      fontWeight: 700, fontSize: '0.65rem', letterSpacing: '1.5px',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {icon}
      <span>{label}</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      {badge != null && badge > 0 && (
        <span style={{
          background: GOLD_C, color: '#000', borderRadius: '999px',
          fontSize: '0.55rem', fontWeight: 900, padding: '1px 6px', lineHeight: '1.6',
        }}>{badge}</span>
      )}
      {active && <ChevronRight size={13} color={GOLD_C} />}
    </div>
  </button>
);

const StatCard = ({
  label, value, icon, sub
}: { label: string; value: string; icon: React.ReactNode; sub: string }) => (
  <div style={{
    padding: '1.2rem 1.1rem',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '0.9rem',
    border: `1px solid ${BORDER_C}`,
  }}>
    <div style={{ fontSize: '0.55rem', color: MUTED_C, letterSpacing: '2px', fontWeight: 800, marginBottom: '0.6rem' }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <span style={{ fontSize: '1.9rem', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{value}</span>
      <span style={{ opacity: 0.5 }}>{icon}</span>
    </div>
    <div style={{ fontSize: '0.65rem', color: MUTED_C, marginTop: '0.6rem' }}>{sub}</div>
  </div>
);

const EmptyAcquisitions = ({ onBrowse }: { onBrowse: () => void }) => (
  <div style={{
    padding: '3.5rem 2rem',
    border: `1px solid ${BORDER_C}`,
    borderRadius: '1rem',
    textAlign: 'center',
  }}>
    {/* 3-D box placeholder */}
    <div style={{
      position: 'relative', width: '72px', height: '72px',
      margin: '0 auto 1.5rem',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* sparkle dots */}
      {[[-18, -18], [18, -22], [-22, 10], [22, 12]].map(([tx, ty], i) => (
        <span key={i} style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: `translate(${tx}px, ${ty}px)`,
          width: 4, height: 4,
          borderRadius: '50%',
          background: GOLD_C, opacity: 0.5,
        }} />
      ))}
      <Box size={32} color={GOLD_C} strokeWidth={1.5} />
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>No Acquisitions Yet</h3>
    <p style={{ color: MUTED_C, fontSize: '0.83rem', marginBottom: '1.6rem' }}>
      Your elite portfolio is currently awaiting its first acquisition.
    </p>
    <button
      onClick={onBrowse}
      style={{
        padding: '0.7rem 1.6rem',
        background: GOLD_C,
        border: 'none', borderRadius: '0.45rem',
        color: '#000', fontWeight: 800, fontSize: '0.78rem',
        letterSpacing: '0.5px', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        transition: 'opacity 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
    >
      Start an Acquisition <ChevronRight size={15} />
    </button>
  </div>
);

const OrderRow = ({ order, platformSettings }: { order: Order; platformSettings: any[] }) => (
  <div style={{
    padding: '1.2rem', background: 'rgba(255,255,255,0.02)',
    borderRadius: '0.9rem', border: `1px solid ${BORDER_C}`,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    transition: '0.3s',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
      <div style={{ width: '44px', height: '44px', background: 'rgba(197,160,89,0.1)', borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Package size={18} color={GOLD_C} />
      </div>
      <div>
        <div style={{ fontSize: '0.58rem', color: GOLD_C, letterSpacing: '1.5px', fontWeight: 800 }}>{order.status.toUpperCase()}</div>
        <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.15rem' }}>{order.cars?.make} {order.cars?.model}</div>
        <div style={{ fontSize: '0.7rem', color: MUTED_C, marginTop: '0.2rem' }}>ID: {order.payment_ref || order.id.slice(0, 8)}</div>
      </div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{formatPrice(order.amount)}</div>
      <div style={{ fontSize: '0.65rem', color: MUTED_C, marginTop: '0.3rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.3rem' }}>
        <Clock size={11} /> {new Date(order.created_at).toLocaleDateString()}
      </div>
      <button
        onClick={() => generateInvoice(order, platformSettings, 'RECEIPT')}
        style={{
          marginTop: '0.6rem', background: 'transparent',
          border: `1px solid ${GOLD_C}`, color: GOLD_C,
          padding: '3px 10px', borderRadius: '0.3rem',
          fontSize: '0.58rem', fontWeight: 700, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        }}
      >
        <ExternalLink size={9} /> RECEIPT
      </button>
    </div>
  </div>
);

const InfoItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
    <div style={{ width: '42px', height: '42px', background: 'rgba(255,255,255,0.03)', borderRadius: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD_C, flexShrink: 0 }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.58rem', color: MUTED_C, letterSpacing: '2px', fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.2rem' }}>{value}</div>
    </div>
  </div>
);

const Benefit = ({ label, active }: { label: string; active: boolean }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', opacity: active ? 1 : 0.3 }}>
    <div style={{
      width: '17px', height: '17px', borderRadius: '50%',
      background: active ? GOLD_C : 'transparent',
      border: `1px solid ${GOLD_C}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      {active && <ShieldCheck size={10} color="#000" />}
    </div>
    <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{label}</span>
  </div>
);
