import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db, type Car } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import { CreditCard, ShieldCheck, Truck, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../shared/lib/formatters';

export const Checkout = ({ car, onClose }: { car: Car, onClose: () => void }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'summary' | 'payment' | 'success'>('summary');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      // Create initial order
      await db.saveOrder({
        user_id: user.id,
        car_id: car.id,
        amount: car.price,
        payment_ref: 'MOCK_PAYMENT_' + Date.now()
      });

      // Simulate payment processing
      setTimeout(() => {
        setStep('success');
        setLoading(false);
      }, 2500);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="luxury-form-card" 
      style={{ maxWidth: '800px', width: '100%', padding: '0' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', borderRadius: '1rem' }}>
        {/* Left: Product Info */}
        <div style={{ background: 'var(--bg-glass)', padding: '3rem', borderRight: '1px solid var(--border-glass)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.6rem', letterSpacing: '3px', color: 'var(--accent-gold)' }}>CURATED ACQUISITION</span>
            <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>{car.make} {car.model}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{car.year} • {car.exterior_color}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ color: 'var(--accent-gold)' }}><ShieldCheck size={20} /></div>
              <span style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Authenticated & Certified</span>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ color: 'var(--accent-gold)' }}><Truck size={20} /></div>
              <span style={{ fontSize: '0.8rem', letterSpacing: '1px' }}>Global Premium Logistics</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '4rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Investment Amount</div>
            <div style={{ fontSize: '2rem', fontWeight: 600 }}>{formatPrice(car.price)}</div>
          </div>
        </div>

        {/* Right: Steps */}
        <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column' }}>
          <AnimatePresence mode="wait">
            {step === 'summary' && (
              <motion.div 
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="luxury-font" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Review Details.</h3>
                <div style={{ background: 'var(--bg-glass)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Acquisition Price</span>
                    <span>{formatPrice(car.price)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Logistics Fee</span>
                    <span style={{ color: 'var(--accent-gold)' }}>Complimentary</span>
                  </div>
                  <div style={{ height: '1px', background: 'var(--border-glass)', margin: '1rem 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                    <span>Total</span>
                    <span>{formatPrice(car.price)}</span>
                  </div>
                </div>

                <button 
                  className="btn-gold" 
                  style={{ width: '100%', height: '3.5rem' }}
                  onClick={() => setStep('payment')}
                >
                  PROCEED TO PAYMENT <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h3 className="luxury-font" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Secure Payment.</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem' }}>
                  <div style={{ opacity: 0.5, pointerEvents: 'none' }}>
                    <label className="luxury-label">Secure Transaction Mode</label>
                    <div className="luxury-input" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <CreditCard size={20} /> Secure Stripe Gateway
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                    By proceeding, you authorize the secure acquisition of this model. Your funds will be held in escrow until logistics verification.
                  </p>
                </div>

                <button 
                  className="btn-gold" 
                  style={{ width: '100%', height: '3.5rem' }}
                  disabled={loading}
                  onClick={handleCheckout}
                >
                  {loading ? 'SECURING INVESTMENT...' : 'COMPLETE ACQUISITION'}
                </button>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', margin: 'auto' }}
              >
                <div style={{ margin: '0 auto 2rem', width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'black' }}>
                  <ShieldCheck size={40} />
                </div>
                <h3 className="luxury-font" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Acquired.</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '3rem' }}>
                  Your acquisition request for the {car.year} {car.make} has been successfully registered. Our concierge will contact you within the hour.
                </p>
                <button className="btn-gold" style={{ width: '100%' }} onClick={onClose}>RETURN TO GALLERY</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
