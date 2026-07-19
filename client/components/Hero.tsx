import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calendar, ShieldCheck, Truck, Headphones, Heart, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { db } from '../../shared/lib/db';
import type { Car } from '../../shared/lib/db';
import { formatPrice } from '../../shared/lib/formatters';

export const Hero = ({ onBrowse, onPreorder }: { onBrowse: () => void, onPreorder: () => void }) => {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [globalStats, setGlobalStats] = useState({ carsCount: 0, usersCount: 0, vendorsCount: 0 });
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const [cars, stats] = await Promise.all([
          db.getCars({ onlyApproved: true }),
          db.getGlobalStats()
        ]);
        setGlobalStats(stats);
        const pinnedCars = cars.filter(c => c.is_pinned);
        let selected = pinnedCars.length >= 3 ? pinnedCars : cars;
        setFeaturedCars(selected.slice(0, 5));
      } catch (err) {
        console.error('Failed to load Hero data:', err);
      }
    };
    loadFeatured();
  }, []);

  useEffect(() => {
    if (!isPaused && featuredCars.length > 0) {
      autoplayRef.current = setInterval(() => {
        setScrollIndex(prev => (prev + 1) % featuredCars.length);
      }, 4500);
    }
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isPaused, featuredCars.length]);

  const displayCars = featuredCars;

  const renderCard = (car: Partial<Car>, index: number) => {
    const isAvail = car.status === 'Readily Available';
    const position = (index - scrollIndex + displayCars.length) % displayCars.length;
    
    let x = 0;
    let zIndex = 0;
    let opacity = 0;
    let scale = 1;
    let rotateY = 0;

    if (position === 0) {
      x = 0;
      zIndex = 30;
      opacity = 1;
      scale = 1;
      rotateY = 0;
    } else if (position === 1) {
      x = 80;
      zIndex = 20;
      opacity = 0.4;
      scale = 0.9;
      rotateY = -10;
    } else if (position === displayCars.length - 1 && displayCars.length > 1) {
      x = -80;
      zIndex = 20;
      opacity = 0.4;
      scale = 0.9;
      rotateY = 10;
    } else {
      x = 160;
      zIndex = 10;
      opacity = 0;
      scale = 0.8;
      rotateY = -20;
    }

    return (
      <motion.div 
         key={`card-${car.id || index}`}
         layout
         initial={{ opacity: 0, scale: 0.8 }}
         animate={{ 
           x, 
           zIndex, 
           opacity, 
           scale,
           rotateY
         }}
         whileHover={{ scale: position === 0 ? 1.03 : scale, zIndex: position === 0 ? 50 : zIndex }}
         transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
         className="absolute w-[280px] sm:w-[320px] md:w-[360px] glass-card rounded-2xl overflow-hidden group cursor-pointer"
         style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-black">
          <img src={car.image_url} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/>
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="bg-primary-container text-on-primary-container font-label-caps text-[10px] px-3 py-1 rounded-full uppercase font-bold">
              VERIFIED
            </span>
            <span className="bg-surface/80 backdrop-blur-md text-luxury-gold font-label-caps text-[10px] px-3 py-1 rounded-full uppercase border border-glass-border">
              {isAvail ? 'AVAILABLE' : 'PREORDER'}
            </span>
          </div>
          <button className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/60 border border-glass-border flex items-center justify-center text-luxury-gold hover:bg-luxury-gold hover:text-black transition-all">
            <Heart size={16} />
          </button>
        </div>
        <div className="p-5 text-left bg-surface-container/30">
          <h3 className="font-headline-md text-lg text-on-surface font-bold truncate">{car.make} {car.model}</h3>
          <p className="text-xs text-on-surface-variant mt-1">{car.year} • {car.transmission?.split(' ')[0]} • {car.fuel_type}</p>
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-glass-border">
            <span className="font-bold text-luxury-gold text-lg">{car.price ? formatPrice(car.price) : ''}</span>
            <button className="text-xs font-bold text-luxury-gold flex items-center gap-1 hover:underline">
              DETAILS <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <header className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
        
        {/* Background Visual Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-deep-charcoal via-deep-charcoal/80 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
          <img 
            className="w-full h-full object-cover opacity-35" 
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop" 
            alt="Sleek Porsche 911 GT3"
          />
        </div>

        <div className="relative z-20 w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column Text Info */}
            <div className="text-left max-w-2xl">
              <span className="text-label-caps font-label-caps text-luxury-gold mb-4 block tracking-[0.3em]">
                PREMIUM AUTOMOTIVE MARKETPLACE
              </span>
              <h1 className="text-display-lg font-display-lg text-on-surface mb-6 text-4xl sm:text-5xl lg:text-6xl leading-[1.1] font-bold">
                Buy or Preorder <br />
                <span className="text-luxury-gold italic">Verified Cars</span> <br /> 
                in Nigeria
              </h1>
              <p className="text-body-lg font-body-lg text-on-surface-variant mb-10 leading-relaxed max-w-lg">
                Access inspected vehicles, secure preorders, and fast delivery. No guesswork. The most trusted destination for premium automotive excellence.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={onBrowse}
                  className="bg-luxury-gold text-on-primary px-8 py-4 rounded-full font-label-caps text-label-caps font-bold flex items-center justify-center gap-2 hover:brightness-110 hover:shadow-lg hover:shadow-luxury-gold/15 active:scale-95 transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3m12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg>
                  Browse Inventory
                </button>
                <button 
                  onClick={onPreorder}
                  className="border border-luxury-gold text-luxury-gold px-8 py-4 rounded-full font-label-caps text-label-caps font-bold flex items-center justify-center gap-2 hover:bg-luxury-gold/10 active:scale-95 transition-all"
                >
                  <Calendar size={18} />
                  Preorder a Car
                </button>
              </div>

              {/* Mini Stats Row */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t border-glass-border">
                <div>
                  <div className="text-2xl font-bold text-luxury-gold font-headline-md">
                    {globalStats.carsCount > 0 ? `${(globalStats.carsCount / 1000).toFixed(1)}K+` : '1.2K+'}
                  </div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">Verified Cars</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-luxury-gold font-headline-md">
                    {globalStats.usersCount > 0 ? `${(globalStats.usersCount / 1000).toFixed(1)}K+` : '5.8K+'}
                  </div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">Customers</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-luxury-gold font-headline-md">
                    {globalStats.vendorsCount > 0 ? `${(globalStats.vendorsCount)}` : '120'}
                  </div>
                  <div className="text-xs text-on-surface-variant uppercase tracking-wider mt-1">Dealers</div>
                </div>
              </div>
            </div>

            {/* Right Column Interactive Slideshow */}
            <div className="hidden lg:flex flex-col items-center justify-center relative w-full h-[500px]">
              <div className="featured-header flex justify-between items-center w-full max-w-[450px] mb-6">
                <span className="text-label-caps font-label-caps text-on-surface tracking-wider">Featured Showcase</span>
                <a 
                  href="#inventory" 
                  onClick={(e) => { e.preventDefault(); onBrowse(); }} 
                  className="text-xs font-bold text-luxury-gold flex items-center gap-1 hover:underline"
                >
                  View Showroom <ArrowRight size={14} />
                </a>
              </div>

              {/* Stacked Cards Area */}
              <div className="relative w-full flex items-center justify-center h-[360px] preserve-3d">
                <AnimatePresence initial={false}>
                  {displayCars.map((c, i) => renderCard(c, i))}
                </AnimatePresence>
              </div>

              {/* Controls */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setScrollIndex(prev => (prev - 1 + displayCars.length) % displayCars.length)}
                  className="w-12 h-12 rounded-full border border-glass-border flex items-center justify-center text-on-surface hover:bg-surface-variant hover:text-luxury-gold transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => setScrollIndex(prev => (prev + 1) % displayCars.length)}
                  className="w-12 h-12 rounded-full border border-glass-border flex items-center justify-center text-on-surface hover:bg-surface-variant hover:text-luxury-gold transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* Value Propositions Bar */}
      <section className="bg-surface-container-low border-y border-glass-border py-10">
        <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex items-center gap-4 text-left">
            <div className="text-luxury-gold bg-luxury-gold/10 p-3 rounded-lg"><Lock size={24} /></div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">Secure Payments</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">100% Protected Deals</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-left">
            <div className="text-luxury-gold bg-luxury-gold/10 p-3 rounded-lg"><Truck size={24} /></div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">Nationwide Delivery</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Safe Transit Logistics</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-left">
            <div className="text-luxury-gold bg-luxury-gold/10 p-3 rounded-lg"><ShieldCheck size={24} /></div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">Verified Checklist</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Multi-Point Inspections</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-left">
            <div className="text-luxury-gold bg-luxury-gold/10 p-3 rounded-lg"><Headphones size={24} /></div>
            <div>
              <h3 className="text-sm font-bold text-on-surface">Elite Concierge</h3>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1">Dedicated Auto Support</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
