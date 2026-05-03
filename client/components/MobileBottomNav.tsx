import { Home, PlusCircle, MessageSquare, User, Layers, ShieldCheck, LayoutGrid } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileBottomNavProps {
  currentView: 'home' | 'inventory' | 'messages' | 'profile' | 'sell' | 'collections' | 'brands' | 'categories';
  onViewChange: (view: any) => void;
  messageCount?: number;
}

export const MobileBottomNav = ({ currentView, onViewChange, messageCount = 3 }: MobileBottomNavProps) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'brands', label: 'Brands', icon: ShieldCheck },
    { id: 'collections', label: 'Collections', icon: Layers },
    { id: 'sell', label: 'Sell', icon: PlusCircle, isFloating: true },
    { id: 'categories', label: 'By Body', icon: LayoutGrid },
    { id: 'messages', label: 'Chat', icon: MessageSquare, badge: messageCount },
    { id: 'profile', label: 'Me', icon: User },
  ];

  return (
    <div className="mobile-bottom-nav">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;

        if (tab.isFloating) {
          return (
            <button
              key={tab.id}
              className="bottom-nav-floating"
              onClick={() => onViewChange(tab.id)}
            >
              <div className="floating-inner">
                <Icon size={28} />
              </div>
              <span className="tab-label">{tab.label}</span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            className={`bottom-nav-tab ${isActive ? 'active' : ''}`}
            onClick={() => onViewChange(tab.id)}
          >
            <div className="icon-container">
              <Icon size={22} />
              {tab.badge && tab.badge > 0 && (
                <span className="badge">{tab.badge}</span>
              )}
            </div>
            <span className="tab-label">{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="active-indicator"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
