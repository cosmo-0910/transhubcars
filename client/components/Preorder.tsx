import { Inventory } from './Inventory';
import type { Car } from '../../shared/lib/db';
import { Award, DollarSign, Sparkles } from 'lucide-react';

export const Preorder = ({ onInquiry }: { onInquiry: (car: Car) => void }) => {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen">
      
      {/* Hero Header */}
      <header className="relative min-h-[70vh] flex items-end pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-deep-charcoal via-deep-charcoal/80 to-transparent z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
          <img 
            className="w-full h-full object-cover opacity-40" 
            src="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop" 
            alt="Futuristic Supercar"
          />
        </div>
        <div className="relative z-20 px-4 md:px-margin-desktop max-w-container-max mx-auto w-full text-left">
          <div className="max-w-2xl">
            <span className="text-label-caps font-label-caps text-luxury-gold mb-3 block tracking-[0.3em]">
              RESERVE THE FUTURE
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display-lg text-on-surface mb-6 font-bold leading-[1.1]">
              Elegance, <br />
              <span className="text-luxury-gold">Before Arrival.</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-on-surface-variant mb-10 max-w-lg leading-relaxed">
              Secure your position in the future of automotive excellence. Our curated selection of upcoming luxury releases offers unprecedented performance and craftsmanship.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area (Preorders Showroom) */}
      <main className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-20 lg:py-32">
        <Inventory 
          onInquiry={onInquiry}
          initialStatus="Preorder"
          hideFilters={true}
          title="Upcoming Allocations"
        />
      </main>

      {/* Why Preorder Benefits Section */}
      <section className="bg-surface-container-low py-20 lg:py-32 border-t border-glass-border">
        <div className="px-4 md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          
          <div className="space-y-4">
            <div className="w-16 h-16 bg-luxury-gold/10 text-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Award size={28} />
            </div>
            <h3 className="font-headline-md text-xl font-bold text-on-surface">Guaranteed Allocation</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Secure your spot for highly limited production runs before they reach the general showroom floor.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-16 h-16 bg-luxury-gold/10 text-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign size={28} />
            </div>
            <h3 className="font-headline-md text-xl font-bold text-on-surface">Locked-In Pricing</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Protect yourself from market fluctuations and dealer markups with our transparent preorder pricing models.
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-16 h-16 bg-luxury-gold/10 text-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles size={28} />
            </div>
            <h3 className="font-headline-md text-xl font-bold text-on-surface">Early Access Perks</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Preorder clients receive invitations to private unveilings and exclusive test-drive events across the globe.
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
