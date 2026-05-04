import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  MessageSquare, 
  Phone, 
  Globe, 
  MapPin, 
  ChevronLeft,
  Share2,
  Heart,
  Star
} from 'lucide-react';
import { db, supabase, type Car } from '../../shared/lib/db';
import { formatPrice } from '../../shared/lib/formatters';

interface Vendor {
  id: string;
  full_name: string;
  business_name: string;
  role: string;
  vendor_status: string;
  avatar_url?: string;
  store_image_url?: string;
  business_details?: {
    phone?: string;
    address?: string;
    description?: string;
    website?: string;
  };
  created_at: string;
}

export const VendorProfile = ({ vendorId, onClose }: { vendorId: string, onClose: () => void }) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeListings: 0,
    totalSales: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', vendorId)
          .single();
        
        setVendor(profile);

        const [vendorCars, vendorStats] = await Promise.all([
          db.getCars({ onlyApproved: true }),
          db.getVendorStats(vendorId)
        ]);
        
        setCars(vendorCars.filter(c => c.vendor_id === vendorId));
        setStats(vendorStats);
      } catch (err) {
        console.error('Failed to load vendor:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [vendorId]);

  if (loading) return <div className="loader-container"><div className="loader"></div></div>;
  if (!vendor) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      className="profile-fullscreen-mobile"
      style={{
        zIndex: 5000,
        background: '#000',
        color: '#fff',
        overflowY: 'auto',
        paddingBottom: '6rem'
      }}
    >
      {/* ── Header ── */}
      <div style={{ position: 'relative', height: '30vh' }}>
        <img 
          src={vendor.store_image_url || 'https://images.unsplash.com/photo-1562141989-c5c79ac8f576?auto=format&fit=crop&q=80&w=1200'} 
          style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} 
        />
        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', right: '1.5rem', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
          <button onClick={onClose} className="glass-btn"><ChevronLeft size={20} /></button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="glass-btn"><Share2 size={18} /></button>
            <button className="glass-btn"><Heart size={18} /></button>
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div style={{ position: 'absolute', bottom: '-40px', left: '1.5rem', display: 'flex', alignItems: 'flex-end', gap: '1.2rem' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', border: '3px solid var(--accent-gold)', 
            overflow: 'hidden', background: '#111', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <img src={vendor.avatar_url || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ paddingBottom: '0.5rem' }}>
             <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.2rem' }}>{vendor.business_name || vendor.full_name} <ShieldCheck size={18} color="var(--accent-gold)" style={{ display: 'inline' }} /></h1>
             <p style={{ color: '#aaa', fontSize: '0.85rem' }}>Verified Dealer • {vendor.business_details?.address || 'Lagos, Nigeria'}</p>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
               <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>★ 4.8</span>
               <span style={{ color: '#666', fontSize: '0.8rem' }}>(128 reviews)</span>
             </div>
          </div>
        </div>
        
        <button style={{ 
          position: 'absolute', bottom: '-20px', right: '1.5rem', 
          background: 'transparent', border: '1px solid var(--accent-gold)', 
          color: 'var(--accent-gold)', padding: '0.6rem 1.4rem', borderRadius: '0.8rem',
          fontSize: '0.85rem', fontWeight: 700
        }}>
           Follow
        </button>
      </div>

      {/* ── Content Area ── */}
      <div style={{ padding: '4rem 1.5rem 2rem' }}>
        
        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '2.5rem' }}>
          <StatBox label="Cars Sold" value={`${stats.totalSales}+`} icon={<Star size={14} />} />
          <StatBox label="Years Active" value={`${Math.max(1, new Date().getFullYear() - new Date(vendor.created_at || new Date()).getFullYear())}+`} icon={<Star size={14} />} />
          <StatBox label="Response Rate" value="98%" icon={<Star size={14} />} />
          <StatBox label="Avg. Response" value="1h" icon={<Star size={14} />} />
        </div>

        {/* About Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1rem' }}>About {vendor.business_name || 'Dealer'}</h2>
          <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {isAboutExpanded ? (vendor.business_details?.description || 'Premium automotive dealership specializing in foreign and Nigerian luxury cars.') : `${(vendor.business_details?.description || 'Premium automotive dealership specializing in foreign and Nigerian luxury cars.').slice(0, 100)}...`}
          </p>
          <button 
            onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 700, background: 'none', border: 'none', padding: '0.5rem 0' }}
          >
            {isAboutExpanded ? 'Read less' : 'Read more'}
          </button>
        </div>

        {/* Action Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem', marginBottom: '3rem' }}>
          <ActionButton icon={<Phone size={18} />} label="Call" onClick={() => window.open(`tel:${vendor.business_details?.phone}`)} />
          <ActionButton icon={<MessageSquare size={18} />} label="Chat" onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { detail: { vendorId: vendor.id } }))} />
          <ActionButton icon={<Globe size={18} />} label="Website" onClick={() => window.open(vendor.business_details?.website || '#', '_blank')} />
          <ActionButton icon={<MapPin size={18} />} label="Directions" onClick={() => window.open(`https://maps.google.com/?q=${vendor.business_details?.address}`, '_blank')} />
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Cars for Sale</h2>
             <button 
               onClick={() => {
                 // Custom event to filter inventory by vendor in App.tsx could be added,
                 // but for now let's just go home or inventory.
                 window.dispatchEvent(new CustomEvent('filter-vendor', { detail: { vendorId } }));
               }}
               style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 700, background: 'none', border: 'none' }}
             >
               View all ({cars.length})
             </button>
          </div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }} className="no-scrollbar">
            {cars.map(car => (
              <CarCardSmall key={car.id} car={car} />
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Customer Reviews</h2>
             <button style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 700 }}>View all</button>
          </div>
          <ReviewCard 
            name="James Okoro" 
            rating={5} 
            comment="Great experience buying my G63. The car is exactly as described and the team was very professional throughout the process." 
            time="2 weeks ago"
          />
        </div>

      </div>

      {/* Sticky Bottom Action */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, width: '100%', 
        padding: '1rem 1.5rem 2.5rem', background: 'rgba(0,0,0,0.8)', 
        backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.05)' 
      }}>
         <button 
           onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { detail: { vendorId: vendor.id } }))}
           className="btn-gold" style={{ width: '100%', padding: '1.2rem', borderRadius: '1rem', fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
         >
           <MessageSquare size={20} /> CHAT WITH VENDOR
         </button>
      </div>
    </motion.div>
  );
};

const StatBox = ({ label, value, icon }: { label: string, value: string, icon: any }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', padding: '1rem 0.5rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ color: 'var(--accent-gold)', marginBottom: '0.4rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{value}</div>
    <div style={{ fontSize: '0.6rem', color: '#666', marginTop: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
  </div>
);

const ActionButton = ({ icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', borderRadius: '1rem', padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
  >
    <div style={{ color: 'var(--accent-gold)' }}>{icon}</div>
    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{label}</span>
  </button>
);

const CarCardSmall = ({ car }: { car: Car }) => (
  <div 
    onClick={() => window.dispatchEvent(new CustomEvent('select-car', { detail: { car } }))}
    style={{ minWidth: '200px', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
  >
    <div style={{ height: '120px', position: 'relative' }}>
      <img src={car.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(74,222,128,0.9)', color: '#000', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.6rem', fontWeight: 800 }}>FEATURED</div>
    </div>
    <div style={{ padding: '0.8rem' }}>
       <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{car.make} {car.model}</h4>
       <div style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.9rem' }}>{formatPrice(car.price)}</div>
    </div>
  </div>
);

const ReviewCard = ({ name, rating, comment, time }: { name: string, rating: number, comment: string, time: string }) => (
  <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1.2rem', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#222' }}>
          <img src="https://i.pravatar.cc/100?u=James" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{name} <span style={{ color: '#4ade80', fontSize: '0.7rem' }}>● Verified Buyer</span></div>
          <div style={{ display: 'flex', gap: '2px', marginTop: '0.2rem' }}>
             {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={10} fill={i < rating ? 'var(--accent-gold)' : 'none'} color="var(--accent-gold)" />)}
          </div>
        </div>
      </div>
      <span style={{ fontSize: '0.7rem', color: '#666' }}>{time}</span>
    </div>
    <p style={{ fontSize: '0.85rem', color: '#aaa', lineHeight: 1.5 }}>"{comment}"</p>
  </div>
);
