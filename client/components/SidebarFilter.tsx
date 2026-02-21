import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, MapPin, Tag, Award, Percent, DollarSign } from 'lucide-react';
import { formatPrice } from '../../shared/lib/formatters';

const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const CAR_CONDITIONS = ["Foreign Used", "Nigerian Used", "New"];
const CAR_BODY_TYPES = ["SUV", "Saloon", "Coupe", "Convertible", "Sports", "Pickup", "Crossover", "Hatchback", "Van", "Wagon", "Limousine", "Other"];

interface FilterState {
  priceRange: [number, number];
  conditions: string[];
  bodyTypes: string[];
  locations: string[];
  verifiedOnly: boolean;
  discountOnly: boolean;
}

interface SidebarFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  priceBounds: [number, number]; // Min and max price from actual data
  counts?: {
    conditions: Record<string, number>;
    bodyTypes: Record<string, number>;
    locations: Record<string, number>;
  };
}

const FilterSection = ({ title, icon: Icon, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1.5rem' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer',
          marginBottom: isOpen ? '1rem' : '0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Icon size={16} color="var(--accent-gold)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px' }}>{title.toUpperCase()}</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarFilter = ({ filters, onFilterChange, priceBounds, counts }: SidebarFilterProps) => {
  
  const handleCheckboxChange = (category: 'conditions' | 'locations' | 'bodyTypes', value: string) => {
    const current = filters[category];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    onFilterChange({ ...filters, [category]: updated });
  };

  const handleToggle = (key: 'verifiedOnly' | 'discountOnly') => {
    onFilterChange({ ...filters, [key]: !filters[key] });
  };

  return (
    <div className="glass" style={{ padding: 'clamp(1rem, 2vw, 2rem)', borderRadius: '1rem', width: '100%', height: 'fit-content' }}>
      <div style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', marginBottom: '2rem' }}>Refine Selection</div>

      {/* Verified & Discount Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
             <Award size={16} color="var(--accent-gold)" />
             <span style={{ fontSize: '0.9rem' }}>Verified Sellers</span>
          </div>
          <input 
            type="checkbox" 
            checked={filters.verifiedOnly} 
            onChange={() => handleToggle('verifiedOnly')}
            style={{ accentColor: 'var(--accent-gold)', width: '16px', height: '16px' }} 
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
             <Percent size={16} color="var(--accent-gold)" />
             <span style={{ fontSize: '0.9rem' }}>Discount Deals</span>
          </div>
          <input 
            type="checkbox" 
            checked={filters.discountOnly} 
            onChange={() => handleToggle('discountOnly')}
            style={{ accentColor: 'var(--accent-gold)', width: '16px', height: '16px' }} 
          />
        </label>
      </div>

      {/* Price Range */}
      <FilterSection title="Price Range" icon={DollarSign} defaultOpen={true}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>MIN PRICE</label>
              <input 
                type="number" 
                value={filters.priceRange[0] === 0 ? '' : filters.priceRange[0]} 
                onChange={(e) => onFilterChange({ ...filters, priceRange: [Number(e.target.value) || 0, filters.priceRange[1]] })}
                placeholder="0"
                className="admin-input" // Reusing admin-input style if available, else inline
                style={{ 
                  width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--border-glass)', borderRadius: '0.4rem', color: 'var(--text-main)', fontSize: '0.9rem' 
                }}
              />
            </div>
            <span style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>-</span>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.3rem', display: 'block' }}>MAX PRICE</label>
              <input 
                type="number" 
                value={filters.priceRange[1] >= 1000000000 ? '' : filters.priceRange[1]} 
                onChange={(e) => onFilterChange({ ...filters, priceRange: [filters.priceRange[0], Number(e.target.value) || 1000000000] })}
                placeholder="Max"
                style={{ 
                   width: '100%', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', 
                   border: '1px solid var(--border-glass)', borderRadius: '0.4rem', color: 'var(--text-main)', fontSize: '0.9rem' 
                }}
              />
            </div>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', textAlign: 'center' }}>
            {formatPrice(filters.priceRange[0])} — {filters.priceRange[1] >= 1000000000 ? 'Any' : formatPrice(filters.priceRange[1])}
          </div>
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition" icon={Tag} defaultOpen={true}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {CAR_CONDITIONS.map(condition => (
            <label key={condition} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ 
                width: '18px', height: '18px', borderRadius: '4px', border: '1px solid var(--border-glass)',
                background: filters.conditions.includes(condition) ? 'var(--accent-gold)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {filters.conditions.includes(condition) && <Check size={12} color="black" />}
              </div>
              <input 
                type="checkbox" 
                style={{ display: 'none' }}
                checked={filters.conditions.includes(condition)}
                onChange={() => handleCheckboxChange('conditions', condition)}
              />
              <span style={{ flex: 1 }}>{condition}</span>
              {counts?.conditions && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.7 }}>{counts.conditions[condition] || 0}</span>}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Architecture (Body Type) */}
      <FilterSection title="Architecture" icon={Tag} defaultOpen={true}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {CAR_BODY_TYPES.map(type => (
            <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ 
                width: '18px', height: '18px', borderRadius: '4px', border: '1px solid var(--border-glass)',
                background: filters.bodyTypes?.includes(type) ? 'var(--accent-gold)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {filters.bodyTypes?.includes(type) && <Check size={12} color="black" />}
              </div>
              <input 
                type="checkbox" 
                style={{ display: 'none' }}
                checked={filters.bodyTypes?.includes(type)}
                onChange={() => handleCheckboxChange('bodyTypes', type)}
              />
              <span style={{ flex: 1 }}>{type}</span>
              {counts?.bodyTypes && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.7 }}>{counts.bodyTypes[type] || 0}</span>}
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Location */}
      <FilterSection title="Location" icon={MapPin}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {NIGERIAN_STATES.map(state => (
             <label key={state} style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ 
                width: '18px', height: '18px', borderRadius: '4px', border: '1px solid var(--border-glass)',
                background: filters.locations.includes(state) ? 'var(--accent-gold)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {filters.locations.includes(state) && <Check size={12} color="black" />}
              </div>
              <input 
                type="checkbox" 
                style={{ display: 'none' }}
                checked={filters.locations.includes(state)}
                onChange={() => handleCheckboxChange('locations', state)}
              />
              <span style={{ flex: 1 }}>{state}</span>
              {counts?.locations && (counts.locations[state] || 0) > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.7 }}>{counts.locations[state]}</span>
              )}
            </label>
          ))}
        </div>
      </FilterSection>
      
      {/* Reset Button */}
      <button 
        onClick={() => onFilterChange({ priceRange: priceBounds, conditions: [], bodyTypes: [], locations: [], verifiedOnly: false, discountOnly: false })}
        style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'var(--text-muted)', borderRadius: '0.5rem', cursor: 'pointer', marginTop: '1rem', fontSize: '0.8rem' }}
      >
        RESET FILTERS
      </button>

    </div>
  );
};
