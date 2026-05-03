import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Share2, 
  Heart, 
  ChevronLeft, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Gauge, 
  Settings, 
  Droplets, 
  Calendar,
  Zap,
  Phone,
  MessageSquare,
  ChevronDown,
  Car as CarIcon
} from 'lucide-react';
import { db, type Car } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import { formatPrice } from '../../shared/lib/formatters';

interface VehicleDetailProps {
  car: Car;
  onClose: () => void;
  onInquiry: () => void;
  onVendorClick: (vendorId: string) => void;
}

export const VehicleDetail = ({ car, onClose, onInquiry, onVendorClick }: VehicleDetailProps) => {
  const { user } = useAuth();
  const allImages = [car.image_url, ...(car.gallery_urls || [])].filter(Boolean);
  const [activeImg, setActiveImg] = useState(0);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: '100%' }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="profile-fullscreen-mobile"
      style={{
        width: '100%',
        height: '100%',
        background: '#000',
        color: '#fff',
        overflowY: 'auto',
        zIndex: 3000,
        position: 'fixed',
        left: 0,
        top: 0
      }}
    >
      {/* ── Custom Header ── */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 10,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)'
      }}>
        <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => setIsWishlisted(!isWishlisted)}
            style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: isWishlisted ? 'var(--accent-gold)' : '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}
          >
            <Heart size={20} fill={isWishlisted ? 'var(--accent-gold)' : 'none'} />
          </button>
        </div>
      </div>

      {/* ── Image Carousel Section ── */}
      <div style={{ position: 'relative', width: '100%', height: '45vh', background: '#111' }}>
        <AnimatePresence mode="wait">
          <motion.img 
            key={activeImg}
            src={allImages[activeImg]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </AnimatePresence>
        
        {/* Pagination Indicator */}
        <div style={{ position: 'absolute', bottom: '2rem', right: '1.5rem', background: 'rgba(0,0,0,0.6)', padding: '0.4rem 0.8rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, backdropFilter: 'blur(5px)' }}>
          {activeImg + 1}/{allImages.length}
        </div>

        {/* Progress Bar Indicators */}
        <div style={{ position: 'absolute', bottom: '0', left: 0, width: '100%', padding: '0.5rem 1.5rem', display: 'flex', gap: '4px' }}>
          {allImages.map((_, idx) => (
            <div 
              key={idx} 
              onClick={(e) => { e.stopPropagation(); setActiveImg(idx); }}
              style={{ 
                height: '2px', 
                flex: 1, 
                background: idx === activeImg ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)',
                borderRadius: '1px',
                cursor: 'pointer'
              }} 
            />
          ))}
        </div>
      </div>

      {/* ── Content Section ── */}
      <div style={{ padding: '1.5rem 1.5rem 10rem 1.5rem' }}>
        {/* Title & Price */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 className="luxury-font" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{car.make} {car.model}</h1>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{formatPrice(car.price)}</div>
            <div style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80', padding: '0.4rem 0.8rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', fontWeight: 700 }}>
              <CheckCircle2 size={14} /> Verified
            </div>
          </div>
        </div>

        {/* Spec Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem', marginBottom: '2rem' }}>
          <SpecItem icon={<Calendar size={18} />} label="Year" value={car.year.toString()} />
          <SpecItem icon={<Settings size={18} />} label="Transmission" value={car.transmission || 'Auto'} />
          <SpecItem icon={<Droplets size={18} />} label="Fuel" value={car.fuel_type || 'Petrol'} />
          <SpecItem icon={<Gauge size={18} />} label="Mileage" value={`${(car.mileage / 1000).toFixed(0)}k km`} />
        </div>

        {/* Location & Time */}
        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888', fontSize: '0.8rem', marginBottom: '2.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={14} color="var(--accent-gold)" /> Lagos, Nigeria
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={14} /> Posted 2 days ago
          </div>
        </div>

        {/* Overview Row Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 className="luxury-font" style={{ fontSize: '1.4rem', marginBottom: '1.2rem' }}>Overview</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <OverviewRow icon={<Settings size={18} />} label="Engine" value={car.engine || 'V12 Hybrid'} />
            <OverviewRow icon={<Zap size={18} />} label="Power" value="1001 hp" />
            <OverviewRow icon={<CarIcon size={18} />} label="Drive" value="AWD" />
            <OverviewRow icon={<Settings size={18} />} label="Exterior" value={car.exterior_color} />
            <OverviewRow icon={<Settings size={18} />} label="Interior" value={car.interior_color} />
            <OverviewRow icon={<Settings size={18} />} label="VIN" value={car.vin || 'ZHWED4ZX8RLA12345'} />
          </div>
        </div>

        {/* Description Section */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 className="luxury-font" style={{ fontSize: '1.4rem', marginBottom: '1.2rem' }}>Description</h2>
          <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '0.95rem' }}>
            {isDescriptionExpanded ? car.description : `${car.description?.slice(0, 150)}...`}
          </p>
          <button 
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: 0 }}
          >
            {isDescriptionExpanded ? 'Read less' : 'Read more'} <ChevronDown size={14} style={{ transform: isDescriptionExpanded ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>

        {/* Seller Information */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 className="luxury-font" style={{ fontSize: '1.4rem', marginBottom: '1.2rem' }}>Seller Information</h2>
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1.2rem', padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', overflow: 'hidden', background: '#111' }}>
                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=100" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>AutoHub Luxury Cars</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#4ade80', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.2rem' }}>
                  <CheckCircle2 size={12} /> Verified Dealer
                </div>
                <div style={{ color: '#888', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                  <span style={{ color: 'var(--accent-gold)' }}>★ 4.8</span> (128 reviews)
                </div>
              </div>
            </div>
            <button 
              onClick={() => car.vendor_id && onVendorClick(car.vendor_id)}
              className="btn-gold" 
              style={{ width: '100%', padding: '1rem', borderRadius: '0.8rem', fontWeight: 800, fontSize: '0.85rem' }}
            >
              View Dealer Profile
            </button>
          </div>
        </div>

        {/* Related Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h2 className="luxury-font" style={{ fontSize: '1.4rem' }}>You may also like</h2>
             <button style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 700, background: 'none', border: 'none' }}>View all</button>
          </div>
          <div style={{ display: 'flex', gap: '1.2rem', overflowX: 'auto', paddingBottom: '1rem' }} className="no-scrollbar">
             <RelatedCard image="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=400" name="Porsche 911 Carrera 4S" year="2021" price="₦180,000,000" />
             <RelatedCard image="https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=400" name="Ferrari Roma" year="2022" price="₦320,000,000" />
          </div>
        </div>
      </div>

      {/* ── Sticky Action Bar ── */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        padding: '1.2rem 1.5rem 2.5rem 1.5rem',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(15px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        zIndex: 50
      }}>
        <button 
          onClick={onInquiry}
          className="btn-gold" 
          style={{ width: '100%', padding: '1.2rem', borderRadius: '0.8rem', fontWeight: 900, fontSize: '1rem', textTransform: 'uppercase' }}
        >
          Contact Seller
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
           <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-gold)', padding: '0.8rem', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
             <Phone size={18} /> Call
           </button>
           <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--accent-gold)', padding: '0.8rem', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
             <MessageSquare size={18} /> Chat
           </button>
        </div>
      </div>
    </motion.div>
  );
};

const SpecItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1rem 0.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
    <div style={{ color: 'var(--accent-gold)' }}>{icon}</div>
    <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{value}</div>
    <div style={{ fontSize: '0.6rem', color: '#888', fontWeight: 600 }}>{label}</div>
  </div>
);

const OverviewRow = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ color: 'var(--accent-gold)', opacity: 0.8 }}>{icon}</div>
    <div style={{ flex: 1, display: 'flex', gap: '0.5rem', fontSize: '0.95rem' }}>
      <span style={{ color: '#888' }}>{label}:</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  </div>
);

const RelatedCard = ({ image, name, year, price }: { image: string, name: string, year: string, price: string }) => (
  <div style={{ minWidth: '220px', background: 'rgba(255,255,255,0.02)', borderRadius: '1.2rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ position: 'relative', height: '140px' }}>
      <img src={image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <button style={{ position: 'absolute', top: '0.8rem', right: '0.8rem', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
        <Heart size={16} />
      </button>
    </div>
    <div style={{ padding: '1rem' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>{name}</div>
      <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.8rem' }}>{year} • Petrol</div>
      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{price}</div>
    </div>
  </div>
);
