import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Gauge, Settings, Droplets, Palette, Fingerprint, Hash } from 'lucide-react';
import type { Car } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import { Checkout } from './Checkout';

interface VehicleDetailProps {
  car: Car;
  onClose: () => void;
  onInquiry: () => void;
}

export const VehicleDetail = ({ car, onClose, onInquiry }: VehicleDetailProps) => {
  const allImages = [car.image_url, ...(car.gallery_urls || [])].filter(Boolean);
  const [activeImg, setActiveImg] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const { user } = useAuth();

  if (showCheckout) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
        <Checkout car={car} onClose={onClose} />
        <button 
          onClick={() => setShowCheckout(false)}
          style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem', zIndex: 100 }}
        >✕</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 3000,
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(15px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem'
      }}
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: 'min(95vh, 900px)',
          borderRadius: '2rem',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          position: 'relative',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        {/* Gallery Section */}
        <div style={{ position: 'relative', height: '100%', background: '#0a0a0a', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImg}
                src={allImages[activeImg]} 
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </AnimatePresence>
          </div>
          
          {allImages.length > 1 && (
            <div style={{ padding: '1.5rem', display: 'flex', gap: '1rem', overflowX: 'auto', background: 'rgba(0,0,0,0.4)' }}>
              {allImages.map((img, idx) => (
                <img 
                  key={idx}
                  src={img}
                  onClick={() => setActiveImg(idx)}
                  style={{ 
                    width: '80px', 
                    height: '60px', 
                    objectFit: 'cover', 
                    borderRadius: '0.5rem', 
                    cursor: 'pointer',
                    opacity: activeImg === idx ? 1 : 0.4,
                    border: activeImg === idx ? '2px solid var(--accent-gold)' : '2px solid transparent',
                    transition: '0.3s'
                  }}
                />
              ))}
            </div>
          )}
          
          <div style={{ position: 'absolute', bottom: allImages.length > 1 ? '110px' : '0', left: 0, right: 0, padding: '2.5rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
            <h2 className="luxury-font" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{car.make} {car.model}</h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 600, letterSpacing: '2px' }}>{car.year} EDITION</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>SN: {car.stock_number}</span>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ padding: '3.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
              <div>
                <h3 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{car.make} {car.model}</h3>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span>{car.year}</span>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
                  <span>{car.stock_number}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: 700 }}>RESERVE FOR</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>${car.price.toLocaleString()}</div>
              </div>
            </div>

            {/* Carwow-style Spec Summary Bar */}
            <div className="glass" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: '1.5rem', borderRadius: '1rem', gap: '1rem', marginBottom: '3rem' }}>
              <QuickSummary label="MILEAGE" value={`${car.mileage.toLocaleString()} KM`} icon={<Gauge size={18} />} />
              <QuickSummary label="ENGINE" value={car.engine?.split(' ')[0] || car.engine} icon={<Settings size={18} />} />
              <QuickSummary label="TRANS" value={car.transmission?.slice(0, 9)} icon={<Zap size={18} />} />
              <QuickSummary label="FUEL" value={car.fuel_type} icon={<Droplets size={18} />} />
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '3px', marginBottom: '1.5rem', fontWeight: 800 }}>PRIORITY SPECIFICATIONS</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <SpecItem label="Exterior" value={car.exterior_color} icon={<Palette size={16} />} />
                <SpecItem label="Interior" value={car.interior_color} icon={<Fingerprint size={16} />} />
                <SpecItem label="Engine Details" value={car.engine} icon={<Settings size={16} />} />
                <SpecItem label="VIN Reference" value={car.vin} icon={<Hash size={16} />} />
              </div>
            </div>

            <div style={{ marginBottom: '3rem' }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '3px', marginBottom: '1rem', fontWeight: 800 }}>CURATOR'S ANALYSIS</h4>
                <p style={{ lineHeight: '1.8', color: 'rgba(255,255,255,0.7)', fontSize: '1rem', fontStyle: 'italic' }}>
                  {car.description || "This specimen represents a peak in automotive engineering, offering a unique blend of heritage and contemporary performance."}
                </p>
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem' }}>
            <button 
              className="btn-gold" 
              style={{ flex: 2, padding: '1.4rem', borderRadius: '0.8rem', fontSize: '0.9rem', fontWeight: 800 }} 
              onClick={() => user ? setShowCheckout(true) : alert('Please Sign In to proceed.')}
            >
              {user ? 'PROCEED TO ACQUISITION' : 'SIGN IN TO RESERVE'}
            </button>
            <button 
              onClick={onInquiry}
              className="smooth-transition"
              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.8rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem' }}
            >
              INQUIRE
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const QuickSummary = ({ label, value, icon }: { label: string, value: string, icon: any }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>{label}</div>
    <div style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value || 'N/A'}</div>
  </div>
);

const SpecItem = ({ label, value, icon }: { label: string, value: string, icon: any }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ color: 'var(--accent-gold)', opacity: 0.8 }}>{icon}</div>
        <div>
            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>{label.toUpperCase()}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{value || 'Not Specified'}</div>
        </div>
    </div>
);
