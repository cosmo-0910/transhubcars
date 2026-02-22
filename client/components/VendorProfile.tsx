import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, User, Store, ShieldCheck, Package, MessageSquare } from 'lucide-react';
import { supabase, db, type Car } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import { formatPrice } from '../../shared/lib/formatters';

interface Vendor {
  id: string;
  full_name: string;
  business_name: string;
  role: string;
  vendor_status: string;
  vendor_type: string;
  store_image_url?: string;
  avatar_url?: string;
  created_at: string;
}

export const VendorProfile = ({ vendorId, onClose }: { vendorId: string, onClose: () => void }) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [canMessage, setCanMessage] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const loadVendorData = async () => {
      try {
        setLoading(true);
        // Fetch vendor profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', vendorId)
          .single();

        if (profileError) throw profileError;
        setVendor(profile);

        // Fetch vendor's cars
        const { data: vendorCars, error: carsError } = await supabase
          .from('cars')
          .select(`
            *,
            profiles:vendor_id(id, full_name, role, vendor_status)
          `)
          .eq('vendor_id', vendorId)
          .eq('approval_status', 'approved');

        if (carsError) throw carsError;
        setCars(vendorCars || []);

        // Engagement check for messaging
        if (user) {
          const hasEngagement = await db.hasEngagementWithVendor(user.id, vendorId);
          setCanMessage(hasEngagement);
        }

      } catch (err) {
        console.error('Failed to load vendor data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      loadVendorData();
    }
  }, [vendorId]);

  const handleCarClick = (car: Car) => {
    // Revert to original inquiry form behavior from profile as well
    // Or just let it open the car detail which then has the "INQUIRE" button?
    // User said: "Inquiry should be made the way it was supposed to be made before"
    // So if they click a car here, maybe it should just open the car detail (custom event for selectedCar?)
    const event = new CustomEvent('select-car', { detail: { car } });
    window.dispatchEvent(event);
    onClose();
  };

  if (loading) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 6000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loader"></div>
      </div>
    );
  }

  if (!vendor) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="elite-modal-overlay"
      style={{ zIndex: 6000 }}
    >
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          borderRadius: '2rem',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          border: '1px solid var(--border-glass)',
          background: 'var(--bg-deep)',
          padding: '0'
        }}
      >
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 20, background: 'var(--bg-glass)', border: 'none', color: 'var(--text-main)', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
        >
          <X size={24} />
        </button>

        {/* Header Cover Area */}
        <div style={{ position: 'relative', height: '250px', background: 'black' }}>
          {vendor.store_image_url ? (
            <img src={vendor.store_image_url} alt="Storefront" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(45deg, #1a1a1a, #000)', opacity: 0.8 }}></div>
          )}
          <div style={{ position: 'absolute', bottom: '-50px', left: '3rem', display: 'flex', alignItems: 'flex-end', gap: '1.5rem' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '1rem', 
              background: 'var(--bg-deep)', 
              border: '4px solid var(--bg-deep)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
              overflow: 'hidden'
            }}>
              {vendor.avatar_url ? (
                <img src={vendor.avatar_url} alt={vendor.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'var(--accent-gold-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={60} color="var(--accent-gold)" />
                </div>
              )}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
               <h2 className="luxury-font" style={{ fontSize: '2.4rem', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                 {vendor.business_name || vendor.full_name}
               </h2>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                 <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '2px' }}>
                   {(vendor.vendor_status || 'NONE').toUpperCase()} PARTNER
                 </span>
                 <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} />
                 <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                   ESTABLISHED {new Date(vendor.created_at || new Date()).getFullYear()}
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '5rem 3rem 3rem', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 300px) 1fr', gap: '3rem' }}>
            {/* Sidebar info */}
            <div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border-glass)' }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '2px', marginBottom: '1.5rem', fontWeight: 800 }}>COLLECTION INTEL</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <ShieldCheck size={18} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.85rem' }}>Verified Merchant</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Package size={18} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.85rem' }}>{cars.length} Active Listings</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Store size={18} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.85rem' }}>{(vendor.vendor_type || 'CAR').toUpperCase()} Specialist</span>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'var(--border-glass)', margin: '2rem 0' }} />
                
                {canMessage && (
                  <button 
                    onClick={() => {
                      const event = new CustomEvent('open-chat', { 
                        detail: { carId: null, vendorId: vendorId } 
                      });
                      window.dispatchEvent(event);
                      onClose();
                    }}
                    className="btn-gold"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1rem' }}
                  >
                    <MessageSquare size={18} />
                    MESSAGE VENDOR
                  </button>
                )}
              </div>
            </div>

            {/* Main Listings */}
            <div>
              <header style={{ marginBottom: '2.5rem' }}>
                <h3 className="luxury-font" style={{ fontSize: '2rem' }}>Active Inventory.</h3>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Curated selections currently available from this partner.</p>
              </header>

              {cars.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: '1.5rem', border: '1px dashed var(--border-glass)' }}>
                  <Package size={48} opacity={0.1} style={{ marginBottom: '1.5rem' }} />
                  <p style={{ color: 'var(--text-muted)' }}>No active listings currently available.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {cars.map(car => (
                    <motion.div 
                      key={car.id}
                      whileHover={{ y: -5 }}
                      onClick={() => handleCarClick(car)}
                      className="glass glass-hover"
                      style={{ borderRadius: '1rem', overflow: 'hidden', cursor: 'pointer', border: '1px solid var(--border-glass)' }}
                    >
                      <img src={car.image_url} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                      <div style={{ padding: '1.2rem' }}>
                        <div style={{ fontSize: '0.65rem', color: 'var(--accent-gold)', fontWeight: 800, marginBottom: '0.4rem' }}>{car.year} EDITION</div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{car.make} {car.model}</h4>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '0.8rem' }}>
                          {formatPrice(car.price)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
