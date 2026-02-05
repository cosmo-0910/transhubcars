import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, X } from 'lucide-react';
import { db } from '../lib/db';

interface Suggestion {
  value: string;
  label: string;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  enableSuggestions?: boolean;
}

export default function SearchAutocomplete({ 
  placeholder = "SEARCH...", 
  onSearch,
  className,
  style,
  autoFocus,
  enableSuggestions = true
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2 && isOpen && enableSuggestions) {
        setLoading(true);
        try {
          const results = await db.getSearchSuggestions(query);
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

  const handleSelect = (value: string) => {
    setQuery(value);
    setIsOpen(false);
    onSearch(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(query);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }} className={className}>
      <div style={{ position: 'relative' }}>
        <Search 
          size={16} 
          style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: 'var(--text-muted)',
            pointerEvents: 'none'
          }} 
        />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            // Also notify search immediately for live filtering if desired
            onSearch(e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoFocus={autoFocus}
          style={{ 
            width: '100%', 
            padding: '0.7rem 2.8rem',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            color: 'white',
            outline: 'none',
            fontSize: 'var(--font-size-small, 0.75rem)',
            letterSpacing: '2px'
          }}
          placeholder={placeholder}
        />
        <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {loading && <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent-gold)' }} />}
          {query && (
            <X 
              size={14} 
              style={{ color: 'var(--text-muted)', cursor: 'pointer' }} 
              onClick={() => {
                setQuery('');
                onSearch('');
              }}
            />
          )}
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
              borderRadius: '0.5rem',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(20px)',
              maxHeight: '250px',
              overflowY: 'auto'
            }}
          >
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSelect(suggestion.value)}
                style={{
                  padding: '0.8rem 1.2rem',
                  cursor: 'pointer',
                  borderBottom: index !== suggestions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  fontSize: '0.8rem',
                  color: 'rgba(255,255,255,0.7)',
                  background: 'transparent',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(197, 160, 89, 0.1)';
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
