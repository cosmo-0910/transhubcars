import { motion } from 'framer-motion';
import { X, Upload, Video, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { db } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import ImageUploadField from '../../shared/components/ImageUploadField';

interface UpgradeToPreorderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function UpgradeToPreorderModal({ onClose, onSuccess }: UpgradeToPreorderModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!videoFile || !imageFile) {
      setError('Both video and image evidence are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload Video (simulated as image bucket for now, ideally separate bucket)
      const videoUrl = await db.uploadImage(videoFile); // Reusing uploadImage for simplicity, rename bucket if needed
      
      // Upload Image
      let imageUrl = '';
      if (imageFile instanceof File) {
        imageUrl = await db.uploadImage(imageFile);
      } else {
        imageUrl = imageFile;
      }

      await db.submitPreorderApplication(user.id, videoUrl, imageUrl);
      onSuccess();
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', padding: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass"
        style={{ width: '100%', maxWidth: '600px', padding: '3rem', borderRadius: '2rem', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={20} />
        </button>

        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Elite <span style={{ color: 'var(--accent-gold)' }}>Verification.</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '0.5px' }}>Unlock preorder privileges by verifying your dealership credentials.</p>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '0.8rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div>
            <label className="luxury-label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Video size={16} /> DEALERSHIP WALKTHROUGH
            </label>
            <div style={{ 
              padding: '2.5rem', 
              border: '1px dashed var(--border-glass)', 
              borderRadius: '1.2rem', 
              textAlign: 'center', 
              background: 'rgba(212, 175, 55, 0.02)',
              transition: '0.3s'
            }} className="glass-hover">
              {videoFile ? (
                <div style={{ color: '#4ade80', fontWeight: 600 }}>{videoFile.name}</div>
              ) : (
                <>
                  <input 
                    type="file" 
                    accept="video/*" 
                    onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                    style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px' }}
                    id="video-upload"
                  />
                  <label htmlFor="video-upload" style={{ cursor: 'pointer', color: 'var(--accent-gold)' }}>Upload Video File</label>
                </>
              )}
            </div>
          </div>

          <div>
            <label className="luxury-label" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <ImageIcon size={16} /> STOREFRONT PROTOCOL
            </label>
            <ImageUploadField 
              value={imageFile} 
              onChange={setImageFile} 
              placeholder="Select storefront image"
            />
          </div>

          <div style={{ padding: '1rem', background: 'rgba(234, 179, 8, 0.1)', borderRadius: '1rem', fontSize: '0.8rem', color: '#eab308' }}>
            <strong>Note:</strong> Inspection will be scheduled by TransHub upon successful submission.
          </div>

          <button type="submit" disabled={loading} className="btn-gold" style={{ padding: '1.2rem', width: '100%' }}>
            {loading ? 'UPLOADING EVIDENCE...' : 'SUBMIT FOR INSPECTION'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
