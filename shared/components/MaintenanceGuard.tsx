import React from 'react';
import { motion } from 'framer-motion';
import { usePlatformSettings } from '../hooks/usePlatformSettings';
import { useAuth } from '../lib/AuthContext';
import { ShieldAlert, Zap } from 'lucide-react';

interface MaintenanceGuardProps {
    children: React.ReactNode;
}

export const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
    const { settings, loading: settingsLoading } = usePlatformSettings();
    const { profile, loading: authLoading } = useAuth();

    const isMaintenanceMode = settings['operations']?.maintenance_mode === true;
    const isAdmin = profile?.role === 'admin';

    if (settingsLoading || authLoading) {
        return null; // Or a minimal luxury loader
    }

    if (isMaintenanceMode && !isAdmin) {
        return (
            <div style={{ 
                height: '100vh', 
                width: '100vw', 
                background: '#050505', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'white',
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                padding: '2rem',
                textAlign: 'center',
                overflow: 'hidden'
            }}>
                {/* Background Decor */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '60vw',
                    height: '60vh',
                    background: 'radial-gradient(circle, rgba(197, 160, 89, 0.05) 0%, transparent 70%)',
                    filter: 'blur(50px)',
                    zIndex: -1
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ maxWidth: '600px' }}
                >
                    <div style={{ 
                        width: '80px', 
                        height: '80px', 
                        borderRadius: '50%', 
                        background: 'rgba(197, 160, 89, 0.1)', 
                        border: '1px solid var(--accent-gold)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                        boxShadow: '0 0 20px rgba(197, 160, 89, 0.2)'
                    }}>
                        <ShieldAlert size={40} color="var(--accent-gold)" />
                    </div>

                    <h1 className="luxury-font" style={{ fontSize: '3rem', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
                        Temporary <span style={{ color: 'var(--accent-gold)' }}>Suspension</span>
                    </h1>
                    
                    <p style={{ 
                        fontSize: '1.1rem', 
                        color: 'rgba(255,255,255,0.6)', 
                        lineHeight: '1.8',
                        marginBottom: '3rem'
                    }}>
                        The Transhub network is currently undergoing a strategic synchronization. 
                        We are refining our digital infrastructure to better serve your luxury pursuit.
                    </p>

                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '0.8rem',
                        padding: '1rem 2.5rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '100px',
                        fontSize: '0.8rem',
                        letterSpacing: '2px',
                        color: 'var(--accent-gold)',
                        textTransform: 'uppercase'
                    }}>
                        <Zap size={14} />
                        Architectural Update in Progress
                    </div>
                </motion.div>

                {/* Decorative Moving Line */}
                <motion.div 
                    animate={{ x: ['100%', '-100%'] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    style={{ 
                        position: 'absolute', 
                        bottom: '10%', 
                        width: '50%', 
                        height: '1px', 
                        background: 'linear-gradient(90deg, transparent, var(--accent-gold), transparent)',
                        opacity: 0.3
                    }}
                />
            </div>
        );
    }

    return <>{children}</>;
};
