import { useState } from 'react';
import { db } from '../../shared/lib/db';
import { motion } from 'framer-motion';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    if (type === 'Preorder') {
      await db.savePreorder({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        make: formData.get('make') as string,
        model: formData.get('model') as string || '',
        year: parseInt(formData.get('year') as string) || undefined,
        budget: parseFloat(formData.get('budget') as string) || undefined,
        message: formData.get('message') as string
      });
    } else {
      await db.saveInquiry({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        type: type as 'Inspection' | 'Purchase',
        message: formData.get('message') as string,
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
        <button className="btn-gold" style={{ marginTop: '2.5rem', width: '100%' }} onClick={onClose}>RETURN TO CATALOG</button>
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
      style={{ maxWidth: '650px', width: '100%' }}
    >
      <button onClick={onClose} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>

      <motion.div variants={itemVariants}>
        <h2 className="luxury-font" style={{ marginBottom: '0.5rem', fontSize: '2.5rem', letterSpacing: '-1px' }}>
          {type === 'Preorder' ? 'Priority Sourcing' : 'Acquisition Inquiry'}
        </h2>
        <p style={{ color: 'var(--accent-gold)', fontSize: '0.7rem', letterSpacing: '3px', fontWeight: 600, marginBottom: '3rem' }}>
          {carName ? `FOR ${carName.toUpperCase()}` : 'SPECIFY YOUR REQUIREMENTS'}
        </p>
      </motion.div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <motion.div variants={itemVariants} className="luxury-input-group">
            <label className="luxury-label">Full Name</label>
            <input type="text" name="name" required className="luxury-input" placeholder="Enter your name" />
          </motion.div>

          <motion.div variants={itemVariants} className="luxury-input-group">
            <label className="luxury-label">Email Address</label>
            <input type="email" name="email" required className="luxury-input" placeholder="email@example.com" />
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <motion.div variants={itemVariants} className="luxury-input-group">
            <label className="luxury-label">Phone Number</label>
            <input type="tel" name="phone" className="luxury-input" placeholder="+234 ..." />
          </motion.div>

          {type === 'Preorder' ? (
            <motion.div variants={itemVariants} className="luxury-input-group">
              <label className="luxury-label">Target Budget</label>
              <input type="number" name="budget" className="luxury-input" placeholder="USD" />
            </motion.div>
          ) : (
             <motion.div variants={itemVariants} className="luxury-input-group">
              <label className="luxury-label">Interest Type</label>
              <select name="type" defaultValue={type} className="luxury-select">
                <option value="Inspection">Private Inspection</option>
                <option value="Purchase">Direct Purchase</option>
              </select>
            </motion.div>
          )}
        </div>

        {type === 'Preorder' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <motion.div variants={itemVariants} className="luxury-input-group">
              <label className="luxury-label">Make & Model</label>
              <input type="text" name="make" required className="luxury-input" placeholder="e.g. Porsche 911" />
            </motion.div>
            <motion.div variants={itemVariants} className="luxury-input-group">
              <label className="luxury-label">Year Range</label>
              <input type="text" name="year" className="luxury-input" placeholder="e.g. 2022-2024" />
            </motion.div>
          </div>
        )}

        <motion.div variants={itemVariants} className="luxury-input-group">
          <label className="luxury-label">Additional Message</label>
          <textarea rows={3} name="message" className="luxury-textarea" placeholder="Special requirements, preferred timing, etc." />
        </motion.div>

        <motion.button 
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit" 
          className="btn-gold" 
          style={{ height: '4rem', fontSize: '0.9rem', letterSpacing: '4px', marginTop: '1rem' }}
        >
          CONFIRM REQUEST
        </motion.button>
      </form>
    </motion.div>
  );
};
