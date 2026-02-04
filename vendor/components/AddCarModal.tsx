import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { db, type Car } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import LuxurySelect from './LuxurySelect';
import LuxuryAutocomplete from './LuxuryAutocomplete';

interface AddCarModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editingCar?: Car | null;
}

export default function AddCarModal({ onClose, onSuccess, editingCar }: AddCarModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [primaryImage, setPrimaryImage] = useState<File | string | null>(editingCar?.image_url || null);
  const [galleryImages, setGalleryImages] = useState<(File | string)[]>(editingCar?.gallery_urls || []);
  const [selectedMake, setSelectedMake] = useState<string>(editingCar?.make || '');
  const cachedMakes = useRef<any[] | null>(null);

  const fetchMakes = async (query: string) => {
    try {
      if (!cachedMakes.current) {
        const response = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json');
        const data = await response.json();
        cachedMakes.current = data.Results;
      }
      return cachedMakes.current!
        .filter((item: any) => item.MakeName.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
        .map((item: any) => ({ value: item.MakeName, label: item.MakeName }));
    } catch (error) {
      console.error('Error fetching makes:', error);
      return [];
    }
  };

  const fetchModels = async (query: string) => {
    if (!selectedMake) return [];
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${selectedMake}?format=json`);
      const data = await response.json();
      return data.Results
        .filter((item: any) => item.Model_Name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
        .map((item: any) => ({ value: item.Model_Name, label: item.Model_Name }));
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  };

  const handleAddGalleryImage = () => {
    setGalleryImages([...galleryImages, '']);
  };

  const handleGalleryImageChange = (index: number, value: File | string) => {
    const updated = [...galleryImages];
    updated[index] = value;
    setGalleryImages(updated);
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const form = e.currentTarget;

    try {
      setLoading(true);
      setError(null);

      // 1. Upload Primary Image if it's a File
      let primaryUrl = editingCar?.image_url || '';
      if (primaryImage instanceof File) {
        primaryUrl = await db.uploadImage(primaryImage);
      } else if (typeof primaryImage === 'string') {
        primaryUrl = primaryImage;
      }

      // 2. Upload Gallery Images
      const galleryUrls = await Promise.all(
        galleryImages.map(async (img) => {
          if (img instanceof File) {
            return await db.uploadImage(img);
          }
          return img;
        })
      );

      const formData = new FormData(form);
      const carData: any = {
        make: formData.get('make'),
        model: formData.get('model'),
        year: parseInt(formData.get('year') as string),
        price: parseFloat(formData.get('price') as string),
        status: formData.get('status'),
        mileage: parseInt(formData.get('mileage') as string),
        transmission: formData.get('transmission'),
        fuel_type: formData.get('fuel_type'),
        description: formData.get('description'),
        image_url: primaryUrl || 'https://images.unsplash.com/photo-1544636331-e26859203199?auto=format&fit=crop&q=80',
        gallery_urls: galleryUrls.filter(url => typeof url === 'string' && url.trim() !== ''),
        vendor_id: user.id,
        approval_status: 'pending'
      };

      if (editingCar) {
        await db.updateCar(editingCar.id, carData);
      } else {
        await db.saveCar(carData);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to save vehicle protocol');
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
        style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '3rem', borderRadius: '2rem', position: 'relative' }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={20} />
        </button>

        <div style={{ marginBottom: '3rem' }}>
          <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{editingCar ? 'Refine Listing' : 'New Vehicle Protocol'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Enter high-precision data for your luxury asset</p>
        </div>

        {error && (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '0.8rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Main Info */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1rem' }}>CORE SPECIFICATIONS</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <LuxuryAutocomplete
                name="make"
                label="Make"
                placeholder="e.g. Rolls-Royce"
                defaultValue={editingCar?.make}
                required
                fetchSuggestions={fetchMakes}
                onSelect={setSelectedMake}
              />
              <LuxuryAutocomplete
                name="model"
                label="Model"
                placeholder={selectedMake ? `Models for ${selectedMake}...` : "Select a make first"}
                defaultValue={editingCar?.model}
                required
                fetchSuggestions={fetchModels}
              />
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Year</label>
                <input name="year" type="number" defaultValue={editingCar?.year} required className="admin-input" style={{ width: '100%' }} placeholder="2024" />
              </div>
            </div>
          </div>

          {/* Value & Status */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Listing Price (₦)</label>
            <input name="price" type="number" defaultValue={editingCar?.price} required className="admin-input" style={{ width: '100%' }} placeholder="450000" />
          </div>
          <LuxurySelect 
            name="status" 
            label="Inventory Status"
            defaultValue={editingCar?.status}
            options={[
              { value: 'Ready to Ship', label: 'Ready to Ship' },
              { value: 'Preorder', label: 'Preorder' }
            ]}
          />

          {/* Technical Specs */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1rem', marginTop: '1rem' }}>TECHNICAL DOSSIER</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Mileage</label>
                <input name="mileage" type="number" defaultValue={editingCar?.mileage} required className="admin-input" style={{ width: '100%' }} placeholder="650" />
              </div>
              <LuxurySelect 
                name="transmission" 
                label="Transmission"
                defaultValue={editingCar?.transmission}
                options={[
                  { value: 'Automatic', label: 'Automatic' },
                  { value: 'Manual', label: 'Manual' },
                  { value: 'Semi-Auto', label: 'Semi-Auto' }
                ]}
              />
              <LuxurySelect 
                name="fuel_type" 
                label="Fuel Type"
                defaultValue={editingCar?.fuel_type}
                options={[
                  { value: 'Petrol', label: 'Petrol' },
                  { value: 'Diesel', label: 'Diesel' },
                  { value: 'Hybrid', label: 'Hybrid' },
                  { value: 'Electric', label: 'Electric' }
                ]}
              />
            </div>
          </div>

          {/* Media */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Primary Visual Asset</label>
            <ImageUploadField 
              value={primaryImage} 
              onChange={setPrimaryImage} 
              placeholder="Select primary vehicle image"
            />

            <div style={{ marginTop: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Gallery Protocol (Secondary Assets)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {galleryImages.map((img, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <ImageUploadField 
                      value={img} 
                      onChange={(val) => handleGalleryImageChange(index, val)} 
                      placeholder={`Gallery asset #${index + 1}`}
                    />
                    <button 
                      type="button"
                      onClick={() => handleRemoveGalleryImage(index)}
                      style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', background: '#ef4444', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={handleAddGalleryImage}
                  style={{ height: '120px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-glass)', color: 'var(--text-muted)', borderRadius: '1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: '0.3s' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                >
                  <Plus size={24} />
                  <span style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>ADD VISUAL</span>
                </button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Vehicle Description</label>
            <textarea name="description" defaultValue={editingCar?.description} className="admin-input" style={{ width: '100%', height: '120px', resize: 'none', padding: '1rem' }} placeholder="Detailed overview of luxury features and condition..." />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', border: '1px solid var(--border-glass)', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600 }}>ABORT</button>
            <button type="submit" disabled={loading} className="btn-gold" style={{ flex: 2, padding: '1.2rem' }}>
              {loading ? 'SYNCHRONIZING...' : editingCar ? 'SECURE UPDATES' : 'PUBLISH ASSET'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function ImageUploadField({ value, onChange, placeholder }: { value: File | string | null, onChange: (val: File | string) => void, placeholder: string }) {
  const [preview, setPreview] = useState<string | null>(typeof value === 'string' ? value : null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === 'string') {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  return (
    <div style={{ width: '100%' }}>
      <div 
        onClick={() => fileInputRef.current?.click()}
        style={{ 
          height: '120px', 
          background: 'rgba(255,255,255,0.03)', 
          border: '1px solid var(--border-glass)', 
          borderRadius: '1rem', 
          cursor: 'pointer', 
          position: 'relative', 
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: '0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
      >
        {preview ? (
          <>
            <img src={preview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Preview" />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} className="hover-overlay">
              <Upload size={24} color="white" />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <Upload size={24} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>{placeholder}</div>
          </div>
        )}
      </div>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onChange(file);
        }}
      />
      
      <style>{`
        div:hover .hover-overlay { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

