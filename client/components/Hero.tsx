import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Calendar, ShieldCheck, Truck, Headphones, Award, Clock, Heart, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { db } from '../../shared/lib/db';
import type { Car } from '../../shared/lib/db';
import { formatPrice } from '../../shared/lib/formatters';

export const Hero = ({ onBrowse, onPreorder }: { onBrowse: () => void, onPreorder: () => void }) => {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const cars = await db.getCars({ onlyApproved: true });
        const pinnedCars = cars.filter(c => c.is_pinned);
        let selected = pinnedCars.length >= 3 ? pinnedCars : cars;
        setFeaturedCars(selected.slice(0, 5));
      } catch (err) {
        console.error('Failed to load featured cars:', err);
      }
    };
    loadFeatured();
  }, []);

  useEffect(() => {
    if (!isPaused && featuredCars.length > 0) {
      autoplayRef.current = setInterval(() => {
        setScrollIndex(prev => (prev + 1) % featuredCars.length);
      }, 4000); // 4 seconds for a premium feel
    }
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isPaused, featuredCars.length]);

  const c1 = { make: 'Lexus', model: 'RX 350', year: 2023, transmission: 'Automatic', fuel_type: 'Petrol', price: 28500000, status: 'Readily Available', image_url: 'https://images.unsplash.com/photo-1606611013016-960c18baeaac?q=80&w=800&auto=format&fit=crop' } as Partial<Car>;
  const displayCars = featuredCars.length > 0 ? featuredCars : [c1];

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
      x = 100;
      zIndex = 20;
      opacity = 0.4;
      scale = 0.9;
      rotateY = -10;
    } else if (position === displayCars.length - 1 && displayCars.length > 1) {
      x = -100;
      zIndex = 20;
      opacity = 0.4;
      scale = 0.9;
      rotateY = 10;
    } else {
      x = 200;
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
         whileHover={{ scale: position === 0 ? 1.05 : scale, zIndex: position === 0 ? 50 : zIndex }}
         transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
         className="hero-floating-card stacked-card"
         style={{ position: 'absolute' }}
      >
        <div className={`card-badge ${isAvail ? 'green-badge' : 'yellow-badge'}`}><div className="status-dot"/> {isAvail ? 'AVAILABLE' : 'PREORDER'}</div>
        <button className="heart-icon-btn" aria-label="Favorite"><Heart size={18} /></button>
        <div className="card-image-wrap">
          <img src={car.image_url} alt={`${car.make} ${car.model}`} className="card-image"/>
        </div>
        <div className="card-details">
          <h3>{car.make} {car.model}</h3>
          <p>{car.year} • {car.transmission?.split(' ')[0]} • {car.fuel_type}</p>
          <div className="card-bottom">
            <span className="card-price">{car.price ? formatPrice(car.price) : ''}</span>
            <button className="card-view-btn">View Details &gt;</button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <section className="hero-container" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      {/* Background Elements */}
      <div className="hero-cityscape-bg" />
      <div className="hero-golden-arc hero-golden-arc-left" />
      <div className="hero-golden-arc hero-golden-arc-right" />

      <div className="hero-content">
        <div className="hero-left-column">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            <span>PREMIUM AUTOMOTIVE MARKETPLACE</span>
          </div>

          <h1 className="hero-heading luxury-font">
            Buy or Preorder<br />
            Verified Cars<br />
            <span className="hero-heading-highlight">in Nigeria</span>
          </h1>

          <p className="hero-subtext">
            Access inspected vehicles, secure preorders,<br />
            and fast delivery. No guesswork.
          </p>

          <div className="hero-buttons">
            <button className="btn-hero-primary" onClick={onBrowse}>
              <span className="icon-wrapper"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a2 2 0 0 0-1.6-.8H9.3a2 2 0 0 0-1.6.8L5 11l-5.16.86a1 1 0 0 0-.84.99V16h3m12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm-12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/></svg></span>
              Browse Inventory <ArrowRight size={18} />
            </button>
            <button className="btn-hero-secondary" onClick={onPreorder}>
              <Calendar size={18} />
              Preorder a Car
            </button>
          </div>


        <div className="hero-right-column">
          <div className="featured-header">
            <h2>Featured Vehicles</h2>
            <a href="#inventory" onClick={(e) => { e.preventDefault(); onBrowse(); }}>View all <ArrowRight size={14} /></a>
          </div>
          
          <div className="stacked-carousel-stage">
            <AnimatePresence initial={false}>
              {displayCars.map((c, i) => renderCard(c, i))}
            </AnimatePresence>
          </div>

          <div className="carousel-controls">
            <button 
              className="carousel-btn prev" 
              onClick={() => setScrollIndex(prev => (prev - 1 + displayCars.length) % displayCars.length)}
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className="carousel-btn next" 
              onClick={() => setScrollIndex(prev => (prev + 1) % displayCars.length)}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="hero-footer-bar">
        <div className="feature-item">
          <Lock size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>Secure Payments</strong>
            <span>100% protected transactions</span>
          </div>
        </div>
        <div className="feature-item">
          <Truck size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>Nationwide Delivery</strong>
            <span>Fast & reliable delivery</span>
          </div>
        </div>
        <div className="feature-item">
          <ShieldCheck size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>Expert Inspection</strong>
            <span>Multi-point vehicle inspection</span>
          </div>
        </div>
        <div className="feature-item">
          <Headphones size={20} className="feature-icon" />
          <div className="feature-text">
            <strong>24/7 Support</strong>
            <span>We're here to help</span>
          </div>
        </div>
      </div>
    </section>
  );
};
