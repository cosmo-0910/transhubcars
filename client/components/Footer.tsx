import { Facebook, Instagram, Twitter, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer-main" style={{ 
      padding: '6rem 1.5rem 2rem', 
      borderTop: '1px solid var(--border-glass)', 
      background: 'var(--bg-deep)',
      color: 'var(--text-main)'
    }}>
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 4rem;
          max-width: 1200px;
          margin: 0 auto 6rem;
        }
        .footer-about {
          grid-column: span 2;
        }
        .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          border-top: 1px solid var(--border-glass);
          padding-top: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }
        .footer-legal {
          display: flex;
          gap: 2rem;
        }
        
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 3rem;
          }
          .footer-about {
            grid-column: span 2;
          }
        }
        
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: 2.5rem;
          }
          .footer-about {
            grid-column: span 2;
            margin-bottom: 3rem;
          }
          .footer-bottom {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }
          .footer-legal {
            justify-content: center;
            gap: 1.5rem;
          }
        }
      `}</style>

      <div className="footer-grid">
        {/* Column 1: Logo & About */}
        <div className="footer-about">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <img src="/logo.png" alt="Transhub" style={{ height: '32px' }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px' }}>
              TRANSHUB<span style={{ color: 'var(--accent-gold)' }}>.</span>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.9rem', maxWidth: '400px' }}>
            Premium automotive marketplace for verified cars in Nigeria. Quality you can trust, professional service you can rely on.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem' }}>
            <SocialLink icon={<Facebook size={18} />} />
            <SocialLink icon={<Instagram size={18} />} />
            <SocialLink icon={<Twitter size={18} />} />
            <SocialLink icon={<Linkedin size={18} />} />
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="footer-heading">QUICK LINKS</h4>
          <FooterLinks items={['Inventory', 'Preorder', 'Services', 'About Us', 'Contact Us']} />
        </div>

        {/* Column 3: Support */}
        <div>
          <h4 className="footer-heading">SUPPORT</h4>
          <FooterLinks items={['FAQs', 'Delivery Info', 'Payment Options', 'Terms', 'Privacy']} />
        </div>

        {/* Column 4: Contact */}
        <div style={{ gridColumn: 'span 2' }} className="footer-contact-col">
          <h4 className="footer-heading">CONTACT US</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <ContactItem icon={<Phone size={16} />} text="+234 901 234 5678" />
            <ContactItem icon={<Mail size={16} />} text="hello@transhub.com" />
            <ContactItem icon={<MapPin size={16} />} text="Lagos, Nigeria" />
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          © 2026 TRANSHUB by COSMONT. All Rights Reserved.
        </div>
        <div className="footer-legal">
          {['Security', 'Privacy', 'Terms', 'Sitemap'].map(l => (
            <a key={l} href="#" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
      </div>

      <style>{`
        .footer-heading {
          fontSize: 0.75rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: var(--text-main);
          margin-bottom: 2rem;
        }
        @media (max-width: 640px) {
          .footer-contact-col {
            grid-column: span 2 !important;
            margin-top: 1rem;
          }
        }
      `}</style>
    </footer>
  );
};

const SocialLink = ({ icon }: { icon: any }) => (
  <a href="#" style={{ color: 'var(--text-muted)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-gold)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
    {icon}
  </a>
);

const FooterLinks = ({ items }: { items: string[] }) => (
  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    {items.map(l => (
      <li key={l}>
        <a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.2s' }} 
           onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.paddingLeft = '5px'; }} 
           onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.paddingLeft = '0'; }}>
          {l}
        </a>
      </li>
    ))}
  </ul>
);

const ContactItem = ({ icon, text }: { icon: any, text: string }) => (
  <li style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
    <div style={{ color: 'var(--accent-gold)' }}>{icon}</div>
    <span>{text}</span>
  </li>
);
