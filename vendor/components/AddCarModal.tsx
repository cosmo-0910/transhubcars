import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Plus, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { db, type Car } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import { useAlert } from '../../shared/context/AlertContext';
import LuxurySelect from './LuxurySelect';
import LuxuryAutocomplete from './LuxuryAutocomplete';
import ImageUploadField from '../../shared/components/ImageUploadField';

const STANDARD_FEATURES = [
  'Air Conditioning', 'Alloy Wheels', 'AM/FM Radio', 'Android Auto / Apple CarPlay',
  'Anti-Lock Brakes', 'Armrests', 'Blind Spot Monitor', 'CD Player',
  'Cruise Control', 'Cup Holders', 'DVD Player', 'Electric Mirrors',
  'Electric Windows', 'Fog Lights', 'Front Fog Lamps', 'Heated Seats',
  'Keyless Entry / Start', 'Leather Seats / Upholstery', 'LED Headlights',
  'Navigation System', 'Parking Sensors', 'Power Steering', 'Rear Camera',
  'Roof Rack', 'Sunroof / Moonroof', 'Touchscreen', 'Traction Control',
  'USB / AUX Port', 'Xenon Lights',
];

const NIGERIAN_MARKET_TAGS = [
  'Accident Free', 'First Body', 'First Owner', 'Full Option / Fully Loaded',
  'Leather Interior', 'Low Mileage', 'Neatly Used', 'New Shape / Facelift',
  'No Faults', 'Registered', 'Reverse Camera', 'Soundproofed',
];

interface AddCarModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editingCar?: Car | null;
}

export default function AddCarModal({ onClose, onSuccess, editingCar }: AddCarModalProps) {
  const { user, profile } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [primaryImage, setPrimaryImage] = useState<File | string | null>(editingCar?.image_url || null);
  const [galleryImages, setGalleryImages] = useState<(File | string)[]>(editingCar?.gallery_urls || []);
  const [selectedMake, setSelectedMake] = useState<string>(editingCar?.make || '');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(editingCar?.features || []);
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

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
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

      // 1. Upload Primary Image if it's a File
      let primaryUrl = editingCar?.image_url || '';
      if (primaryImage instanceof File) {
        primaryUrl = await db.uploadImage(primaryImage, 'car-images', profile?.business_name || profile?.full_name || 'vendor');
      } else if (typeof primaryImage === 'string') {
        primaryUrl = primaryImage;
      }

      // 2. Upload Gallery Images
      const galleryUrls = await Promise.all(
        galleryImages.map(async (img) => {
          if (img instanceof File) {
            return await db.uploadImage(img, 'car-images', profile?.business_name || profile?.full_name || 'vendor');
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
        condition: formData.get('condition'),
        body_type: formData.get('body_type'),
        state: formData.get('state'),
        powertrain: formData.get('powertrain'),
        registered_car: formData.get('registered_car') === 'true',
        exchange_possible: formData.get('exchange_possible') === 'true',
        second_condition: formData.get('second_condition'),
        features: selectedFeatures,
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
      const msg = err.message === 'Duplicate image prohibited' 
        ? 'Duplicate image prohibited. This file has already been posted.' 
        : (err.message === 'HTTP 400 error' ? 'System rejected the upload. Please verify your connection.' : (err.message || 'Failed to save vehicle protocol'));
      showAlert({ title: 'Save Error', message: msg, buttons: [{ text: 'OK', style: 'destructive' }] });
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
        <button onClick={onClose} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'var(--bg-glass)', border: 'none', color: 'var(--text-main)', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={20} />
        </button>

        <div style={{ marginBottom: '3rem' }}>
          <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{editingCar ? 'Refine Listing' : 'New Vehicle Protocol'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Enter high-precision data for your luxury asset</p>
        </div>

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
              { value: 'Readily Available', label: 'Readily Available' },
              ...(profile?.preorder_status === 'approved' ? [{ value: 'Preorder', label: 'Preorder' }] : [])
            ]}
          />
          <LuxurySelect 
            name="condition" 
            label="Vehicle Condition"
            defaultValue={editingCar?.condition}
            options={[
              { value: 'New', label: 'Brand New' },
              { value: 'Foreign Used', label: 'Foreign Used' },
              { value: 'Nigerian Used', label: 'Locally Used' }
            ]}
          />
          <LuxurySelect 
            name="state" 
            label="Location (State)"
            defaultValue={editingCar?.state}
            options={[
              { value: 'Lagos', label: 'Lagos' },
              { value: 'Abuja', label: 'Abuja' },
              { value: 'Rivers', label: 'Rivers' },
              { value: 'Ogun', label: 'Ogun' },
              { value: 'Oyo', label: 'Oyo' },
              { value: 'Kano', label: 'Kano' },
              // ... more if needed, but keeping it simple for now or using a better list
            ]}
          />
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Body Type</label>
            <input name="body_type" type="text" defaultValue={editingCar?.body_type} className="admin-input" style={{ width: '100%' }} placeholder="e.g. SUV, Sedan" />
          </div>

          {/* Aesthetic Identity */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1.5rem', marginTop: '1rem' }}>AESTHETIC IDENTITY</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="luxury-input-group">
                <label className="luxury-label">Exterior Color</label>
                <input name="exterior_color" type="text" defaultValue={editingCar?.exterior_color} required className="luxury-input" placeholder="e.g. Nero Noctis" />
              </div>
              <div className="luxury-input-group">
                <label className="luxury-label">Interior Color</label>
                <input name="interior_color" type="text" defaultValue={editingCar?.interior_color} required className="luxury-input" placeholder="e.g. Rosso Alala" />
              </div>
            </div>
          </div>

          {/* Technical Dossier */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1.5rem', marginTop: '1rem' }}>TECHNICAL DOSSIER</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="luxury-input-group">
                <label className="luxury-label">Engine Details</label>
                <input name="engine" type="text" defaultValue={editingCar?.engine} className="luxury-input" placeholder="e.g. 4.0L V8 Twin-Turbo" />
              </div>
              <div className="luxury-input-group">
                <label className="luxury-label">VIN Reference</label>
                <input name="vin" type="text" defaultValue={editingCar?.vin} className="luxury-input" placeholder="Enter vehicle VIN" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
              <div className="luxury-input-group">
                <label className="luxury-label">Mileage (KM)</label>
                <input name="mileage" type="number" defaultValue={editingCar?.mileage} required className="luxury-input" placeholder="e.g. 1250" />
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
              <LuxurySelect 
                name="powertrain" 
                label="Powertrain"
                defaultValue={editingCar?.powertrain}
                options={[
                  { value: '2WD', label: '2WD' },
                  { value: '4WD', label: '4WD' },
                  { value: 'AWD', label: 'AWD' },
                  { value: 'RWD', label: 'RWD' }
                ]}
              />
              <LuxurySelect 
                name="registered_car" 
                label="Is Registered?"
                defaultValue={editingCar?.registered_car ? 'true' : 'false'}
                options={[
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' }
                ]}
              />
              <LuxurySelect 
                name="exchange_possible" 
                label="Exchange Possible?"
                defaultValue={editingCar?.exchange_possible ? 'true' : 'false'}
                options={[
                  { value: 'true', label: 'Yes' },
                  { value: 'false', label: 'No' }
                ]}
              />
            </div>
            <div style={{ marginTop: '1.5rem' }}>
              <label className="luxury-label">Secondary Condition Details</label>
              <input name="second_condition" type="text" defaultValue={editingCar?.second_condition} className="luxury-input" placeholder="e.g. Accident Free, First Body" />
            </div>
          </div>

          {/* Vehicle Features & Options */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1.5rem', marginTop: '1rem' }}>VEHICLE FEATURES & OPTIONS</div>
            
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', fontWeight: 600 }}>STANDARD FEATURES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {STANDARD_FEATURES.map(feature => {
                  const active = selectedFeatures.includes(feature);
                  return (
                    <button
                      key={feature}
                      type="button"
                      onClick={() => toggleFeature(feature)}
                      style={{
                        padding: '0.4rem 0.9rem',
                        borderRadius: '2rem',
                        border: active ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                        background: active ? 'var(--accent-gold-soft)' : 'rgba(255,255,255,0.03)',
                        color: active ? 'var(--accent-gold)' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        fontWeight: active ? 700 : 400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      {active && <Check size={11} />}
                      {feature}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', fontWeight: 600 }}>MARKET CONDITION TAGS</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {NIGERIAN_MARKET_TAGS.map(tag => {
                  const active = selectedFeatures.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleFeature(tag)}
                      style={{
                        padding: '0.4rem 0.9rem',
                        borderRadius: '2rem',
                        border: active ? '1px solid #3b82f6' : '1px solid var(--border-glass)',
                        background: active ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                        color: active ? '#60a5fa' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        fontWeight: active ? 700 : 400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s',
                      }}
                    >
                      {active && <Check size={11} />}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
            {selectedFeatures.length > 0 && (
              <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--accent-gold)' }}>
                {selectedFeatures.length} feature{selectedFeatures.length !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>

          {/* Media & Narrative */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1.5rem', marginTop: '1rem' }}>VISUAL ASSETS & NARRATIVE</div>
            
            <label className="luxury-label" style={{ marginBottom: '0.8rem', display: 'block' }}>Primary Visual Asset</label>
            <ImageUploadField 
              value={primaryImage} 
              onChange={setPrimaryImage} 
              placeholder="Select primary vehicle image"
            />

            <div style={{ marginTop: '2rem' }}>
              <label className="luxury-label" style={{ marginBottom: '1rem', display: 'block' }}>Gallery Protocol (Secondary Assets)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' }}>
                {galleryImages.map((img, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <ImageUploadField 
                      value={img} 
                      onChange={(val) => handleGalleryImageChange(index, val)} 
                      placeholder={`Asset #${index + 1}`}
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
                  <span style={{ fontSize: '0.6rem', letterSpacing: '1px', fontWeight: 700 }}>ADD ASSET</span>
                </button>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <label className="luxury-label">Curator's Description</label>
              <textarea name="description" defaultValue={editingCar?.description} className="luxury-textarea" style={{ height: '120px', resize: 'none' }} placeholder="Provide a detailed overview of luxury features, heritage, and condition..." />
            </div>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>ABORT</button>
            <button type="submit" disabled={loading} className="btn-gold" style={{ flex: 2, padding: '1.2rem' }}>
              {loading ? 'SYNCHRONIZING...' : editingCar ? 'SECURE UPDATES' : 'PUBLISH ASSET'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}


