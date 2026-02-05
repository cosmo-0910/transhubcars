import { motion } from 'framer-motion';
import { Sparkles, Clock, ArrowRight } from 'lucide-react';

export const Services = () => {
    return (
        <div className="animate-fade-in" style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center', 
            padding: '100px 2rem',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Aesthetic */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80vw',
                height: '80vh',
                background: 'radial-gradient(circle, rgba(197, 160, 89, 0.05) 0%, transparent 70%)',
                zIndex: -1,
                filter: 'blur(100px)'
            }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="glass"
                style={{
                    padding: '5rem 3rem',
                    borderRadius: '3rem',
                    maxWidth: '800px',
                    width: '100%',
                    border: '1px solid var(--border-glass)',
                    boxShadow: 'var(--shadow-luxury)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                    >
                        <Sparkles color="var(--accent-gold)" size={48} />
                    </motion.div>
                </div>

                <h1 className="luxury-font" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '1.5rem', color: 'var(--text-main)' }}>
                    Elite <span style={{ color: 'var(--accent-gold)' }}>Concierge.</span>
                </h1>
                
                <p style={{ 
                    fontSize: '1.2rem', 
                    color: 'var(--text-muted)', 
                    lineHeight: '1.8', 
                    marginBottom: '3rem',
                    maxWidth: '600px',
                    margin: '0 auto 3rem'
                }}>
                    Our comprehensive suite of luxury automotive services is currently being curated to meet our exacting standards. From bespoke sourcing to elite maintenance, excellence is coming soon.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
                    <ServiceTeaser icon={<Clock size={24} />} title="Registry Sourcing" />
                    <ServiceTeaser icon={<Sparkles size={24} />} title="Elite Maintenance" />
                    <ServiceTeaser icon={<ArrowRight size={24} />} title="Global Delivery" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '4px', color: 'var(--accent-gold)' }}>COMING Q2 2026</span>
                    <button className="btn-gold" style={{ padding: '1rem 3rem', borderRadius: '0.5rem' }}>NOTIFY ME</button>
                </div>
            </motion.div>

            {/* Decorative Lines */}
            <div className="animated-line line-up" style={{ left: '10%', opacity: 0.1 }} />
            <div className="animated-line line-down" style={{ right: '10%', opacity: 0.1 }} />
        </div>
    );
};

const ServiceTeaser = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', background: 'rgba(212, 175, 55, 0.05)' }}>
        <div style={{ color: 'var(--accent-gold)' }}>{icon}</div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>{title.toUpperCase()}</span>
    </div>
);
