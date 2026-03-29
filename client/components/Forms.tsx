import { useState, useEffect } from 'react';
import { db } from '../../shared/lib/db';
import { motion } from 'framer-motion';
import { useAuth } from '../../shared/lib/AuthContext';

const containerVariants: any = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6, 
      ease: "easeOut",
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } }
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export const InquiryForm = ({ carId, carName, type, onClose }: { carId?: string, carName?: string, type: 'Inspection' | 'Purchase' | 'Preorder', onClose: () => void }) => {
  const [submitted, setSubmitted] = useState(false);
  const { user, profile } = useAuth();
  
  // Form state for pre-filling and editing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest_type: type === 'Preorder' ? 'Preorder' : 'Purchase',
    message: ''
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.full_name || '',
        email: user?.email || '',
        phone: profile.business_details?.phone || profile.phone || ''
      }));
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'Preorder') {
      const target = e.target as HTMLFormElement;
      const fd = new FormData(target);
      await db.savePreorder({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        make: fd.get('make') as string,
        model: fd.get('model') as string || '',
        year: parseInt(fd.get('year') as string) || undefined,
        budget: parseFloat(fd.get('budget') as string) || undefined,
        message: formData.message
      });
    } else {
      await db.saveInquiry({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: (formData.interest_type === 'Inspection' ? 'Inspection' : 'Purchase'),
        message: formData.message,
        carId,
        carName
      });
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="luxury-form-card" 
        style={{ textAlign: 'center', maxWidth: '500px' }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>✨</div>
        <h2 className="luxury-font" style={{ color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '2rem' }}>Request Received.</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: '1.8' }}>Our concierge team has been notified. Expect a personalized response within the hour.</p>
        <button className="btn-gold" style={{ marginTop: '2.5rem', width: '100%', color: 'var(--text-fixed-white)' }} onClick={onClose}>RETURN TO CATALOG</button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="luxury-form-card" 
      style={{ 
        maxWidth: '650px', 
        width: '100%', 
        background: '#050505', 
        border: '1px solid var(--border-glass)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}
    >
      <button onClick={onClose} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', zIndex: 10 }}>✕</button>

      <motion.div variants={itemVariants}>
        <h2 className="luxury-font" style={{ marginBottom: '0.4rem', fontSize: 'clamp(2rem, 6vw, 3rem)', letterSpacing: '-0.5px', color: '#fff' }}>
          {type === 'Preorder' ? 'Priority Sourcing' : 'Acquisition Inquiry'}
        </h2>
        <p style={{ color: 'var(--accent-gold)', fontSize: '0.65rem', letterSpacing: '2px', fontWeight: 800, marginBottom: 'clamp(2rem, 5vw, 3.5rem)', textTransform: 'uppercase' }}>
          {carName ? `FOR ${carName}` : 'SPECIFY YOUR REQUIREMENTS'}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <motion.div variants={itemVariants} className="luxury-input-group">
            <label className="luxury-label" style={{ color: 'var(--accent-gold)', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.6rem', display: 'block' }}>FULL NAME</label>
            <input 
              type="text" 
              name="name" 
              required 
              className="luxury-input" 
              placeholder="Enter your name" 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.2rem', borderRadius: '0.5rem', width: '100%', color: '#fff' }}
            />
          </motion.div>

          <motion.div variants={itemVariants} className="luxury-input-group">
            <label className="luxury-label" style={{ color: 'var(--accent-gold)', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.6rem', display: 'block' }}>EMAIL ADDRESS</label>
            <input 
              type="email" 
              name="email" 
              required 
              className="luxury-input" 
              placeholder="email@example.com" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.2rem', borderRadius: '0.5rem', width: '100%', color: '#fff' }}
            />
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <motion.div variants={itemVariants} className="luxury-input-group">
            <label className="luxury-label" style={{ color: 'var(--accent-gold)', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.6rem', display: 'block' }}>PHONE NUMBER</label>
            <input 
              type="tel" 
              name="phone" 
              className="luxury-input" 
              placeholder="+234 ..." 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.2rem', borderRadius: '0.5rem', width: '100%', color: '#fff' }}
            />
          </motion.div>

          {type === 'Preorder' ? (
            <motion.div variants={itemVariants} className="luxury-input-group">
              <label className="luxury-label" style={{ color: 'var(--accent-gold)', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.6rem', display: 'block' }}>TARGET BUDGET</label>
              <input 
                type="number" 
                name="budget" 
                className="luxury-input" 
                placeholder="USD" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.2rem', borderRadius: '0.5rem', width: '100%', color: '#fff' }}
              />
            </motion.div>
          ) : (
             <motion.div variants={itemVariants} className="luxury-input-group">
              <label className="luxury-label" style={{ color: 'var(--accent-gold)', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.6rem', display: 'block' }}>INTEREST TYPE</label>
              <select 
                name="type" 
                value={formData.interest_type} 
                onChange={(e) => setFormData({...formData, interest_type: e.target.value as any})}
                className="luxury-select"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.2rem', borderRadius: '0.5rem', width: '100%', color: '#fff', appearance: 'none' }}
              >
                <option value="Inspection">Private Inspection</option>
                <option value="Purchase">Direct Purchase</option>
              </select>
            </motion.div>
          )}
        </div>

        {type === 'Preorder' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <motion.div variants={itemVariants} className="luxury-input-group">
              <label className="luxury-label" style={{ color: 'var(--accent-gold)', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.6rem', display: 'block' }}>MAKE & MODEL</label>
              <input 
                type="text" 
                name="make" 
                required 
                className="luxury-input" 
                placeholder="e.g. Porsche 911" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.2rem', borderRadius: '0.5rem', width: '100%', color: '#fff' }}
              />
            </motion.div>
            <motion.div variants={itemVariants} className="luxury-input-group">
              <label className="luxury-label" style={{ color: 'var(--accent-gold)', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.6rem', display: 'block' }}>YEAR RANGE</label>
              <input 
                type="text" 
                name="year" 
                className="luxury-input" 
                placeholder="e.g. 2022-2024" 
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.2rem', borderRadius: '0.5rem', width: '100%', color: '#fff' }}
              />
            </motion.div>
          </div>
        )}

        <motion.div variants={itemVariants} className="luxury-input-group">
          <label className="luxury-label" style={{ color: 'var(--accent-gold)', fontSize: '0.6rem', fontWeight: 800, letterSpacing: '1.5px', marginBottom: '0.6rem', display: 'block' }}>ADDITIONAL MESSAGE</label>
          <textarea 
            rows={3} 
            name="message" 
            className="luxury-textarea" 
            placeholder="Provide any specific requirements, timing, or heritage concerns..." 
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '1.2rem', borderRadius: '0.5rem', width: '100%', color: '#fff', resize: 'none' }}
          />
        </motion.div>

        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          className="btn-gold" 
          style={{ height: '4.5rem', fontSize: '0.9rem', letterSpacing: '4px', marginTop: '1rem', color: 'var(--text-fixed-white)', fontWeight: 800 }}
        >
          CONFIRM REQUEST
        </motion.button>
      </form>
    </motion.div>
  );
};
