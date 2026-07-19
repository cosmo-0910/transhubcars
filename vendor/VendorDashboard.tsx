import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { db, type Car, type Order, type SparePart } from '../shared/lib/db';
import { formatPrice } from '../shared/lib/formatters';
import { useAuth } from '../shared/lib/AuthContext';
import SearchAutocomplete from '../shared/components/SearchAutocomplete';
import AddCarModal from './components/AddCarModal';
import AddPartModal from './components/AddPartModal';
import UpgradeToPreorderModal from './components/UpgradeToPreorderModal';
import { 
  Plus, 
  CarFront,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShoppingBag,
  LogOut,
  Store,
  TrendingUp,
  DollarSign,
  Package,
  ArrowRight,
  Trash2,
  Edit,
  Menu,
  X,
  User,
  MessageSquare
} from 'lucide-react';
import { ThemeToggle } from '../shared/components/ThemeToggle';
import { useAlert } from '../shared/context/AlertContext';
import { NotificationInbox } from '../shared/components/NotificationInbox';
import { ChatSystem } from '../shared/components/ChatSystem';

export default function VendorDashboard() {
  const { user, profile, signOut } = useAuth();
  const { showAlert } = useAlert();
  const [cars, setCars] = useState<Car[]>([]);
  const [parts, setParts] = useState<SparePart[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeListings: 0,
    totalSales: 0,
    pendingApprovals: 0
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [activeSection, setActiveSection] = useState('inventory');
  const [activeInventoryType, setActiveInventoryType] = useState<'cars' | 'parts'>('cars');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (profile?.vendor_type === 'parts') {
      setActiveInventoryType('parts');
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [inventory, spareParts, vendorOrders, vendorStats] = await Promise.all([
        db.getVendorCars(user.id),
        db.getVendorSpareParts(user.id),
        db.getOrdersForVendor(user.id),
        db.getVendorStats(user.id)
      ]);
      
      setCars(inventory);
      setParts(spareParts);
      setOrders(vendorOrders);
      setStats(vendorStats);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCar = async (id: string) => {
    showAlert({
      title: 'Decommission Asset',
      message: 'Are you sure you want to permanently remove this vehicle from your inventory?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await db.deleteCar(id);
              loadDashboardData();
              showAlert({ title: 'Success', message: 'Asset successfully decommissioned.' });
            } catch (err) {
              showAlert({
                title: 'Operation Failed',
                message: 'Failed to delete asset from the inventory.',
                buttons: [{ text: 'OK', style: 'destructive' }]
              });
            }
          }
        }
      ]
    });
  };

  const handleDeletePart = async (id: string) => {
    showAlert({
      title: 'Remove Part',
      message: 'Are you sure you want to permanently remove this component from your inventory?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await db.deleteSparePart(id);
              loadDashboardData();
              showAlert({ title: 'Success', message: 'Component successfully removed.' });
            } catch (err) {
              showAlert({
                title: 'Operation Failed',
                message: 'Failed to delete the component.',
                buttons: [{ text: 'OK', style: 'destructive' }]
              });
            }
          }
        }
      ]
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 border-green-500/20 bg-green-500/10';
      case 'pending': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10';
      case 'rejected': return 'text-red-400 border-red-500/20 bg-red-500/10';
      default: return 'text-on-surface-variant border-glass-border/40';
    }
  };

  const filteredCars = cars.filter(car => {
    const matchesFilter = filter === 'all' || (car.approval_status || 'pending') === filter;
    const matchesSearch = `${car.make} ${car.model} ${car.vin || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredParts = parts.filter(part => {
    const matchesSearch = `${part.name} ${part.vehicle_make} ${part.vehicle_model}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col md:flex-row text-left font-body-md">
      
      {/* Mobile Sidebar Hamburger Toggle */}
      <div className="md:hidden fixed bottom-6 right-6 z-[1000]">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-14 h-14 rounded-full bg-black/90 border border-luxury-gold text-luxury-gold flex items-center justify-center shadow-lg shadow-luxury-gold/20"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Left Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:sticky top-0 left-0 h-screen w-72 bg-deep-charcoal border-r border-glass-border p-6 flex flex-col justify-between transition-transform duration-300 z-[999]`}
      >
        <div className="space-y-8">
          {/* Logo Header */}
          <div>
            <span className="font-bold text-luxury-gold tracking-wider text-lg">Transhub</span>
            <span className="text-[9px] font-label-caps font-bold tracking-widest text-on-surface-variant block mt-0.5">
              {profile?.vendor_type === 'parts' ? 'PARTS HUB REGISTRY' : 'EXECUTIVE MERCHANT'}
            </span>
          </div>

          {/* User profile business identity */}
          <div className="glass-card p-4 rounded-xl flex gap-3 items-center bg-surface-container/20 border border-glass-border">
            <div className="w-10 h-10 rounded-full border border-luxury-gold overflow-hidden bg-black/40">
              <img 
                src={profile?.avatar_url || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=200"} 
                className="w-full h-full object-cover" 
                alt=""
              />
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-on-surface truncate">{profile?.business_name || 'Dealer'}</h4>
              <p className="text-[9px] text-on-surface-variant">{profile?.full_name}</p>
            </div>
          </div>

          {/* Upgrade Preorders Option */}
          {profile?.vendor_type !== 'parts' && profile?.preorder_status !== 'approved' && (
            <button 
              onClick={() => setShowUpgradeModal(true)}
              disabled={profile?.preorder_status === 'pending'}
              className="w-full text-left p-4 rounded-xl border border-luxury-gold/30 bg-gradient-to-r from-luxury-gold/5 to-transparent hover:border-luxury-gold transition-colors duration-300 disabled:opacity-60"
            >
              <div className="text-[10px] font-bold text-luxury-gold uppercase tracking-wider flex items-center gap-1.5 mb-1">
                {profile?.preorder_status === 'pending' ? <Clock size={12} /> : <Store size={12} />}
                <span>{profile?.preorder_status === 'pending' ? 'Tier Application Pending' : 'Unlock Preorders'}</span>
              </div>
              <p className="text-[9px] text-on-surface-variant leading-relaxed">
                {profile?.preorder_status === 'pending' ? 'Under verification review.' : 'Verify store credentials.'}
              </p>
            </button>
          )}

          {/* Nav list links */}
          <nav className="space-y-1">
            {[
              { id: 'inventory', icon: profile?.vendor_type === 'parts' ? Package : CarFront, label: 'Asset Inventory' },
              { id: 'orders', icon: ShoppingBag, label: 'Order History' },
              { id: 'analytics', icon: TrendingUp, label: 'Analytics Insights' },
            ].map(item => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveSection(item.id); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-label-caps tracking-wider transition-all ${
                    isActive 
                      ? 'bg-luxury-gold/10 text-luxury-gold border border-luxury-gold/20 font-bold' 
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/20 border border-transparent'
                  }`}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-4 pt-4 border-t border-glass-border/40">
          <div className="flex justify-center"><ThemeToggle /></div>
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-950/15 rounded-lg text-xs font-bold"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col">
        
        {/* Navigation / Page context header */}
        <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-glass-border px-6 py-4 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="font-headline-lg text-2xl font-bold text-on-surface">
              {activeSection === 'inventory' && (profile?.vendor_type === 'parts' ? 'Parts Inventory' : 'Fleet Management')}
              {activeSection === 'orders' && 'Order Receipts'}
              {activeSection === 'analytics' && 'Strategic Analytics'}
            </h2>
            <p className="text-[10px] text-on-surface-variant font-bold tracking-wider uppercase mt-0.5">
              {activeSection === 'inventory' && (profile?.vendor_type === 'parts' ? `${parts.length} Spare Components listed` : `${cars.length} Vehicles listed`)}
              {activeSection === 'orders' && `${orders.length} transaction listings`}
              {activeSection === 'analytics' && 'Executive Performance Metrics'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationInbox />
            {activeSection === 'inventory' && (
              <button 
                onClick={() => { 
                  if (activeInventoryType === 'cars') setEditingCar(null);
                  else setEditingPart(null);
                  setShowAddModal(true); 
                }}
                className="bg-luxury-gold text-on-primary px-5 py-2.5 rounded font-label-caps text-xs font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
              >
                <Plus size={16} />
                <span>{activeInventoryType === 'cars' ? 'LIST VEHICLE' : 'LIST PART'}</span>
              </button>
            )}
          </div>
        </header>

        <ChatSystem />

        {/* Content Body Canvas */}
        <div className="flex-1 p-6 md:p-8 space-y-8">
          
          {activeSection === 'inventory' && (
            <div className="space-y-6">
              
              {/* Toolbar filters */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <SearchAutocomplete 
                  placeholder={activeInventoryType === 'cars' ? "Search fleet by model or VIN..." : "Search parts by name..."}
                  onSearch={setSearchQuery}
                  style={{ flex: 1, height: '40px' }}
                />

                {profile?.vendor_type === 'both' && (
                  <div className="bg-surface border border-glass-border p-1 rounded-lg flex shrink-0">
                    <button 
                      onClick={() => setActiveInventoryType('cars')}
                      className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        activeInventoryType === 'cars' ? 'bg-luxury-gold text-black' : 'text-on-surface-variant'
                      }`}
                    >VEHICLES</button>
                    <button 
                      onClick={() => setActiveInventoryType('parts')}
                      className={`px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        activeInventoryType === 'parts' ? 'bg-luxury-gold text-black' : 'text-on-surface-variant'
                      }`}
                    >PARTS</button>
                  </div>
                )}

                {activeInventoryType === 'cars' && (
                  <div className="bg-surface border border-glass-border p-1 rounded-lg flex shrink-0 gap-1">
                    {['all', 'approved', 'pending', 'rejected'].map(s => (
                      <button 
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          filter === s ? 'bg-luxury-gold text-black' : 'text-on-surface-variant'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Data Grid list */}
              {loading ? (
                <div className="py-20 text-center text-on-surface-variant">SYNCHRONIZING FLEET REGISTRY...</div>
              ) : (activeInventoryType === 'cars' ? filteredCars : filteredParts).length === 0 ? (
                <div className="py-24 text-center glass-card rounded-xl border border-glass-border/60 text-on-surface-variant">
                  <CarFront size={40} className="mx-auto opacity-30 mb-3" />
                  <p className="text-sm">No inventory listings found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {activeInventoryType === 'cars' ? (
                    filteredCars.map(car => (
                      <div key={car.id} className="glass-card rounded-xl overflow-hidden border border-glass-border flex flex-col text-left">
                        <div className="relative aspect-[16/10] bg-black">
                          <img src={car.image_url} alt="" className="w-full h-full object-cover opacity-80" />
                          <span className={`absolute top-4 left-4 px-2.5 py-1 rounded text-[9px] font-bold border uppercase ${getStatusColor(car.approval_status || 'pending')}`}>
                            {car.approval_status || 'pending'}
                          </span>
                        </div>
                        <div className="p-5 flex-grow space-y-1">
                          <h4 className="font-bold text-base text-on-surface">{car.year} {car.make} {car.model}</h4>
                          <p className="text-[10px] text-on-surface-variant font-bold tracking-wider">VIN: {car.vin || 'N/A'}</p>
                          <p className="text-lg font-bold text-luxury-gold pt-2">{formatPrice(car.price)}</p>
                        </div>
                        <div className="p-4 bg-surface-container/10 border-t border-glass-border flex gap-2">
                          <button 
                            onClick={() => { setEditingCar(car); setShowAddModal(true); }}
                            className="flex-1 border border-glass-border hover:bg-surface-variant/40 py-2 rounded text-xs font-bold text-on-surface flex items-center justify-center gap-1"
                          >
                            <Edit size={12} />
                            <span>EDIT</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteCar(car.id)}
                            className="flex-1 bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-900/10 py-2 rounded text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Trash2 size={12} />
                            <span>DELETE</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    filteredParts.map(part => (
                      <div key={part.id} className="glass-card rounded-xl overflow-hidden border border-glass-border flex flex-col text-left">
                        <div className="relative aspect-[16/10] bg-black">
                          <img src={part.image_url} alt="" className="w-full h-full object-cover opacity-80" />
                          <span className="absolute top-4 left-4 bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 rounded text-[9px] font-bold uppercase">
                            {part.status}
                          </span>
                        </div>
                        <div className="p-5 flex-grow space-y-1">
                          <h4 className="font-bold text-base text-on-surface truncate">{part.name}</h4>
                          <p className="text-[10px] text-on-surface-variant font-bold tracking-wider">{part.vehicle_make} {part.vehicle_model}</p>
                          <p className="text-lg font-bold text-luxury-gold pt-2">{formatPrice(part.price)}</p>
                        </div>
                        <div className="p-4 bg-surface-container/10 border-t border-glass-border flex gap-2">
                          <button 
                            onClick={() => { setEditingPart(part); setShowAddModal(true); }}
                            className="flex-1 border border-glass-border hover:bg-surface-variant/40 py-2 rounded text-xs font-bold text-on-surface flex items-center justify-center gap-1"
                          >
                            <Edit size={12} />
                            <span>EDIT</span>
                          </button>
                          <button 
                            onClick={() => handleDeletePart(part.id)}
                            className="flex-1 bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-900/10 py-2 rounded text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Trash2 size={12} />
                            <span>DELETE</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-8">
              {/* KPI metrics row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <KpiMetricCard title="TOTAL ACQUISITION VALUE" value={formatPrice(stats.totalEarnings)} icon={<DollarSign size={18} />} />
                <KpiMetricCard title="ASSETS LISTED" value={stats.activeListings} icon={<CarFront size={18} />} />
                <KpiMetricCard title="COMPLETED DEALS" value={stats.totalSales} icon={<ShoppingBag size={18} />} />
                <KpiMetricCard title="INSPECTIONS PENDING" value={stats.pendingApprovals} icon={<Clock size={18} />} />
              </div>

              {/* Analytical mockup box */}
              <div className="glass-card rounded-xl p-8 border border-glass-border text-center">
                <h3 className="font-headline-md text-lg font-bold text-on-surface mb-6 text-left">Earnings Report Distribution</h3>
                <div className="w-full h-80 rounded-lg bg-surface border border-glass-border flex items-center justify-center text-on-surface-variant">
                  <TrendingUp size={44} className="text-luxury-gold/30 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="glass-card rounded-xl overflow-hidden border border-glass-border">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-glass-border text-[10px] font-label-caps text-on-surface-variant tracking-wider">
                      <th className="p-4 pl-6">ORDER ID</th>
                      <th className="p-4">VEHICLE DETAILS</th>
                      <th className="p-4">TRANSACTION VALUE</th>
                      <th className="p-4">ACQUISITION STATUS</th>
                      <th className="p-4 pr-6">ORDER DATE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-glass-border/30 text-xs">
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-on-surface-variant">No client purchases logged.</td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id} className="hover:bg-surface-variant/10 transition-colors">
                          <td className="p-4 pl-6 font-mono">#{order.id.slice(0, 8).toUpperCase()}</td>
                          <td className="p-4 font-bold text-on-surface">{order.cars?.year} {order.cars?.make} {order.cars?.model}</td>
                          <td className="p-4 font-bold text-luxury-gold">{formatPrice(order.amount)}</td>
                          <td className="p-4">
                            <span className="bg-luxury-gold/10 border border-luxury-gold/30 text-luxury-gold px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider">
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-on-surface-variant">{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      <AnimatePresence>
        {showAddModal && (
          activeInventoryType === 'cars' ? (
            <AddCarModal 
              editingCar={editingCar}
              onClose={() => setShowAddModal(false)}
              onSuccess={() => {
                setShowAddModal(false);
                loadDashboardData();
              }}
            />
          ) : (
            <AddPartModal 
              editingPart={editingPart}
              onClose={() => setShowAddModal(false)}
              onSuccess={() => {
                setShowAddModal(false);
                loadDashboardData();
              }}
            />
          )
        )}
        {showUpgradeModal && (
          <UpgradeToPreorderModal 
            onClose={() => setShowUpgradeModal(false)}
            onSuccess={() => {
              setShowUpgradeModal(false);
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const KpiMetricCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
  <div className="glass-card p-6 rounded-xl border border-glass-border space-y-4">
    <div className="flex justify-between items-center text-on-surface-variant">
      <span className="text-[9px] font-label-caps font-bold tracking-widest uppercase">{title}</span>
      <div className="text-luxury-gold">{icon}</div>
    </div>
    <div className="text-3xl font-bold font-headline-lg text-on-surface tracking-tight">{value}</div>
  </div>
);
