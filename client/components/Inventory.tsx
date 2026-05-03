import { useEffect, useState, useMemo } from 'react';
import { db, supabase } from '../../shared/lib/db';
import type { Car } from '../../shared/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import SearchAutocomplete from '../../shared/components/SearchAutocomplete';
import { FilterDropdown } from './FilterDropdown';
import { VehicleCard } from './VehicleCard';


// BodyTypeCard moved to Footer.tsx

// SVG icons moved to Footer.tsx

import { SidebarFilter } from './SidebarFilter';
import { Filter, X } from 'lucide-react'; // Import icons

export const Inventory = ({ onInquiry, initialStatus = 'All', hideFilters = false, isHomeWidget = false, title = 'The Collection.', externalSearchQuery }: { 
  onInquiry: (car: Car) => void,
  initialStatus?: 'All' | 'Readily Available' | 'Preorder',
  hideFilters?: boolean,
  isHomeWidget?: boolean,
  title?: string,
  externalSearchQuery?: string
}) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Readily Available' | 'Preorder'>(initialStatus);
  const [activePillTab, setActivePillTab] = useState('All Vehicles');
  
  // Advanced Filters
  const [filters, setFilters] = useState({
    priceRange: [0, 1000000000] as [number, number],
    yearRange: [1900, 2100] as [number, number],
    mileageRange: [0, 1000000] as [number, number],
    conditions: [] as string[],
    makes: [] as string[],
    models: [] as string[],
    bodyTypes: [] as string[],
    locations: [] as string[],
    transmissions: [] as string[],
    fuels: [] as string[],
    powertrains: [] as string[],
    colors: [] as string[],
    engineSize: '',
    registeredOnly: false,
    exchangeOnly: false,
    verifiedOnly: false,
    discountOnly: false
  });

  const [counts, setCounts] = useState({
    conditions: {} as Record<string, number>,
    bodyTypes: {} as Record<string, number>,
    locations: {} as Record<string, number>,
    makes: {} as Record<string, number>
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [dynamicPriceBounds, setDynamicPriceBounds] = useState<[number, number]>([0, 100000000]);

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
        
        if (approvedCars.length > 0) {
          const minPrice = Math.min(...approvedCars.map(c => c.price));
          const maxPrice = Math.max(...approvedCars.map(c => c.price));
          setDynamicPriceBounds([minPrice, maxPrice]);
          setFilters(prev => ({ ...prev, priceRange: [minPrice, maxPrice] }));
        }
        
        // Calculate initial counts
        const newCounts = {
          conditions: {} as Record<string, number>,
          bodyTypes: {} as Record<string, number>,
          locations: {} as Record<string, number>,
          makes: {} as Record<string, number>
        };
        approvedCars.forEach(car => {
          if (car.condition) newCounts.conditions[car.condition] = (newCounts.conditions[car.condition] || 0) + 1;
          if (car.body_type) newCounts.bodyTypes[car.body_type] = (newCounts.bodyTypes[car.body_type] || 0) + 1;
          if (car.state) newCounts.locations[car.state] = (newCounts.locations[car.state] || 0) + 1;
          if (car.make) newCounts.makes[car.make] = (newCounts.makes[car.make] || 0) + 1;
        });
        setCounts(newCounts as any);

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
      const matchesMake = filters.makes.length === 0 || (car.make && filters.makes.includes(car.make));
      const matchesModel = filters.models.length === 0 || (car.model && filters.models.includes(car.model));
      const matchesEngine = !filters.engineSize || (car.engine && car.engine.toLowerCase().includes(filters.engineSize.toLowerCase()));
      const matchesColor = filters.colors.length === 0 || 
                          (car.exterior_color && filters.colors.some(c => car.exterior_color?.toLowerCase().includes(c.toLowerCase()))) ||
                          (car.interior_color && filters.colors.some(c => car.interior_color?.toLowerCase().includes(c.toLowerCase())));

      const matchesCondition = filters.conditions.length === 0 || (car.condition && filters.conditions.includes(car.condition));
      let _matchesBodyType = filters.bodyTypes.length === 0 || (car.body_type && filters.bodyTypes.includes(car.body_type));
      const matchesLocation = filters.locations.length === 0 || (car.state && filters.locations.includes(car.state));
      let _matchesPrice = car.price >= filters.priceRange[0] && car.price <= filters.priceRange[1];
      const matchesYear = car.year >= filters.yearRange[0] && car.year <= filters.yearRange[1];
      const matchesMileage = car.mileage <= (filters.mileageRange[1] || 1000000);
      const matchesTransmission = filters.transmissions.length === 0 || (car.transmission && filters.transmissions.includes(car.transmission));
      const matchesFuel = filters.fuels.length === 0 || (car.fuel_type && filters.fuels.includes(car.fuel_type));
      const matchesPowertrain = filters.powertrains.length === 0 || (car.powertrain && filters.powertrains.includes(car.powertrain));
      const matchesRegistered = !filters.registeredOnly || car.registered_car;
      const matchesExchange = !filters.exchangeOnly || car.exchange_possible;
      const matchesVerified = !filters.verifiedOnly || (car.vendor_id === null || (car.profiles && car.profiles.vendor_status === 'approved'));
      const matchesDiscount = !filters.discountOnly || (car.original_price && car.original_price > car.price);

      // HomeWidget Pill Overrides
      if (isHomeWidget) {
        if (activePillTab === 'Ready to Drive') _matchesBodyType = _matchesBodyType && car.status === 'Readily Available'; // Override status internally
        if (activePillTab === 'Under N30M') _matchesPrice = _matchesPrice && car.price < 30000000;
        if (activePillTab === 'SUVs') _matchesBodyType = _matchesBodyType && (car.body_type?.toLowerCase() === 'suv');
        if (activePillTab === 'Preorder Only') _matchesBodyType = _matchesBodyType && car.status === 'Preorder';
      }

      return matchesSearch && matchesStatus && matchesCondition && _matchesBodyType && matchesLocation && 
             _matchesPrice && matchesYear && matchesMileage && matchesTransmission && matchesFuel && 
             matchesPowertrain && matchesRegistered && matchesExchange && matchesVerified && matchesDiscount &&
             matchesMake && matchesModel && matchesEngine && matchesColor;
    });
  }, [cars, searchQuery, filterStatus, filters, isHomeWidget, activePillTab]);

  return (
    <div>
      {/* Selection Control Bar */}
      {isHomeWidget ? (
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'inline-flex', marginBottom: '1rem', fontSize: '0.65rem', color: 'var(--accent-gold)', letterSpacing: '2px', fontWeight: 800, padding: '4px 12px', borderRadius: '30px', border: '1px solid rgba(197, 160, 89, 0.3)', background: 'rgba(197, 160, 89, 0.1)' }}>PREMIUM SELECTION</div>
              <h2 className="luxury-font" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', lineHeight: 1.1, marginBottom: '0.5rem' }}>Find Your Next Car<br/>in Minutes</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verified listings. Transparent pricing. Fast delivery.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <SearchAutocomplete 
                 placeholder="Search by make, model..." 
                 onSearch={setSearchQuery}
                 style={{ width: '280px', maxWidth: '100%', height: '50px' }}
               />
               <button className="btn-hero-secondary" style={{ height: '50px', padding: '0 1.5rem', borderRadius: '8px', fontSize: '0.8rem' }} onClick={() => setShowMobileFilters(true)}>
                 Filters <Filter size={16} />
               </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', overflowX: 'auto', gap: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.8rem' }}>
               {['All Vehicles', 'Ready to Drive', 'Under N30M', 'SUVs', 'Preorder Only'].map(tab => {
                 const isActive = activePillTab === tab;
                 return (
                   <button 
                     key={tab} 
                     onClick={() => setActivePillTab(tab)}
                     className={isActive ? 'btn-gold' : 'btn-hero-secondary'} 
                     style={{ borderRadius: '30px', padding: '0.6rem 1.2rem', height: 'auto', fontSize: '0.8rem', whiteSpace: 'nowrap', border: isActive ? 'none' : undefined }}
                   >
                     {tab}
                   </button>
                 );
               })}
            </div>
            <button onClick={() => { setActivePillTab('All Vehicles'); setSearchQuery(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 600 }}>Clear All</button>
          </div>
        </div>
      ) : (
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
      )}

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
               priceBounds={dynamicPriceBounds}
               counts={counts}
             />
          </div>
        )}

        {/* Grid */}
        <motion.div layout className="inventory-grid">
          <AnimatePresence mode="popLayout">
            {filteredCars.map((car) => (
              <VehicleCard key={car.id} car={car} onInquiry={onInquiry} />
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
                priceBounds={dynamicPriceBounds} 
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


