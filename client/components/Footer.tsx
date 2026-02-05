// --- Icons ---
const SUVIcon = () => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor">
    <path d="M2,18 L2,14 C2,12 4,11 6,11 L10,11 L15,6 L35,6 L42,12 L46,14 L46,18 L44,18 L44,16 C44,14 42,14 42,16 L42,18 L34,18 L34,16 C34,14 32,14 32,16 L32,18 L16,18 L16,16 C16,14 14,14 14,16 L14,18 L6,18 L6,16 C6,14 4,14 4,16 L4,18 L2,18 Z" />
  </svg>
);
const CoupeIcon = () => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor">
    <path d="M2,18 L2,15 C2,13 4,12 6,12 L14,12 L22,7 L36,7 L44,13 L46,15 L46,18 L2,18 Z" />
  </svg>
);
const SedanIcon = () => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor">
    <path d="M2,18 L2,15 C2,13 4,12 6,12 L12,12 L18,8 L32,8 L40,12 L44,12 L46,15 L46,18 L2,18 Z" />
  </svg>
);
const SportsIcon = () => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor">
    <path d="M2,18 L2,16 L6,16 L14,11 L35,11 L44,15 L46,16 L46,18 L2,18 Z" />
  </svg>
);
const ConvertibleIcon = () => (
  <svg width="48" height="24" viewBox="0 0 48 24" fill="currentColor">
    <path d="M2,18 L2,15 C2,13 4,12 6,12 L38,12 L45,15 L46,16 L46,18 L2,18 Z" />
  </svg>
);

const BodyTypeCard = ({ label, icon, onClick }: { label: string, icon: any, onClick: () => void }) => (
  <div 
    onClick={onClick}
    className="glass glass-hover smooth-transition"
    style={{ 
      minWidth: '130px', 
      textAlign: 'center', 
      cursor: 'pointer', 
      padding: '1.5rem', 
      borderRadius: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    }}
  >
    <div style={{ color: 'var(--text-main)', opacity: 0.6 }}>
      {icon}
    </div>
    <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px', color: 'var(--text-muted)' }}>{label}</div>
  </div>
);

interface FooterProps {
  onDiscoverySelect: (filter: { type: 'body' | 'brand', value: string }) => void;
}

export const Footer = ({ onDiscoverySelect }: FooterProps) => {
  const manufacturers = [
    'TOYOTA', 'HONDA', 'MERCEDES-BENZ', 'LEXUS', 'HYUNDAI', 
    'KIA', 'NISSAN', 'FORD', 'MAZDA', 'MITSUBISHI',
    'VOLKSWAGEN', 'SUZUKI', 'PEUGEOT', 'CHEVROLET', 'CHERY',
    'JAC', 'GAC', 'INNOSON', 'LAND ROVER', 'BMW',
    'ACURA', 'INFINITI', 'JEEP', 'RANGE ROVER', 'VOLVO',
    'AUDI', 'RENAULT', 'GEELY', 'CHANGAN', 'ISUZU'
  ];

  return (
    <footer style={{ padding: '6rem 2rem 4rem', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-deep)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Discovery Paths */}
        <div style={{ marginBottom: '6rem' }}>
          <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '3px', fontWeight: 800, marginBottom: '3rem', textAlign: 'center' }}>BROWSE BY ARCHITECTURE</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
            gap: '1rem', 
            maxWidth: '1000px', 
            margin: '0 auto' 
          }}>
            <BodyTypeCard label="SUVs" icon={<SUVIcon />} onClick={() => onDiscoverySelect({ type: 'body', value: 'SUV' })} />
            <BodyTypeCard label="COUPES" icon={<CoupeIcon />} onClick={() => onDiscoverySelect({ type: 'body', value: 'Coupe' })} />
            <BodyTypeCard label="SALOONS" icon={<SedanIcon />} onClick={() => onDiscoverySelect({ type: 'body', value: 'Sedan' })} />
            <BodyTypeCard label="SPORTS" icon={<SportsIcon />} onClick={() => onDiscoverySelect({ type: 'body', value: 'Sports' })} />
            <BodyTypeCard label="CONVERTIBLES" icon={<ConvertibleIcon />} onClick={() => onDiscoverySelect({ type: 'body', value: 'Convertible' })} />
          </div>
        </div>

        {/* Elite Manufacturers */}
        <div style={{ marginBottom: '6rem' }}>
          <h4 style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '3px', fontWeight: 800, marginBottom: '3rem', textAlign: 'center' }}>POPULAR BRANDS</h4>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 40vw, 180px), 1fr))', 
            gap: '1rem', 
            maxWidth: '1200px', 
            margin: '0 auto' 
          }}>
            {manufacturers.map(brand => (
              <div 
                key={brand} 
                onClick={() => onDiscoverySelect({ type: 'brand', value: brand })}
                className="glass glass-hover smooth-transition"
                style={{ 
                  padding: '1.2rem', 
                  borderRadius: '0.5rem', 
                  textAlign: 'center', 
                  cursor: 'pointer',
                  border: '1px solid var(--border-glass)'
                }}
              >
                <span style={{ 
                  fontSize: '0.65rem', 
                  fontWeight: 800, 
                  letterSpacing: '3px', 
                  color: 'var(--text-main)', 
                  opacity: 0.7 
                }}>
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Bar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <img src="/logo.png" alt="Transhub" style={{ height: '32px', opacity: 0.8 }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-main)' }}>
              TRANSHUB<span style={{ color: 'var(--accent-gold)' }}>.</span>
            </div>
          </div>
          
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: 600 }}>
            © 2026 TRANSHUB by COSMOINT. ALL RIGHTS RESERVE
          </div>
          
          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['PRIVACY', 'TERMS', 'LEGAL', 'CONCIERGE'].map(link => (
              <span key={link} style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {link}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};
