import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Gauge, Settings, Droplets, Palette, Fingerprint, Hash, Store, MessageSquare } from 'lucide-react';
import { db, type Car } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import { Checkout } from './Checkout';
import { formatPrice } from '../../shared/lib/formatters';

interface VehicleDetailProps {
  car: Car;
  onClose: () => void;
  onInquiry: () => void;
  onVendorClick: (vendorId: string) => void;
}

export const VehicleDetail = ({ car, onClose, onInquiry, onVendorClick }: VehicleDetailProps) => {
  const allImages = [car.image_url, ...(car.gallery_urls || [])].filter(Boolean);
  const [activeImg, setActiveImg] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [fullscreenImg, setFullscreenImg] = useState<string | null>(null);
  const { user } = useAuth();

  // Auto-play gallery
  useEffect(() => {
    if (fullscreenImg || showCheckout) return;
    
    const interval = setInterval(() => {
      setActiveImg((prev) => (prev + 1) % allImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [allImages.length, fullscreenImg, showCheckout]);

  // Log view activity
  useEffect(() => {
    if (car?.id) {
      db.logActivity(user?.id, 'view_car', { 
        car_id: car.id, 
        price: car.price, 
        brand: car.make,
        model: car.model
      });
    }
  }, [car.id, user?.id]);

  if (showCheckout) {
    return (
      <div className="elite-modal-overlay">
        <Checkout car={car} onClose={onClose} />
        <button 
          onClick={() => setShowCheckout(false)}
          style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontSize: '1.5rem', zIndex: 100 }}
        >✕</button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="elite-modal-overlay"
    >
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="glass vehicle-detail-modal"
          style={{
            width: '100%',
            maxWidth: '1200px',
            height: 'min(95vh, 900px)',
            borderRadius: '2.5rem',
            overflow: 'hidden',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 500px), 1fr))',
            position: 'relative',
            border: '1px solid var(--border-glass)',
            overflowY: 'auto',
            background: 'var(--bg-deep)'
          }}
        >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10, background: 'var(--bg-glass)', border: 'none', color: 'var(--text-main)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        {/* Gallery Section */}
        <div style={{ position: 'relative', height: '100%', background: 'black', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img 
                key={activeImg}
                src={allImages[activeImg]} 
                initial={{ opacity: 0, x: 50, scale: 1.05 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.95 }}
                transition={{ 
                  duration: 0.6, 
                  ease: [0.16, 1, 0.3, 1] 
                }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', position: 'absolute' }}
                onClick={() => setFullscreenImg(allImages[activeImg])}
              />
            </AnimatePresence>
          </div>
          
          {allImages.length > 1 && (
            <div className="no-scrollbar" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', display: 'flex', gap: '0.8rem', overflowX: 'auto', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(5px)', zIndex: 5 }}>
              {allImages.map((img, idx) => (
                <img 
                  key={idx}
                  src={img}
                  onClick={() => setActiveImg(idx)}
                  style={{ 
                    width: 'clamp(60px, 15vw, 80px)', 
                    height: 'clamp(45px, 11vw, 60px)', 
                    objectFit: 'cover', 
                    borderRadius: '0.5rem', 
                    cursor: 'pointer',
                    opacity: activeImg === idx ? 1 : 0.4,
                    border: activeImg === idx ? '1.5px solid var(--accent-gold)' : '1.5px solid transparent',
                    transition: '0.3s',
                    flexShrink: 0
                  }}
                />
              ))}
            </div>
          )}
          
          <div style={{ position: 'absolute', bottom: allImages.length > 1 ? 'clamp(80px, 15vh, 110px)' : '0', left: 0, right: 0, padding: 'clamp(1rem, 5vw, 2.5rem)', background: 'linear-gradient(transparent, var(--overlay-bg))', color: 'var(--text-main)', zIndex: 4 }}>
            <h2 className="luxury-font" style={{ fontSize: 'clamp(1.8rem, 8vw, 3rem)', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{car.make} {car.model}</h2>
            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 600, letterSpacing: '2px', fontSize: '0.7rem' }}>{car.year} EDITION</span>
                <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-glass)' }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>SN: {car.stock_number}</span>
                
                {/* Transhub Official Badge */}
                {!car.vendor_id && (
                  <>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-glass)' }} />
                    <div className="glass" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.4rem',
                      padding: '0.3rem 0.6rem', 
                      borderRadius: '2rem',
                      background: 'var(--accent-gold-soft)',
                      border: '1px solid var(--accent-gold)'
                    }}>
                      <img src="/logo.png" alt="Transhub" style={{ width: '12px', height: '12px' }} />
                      <span style={{ 
                        fontSize: '0.55rem', 
                        fontWeight: 800,
                        letterSpacing: '1px',
                        color: 'var(--accent-gold)'
                      }}>
                        OFFICIAL
                      </span>
                    </div>
                  </>
                )}

                {/* Vendor Partner Badge */}
                {car.vendor_id && (
                  <>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-glass)' }} />
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onVendorClick(car.vendor_id!);
                      }}
                      className="glass-hover"
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        padding: 0, 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <div className="glass" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.4rem',
                        padding: '0.3rem 0.6rem', 
                        borderRadius: '2rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-glass)'
                      }}>
                        <Store size={12} color="var(--accent-gold)" />
                        <span style={{ 
                          fontSize: '0.55rem', 
                          fontWeight: 800,
                          letterSpacing: '1px',
                          color: 'var(--text-main)'
                        }}>
                          {car.profiles?.business_name || 'VIEW VENDOR'}
                        </span>
                      </div>
                    </button>
                  </>
                )}
            </div>
          </div>
        </div>

        <div className="mobile-detail-content" style={{ padding: 'clamp(1.5rem, 5vw, 3.5rem)', overflowY: 'auto', display: 'flex', flexDirection: 'column', background: 'var(--bg-glass)' }}>
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 className="luxury-font" style={{ fontSize: 'clamp(1.8rem, 6vw, 2.5rem)', marginBottom: '0.5rem' }}>{car.make} {car.model}</h3>
                <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <span>{car.year}</span>
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
                  <span>{car.stock_number}</span>
                </div>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: 700 }}>RESERVE FOR</div>
                <div style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 800, color: 'var(--accent-gold)' }}>{formatPrice(car.price)}</div>
              </div>
            </div>

            {/* Carwow-style Spec Summary Bar */}
            <div className="glass mobile-spec-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', padding: '1.2rem', borderRadius: '1rem', gap: '1.2rem', marginBottom: '2.5rem' }}>
              <QuickSummary label="MILEAGE" value={`${car.mileage.toLocaleString()} KM`} icon={<Gauge size={16} />} />
              <QuickSummary label="ENGINE" value={car.engine?.split(' ')[0] || car.engine} icon={<Settings size={16} />} />
              <QuickSummary label="TRANS" value={car.transmission?.slice(0, 9)} icon={<Zap size={16} />} />
              <QuickSummary label="FUEL" value={car.fuel_type} icon={<Droplets size={16} />} />
            </div>

            <div style={{ marginBottom: '3rem' }}>
              <h4 style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '3px', marginBottom: '1.5rem', fontWeight: 800 }}>PRIORITY SPECIFICATIONS</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <SpecItem label="Exterior" value={car.exterior_color} icon={<Palette size={16} />} />
                <SpecItem label="Interior" value={car.interior_color} icon={<Fingerprint size={16} />} />
                <SpecItem label="Engine Details" value={car.engine} icon={<Settings size={16} />} />
                <SpecItem 
                  label="VIN Reference" 
                  value={car.vin ? `${car.vin.slice(0, -6).padEnd(car.vin.length, '*')}` : 'Not Specified'} 
                  icon={<Hash size={16} />} 
                />
              </div>
            </div>

            {/* Vehicle Features & Options */}
            {car.features && car.features.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '3px', marginBottom: '1.5rem', fontWeight: 800 }}>FEATURES & OPTIONS</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {car.features.map((feature, idx) => {
                    const isMarketTag = [
                      'Accident Free','First Body','First Owner','Full Option / Fully Loaded',
                      'Leather Interior','Low Mileage','Neatly Used','New Shape / Facelift',
                      'No Faults','Registered','Reverse Camera','Soundproofed'
                    ].includes(feature);
                    return (
                      <span key={idx} style={{
                        padding: '0.35rem 0.85rem',
                        borderRadius: '2rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        border: isMarketTag ? '1px solid rgba(96,165,250,0.4)' : '1px solid rgba(212,175,55,0.35)',
                        background: isMarketTag ? 'rgba(59,130,246,0.08)' : 'rgba(212,175,55,0.06)',
                        color: isMarketTag ? '#93c5fd' : 'var(--accent-gold)',
                        letterSpacing: '0.3px',
                      }}>
                        {feature}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '3rem' }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '3px', marginBottom: '1rem', fontWeight: 800 }}>CURATOR'S ANALYSIS</h4>
                <p style={{ lineHeight: '1.8', color: 'var(--text-main)', opacity: 0.8, fontSize: '1rem', fontStyle: 'italic', marginBottom: '2rem' }}>
                  {car.description || "This specimen represents a peak in automotive engineering, offering a unique blend of heritage and contemporary performance."}
                </p>
                
                {car.gallery_urls && car.gallery_urls.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '3px', marginBottom: '1.5rem', fontWeight: 800 }}>VISUAL ASSET DOSSIER</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(140px, 40vw, 300px), 1fr))', gap: '1rem' }}>
                      {car.gallery_urls.map((url, idx) => (
                        <motion.img 
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                           src={url} 
                           onClick={() => setFullscreenImg(url)}
                           style={{ width: '100%', height: 'clamp(150px, 30vh, 200px)', objectFit: 'cover', borderRadius: '1rem', border: '1px solid var(--border-glass)', cursor: 'pointer' }} 
                         />
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button 
              className="btn-gold" 
              style={{ flex: 2, padding: '1.4rem', borderRadius: '0.8rem', fontSize: '0.9rem', fontWeight: 800, minWidth: '180px' }} 
              onClick={() => user ? setShowCheckout(true) : alert('Please Sign In to proceed.')}
            >
              {user ? 'PROCEED TO ACQUISITION' : 'SIGN IN TO RESERVE'}
            </button>
            {/* Message Vendor / Concierge button */}
            {user ? (
              <button 
                onClick={() => {
                  const event = new CustomEvent('open-chat', {
                    detail: {
                      carId: car.id,
                      vendorId: car.vendor_id || null,
                      autoSendMessage: true,
                    }
                  });
                  window.dispatchEvent(event);
                }}
                className="smooth-transition glass-hover"
                style={{ flex: 1, background: 'var(--accent-gold-soft)', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', borderRadius: '0.8rem', cursor: 'pointer', fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem', minWidth: '120px' }}
              >
                <MessageSquare size={16} /> {car.vendor_id ? 'MESSAGE VENDOR' : 'CONTACT CONCIERGE'}
              </button>
            ) : (
              <button 
                onClick={onInquiry}
                className="smooth-transition glass-hover"
                style={{ flex: 1, background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', color: 'var(--text-main)', borderRadius: '0.8rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.75rem', minWidth: '100px' }}
              >
                INQUIRE
              </button>
            )}
          </div>
        </div>
      </motion.div>
 
       {/* Lightbox Overlay */}
       <AnimatePresence>
         {fullscreenImg && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             onClick={() => setFullscreenImg(null)}
             style={{
               position: 'fixed',
               inset: 0,
               zIndex: 5000,
               background: 'rgba(0,0,0,0.95)',
               backdropFilter: 'blur(10px)',
               display: 'flex',
               justifyContent: 'center',
               alignItems: 'center',
               cursor: 'zoom-out',
               padding: '2rem'
             }}
           >
             <motion.button
               initial={{ opacity: 0, scale: 0.8 }}
               animate={{ opacity: 1, scale: 1 }}
               onClick={(e) => { e.stopPropagation(); setFullscreenImg(null); }}
               style={{
                 position: 'absolute',
                 top: '2rem',
                 right: '2rem',
                 background: 'var(--bg-glass)',
                 color: 'white',
                 width: '44px',
                 height: '44px',
                 borderRadius: '50%',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 cursor: 'pointer',
                 zIndex: 5100,
                 backdropFilter: 'blur(5px)',
                 border: '1px solid rgba(255,255,255,0.1)'
               }}
             >
               <X size={24} />
             </motion.button>
 
             <motion.img
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               src={fullscreenImg}
               alt="Enlarged vehicle view"
               onClick={(e) => e.stopPropagation()}
               style={{
                 maxWidth: '100%',
                 maxHeight: '100%',
                 objectFit: 'contain',
                 borderRadius: '0.5rem',
                 boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
               }}
             />
           </motion.div>
         )}
       </AnimatePresence>
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
