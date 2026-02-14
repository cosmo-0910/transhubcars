import { useState, useEffect, useCallback } from 'react';
import { partsService } from '../services/parts.service';
import type { SparePart } from '../../shared/lib/db';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../shared/lib/formatters';
import { X } from 'lucide-react';

export const SparePartsMarketplace = ({ onSourcingRequest }: { onSourcingRequest: () => void }) => {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    condition: '',
    make: '',
    model: '',
  });

  const [suggestions, setSuggestions] = useState<Record<string, string[]>>({});

  const fetchParts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await partsService.searchParts(filters);
      setParts(data);
    } catch (err) {
      console.error('Failed to load spare parts:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    if (value.length > 0) {
      fetchSuggestions(key, value);
    } else {
      setSuggestions(prev => ({ ...prev, [key]: [] }));
    }
  };

  const fetchSuggestions = async (field: string, query: string) => {
    try {
      const results = await partsService.getFilterSuggestions(field, query);
      setSuggestions(prev => ({ ...prev, [field]: results }));
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  };

  return (
    <div className="spare-parts-marketplace">
      {/* Header Area */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="luxury-font" style={{ fontSize: 'clamp(2rem, 8vw, 3rem)' }}>Spare Parts.</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '2px' }}>GENUINE COMPONENTS FOR ELITE PERFORMANCE</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="glass" 
              style={{ padding: '0.8rem 1.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'HIDE FILTERS' : 'ADVANCED FILTERS'}
            </button>
            <button 
              className="btn-gold" 
              style={{ padding: '0.8rem 1.5rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 700 }}
              onClick={onSourcingRequest}
            >
              REQUEST SOURCING
            </button>
          </div>
        </div>

        {/* Dynamic Filter System */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <FilterInput 
                  label="PART NAME" 
                  value={filters.search} 
                  onChange={(v: string) => handleFilterChange('search', v)} 
                  placeholder="e.g. Brake Pads"
                />
                <FilterInput 
                  label="CATEGORY" 
                  value={filters.category} 
                  onChange={(v: string) => handleFilterChange('category', v)} 
                  suggestions={suggestions.category}
                  onSelect={(v: string) => handleFilterChange('category', v)}
                />
                <FilterInput 
                  label="MAKE" 
                  value={filters.make} 
                  onChange={(v: string) => handleFilterChange('make', v)} 
                  suggestions={suggestions.make}
                  onSelect={(v: string) => handleFilterChange('make', v)}
                />
                <FilterInput 
                  label="MODEL" 
                  value={filters.model} 
                  onChange={(v: string) => handleFilterChange('model', v)} 
                  suggestions={suggestions.model}
                  onSelect={(v: string) => handleFilterChange('model', v)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="glass" style={{ height: '1px', width: '100%', opacity: 0.3 }}></div>
      </div>

      {/* Grid View */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div className="loader"></div>
        </div>
      ) : (
        <motion.div layout className="inventory-grid">
          {parts.length > 0 ? (
            parts.map((part) => (
              <PartCard key={part.id} part={part} onClick={() => setSelectedPart(part)} />
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>No components found matching your criteria.</p>
              <button 
                className="btn-gold" 
                style={{ marginTop: '1rem' }}
                onClick={onSourcingRequest}
              >
                REQUEST CUSTOM SOURCING
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPart && (
          <SparePartDetails part={selectedPart} onClose={() => setSelectedPart(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterInput = ({ label, value, onChange, placeholder, suggestions = [], onSelect }: any) => {
  const [focused, setFocused] = useState(false);
  
  return (
    <div style={{ position: 'relative' }}>
      <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '0.5rem', letterSpacing: '1px' }}>{label}</label>
      <input 
        type="text"
        className="glass"
        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', padding: '0.8rem', borderRadius: '0.4rem', color: 'white', fontSize: '0.85rem' }}
        placeholder={placeholder || 'TYPE TO SEARCH...'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 200)}
      />
      {focused && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--background-card)', border: '1px solid var(--border-glass)', borderRadius: '0.4rem', marginTop: '0.5rem', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          {suggestions.map((s: string) => (
            <div 
              key={s} 
              style={{ padding: '0.8rem', cursor: 'pointer', fontSize: '0.8rem' }}
              className="glass-hover"
              onClick={() => onSelect(s)}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const PartCard = ({ part, onClick }: { part: SparePart, onClick: () => void }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="glass glass-hover smooth-transition"
    style={{ borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
    onClick={onClick}
  >
    <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
        <img 
          src={part.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop'} 
          alt={part.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          className="smooth-transition image-zoom"
        />
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
          <span className="glass" style={{ fontSize: '0.6rem', padding: '0.3rem 0.8rem', borderRadius: '2rem', fontWeight: 800, background: 'rgba(0,0,0,0.6)', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)' }}>
            {part.condition.toUpperCase()}
          </span>
        </div>
    </div>
    
    <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
       <div style={{ marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '1px' }}>{part.category.toUpperCase()}</span>
          <h3 className="luxury-font" style={{ fontSize: '1.4rem', marginTop: '0.3rem' }}>{part.name}</h3>
       </div>

       <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.5rem', padding: '0.5rem 0', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)' }}>
          COMPATIBLE: {part.vehicle_make} {part.vehicle_model} ({part.vehicle_year})
       </div>

       <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>PRICE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{formatPrice(part.price)}</div>
          </div>
          <button className="btn-gold" style={{ padding: '0.6rem 1.2rem', fontSize: '0.7rem', fontWeight: 800 }}>DETAILS</button>
       </div>
    </div>
  </motion.div>
);

const SparePartDetails = ({ part, onClose }: { part: SparePart, onClose: () => void }) => (
  <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="glass" 
      style={{ width: '100%', maxWidth: '900px', borderRadius: '2rem', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}
    >
      <div style={{ position: 'relative', height: '400px', background: 'black' }}>
        <img src={part.image_url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop'} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={24} />
        </button>
      </div>
      <div style={{ padding: '3rem', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '2px' }}>{part.category.toUpperCase()} • {part.condition.toUpperCase()}</span>
            <h3 className="luxury-font" style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{part.name}</h3>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>INVESTMENT</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{formatPrice(part.price)}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '3rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
           <div>
             <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>VEHICLE MAKE</div>
             <div style={{ fontWeight: 700 }}>{part.vehicle_make}</div>
           </div>
           <div>
             <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>MODEL COMPATIBILITY</div>
             <div style={{ fontWeight: 700 }}>{part.vehicle_model}</div>
           </div>
           <div>
             <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>YEAR</div>
             <div style={{ fontWeight: 700 }}>{part.vehicle_year}</div>
           </div>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '1rem', letterSpacing: '1px' }}>DESCRIPTION</h4>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>{part.description || 'No description provided for this component.'}</p>
        </div>

        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <button className="btn-gold" style={{ flex: 1, padding: '1.2rem', fontSize: '0.9rem', fontWeight: 800 }}>ACQUISITION PROTOCOL</button>
          <button className="glass" style={{ padding: '1.2rem 2rem', fontSize: '0.9rem', fontWeight: 700 }} onClick={onClose}>CLOSE</button>
        </div>
      </div>
    </motion.div>
  </div>
);
