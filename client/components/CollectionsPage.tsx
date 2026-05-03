import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Diamond, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../../shared/lib/db';
import type { Car } from '../../shared/lib/db';
import { VehicleCard } from './VehicleCard';

export const CollectionsPage = ({ onClose }: { onClose: () => void }) => {
  const [collections, setCollections] = useState<{ name: string, icon: any, desc: string, cars: Car[] }[]>([]);

  useEffect(() => {
    const loadCollections = async () => {
      try {
        const allCars = await db.getCars({ onlyApproved: true });
        
        const elite = allCars.filter(c => c.price >= 100000000);
        const limited = allCars.filter(c => c.is_pinned);
        const classics = allCars.filter(c => c.year < 2015);

        setCollections([
          { 
            name: 'Elite Collection', 
            icon: <Crown size={32} />, 
            desc: 'Exceptional machines for exceptional people. Our most prestigious inventory.', 
            cars: elite 
          },
          { 
            name: 'Limited Series', 
            icon: <Diamond size={32} />, 
            desc: 'Exclusive units with unique specifications and limited availability.', 
            cars: limited 
          },
          { 
            name: 'Modern Classics', 
            icon: <Sparkles size={32} />, 
            desc: 'Timeless designs that continue to define automotive excellence.', 
            cars: classics 
          }
        ]);
      } catch (err) {
        console.error('Failed to load collections:', err);
      }
    };
    loadCollections();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="page-container"
      style={{ padding: '6rem 2rem', minHeight: '100vh', background: 'var(--bg-main)' }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', marginBottom: '3rem', fontWeight: 700 }}>
          <ArrowLeft size={20} /> BACK TO HOME
        </button>

        <div style={{ marginBottom: '5rem' }}>
          <span style={{ color: 'var(--accent-gold)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '4px' }}>CURATED SELECTION</span>
          <h1 className="luxury-font" style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', marginTop: '1rem' }}>The Collections</h1>
        </div>

        {collections.map((coll) => (
          <section key={coll.name} style={{ marginBottom: '8rem' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '3rem' }}>
              <div style={{ color: 'var(--accent-gold)', background: 'rgba(197,160,89,0.1)', padding: '1.5rem', borderRadius: '50%' }}>{coll.icon}</div>
              <div>
                <h2 className="luxury-font" style={{ fontSize: '2.5rem' }}>{coll.name}</h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: '600px', marginTop: '0.5rem' }}>{coll.desc}</p>
              </div>
            </div>
            
            <div className="collection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.5rem' }}>
              {coll.cars.length > 0 ? (
                coll.cars.map(car => (
                  <VehicleCard key={car.id} car={car} onInquiry={() => window.dispatchEvent(new CustomEvent('select-car', { detail: { car } }))} />
                ))
              ) : (
                <div className="glass" style={{ padding: '3rem', borderRadius: '1.5rem', gridColumn: '1 / -1', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>Working on acquisition. Check back shortly.</p>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </motion.div>
  );
};
