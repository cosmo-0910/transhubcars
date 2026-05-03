import { useState, useEffect } from 'react';
import { ShieldCheck, Truck, UserCheck, MessageSquare, ArrowRight } from 'lucide-react';
import { db } from '../../shared/lib/db';
import type { Car } from '../../shared/lib/db';
import { VehicleCard } from './VehicleCard';

export const HomeSections = ({ onBrowseCategory, onViewAllBrands, onExploreCollection }: { 
  onBrowseCategory: (cat: string) => void,
  onViewAllBrands: () => void,
  onExploreCollection: () => void
}) => {
  const [luxuryCars, setLuxuryCars] = useState<Car[]>([]);
  const [recentCars, setRecentCars] = useState<Car[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allCars = await db.getCars({ onlyApproved: true });
        
        // Elite Collection: Price > 100M
        const elite = allCars.filter(c => c.price >= 100000000);
        setLuxuryCars(elite);

        // Recently Added: Last 5
        const recent = [...allCars].sort((a,b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()).slice(0, 5);
        setRecentCars(recent);
      } catch (err) {
        console.error('Failed to load home sections data:', err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="home-sections">
      {/* Elite Collection */}
      <section className="elite-collection-section" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
            <div>
              <span style={{ color: 'var(--accent-gold)', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '2px' }}>LIMITED COLLECTION</span>
              <h2 className="luxury-font" style={{ fontSize: '3rem', marginTop: '0.5rem' }}>Elite Collection</h2>
              <p style={{ color: 'var(--text-muted)', marginTop: '1rem', maxWidth: '400px' }}>Exceptional machines for exceptional people. Limited units available.</p>
              <button 
                onClick={onExploreCollection}
                className="btn-hero-secondary" 
                style={{ marginTop: '2rem', borderRadius: '30px', padding: '0.8rem 2rem' }}
              >
                Explore Collection <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="elite-carousel" style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', scrollSnapType: 'x mandatory' }}>
            {luxuryCars.map((car: Car) => (
              <div key={car.id} style={{ minWidth: '400px', scrollSnapAlign: 'start' }}>
                <VehicleCard car={car} onInquiry={() => window.dispatchEvent(new CustomEvent('select-car', { detail: { car } }))} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="trust-indicators-grid" style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          <TrustCard icon={<ShieldCheck size={32} />} title="Protected Transactions" desc="100% secure payments and data protection." />
          <TrustCard icon={<Truck size={32} />} title="Delivered Anywhere" desc="Nationwide delivery fast and reliable." />
          <TrustCard icon={<UserCheck size={32} />} title="Verified by Professionals" desc="Every car is inspected by our experts." />
          <TrustCard icon={<MessageSquare size={32} />} title="Always Available" desc="24/7 support whenever you need us." />
        </div>
      </section>

      {/* Browse by Category */}
      <section className="browse-categories" style={{ padding: '6rem 2rem' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
               <h2 className="luxury-font" style={{ fontSize: '2rem' }}>Browse by Category</h2>
               <button onClick={() => onBrowseCategory('All')} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 View All Categories <ArrowRight size={14} />
               </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
               <CategoryCard icon={<SUVIcon />} label="SUVs" count="120+ Vehicles" onClick={() => onBrowseCategory('SUV')} />
               <CategoryCard icon={<SaloonIcon />} label="Sedans" count="95+ Vehicles" onClick={() => onBrowseCategory('Saloon')} />
               <CategoryCard icon={<SportsIcon />} label="Sports" count="45+ Vehicles" onClick={() => onBrowseCategory('Sports')} />
               <CategoryCard icon={<LuxuryIcon />} label="Luxury" count="30+ Vehicles" onClick={() => onBrowseCategory('Luxury')} />
               <CategoryCard icon={<ElectricIcon />} label="Electric" count="25+ Vehicles" onClick={() => onBrowseCategory('Electric')} />
               <CategoryCard icon={<PickupIcon />} label="Pickup" count="55+ Vehicles" onClick={() => onBrowseCategory('Pickup')} />
            </div>
         </div>
      </section>

      {/* Popular Brands */}
      <section className="popular-brands" style={{ padding: '4rem 2rem', background: 'rgba(0,0,0,0.2)' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
               <h2 className="luxury-font" style={{ fontSize: '1.5rem' }}>Popular Brands</h2>
               <button 
                onClick={onViewAllBrands}
                style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
               >
                 View All Brands <ArrowRight size={14} />
               </button>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', padding: '1rem 0', justifyContent: 'space-between' }}>
               {['Toyota', 'Mercedes-Benz', 'Lexus', 'BMW', 'Honda', 'Hyundai', 'Kia', 'Nissan', 'Volkswagen'].map(brand => (
                 <BrandCircle key={brand} name={brand} />
               ))}
            </div>
         </div>
      </section>

      {/* Recently Added */}
      <section className="recently-added" style={{ padding: '6rem 2rem' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
               <h2 className="luxury-font" style={{ fontSize: '2rem' }}>Recently Added</h2>
               <button onClick={() => onBrowseCategory('All')} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 View All <ArrowRight size={14} />
               </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem' }}>
               {recentCars.map((car: Car) => (
                 <VehicleCard key={car.id} car={car} onInquiry={() => window.dispatchEvent(new CustomEvent('select-car', { detail: { car } }))} />
               ))}
            </div>
         </div>
         <style>{`
            @media (max-width: 1200px) {
              .recently-added > div > div:last-child { grid-template-columns: repeat(3, 1fr) !important; }
            }
            @media (max-width: 768px) {
              .recently-added > div > div:last-child { grid-template-columns: repeat(2, 1fr) !important; }
            }
         `}</style>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section" style={{ padding: '6rem 2rem' }}>
         <div className="glass" style={{ maxWidth: '1200px', margin: '0 auto', borderRadius: '2rem', padding: '4rem', position: 'relative', overflow: 'hidden', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1, zIndex: -1 }}></div>
            <div style={{ maxWidth: '600px' }}>
               <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Stay Updated</h2>
               <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Get the latest inventory, exclusive offers and automotive insights.</p>
               <div style={{ display: 'flex', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                  <input type="email" placeholder="Enter your email address" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'white', paddingLeft: '1rem' }} />
                  <button className="btn-gold" style={{ borderRadius: '0.8rem', padding: '0.8rem 2rem', fontWeight: 800 }}>Subscribe</button>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
};

const TrustCard = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
    <div style={{ color: 'var(--accent-gold)', flexShrink: 0 }}>{icon}</div>
    <div>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{title}</h4>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
    </div>
  </div>
);

const CategoryCard = ({ icon, label, count, onClick }: { icon: any, label: string, count: string, onClick: () => void }) => (
  <div onClick={onClick} className="glass glass-hover smooth-transition" style={{ padding: '2rem 1.5rem', borderRadius: '1.5rem', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
    <div style={{ color: 'var(--accent-gold)' }}>{icon}</div>
    <h4 className="luxury-font" style={{ fontSize: '1.2rem' }}>{label}</h4>
    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>{count}</span>
  </div>
);

const BrandCircle = ({ name }: { name: string }) => (
  <div className="glass glass-hover smooth-transition" style={{ 
    minWidth: '100px', height: '100px', borderRadius: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', padding: '0.5rem'
  }}>
    <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
      {name[0]}
    </div>
    <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '1px', textAlign: 'center' }}>{name.toUpperCase()}</span>
  </div>
);

// Reuse icons from Footer or define here if Footer becomes simpler
const SUVIcon = () => (
  <svg width="40" height="20" viewBox="0 0 48 24" fill="currentColor">
    <path d="M2,18 L2,14 C2,12 4,11 6,11 L10,11 L15,6 L35,6 L42,12 L46,14 L46,18 L44,18 L44,16 C44,14 42,14 42,16 L42,18 L34,18 L34,16 C34,14 32,14 32,16 L32,18 L16,18 L16,16 C16,14 14,14 14,16 L14,18 L6,18 L6,16 C6,14 4,14 4,16 L4,18 L2,18 Z" />
  </svg>
);
const SaloonIcon = () => (
   <svg width="40" height="20" viewBox="0 0 48 24" fill="currentColor">
     <path d="M2,18 L2,15 C2,13 4,12 6,12 L12,12 L18,8 L32,8 L40,12 L44,12 L46,15 L46,18 L2,18 Z" />
   </svg>
 );
 const SportsIcon = () => (
   <svg width="40" height="20" viewBox="0 0 48 24" fill="currentColor">
     <path d="M2,18 L2,16 L6,16 L14,11 L35,11 L44,15 L46,16 L46,18 L2,18 Z" />
   </svg>
 );
 const LuxuryIcon = () => (
    <svg width="40" height="20" viewBox="0 0 48 24" fill="currentColor">
      <path d="M4,18 L4,14 C4,10 8,8 10,8 L15,8 L20,4 L35,4 L40,8 L44,8 C46,8 48,10 48,14 L48,18 L4,18 Z" />
    </svg>
 );
 const ElectricIcon = () => (
    <svg width="40" height="20" viewBox="0 0 48 24" fill="currentColor">
      <path d="M10,18 L10,12 L15,6 L35,6 L40,12 L40,18 L10,18 Z M24,10 L20,14 L24,14 L20,18 L28,12 L24,12 L28,8 L24,10 Z" />
    </svg>
 );
 const PickupIcon = () => (
    <svg width="40" height="20" viewBox="0 0 48 24" fill="currentColor">
      <path d="M2,18 L2,12 L15,12 L22,6 L38,6 L38,18 L2,18 Z M38,10 L46,10 L46,18 L38,18 L38,10 Z" />
    </svg>
 );
