import { useState, useEffect } from 'react';
import { 
  Car, 
  Heart,
  ArrowRight,
  TrendingUp,
  Award,
  ShieldCheck,
  Headphones,
  Sparkles
} from 'lucide-react';
import { db } from '../../shared/lib/db';
import type { Car as CarType } from '../../shared/lib/db';
import { formatPrice } from '../../shared/lib/formatters';

export const HomeSections = ({ onBrowseCategory, onViewAllBrands }: { 
  onBrowseCategory: (cat: string) => void,
  onViewAllBrands: () => void
}) => {
  const [featuredCars, setFeaturedCars] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const allCars = await db.getCars({ onlyApproved: true });
        // Curated selection: pick first 3
        setFeaturedCars(allCars.slice(0, 3));
      } catch (err) {
        console.error('Failed to load home sections data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="bg-background text-on-surface font-body-md">
      
      {/* curates selection: Featured Vehicles */}
      <section className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-20 lg:py-32">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4 text-left">
          <div>
            <span className="text-label-caps font-label-caps text-luxury-gold mb-2 block tracking-widest text-[10px]">
              CURATED SELECTION
            </span>
            <h2 className="text-3xl font-bold font-headline-lg text-on-surface">Featured Vehicles</h2>
          </div>
          <button 
            onClick={() => onBrowseCategory('All')} 
            className="text-label-caps font-label-caps text-luxury-gold hover:underline flex items-center gap-1 text-xs tracking-wider"
          >
            VIEW SHOWROOM <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="glass-card animate-pulse h-80 rounded-xl bg-surface-container" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCars.map((car) => {
              return (
                <div 
                  key={car.id}
                  onClick={() => window.dispatchEvent(new CustomEvent('select-car', { detail: { car } }))}
                  className="glass-card group cursor-pointer overflow-hidden rounded-xl text-left"
                >
                  <div className="relative h-64 overflow-hidden bg-black">
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      src={car.image_url} 
                      alt={`${car.make} ${car.model}`}
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-primary text-on-primary text-[10px] font-bold px-2.5 py-1 rounded">
                        VERIFIED
                      </span>
                      <span className="bg-deep-charcoal/60 backdrop-blur-md text-on-surface text-[10px] font-bold px-2.5 py-1 rounded border border-glass-border">
                        {car.year}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-on-surface mb-1 font-headline-md truncate">
                      {car.make} {car.model}
                    </h3>
                    <p className="text-on-surface-variant text-sm mb-4">
                      {car.transmission?.split(' ')[0]} • {car.mileage ? `${car.mileage.toLocaleString()} km` : 'Brand New'}
                    </p>
                    <div className="flex justify-between items-center pt-4 border-t border-glass-border">
                      <span className="text-luxury-gold font-bold text-2xl tracking-tight">
                        {formatPrice(car.price)}
                      </span>
                      <button className="w-10 h-10 rounded-full flex items-center justify-center bg-transparent hover:bg-luxury-gold/10 transition-colors group/heart">
                        <Heart size={16} className="text-on-surface-variant group-hover/heart:text-luxury-gold transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Search & Action Bento Grid */}
      <section className="bg-surface-container-lowest py-20 lg:py-32">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Filter Info Box */}
            <div className="lg:col-span-4 glass-card p-6 rounded-xl space-y-6 text-left">
              <div>
                <h4 className="text-label-caps font-label-caps text-on-surface mb-4 text-xs tracking-wider">
                  REFINE SELECTION
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Verified Sellers</span>
                    <input defaultChecked type="checkbox" className="rounded border-glass-border bg-transparent text-luxury-gold focus:ring-0 w-4 h-4" />
                  </label>
                  <label className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Discount Deals</span>
                    <input type="checkbox" className="rounded border-glass-border bg-transparent text-luxury-gold focus:ring-0 w-4 h-4" />
                  </label>
                  <label className="flex items-center justify-between group cursor-pointer">
                    <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Registered Cars</span>
                    <input type="checkbox" className="rounded border-glass-border bg-transparent text-luxury-gold focus:ring-0 w-4 h-4" />
                  </label>
                </div>
              </div>
              
              <div className="border-t border-glass-border pt-6">
                <h4 className="text-label-caps font-label-caps text-on-surface mb-3 text-xs tracking-wider">CONDITION</h4>
                <select className="w-full bg-surface border-0 border-b border-glass-border focus:border-luxury-gold focus:ring-0 text-sm text-on-surface py-2 px-0 cursor-pointer outline-none">
                  <option>Foreign Used (Tokunbo)</option>
                  <option>Nigerian Used</option>
                  <option>Brand New</option>
                </select>
              </div>

              <button 
                onClick={() => onBrowseCategory('All')}
                className="w-full bg-surface-variant text-on-surface py-3 text-label-caps font-label-caps text-xs tracking-widest hover:bg-surface-bright transition-colors font-bold"
              >
                RESET FILTERS
              </button>
            </div>

            {/* Right Quick Actions Grid */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Bento Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                
                <div 
                  onClick={() => onBrowseCategory('All')}
                  className="flex items-center justify-between p-6 glass-card rounded-xl cursor-pointer hover:border-luxury-gold/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-luxury-gold bg-luxury-gold/10 p-3 rounded-lg"><Sparkles size={24} /></div>
                    <div>
                      <h4 className="font-headline-md text-base font-bold text-on-surface">Browse Showroom</h4>
                      <p className="text-xs text-on-surface-variant mt-1">Exclusive discounts on premium verified inventory.</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-on-surface-variant" />
                </div>

                <div 
                  onClick={onViewAllBrands}
                  className="flex items-center justify-between p-6 glass-card rounded-xl cursor-pointer hover:border-luxury-gold/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-luxury-gold bg-luxury-gold/10 p-3 rounded-lg"><Car size={24} /></div>
                    <div>
                      <h4 className="font-headline-md text-base font-bold text-on-surface">Premium Brands</h4>
                      <p className="text-xs text-on-surface-variant mt-1">Directly browse catalog by luxury manufacturer.</p>
                    </div>
                  </div>
                  <ArrowRight size={18} className="text-on-surface-variant" />
                </div>

              </div>

              {/* preorders quick banner */}
              <div className="glass-card rounded-xl p-8 text-left relative overflow-hidden bg-gradient-to-r from-luxury-gold/10 to-transparent border border-glass-border">
                <div className="max-w-md relative z-10">
                  <span className="text-label-caps font-label-caps text-luxury-gold text-[10px] tracking-wider font-bold mb-2 block">CONCIERGE SERVICES</span>
                  <h3 className="text-2xl font-headline-lg font-bold text-on-surface mb-2">Preorder Sourcing</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                    Can't find your dream specs? Leverage our verified global networks to source and ship any vehicle directly to your doorstep.
                  </p>
                  <button 
                    onClick={() => onBrowseCategory('All')} 
                    className="bg-luxury-gold text-on-primary px-6 py-2.5 rounded-lg text-label-caps font-label-caps text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
                  >
                    REQUEST SOURCING
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="border-y border-glass-border bg-deep-charcoal py-20 lg:py-28">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
          
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6 border border-glass-border text-luxury-gold">
              <Award size={28} />
            </div>
            <p className="text-4xl font-bold text-on-surface mb-1 tracking-tighter font-headline-md">10K+</p>
            <p className="text-[10px] font-label-caps text-outline tracking-widest font-bold">VERIFIED CARS</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6 border border-glass-border text-luxury-gold">
              <TrendingUp size={28} />
            </div>
            <p className="text-4xl font-bold text-on-surface mb-1 tracking-tighter font-headline-md">25K+</p>
            <p className="text-[10px] font-label-caps text-outline tracking-widest font-bold">HAPPY CUSTOMERS</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6 border border-glass-border text-luxury-gold">
              <ShieldCheck size={28} />
            </div>
            <p className="text-4xl font-bold text-on-surface mb-1 tracking-tighter font-headline-md">3.5K+</p>
            <p className="text-[10px] font-label-caps text-outline tracking-widest font-bold">TRUSTED DEALERS</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-6 border border-glass-border text-luxury-gold">
              <Headphones size={28} />
            </div>
            <p className="text-4xl font-bold text-on-surface mb-1 tracking-tighter font-headline-md">24/7</p>
            <p className="text-[10px] font-label-caps text-outline tracking-widest font-bold">ACTIVE SUPPORT</p>
          </div>

        </div>
      </section>

      {/* Category Icons Grid */}
      <section className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-20 lg:py-32">
        <div className="flex justify-between items-end mb-12 text-left">
          <div>
            <span className="text-label-caps font-label-caps text-luxury-gold mb-2 block tracking-widest text-[10px]">
              EXPLORE BY TYPE
            </span>
            <h2 className="text-3xl font-bold font-headline-lg text-on-surface">Browse by Category</h2>
          </div>
          <button 
            onClick={() => onBrowseCategory('All')} 
            className="text-label-caps font-label-caps text-luxury-gold hover:underline text-xs tracking-wider font-bold"
          >
            VIEW ALL CATEGORIES
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <CategoryCard icon="SUV" label="SUVs" onClick={() => onBrowseCategory('SUV')} />
          <CategoryCard icon="Saloon" label="Sedans" onClick={() => onBrowseCategory('Saloon')} />
          <CategoryCard icon="Pickup" label="Trucks" onClick={() => onBrowseCategory('Pickup')} />
          <CategoryCard icon="Coupe" label="Luxury Coupes" onClick={() => onBrowseCategory('Coupe')} />
          <CategoryCard icon="Electric" label="Electric EV" onClick={() => onBrowseCategory('Electric')} />
          <CategoryCard icon="Hatchback" label="Hatchbacks" onClick={() => onBrowseCategory('Hatchback')} />
          <CategoryCard icon="Convertible" label="Convertibles" onClick={() => onBrowseCategory('Convertible')} />
          <CategoryCard icon="All" label="Explore All" onClick={() => onBrowseCategory('All')} />
        </div>
      </section>

    </div>
  );
};

const CategoryCard = ({ icon, label, onClick }: { icon: string, label: string, onClick: () => void }) => {
  return (
    <div 
      onClick={onClick}
      className="glass-card group p-8 rounded-xl flex flex-col items-center text-center cursor-pointer transition-all hover:-translate-y-1 hover:border-luxury-gold/30"
    >
      <div className="text-on-surface-variant group-hover:text-luxury-gold transition-colors mb-4">
        {icon === 'SUV' && <Car size={36} />}
        {icon === 'Saloon' && <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 13v3c0 .6.4 1 1 1h2m12 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zm-12 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/></svg>}
        {icon === 'Pickup' && <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 10h4l2.5 2.5A2.3 2.3 0 0 1 21 14.1V17h-2M5 17h10m4 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-14 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-1.8-6.1L4.6 6.5A2 2 0 0 1 6.3 5.5H12c.6 0 1 .4 1 1v6"/></svg>}
        {icon === 'Coupe' && <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 17h2c.6 0 1-.4 1-1v-2.5c0-.8-.5-1.5-1.2-1.8L16.2 10H13l-2.5-3.3c-.4-.5-1-.7-1.6-.7H4.3c-.6 0-1.2.4-1.4.9l-1.2 2.5A3.2 3.2 0 0 0 1.5 12v4c0 .6.4 1 1 1h2M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>}
        {icon === 'Electric' && <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>}
        {icon === 'Hatchback' && <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 17h1.5c.3 0 .5-.2.5-.5V14c0-.7-.4-1.3-1-1.6l-3.3-1.4-2.2-2.5c-.3-.4-.8-.5-1.3-.5H6.3c-.5 0-.9.2-1.2.6L3.5 11v5.5c0 .3.2.5.5.5h2M17 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>}
        {icon === 'Convertible' && <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 17h2c.6 0 1-.4 1-1v-3.5c0-.8-.5-1.5-1.2-1.8L16.2 9H4.3c-.6 0-1.2.4-1.4.9l-1.2 2.5a3.2 3.2 0 0 0-.2 1.1v3c0 .6.4 1 1 1h2m12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>}
        {icon === 'All' && <ArrowRight size={36} />}
      </div>
      <span className="text-label-caps font-label-caps text-on-surface font-bold text-xs uppercase tracking-wider">{label}</span>
    </div>
  );
};
