import { useEffect, useState, useMemo } from 'react';
import { db, supabase } from '../../shared/lib/db';
import type { Car } from '../../shared/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../shared/lib/formatters';
import SearchAutocomplete from '../../shared/components/SearchAutocomplete';
import { FilterDropdown } from './FilterDropdown';


// BodyTypeCard moved to Footer.tsx

// SVG icons moved to Footer.tsx

import { SidebarFilter } from './SidebarFilter';
import { Filter, X } from 'lucide-react'; // Import icons

export const Inventory = ({ onInquiry, initialStatus = 'All', hideFilters = false, title = 'The Collection.', externalSearchQuery }: { 
  onInquiry: (car: Car) => void,
  initialStatus?: 'All' | 'Readily Available' | 'Preorder',
  hideFilters?: boolean,
  title?: string,
  externalSearchQuery?: string
}) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Readily Available' | 'Preorder'>(initialStatus);
  
  // Advanced Filters
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000000] as [number, number],
    yearRange: [1900, 2100] as [number, number],
    mileageRange: [0, 1000000] as [number, number],
    conditions: [] as string[],
    bodyTypes: [] as string[],
    locations: [] as string[],
    transmissions: [] as string[],
    fuels: [] as string[],
    powertrains: [] as string[],
    colors: [] as string[],
    registeredOnly: false,
    exchangeOnly: false,
    verifiedOnly: false,
    discountOnly: false
  });

  const [counts, setCounts] = useState({
    conditions: {} as Record<string, number>,
    bodyTypes: {} as Record<string, number>,
    locations: {} as Record<string, number>
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync external search query
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  useEffect(() => {
    const loadCars = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const data = await db.getRecommendedCars(user?.id);
        const approvedCars = data.filter(c => c.approval_status === 'approved');
        setCars(approvedCars);
        
        // Calculate initial counts
        const newCounts = {
          conditions: {} as Record<string, number>,
          bodyTypes: {} as Record<string, number>,
          locations: {} as Record<string, number>
        };
        approvedCars.forEach(car => {
          if (car.condition) newCounts.conditions[car.condition] = (newCounts.conditions[car.condition] || 0) + 1;
          if (car.body_type) newCounts.bodyTypes[car.body_type] = (newCounts.bodyTypes[car.body_type] || 0) + 1;
          if (car.state) newCounts.locations[car.state] = (newCounts.locations[car.state] || 0) + 1;
        });
        setCounts(newCounts);

      } catch (err) {
        console.error('Failed to load inventory:', err);
      }
    };
    loadCars();
  }, []);

  const filteredCars = useMemo(() => {
    return cars.filter(car => {
      // 1. Search Query
      const matchesSearch = `${car.make} ${car.model}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Main Status Tab
      const matchesStatus = filterStatus === 'All' || car.status === filterStatus;
      
      // 3. Sidebar Filters
      const matchesCondition = filters.conditions.length === 0 || (car.condition && filters.conditions.includes(car.condition));
      const matchesBodyType = filters.bodyTypes.length === 0 || (car.body_type && filters.bodyTypes.includes(car.body_type));
      const matchesLocation = filters.locations.length === 0 || (car.state && filters.locations.includes(car.state));
      const matchesPrice = car.price >= filters.priceRange[0] && car.price <= filters.priceRange[1];
      const matchesYear = car.year >= filters.yearRange[0] && car.year <= filters.yearRange[1];
      const matchesMileage = car.mileage <= (filters.mileageRange[1] || 1000000);
      const matchesTransmission = filters.transmissions.length === 0 || (car.transmission && filters.transmissions.includes(car.transmission));
      const matchesFuel = filters.fuels.length === 0 || (car.fuel_type && filters.fuels.includes(car.fuel_type));
      const matchesPowertrain = filters.powertrains.length === 0 || (car.powertrain && filters.powertrains.includes(car.powertrain));
      const matchesRegistered = !filters.registeredOnly || car.registered_car;
      const matchesExchange = !filters.exchangeOnly || car.exchange_possible;
      const matchesVerified = !filters.verifiedOnly || (car.vendor_id === null || (car.profiles && car.profiles.vendor_status === 'approved'));
      const matchesDiscount = !filters.discountOnly || (car.original_price && car.original_price > car.price);

      return matchesSearch && matchesStatus && matchesCondition && matchesBodyType && matchesLocation && 
             matchesPrice && matchesYear && matchesMileage && matchesTransmission && matchesFuel && 
             matchesPowertrain && matchesRegistered && matchesExchange && matchesVerified && matchesDiscount;
    });
  }, [cars, searchQuery, filterStatus, filters]);

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
               
               {/* Mobile Filter Button */}
               <button 
                 className="mobile-only btn-gold"
                 style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
                 onClick={() => setShowMobileFilters(true)}
               >
                 <Filter size={16} />
                 FILTERS
               </button>
            </div>
          )}
        </div>

        <div className="glass" style={{ height: '1px', width: '100%', marginBottom: '2rem', opacity: 0.3 }}></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: hideFilters ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', alignItems: 'start' }} className={!hideFilters ? "inventory-with-sidebar" : ""}>
        
        {/* Helper style for sidebar layout */}
        <style>{`
          @media (min-width: 769px) {
            .inventory-with-sidebar {
              grid-template-columns: 250px 1fr !important;
            }
          }
        `}</style>
        
        {/* Sidebar */}
        {!hideFilters && (
          <div className="desktop-only">
             <SidebarFilter 
               filters={filters} 
               onFilterChange={setFilters} 
               priceBounds={[0, 100000000]} // Todo: dynamic bounds
               counts={counts}
             />
          </div>
        )}

        {/* Grid */}
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
                {car.is_pinned && (
                  <span className="glass" style={{ 
                    fontSize: '0.65rem', 
                    padding: '0.4rem 1rem', 
                    borderRadius: '2rem',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    background: 'var(--accent-gold)', 
                    color: 'black',
                    boxShadow: '0 0 10px rgba(212, 175, 55, 0.5)'
                  }}>
                    PINNED
                  </span>
                )}
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
                
                {car.condition === 'New' && (
                  <span className="glass" style={{ 
                    fontSize: '0.65rem', 
                    padding: '0.2rem 0.8rem', 
                    borderRadius: '2rem',
                    fontWeight: 800,
                    letterSpacing: '1px',
                    background: '#60a5fa', 
                    color: 'white',
                    border: 'none'
                  }}>
                    BRAND NEW
                  </span>
                )}

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
                      {car.state && (
                        <>
                           <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                           <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>
                             {car.state}
                           </span>
                        </>
                      )}
                    </div>
                    <h3 className="luxury-font mobile-text-dense" style={{ fontSize: '1.6rem', lineHeight: '1.1' }}>
                      {car.make} {car.model}
                    </h3>
                </div>

                {/* Carwow-style Spec Row */}
                <div className="mobile-spec-dense" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', padding: '0.5rem 0', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
                  <SpecQuickInfo label="KM" value={`${(car.mileage / 1000).toFixed(0)}K`} />
                  <SpecQuickInfo label="TYPE" value={car.body_type ? car.body_type.toUpperCase() : 'N/A'} />
                  <SpecQuickInfo label="TRANS" value={car.transmission?.slice(0, 3).toUpperCase()} />
                </div>
                
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '1px', fontWeight: 600 }}>INVESTMENT</div>
                    <div className="mobile-text-dense" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                      {car.original_price && car.original_price > car.price && (
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.9rem', marginRight: '0.5rem' }}>{formatPrice(car.original_price)}</span>
                      )}
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

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-filter-overlay"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="mobile-filter-drawer"
            >
              <div className="mobile-filter-header">
                <span className="luxury-font" style={{ fontSize: '1.2rem' }}>Refine Selection</span>
                <button className="close-filter-btn" onClick={() => setShowMobileFilters(false)}>
                  <X size={24} />
                </button>
              </div>
              <SidebarFilter 
                filters={filters} 
                onFilterChange={setFilters} 
                priceBounds={[0, 100000000]} 
                counts={counts}
              />
              <button 
                className="btn-gold" 
                style={{ width: '100%', marginTop: '1.5rem', padding: '1rem' }}
                onClick={() => setShowMobileFilters(false)}
              >
                APPLY FILTERS ({filteredCars.length} Results)
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const SpecQuickInfo = ({ label, value }: { label: string, value: string }) => (
  <div style={{ flex: 1 }}>
    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '0.25rem' }}>{label}</div>
    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>{value || 'N/A'}</div>
  </div>
);
