import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { db, type Car, type SparePart } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import { partsService } from '../services/parts.service';
import { formatPrice } from '../../shared/lib/formatters';
import { MessagingPanel } from './MessagingPanel';
import { 
  X, 
  Plus, 
  Search, 
  CarFront,
  CheckCircle2,
  Clock,
  MessageSquare
} from 'lucide-react';

export const VendorDashboard = ({ onClose }: { onClose: () => void }) => {
  const { user, profile } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [activeTab, setActiveTab] = useState<'inventory' | 'messages'>('inventory');
  const [inventoryType, setInventoryType] = useState<'cars' | 'parts'>(
    profile?.vendor_type === 'parts' ? 'parts' : 'cars'
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (inventoryType === 'cars') fetchInventory();
    else fetchParts();
  }, [user, inventoryType]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const allCars = await db.getCars();
      setCars(allCars.filter(car => car.vendor_id === user?.id));
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchParts = async () => {
    try {
      setLoading(true);
      const allParts = await partsService.getVendorParts(user?.id || '');
      setParts(allParts);
    } catch (err) {
      console.error('Failed to fetch parts:', err);
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
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Main tab switcher */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '0.8rem' }}>
            <button
              onClick={() => setActiveTab('inventory')}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.6rem', border: 'none', background: activeTab === 'inventory' ? 'var(--accent-gold)' : 'transparent', color: activeTab === 'inventory' ? 'black' : 'white', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            ><CarFront size={14} /> INVENTORY</button>
            <button
              onClick={() => setActiveTab('messages')}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.6rem', border: 'none', background: activeTab === 'messages' ? 'var(--accent-gold)' : 'transparent', color: activeTab === 'messages' ? 'black' : 'white', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            ><MessageSquare size={14} /> MESSAGES</button>
          </div>

          {activeTab === 'inventory' && (
            <>
              {profile?.vendor_type === 'both' && (
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '0.8rem' }}>
                  <button 
                    onClick={() => setInventoryType('cars')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '0.6rem', border: 'none', background: inventoryType === 'cars' ? 'rgba(255,255,255,0.15)' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}
                  >VEHICLES</button>
                  <button 
                    onClick={() => setInventoryType('parts')}
                    style={{ padding: '0.5rem 1rem', borderRadius: '0.6rem', border: 'none', background: inventoryType === 'parts' ? 'rgba(255,255,255,0.15)' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700 }}
                  >SPARE PARTS</button>
                </div>
              )}
              <button onClick={() => setShowAddForm(true)} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.8rem 1.5rem' }}>
                <Plus size={18} /> {inventoryType === 'cars' ? 'ADD VEHICLE' : 'ADD PART'}
              </button>
            </>
          )}

          <button 
            onClick={onClose}
            style={{ width: '45px', height: '45px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Inventory Toolbar – only visible in inventory tab */}
      {activeTab === 'inventory' && (
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
      )}

      {/* Content */}
      {activeTab === 'messages' ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <MessagingPanel userId={user?.id || ''} role={profile?.role || 'vendor'} height="100%" />
        </div>
      ) : (
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
              {inventoryType === 'cars' ? (
                cars.map(car => (
                  <CarItem key={car.id} car={car} getStatusColor={getStatusColor} />
                ))
              ) : (
                parts.map(part => (
                  <PartItem key={part.id} part={part} />
                ))
              )}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {showAddForm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
             {/* Simple Add Form - In a real app this would be a separate component */}
             <div className="glass" style={{ width: '100%', maxWidth: '600px', padding: '3rem', borderRadius: '2rem', position: 'relative' }}>
                <button onClick={() => setShowAddForm(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                <h3 className="luxury-font" style={{ fontSize: '2rem', marginBottom: '2rem' }}>New {inventoryType === 'cars' ? 'Vehicle' : 'Spare Part'}</h3>
                <p>Form implementation for {inventoryType} listing would go here.</p>
                <button className="btn-gold" style={{ marginTop: '2rem', width: '100%' }} onClick={() => setShowAddForm(false)}>CLOSE</button>
             </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CarItem = ({ car, getStatusColor }: any) => (
  <div className="glass-hover" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1.2rem', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
    <div style={{ height: '180px', background: 'black', position: 'relative' }}>
      <img src={car.image_url} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.3rem 0.8rem', borderRadius: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: `1px solid ${getStatusColor(car.approval_status || 'pending')}`, color: getStatusColor(car.approval_status || 'pending'), fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
        {car.approval_status === 'approved' && <CheckCircle2 size={12} />}
        {car.approval_status || 'pending'}
      </div>
    </div>
    <div style={{ padding: '1.5rem' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{car.year} {car.make} {car.model}</div>
      <div style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>{formatPrice(car.price)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> {car.mileage.toLocaleString()} mi</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><CarFront size={14} /> {car.transmission}</span>
      </div>
    </div>
  </div>
);

const PartItem = ({ part }: { part: SparePart }) => (
  <div className="glass-hover" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1.2rem', overflow: 'hidden', border: '1px solid var(--border-glass)' }}>
    <div style={{ height: '180px', background: 'black', position: 'relative' }}>
      <img src={part.image_url} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.3rem 0.8rem', borderRadius: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid #4ade80', color: '#4ade80', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
        {part.status}
      </div>
    </div>
    <div style={{ padding: '1.5rem' }}>
      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{part.name}</div>
      <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{part.vehicle_make} {part.vehicle_model} ({part.vehicle_year})</div>
      <div style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>{formatPrice(part.price)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>Qty: {part.stock_quantity}</span>
        <span>{part.condition}</span>
      </div>
    </div>
  </div>
);
