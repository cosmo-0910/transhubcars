import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    google: any;
  }
}
declare var google: any;
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Settings, Truck, ShieldCheck, ChevronLeft, Star, Phone, MapPin, CheckCircle } from 'lucide-react';
import { SparePartsMarketplace } from './SparePartsMarketplace';
import { InquiryForm } from './Forms';
import { partsService } from '../services/parts.service';
import { towService } from '../services/tow.service';
import { mechanicService } from '../services/mechanic.service';
import { useAuth } from '../../shared/lib/AuthContext';
import type { Mechanic } from '../../shared/lib/db';

import { usePlatformSettings } from '../../shared/hooks/usePlatformSettings';

type ServiceType = 'hub' | 'parts' | 'tow' | 'mechanics';

export const Services = () => {
    const [view, setView] = useState<ServiceType>('hub');
    const [partsView, setPartsView] = useState<'marketplace' | 'request'>('marketplace');
    const [showInquiry, setShowInquiry] = useState<{ type: 'Inspection' | 'Purchase', carName?: string } | null>(null);
    const { profile } = useAuth();
    const { settings } = usePlatformSettings();

    const isTowingEnabled = settings['operations']?.towing_service_enabled !== false;

    return (
        <div className="animate-fade-in" style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '120px 2rem 4rem',
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

            <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', position: 'relative' }}>
                <AnimatePresence mode="wait">
                    {view === 'hub' && (
                        <motion.div
                            key="hub"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h1 className="luxury-font" style={{ fontSize: 'clamp(2.5rem, 8vw, 4rem)', marginBottom: '1rem', color: 'var(--text-main)' }}>
                                Transhub <span style={{ color: 'var(--accent-gold)' }}>Concierge.</span>
                            </h1>
                            <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '4rem', maxWidth: '600px', margin: '0 auto 4rem' }}>
                                Elite automotive support tailored for luxury vehicle owners. From genuine parts to emergency recovery and certified expertise.
                            </p>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                                <ServiceCard 
                                    icon={<Settings size={40} />} 
                                    title="Spare Parts" 
                                    description="Source genuine, high-performance parts for any luxury marque."
                                    onClick={() => setView('parts')}
                                />
                                <ServiceCard 
                                    icon={<Truck size={40} />} 
                                    title="Tow Truck" 
                                    description={isTowingEnabled ? "Rapid roadside assistance and recovery in your vicinity." : "Our towing network is currently undergoing strategic optimization."}
                                    onClick={isTowingEnabled ? () => setView('tow') : undefined}
                                    accent={isTowingEnabled ? "#E11D48" : "rgba(255,255,255,0.2)"}
                                    disabled={!isTowingEnabled}
                                />
                                <ServiceCard 
                                    icon={<ShieldCheck size={40} />} 
                                    title="Certified Workshops" 
                                    description="Vetted elite workshops certified by Transhub for superior maintenance."
                                    onClick={() => setView('mechanics')}
                                />
                            </div>
                        </motion.div>
                    )}

                    {view === 'parts' && (
                        <div>
                             <button 
                                onClick={() => setView('hub')} 
                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem' }}
                             >
                                <ChevronLeft size={20} /> BACK TO CONCIERGE
                            </button>
                            
                            {partsView === 'marketplace' ? (
                                <SparePartsMarketplace onSourcingRequest={() => setPartsView('request')} />
                            ) : (
                                <SparePartsForm onBack={() => setPartsView('marketplace')} userId={profile?.id || 'guest'} hideBackButton />
                            )}
                        </div>
                    )}

                    {view === 'tow' && (
                        <TowTruckForm onBack={() => setView('hub')} userId={profile?.id || 'guest'} />
                    )}

                    {view === 'mechanics' && (
                        <MechanicsList 
                            onBack={() => setView('hub')} 
                            onBook={(name) => setShowInquiry({ type: 'Purchase', carName: `Service: ${name}` })}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showInquiry && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 3000,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(10px)',
                            padding: '2rem 1rem',
                            overflowY: 'auto'
                        }}>
                            <InquiryForm 
                                type={showInquiry.type} 
                                carName={showInquiry.carName}
                                onClose={() => setShowInquiry(null)}
                            />
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Decorative Lines */}
            <div className="animated-line line-up" style={{ left: '5%', opacity: 0.1 }} />
            <div className="animated-line line-down" style={{ right: '5%', opacity: 0.1 }} />
        </div>
    );
};

const ServiceCard = ({ icon, title, description, onClick, accent = 'var(--accent-gold)', disabled = false }: any) => (
    <motion.div 
        whileHover={!disabled ? { scale: 1.02, translateY: -5 } : {}}
        onClick={onClick}
        className="glass" 
        style={{ 
            padding: '3rem 2rem', 
            borderRadius: '2rem', 
            cursor: disabled ? 'not-allowed' : 'pointer',
            border: '1px solid var(--border-glass)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            background: 'var(--bg-glass-heavy)',
            opacity: disabled ? 0.6 : 1
        }}
    >
        <div style={{ color: accent, background: `${accent}15`, padding: '1.5rem', borderRadius: '1rem' }}>{icon}</div>
        <h3 className="luxury-font" style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6' }}>{description}</p>
        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', color: accent, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>
            {disabled ? 'TEMPORARILY OFFLINE' : <>ORDER NOW <ArrowRight size={16} /></>}
        </div>
    </motion.div>
);

const SparePartsForm = ({ onBack, userId, hideBackButton = false }: any) => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        part_name: '',
        vehicle_make: '',
        vehicle_model: '',
        vehicle_year: '',
        quantity: 1,
        description: ''
    });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            await partsService.submitOrder({ ...form, user_id: userId });
            setSuccess(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '4rem', borderRadius: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                <CheckCircle size={64} color="var(--accent-gold)" style={{ marginBottom: '2rem' }} />
                <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Order Submitted</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Our concierge team will source your requested parts and contact you with a quote shortly.</p>
                <button className="btn-gold" onClick={onBack}>RETURN TO INVENTORY</button>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {!hideBackButton && (
                <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem' }}>
                    <ChevronLeft size={20} /> BACK TO CONCIERGE
                </button>
            )}
            <div className="glass" style={{ padding: '3rem', borderRadius: '2rem', maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
                <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Order Genuine Parts</h2>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Part Name</label>
                        <input 
                            required 
                            className="luxury-input" 
                            style={{ width: '100%' }} 
                            placeholder="e.g. Brake Pads, OEM Air Filter"
                            value={form.part_name}
                            onChange={e => setForm({...form, part_name: e.target.value})}
                        />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Vehicle Make</label>
                            <input 
                                required 
                                className="luxury-input" 
                                style={{ width: '100%' }} 
                                placeholder="e.g. Mercedes"
                                value={form.vehicle_make}
                                onChange={e => setForm({...form, vehicle_make: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Vehicle Model</label>
                            <input 
                                required 
                                className="luxury-input" 
                                style={{ width: '100%' }} 
                                placeholder="e.g. S-Class"
                                value={form.vehicle_model}
                                onChange={e => setForm({...form, vehicle_model: e.target.value})}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Year</label>
                            <input 
                                className="luxury-input" 
                                style={{ width: '100%' }} 
                                placeholder="e.g. 2023"
                                value={form.vehicle_year}
                                onChange={e => setForm({...form, vehicle_year: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Quantity</label>
                            <input 
                                type="number" 
                                className="luxury-input" 
                                style={{ width: '100%' }} 
                                value={form.quantity}
                                onChange={e => setForm({...form, quantity: parseInt(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div className="input-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Additional Details (Optional)</label>
                        <textarea 
                            className="luxury-input" 
                            style={{ width: '100%', minHeight: '100px' }} 
                            placeholder="VIN number or specific variations..."
                            value={form.description}
                            onChange={e => setForm({...form, description: e.target.value})}
                        />
                    </div>
                    <button disabled={loading} className="btn-gold" style={{ marginTop: '1rem' }}>
                        {loading ? 'PROCESSING...' : 'REQUEST PART SOURCING'}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

import { TRANSHUB_MAP_STYLE } from '../utils/mapTheme';

const StyledMap = ({ lat, lng, zoom = 15 }: { lat: number; lng: number; zoom?: number }) => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current || !lat || !lng) return;

        // Load Google Maps script if not already present
        const scriptId = 'google-maps-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}`;
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);
        }

        const initMap = () => {
            if (typeof google === 'undefined') {
                setTimeout(initMap, 500);
                return;
            }

            const map = new google.maps.Map(mapRef.current!, {
                center: { lat, lng },
                zoom,
                styles: TRANSHUB_MAP_STYLE,
                disableDefaultUI: true,
                zoomControl: true,
            });

            new google.maps.Marker({
                position: { lat, lng },
                map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: "#E11D48",
                    fillOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: "#FFFFFF",
                },
            });
        };

        initMap();
    }, [lat, lng, zoom]);

    return (
        <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
    );
};

const TowTruckForm = ({ onBack, userId }: any) => {
    const [loading, setLoading] = useState(false);
    const [detecting, setDetecting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [form, setForm] = useState({
        pickup_address: '',
        destination_address: '',
        vehicle_type: '',
        notes: ''
    });
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        setDetecting(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const addr = await towService.reverseGeocode(latitude, longitude);
                setForm({
                    ...form,
                    pickup_address: addr
                });
                setCoordinates({ lat: latitude, lng: longitude });
                setDetecting(false);
            },
            (error) => {
                console.error(error);
                alert('Unable to retrieve your location');
                setDetecting(false);
            }
        );
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        try {
            await towService.requestTow({ ...form, user_id: userId });
            setSuccess(true);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass" style={{ padding: '4rem', borderRadius: '2rem', maxWidth: '600px', margin: '0 auto' }}>
                <Truck size={64} color="#E11D48" style={{ marginBottom: '2rem' }} />
                <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Request Sent</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We are dispatching the nearest tow truck to your vicinity. You will receive an SMS confirmation shortly.</p>
                <button className="btn-gold" onClick={onBack}>RETURN TO SERVICES</button>
            </motion.div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '2rem' }}>
                <ChevronLeft size={20} /> BACK TO CONCIERGE
            </button>
            
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div className="glass" style={{ flex: '1', minWidth: '400px', padding: '3rem', borderRadius: '2rem', textAlign: 'left', border: '1px solid rgba(225, 29, 72, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <div style={{ color: '#E11D48', background: 'rgba(225, 29, 72, 0.1)', padding: '1rem', borderRadius: '0.8rem' }}><Truck size={32} /></div>
                        <h2 className="luxury-font" style={{ fontSize: '2.5rem' }}>Emergency Towing</h2>
                    </div>
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                        <div className="input-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Current Pickup Location</label>
                                <button 
                                    type="button" 
                                    onClick={detectLocation}
                                    style={{ 
                                        background: 'none', 
                                        border: 'none', 
                                        color: 'var(--accent-gold)', 
                                        fontSize: '0.8rem', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.4rem',
                                        cursor: 'pointer',
                                        fontWeight: 600
                                    }}
                                >
                                    <MapPin size={14} /> {detecting ? 'DETECTING...' : 'AUTO-DETECT LOCATION'}
                                </button>
                            </div>
                            <input 
                                required 
                                className="luxury-input" 
                                style={{ width: '100%' }} 
                                placeholder="Enter your current address or location"
                                value={form.pickup_address}
                                onChange={async (e) => {
                                    setForm({...form, pickup_address: e.target.value});
                                    // Basic logic to update map if it looks like coordinates
                                    if (e.target.value.includes(',')) {
                                        const [lat, lng] = e.target.value.split(',').map(Number);
                                        if (!isNaN(lat) && !isNaN(lng)) {
                                            setCoordinates({ lat, lng });
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Destination (Optional)</label>
                            <input 
                                className="luxury-input" 
                                style={{ width: '100%' }} 
                                placeholder="Where should we transport the vehicle?"
                                value={form.destination_address}
                                onChange={e => setForm({...form, destination_address: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Vehicle Type</label>
                            <input 
                                required
                                className="luxury-input" 
                                style={{ width: '100%' }} 
                                placeholder="e.g. SUV, Luxury Saloon, Sports Car"
                                value={form.vehicle_type}
                                onChange={e => setForm({...form, vehicle_type: e.target.value})}
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Notes for Driver</label>
                            <textarea 
                                className="luxury-input" 
                                style={{ width: '100%', minHeight: '80px' }} 
                                placeholder="Describe the issue or any specific requirements..."
                                value={form.notes}
                                onChange={e => setForm({...form, notes: e.target.value})}
                            />
                        </div>
                        <button disabled={loading} className="btn-gold" style={{ marginTop: '1rem', background: '#E11D48', borderColor: '#E11D48' }}>
                            {loading ? 'LOCATING TRUCKS...' : 'REQUEST RAPID RECOVERY'}
                        </button>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic' }}>
                            * Service prioritized for vehicles within 10km radius.
                        </p>
                    </form>
                </div>

                <div className="glass" style={{ flex: '1', minWidth: '400px', borderRadius: '2rem', overflow: 'hidden', minHeight: '400px', display: 'flex', flexDirection: 'column', border: '1px solid var(--border-glass)' }}>
                    {coordinates ? (
                        <StyledMap lat={coordinates.lat} lng={coordinates.lng} />
                    ) : (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', padding: '2rem', textAlign: 'center' }}>
                            <MapPin size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                            <p>Select your location to see a luxury map preview</p>
                            <button 
                                onClick={detectLocation}
                                style={{ marginTop: '1.5rem', padding: '0.8rem 1.5rem', borderRadius: '2rem', border: '1px solid var(--accent-gold)', background: 'transparent', color: 'var(--accent-gold)', cursor: 'pointer', fontWeight: 600 }}
                            >
                                AUTO-DETECT NOW
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const MechanicsList = ({ onBack, onBook }: { onBack: () => void, onBook: (name: string) => void }) => {
    const [mechanics, setMechanics] = useState<Mechanic[]>([]);
    const [loading, setLoading] = useState(true);
    const [onlyApproved, setOnlyApproved] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                const data = await mechanicService.getMechanics({ onlyApproved });
                setMechanics(data);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [onlyApproved]);

    return (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <ChevronLeft size={20} /> BACK TO CONCIERGE
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Certified Partners Only</span>
                    <button 
                        onClick={() => setOnlyApproved(!onlyApproved)}
                        style={{ 
                            width: '50px', 
                            height: '26px', 
                            borderRadius: '13px', 
                            background: onlyApproved ? 'var(--accent-gold)' : 'var(--bg-glass-heavy)',
                            border: '1px solid var(--border-glass)',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                        }}
                    >
                        <div style={{ 
                            position: 'absolute', 
                            top: '2px', 
                            left: onlyApproved ? '26px' : '2px', 
                            width: '20px', 
                            height: '20px', 
                            borderRadius: '50%', 
                            background: 'white',
                            transition: 'all 0.3s'
                        }} />
                    </button>
                </div>
            </div>

            <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '3rem', textAlign: 'left' }}>Certified Maintenance Workshops</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
                {loading ? (
                    Array(3).fill(0).map((_, i) => <div key={i} className="glass animate-pulse" style={{ height: '300px', borderRadius: '2rem' }} />)
                ) : (
                    mechanics.map(m => (
                        <div key={m.id} className="glass" style={{ borderRadius: '2rem', overflow: 'hidden', textAlign: 'left', border: '1px solid var(--border-glass)' }}>
                            <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                                <img src={m.image_url} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {m.is_approved && (
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--bg-deep)', color: 'var(--accent-gold)', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 800, border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <CheckCircle size={14} /> TRANSHUB CERTIFIED
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h3 className="luxury-font" style={{ fontSize: '1.4rem' }}>{m.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                                        <Star size={16} fill="var(--accent-gold)" /> {m.rating}
                                    </div>
                                </div>
                                <p style={{ color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem' }}>{m.specialty}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                    <MapPin size={16} /> {m.location}
                                </div>
                                    <button 
                                        onClick={() => onBook(m.name)}
                                        className="btn-gold" 
                                        style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        <Phone size={18} /> BOOK SERVICES
                                    </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </motion.div>
    );
};
