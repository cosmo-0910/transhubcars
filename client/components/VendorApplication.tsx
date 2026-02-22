import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import { Building2, FileText, CheckCircle, Car, Wrench, Zap } from 'lucide-react';
import { useAlert } from '../../shared/context/AlertContext';

const VENDOR_TYPES = [
  {
    value: 'car' as const,
    label: 'Car Seller',
    icon: Car,
    description: 'List and sell new or used vehicles',
    instantApproval: false,
  },
  {
    value: 'parts' as const,
    label: 'Car Parts Dealer',
    icon: Wrench,
    description: 'Supply automotive spare parts',
    instantApproval: true,
  },
];

export const VendorApplication = ({ onClose }: { onClose: () => void }) => {
  const { user, refreshProfile } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [vendorType, setVendorType] = useState<'car' | 'parts'>('car');

  const isPartsVendor = vendorType === 'parts';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const businessName = formData.get('business_name') as string;
    const businessDescription = formData.get('business_description') as string;
    const businessAddress = formData.get('business_address') as string;
    const businessPhone = formData.get('business_phone') as string;

    const updates: any = {
      vendor_type: vendorType,
      business_name: businessName,
      business_details: {
        description: businessDescription,
        address: businessAddress,
        phone: businessPhone,
      },
    };

    // Car parts vendors are auto-approved instantly; car sellers need admin review
    if (isPartsVendor) {
      updates.vendor_status = 'approved';
      updates.role = 'vendor';
    } else {
      updates.vendor_status = 'pending';
    }

    try {
      const { error: dbError } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (dbError) throw dbError;
      await refreshProfile();
      
      if (isPartsVendor) {
        showAlert({
          title: 'Welcome, Parts Dealer! 🔧',
          message: 'Your account has been instantly activated as a Car Parts Dealer. You can now start listing spare parts.',
          buttons: [{ text: 'Start Selling', onPress: onClose }],
        });
      } else {
        showAlert({
          title: 'Application Submitted! 🚀',
          message: "Your vendor application has been sent for review. We'll notify you once it's processed, usually within 24–48 hours.",
          buttons: [{ text: 'Got it', onPress: onClose }],
        });
      }
    } catch (err: any) {
      console.error('Failed to submit application:', err);
      showAlert({ title: 'Application Error', message: err.message || 'Failed to submit application. Please try again.', buttons: [{ text: 'OK', style: 'destructive' }] });
    } finally {
      setLoading(false);
    }
  };

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
        Join our network of trusted automotive vendors. Select what you'll sell to get started.
      </p>

      {/* Vendor Type Cards */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '1rem' }}>WHAT WILL YOU SELL?</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {VENDOR_TYPES.map(type => {
            const active = vendorType === type.value;
            const IconComp = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setVendorType(type.value)}
                style={{
                  padding: '1.25rem',
                  borderRadius: '1rem',
                  border: active ? '2px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                  background: active ? 'rgba(197,160,89,0.08)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: active ? 'rgba(197,160,89,0.15)' : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '0.75rem',
                }}>
                  <IconComp size={20} color={active ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                </div>
                <div style={{ fontWeight: 700, color: active ? 'var(--accent-gold)' : 'white', marginBottom: '0.3rem', fontSize: '0.95rem' }}>
                  {type.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {type.description}
                </div>
                {type.instantApproval && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                    background: 'var(--accent-gold)', borderRadius: '1rem',
                    padding: '0.15rem 0.5rem', marginTop: '0.6rem',
                  }}>
                    <Zap size={10} color="#1a1a1a" fill="#1a1a1a" />
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1a1a1a' }}>INSTANT APPROVAL</span>
                  </div>
                )}
                {active && (
                  <CheckCircle size={18} color="var(--accent-gold)" style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Instant approval notice */}
      {isPartsVendor && (
        <div style={{
          padding: '0.9rem 1.1rem',
          background: 'rgba(197,160,89,0.07)',
          border: '1px solid rgba(197,160,89,0.2)',
          borderRadius: '0.75rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)'
        }}>
          <Zap size={16} color="var(--accent-gold)" />
          <span>
            Car Parts Dealers are <strong style={{ color: 'var(--accent-gold)' }}>instantly approved</strong> — no waiting period. Your account activates the moment you submit.
          </span>
        </div>
      )}

      {/* Form content */}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label className="luxury-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={16} color="var(--accent-gold)" /> Business Name
          </label>
          <input name="business_name" required className="luxury-input" placeholder="e.g. Elite Motors / Lagos Auto Parts Hub" />
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
            placeholder={isPartsVendor ? 'Tell us about your parts inventory and specialization...' : 'Tell us about your vehicle inventory and specialization...'}
            style={{ resize: 'none' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label className="luxury-label">Phone Number</label>
            <input name="business_phone" required className="luxury-input" placeholder="+234 800 000 0000" />
          </div>
          <div>
            <label className="luxury-label">Address</label>
            <input name="business_address" required className="luxury-input" placeholder="City, State" />
          </div>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
          <button type="submit" className="btn-gold" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'SUBMITTING...' : isPartsVendor ? '⚡ ACTIVATE PARTS ACCOUNT' : 'SUBMIT APPLICATION'}
          </button>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
          {isPartsVendor
            ? 'By activating, you confirm you are a legitimate spare parts supplier and agree to our Vendor Terms.'
            : 'Car seller applications are reviewed within 24–48 hours. By applying, you agree to our Vendor Terms.'}
        </p>
      </form>
    </motion.div>
  );
};
