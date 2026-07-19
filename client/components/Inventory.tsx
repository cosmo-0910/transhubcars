import { useEffect, useState, useMemo } from 'react';
import { db } from '../../shared/lib/db';
import type { Car } from '../../shared/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import SearchAutocomplete from '../../shared/components/SearchAutocomplete';
import { VehicleCard } from './VehicleCard';
import { SidebarFilter } from './SidebarFilter';
import { Filter, X } from 'lucide-react';

export const Inventory = ({ onInquiry, initialStatus = 'All', hideFilters = false, isHomeWidget = false, title = 'Premium Inventory', externalSearchQuery }: { 
  onInquiry: (car: Car) => void,
  initialStatus?: 'All' | 'Readily Available' | 'Preorder',
  hideFilters?: boolean,
  isHomeWidget?: boolean,
  title?: string,
  externalSearchQuery?: string
}) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || '');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Readily Available' | 'Preorder'>(initialStatus);
  const [activePillTab, setActivePillTab] = useState('All Vehicles');
  
  // Advanced Filters State
  const [filters, setFilters] = useState({
    priceRange: [0, 1500000000] as [number, number],
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

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [dynamicPriceBounds, setDynamicPriceBounds] = useState<[number, number]>([0, 1000000000]);

  // Sync external search query
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  const loadCars = async (reset = false) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const currentPage = reset ? 0 : page;
      const pageSize = isHomeWidget ? 4 : 12;
      
      const data = await db.getPaginatedCars({ 
        onlyApproved: true, 
        page: currentPage, 
        pageSize 
      });

      if (reset) {
        setCars(data);
        setPage(1);
      } else {
        setCars(prev => [...prev, ...data]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(data.length === pageSize);

      if (reset && data.length > 0) {
        const allCarsForCounts = await db.getCars({ onlyApproved: true });
        if (allCarsForCounts.length > 0) {
          const minPrice = Math.min(...allCarsForCounts.map(c => c.price));
          const maxPrice = Math.max(...allCarsForCounts.map(c => c.price));
          setDynamicPriceBounds([minPrice, maxPrice]);
          setFilters(prev => ({ ...prev, priceRange: [minPrice, maxPrice] }));
        }
      }
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCars(true);
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
      if (isHomeWidget || activePillTab !== 'All Vehicles') {
        if (activePillTab === 'Ready to Drive') _matchesBodyType = _matchesBodyType && car.status === 'Readily Available';
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
    <div className="w-full">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Sidebar Filters */}
        {!hideFilters && !isHomeWidget && (
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <SidebarFilter 
              filters={filters} 
              onFilterChange={setFilters} 
              priceBounds={dynamicPriceBounds}
            />
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 space-y-8 w-full text-left">
          
          {/* Header row & search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline-lg text-3xl font-bold text-on-surface">{title}</h1>
              <p className="font-body-md text-sm text-on-surface-variant">
                Showing {filteredCars.length} elite vehicles curated for distinction.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <SearchAutocomplete 
                placeholder="Search inventory..." 
                onSearch={setSearchQuery}
                style={{ width: '220px', height: '42px' }}
              />
              <button 
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden border border-glass-border rounded-lg px-4 py-2 text-xs font-label-caps text-luxury-gold flex items-center gap-1.5 hover:bg-luxury-gold/10"
              >
                <Filter size={14} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Quick filter pills */}
          <div className="flex justify-between items-center pb-2 border-b border-glass-border overflow-x-auto gap-4 scrollbar-hide">
            <div className="flex gap-2">
              {['All Vehicles', 'Ready to Drive', 'Under N30M', 'SUVs', 'Preorder Only'].map(tab => {
                const isActive = activePillTab === tab;
                return (
                  <button 
                    key={tab} 
                    onClick={() => {
                      setActivePillTab(tab);
                      if (tab === 'Preorder Only') setFilterStatus('Preorder');
                      else if (tab === 'Ready to Drive') setFilterStatus('Readily Available');
                      else setFilterStatus('All');
                    }}
                    className={`whitespace-nowrap px-5 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest transition-all ${
                      isActive 
                        ? 'bg-luxury-gold text-on-primary shadow-lg shadow-luxury-gold/10' 
                        : 'glass-card text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
            <button 
              onClick={() => {
                setActivePillTab('All Vehicles');
                setFilterStatus('All');
                setSearchQuery('');
                handleClearFilters();
              }} 
              className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              Clear All
            </button>
          </div>

          {/* Grid Area */}
          {filteredCars.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant opacity-60">
              <span className="text-sm font-bold">No vehicles found matching your refinement criteria.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCars.map((car, index) => (
                <div key={car.id} className="contents">
                  <VehicleCard car={car} onInquiry={onInquiry} />
                  
                  {/* Doom scroll break card */}
                  {!isHomeWidget && (index + 1) % 6 === 0 && (
                    <div className="md:col-span-2 xl:col-span-3 glass-card rounded-xl p-8 text-left relative overflow-hidden bg-gradient-to-r from-luxury-gold/5 to-transparent border border-glass-border flex items-center justify-between gap-6 flex-wrap">
                      <div className="max-w-xl">
                        <span className="text-label-caps font-label-caps text-luxury-gold text-[10px] tracking-wider font-bold mb-1.5 block">CONCIERGE ACQUISITIONS</span>
                        <h3 className="text-xl font-headline-lg font-bold text-on-surface mb-1">Looking for a specific masterpiece?</h3>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Our elite curators source high-spec, foreign-used, and brand new vehicles from globally verified private networks.
                        </p>
                      </div>
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('select-car', { detail: { openPreorder: true } }))}
                        className="bg-luxury-gold text-on-primary px-6 py-2.5 rounded-lg text-label-caps font-label-caps text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
                      >
                        REQUEST CUSTOM SOURCING
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          {hasMore && !isHomeWidget && (
            <div 
              ref={(el) => {
                if (el) {
                  const observer = new IntersectionObserver((entries) => {
                    if (entries[0].isIntersecting && !isLoading) {
                      loadCars();
                    }
                  }, { threshold: 1.0 });
                  observer.observe(el);
                }
              }} 
              className="py-10 flex justify-center items-center"
            >
              {isLoading && (
                <div className="w-8 h-8 border-2 border-glass-border border-t-luxury-gold rounded-full animate-spin"></div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[1000] z-index-mobile-overlay"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-surface z-[1001] rounded-t-2xl p-6 overflow-y-auto space-y-6 text-left border-t border-glass-border"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="font-headline-md text-lg text-luxury-gold font-bold">Refine Selection</span>
                <button className="text-on-surface-variant hover:text-luxury-gold" onClick={() => setShowMobileFilters(false)}>
                  <X size={24} />
                </button>
              </div>
              <SidebarFilter 
                filters={filters} 
                onFilterChange={setFilters} 
                priceBounds={dynamicPriceBounds} 
              />
              <button 
                className="w-full bg-luxury-gold text-on-primary py-3 rounded-lg text-label-caps font-label-caps text-xs font-bold hover:brightness-110 active:scale-95 transition-all mt-4"
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

  function handleClearFilters() {
    setFilters({
      priceRange: dynamicPriceBounds,
      yearRange: [1900, 2100],
      mileageRange: [0, 1000000],
      conditions: [],
      makes: [],
      models: [],
      bodyTypes: [],
      locations: [],
      transmissions: [],
      fuels: [],
      powertrains: [],
      colors: [],
      engineSize: '',
      registeredOnly: false,
      exchangeOnly: false,
      verifiedOnly: false,
      discountOnly: false
    });
  }
};
