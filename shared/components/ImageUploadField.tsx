import { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';

interface ImageUploadFieldProps {
  value: File | string | null;
  onChange: (val: File | string) => void;
  placeholder: string;
}

export default function ImageUploadField({ value, onChange, placeholder }: ImageUploadFieldProps) {
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
