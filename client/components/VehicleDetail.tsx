import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Share2, 
  Heart, 
  ChevronLeft, 
  CheckCircle2, 
  MapPin, 
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
  const [relatedCars, setRelatedCars] = useState<Car[]>([]);

  useEffect(() => {
    if (car?.id) {
      db.logActivity(user?.id, 'view_car', { 
        car_id: car.id, 
        price: car.price, 
        brand: car.make,
        model: car.model
      });

      const loadRecommendations = async () => {
        try {
          const allCars = await db.getCars({ onlyApproved: true });
          const matches = allCars
            .filter(c => c.id !== car.id && c.body_type === car.body_type)
            .slice(0, 5);
          setRelatedCars(matches);
        } catch (err) {
          console.error('Failed to load recommendations:', err);
        }
      };
      loadRecommendations();
    }
  }, [car.id, user?.id, car.body_type]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="profile-fullscreen-mobile"
      style={{
        width: '100%',
        height: '100vh',
        background: '#000',
        color: '#fff',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 5000,
        overflowY: 'auto'
      }}
    >
      {/* Header Actions */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        padding: '1.2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 50
      }}>
        <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button style={{ background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}>
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => setIsWishlisted(!isWishlisted)}
            style={{ background: 'rgba(0,0,0,0.4)', border: 'none', color: isWishlisted ? 'var(--accent-gold)' : '#fff', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}
          >
            <Heart size={20} fill={isWishlisted ? 'var(--accent-gold)' : 'none'} />
          </button>
        </div>
      </div>

      {/* Image Section */}
      <div style={{ position: 'relative', height: '40vh', width: '100%', background: '#111' }}>
        <img 
          src={allImages[activeImg]} 
          alt="" 
          onClick={() => setActiveImg((prev) => (prev + 1) % allImages.length)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
        />
        <div style={{ position: 'absolute', bottom: '1.2rem', right: '1.2rem', background: 'rgba(0,0,0,0.6)', padding: '0.3rem 0.7rem', borderRadius: '0.5rem', fontSize: '0.7rem', fontWeight: 700 }}>
          {activeImg + 1}/{allImages.length}
        </div>
        
        {/* Gallery Thumbnails Overlay (Simplified) */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '3px', display: 'flex', gap: '2px' }}>
          {allImages.map((_, i) => (
            <div key={i} style={{ flex: 1, background: i === activeImg ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '1.5rem', paddingBottom: '140px' }}>
        {/* Primary Info */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{car.make} {car.model}</h1>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{formatPrice(car.price)}</div>
            <div style={{ color: '#4ade80', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(74,222,128,0.1)', padding: '0.3rem 0.7rem', borderRadius: '0.5rem' }}>
              <CheckCircle2 size={12} /> Verified
            </div>
          </div>
        </div>

        {/* Spec Grid - High Density */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '2.5rem' }}>
          <SpecSquare icon={<Calendar size={18} />} label="Year" value={car.year.toString()} />
          <SpecSquare icon={<Settings size={18} />} label="Automatic" value="Transmission" />
          <SpecSquare icon={<Droplets size={18} />} label="Fuel" value="Petrol" />
          <SpecSquare icon={<Gauge size={18} />} label="200 km" value="Mileage" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1.2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>
            <MapPin size={14} color="var(--accent-gold)" /> Lagos, Nigeria
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Posted 2 days ago</div>
        </div>

        {/* Overview */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.2rem' }}>Overview</h2>
          <div style={{ display: 'grid', gap: '1.2rem' }}>
            <OverviewItem icon={<Settings size={18} />} label="Engine" value="6.5L V12 Hybrid" />
            <OverviewItem icon={<Zap size={18} />} label="Power" value="1001 hp" />
            <OverviewItem icon={<CarIcon size={18} />} label="Drive" value="AWD" />
            <OverviewItem icon={<Settings size={18} />} label="Exterior" value="Arancio Orange" />
            <OverviewItem icon={<Settings size={18} />} label="Interior" value="Nero Ade" />
            <OverviewItem icon={<Settings size={18} />} label="VIN" value="ZHWED4ZX8RLA12345" />
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.8rem' }}>Description</h2>
          <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
            {isDescriptionExpanded ? car.description : `${car.description?.slice(0, 150)}...`}
          </p>
          <button 
            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 700, marginTop: '0.75rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            {isDescriptionExpanded ? 'Read less' : 'Read more'} <ChevronDown size={16} />
          </button>
        </div>

        {/* Seller Info */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.2rem' }}>Seller Information</h2>
          <div style={{ background: '#111', padding: '1.2rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.2rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: '#222' }}>
                <img src={car.profiles?.avatar_url || '/logo.png'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700 }}>{car.profiles?.business_name || 'AutoHub Luxury Cars'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#4ade80', fontSize: '0.7rem', fontWeight: 600, marginTop: '0.1rem' }}>
                  <CheckCircle2 size={10} /> Verified Dealer
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                   <span style={{ color: 'var(--accent-gold)' }}>★ 4.8</span> (128 reviews)
                </div>
              </div>
            </div>
            <button 
              onClick={() => {
                console.log('View Dealer Profile clicked. Vendor ID:', car.vendor_id);
                if (car.vendor_id) onVendorClick(car.vendor_id);
                else alert('Vendor information not available for this vehicle.');
              }}
              className="btn-gold" 
              style={{ width: '100%', padding: '0.8rem', borderRadius: '0.5rem', fontWeight: 800, fontSize: '0.85rem', background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)' }}
            >
              View Dealer Profile
            </button>
          </div>
        </div>

        {/* Recommendations */}
        <div style={{ marginBottom: '2rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>You may also like</h2>
              <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 700 }}>View all</span>
           </div>
           <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="no-scrollbar">
              {relatedCars.map(rc => (
                <div key={rc.id} style={{ minWidth: '220px', background: '#111', borderRadius: '1rem', overflow: 'hidden' }}>
                   <div style={{ height: '130px', position: 'relative' }}>
                      <img src={rc.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', padding: '0.4rem', borderRadius: '50%', display: 'flex' }}>
                         <Heart size={14} />
                      </button>
                   </div>
                   <div style={{ padding: '0.8rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>{rc.make} {rc.model}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.6rem' }}>2021 • Petrol</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{formatPrice(rc.price)}</div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        padding: '1.2rem 1.5rem', background: 'rgba(0,0,0,0.8)', 
        backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.05)',
        zIndex: 100
      }}>
        <button 
          onClick={onInquiry}
          className="btn-gold" 
          style={{ width: '100%', padding: '1rem', borderRadius: '0.6rem', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.8rem' }}
        >
          Contact Seller
        </button>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '0.6rem', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
             <Phone size={18} color="var(--accent-gold)" /> Call
          </button>
          <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '0.6rem', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 700 }}>
             <MessageSquare size={18} color="var(--accent-gold)" /> Chat
          </button>
        </div>
      </div>
    </motion.div>
  );
};

const SpecSquare = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div style={{ background: '#111', padding: '0.8rem 0.4rem', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.03)', textAlign: 'center' }}>
     <div style={{ color: 'var(--accent-gold)', marginBottom: '0.3rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
     <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{label}</div>
     <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>{value}</div>
  </div>
);

const OverviewItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    <div style={{ color: 'var(--accent-gold)' }}>{icon}</div>
    <div style={{ flex: 1, display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
       <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}:</span>
       <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  </div>
);
