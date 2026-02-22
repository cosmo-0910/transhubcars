import { motion } from 'framer-motion';
import { X, Package } from 'lucide-react';
import { useState, useRef } from 'react';
import { db, type SparePart } from '../../shared/lib/db';
import { useAuth } from '../../shared/lib/AuthContext';
import { useAlert } from '../../shared/context/AlertContext';
import LuxurySelect from './LuxurySelect';
import LuxuryAutocomplete from './LuxuryAutocomplete';
import ImageUploadField from '../../shared/components/ImageUploadField';

const PART_CATEGORIES = [
  'Engine & Drivetrain',
  'Interiors',
  'Exteriors',
  'Suspension & Brakes',
  'Electrical & Electronics',
  'Wheels & Tires',
  'Body Parts',
  'Filters & Maintenance',
  'Lighting',
  'Other',
];

interface AddPartModalProps {
  onClose: () => void;
  onSuccess: () => void;
  editingPart?: SparePart | null;
}

export default function AddPartModal({ onClose, onSuccess, editingPart }: AddPartModalProps) {
  const { user, profile } = useAuth();
  const { showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [primaryImage, setPrimaryImage] = useState<File | string | null>(editingPart?.image_url || null);
  const [selectedMake, setSelectedMake] = useState<string>(editingPart?.vehicle_make || '');
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const form = e.currentTarget;

    try {
      setLoading(true);

      // Upload Image if it's a File
      let imageUrl = editingPart?.image_url || '';
      if (primaryImage instanceof File) {
        imageUrl = await db.uploadImage(primaryImage, 'car-images', profile?.business_name || profile?.full_name || 'vendor');
      } else if (typeof primaryImage === 'string') {
        imageUrl = primaryImage;
      }

      const formData = new FormData(form);
      const partData: any = {
        name: formData.get('name'),
        category: formData.get('category'),
        vehicle_make: formData.get('vehicle_make'),
        vehicle_model: formData.get('vehicle_model'),
        vehicle_year: parseInt(formData.get('vehicle_year') as string),
        price: parseFloat(formData.get('price') as string),
        condition: formData.get('condition'),
        stock_quantity: parseInt(formData.get('stock_quantity') as string),
        description: formData.get('description'),
        status: formData.get('status'),
        image_url: imageUrl || 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&q=80',
        vendor_id: user.id
      };

      if (editingPart) {
        await db.updateSparePart(editingPart.id, partData);
      } else {
        await db.saveSparePart(partData);
      }
      onSuccess();
    } catch (err: any) {
      console.error('Save error:', err);
      showAlert({ 
        title: 'Save Error', 
        message: err.message || 'Failed to save part to the inventory.', 
        buttons: [{ text: 'OK', style: 'destructive' }] 
      });
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Package size={24} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)' }}>PARTS PROTOCOL</span>
          </div>
          <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{editingPart ? 'Refine Part' : 'Catalog New Item'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Precision cataloging for luxury spare parts</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Core Info */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
              <div className="luxury-input-group">
                <label className="luxury-label">Part Name</label>
                <input name="name" type="text" defaultValue={editingPart?.name} required className="luxury-input" placeholder="e.g. Aventador Carbon Fiber Spoiler" />
              </div>
              <LuxurySelect 
                name="category" 
                label="Category"
                defaultValue={editingPart?.category}
                options={PART_CATEGORIES.map(c => ({ value: c, label: c }))}
              />
            </div>
          </div>

          {/* Compatibility */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1rem' }}>VEHICLE COMPATIBILITY</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <LuxuryAutocomplete
                name="vehicle_make"
                label="Make"
                placeholder="e.g. Lamborghini"
                defaultValue={editingPart?.vehicle_make}
                required
                fetchSuggestions={fetchMakes}
                onSelect={setSelectedMake}
              />
              <LuxuryAutocomplete
                name="vehicle_model"
                label="Model"
                placeholder={selectedMake ? `Models for ${selectedMake}...` : "Select a make first"}
                defaultValue={editingPart?.vehicle_model}
                required
                fetchSuggestions={fetchModels}
              />
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Base Year</label>
                <input name="vehicle_year" type="number" defaultValue={editingPart?.vehicle_year} required className="admin-input" style={{ width: '100%' }} placeholder="2024" />
              </div>
            </div>
          </div>

          {/* Logistics & Value */}
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Price (₦)</label>
            <input name="price" type="number" defaultValue={editingPart?.price} required className="admin-input" style={{ width: '100%' }} placeholder="450000" />
          </div>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Stock Quantity</label>
            <input name="stock_quantity" type="number" defaultValue={editingPart?.stock_quantity} required className="admin-input" style={{ width: '100%' }} placeholder="1" />
          </div>

          <LuxurySelect 
            name="condition" 
            label="Condition"
            defaultValue={editingPart?.condition}
            options={[
              { value: 'New', label: 'New' },
              { value: 'Used', label: 'Used' },
              { value: 'Refurbished', label: 'Refurbished' }
            ]}
          />
          <LuxurySelect 
            name="status" 
            label="Stock Status"
            defaultValue={editingPart?.status}
            options={[
              { value: 'active', label: 'Active (Available)' },
              { value: 'out_of_stock', label: 'Out of Stock' },
              { value: 'discontinued', label: 'Discontinued' }
            ]}
          />

          {/* Media & Narrative */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1.5rem', marginTop: '1rem' }}>VISUAL ASSET & SPECIFICATIONS</div>
            
            <label className="luxury-label" style={{ marginBottom: '0.8rem', display: 'block' }}>Primary Image</label>
            <ImageUploadField 
              value={primaryImage} 
              onChange={setPrimaryImage} 
              placeholder="Select component image"
            />

            <div style={{ marginTop: '2rem' }}>
              <label className="luxury-label">Description & Fitment Notes</label>
              <textarea name="description" defaultValue={editingPart?.description} className="luxury-textarea" style={{ height: '120px', resize: 'none' }} placeholder="Provide detailed specifications, OEM numbers, and fitment technicalities..." />
            </div>
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', border: '1px solid var(--border-glass)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600 }}>ABORT</button>
            <button type="submit" disabled={loading} className="btn-gold" style={{ flex: 2, padding: '1.2rem' }}>
              {loading ? 'SYNCHRONIZING...' : editingPart ? 'SECURE UPDATES' : 'PUBLISH COMPONENT'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
