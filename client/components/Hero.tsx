import { motion } from 'framer-motion';
import { ArrowRight, Calendar, ShieldCheck, Truck, Headphones, Award, Clock, Heart, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '../../shared/lib/db';
import type { Car } from '../../shared/lib/db';
import { formatPrice } from '../../shared/lib/formatters';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Hero = ({ onBrowse, onPreorder }: { onBrowse: () => void, onPreorder: () => void }) => {
  const [featuredCars, setFeaturedCars] = useState<Car[]>([]);
  const [scrollIndex, setScrollIndex] = useState(0);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const cars = await db.getCars({ onlyApproved: true });
        const pinnedCars = cars.filter(c => c.is_pinned);
        let selected = pinnedCars.length >= 3 ? pinnedCars : cars;
        setFeaturedCars(selected.slice(0, 3));
      } catch (err) {
        console.error('Failed to load featured cars:', err);
      }
    };
    loadFeatured();
  }, []);

  const c1 = featuredCars[0] || ({ make: 'Lexus', model: 'RX 350', year: 2023, transmission: 'Automatic', fuel_type: 'Petrol', price: 28500000, status: 'Readily Available', image_url: 'https://images.unsplash.com/photo-1606611013016-960c18baeaac?q=80&w=800&auto=format&fit=crop' } as Partial<Car>);
  const c2 = featuredCars[1] || ({ make: 'Mercedes-Benz', model: 'GLE 450', year: 2024, transmission: 'Automatic', fuel_type: 'Petrol', price: 45000000, status: 'Preorder', image_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=600&auto=format&fit=crop' } as Partial<Car>);
  const c3 = featuredCars[2] || ({ make: 'Toyota', model: 'Land Cruiser Prado', year: 2023, transmission: 'Automatic', fuel_type: 'Diesel', price: 65000000, status: 'Readily Available', image_url: 'https://images.unsplash.com/photo-1579308365518-e37ad17fc2fc?q=80&w=600&auto=format&fit=crop' } as Partial<Car>);

  const renderCard = (car: Partial<Car>, cardClassNum: number, delayOffset: number) => {
    const isAvail = car.status === 'Readily Available';
    return (
      <motion.div 
         key={`card-${cardClassNum}-${car.id || car.model}`}
         initial={{ opacity: 0, x: 50 }}
         animate={{ opacity: 1, x: 0 }}
         whileHover={{ y: -10, scale: 1.02 }}
         transition={{ duration: 0.8, delay: delayOffset, ease: [0.16, 1, 0.3, 1] }}
         className={`hero-floating-card card-${cardClassNum}`}>
        <div className={`card-badge ${isAvail ? 'green-badge' : 'yellow-badge'}`}><div className="status-dot"/> {isAvail ? 'AVAILABLE' : 'PREORDER'}</div>
        <button className="heart-icon-btn" aria-label="Favorite"><Heart size={cardClassNum === 1 ? 18 : 16} /></button>
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
    <section className="hero-container">
      {/* Background Elements */}
      <div className="hero-cityscape-bg" />
      <div className="hero-golden-arc hero-golden-arc-left" />
      <div className="hero-golden-arc hero-golden-arc-right" />

      <div className="hero-content">
        {/* Left Side: Typography & Calls to Action */}
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

          {/* Trust Indicators */}
          <div className="hero-trust-indicators">
            <div className="trust-item">
              <div className="trust-icon-wrapper"><ShieldCheck size={20} /></div>
              <div className="trust-text">
                <span className="trust-num">200+</span>
                <span className="trust-desc">Happy Buyers</span>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrapper"><Award size={20} /></div>
              <div className="trust-text">
                <span className="trust-num">100%</span>
                <span className="trust-desc">Verified Cars</span>
              </div>
            </div>
            <div className="trust-item">
              <div className="trust-icon-wrapper"><Clock size={20} /></div>
              <div className="trust-text">
                <span className="trust-num">48hr</span>
                <span className="trust-desc">Inspection Process</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-right-column group">
          <div className="featured-header">
            <h2>Featured Vehicles</h2>
            <a href="#inventory" onClick={(e) => { e.preventDefault(); onBrowse(); }}>View all <ArrowRight size={14} /></a>
          </div>
          <motion.div 
            className="hero-cards-wrapper"
            drag="x"
            dragConstraints={{ left: -352 * (featuredCars.length > 0 ? featuredCars.length - 1 : 2), right: 0 }}
            animate={{ x: -scrollIndex * 352 }}
            style={{ width: 'max-content' }}
          >
            {featuredCars.length > 0 ? (
              featuredCars.map((c, i) => renderCard(c, i + 1, i * 0.1))
            ) : (
              <>
                {renderCard(c1, 1, 0)}
                {renderCard(c2, 2, 0.1)}
                {renderCard(c3, 3, 0.2)}
              </>
            )}
          </motion.div>
          
          <div className="carousel-controls">
            <button 
              className="carousel-btn prev" 
              onClick={() => setScrollIndex(prev => Math.max(0, prev - 1))}
              disabled={scrollIndex === 0}
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className="carousel-btn next" 
              onClick={() => setScrollIndex(prev => Math.min(featuredCars.length > 0 ? featuredCars.length - 1 : 2, prev + 1))}
              disabled={scrollIndex === (featuredCars.length > 0 ? featuredCars.length - 1 : 2)}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Feature Bar */}
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
