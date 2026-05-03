import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  { label: 'SUVs', count: '120+ Vehicles', icon: 'SUV' },
  { label: 'Sedans', count: '95+ Vehicles', icon: 'Saloon' },
  { label: 'Sports', count: '45+ Vehicles', icon: 'Sports' },
  { label: 'Luxury', count: '30+ Vehicles', icon: 'Luxury' },
  { label: 'Electric', count: '25+ Vehicles', icon: 'Electric' },
  { label: 'Pickup', count: '55+ Vehicles', icon: 'Pickup' }
];

export const CategoriesPage = ({ onClose, onSelectCategory }: { onClose: () => void, onSelectCategory: (cat: string) => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="page-container"
      style={{ padding: '6rem 2rem', minHeight: '100vh', background: 'var(--bg-main)' }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <button onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--accent-gold)', cursor: 'pointer', marginBottom: '3rem', fontWeight: 700 }}>
          <ArrowLeft size={20} /> BACK TO HOME
        </button>

        <div style={{ marginBottom: '5rem', textAlign: 'center' }}>
          <span style={{ color: 'var(--accent-gold)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '4px' }}>DIVERSE CLASSIFICATIONS</span>
          <h1 className="luxury-font" style={{ fontSize: '4rem', marginTop: '1rem' }}>Browse Categories</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {CATEGORIES.map(cat => (
            <motion.div 
              key={cat.label}
              whileHover={{ scale: 1.05, borderColor: 'var(--accent-gold)' }}
              onClick={() => onSelectCategory(cat.label)}
              className="glass"
              style={{ padding: '4rem 2rem', borderRadius: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', border: '1px solid var(--border-glass)', textAlign: 'center' }}
            >
              <div style={{ color: 'var(--accent-gold)', marginBottom: '2rem' }}>
                <CategoryIcon type={cat.icon} />
              </div>
              <h3 className="luxury-font" style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{cat.label}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>{cat.count}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const CategoryIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'SUV': return <svg width="60" height="30" viewBox="0 0 48 24" fill="currentColor"><path d="M2,18 L2,14 C2,12 4,11 6,11 L10,11 L15,6 L35,6 L42,12 L46,14 L46,18 L44,18 L44,16 C44,14 42,14 42,16 L42,18 L34,18 L34,16 C34,14 32,14 32,16 L32,18 L16,18 L16,16 C16,14 14,14 14,16 L14,18 L6,18 L6,16 C6,14 4,14 4,16 L4,18 L2,18 Z" /></svg>;
    case 'Saloon': return <svg width="60" height="30" viewBox="0 0 48 24" fill="currentColor"><path d="M2,18 L2,15 C2,13 4,12 6,12 L12,12 L18,8 L32,8 L40,12 L44,12 L46,15 L46,18 L2,18 Z" /></svg>;
    case 'Sports': return <svg width="60" height="30" viewBox="0 0 48 24" fill="currentColor"><path d="M2,18 L2,16 L6,16 L14,11 L35,11 L44,15 L46,16 L46,18 L2,18 Z" /></svg>;
    case 'Luxury': return <svg width="60" height="30" viewBox="0 0 48 24" fill="currentColor"><path d="M4,18 L4,14 C4,10 8,8 10,8 L15,8 L20,4 L35,4 L40,8 L44,8 C46,8 48,10 48,14 L48,18 L4,18 Z" /></svg>;
    case 'Electric': return <svg width="60" height="30" viewBox="0 0 48 24" fill="currentColor"><path d="M10,18 L10,12 L15,6 L35,6 L40,12 L40,18 L10,18 Z M24,10 L20,14 L24,14 L20,18 L28,12 L24,12 L28,8 L24,10 Z" /></svg>;
    case 'Pickup': return <svg width="60" height="30" viewBox="0 0 48 24" fill="currentColor"><path d="M2,18 L2,12 L15,12 L22,6 L38,6 L38,18 L2,18 Z M38,10 L46,10 L46,18 L38,18 L38,10 Z" /></svg>;
    default: return null;
  }
};
