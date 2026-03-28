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
  Search, 
  CarFront,
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutDashboard,
  ShoppingBag,
  Settings,
  LogOut,
  Store,
  TrendingUp,
  DollarSign,
  Package,
  ArrowRight,
  Eye,
  Trash2,
  Edit,
  Menu,
  X
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
      case 'approved': return '#4ade80';
      case 'pending': return '#eab308';
      case 'rejected': return '#ef4444';
      default: return 'var(--text-muted)';
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
    <div className="logo-grid-bg dashboard-container">
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-deep)', zIndex: -2 }}></div>
      
      {/* Mobile Toggle */}
      <div className="mobile-only-flex" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 3000 }}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="glass" 
          style={{ width: '56px', height: '56px', borderRadius: '50%', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.div
        className={`dashboard-sidebar ${isSidebarOpen ? 'mobile-sidebar-open' : ''}`}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        style={{
          width: '280px',
          background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(10,10,10,0.98) 100%)',
          borderRight: '1px solid var(--border-glass)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 2000
        }}
      >
        {/* Logo */}
        <div style={{ padding: '0 2rem', marginBottom: '3rem' }}>
          <img src="/logo.png" alt="Transhub Logo" style={{ height: '32px', width: 'auto', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)' }}>
            {profile?.vendor_type === 'parts' ? 'PARTS HUB' : 'VENDOR PORTAL'}
          </div>
        </div>

        {/* Vendor Info */}
        <div className="glass" style={{ margin: '0 1rem 2rem 1rem', padding: '1.5rem', borderRadius: '1rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            BUSINESS
          </div>
          <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>
            {profile?.business_name || 'Unnamed Business'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {profile?.full_name}
          </div>
        </div>

        {/* Upgrade Banner — hidden for parts-only vendors */}
        {profile?.vendor_type !== 'parts' && profile?.preorder_status !== 'approved' && (
          <div style={{ margin: '0 1rem 2rem 1rem' }}>
             <button 
               onClick={() => setShowUpgradeModal(true)}
               disabled={profile?.preorder_status === 'pending'}
               className="glass-hover"
               style={{ width: '100%', padding: '1rem', borderRadius: '1rem', background: 'linear-gradient(45deg, rgba(212, 175, 55, 0.1), rgba(0,0,0,0))', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', textAlign: 'left', cursor: profile?.preorder_status === 'pending' ? 'default' : 'pointer' }}
             >
               <div style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 {profile?.preorder_status === 'pending' ? <Clock size={14} /> : <Store size={14} />}
                 {profile?.preorder_status === 'pending' ? 'REVIEW IN PROGRESS' : 'UNLOCK PREORDERS'}
               </div>
               <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                 {profile?.preorder_status === 'pending' ? 'Applications under review.' : 'Verify store for preorder access.'}
               </div>
             </button>
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 1rem' }}>
          {[
            { id: 'inventory', icon: profile?.vendor_type === 'parts' ? Package : CarFront, label: 'Inventory' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders' },
            { id: 'analytics', icon: TrendingUp, label: 'Analytics' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              style={{
                width: '100%',
                padding: '1rem',
                marginBottom: '0.5rem',
                background: activeSection === item.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                border: activeSection === item.id ? '1px solid var(--accent-gold)' : '1px solid transparent',
                borderRadius: '0.8rem',
                color: activeSection === item.id ? 'var(--accent-gold)' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.9rem',
                transition: 'all 0.2s'
              }}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: '0 1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ThemeToggle />
          </div>
          <button
            onClick={signOut}
            style={{
              width: '100%',
              padding: '1rem',
              background: 'transparent',
              border: '1px solid transparent',
              borderRadius: '0.8rem',
              color: '#ef4444',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.9rem'
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </motion.div>
      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-glass)', background: 'rgba(0,0,0,0.4)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
          <div className="responsive-flex-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="luxury-font" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {activeSection === 'inventory' && (profile?.vendor_type === 'parts' ? 'Parts Catalog' : 'Inventory Management')}
                {activeSection === 'orders' && 'Order Control'}
                {activeSection === 'analytics' && 'Strategic Intelligence'}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {activeSection === 'inventory' && (profile?.vendor_type === 'parts' ? `${parts.length} components listed` : `${cars.length} assets under management`)}
                {activeSection === 'orders' && `${orders.length} transaction records`}
                {activeSection === 'analytics' && 'Real-time performance metrics'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <NotificationInbox />
              {activeSection === 'inventory' && (
                <button 
                  onClick={() => { 
                    if (activeInventoryType === 'cars') {
                      setEditingCar(null); 
                    } else {
                      setEditingPart(null);
                    }
                    setShowAddModal(true); 
                  }}
                  className="btn-gold" 
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 2rem' }}
                >
                  <Plus size={18} />
                  {activeInventoryType === 'cars' ? 'ADD ASSET' : 'ADD PART'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        <ChatSystem />

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {activeSection === 'inventory' && (
            <>
              {/* Toolbar */}
              <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <SearchAutocomplete 
                  placeholder={activeInventoryType === 'cars' ? "Search by model, VIN or stock number..." : "Search parts by name or vehicle..."}
                  onSearch={setSearchQuery}
                  style={{ flex: 1 }}
                />

                {profile?.vendor_type === 'both' && (
                  <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '0.3rem', borderRadius: '0.8rem', border: '1px solid var(--border-glass)' }}>
                    <button 
                      onClick={() => setActiveInventoryType('cars')}
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '0.6rem', border: 'none', background: activeInventoryType === 'cars' ? 'var(--accent-gold)' : 'transparent', color: activeInventoryType === 'cars' ? 'black' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                    >VEHICLES</button>
                    <button 
                      onClick={() => setActiveInventoryType('parts')}
                      style={{ padding: '0.6rem 1.2rem', borderRadius: '0.6rem', border: 'none', background: activeInventoryType === 'parts' ? 'var(--accent-gold)' : 'transparent', color: activeInventoryType === 'parts' ? 'black' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                    >SPARE PARTS</button>
                  </div>
                )}

                {activeInventoryType === 'cars' && (
                  <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem', borderRadius: '0.8rem', border: '1px solid var(--border-glass)' }}>
                    {['all', 'approved', 'pending', 'rejected'].map(s => (
                      <button 
                        key={s}
                        onClick={() => setFilter(s)}
                        style={{ padding: '0.6rem 1.2rem', borderRadius: '0.6rem', border: 'none', background: filter === s ? 'var(--accent-gold)' : 'transparent', color: filter === s ? 'black' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {loading ? (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>SYNCHRONIZING...</div>
              ) : (activeInventoryType === 'cars' ? filteredCars : filteredParts).length === 0 ? (
                <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', opacity: 0.5 }}>
                  {activeInventoryType === 'cars' ? <CarFront size={48} /> : <Package size={48} />}
                  <p>No {activeInventoryType} found in the selected category.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {activeInventoryType === 'cars' ? (
                    filteredCars.map(car => (
                      <motion.div 
                        key={car.id} 
                        layout
                        className="glass-hover" 
                        style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1.2rem', overflow: 'hidden', border: '1px solid var(--border-glass)' }}
                      >
                        <div style={{ height: '180px', background: 'black', position: 'relative' }}>
                          <img src={car.image_url} alt={car.model} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                          <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.3rem 0.8rem', borderRadius: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: `1px solid ${getStatusColor(car.approval_status || 'pending')}`, color: getStatusColor(car.approval_status || 'pending'), fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            {car.approval_status === 'approved' ? <CheckCircle2 size={12} /> : car.approval_status === 'rejected' ? <AlertCircle size={12} /> : <Clock size={12} />}
                            {car.approval_status || 'pending'}
                          </div>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{car.year} {car.make} {car.model}</div>
                          <div style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>{formatPrice(car.price)}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Clock size={14} /> {car.mileage.toLocaleString()} mi</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><ArrowRight size={14} /> Details</span>
                          </div>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '1rem' }}>
                          <button 
                            onClick={() => { setEditingCar(car); setShowAddModal(true); }}
                            style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                          >
                            <Edit size={14} /> EDIT
                          </button>
                          <button 
                            onClick={() => handleDeleteCar(car.id)}
                            style={{ flex: 1, padding: '0.6rem', background: 'rgba(239, 68, 68, 0.05)', border: 'none', borderRadius: '0.5rem', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                          >
                            <Trash2 size={14} /> DELETE
                          </button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    filteredParts.map(part => (
                      <motion.div 
                        key={part.id} 
                        layout
                        className="glass-hover" 
                        style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '1.2rem', overflow: 'hidden', border: '1px solid var(--border-glass)' }}
                      >
                        <div style={{ height: '180px', background: 'black', position: 'relative' }}>
                          <img src={part.image_url} alt={part.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                          <div style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.3rem 0.8rem', borderRadius: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid #4ade80', color: '#4ade80', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            {part.status.toUpperCase()}
                          </div>
                        </div>
                        <div style={{ padding: '1.5rem' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{part.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{part.vehicle_make} {part.vehicle_model} ({part.vehicle_year})</div>
                          <div style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>{formatPrice(part.price)}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <span>Qty: {part.stock_quantity}</span>
                            <span>{part.condition}</span>
                          </div>
                        </div>
                        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-glass)', display: 'flex', gap: '1rem' }}>
                          <button 
                            onClick={() => { setEditingPart(part); setShowAddModal(true); }}
                            style={{ flex: 1, padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '0.5rem', color: 'white', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                          >
                            <Edit size={14} /> EDIT
                          </button>
                          <button 
                            onClick={() => handleDeletePart(part.id)}
                            style={{ flex: 1, padding: '0.6rem', background: 'rgba(239, 68, 68, 0.05)', border: 'none', borderRadius: '0.5rem', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                          >
                            <Trash2 size={14} /> DELETE
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

          {activeSection === 'analytics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div className="responsive-grid-4">
                <KpiCard title="TOTAL REVENUE" value={formatPrice(stats.totalEarnings)} icon={DollarSign} color="var(--accent-gold)" />
                <KpiCard title="ACTIVE ASSETS" value={stats.activeListings} icon={CarFront} color="#4ade80" />
                <KpiCard title="TOTAL SALES" value={stats.totalSales} icon={ShoppingBag} color="white" />
                <KpiCard title="AWAITING APPR." value={stats.pendingApprovals} icon={Clock} color="#eab308" />
              </div>

              <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>Sales Distribution</h3>
                <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border-glass)', borderRadius: '1rem' }}>
                  Visualization engine initializing...
                </div>
              </div>
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="glass responsive-table-wrapper" style={{ borderRadius: '1.5rem' }}>
              <table style={{ minWidth: '800px', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-glass)' }}>
                    <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>ORDER ID</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>VEHICLE</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>AMOUNT</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>STATUS</th>
                    <th style={{ padding: '1.2rem', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)' }}>DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>No completed transactions.</td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '1.2rem', fontSize: '0.9rem' }}>#{order.id.slice(0, 8)}</td>
                        <td style={{ padding: '1.2rem' }}>
                          <div style={{ fontWeight: 600 }}>{order.cars?.year} {order.cars?.make} {order.cars?.model}</div>
                        </td>
                        <td style={{ padding: '1.2rem', color: 'var(--accent-gold)', fontWeight: 600 }}>{formatPrice(order.amount)}</td>
                        <td style={{ padding: '1.2rem' }}>
                          <span style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.05)', fontSize: '0.75rem', fontWeight: 600 }}>
                            {order.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '1.2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
              window.location.reload(); // Refresh to update profile status
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  return (
    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1.2rem', border: '1px solid var(--border-glass)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--text-muted)' }}>{title}</span>
        <Icon size={16} color={color} />
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, color: color }}>{value}</div>
    </div>
  );
}
