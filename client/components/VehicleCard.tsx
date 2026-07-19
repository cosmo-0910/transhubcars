import { motion } from 'framer-motion';
import { MessageSquare, Heart, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../shared/lib/formatters';
import type { Car } from '../../shared/lib/db';

export const VehicleCard = ({ car, onInquiry }: { car: Car, onInquiry: (car: Car) => void }) => {
  const isAvail = car.status === 'Readily Available';

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => window.dispatchEvent(new CustomEvent('select-car', { detail: { car } }))}
      className="glass-card group cursor-pointer overflow-hidden rounded-xl text-left flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-black flex-shrink-0">
        <img 
          src={car.image_url} 
          alt={`${car.make} ${car.model}`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          {car.is_pinned && (
            <span className="bg-luxury-gold text-black font-label-caps text-[9px] px-2.5 py-1 rounded font-bold shadow-lg shadow-luxury-gold/20">
              PINNED
            </span>
          )}
          <span className="bg-primary text-on-primary text-[9px] font-bold px-2.5 py-1 rounded">
            VERIFIED
          </span>
          <span className="bg-deep-charcoal/60 backdrop-blur-md text-on-surface text-[9px] font-bold px-2.5 py-1 rounded border border-glass-border">
            {isAvail ? 'AVAILABLE' : 'PREORDER'}
          </span>
        </div>

        {/* Favorite Heart Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            // Optional: add to favorites
          }}
          className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/60 border border-glass-border flex items-center justify-center text-on-surface hover:text-luxury-gold transition-colors z-10"
        >
          <Heart size={15} />
        </button>
      </div>

      {/* Details Area */}
      <div className="p-6 flex flex-col flex-grow bg-surface-container/10">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-[10px] text-on-surface-variant font-bold tracking-wider mb-1.5">
            <span>{car.year}</span>
            <span>•</span>
            <span className="uppercase">{car.condition || 'Foreign Used'}</span>
            {car.state && (
              <>
                <span>•</span>
                <span className="uppercase">{car.state}</span>
              </>
            )}
          </div>
          <h3 className="text-lg font-bold text-on-surface font-headline-md truncate">
            {car.make} {car.model}
          </h3>
        </div>

        {/* Specs Row */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-glass-border text-xs mb-6">
          <div>
            <div className="text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold mb-0.5">MILEAGE</div>
            <div className="font-bold text-on-surface">{car.mileage ? `${(car.mileage / 1000).toFixed(0)}K KM` : 'BRAND NEW'}</div>
          </div>
          <div>
            <div className="text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold mb-0.5">BODY TYPE</div>
            <div className="font-bold text-on-surface truncate">{car.body_type ? car.body_type.toUpperCase() : 'COUPE'}</div>
          </div>
          <div>
            <div className="text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold mb-0.5">TRANS</div>
            <div className="font-bold text-on-surface">{car.transmission ? car.transmission.slice(0, 3).toUpperCase() : 'AUT'}</div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-between items-center mt-auto">
          <div>
            <div className="text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold mb-0.5">INVESTMENT</div>
            <div className="text-lg font-bold text-luxury-gold tracking-tight">
              {car.original_price && car.original_price > car.price && (
                <span className="line-through text-on-surface-variant text-xs mr-1.5 font-normal">
                  {formatPrice(car.original_price)}
                </span>
              )}
              {formatPrice(car.price)}
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              className="w-9 h-9 rounded bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold flex items-center justify-center hover:bg-luxury-gold hover:text-black transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                window.dispatchEvent(new CustomEvent('open-chat', {
                  detail: {
                    carId: car.id,
                    vendorId: car.vendor_id || null,
                    autoSendMessage: true
                  }
                }));
              }}
              title="Message Vendor"
            >
              <MessageSquare size={14} />
            </button>
            <button 
              className="bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold px-4 py-1.5 rounded text-xs font-bold hover:bg-luxury-gold hover:text-black transition-all flex items-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onInquiry(car);
              }}
            >
              DETAILS <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
