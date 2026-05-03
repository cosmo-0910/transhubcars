import { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  Search, 
  Car, 
  Clock, 
  MapPin, 
  Heart,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Award,
  Truck,
  Zap as Electric,
  Monitor as Sedan,
  Car as SUV,
  Briefcase
} from 'lucide-react';
import { db } from '../../shared/lib/db';
import type { Car as CarType } from '../../shared/lib/db';
import { formatPrice } from '../../shared/lib/formatters';

export const HomeSections = ({ onBrowseCategory, onViewAllBrands }: { 
  onBrowseCategory: (cat: string) => void,
  onViewAllBrands: () => void
}) => {
  const [featuredCars, setFeaturedCars] = useState<CarType[]>([]);
  const activeLocation = 'Lagos, Nigeria';

  useEffect(() => {
    const loadData = async () => {
      try {
        const allCars = await db.getCars({ onlyApproved: true });
        // Featured: Just take top 4 for the home list
        setFeaturedCars(allCars.slice(0, 4));
      } catch (err) {
        console.error('Failed to load home sections data:', err);
      }
    };
    loadData();
  }, []);

  return (
    <div className="home-sections-modern" style={{ background: '#000', color: '#fff', paddingBottom: '5rem' }}>
      
      {/* ── Location Selector ── */}
      <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.05)', 
          padding: '0.6rem 1rem', 
          borderRadius: '2rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.6rem',
          cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <MapPin size={16} color="var(--accent-gold)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activeLocation}</span>
          <ChevronDown size={14} color="#888" />
        </div>
      </div>

      {/* ── Main Hero Text Overlay ── */}
      <div style={{ padding: '2rem 1.5rem' }}>
         <h1 className="luxury-font" style={{ fontSize: '3rem', lineHeight: '1.1', marginBottom: '1rem' }}>
            Buy or Sell <br />
            Verified Cars <br />
            <span style={{ color: 'var(--accent-gold)', fontStyle: 'italic' }}>in Nigeria</span>
         </h1>
         <p style={{ color: '#888', fontSize: '1rem', maxWidth: '300px', lineHeight: '1.5' }}>
            The most trusted marketplace for premium, foreign and Nigerian cars.
         </p>
      </div>

      {/* ── Secondary Search ── */}
      <div style={{ padding: '1rem 1.5rem' }}>
        <div style={{ 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          <div style={{ paddingLeft: '1.2rem', color: '#666' }}><Search size={20} /></div>
          <input 
            type="text" 
            placeholder="Search make, model, year..." 
            style={{ 
              flex: 1, 
              background: 'none', 
              border: 'none', 
              padding: '1.2rem', 
              color: '#fff', 
              fontSize: '0.95rem',
              outline: 'none'
            }} 
          />
          <button style={{ 
            background: 'var(--accent-gold)', 
            border: 'none', 
            padding: '1.2rem', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Search size={20} color="#000" />
          </button>
        </div>
      </div>

      {/* ── Quick Action Grid ── */}
      <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
         <ActionCard icon={<Car size={24} />} title="Sell a Car" />
         <ActionCard icon={<Clock size={24} />} title="Browse Deals" />
      </div>

      {/* ── Stats Row ── */}
      <div style={{ padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
         <StatItem value="10K+" label="Verified Cars" icon={<Award size={14} />} />
         <StatItem value="25K+" label="Happy Customers" icon={<TrendingUp size={14} />} />
         <StatItem value="3.5K+" label="Trusted Dealers" icon={<CheckCircle2 size={14} />} />
         <StatItem value="24/7" label="Support" icon={<Clock size={14} />} />
      </div>

      {/* ── Featured Cars Section ── */}
      <section style={{ padding: '2rem 1.5rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="luxury-font" style={{ fontSize: '1.8rem' }}>Featured Cars</h2>
            <button onClick={() => onBrowseCategory('All')} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.9rem' }}>View all</button>
         </div>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {featuredCars.map((car) => (
              <FeaturedCarCard key={car.id} car={car} />
            ))}
         </div>
      </section>

      {/* ── Browse by Category ── */}
      <section style={{ padding: '2rem 1.5rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 className="luxury-font" style={{ fontSize: '1.8rem' }}>Browse by Category</h2>
            <button onClick={onViewAllBrands} style={{ background: 'none', border: 'none', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.9rem' }}>View all</button>
         </div>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
            <CategoryIcon icon={<SUV size={24} />} label="SUVs" onClick={() => onBrowseCategory('SUV')} />
            <CategoryIcon icon={<Sedan size={24} />} label="Sedans" onClick={() => onBrowseCategory('Saloon')} />
            <CategoryIcon icon={<Truck size={24} />} label="Trucks" onClick={() => onBrowseCategory('Pickup')} />
            <CategoryIcon icon={<Car size={24} />} label="Luxury" onClick={() => onBrowseCategory('Luxury')} />
            <CategoryIcon icon={<Electric size={24} />} label="Electric" onClick={() => onBrowseCategory('Electric')} />
            <CategoryIcon icon={<Car size={24} />} label="Hatchbacks" onClick={() => onBrowseCategory('Hatchback')} />
            <CategoryIcon icon={<Briefcase size={24} />} label="Commercial" onClick={() => onBrowseCategory('Commercial')} />
            <CategoryIcon icon={<ArrowRight size={24} />} label="More" onClick={() => onBrowseCategory('All')} />
         </div>
      </section>

    </div>
  );
};

const ActionCard = ({ icon, title }: { icon: any, title: string }) => (
  <div style={{ 
    background: 'rgba(255,255,255,0.02)', 
    border: '1px solid rgba(255,255,255,0.05)', 
    padding: '1.5rem', 
    borderRadius: '1.2rem', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '1rem',
    cursor: 'pointer'
  }}>
    <div style={{ color: 'var(--accent-gold)' }}>{icon}</div>
    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{title}</span>
  </div>
);

const StatItem = ({ value, label, icon }: { value: string, label: string, icon: any }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ color: 'var(--accent-gold)', marginBottom: '0.4rem', display: 'flex', justifyContent: 'center' }}>{icon}</div>
    <div style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '0.2rem' }}>{value}</div>
    <div style={{ fontSize: '0.65rem', color: '#888', fontWeight: 600, lineHeight: 1.2 }}>{label}</div>
  </div>
);

const FeaturedCarCard = ({ car }: { car: CarType }) => (
  <div style={{ 
    background: 'rgba(255,255,255,0.02)', 
    borderRadius: '1.5rem', 
    overflow: 'hidden', 
    border: '1px solid rgba(255,255,255,0.05)',
    cursor: 'pointer'
  }}
  onClick={() => window.dispatchEvent(new CustomEvent('select-car', { detail: { car } }))}
  >
    <div style={{ position: 'relative', height: '220px' }}>
      <img src={car.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: '#4ade80', color: '#000', fontSize: '0.65rem', fontWeight: 900, padding: '0.4rem 0.8rem', borderRadius: '0.5rem', textTransform: 'uppercase' }}>Featured</div>
      <button style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.3)', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
        <Heart size={18} />
      </button>
    </div>
    <div style={{ padding: '1.5rem' }}>
       <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{car.make} {car.model}</h3>
       <div style={{ display: 'flex', gap: '0.8rem', color: '#888', fontSize: '0.8rem', marginBottom: '1.2rem' }}>
          <span>{car.year}</span>
          <span>•</span>
          <span>{car.transmission || 'Automatic'}</span>
          <span>•</span>
          <span>{car.fuel_type || 'Petrol'}</span>
       </div>
       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--accent-gold)' }}>{formatPrice(car.price)}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#888', fontSize: '0.75rem' }}>
            <MapPin size={14} color="var(--accent-gold)" /> Lagos
          </div>
       </div>
    </div>
  </div>
);

const CategoryIcon = ({ icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
  <div onClick={onClick} style={{ textAlign: 'center', cursor: 'pointer' }}>
    <div style={{ 
      background: 'rgba(255,255,255,0.02)', 
      border: '1px solid rgba(255,255,255,0.05)', 
      padding: '1.2rem', 
      borderRadius: '1rem', 
      marginBottom: '0.6rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--accent-gold)'
    }}>
      {icon}
    </div>
    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff' }}>{label}</div>
  </div>
);
