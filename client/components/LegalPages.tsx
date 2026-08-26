import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  FileText, 
  Lock, 
  Scale, 
  Printer, 
  ArrowLeft, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Mail, 
  Building,
  HelpCircle,
  Eye,
  UserCheck,
  CreditCard,
  Truck,
  Globe
} from 'lucide-react';
import SEO from './SEO';

interface LegalPagesProps {
  initialTab?: 'privacy' | 'terms';
  onClose?: () => void;
  onViewChange?: (view: any) => void;
}

export const LegalPages: React.FC<LegalPagesProps> = ({ initialTab = 'privacy', onClose, onViewChange }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialTab);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    setActiveTab(initialTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [initialTab]);

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const privacySections = [
    { id: 'priv-intro', title: '1. Introduction & Overview' },
    { id: 'priv-info', title: '2. Information We Collect' },
    { id: 'priv-usage', title: '3. How We Use Your Data' },
    { id: 'priv-legal-basis', title: '4. Legal Bases for Processing (NDPR & GDPR)' },
    { id: 'priv-sharing', title: '5. Data Sharing & Third-Party Disclosures' },
    { id: 'priv-transfers', title: '6. International Data Transfers' },
    { id: 'priv-security', title: '7. Data Retention & Security Measures' },
    { id: 'priv-rights', title: '8. Your Privacy Rights & Choices' },
    { id: 'priv-cookies', title: '9. Cookies & Tracking Technologies' },
    { id: 'priv-children', title: "10. Children's Privacy" },
    { id: 'priv-updates', title: '11. Policy Modifications & Notifications' },
    { id: 'priv-contact', title: '12. Contact DPO & Complaints' },
  ];

  const termsSections = [
    { id: 'terms-acceptance', title: '1. Acceptance of Terms & Eligibility' },
    { id: 'terms-services', title: '2. Platform Scope & Service Description' },
    { id: 'terms-accounts', title: '3. Accounts, Identity Verification (KYC) & Security' },
    { id: 'terms-listings', title: '4. Vehicle Listings & Seller Obligations' },
    { id: 'terms-preorder', title: '5. Pre-order, Sourcing & Escrow Framework' },
    { id: 'terms-financial', title: '6. Platform Fees, Payments & Import Taxes' },
    { id: 'terms-inspections', title: '7. Vehicle Inspections & Disclaimers' },
    { id: 'terms-intellectual', title: '8. Intellectual Property & License Grants' },
    { id: 'terms-prohibited', title: '9. Prohibited Conduct & Platform Integrity' },
    { id: 'terms-limitation', title: '10. Limitation of Liability & Warranties' },
    { id: 'terms-indemnity', title: '11. Indemnification & Hold Harmless' },
    { id: 'terms-disputes', title: '12. Governing Law & Dispute Resolution' },
    { id: 'terms-termination', title: '13. Termination & Suspension of Service' },
    { id: 'terms-contact', title: '14. Legal Contacts & Formal Notices' },
  ];

  const currentSections = activeTab === 'privacy' ? privacySections : termsSections;

  return (
    <div className="legal-page-container" style={{ minHeight: '100vh', background: '#050505', color: '#e5e5e5', paddingTop: '6rem', paddingBottom: '6rem' }}>
      <SEO 
        title={activeTab === 'privacy' ? 'Privacy Policy - Transhub' : 'Terms of Service - Transhub'} 
        description="Official legal agreements, privacy policy, data security practices, and terms of service for Transhub Luxury Marketplace."
      />

      <style>{`
        .legal-header {
          background: linear-gradient(180deg, rgba(20,20,22,0.8) 0%, rgba(5,5,5,1) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 4rem 1.5rem 3rem;
          margin-bottom: 3rem;
        }
        .tab-btn {
          padding: 0.85rem 1.75rem;
          font-weight: 700;
          font-size: 0.9rem;
          letter-spacing: 1px;
          border-radius: 8px;
          transition: all 0.3s ease;
          border: 1px solid transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .tab-btn.active {
          background: rgba(212, 175, 55, 0.15);
          color: #d4af37;
          border-color: rgba(212, 175, 55, 0.4);
          box-shadow: 0 0 20px rgba(212, 175, 55, 0.15);
        }
        .tab-btn:not(.active) {
          background: rgba(255, 255, 255, 0.03);
          color: #a0a0a0;
          border-color: rgba(255, 255, 255, 0.08);
        }
        .tab-btn:not(.active):hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.07);
        }
        .legal-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 3rem;
          max-width: 1350px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        .toc-sidebar {
          position: sticky;
          top: 7rem;
          height: fit-content;
          max-height: calc(100vh - 9rem);
          overflow-y: auto;
          background: rgba(15, 15, 18, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1.5rem;
        }
        .toc-link {
          display: block;
          padding: 0.65rem 0.85rem;
          font-size: 0.85rem;
          color: #888888;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.2s ease;
          border-left: 2px solid transparent;
          margin-bottom: 0.25rem;
        }
        .toc-link:hover {
          color: #d4af37;
          background: rgba(212, 175, 55, 0.05);
          padding-left: 1.1rem;
        }
        .toc-link.active {
          color: #d4af37;
          font-weight: 600;
          background: rgba(212, 175, 55, 0.1);
          border-left-color: #d4af37;
        }
        .legal-content-card {
          background: rgba(12, 12, 15, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 16px;
          padding: 3.5rem;
          line-height: 1.85;
        }
        .legal-section {
          margin-bottom: 3.5rem;
          scroll-margin-top: 8rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          padding-bottom: 3rem;
        }
        .legal-section:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        .legal-section h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 1.25rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          letter-spacing: -0.3px;
        }
        .legal-section h3 {
          font-size: 1.15rem;
          font-weight: 600;
          color: #d4af37;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
        }
        .legal-section p {
          color: #b0b0b0;
          margin-bottom: 1.2rem;
          font-size: 0.95rem;
        }
        .legal-section ul {
          list-style: none;
          padding-left: 0;
          margin-bottom: 1.5rem;
        }
        .legal-section li {
          position: relative;
          padding-left: 1.75rem;
          margin-bottom: 0.75rem;
          color: #cccccc;
          font-size: 0.93rem;
        }
        .legal-section li::before {
          content: '✦';
          position: absolute;
          left: 0;
          top: 0;
          color: #d4af37;
          font-size: 0.8rem;
        }
        .highlight-box {
          background: rgba(212, 175, 55, 0.04);
          border-left: 4px solid #d4af37;
          border-radius: 0 8px 8px 0;
          padding: 1.25rem 1.5rem;
          margin: 1.5rem 0;
          color: #d0d0d0;
          font-size: 0.92rem;
        }
        .warning-box {
          background: rgba(239, 68, 68, 0.06);
          border-left: 4px solid #ef4444;
          border-radius: 0 8px 8px 0;
          padding: 1.25rem 1.5rem;
          margin: 1.5rem 0;
          color: #fca5a5;
          font-size: 0.92rem;
        }
        @media (max-width: 1024px) {
          .legal-grid {
            grid-template-columns: 1fr;
          }
          .toc-sidebar {
            display: none;
          }
          .legal-content-card {
            padding: 2rem 1.5rem;
          }
        }
        @media print {
          body { background: #ffffff !important; color: #000000 !important; }
          .legal-header, .toc-sidebar, .tab-btn, .print-btn { display: none !important; }
          .legal-grid { display: block !important; padding: 0 !important; }
          .legal-content-card { background: none !important; border: none !important; color: #000000 !important; }
          .legal-section p, .legal-section li { color: #222222 !important; }
          .legal-section h2 { color: #000000 !important; }
          .legal-section h3 { color: #886600 !important; }
        }
      `}</style>

      {/* Header Banner */}
      <div className="legal-header">
        <div style={{ maxWidth: '1350px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {onClose && (
                <button 
                  onClick={onClose}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
              )}
              <span style={{ fontSize: '0.8rem', color: '#d4af37', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                Legal & Compliance Framework
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#888888' }}>
                <Calendar size={14} /> Effective: August 26, 2026
              </div>
              <button 
                onClick={handlePrint}
                className="print-btn"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
              >
                <Printer size={15} /> Print Documentation
              </button>
            </div>
          </div>

          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', marginBottom: '1rem' }}>
            {activeTab === 'privacy' ? 'Privacy Policy & Data Rights' : 'Terms of Service & User Agreement'}
          </h1>
          <p style={{ color: '#a0a0a0', maxWidth: '750px', fontSize: '1.05rem', lineHeight: 1.7 }}>
            {activeTab === 'privacy' 
              ? 'Transhub (operated by Cosmont Automotive Group) is committed to safeguarding your personal data, transactional integrity, and automotive privacy in accordance with global standards and local regulations.'
              : 'Please carefully review these binding Terms of Service governing your access to and use of the Transhub luxury automotive marketplace, pre-order escrow, vehicle inspection services, and vendor portals.'}
          </p>

          {/* Navigation Toggle Tabs */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
            <button 
              className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
              onClick={() => { setActiveTab('privacy'); if(onViewChange) onViewChange('privacy'); }}
            >
              <Lock size={18} /> Privacy Policy
            </button>
            <button 
              className={`tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
              onClick={() => { setActiveTab('terms'); if(onViewChange) onViewChange('terms'); }}
            >
              <Scale size={18} /> Terms of Service
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="legal-grid">
        {/* Table of Contents Sidebar */}
        <aside className="toc-sidebar">
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '1.5px', color: '#d4af37', textTransform: 'uppercase', marginBottom: '1rem' }}>
            Table of Contents
          </div>

          {currentSections.map((sec) => (
            <a 
              key={sec.id}
              href={`#${sec.id}`}
              className={`toc-link ${activeSection === sec.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(sec.id);
              }}
            >
              {sec.title}
            </a>
          ))}

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>Need Clarification?</div>
            <p style={{ fontSize: '0.78rem', color: '#888888', marginBottom: '1rem', lineHeight: 1.5 }}>
              Have questions regarding data protection or marketplace compliance? Contact our legal counsel.
            </p>
            <a 
              href="mailto:legal@transhub.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: '#d4af37',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              <Mail size={14} /> legal@transhub.com
            </a>
          </div>
        </aside>

        {/* Content Details */}
        <main className="legal-content-card">
          {activeTab === 'privacy' ? (
            <div>
              {/* Privacy Policy Section 1 */}
              <section id="priv-intro" className="legal-section">
                <h2><Shield size={24} style={{ color: '#d4af37' }} /> 1. Introduction & Overview</h2>
                <p>
                  Welcome to <strong>Transhub</strong> ("Transhub", "we", "us", or "our"), an elite automotive marketplace platform owned and operated by <strong>Cosmont Automotive Group Ltd</strong>. This Privacy Policy sets forth the principles, practices, and procedures governing the collection, processing, storage, disclosure, and protection of personal data and confidential automotive records collected from users, buyers, verified vendors, and visitors ("User", "you", or "your") accessing our website, mobile applications, APIs, and associated luxury automotive services (collectively, the "Platform").
                </p>
                <p>
                  We recognize that acquiring or selling premium luxury, exotic, and high-performance motor vehicles involves high financial commitments and privacy requirements. We are dedicated to enforcing institutional-grade data privacy, complete transaction transparency, and strict adherence to applicable data protection legislation, including the Nigeria Data Protection Act (NDPA), Nigeria Data Protection Regulation (NDPR), the General Data Protection Regulation (GDPR) for international users, and global privacy standards.
                </p>
                <div className="highlight-box">
                  <strong>Key Takeaway:</strong> By accessing, browsing, registering an account, making an inquiry, placing a vehicle pre-order, or submitting vendor documentation on Transhub, you acknowledge that you have read, understood, and agreed to the data practices described in this Privacy Policy.
                </div>
              </section>

              {/* Privacy Policy Section 2 */}
              <section id="priv-info" className="legal-section">
                <h2><Eye size={24} style={{ color: '#d4af37' }} /> 2. Information We Collect</h2>
                <p>
                  In order to provide seamless vehicle sourcing, verified marketplace listings, inspection verification, escrow services, and account security, we collect several categories of information:
                </p>
                <h3>A. Personal Identifiable Information (PII)</h3>
                <ul>
                  <li><strong>Full Identity Records:</strong> Full legal name, title, date of birth, nationality, government-issued photo identification (Driver's License, International Passport, National Identity Number - NIN) for mandatory Know Your Customer (KYC) verification.</li>
                  <li><strong>Contact Details:</strong> Primary email address, telephone numbers, secondary emergency contact details, physical address, state/province, and postal code.</li>
                  <li><strong>Account Credentials:</strong> Account username, encrypted passwords, authentication tokens, security questions, and preferences.</li>
                </ul>

                <h3>B. Financial & Transactional Data</h3>
                <ul>
                  <li><strong>Payment Credentials:</strong> Bank account numbers, encrypted credit/debit card information, payment gateway transaction IDs, and settlement records processed via PCI-DSS compliant payment infrastructure.</li>
                  <li><strong>Transaction History:</strong> Vehicle purchase contracts, deposit receipts, pre-order specifications, inspection fee invoices, refund requests, and escrow milestone records.</li>
                  <li><strong>Vendor Financial Information:</strong> Verified dealer bank details, corporate tax identification numbers (TIN), business registration numbers (CAC certificate), and payout details.</li>
                </ul>

                <h3>C. Automotive & Technical Telemetry Data</h3>
                <ul>
                  <li><strong>Vehicle Information:</strong> Vehicle Identification Numbers (VIN), chassis serials, license plate numbers, custom build specifications, service logs, condition appraisal reports, and high-resolution vehicle imagery.</li>
                  <li><strong>Device & Network Data:</strong> IP address, browser type and version, operating system, time zone settings, device fingerprints, unique hardware identifiers, referrer URLs, and interactive clickstream data.</li>
                  <li><strong>Location Data:</strong> Approximate geolocation derived from IP addresses, precise GPS locations for vehicle delivery tracking or dealership verification (subject to explicit permission).</li>
                </ul>
              </section>

              {/* Privacy Policy Section 3 */}
              <section id="priv-usage" className="legal-section">
                <h2><FileText size={24} style={{ color: '#d4af37' }} /> 3. How We Use Your Data</h2>
                <p>
                  Transhub utilizes collected personal data strictly for legitimate operational, transactional, legal, and quality assurance purposes, including:
                </p>
                <ul>
                  <li><strong>Marketplace Facilitation:</strong> Connecting prospective buyers with verified automobile dealerships, facilitating direct messaging, negotiating pricing, and managing vehicle inspections.</li>
                  <li><strong>Pre-order & Global Import Escrow:</strong> Sourcing rare or custom vehicles from global networks, verifying escrow deposit funds, tracking logistics milestones, and releasing funds upon buyer acceptance.</li>
                  <li><strong>Verification & Anti-Fraud (KYC/AML):</strong> Authenticating user identities, verifying vehicle ownership documents, preventing stolen car transactions, and complying with Anti-Money Laundering (AML) regulations.</li>
                  <li><strong>Customer Service & Communication:</strong> Dispatching transaction confirmation emails, SMS security OTP codes, delivery notifications, service alerts, and technical updates.</li>
                  <li><strong>Platform Optimization & Security:</strong> Monitoring system performance, preventing cyber threats, detecting fraudulent activities, conducting data analytics, and improving user interface navigation.</li>
                  <li><strong>Marketing & Customization:</strong> Delivering tailored recommendations for new inventory arrivals based on search preferences (where consent has been explicitly granted).</li>
                </ul>
              </section>

              {/* Privacy Policy Section 4 */}
              <section id="priv-legal-basis" className="legal-section">
                <h2><Scale size={24} style={{ color: '#d4af37' }} /> 4. Legal Bases for Processing (NDPR & GDPR)</h2>
                <p>
                  Under applicable data protection frameworks, we process your personal data only when a recognized legal basis exists:
                </p>
                <ul>
                  <li><strong>Performance of Contract:</strong> Processing necessary to fulfill our obligations under terms of sale, pre-order agreements, escrow contracts, or user registration agreements.</li>
                  <li><strong>Compliance with Legal Obligations:</strong> Processing required to conform with legal statutory mandates, tax reporting laws, statutory audit requirements, and court orders.</li>
                  <li><strong>Legitimate Interests:</strong> Processing necessary for our business interests, such as maintaining security, preventing marketplace fraud, improving vehicle algorithms, and protecting intellectual property, provided your fundamental rights do not override these interests.</li>
                  <li><strong>Consent:</strong> Where you have provided clear, unambiguous consent for specific operations (e.g., promotional newsletters, location tracking). You retain the right to withdraw consent at any time.</li>
                </ul>
              </section>

              {/* Privacy Policy Section 5 */}
              <section id="priv-sharing" className="legal-section">
                <h2><Globe size={24} style={{ color: '#d4af37' }} /> 5. Data Sharing & Third-Party Disclosures</h2>
                <p>
                  Transhub does not sell, rent, or trade your personal data to third-party data brokers. We share your information exclusively under the following strict circumstances:
                </p>
                <ul>
                  <li><strong>Verified Vendors & Sellers:</strong> Sharing contact details and vehicle interest queries with verified sellers to facilitate vehicle test drives, negotiations, and sales agreements.</li>
                  <li><strong>Third-Party Service Providers:</strong> Trusted partners who provide infrastructure services, including secure payment gateways (e.g., Paystack, Flutterwave), cloud hosting (AWS/Google Cloud), SMS gateways, email dispatchers, and automated KYC verification API providers.</li>
                  <li><strong>Inspection & Logistics Partners:</strong> Certified vehicle mechanics, towing companies, shipping lines, and clearing agents responsible for physical vehicle evaluation and delivery.</li>
                  <li><strong>Regulatory & Legal Authorities:</strong> Disclosing information when legally obligated by law enforcement, judicial authorities, federal regulatory bodies (e.g., Nigeria Customs Service, Interpol, EFCC), or court summons.</li>
                  <li><strong>Corporate Restructuring:</strong> Transferring user data in connection with any merger, acquisition, consolidation, sale of company assets, or corporate restructuring of Cosmont Group.</li>
                </ul>
              </section>

              {/* Privacy Policy Section 6 */}
              <section id="priv-transfers" className="legal-section">
                <h2><Truck size={24} style={{ color: '#d4af37' }} /> 6. International Data Transfers</h2>
                <p>
                  As a global luxury automotive network sourcing vehicles from Europe, North America, the Middle East, and Asia, your data may be transferred to and processed in countries outside your country of residence. 
                </p>
                <p>
                  Whenever cross-border transfers occur, we implement legally binding data transfer safeguards, including standard contractual clauses (SCCs), encrypted cross-border transit protocols, and verification that international data centers maintain ISO/IEC 27001 and SOC 2 Type II security certifications.
                </p>
              </section>

              {/* Privacy Policy Section 7 */}
              <section id="priv-security" className="legal-section">
                <h2><Lock size={24} style={{ color: '#d4af37' }} /> 7. Data Retention & Security Measures</h2>
                <p>
                  We implement robust technical and organizational security controls designed to protect your personal data against unauthorized access, accidental loss, alteration, or unlawful destruction:
                </p>
                <ul>
                  <li><strong>Encryption:</strong> AES-256 bit encryption for data at rest and TLS 1.3 encryption for data in transit across all web interfaces.</li>
                  <li><strong>Access Controls:</strong> Role-based access control (RBAC) restricting employee access to personal data strictly on a need-to-know basis.</li>
                  <li><strong>Continuous Monitoring:</strong> Real-time intrusion detection systems (IDS), automated vulnerability scanning, and routine penetration testing.</li>
                  <li><strong>Retention Periods:</strong> Personal data is retained only for as long as necessary to fulfill marketplace operations or satisfy legal, accounting, or regulatory requirements. Financial and vehicle transaction records are retained for seven (7) years in compliance with statutory financial retention laws.</li>
                </ul>
              </section>

              {/* Privacy Policy Section 8 */}
              <section id="priv-rights" className="legal-section">
                <h2><UserCheck size={24} style={{ color: '#d4af37' }} /> 8. Your Privacy Rights & Choices</h2>
                <p>
                  Depending on your jurisdiction, you possess specific legal rights regarding your personal information:
                </p>
                <ul>
                  <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
                  <li><strong>Right to Rectification:</strong> Request correction of inaccurate, incomplete, or outdated data.</li>
                  <li><strong>Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your personal data where no legal override or statutory requirement mandates retention.</li>
                  <li><strong>Right to Restrict Processing:</strong> Request temporary suspension of data processing during disputes regarding data accuracy.</li>
                  <li><strong>Right to Data Portability:</strong> Obtain your data in a structured, machine-readable format for transfer to another platform.</li>
                  <li><strong>Right to Object:</strong> Object to data processing based on direct marketing or legitimate interest grounds.</li>
                </ul>
                <p>To exercise any of these rights, submit a written request to <a href="mailto:privacy@transhub.com" style={{ color: '#d4af37' }}>privacy@transhub.com</a>.</p>
              </section>

              {/* Privacy Policy Section 9 */}
              <section id="priv-cookies" className="legal-section">
                <h2><HelpCircle size={24} style={{ color: '#d4af37' }} /> 9. Cookies & Tracking Technologies</h2>
                <p>
                  Transhub utilizes cookies, web beacons, local storage tokens, and pixels to distinguish you from other users, enhance browsing experience, maintain session state, and analyze web traffic patterns.
                </p>
                <p>
                  <strong>Types of Cookies Used:</strong>
                </p>
                <ul>
                  <li><strong>Essential Cookies:</strong> Required for platform navigation, user authentication, and secure login access.</li>
                  <li><strong>Analytical Cookies:</strong> Collect anonymous usage statistics to optimize page load speeds and user experience.</li>
                  <li><strong>Functional Cookies:</strong> Remember your search preferences, currency selections, and favorite saved vehicles.</li>
                </ul>
                <p>You can manage your cookie preferences through your internet browser settings at any time.</p>
              </section>

              {/* Privacy Policy Section 10 */}
              <section id="priv-children" className="legal-section">
                <h2><AlertTriangle size={24} style={{ color: '#ef4444' }} /> 10. Children's Privacy</h2>
                <p>
                  The Transhub platform is strictly intended for individuals who are at least eighteen (18) years of age or the legal age of majority in their jurisdiction. We do not knowingly solicit or collect personal data from minors under 18. If we discover that a minor under 18 has submitted personal information, we will immediately purge the record from our active databases.
                </p>
              </section>

              {/* Privacy Policy Section 11 */}
              <section id="priv-updates" className="legal-section">
                <h2><Calendar size={24} style={{ color: '#d4af37' }} /> 11. Policy Modifications & Notifications</h2>
                <p>
                  Cosmont Automotive Group reserves the right to amend or update this Privacy Policy at any time to reflect changes in legal mandates, operational requirements, or technological updates. When significant modifications occur, we will update the "Effective Date" at the top of this policy and notify users via prominent platform banners or direct email communication.
                </p>
              </section>

              {/* Privacy Policy Section 12 */}
              <section id="priv-contact" className="legal-section">
                <h2><Building size={24} style={{ color: '#d4af37' }} /> 12. Contact DPO & Complaints</h2>
                <p>
                  For any inquiries, requests, or privacy concerns regarding this policy or our data practices, please contact our designated Data Protection Officer (DPO):
                </p>
                <div className="highlight-box">
                  <strong>Transhub Data Protection Office</strong><br />
                  Attn: Data Protection Officer & Legal Counsel<br />
                  Cosmont Automotive Group Ltd<br />
                  Lagos, Nigeria<br />
                  Email: <a href="mailto:dpo@transhub.com" style={{ color: '#d4af37' }}>dpo@transhub.com</a> / <a href="mailto:privacy@transhub.com" style={{ color: '#d4af37' }}>privacy@transhub.com</a><br />
                  Phone: +234 808 678 8983
                </div>
              </section>
            </div>
          ) : (
            <div>
              {/* Terms of Service Section 1 */}
              <section id="terms-acceptance" className="legal-section">
                <h2><Scale size={24} style={{ color: '#d4af37' }} /> 1. Acceptance of Terms & Eligibility</h2>
                <p>
                  These Terms of Service ("Terms", "Agreement") constitute a legally binding agreement between you ("User", "Buyer", "Vendor", "Seller") and <strong>Cosmont Automotive Group Ltd</strong>, operating as <strong>Transhub</strong> ("Transhub", "we", "us", "our"). 
                </p>
                <p>
                  By registering for an account, accessing our marketplace website, requesting vehicle inspections, placing a pre-order, listing a motor vehicle, or utilizing any services provided by Transhub, you explicitly agree to be bound by these Terms and our Privacy Policy. If you do not agree to all terms herein, you are strictly prohibited from using the platform.
                </p>
                <div className="highlight-box">
                  <strong>Eligibility Requirement:</strong> You must be at least 18 years old and possess full legal capacity to enter into binding legal contracts under applicable laws to use this platform.
                </div>
              </section>

              {/* Terms of Service Section 2 */}
              <section id="terms-services" className="legal-section">
                <h2><Building size={24} style={{ color: '#d4af37' }} /> 2. Platform Scope & Service Description</h2>
                <p>
                  Transhub provides a premier digital automotive ecosystem designed to connect verified luxury vehicle dealers, verified sellers, and buyers across Nigeria and global international automotive markets. Our services include, but are not limited to:
                </p>
                <ul>
                  <li><strong>Verified Car Marketplace:</strong> A curated directory of luxury, exotic, SUVs, sedans, and commercial vehicles available for immediate purchase.</li>
                  <li><strong>Custom Vehicle Pre-Order & Import Escrow:</strong> Sourcing specific vehicle builds globally, managing logistics, customs clearance, and securing milestone payments.</li>
                  <li><strong>Professional Automotive Inspections:</strong> Comprehensive multi-point physical, mechanical, OBD-II diagnostic, structural, and title evaluations conducted by certified engineers.</li>
                  <li><strong>Vendor & Dealership Portal:</strong> SaaS management tools allowing verified automobile vendors to list inventory, manage customer inquiries, and track sales performance.</li>
                </ul>
              </section>

              {/* Terms of Service Section 3 */}
              <section id="terms-accounts" className="legal-section">
                <h2><UserCheck size={24} style={{ color: '#d4af37' }} /> 3. Accounts, Identity Verification (KYC) & Security</h2>
                <p>
                  To unlock marketplace capabilities, make inquiries, or initiate financial transactions, users must create a verified account.
                </p>
                <ul>
                  <li><strong>Account Accuracy:</strong> You agree to provide accurate, current, and complete account information during registration and keep your profile updated.</li>
                  <li><strong>Security & Passwords:</strong> You are solely responsible for safeguarding your login credentials and for all actions taken under your account. Promptly notify us of any unauthorized account access.</li>
                  <li><strong>Mandatory KYC Verification:</strong> Due to the high value of luxury motor vehicles, Transhub reserves the right to require identity verification (NIN, Passport, Bank Verification) prior to releasing vehicle location details, accepting deposits, or permitting seller listings.</li>
                </ul>
              </section>

              {/* Terms of Service Section 4 */}
              <section id="terms-listings" className="legal-section">
                <h2><Eye size={24} style={{ color: '#d4af37' }} /> 4. Vehicle Listings & Seller Obligations</h2>
                <p>
                  Sellers and verified vendors listing vehicles on Transhub must comply with strict representation standards:
                </p>
                <ul>
                  <li><strong>Proof of Ownership & Title:</strong> Sellers represent and warrant that they possess legal ownership or explicit power of attorney to sell listed vehicles, free from encumbrances, bank liens, or legal disputes.</li>
                  <li><strong>Accurate Condition Disclosures:</strong> All vehicle listings must accurately reflect mileage, accident history, title status (clean vs. salvage), structural damage, mechanical faults, and custom modifications.</li>
                  <li><strong>VIN Verification:</strong> Sellers must disclose valid Vehicle Identification Numbers (VIN). Listings with tampered or falsified VINs will result in immediate permanent account termination and criminal reporting to law enforcement authorities.</li>
                  <li><strong>Pricing & Availability:</strong> Listed prices must be accurate. Sellers must promptly update listing availability when a vehicle is reserved or sold.</li>
                </ul>
              </section>

              {/* Terms of Service Section 5 */}
              <section id="terms-preorder" className="legal-section">
                <h2><CreditCard size={24} style={{ color: '#d4af37' }} /> 5. Pre-order, Sourcing & Escrow Framework</h2>
                <p>
                  Transhub offers a structured vehicle pre-order service allowing buyers to request custom automobile configurations sourced from global auctions, foreign dealerships, or original manufacturers:
                </p>
                <ul>
                  <li><strong>Commitment Deposit:</strong> Initiating a pre-order search requires a commitment deposit. Deposits are applied directly to the final purchase price upon vehicle allocation.</li>
                  <li><strong>Milestone Escrow:</strong> Payment funds for imported pre-orders are held in protected escrow accounts. Escrow releases are tied to verified milestones: (1) Vehicle Acquisition, (2) Shipping & Port Clearing, and (3) Final Physical Inspection & Delivery.</li>
                  <li><strong>Cancellation Policy:</strong> Pre-order commitments cancelled after vehicle bidding or acquisition has commenced may incur non-refundable logistics, transport, and auction penalty fees deducted from the initial deposit.</li>
                </ul>
              </section>

              {/* Terms of Service Section 6 */}
              <section id="terms-financial" className="legal-section">
                <h2><Truck size={24} style={{ color: '#d4af37' }} /> 6. Platform Fees, Payments & Import Taxes</h2>
                <p>
                  Transhub charges fees for specialized services, including vendor subscription tiers, inspection fees, escrow management, and custom import clearing services.
                </p>
                <ul>
                  <li><strong>Service Fee Transparency:</strong> All applicable service fees, clearing charges, and taxes are itemized prior to transaction completion.</li>
                  <li><strong>Customs Duties & Tariffs:</strong> For imported vehicles, estimated customs tariffs are calculated based on official port duty schedules. Ultimate clearing costs are determined by statutory customs regulations.</li>
                  <li><strong>Payment Methods:</strong> Payments must be made via authorized platform channels (bank transfers, secure payment gateways). Transhub is not responsible for cash payments made outside our official platform escrow.</li>
                </ul>
              </section>

              {/* Terms of Service Section 7 */}
              <section id="terms-inspections" className="legal-section">
                <h2><CheckCircle size={24} style={{ color: '#d4af37' }} /> 7. Vehicle Inspections & Disclaimers</h2>
                <p>
                  Transhub provides comprehensive professional vehicle inspection reports to assist buyers in evaluating automobile conditions:
                </p>
                <ul>
                  <li><strong>Scope of Inspection:</strong> Inspection reports evaluate the condition of the vehicle at the exact time and date of inspection. Reports do not guarantee future mechanical longevity or guard against hidden latent defects not detectable during standard evaluation.</li>
                  <li><strong>Independent Verification:</strong> Buyers are strongly advised to review inspection reports thoroughly and, where desired, request secondary physical verification prior to releasing final purchase funds.</li>
                </ul>
              </section>

              {/* Terms of Service Section 8 */}
              <section id="terms-intellectual" className="legal-section">
                <h2><Shield size={24} style={{ color: '#d4af37' }} /> 8. Intellectual Property & License Grants</h2>
                <p>
                  All software code, user interface designs, logos, branding assets, trademarks, database structures, and platform content are the exclusive intellectual property of Cosmont Automotive Group Ltd.
                </p>
                <p>
                  By uploading vehicle listing photos or media to Transhub, you grant Transhub a worldwide, royalty-free, non-exclusive, perpetual license to use, display, reproduce, and market your listing media across our marketplace and advertising channels.
                </p>
              </section>

              {/* Terms of Service Section 9 */}
              <section id="terms-prohibited" className="legal-section">
                <h2><AlertTriangle size={24} style={{ color: '#ef4444' }} /> 9. Prohibited Conduct & Platform Integrity</h2>
                <p>
                  Users agree NOT to engage in any of the following prohibited activities:
                </p>
                <ul>
                  <li>Listing stolen, cloned, encumbered, or counterfeit vehicles.</li>
                  <li>Circumventing platform escrow fees by coercing buyers into offline cash transfers.</li>
                  <li>Scraping platform data, reverse engineering source code, or launching cyberattacks.</li>
                  <li>Impersonating Transhub representatives, vehicle inspectors, or verified dealership agents.</li>
                  <li>Posting misleading, defamatory, offensive, or fraudulent listing content.</li>
                </ul>
              </section>

              {/* Terms of Service Section 10 */}
              <section id="terms-limitation" className="legal-section">
                <h2><Lock size={24} style={{ color: '#d4af37' }} /> 10. Limitation of Liability & Warranties</h2>
                <p>
                  To the maximum extent permitted by applicable law, Transhub and Cosmont Automotive Group provide the platform on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied.
                </p>
                <div className="warning-box">
                  <strong>Liability Cap:</strong> In no event shall Transhub, its directors, employees, or affiliates be liable for indirect, incidental, consequential, special, or punitive damages. Our aggregate total liability for any claim arising out of or relating to this agreement shall not exceed the total platform fees paid by you to Transhub in the six (6) months preceding the claim.
                </div>
              </section>

              {/* Terms of Service Section 11 */}
              <section id="terms-indemnity" className="legal-section">
                <h2><Shield size={24} style={{ color: '#d4af37' }} /> 11. Indemnification & Hold Harmless</h2>
                <p>
                  You agree to defend, indemnify, and hold harmless Transhub, Cosmont Automotive Group, its officers, directors, employees, and partners from and against any third-party claims, liabilities, damages, losses, or expenses (including legal fees) arising out of your breach of these Terms, vehicle misrepresentation, violation of third-party rights, or illegal conduct.
                </p>
              </section>

              {/* Terms of Service Section 12 */}
              <section id="terms-disputes" className="legal-section">
                <h2><Scale size={24} style={{ color: '#d4af37' }} /> 12. Governing Law & Dispute Resolution</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to conflict of law principles.
                </p>
                <ul>
                  <li><strong>Amicable Negotiation:</strong> In the event of any dispute, claim, or controversy, parties agree to first attempt resolution through good-faith informal negotiations for a minimum period of thirty (30) days.</li>
                  <li><strong>Binding Arbitration:</strong> Any dispute not resolved through negotiation shall be submitted to final and binding arbitration in Lagos, Nigeria, under the Arbitration and Mediation Act of Nigeria.</li>
                </ul>
              </section>

              {/* Terms of Service Section 13 */}
              <section id="terms-termination" className="legal-section">
                <h2><AlertTriangle size={24} style={{ color: '#ef4444' }} /> 13. Termination & Suspension of Service</h2>
                <p>
                  Transhub reserves the right, in its sole discretion and without prior notice, to suspend or terminate your account, remove vehicle listings, or block platform access if you breach these Terms, engage in fraud, or compromise platform integrity.
                </p>
              </section>

              {/* Terms of Service Section 14 */}
              <section id="terms-contact" className="legal-section">
                <h2><Mail size={24} style={{ color: '#d4af37' }} /> 14. Legal Contacts & Formal Notices</h2>
                <p>
                  For formal legal notices, disputes, or contractual inquiries regarding these Terms of Service:
                </p>
                <div className="highlight-box">
                  <strong>Legal Department - Transhub</strong><br />
                  Cosmont Automotive Group Ltd<br />
                  Lagos, Nigeria<br />
                  Email: <a href="mailto:legal@transhub.com" style={{ color: '#d4af37' }}>legal@transhub.com</a><br />
                  Customer Support Hotline: +234 808 678 8983
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
export default LegalPages;
