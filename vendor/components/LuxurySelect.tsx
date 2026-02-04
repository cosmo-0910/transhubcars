import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface LuxurySelectProps {
  name: string;
  options: Option[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  label?: string;
}

export default function LuxurySelect({ name, options, defaultValue, onChange, label }: LuxurySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(options.find(o => o.value === defaultValue) || options[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: Option) => {
    setSelected(option);
    setIsOpen(false);
    if (onChange) onChange(option.value);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
          {label}
        </label>
      )}
      
      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={selected.value} />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="admin-input"
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          textAlign: 'left',
          background: 'rgba(255, 255, 255, 0.03)',
          border: isOpen ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)',
          boxShadow: isOpen ? '0 0 15px rgba(197, 160, 89, 0.1)' : 'none',
        }}
      >
        <span style={{ color: 'white' }}>{selected.label}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: 'flex', alignItems: 'center', opacity: 0.5 }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '105%',
              left: 0,
              right: 0,
              zIndex: 100,
              background: '#0a0a0a',
              border: '1px solid var(--border-glass)',
              borderRadius: '0.8rem',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    textAlign: 'left',
                    background: selected.value === option.value ? 'rgba(197, 160, 89, 0.1)' : 'transparent',
                    border: 'none',
                    color: selected.value === option.value ? 'var(--accent-gold)' : 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s',
                    display: 'block'
                  }}
                  onMouseEnter={(e) => {
                    if (selected.value !== option.value) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selected.value !== option.value) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
