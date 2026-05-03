import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import { useState } from 'react';

const BRANDS = [
  { name: 'Toyota', logo: 'https://logo.clearbit.com/toyota.com' },
  { name: 'Mercedes-Benz', logo: 'https://logo.clearbit.com/mercedes-benz.com' },
  { name: 'Lexus', logo: 'https://logo.clearbit.com/lexus.com' },
  { name: 'BMW', logo: 'https://logo.clearbit.com/bmw.com' },
  { name: 'Honda', logo: 'https://logo.clearbit.com/honda.com' },
  { name: 'Hyundai', logo: 'https://logo.clearbit.com/hyundai.com' },
  { name: 'Kia', logo: 'https://logo.clearbit.com/kia.com' },
  { name: 'Nissan', logo: 'https://logo.clearbit.com/nissan.com' },
  { name: 'Volkswagen', logo: 'https://logo.clearbit.com/volkswagen.com' },
  { name: 'Ford', logo: 'https://logo.clearbit.com/ford.com' },
  { name: 'Land Rover', logo: 'https://logo.clearbit.com/landrover.com' },
  { name: 'Audi', logo: 'https://logo.clearbit.com/audi.com' },
  { name: 'Porsche', logo: 'https://logo.clearbit.com/porsche.com' },
  { name: 'Tesla', logo: 'https://logo.clearbit.com/tesla.com' },
  { name: 'Chevrolet', logo: 'https://logo.clearbit.com/chevrolet.com' },
  { name: 'Jeep', logo: 'https://logo.clearbit.com/jeep.com' },
  { name: 'Mazda', logo: 'https://logo.clearbit.com/mazda.com' },
  { name: 'Subaru', logo: 'https://logo.clearbit.com/subaru.com' },
  { name: 'Volvo', logo: 'https://logo.clearbit.com/volvocars.com' },
  { name: 'Mitsubishi', logo: 'https://logo.clearbit.com/mitsubishi-motors.com' }
];

export const BrandsPage = ({ onClose, onSelectBrand }: { onClose: () => void, onSelectBrand: (brand: string) => void }) => {
  const [search, setSearch] = useState('');
  
  const filteredBrands = BRANDS.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="page-container"
      style={{ padding: '6rem 2rem', minHeight: '100vh', background: 'var(--bg-main)' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', marginBottom: '3rem', fontWeight: 700 }}>
          <ArrowLeft size={20} /> BACK TO HOME
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <span style={{ color: 'var(--accent-gold)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '4px' }}>ELITE PARTNERS</span>
            <h1 className="luxury-font" style={{ fontSize: '3.5rem', marginTop: '1rem' }}>Global Brands</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>Browse our curated collection from the world's most prestigious manufacturers.</p>
          </div>
          
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="SEARCH BRANDS..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '30px', color: 'white', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '2rem' }}>
          {filteredBrands.map(brand => (
            <motion.div 
              key={brand.name}
              whileHover={{ y: -10, background: 'rgba(197,160,89,0.05)', borderColor: 'var(--accent-gold)' }}
              onClick={() => onSelectBrand(brand.name)}
              className="glass"
              style={{ padding: '2.5rem', borderRadius: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s ease', border: '1px solid var(--border-glass)' }}
            >
              <div style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', filter: 'grayscale(1) brightness(2)' }}>
                <img src={brand.logo} alt={brand.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                     onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
              <span className="luxury-font" style={{ fontSize: '1rem', textAlign: 'center' }}>{brand.name.toUpperCase()}</span>
            </motion.div>
          ))}
        </div>
        
        {/* Top 50 recently added section teaser */}
        <div className="glass" style={{ marginTop: '6rem', padding: '4rem', borderRadius: '3rem', textAlign: 'center', background: 'linear-gradient(135deg, rgba(197,160,89,0.1) 0%, rgba(0,0,0,0) 100%)' }}>
          <h2 className="luxury-font" style={{ fontSize: '2rem' }}>Top 50 Recently Added</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem', maxWidth: '600px', margin: '1rem auto 2rem' }}>Stay ahead of the curve. Explore the 50 newest acquisitions across all brands.</p>
          <button className="btn-gold" style={{ padding: '1rem 3rem' }}>View Newest Inventory</button>
        </div>
      </div>
    </motion.div>
  );
};
