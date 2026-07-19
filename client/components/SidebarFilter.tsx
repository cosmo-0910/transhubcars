import { useState, useEffect } from 'react';


interface FilterState {
  priceRange: [number, number];
  yearRange: [number, number];
  mileageRange: [number, number];
  conditions: string[];
  makes: string[];
  models: string[];
  bodyTypes: string[];
  locations: string[];
  transmissions: string[];
  fuels: string[];
  powertrains: string[];
  colors: string[];
  engineSize: string;
  registeredOnly: boolean;
  exchangeOnly: boolean;
  verifiedOnly: boolean;
  discountOnly: boolean;
  searchQuery?: string;
}

interface SidebarFilterProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  priceBounds: [number, number];
  counts?: {
    conditions: Record<string, number>;
    bodyTypes: Record<string, number>;
    locations: Record<string, number>;
    makes: Record<string, number>;
  };
}

export const SidebarFilter = ({ filters, onFilterChange, priceBounds }: SidebarFilterProps) => {
  const [sliderMax, setSliderMax] = useState(priceBounds[1]);

  useEffect(() => {
    setSliderMax(priceBounds[1] || 500000000);
  }, [priceBounds]);

  const handleMakeToggle = (make: string) => {
    const current = filters.makes || [];
    const updated = current.includes(make)
      ? current.filter(m => m !== make)
      : [...current, make];
    onFilterChange({ ...filters, makes: updated });
  };

  const handleBodyTypeToggle = (type: string) => {
    const current = filters.bodyTypes || [];
    // Convert 'Sedan' in mock button to database matching 'Saloon'
    const dbType = type === 'Sedan' ? 'Saloon' : type;
    const updated = current.includes(dbType)
      ? current.filter(t => t !== dbType)
      : [...current, dbType];
    onFilterChange({ ...filters, bodyTypes: updated });
  };

  const handleToggle = (key: 'verifiedOnly' | 'discountOnly' | 'registeredOnly' | 'exchangeOnly') => {
    onFilterChange({ ...filters, [key]: !filters[key] });
  };

  const handleClear = () => {
    onFilterChange({
      priceRange: priceBounds,
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
  };

  return (
    <div className="sticky top-28 space-y-8 glass-card p-6 rounded-xl text-left bg-surface-container/20">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="font-headline-md text-xl text-luxury-gold font-bold">Filters</h2>
        <button 
          onClick={handleClear}
          className="text-[10px] font-label-caps text-on-surface-variant hover:text-primary transition-colors tracking-widest font-bold"
        >
          CLEAR ALL
        </button>
      </div>

      {/* Price Slider */}
      <div className="space-y-4">
        <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider font-bold block">
          PRICE RANGE
        </label>
        <input 
          type="range"
          min={priceBounds[0] || 0}
          max={sliderMax}
          value={filters.priceRange[1]}
          onChange={(e) => onFilterChange({ ...filters, priceRange: [filters.priceRange[0], Number(e.target.value)] })}
          className="w-full h-1 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-luxury-gold"
        />
        <div className="flex justify-between text-xs font-semibold text-muted-gold mt-1">
          <span>₦{(priceBounds[0] || 0).toLocaleString()}</span>
          <span>₦{filters.priceRange[1].toLocaleString()}</span>
        </div>
      </div>

      {/* Premium Brands Checklist */}
      <div className="space-y-4">
        <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider font-bold block">
          PREMIUM BRANDS
        </label>
        <div className="space-y-2.5">
          {["Mercedes-Benz", "Lexus", "Toyota", "Porsche", "Range Rover", "Bentley"].map(brand => {
            const isChecked = filters.makes.includes(brand);
            return (
              <label key={brand} className="flex items-center group cursor-pointer text-sm">
                <input 
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleMakeToggle(brand)}
                  className="rounded border-glass-border bg-transparent text-luxury-gold focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="ml-3 font-body-md text-on-surface-variant group-hover:text-on-surface transition-colors">
                  {brand}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Body Types Grid */}
      <div className="space-y-4">
        <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider font-bold block">
          BODY TYPE
        </label>
        <div className="grid grid-cols-2 gap-2">
          {["Coupe", "SUV", "Sedan", "Convertible"].map(type => {
            const dbType = type === 'Sedan' ? 'Saloon' : type;
            const isSelected = filters.bodyTypes.includes(dbType);
            return (
              <button 
                key={type}
                onClick={() => handleBodyTypeToggle(type)}
                className={`px-3 py-2 border rounded font-body-md text-xs text-left transition-all ${
                  isSelected 
                    ? 'border-luxury-gold text-luxury-gold bg-luxury-gold/5' 
                    : 'border-glass-border text-on-surface-variant hover:border-luxury-gold hover:text-luxury-gold'
                }`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transmission dropdown */}
      <div className="space-y-4">
        <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider font-bold block">
          TRANSMISSION
        </label>
        <select 
          value={filters.transmissions[0] || 'Any'}
          onChange={(e) => {
            const val = e.target.value;
            onFilterChange({ ...filters, transmissions: val === 'Any' ? [] : [val] });
          }}
          className="w-full bg-surface border border-glass-border rounded-lg px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none cursor-pointer"
        >
          <option value="Any">Any</option>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
          <option value="Semi-Auto">Semi-Auto</option>
        </select>
      </div>

      {/* Model Year Input */}
      <div className="space-y-4">
        <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider font-bold block">
          MODEL YEAR
        </label>
        <div className="flex gap-2">
          <input 
            type="number"
            placeholder="From"
            value={filters.yearRange[0] === 1900 ? '' : filters.yearRange[0]}
            onChange={(e) => onFilterChange({ ...filters, yearRange: [Number(e.target.value) || 1900, filters.yearRange[1]] })}
            className="w-1/2 bg-surface border border-glass-border rounded px-3 py-2 text-xs focus:border-luxury-gold outline-none text-on-surface"
          />
          <input 
            type="number"
            placeholder="To"
            value={filters.yearRange[1] === 2100 ? '' : filters.yearRange[1]}
            onChange={(e) => onFilterChange({ ...filters, yearRange: [filters.yearRange[0], Number(e.target.value) || 2100] })}
            className="w-1/2 bg-surface border border-glass-border rounded px-3 py-2 text-xs focus:border-luxury-gold outline-none text-on-surface"
          />
        </div>
      </div>

      {/* Extra Toggles */}
      <div className="border-t border-glass-border pt-6 space-y-3.5">
        <label className="flex items-center justify-between group cursor-pointer text-xs">
          <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">Verified Sellers</span>
          <input 
            type="checkbox"
            checked={filters.verifiedOnly}
            onChange={() => handleToggle('verifiedOnly')}
            className="rounded border-glass-border bg-transparent text-luxury-gold focus:ring-0 w-4 h-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between group cursor-pointer text-xs">
          <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">Registered Cars</span>
          <input 
            type="checkbox"
            checked={filters.registeredOnly}
            onChange={() => handleToggle('registeredOnly')}
            className="rounded border-glass-border bg-transparent text-luxury-gold focus:ring-0 w-4 h-4 cursor-pointer"
          />
        </label>
        <label className="flex items-center justify-between group cursor-pointer text-xs">
          <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">Discount Deals</span>
          <input 
            type="checkbox"
            checked={filters.discountOnly}
            onChange={() => handleToggle('discountOnly')}
            className="rounded border-glass-border bg-transparent text-luxury-gold focus:ring-0 w-4 h-4 cursor-pointer"
          />
        </label>
      </div>

    </div>
  );
};
