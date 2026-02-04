import { useState } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import { Building2, FileText, CheckCircle, AlertCircle } from 'lucide-react';

export const VendorApplication = ({ onClose }: { onClose: () => void }) => {
  const { user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    const businessName = formData.get('business_name') as string;
    const businessDescription = formData.get('business_description') as string;
    const businessAddress = formData.get('business_address') as string;
    const businessPhone = formData.get('business_phone') as string;

    const businessDetails = {
      description: businessDescription,
      address: businessAddress,
      phone: businessPhone
    };

    try {
      await db.updateProfile(user.id, {
        vendor_status: 'pending',
        business_name: businessName,
        business_details: businessDetails
      });
      await refreshProfile();
      setSuccess(true);
    } catch (err) {
      console.error('Failed to submit application:', err);
      const errorMessage = (err as any)?.message || (err as any)?.error_description || 'Failed to submit application. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="luxury-form-card"
        style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '50%' }}>
            <CheckCircle size={48} color="#4ade80" />
          </div>
        </div>
        <h3 className="luxury-font" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Application Submitted</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Your application to become a certified vendor has been received. Our team will review your business details and contact you shortly.
        </p>
        <button onClick={onClose} className="btn-gold" style={{ width: '100%' }}>RETURN TO PROFILE</button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="luxury-form-card"
      style={{ maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 className="luxury-font" style={{ fontSize: '2rem' }}>Vendor Application</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>✕</button>
      </div>

      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Join our exclusive network of certified automotive dealers. Please provide your business details below for verification.
      </p>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <AlertCircle size={18} color="#ef4444" />
          <span style={{ color: '#ef4444', fontSize: '0.9rem' }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label className="luxury-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={16} color="var(--accent-gold)" /> Business Name
          </label>
          <input name="business_name" required className="luxury-input" placeholder="e.g. Elite Motors LLC" />
        </div>

        <div>
          <label className="luxury-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={16} color="var(--accent-gold)" /> Business Description
          </label>
          <textarea 
            name="business_description" 
            required 
            className="luxury-input" 
            rows={4} 
            placeholder="Tell us about your inventory and specialization..." 
            style={{ resize: 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="luxury-label">Phone Number</label>
            <input name="business_phone" required className="luxury-input" placeholder="+1 (555) 000-0000" />
          </div>
          <div>
            <label className="luxury-label">Address</label>
            <input name="business_address" required className="luxury-input" placeholder="City, Country" />
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button type="submit" className="btn-gold" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
