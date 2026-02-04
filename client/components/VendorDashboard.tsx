import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { db, type Car } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import { 
  X, 
  Plus, 
  Search, 
  CarFront,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

export const VendorDashboard = ({ onClose }: { onClose: () => void }) => {
  const { user, profile } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    fetchInventory();
  }, [user]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const allCars = await db.getCars();
      // Filter for cars owned by this vendor
      // Note: In a real app, RLS would handle this, but better to be explicit in client for now
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

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="luxury-form-card"
      style={{
        width: '100%',
        maxWidth: '1200px',
        height: '90vh',
        padding: '0',
        borderRadius: '2rem',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.4)' }}>
        <div>
          <h2 className="luxury-font" style={{ fontSize: '1.8rem' }}>Vendor Dashboard.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{profile?.business_name} Inventory Management</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => {}} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}>
            <Plus size={18} /> ADD LISTING
          </button>
          <button 
            onClick={onClose}
            style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

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

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
        {loading ? (
             <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', letterSpacing: '2px', fontSize: '0.8rem' }}>LOADING INVENTORY...</div>
        ) : cars.length === 0 ? (
           <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: 0.5 }}>
             <CarFront size={48} />
             <p>No vehicles in your inventory yet.</p>
           </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {cars.map(car => (
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
    </motion.div>
  );
};
