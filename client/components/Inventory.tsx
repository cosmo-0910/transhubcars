import { useEffect, useState, useMemo } from 'react';
import { db } from '../../shared/lib/db';
import type { Car } from '../../shared/lib/db';
import { Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../shared/lib/formatters';


const BodyTypeCard = ({ label, icon, active, onClick }: { label: string, icon: any, active: boolean, onClick: () => void }) => (
  <div 
    onClick={onClick}
    style={{ 
      minWidth: '130px', 
      textAlign: 'center', 
      cursor: 'pointer', 
      padding: '1.5rem', 
      borderRadius: '1rem', 
      background: active ? 'var(--accent-gold-soft)' : 'rgba(255,255,255,0.02)',
      border: active ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.05)',
      transition: '0.4s'
    }}
  >
    <div style={{ color: active ? 'var(--accent-gold)' : 'white', opacity: active ? 1 : 0.4, marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
      {icon}
    </div>
    <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px', color: active ? 'var(--accent-gold)' : 'var(--text-muted)' }}>{label}</div>
  </div>
);

// Luxury silhouette icons (Simplified SVG paths)
const SUVIcon = () => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor">
    <path d="M2,18 L2,14 C2,12 4,11 6,11 L10,11 L15,6 L35,6 L42,12 L46,14 L46,18 L44,18 L44,16 C44,14 42,14 42,16 L42,18 L34,18 L34,16 C34,14 32,14 32,16 L32,18 L16,18 L16,16 C16,14 14,14 14,16 L14,18 L6,18 L6,16 C6,14 4,14 4,16 L4,18 L2,18 Z" />
  </svg>
);
const CoupeIcon = () => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor">
    <path d="M2,18 L2,15 C2,13 4,12 6,12 L14,12 L22,7 L36,7 L44,13 L46,15 L46,18 L2,18 Z" />
  </svg>
);
const SedanIcon = () => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor">
    <path d="M2,18 L2,15 C2,13 4,12 6,12 L12,12 L18,8 L32,8 L40,12 L44,12 L46,15 L46,18 L2,18 Z" />
  </svg>
);
const SportsIcon = () => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor">
    <path d="M2,18 L2,16 L6,16 L14,11 L35,11 L44,15 L46,16 L46,18 L2,18 Z" />
  </svg>
);
const ConvertibleIcon = () => (
    <svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor">
      <path d="M2,18 L2,15 C2,13 4,12 6,12 L38,12 L45,15 L46,16 L46,18 L2,18 Z" />
    </svg>
);

export const Inventory = ({ onInquiry, onDiscoverySelect }: { 
  onInquiry: (car: Car) => void,
  onDiscoverySelect: (filter: { type: 'body' | 'brand', value: string }) => void
}) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Ready to Ship' | 'Preorder'>('All');

  useEffect(() => {
    const loadCars = async () => {
      try {
        const data = await db.getCars();
        setCars(data);
      } catch (err) {
        console.error('Failed to load inventory:', err);
      }
    };
    loadCars();
  }, []);

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      const matchesSearch = `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'All' || car.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [cars, searchQuery, filterStatus]);

  return (
    <div>
      {/* Selection Control Bar */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="luxury-font" style={{ fontSize: '3rem', marginBottom: '0.2rem' }}>The Collection.</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '4px' }}>ELITE REGISTRY</span>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '2px' }}>{filteredCars.length} MASTERPIECES AVAILABLE</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
             <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="SEARCH BY MODEL..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0.7rem 1rem 0.7rem 2.8rem', color: 'white', outline: 'none', fontSize: '0.75rem', letterSpacing: '2px', width: '240px' }}
                />
             </div>
             
             <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', cursor: 'pointer', outline: 'none' }}
            >
              <option value="All">ALL ACQUISITIONS</option>
              <option value="Ready to Ship">READY TO SHIP</option>
              <option value="Preorder">PREORDER</option>
            </select>
          </div>
        </div>

        {/* Discovery Paths (Carwow Style) */}
        <div style={{ marginBottom: '4rem' }}>
          <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '3px', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>BROWSE BY ARCHITECTURE</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }} className="no-scrollbar">
            <BodyTypeCard label="SUVs" icon={<SUVIcon />} active={searchQuery === 'SUV'} onClick={() => onDiscoverySelect({ type: 'body', value: 'SUV' })} />
            <BodyTypeCard label="COUPES" icon={<CoupeIcon />} active={searchQuery === 'Coupe'} onClick={() => onDiscoverySelect({ type: 'body', value: 'Coupe' })} />
            <BodyTypeCard label="SALOONS" icon={<SedanIcon />} active={searchQuery === 'Sedan'} onClick={() => onDiscoverySelect({ type: 'body', value: 'Sedan' })} />
            <BodyTypeCard label="SPORTS" icon={<SportsIcon />} active={searchQuery === 'Sports'} onClick={() => onDiscoverySelect({ type: 'body', value: 'Sports' })} />
            <BodyTypeCard label="CONVERTIBLES" icon={<ConvertibleIcon />} active={searchQuery === 'Convertible'} onClick={() => onDiscoverySelect({ type: 'body', value: 'Convertible' })} />
          </div>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '3px', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>ELITE MANUFACTURERS</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '3rem', opacity: 0.6 }}>
            {['FERRARI', 'LAMBORGHINI', 'PORSCHE', 'ROLLS ROYCE', 'BENTLEY', 'ASTON MARTIN', 'MCLAREN'].map(brand => (
              <span 
                key={brand} 
                onClick={() => onDiscoverySelect({ type: 'brand', value: brand })}
                style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '4px', cursor: 'pointer', color: searchQuery === brand ? 'var(--accent-gold)' : 'white', transition: '0.3s' }}
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
        
        <div className="glass" style={{ height: '1px', width: '100%', marginBottom: '2rem', opacity: 0.3 }}></div>
      </div>

      <motion.div layout className="inventory-grid">
        <AnimatePresence mode="popLayout">
          {filteredCars.map((car) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              key={car.id} 
              className="glass glass-hover smooth-transition" 
              style={{
                borderRadius: '1rem',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              {/* Status Badge Over Image */}
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 5 }}>
                <span className="glass" style={{ 
                  fontSize: '0.65rem', 
                  padding: '0.4rem 1rem', 
                  borderRadius: '2rem',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  background: 'rgba(0,0,0,0.6)',
                  color: car.status === 'Ready to Ship' ? '#4ade80' : 'var(--accent-gold)',
                  border: '1px solid currentColor'
                }}>
                  {car.status.toUpperCase()}
                </span>
              </div>

              <div style={{ height: '240px', overflow: 'hidden' }}>
                <img 
                  src={car.image_url} 
                  alt={`${car.make} ${car.model}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  className="smooth-transition image-zoom"
                />
              </div>
              
              <div style={{ padding: '1.8rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '1px' }}>CERTIFIED</span>
                      <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '2px' }}>
                        {car.year} COLLECTION
                      </span>
                    </div>
                    <h3 className="luxury-font" style={{ fontSize: '1.6rem', lineHeight: '1.1' }}>
                      {car.make} {car.model}
                    </h3>
                </div>

                {/* Carwow-style Spec Row */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.8rem', padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <SpecQuickInfo label="MILEAGE" value={`${(car.mileage / 1000).toFixed(0)}K KM`} />
                  <SpecQuickInfo label="TRANS" value={car.transmission?.slice(0, 4).toUpperCase()} />
                  <SpecQuickInfo label="FUEL" value={car.fuel_type?.toUpperCase()} />
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: 600 }}>INVESTMENT</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                      {formatPrice(car.price)}
                    </div>
                  </div>
                  <button 
                    className="btn-gold" 
                    style={{ padding: '0.8rem 1.4rem', fontSize: '0.75rem', fontWeight: 800, borderRadius: '0.5rem' }} 
                    onClick={() => onInquiry(car)}
                  >
                    DETAILS
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const SpecQuickInfo = ({ label, value }: { label: string, value: string }) => (
  <div style={{ flex: 1 }}>
    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '0.25rem' }}>{label}</div>
    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>{value || 'N/A'}</div>
  </div>
);
