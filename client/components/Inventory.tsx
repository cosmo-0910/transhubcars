import { useEffect, useState, useMemo } from 'react';
import { db } from '../../shared/lib/db';
import type { Car } from '../../shared/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../shared/lib/formatters';
import SearchAutocomplete from '../../shared/components/SearchAutocomplete';
import { FilterDropdown } from './FilterDropdown';


// BodyTypeCard moved to Footer.tsx

// SVG icons moved to Footer.tsx

export const Inventory = ({ onInquiry, initialStatus = 'All', hideFilters = false, title = 'The Collection.' }: { 
  onInquiry: (car: Car) => void,
  initialStatus?: 'All' | 'Readily Available' | 'Preorder',
  hideFilters?: boolean,
  title?: string
}) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Readily Available' | 'Preorder'>(initialStatus);

  useEffect(() => {
    const loadCars = async () => {
      try {
        const data = await db.getCars({ onlyApproved: true });
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
            <h2 className="luxury-font" style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', marginBottom: '0.2rem' }}>{title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '4px' }}>ELITE REGISTRY</span>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '2px' }}>{filteredCars.length} MASTERPIECES AVAILABLE</span>
            </div>
          </div>
          
          {!hideFilters && (
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap', width: 'auto', maxWidth: '100%', justifyContent: 'flex-start' }}>
               <SearchAutocomplete 
                 placeholder="SEARCH BY MODEL..." 
                 onSearch={setSearchQuery}
                 style={{ width: '240px', maxWidth: '100%' }}
               />
               
               <FilterDropdown 
                 value={filterStatus}
                 onChange={(val) => setFilterStatus(val as any)}
                 options={[
                   { label: 'ALL ACQUISITIONS', value: 'All' },
                   { label: 'READILY AVAILABLE', value: 'Readily Available' },
                   { label: 'PREORDER', value: 'Preorder' }
                 ]}
               />
            </div>
          )}
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
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 5, display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <span className="glass" style={{ 
                  fontSize: '0.65rem', 
                  padding: '0.4rem 1rem', 
                  borderRadius: '2rem',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  background: 'rgba(0,0,0,0.6)',
                  color: car.status === 'Readily Available' ? '#4ade80' : 'var(--accent-gold)',
                  border: '1px solid currentColor'
                }}>
                  {car.status.toUpperCase()}
                </span>
                
                {/* Transhub Official Badge */}
                {!car.vendor_id && (
                  <div className="glass" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    padding: '0.4rem 0.8rem', 
                    borderRadius: '2rem',
                    background: 'rgba(212, 175, 55, 0.15)',
                    border: '1px solid var(--accent-gold)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <img src="/logo.png" alt="Transhub" style={{ width: '16px', height: '16px' }} />
                    <span style={{ 
                      fontSize: '0.6rem', 
                      fontWeight: 800,
                      letterSpacing: '1px',
                      color: 'var(--accent-gold)'
                    }}>
                      TRANSHUB OFFICIAL
                    </span>
                  </div>
                )}
              </div>

              <div style={{ height: 'clamp(120px, 30vw, 240px)', overflow: 'hidden' }}>
                <img 
                  src={car.image_url} 
                  alt={`${car.make} ${car.model}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  className="smooth-transition image-zoom"
                />
              </div>
              
              <div className="mobile-card-dense" style={{ padding: '1.8rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.5rem', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '1px' }}>CERTIFIED</span>
                      <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                      <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>
                        {car.year}
                      </span>
                    </div>
                    <h3 className="luxury-font mobile-text-dense" style={{ fontSize: '1.6rem', lineHeight: '1.1' }}>
                      {car.make} {car.model}
                    </h3>
                </div>

                {/* Carwow-style Spec Row */}
                <div className="mobile-spec-dense" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '0.5rem 0', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
                  <SpecQuickInfo label="KM" value={`${(car.mileage / 1000).toFixed(0)}K`} />
                  <SpecQuickInfo label="TRANS" value={car.transmission?.slice(0, 3).toUpperCase()} />
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: 600 }}>INVESTMENT</div>
                    <div className="mobile-text-dense" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                      {formatPrice(car.price)}
                    </div>
                  </div>
                  <button 
                    className="btn-gold" 
                    style={{ padding: '0.6rem 1rem', fontSize: '0.65rem', fontWeight: 800, borderRadius: '0.4rem' }} 
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
    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{value || 'N/A'}</div>
  </div>
);
