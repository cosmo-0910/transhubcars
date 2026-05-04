import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Share2, Heart, ShieldCheck, MapPin, 
  Star, Phone, Globe, Navigation, 
  Clock, Zap, TrendingUp, CheckCircle2,
  ChevronDown, MessageCircle
} from 'lucide-react';
import { db } from '../../shared/lib/db';
import { supabase } from '../../shared/lib/db';
import { formatPrice } from '../../shared/lib/formatters';

interface VendorProfileProps {
  vendorId: string;
  onClose: () => void;
}

export const VendorProfile = ({ vendorId, onClose }: VendorProfileProps) => {
  const [vendor, setVendor] = useState<any>(null);
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  useEffect(() => {
    const loadVendor = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!vendorId) throw new Error("No vendor ID provided");
        
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', vendorId)
          .single();
        
        if (profileErr) throw profileErr;
        
        if (profile) {
          setVendor(profile);
          const vendorCars = await db.getVendorCars(vendorId);
          setCars(vendorCars || []);
        } else {
          setError("Vendor not found");
        }
      } catch (err: any) {
        console.error('Failed to load vendor:', err);
        setError(err.message || "Failed to load vendor information");
      } finally {
        setLoading(false);
      }
    };
    loadVendor();
    window.scrollTo(0, 0);
  }, [vendorId]);

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <div className="loader"></div>
    </div>
  );

  if (error || !vendor) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000', padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{error || "Vendor profile not available."}</p>
      <button onClick={onClose} className="btn-gold" style={{ padding: '0.8rem 2rem' }}>Go Back</button>
    </div>
  );

  return (
    <div className="profile-fullscreen-mobile" style={{ minHeight: '100vh', background: '#000', color: '#fff', position: 'relative', overflowX: 'hidden' }}>
      {/* Top Header Navigation */}
      <div style={{ 
        position: 'fixed', top: 0, left: 0, right: 0, height: '60px', 
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.2rem', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)'
      }}>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', display: 'flex' }}>
          <ChevronLeft size={24} />
        </button>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.5px' }}>Vendor Profile</div>
        <div style={{ display: 'flex', gap: '1.2rem' }}>
          <Share2 size={20} />
          <Heart size={20} />
        </div>
      </div>

      {/* Hero Cover Image */}
      <div style={{ position: 'relative', height: '240px', width: '100%', marginTop: '0' }}>
        <img 
          src={vendor.avatar_url || "https://images.unsplash.com/photo-1562575214-da9fcf59b907?auto=format&fit=crop&q=80"} 
          alt="" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, #000)' }} />
      </div>

      <div style={{ padding: '0 1.5rem', position: 'relative', zIndex: 10 }}>
        {/* Profile Info Section (Overlapping) */}
        <div style={{ marginTop: '-45px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ 
              width: '110px', height: '110px', borderRadius: '50%', border: '4px solid #000', 
              overflow: 'hidden', background: '#111', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              <img src={vendor.avatar_url || "/logo.png"} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <button style={{ 
              background: 'transparent', border: '1.5px solid var(--accent-gold)', color: 'var(--accent-gold)',
              fontSize: '0.8rem', fontWeight: 800, padding: '0.6rem 1.4rem', borderRadius: '0.6rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '10px'
            }}>
              <Star size={14} /> Follow
            </button>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>{vendor.business_name || vendor.full_name}</h1>
              <ShieldCheck size={18} color="var(--accent-gold)" fill="var(--accent-gold-soft)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#4ade80', fontWeight: 700 }}>
                 <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} /> Verified Dealer
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <MapPin size={12} color="var(--accent-gold)" /> Lagos, Nigeria
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.6rem', color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem' }}>
               <Star size={12} fill="var(--accent-gold)" color="var(--accent-gold)" />
               <span style={{ fontWeight: 800 }}>4.8</span>
               <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>(128 reviews)</span>
            </div>
          </div>
        </div>

        {/* High-Density Stats bar */}
        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.2rem', 
          background: 'rgba(255,255,255,0.02)', padding: '1.2rem 0.5rem', borderRadius: '1rem',
          margin: '2rem 0', border: '1px solid rgba(255,255,255,0.03)'
        }}>
           <StatItem icon={<TrendingUp size={16} />} value="245+" label="Cars Sold" />
           <StatItem icon={<Clock size={16} />} value="4+" label="Years Active" />
           <StatItem icon={<Zap size={16} />} value="98%" label="Response" />
           <StatItem icon={<Clock size={16} />} value="1h" label="Avg. Resp" />
        </div>

        {/* About Section */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: '0.8rem', letterSpacing: '0.5px' }}>About {vendor.business_name || vendor.full_name}</h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
            {isBioExpanded ? (vendor.bio || "Default bio description text here...") : `${(vendor.bio || "AutoHub Luxury Cars is a premium automotive dealership specializing in foreign and Nigerian luxury cars...").slice(0, 150)}...`}
          </p>
          <button 
            onClick={() => setIsBioExpanded(!isBioExpanded)}
            style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 800, marginTop: '0.6rem', padding: 0, display: 'flex', alignItems: 'center', gap: '0.2rem' }}
          >
            {isBioExpanded ? 'Read less' : 'Read more'} <ChevronDown size={14} style={{ transform: isBioExpanded ? 'rotate(180deg)' : 'none' }} />
          </button>
        </div>

        {/* Action Buttons Grid - Dark Solid Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '3rem' }}>
          <CompactButton icon={<Phone size={18} />} label="Call" />
          <CompactButton icon={<MessageCircle size={18} />} label="Chat" />
          <CompactButton icon={<Globe size={18} />} label="Website" />
          <CompactButton icon={<Navigation size={18} />} label="Directions" />
        </div>

        {/* Cars for Sale Section */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h2 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Cars for Sale</h2>
             <span style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
               View all ({cars.length}) <motion.div animate={{ x: [0, 3, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}><ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} /></motion.div>
             </span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollSnapType: 'x mandatory' }} className="no-scrollbar">
            {cars.map(car => (
              <div 
                key={car.id} 
                className="vendor-car-card"
                onClick={() => window.dispatchEvent(new CustomEvent('select-car', { detail: { car } }))}
                style={{ minWidth: '260px', background: '#0a0a0a', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', scrollSnapAlign: 'start' }}
              >
                <div style={{ height: '160px', position: 'relative' }}>
                  <img src={car.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '0.6rem', left: '0.6rem', background: '#4ade80', color: '#000', fontSize: '0.6rem', fontWeight: 900, padding: '0.2rem 0.5rem', borderRadius: '0.4rem' }}>Featured</div>
                  <button style={{ position: 'absolute', top: '0.6rem', right: '0.6rem', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', padding: '0.4rem', borderRadius: '50%' }}>
                     <Heart size={14} />
                  </button>
                </div>
                <div style={{ padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '0.2rem' }}>{car.make} {car.model}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>{car.year} · Automatic · Petrol</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'var(--accent-gold)', fontWeight: 900, fontSize: '1rem' }}>{formatPrice(car.price)}</div>
                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <MapPin size={10} /> Lagos
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews Section */}
        <div style={{ marginBottom: '120px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <h2 style={{ fontSize: '1.1rem', fontWeight: 900 }}>Customer Reviews</h2>
             <div style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                View all <ChevronLeft size={16} style={{ transform: 'rotate(180deg)' }} />
             </div>
           </div>
           
           <div style={{ background: '#0a0a0a', borderRadius: '1rem', padding: '1.2rem', border: '1px solid rgba(255,255,255,0.03)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <img src="https://i.pravatar.cc/150?u=james" alt="" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>James Okoro</div>
                    <div style={{ fontSize: '0.65rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 700 }}>
                       <CheckCircle2 size={10} /> Verified Buyer
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>2 weeks ago</div>
             </div>
             <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '0.8rem' }}>
               {[1,2,3,4,5].map(i => <Star key={i} size={12} fill="var(--accent-gold)" color="var(--accent-gold)" />)}
               <span style={{ fontSize: '0.75rem', fontWeight: 800, marginLeft: '0.4rem' }}>5.0</span>
             </div>
             <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>
               Great experience buying my G63. The car is exactly as described and the team was very professional throughout the process.
             </p>
           </div>
        </div>
      </div>

      {/* Floating Bottom Bar */}
      <div style={{ 
        position: 'fixed', bottom: 0, left: 0, right: 0, 
        padding: '1.2rem 1.5rem', background: 'rgba(0,0,0,0.8)', 
        backdropFilter: 'blur(15px)', borderTop: '1px solid rgba(255,255,255,0.05)',
        zIndex: 100
      }}>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-chat', { detail: { vendorId: vendorId } }))}
          className="btn-gold" 
          style={{ width: '100%', padding: '1rem', borderRadius: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontWeight: 900, fontSize: '0.9rem' }}
        >
          <MessageCircle size={20} color="black" />
          <span>Chat with Vendor</span>
        </button>
      </div>
    </div>
  );
};

const StatItem = ({ icon, value, label }: { icon: any, value: string, label: string }) => (
  <div style={{ textAlign: 'center' }}>
     <div style={{ color: 'var(--accent-gold)', marginBottom: '0.3rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
     <div style={{ fontSize: '0.95rem', fontWeight: 900 }}>{value}</div>
     <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem', fontWeight: 600 }}>{label}</div>
  </div>
);

const CompactButton = ({ icon, label }: { icon: any, label: string }) => (
  <div style={{ 
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
    padding: '1rem 0.4rem', background: '#0a0a0a', borderRadius: '0.8rem', border: '1px solid rgba(255,255,255,0.03)',
    cursor: 'pointer'
  }}>
    <div style={{ color: 'var(--accent-gold)' }}>{icon}</div>
    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>{label}</span>
  </div>
);
