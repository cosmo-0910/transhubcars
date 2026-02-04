import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, ChevronDown } from 'lucide-react';

interface Suggestion {
  value: string;
  label: string;
}

interface LuxuryAutocompleteProps {
  name: string;
  label: string;
  placeholder: string;
  defaultValue?: string;
  required?: boolean;
  onSelect?: (value: string) => void;
  fetchSuggestions: (query: string) => Promise<Suggestion[]>;
}

export default function LuxuryAutocomplete({ 
  name, 
  label, 
  placeholder, 
  defaultValue, 
  required, 
  onSelect,
  fetchSuggestions 
}: LuxuryAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue || '');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 0 && isOpen) {
        setLoading(true);
        try {
          const results = await fetchSuggestions(query);
          setSuggestions(results);
        } catch (error) {
          console.error('Fetch error:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  // Handle clicks outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        {label}
      </label>
      
      <div style={{ position: 'relative' }}>
        <input
          name={name}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          required={required}
          autoComplete="off"
          className="admin-input"
          style={{ width: '100%', paddingRight: '2.5rem' }}
          placeholder={placeholder}
        />
        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <ChevronDown size={16} />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: '105%',
              left: 0,
              right: 0,
              zIndex: 1000,
              background: '#0a0a0a',
              border: '1px solid var(--border-glass)',
              borderRadius: '0.8rem',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(20px)',
              maxHeight: '200px',
              overflowY: 'auto'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => {
                  setQuery(suggestion.label);
                  setIsOpen(false);
                  if (onSelect) onSelect(suggestion.value);
                }}
                className="smooth-transition"
                style={{
                  padding: '1rem',
                  cursor: 'pointer',
                  borderBottom: index !== suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  fontSize: '0.9rem',
                  color: 'rgba(255,255,255,0.7)',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = 'var(--accent-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                }}
              >
                {suggestion.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
