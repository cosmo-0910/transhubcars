import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Truck, ChevronLeft, Star, Phone, MapPin, CheckCircle } from 'lucide-react';
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
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      
      <AnimatePresence mode="wait">
        
        {/* Main Services Hub */}
        {view === 'hub' && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="w-full text-left"
          >
            {/* Hero Section */}
            <section className="relative h-[480px] flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 z-0">
                <div className="w-full h-full bg-cover bg-center opacity-30" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=2070&auto=format&fit=crop')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-deep-charcoal via-deep-charcoal/60 to-transparent z-10"></div>
              </div>
              <div className="relative z-10 text-center px-4 max-w-3xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-headline-lg font-bold text-luxury-gold mb-4 leading-tight">
                  Elite Automotive Services
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-on-surface-variant font-body-lg max-w-xl mx-auto leading-relaxed">
                  Precision, transparency, and exclusivity. Discover how Transhub redefines the luxury car acquisition and ownership experience.
                </p>
              </div>
            </section>

            {/* Bento Grid Services */}
            <section className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-20 lg:py-32">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* Genuine Parts card - Large Feature */}
                <div className="md:col-span-8 glass-card rounded-xl overflow-hidden flex flex-col md:flex-row group text-left">
                  <div className="w-full md:w-1/2 h-64 md:h-auto relative overflow-hidden bg-black">
                    <img 
                      src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=2072&auto=format&fit=crop" 
                      alt="Mechanic Parts" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                    />
                  </div>
                  <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
                    <span className="text-label-caps font-label-caps text-luxury-gold text-[10px] tracking-wider mb-2 block font-bold">
                      GENUINE COMPONENTS
                    </span>
                    <h2 className="text-2xl font-headline-lg font-bold mb-4">Spare Parts Marketplace</h2>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                      Access high-performance, original manufacturer (OEM) components for elite automotive brands. Query parts catalog or order bespoke parts sourcing.
                    </p>
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setView('parts')}
                        className="bg-luxury-gold text-deep-charcoal px-6 py-2.5 rounded font-label-caps text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
                      >
                        Browse Parts
                      </button>
                      <button 
                        onClick={() => { setView('parts'); setPartsView('request'); }}
                        className="text-luxury-gold font-label-caps text-xs font-bold hover:underline flex items-center gap-1.5"
                      >
                        Request Sourcing <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Emergency Towing Recovery card - Medium Feature */}
                <div className="md:col-span-4 glass-card rounded-xl overflow-hidden flex flex-col group text-left">
                  <div className="h-48 relative overflow-hidden bg-black">
                    <img 
                      src="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?q=80&w=2074&auto=format&fit=crop" 
                      alt="Towing" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                    />
                  </div>
                  <div className="p-8 flex-grow flex flex-col">
                    <span className="text-label-caps font-label-caps text-luxury-gold text-[10px] tracking-wider mb-2 block font-bold">
                      ROAD LOGISTICS
                    </span>
                    <h2 className="text-xl font-headline-lg font-bold mb-3">Towing Recovery</h2>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                      Emergency recovery and high-value transport logistics. Map online dispatch drivers and request rapid enclosed truck towing directly from your device.
                    </p>
                    <button 
                      onClick={isTowingEnabled ? () => setView('tow') : undefined}
                      disabled={!isTowingEnabled}
                      className="w-full mt-auto border border-luxury-gold text-luxury-gold px-6 py-2.5 rounded font-label-caps text-xs font-bold hover:bg-luxury-gold/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {isTowingEnabled ? 'Book Tow Truck' : 'TEMPORARILY OFFLINE'}
                    </button>
                  </div>
                </div>

                {/* Certified Workshops card - Wide Feature */}
                <div className="md:col-span-12 glass-card rounded-xl overflow-hidden flex flex-col md:flex-row group text-left">
                  <div className="w-full md:w-5/12 h-64 md:h-auto relative overflow-hidden bg-black">
                    <img 
                      src="https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?q=80&w=2074&auto=format&fit=crop" 
                      alt="Workshop" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
                    />
                  </div>
                  <div className="w-full md:w-7/12 p-8 flex flex-col justify-center">
                    <span className="text-label-caps font-label-caps text-luxury-gold text-[10px] tracking-wider mb-2 block font-bold">
                      TECHNICAL MASTERY
                    </span>
                    <h2 className="text-2xl font-headline-lg font-bold mb-4">Certified Workshops</h2>
                    <p className="text-xs text-on-surface-variant leading-relaxed mb-6">
                      Protect your asset with inspected mechanics certified by Transhub. Master technicians handle standard valuations, engine repairs, body works, and diagnostics.
                    </p>
                    <button 
                      onClick={() => setView('mechanics')}
                      className="bg-luxury-gold text-deep-charcoal px-8 py-3 rounded font-label-caps text-xs font-bold hover:brightness-110 active:scale-95 transition-all w-fit"
                    >
                      Book Certified Workshop
                    </button>
                  </div>
                </div>

              </div>
            </section>
          </motion.div>
        )}

        {/* Spare Parts Page */}
        {view === 'parts' && (
          <motion.div
            key="parts"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-28 text-left"
          >
            <button 
              onClick={() => setView('hub')} 
              className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-luxury-gold mb-8 uppercase tracking-widest"
            >
              <ChevronLeft size={16} /> BACK TO CONCIERGE
            </button>
            
            {partsView === 'marketplace' ? (
              <SparePartsMarketplace onSourcingRequest={() => setPartsView('request')} />
            ) : (
              <SparePartsForm onBack={() => setPartsView('marketplace')} userId={profile?.id || 'guest'} hideBackButton />
            )}
          </motion.div>
        )}

        {/* Tow Truck Form */}
        {view === 'tow' && (
          <motion.div
            key="tow"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-28 text-left"
          >
            <TowTruckForm onBack={() => setView('hub')} userId={profile?.id || 'guest'} />
          </motion.div>
        )}

        {/* Mechanics List */}
        {view === 'mechanics' && (
          <motion.div
            key="mechanics"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-28 text-left"
          >
            <MechanicsList 
              onBack={() => setView('hub')} 
              onBook={(name) => setShowInquiry({ type: 'Purchase', carName: `Service: ${name}` })}
            />
          </motion.div>
        )}

      </AnimatePresence>

      <AnimatePresence>
        {showInquiry && (
          <div className="fixed inset-0 z-[10000] z-index-mobile-overlay bg-black/85 backdrop-blur-md flex justify-center items-start p-4 overflow-y-auto pt-20">
            <InquiryForm 
              type={showInquiry.type} 
              carName={showInquiry.carName}
              onClose={() => setShowInquiry(null)}
            />
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 rounded-xl max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-luxury-gold/10 text-luxury-gold rounded-full flex items-center justify-center mx-auto">
          <CheckCircle size={36} />
        </div>
        <h2 className="font-headline-lg text-2xl font-bold text-on-surface">Order Submitted</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Our concierge team will source your requested parts and contact you with a quotation shortly.
        </p>
        <button className="bg-luxury-gold text-on-primary px-8 py-3 font-bold rounded-lg text-xs" onClick={onBack}>
          RETURN TO MARKETPLACE
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      {!hideBackButton && (
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-luxury-gold mb-6 uppercase">
          <ChevronLeft size={16} /> BACK TO CONCIERGE
        </button>
      )}
      
      <div className="glass-card p-8 sm:p-12 rounded-2xl text-left border border-glass-border">
        <h2 className="font-headline-lg text-3xl font-bold text-on-surface mb-8">Order Genuine Parts</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Part Name</label>
            <input 
              required 
              type="text"
              placeholder="e.g. Porsche PDK Clutches, Carbon Ceramic Pads"
              className="w-full bg-surface border border-glass-border rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none"
              value={form.part_name}
              onChange={e => setForm({...form, part_name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Vehicle Make</label>
              <input 
                required 
                type="text"
                placeholder="e.g. Porsche"
                className="w-full bg-surface border border-glass-border rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none"
                value={form.vehicle_make}
                onChange={e => setForm({...form, vehicle_make: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Vehicle Model</label>
              <input 
                required 
                type="text"
                placeholder="e.g. 911 GT3 RS"
                className="w-full bg-surface border border-glass-border rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none"
                value={form.vehicle_model}
                onChange={e => setForm({...form, vehicle_model: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Year</label>
              <input 
                type="text"
                placeholder="e.g. 2023"
                className="w-full bg-surface border border-glass-border rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none"
                value={form.vehicle_year}
                onChange={e => setForm({...form, vehicle_year: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Quantity</label>
              <input 
                type="number" 
                className="w-full bg-surface border border-glass-border rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none"
                value={form.quantity}
                onChange={e => setForm({...form, quantity: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Additional Details</label>
            <textarea 
              className="w-full bg-surface border border-glass-border rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none min-h-[100px]" 
              placeholder="Provide chassis VIN, part codes, or visual references..."
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
          </div>

          <button 
            type="submit"
            disabled={loading} 
            className="w-full bg-luxury-gold text-on-primary py-4 rounded-lg font-label-caps text-xs font-bold hover:brightness-110 active:scale-[0.99] transition-all"
          >
            {loading ? 'SUBMITTING...' : 'REQUEST PART SOURCING'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

const StyledMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;

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
      if (typeof (window as any).google === 'undefined') {
        setTimeout(initMap, 500);
        return;
      }

      const map = new (window as any).google.maps.Map(mapRef.current!, {
        center: { lat, lng },
        zoom: 15,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#16130b" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#16130b" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#8d8675" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#231f17" }] },
          { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#38342b" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#110e07" }] }
        ],
        disableDefaultUI: true,
        zoomControl: true,
      });

      new (window as any).google.maps.Marker({
        position: { lat, lng },
        map,
        icon: {
          path: (window as any).google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#D4AF37",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
        },
      });
    };

    initMap();
  }, [lat, lng]);

  return <div ref={mapRef} className="w-full h-full min-h-[300px] rounded-xl overflow-hidden border border-glass-border" />;
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
        setForm({ ...form, pickup_address: addr });
        setCoordinates({ lat: latitude, lng: longitude });
        setDetecting(false);
      },
      (error) => {
        console.error(error);
        alert('Unable to retrieve location coordinates.');
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 rounded-xl max-w-xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto">
          <Truck size={36} />
        </div>
        <h2 className="font-headline-lg text-2xl font-bold text-on-surface">Tow Request Dispatched</h2>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Logistics dispatch is connecting with the closest active driver. You will receive real-time SMS tracking updates shortly.
        </p>
        <button className="bg-luxury-gold text-on-primary px-8 py-3 font-bold rounded-lg text-xs" onClick={onBack}>
          RETURN TO HUB
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-luxury-gold mb-6 uppercase">
        <ChevronLeft size={16} /> BACK TO CONCIERGE
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form panel */}
        <div className="lg:col-span-6 glass-card p-8 sm:p-12 rounded-2xl border border-glass-border text-left space-y-8">
          <div>
            <span className="text-label-caps font-label-caps text-luxury-gold text-[10px] tracking-wider mb-2 block font-bold">EMERGENCY ASSISTANCE</span>
            <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Rapid Towing Dispatch</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Pickup Location</label>
                <button 
                  type="button" 
                  onClick={detectLocation}
                  className="text-xs font-bold text-luxury-gold hover:underline flex items-center gap-1"
                >
                  <MapPin size={12} />
                  {detecting ? 'GPS Sync...' : 'Auto-Detect Address'}
                </button>
              </div>
              <input 
                required 
                type="text"
                placeholder="Enter current coordinate address..."
                className="w-full bg-surface border border-glass-border rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none"
                value={form.pickup_address}
                onChange={(e) => setForm({ ...form, pickup_address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Destination Address</label>
              <input 
                type="text"
                placeholder="Where should we deliver the vehicle?"
                className="w-full bg-surface border border-glass-border rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none"
                value={form.destination_address}
                onChange={e => setForm({ ...form, destination_address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Vehicle Model Type</label>
              <input 
                required
                type="text"
                placeholder="e.g. SUV, Coupe, Sports Car"
                className="w-full bg-surface border border-glass-border rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none"
                value={form.vehicle_type}
                onChange={e => setForm({ ...form, vehicle_type: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Notes for Dispatcher</label>
              <textarea 
                className="w-full bg-surface border border-glass-border rounded-lg px-4 py-3 text-sm text-on-surface focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold outline-none min-h-[80px]" 
                placeholder="List transmission lock statuses, vehicle color, etc..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <button 
              type="submit"
              disabled={loading} 
              className="w-full bg-luxury-gold text-on-primary py-4 rounded-lg font-label-caps text-xs font-bold hover:brightness-110 active:scale-[0.99] transition-all"
            >
              {loading ? 'LOCATING NEAREST TRUCK...' : 'DISPATCH TOW TRUCK'}
            </button>
          </form>
        </div>

        {/* Maps panel */}
        <div className="lg:col-span-6 h-[450px] lg:h-[600px] flex flex-col">
          {coordinates ? (
            <StyledMap lat={coordinates.lat} lng={coordinates.lng} />
          ) : (
            <div className="glass-card rounded-2xl flex-grow flex flex-col items-center justify-center p-8 text-center border border-glass-border text-on-surface-variant">
              <MapPin size={40} className="text-luxury-gold/50 mb-4" />
              <h3 className="font-bold text-on-surface">Visual GPS Grid</h3>
              <p className="text-xs max-w-xs mx-auto mt-2 leading-relaxed">
                Connect GPS locator to map nearest dispatch networks and estimate time-of-arrival routes.
              </p>
              <button 
                onClick={detectLocation}
                className="border border-luxury-gold text-luxury-gold px-6 py-2 rounded-lg text-xs font-bold hover:bg-luxury-gold/10 mt-6"
              >
                CONNECT NOW
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-on-surface-variant hover:text-luxury-gold uppercase">
          <ChevronLeft size={16} /> BACK TO CONCIERGE
        </button>
        
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Certified Partners Only</span>
          <button 
            onClick={() => setOnlyApproved(!onlyApproved)}
            className={`w-12 h-6 rounded-full border border-glass-border relative transition-all ${
              onlyApproved ? 'bg-luxury-gold' : 'bg-surface-container'
            }`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
              onlyApproved ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>
      </div>

      <div>
        <span className="text-label-caps font-label-caps text-luxury-gold text-[10px] tracking-wider mb-2 block font-bold">VETTED MAINTENANCE CENTERS</span>
        <h2 className="font-headline-lg text-3xl font-bold text-on-surface">Certified Workshops</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="glass-card animate-pulse h-80 rounded-xl bg-surface-container" />)
        ) : (
          mechanics.map(m => (
            <div key={m.id} className="glass-card rounded-xl overflow-hidden flex flex-col text-left border border-glass-border">
              <div className="height-48 relative overflow-hidden bg-black h-48 flex-shrink-0">
                <img src={m.image_url} alt={m.name} className="w-full h-full object-cover" />
                {m.is_approved && (
                  <span className="absolute top-4 right-4 bg-deep-charcoal text-luxury-gold px-3 py-1.5 rounded-full text-[9px] font-bold border border-luxury-gold flex items-center gap-1 shadow-lg shadow-black/30">
                    <CheckCircle size={12} /> CERTIFIED
                  </span>
                )}
              </div>
              <div className="p-6 flex flex-col flex-grow bg-surface-container/5">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-headline-md text-lg font-bold text-on-surface truncate">{m.name}</h3>
                  <div className="flex items-center gap-1 text-luxury-gold text-sm font-bold flex-shrink-0">
                    <Star size={14} className="fill-luxury-gold text-luxury-gold" />
                    <span>{m.rating}</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-luxury-gold uppercase tracking-wider mb-2">{m.specialty}</p>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-6">
                  <MapPin size={14} className="text-luxury-gold" />
                  <span className="truncate">{m.location}</span>
                </div>
                <button 
                  onClick={() => onBook(m.name)}
                  className="bg-luxury-gold text-on-primary w-full py-3 rounded font-label-caps text-xs font-bold hover:brightness-110 active:scale-95 transition-all mt-auto flex items-center justify-center gap-2"
                >
                  <Phone size={14} />
                  <span>BOOK MAINTENANCE</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
