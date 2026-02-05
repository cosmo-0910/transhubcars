import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, type Car } from '../../shared/lib/db';
import { ArrowLeft, Search } from 'lucide-react';
import { formatPrice } from '../../shared/lib/formatters';

interface DiscoveryGalleryProps {
  filter: { type: 'body' | 'brand', value: string };
  onClose: () => void;
  onInquiry: (car: Car) => void;
}

export const DiscoveryGallery = ({ filter, onClose, onInquiry }: DiscoveryGalleryProps) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFilteredCars = async () => {
      setLoading(true);
      try {
        const allCars = await db.getCars({ onlyApproved: true });
        const filtered = allCars.filter(car => {
          if (filter.type === 'brand') {
            return car.make.toUpperCase() === filter.value.toUpperCase();
          } else {
            // Check in specs or model for body type
            return car.model.toLowerCase().includes(filter.value.toLowerCase()) || 
                   car.description?.toLowerCase().includes(filter.value.toLowerCase());
          }
        });
        setCars(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFilteredCars();
  }, [filter]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg-deep)',
        zIndex: 2500,
        overflowY: 'auto',
        padding: 'clamp(50px, 10vh, 100px) 2rem 5rem'
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button 
          onClick={onClose}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.8rem', 
            background: 'none', 
            border: 'none', 
            color: 'var(--text-muted)', 
            cursor: 'pointer',
            marginBottom: '3rem',
            padding: '0',
            fontSize: '0.8rem',
            letterSpacing: '2px',
            fontWeight: 700
          }}
        >
          <ArrowLeft size={16} /> BACK TO DASHBOARD
        </button>

        <div style={{ marginBottom: '4rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '5px' }}>
            {filter.type.toUpperCase()} DISCOVERY
          </span>
          <h2 className="luxury-font" style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', marginTop: '1.5rem', lineHeight: 1.1 }}>
            The {filter.value} <span style={{ color: 'var(--accent-gold)' }}>Registry.</span>
          </h2>
          <div className="glass" style={{ height: '1px', width: '100%', marginTop: '3rem', opacity: 0.15 }}></div>
        </div>

        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)', letterSpacing: '2px' }}>
            CURATING THE SELECTION...
          </div>
        ) : cars.length === 0 ? (
          <div style={{ padding: '8rem 0', textAlign: 'center' }}>
            <Search size={48} style={{ opacity: 0.2, marginBottom: '2rem' }} />
            <h3 style={{ color: 'var(--text-muted)', fontWeight: 400 }}>No models currently in our registry match this selection.</h3>
          </div>
        ) : (
          <div className="inventory-grid">
            {cars.map((car) => (
              <div 
                key={car.id} 
                className="glass glass-hover smooth-transition" 
                style={{ borderRadius: '1rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ height: '240px', overflow: 'hidden' }}>
                    <img src={car.image_url} alt={car.make} style={{ width: '100%', height: '100%', objectFit: 'cover' }} className="image-zoom" />
                </div>
                <div style={{ padding: '2rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '2px' }}>{car.year} COLLECTION</span>
                        <h3 className="luxury-font" style={{ fontSize: '1.8rem', marginTop: '0.5rem' }}>{car.make} {car.model}</h3>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{formatPrice(car.price)}</div>
                        <button className="btn-gold" style={{ padding: '0.6rem 1.2rem', fontSize: '0.7rem' }} onClick={() => onInquiry(car)}>DETAILS</button>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
