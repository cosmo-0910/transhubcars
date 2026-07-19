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
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowRight
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
            .slice(0, 4);
          setRelatedCars(matches);
        } catch (err) {
          console.error('Failed to load recommendations:', err);
        }
      };
      loadRecommendations();
    }
  }, [car.id, user?.id, car.body_type]);

  const shareVehicle = () => {
    if (navigator.share) {
      navigator.share({
        title: `${car.make} ${car.model}`,
        text: `Check out this ${car.year} ${car.make} ${car.model} on Transhub Automotive Group`,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="fixed inset-0 z-[1000] w-full h-screen bg-background text-on-surface overflow-y-auto"
    >
      
      {/* Top Navbar Actions */}
      <div className="absolute top-0 left-0 right-0 z-50 p-4 max-w-container-max mx-auto flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={onClose} 
          className="w-10 h-10 rounded-full bg-black/60 border border-glass-border flex items-center justify-center text-on-surface hover:text-luxury-gold transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-2">
          <button 
            onClick={shareVehicle}
            className="w-10 h-10 rounded-full bg-black/60 border border-glass-border flex items-center justify-center text-on-surface hover:text-luxury-gold transition-colors"
          >
            <Share2 size={18} />
          </button>
          <button 
            onClick={() => setIsWishlisted(!isWishlisted)}
            className="w-10 h-10 rounded-full bg-black/60 border border-glass-border flex items-center justify-center text-on-surface hover:text-luxury-gold transition-colors"
          >
            <Heart size={18} className={isWishlisted ? 'fill-luxury-gold text-luxury-gold' : ''} />
          </button>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop pt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Area: Images & Details */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Gallery View */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-black border border-glass-border group">
              <img 
                src={allImages[activeImg]} 
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover" 
              />
              <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-lg text-xs font-bold text-on-surface border border-glass-border">
                {activeImg + 1} / {allImages.length}
              </div>
              
              {/* Slider Taps overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 flex gap-1 bg-black/20 px-2 py-0.5">
                {allImages.map((_, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveImg(i)}
                    className={`h-full flex-grow rounded-full cursor-pointer transition-all ${
                      i === activeImg ? 'bg-luxury-gold' : 'bg-white/25 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail row */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, i) => (
                  <button 
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-28 aspect-[16/10] rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      i === activeImg ? 'border-luxury-gold' : 'border-glass-border hover:border-luxury-gold/50'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}

            {/* Specs Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="glass-card p-5 rounded-xl flex flex-col justify-between aspect-square">
                <Calendar size={24} className="text-luxury-gold" />
                <div>
                  <p className="text-[10px] font-label-caps text-on-surface-variant font-bold">MODEL YEAR</p>
                  <p className="font-headline-md text-lg font-bold text-on-surface">{car.year}</p>
                </div>
              </div>
              
              <div className="glass-card p-5 rounded-xl flex flex-col justify-between aspect-square">
                <Gauge size={24} className="text-luxury-gold" />
                <div>
                  <p className="text-[10px] font-label-caps text-on-surface-variant font-bold">MILEAGE</p>
                  <p className="font-headline-md text-lg font-bold text-on-surface">{car.mileage ? `${car.mileage.toLocaleString()} KM` : 'BRAND NEW'}</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-xl flex flex-col justify-between aspect-square">
                <Settings size={24} className="text-luxury-gold" />
                <div>
                  <p className="text-[10px] font-label-caps text-on-surface-variant font-bold">TRANSMISSION</p>
                  <p className="font-headline-md text-lg font-bold text-on-surface truncate">{car.transmission || 'Automatic'}</p>
                </div>
              </div>

              <div className="glass-card p-5 rounded-xl flex flex-col justify-between aspect-square">
                <Sparkles size={24} className="text-luxury-gold" />
                <div>
                  <p className="text-[10px] font-label-caps text-on-surface-variant font-bold">FUEL SYSTEM</p>
                  <p className="font-headline-md text-lg font-bold text-on-surface truncate">{car.fuel_type || 'Petrol'}</p>
                </div>
              </div>
            </div>

            {/* Overview / Technical Specs list */}
            <div className="glass-card p-8 rounded-xl text-left space-y-6">
              <h3 className="font-headline-md text-xl font-bold text-on-surface border-b border-glass-border pb-3">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12 text-sm">
                <div className="flex justify-between py-2 border-b border-glass-border/40">
                  <span className="text-on-surface-variant font-medium">Manufacturer</span>
                  <span className="font-bold text-on-surface">{car.make}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-glass-border/40">
                  <span className="text-on-surface-variant font-medium">Model Variant</span>
                  <span className="font-bold text-on-surface">{car.model}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-glass-border/40">
                  <span className="text-on-surface-variant font-medium">Body Type</span>
                  <span className="font-bold text-on-surface">{car.body_type || 'Coupe'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-glass-border/40">
                  <span className="text-on-surface-variant font-medium">Exterior Color</span>
                  <span className="font-bold text-on-surface">{car.exterior_color || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-glass-border/40">
                  <span className="text-on-surface-variant font-medium">Interior Color</span>
                  <span className="font-bold text-on-surface">{car.interior_color || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-glass-border/40">
                  <span className="text-on-surface-variant font-medium">Powertrain</span>
                  <span className="font-bold text-on-surface">{car.powertrain || 'AWD'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="text-left space-y-4">
              <h3 className="font-label-caps text-[10px] text-luxury-gold tracking-widest font-bold">DESCRIPTION</h3>
              <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {car.description || 'No description details provided for this vehicle allocation.'}
              </p>
            </div>

            {/* Location visual box */}
            {car.state && (
              <div className="glass-card p-6 rounded-xl text-left space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-label-caps font-bold tracking-wider text-on-surface-variant">PHYSICAL LOCATION</span>
                  <span className="text-xs font-bold text-luxury-gold uppercase tracking-wider flex items-center gap-1">
                    <MapPin size={14} /> {car.state}, Nigeria
                  </span>
                </div>
                <div className="w-full h-44 rounded-lg bg-surface-container/50 border border-glass-border relative overflow-hidden flex items-center justify-center">
                  <MapPin size={36} className="text-luxury-gold/40 animate-bounce" />
                </div>
              </div>
            )}

          </div>

          {/* Right Area: Purchase/Acquisition Details Card */}
          <div className="lg:col-span-4 sticky top-28 space-y-6 text-left">
            
            {/* Main pricing & purchase box */}
            <div className="glass-card p-8 rounded-xl border border-glass-border bg-surface-container/20 space-y-6">
              
              <div className="flex justify-between items-start border-b border-glass-border pb-4">
                <div>
                  <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block font-bold mb-1">INVESTMENT VALUE</span>
                  <h2 className="text-3xl font-bold text-luxury-gold tracking-tight">{formatPrice(car.price)}</h2>
                </div>
                <span className="bg-primary/10 border border-primary/30 text-primary font-bold text-[9px] px-2.5 py-1 rounded">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={onInquiry}
                  className="w-full bg-luxury-gold text-on-primary py-4 rounded-lg font-label-caps text-xs font-bold hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-luxury-gold/15"
                >
                  SECURE VEHICLE
                </button>
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-chat', {
                      detail: {
                        carId: car.id,
                        vendorId: car.vendor_id || null,
                        autoSendMessage: true
                      }
                    }));
                    onClose();
                  }}
                  className="w-full border border-glass-border text-on-surface py-4 rounded-lg font-label-caps text-xs font-bold hover:bg-surface-variant transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare size={14} className="text-luxury-gold" />
                  <span>START CHAT INQUIRY</span>
                </button>
              </div>

              {/* Security info notes */}
              <div className="text-[10px] text-on-surface-variant leading-relaxed pt-2 border-t border-glass-border">
                All acquisitions go through Transhub secure holding accounts. Vehicle inspections are fully certified prior to dispatch.
              </div>

            </div>

            {/* Vendor/Dealer info card */}
            <div className="glass-card p-6 rounded-xl space-y-4 text-left bg-surface-container/20">
              <span className="text-[10px] font-label-caps text-on-surface-variant tracking-wider block font-bold">MERCHANT REGISTRY</span>
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-black/30 border border-glass-border">
                  <img 
                    src={car.profiles?.avatar_url || 'https://images.unsplash.com/photo-1579033461380-adb47c3eb938?q=80&w=200'} 
                    className="w-full h-full object-cover" 
                    alt="Vendor Avatar"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-sm">{car.profiles?.business_name || 'Transhub Official'}</h4>
                  <p className="text-[10px] text-luxury-gold font-bold flex items-center gap-1 uppercase tracking-wider mt-0.5">
                    <CheckCircle2 size={10} /> Certified Merchant
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (car.vendor_id) onVendorClick(car.vendor_id);
                  else alert('Vendor profile is handled by Transhub Official.');
                }}
                className="w-full border border-luxury-gold/30 text-luxury-gold py-2.5 rounded font-label-caps text-xs font-bold hover:bg-luxury-gold/5 transition-all"
              >
                VIEW VENDOR SHOWROOM
              </button>
            </div>

          </div>

        </div>

        {/* You may also like: related cars row */}
        {relatedCars.length > 0 && (
          <div className="border-t border-glass-border pt-16 mt-16 text-left">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-[10px] font-label-caps text-luxury-gold tracking-widest block font-bold mb-1">SIMILAR SELECTIONS</span>
                <h3 className="text-2xl font-headline-lg font-bold text-on-surface">You May Also Like</h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedCars.map(rc => (
                <div 
                  key={rc.id}
                  onClick={() => window.dispatchEvent(new CustomEvent('select-car', { detail: { car: rc } }))}
                  className="glass-card group cursor-pointer overflow-hidden rounded-xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-black">
                    <img src={rc.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                  </div>
                  <div className="p-4 bg-surface-container/5">
                    <h4 className="font-bold text-on-surface text-sm truncate">{rc.make} {rc.model}</h4>
                    <p className="text-[10px] text-on-surface-variant mt-1">{rc.year} • {rc.fuel_type || 'Petrol'}</p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-glass-border">
                      <span className="text-luxury-gold font-bold text-sm">{formatPrice(rc.price)}</span>
                      <span className="text-[10px] font-bold text-luxury-gold flex items-center gap-0.5">VIEW <ArrowRight size={10} /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};
