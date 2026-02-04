import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { db, type Car } from '../shared/lib/db';
import { useAuth } from '../shared/lib/AuthContext';
import { 
  Plus, 
  Search, 
  CarFront,
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  LogOut,
  Store,
  TrendingUp
} from 'lucide-react';

export default function VendorDashboard() {
  const { user, profile, signOut } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeSection, setActiveSection] = useState('inventory');

  useEffect(() => {
    if (!user) return;
    fetchInventory();
  }, [user]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const allCars = await db.getCars();
      // Filter for cars owned by this vendor
      setCars(allCars.filter(car => car.vendor_id === user?.id));
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4ade80';
      case 'pending': return '#eab308';
      case 'rejected': return '#ef4444';
      default: return 'var(--text-muted)';
    }
  };

  const filteredCars = filter === 'all' 
    ? cars 
    : cars.filter(car => (car.approval_status || 'pending') === filter);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#000' }}>
      {/* Sidebar */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{
          width: '280px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(10,10,10,0.98) 100%)',
          borderRight: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          padding: '2rem 0'
        }}
      >
        {/* Logo */}
        <div style={{ padding: '0 2rem', marginBottom: '3rem' }}>
          <div className="luxury-font" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
            Transhub.
          </div>
          <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)' }}>
            VENDOR PORTAL
          </div>
        </div>

        {/* Vendor Info */}
        <div className="glass" style={{ margin: '0 1rem 2rem 1rem', padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            BUSINESS
          </div>
          <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
            {profile?.business_name || 'Unnamed Business'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {profile?.full_name}
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 1rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-muted)', padding: '0 1rem', marginBottom: '1rem' }}>
            MANAGEMENT
          </div>
          {[
            { id: 'inventory', icon: CarFront, label: 'Inventory' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders' },
            { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                width: '100%',
                padding: '1rem',
                marginBottom: '0.5rem',
                background: activeSection === item.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                border: activeSection === item.id ? '1px solid var(--accent-gold)' : '1px solid transparent',
                borderRadius: '0.8rem',
                color: activeSection === item.id ? 'var(--accent-gold)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '0 1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem' }}>
          <button
            onClick={() => setActiveSection('settings')}
            style={{
              width: '100%',
              padding: '1rem',
              marginBottom: '0.5rem',
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: '0.8rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.9rem'
            }}
          >
            <Settings size={18} />
            Settings
          </button>
          <button
            onClick={signOut}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: '0.8rem',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.9rem'
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="luxury-font" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {activeSection === 'inventory' && 'Inventory Management'}
                {activeSection === 'orders' && 'Orders'}
                {activeSection === 'analytics' && 'Analytics'}
                {activeSection === 'settings' && 'Settings'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {activeSection === 'inventory' && `${cars.length} vehicles in your inventory`}
                {activeSection === 'orders' && 'View and manage your orders'}
                {activeSection === 'analytics' && 'Track your performance'}
                {activeSection === 'settings' && 'Manage your account'}
              </p>
            </div>
            {activeSection === 'inventory' && (
              <button className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem' }}>
                <Plus size={18} />
                ADD LISTING
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {activeSection === 'inventory' && (
          <>
            {/* Toolbar */}
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search inventory by make, model, or VIN..."
                  style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '0.8rem', color: 'white', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem', borderRadius: '0.8rem', border: '1px solid var(--border-glass)' }}>
                {['all', 'approved', 'pending', 'rejected'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setFilter(s)}
                    style={{ padding: '0.6rem 1.2rem', borderRadius: '0.6rem', border: 'none', background: filter === s ? 'var(--accent-gold)' : 'transparent', color: filter === s ? 'black' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Inventory Grid */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
              {loading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', letterSpacing: '2px', fontSize: '0.8rem' }}>LOADING INVENTORY...</div>
              ) : filteredCars.length === 0 ? (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: 0.5 }}>
                  <CarFront size={48} />
                  <p>{filter === 'all' ? 'No vehicles in your inventory yet.' : `No ${filter} vehicles.`}</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {filteredCars.map(car => (
                    <div key={car.id} className="glass-hover" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1.2rem', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
                      <div style={{ height: '180px', background: 'black', position: 'relative' }}>
                        <img src={car.image_url} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.3rem 0.8rem', borderRadius: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: `1px solid ${getStatusColor(car.approval_status || 'pending')}`, color: getStatusColor(car.approval_status || 'pending'), fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          {car.approval_status === 'approved' && <CheckCircle2 size={12} />}
                          {car.approval_status === 'rejected' && <AlertCircle size={12} />}
                          {(!car.approval_status || car.approval_status === 'pending') && <Clock size={12} />}
                          {car.approval_status || 'pending'}
                        </div>
                      </div>
                      <div style={{ padding: '1.5rem' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{car.year} {car.make} {car.model}</div>
                        <div style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>${car.price.toLocaleString()}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> {car.mileage.toLocaleString()} mi</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CarFront size={14} /> {car.transmission}</span>
                        </div>
                      </div>
                      <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '1rem' }}>
                        <button style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>EDIT</button>
                        <button style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', fontSize: '0.8rem' }}>VIEW</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Other sections placeholders */}
        {activeSection !== 'inventory' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            <div style={{ textAlign: 'center' }}>
              <Store size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p>This section is coming soon...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
