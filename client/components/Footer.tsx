import { Facebook, Instagram, Twitter, Linkedin, Mail } from 'lucide-react';


export const Footer = () => {
  return (
    <footer style={{ padding: '6rem 2rem 2rem', borderTop: '1px solid var(--border-glass)', background: 'var(--bg-deep)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '6rem' }}>
          {/* Column 1: Logo & About */}
          <div style={{ gridColumn: 'span 2' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
               <img src="/logo.png" alt="Transhub" style={{ height: '32px' }} />
               <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-main)' }}>
                 TRANSHUB<span style={{ color: 'var(--accent-gold)' }}>.</span>
               </div>
             </div>
             <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, fontSize: '0.9rem', maxWidth: '340px' }}>
               Premium automotive marketplace for verified cars. Quality you can trust, service you can rely on.
             </p>
             <div style={{ display: 'flex', gap: '1.5rem', marginTop: '2.5rem' }}>
                <a href="#" style={{ color: 'var(--text-muted)' }}><Facebook size={18} /></a>
                <a href="#" style={{ color: 'var(--text-muted)' }}><Instagram size={18} /></a>
                <a href="#" style={{ color: 'var(--text-muted)' }}><Twitter size={18} /></a>
                <a href="#" style={{ color: 'var(--text-muted)' }}><Linkedin size={18} /></a>
             </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
             <h4 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-main)', marginBottom: '2rem' }}>QUICK LINKS</h4>
             <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {['Inventory', 'Preorder', 'Services', 'About Us', 'Contact Us'].map(l => (
                 <li key={l}><a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a></li>
               ))}
             </ul>
          </div>

          {/* Column 3: Support */}
          <div>
             <h4 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-main)', marginBottom: '2rem' }}>SUPPORT</h4>
             <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {['FAQs', 'Delivery Info', 'Payment Options', 'Terms of Service', 'Privacy Policy'].map(l => (
                 <li key={l}><a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a></li>
               ))}
             </ul>
          </div>

          {/* Column 4: Company */}
          <div>
             <h4 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-main)', marginBottom: '2rem' }}>COMPANY</h4>
             <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {['About Transhub', 'Our Process', 'Careers', 'Blog', 'News'].map(l => (
                 <li key={l}><a href="#" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a></li>
               ))}
             </ul>
          </div>

          {/* Column 5: Contact */}
          <div>
             <h4 style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--text-main)', marginBottom: '2rem' }}>CONTACT US</h4>
             <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                   <div style={{ color: 'var(--accent-gold)' }}><Mail size={16} /></div>
                   <span>+234 901 234 5678</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                   <div style={{ color: 'var(--accent-gold)' }}><Mail size={16} /></div>
                   <span>hello@transhub.com</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                   <div style={{ color: 'var(--accent-gold)' }}><Mail size={16} /></div>
                   <span>Lagos, Nigeria</span>
                </li>
             </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            © 2026 TRANSHUB by COSMONT. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: '2rem' }}>
             {['Privacy', 'Terms', 'Legal', 'Concierge'].map(l => (
               <a key={l} href="#" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{l}</a>
             ))}
          </div>
        </div>

      </div>
    </footer>
  );
};
