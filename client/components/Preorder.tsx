import { Inventory } from './Inventory';
import type { Car } from '../../shared/lib/db';

export const Preorder = ({ onInquiry }: { onInquiry: (car: Car) => void }) => {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', padding: '100px 2rem 4rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="luxury-font" style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', marginBottom: '1.5rem' }}>
          Future <span style={{ color: 'var(--accent-gold)' }}>Masterpieces.</span>
        </h1>
        <p style={{ 
          maxWidth: '650px', 
          margin: '0 auto', 
          color: 'var(--text-muted)', 
          fontSize: '1.1rem',
          lineHeight: '1.6',
          letterSpacing: '0.01em'
        }}>
          Secure your place in the elite registry. Explore our curated selection of upcoming acquisitions, available for preorder to our most discerning clients.
        </p>
      </header>

      {/* Reusing the Inventory component with forced Preorder filter and hidden controls */}
      <Inventory 
        onInquiry={onInquiry}
        initialStatus="Preorder"
        hideFilters={true}
        title="Preorder Collection."
      />

      <div style={{ 
        marginTop: '6rem', 
        padding: '3rem', 
        textAlign: 'center', 
        border: '1px solid var(--border-glass)', 
        borderRadius: '2rem',
        background: 'rgba(212, 175, 55, 0.03)'
      }}>
        <h3 className="luxury-font" style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Bespoke Sourcing.</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem' }}>
          Searching for something specific? Our global concierge network can source any luxury vehicle tailored to your precise specifications.
        </p>
        <button className="btn-gold" style={{ padding: '1rem 3rem' }}>CONTACT CONCIERGE</button>
      </div>
    </div>
  );
};
