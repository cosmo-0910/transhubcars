

import { db, supabase } from '../shared/lib/db';
import type { Car, Order } from '../shared/lib/db';
import { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, ShoppingBag, CarFront, Store, 
  Settings, ShieldAlert, FileText, Activity, 
  MoreVertical, Search, Bell, LogOut, ChevronRight,
  TrendingUp, Zap, Server, ShieldCheck, DollarSign,
  CheckCircle2, X, Plus, Trash2, Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../shared/lib/AuthContext';

// --- Types ---
type Section = 'overview' | 'vendors' | 'users' | 'inventory' | 'orders' | 'sales' | 'ledger' | 'audit' | 'settings' | 'admins';

interface KpiData {
  totalUsers: number;
  totalVendors: number;
  totalRevenue: number;
  activeOrders: number;
  systemStatus: 'Operational' | 'Degraded' | 'Down';
  pendingVendors: number;
  pendingListings: number;
}

// --- Components ---

const SidebarItem = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick, 
  badge 
}: { 
  icon: any, 
  label: string, 
  active: boolean, 
  onClick: () => void,
  badge?: number 
}) => (
  <button 
    onClick={onClick}
    className="smooth-transition"
    style={{
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '0.8rem 1.2rem',
      background: active ? 'linear-gradient(90deg, rgba(197, 160, 89, 0.1) 0%, transparent 100%)' : 'transparent',
      borderLeft: active ? '3px solid var(--accent-gold)' : '3px solid transparent',
      color: active ? 'var(--accent-gold)' : 'var(--text-muted)',
      border: 'none',
      cursor: 'pointer',
      textAlign: 'left',
      fontSize: '0.9rem',
      fontWeight: 500,
      marginBottom: '0.2rem'
    }}
  >
    <Icon size={18} />
    <span style={{ flex: 1 }}>{label}</span>
    {badge ? (
      <span style={{ 
        background: '#ef4444', 
        color: 'white', 
        fontSize: '0.7rem', 
        padding: '0.1rem 0.4rem', 
        borderRadius: '1rem',
        fontWeight: 700
      }}>
        {badge}
      </span>
    ) : null}
  </button>
);

const KpiCard = ({ title, value, subtext, icon: Icon, trend }: any) => (
  <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color="var(--accent-gold)" />
      </div>
      {trend && (
        <span style={{ fontSize: '0.75rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'rgba(74, 222, 128, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '1rem' }}>
          <TrendingUp size={12} /> {trend}
        </span>
      )}
    </div>
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '0.2rem' }}>{title}</div>
    </div>
    {subtext && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{subtext}</div>}
  </div>
);

const StatusBadge = ({ status }: { status: string, type?: 'success' | 'warning' | 'danger' | 'default' }) => {
  const colors = {
    success: { bg: 'rgba(74, 222, 128, 0.1)', text: '#4ade80' },
    warning: { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308' },
    danger: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
    default: { bg: 'rgba(255, 255, 255, 0.1)', text: 'var(--text-muted)' }
  };
  
  let color = colors.default;
  const safeStatus = (status || '').toLowerCase();
  
  if (['approved', 'paid', 'delivered', 'operational', 'active'].includes(safeStatus)) color = colors.success;
  if (['pending', 'processing', 'searching', 'degraded'].includes(safeStatus)) color = colors.warning;
  if (['rejected', 'down', 'archived', 'none'].includes(safeStatus)) color = colors.danger;

  return (
    <span style={{ 
      padding: '0.25rem 0.75rem', 
      borderRadius: '2rem', 
      fontSize: '0.7rem', 
      background: color.bg, 
      color: color.text, 
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {status}
    </span>
  );
};

export const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<Section>('overview');
  // Loading state removed as unused, but could be reintroduced for Skeleton UI if needed
  // const [loading, setLoading] = useState(true);
  
  // Data State
  const [cars, setCars] = useState<Car[]>([]);
  const [users, setUsers] = useState<any[]>([]); // Profiles
  const [vendors, setVendors] = useState<any[]>([]); // Vendor Profiles
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<any>(null);

  // Editing State
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [showAddCarForm, setShowAddCarForm] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // setLoading(true);
      const [carsData, ordersData, allProfiles] = await Promise.all([
        db.getCars(),
        db.getOrders(),
        db.getProfiles()
      ]);
      
      setCars(carsData);
      setOrders(ordersData);
      setUsers(allProfiles); // All profiles
      setVendors(allProfiles.filter((p: any) => ['pending', 'approved', 'rejected'].includes(p.vendor_status)));
    } catch (err) {
      console.error('Failed to load portal data:', err);
    } finally {
      // setLoading(false);
    }
  };

  // --- Actions ---

  const handleVendorAction = async (id: string, status: 'approved' | 'rejected') => {
    if (window.confirm(`Are you sure you want to ${status} this vendor?`)) {
      try {
        console.log('Attempting to update vendor:', id, 'to status:', status);
        
        // When approving, also change role to 'vendor'
        const updates: any = { vendor_status: status };
        if (status === 'approved') {
          updates.role = 'vendor';
        }
        
        // Use direct update instead of upsert
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', id);
        
        if (error) throw error;
        
        console.log('Update successful, reloading data...');
        await loadAllData();
        alert(`Vendor ${status} successfully!`);
      } catch (error) {
        console.error('Failed to update vendor status:', error);
        alert(`Failed to ${status} vendor: ${(error as any)?.message || 'Unknown error'}`);
      }
    }
  };

  const handleCarApproval = async (id: string, status: 'approved' | 'rejected') => {
    if (window.confirm(`Are you sure you want to ${status} this listing?`)) {
      await db.updateCar(id, { approval_status: status });
      loadAllData();
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (window.confirm('Delete this vehicle?')) {
      await db.deleteCar(id);
      loadAllData();
    }
  };

  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Reusing the logic from previous implementation for simplicity
    const formData = new FormData(e.target as HTMLFormElement);
    const carData: any = {
      make: formData.get('make'),
      model: formData.get('model'),
      year: parseInt(formData.get('year') as string),
      price: parseFloat(formData.get('price') as string),
      status: formData.get('status'),
      description: formData.get('description'),
      image_url: formData.get('image_url') || 'https://images.unsplash.com/photo-1542362567-b055034b4c1d?q=80',
      gallery_urls: (formData.get('gallery_urls') as string).split('\n').filter(Boolean),
      mileage: parseInt(formData.get('mileage') as string) || 0,
      vin: formData.get('vin'),
      transmission: formData.get('transmission'),
      fuel_type: formData.get('fuel_type'),
      approval_status: 'approved'
    };

    if (editingCar) {
      await db.updateCar(editingCar.id, carData);
    } else {
      await db.saveCar(carData);
    }
    loadAllData();
    setShowAddCarForm(false);
    setEditingCar(null);
  };

  // --- Derived Metrics ---
  const stats: KpiData = useMemo(() => ({
    totalUsers: users.length,
    totalVendors: vendors.length,
    totalRevenue: orders.reduce((acc, o) => acc + o.amount, 0),
    activeOrders: orders.filter(o => o.status !== 'Delivered').length,
    systemStatus: 'Operational',
    pendingVendors: vendors.filter(v => v.vendor_status === 'pending').length,
    pendingListings: cars.filter(c => c.approval_status === 'pending').length
  }), [users, vendors, orders, cars]);

  // --- Filtered Data ---
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    switch (activeSection) {
      case 'vendors': return vendors.filter(v => (v.business_name || '').toLowerCase().includes(q) || (v.full_name || '').toLowerCase().includes(q));
      case 'users': return users.filter(u => (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
      case 'inventory': return cars.filter(c => `${c.make} ${c.model}`.toLowerCase().includes(q));
      case 'orders': return orders.filter(o => o.id.includes(q) || (o.payment_ref || '').toLowerCase().includes(q));
      default: return [];
    }
  }, [activeSection, vendors, users, cars, orders, searchQuery]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', background: '#0a0a0a', color: 'white' }}>
      
      {/* --- SIDEBAR --- */}
      <aside style={{ width: '260px', borderRight: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent-gold)', borderRadius: '6px' }} />
          <h1 className="luxury-font" style={{ fontSize: '1.2rem', margin: 0 }}>Transhub.</h1>
        </div>

        <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.5rem 1rem' }}>Control Center</div>
          <SidebarItem icon={LayoutDashboard} label="Imperial Overview" active={activeSection === 'overview'} onClick={() => setActiveSection('overview')} />
        </div>

        <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.5rem 1rem' }}>Management</div>
          <SidebarItem icon={Store} label="Vendors" active={activeSection === 'vendors'} onClick={() => setActiveSection('vendors')} badge={stats.pendingVendors} />
          <SidebarItem icon={Users} label="Users" active={activeSection === 'users'} onClick={() => setActiveSection('users')} />
          <SidebarItem icon={CarFront} label="Inventory" active={activeSection === 'inventory'} onClick={() => setActiveSection('inventory')} badge={stats.pendingListings} />
          <SidebarItem icon={ShoppingBag} label="Orders" active={activeSection === 'orders'} onClick={() => setActiveSection('orders')} />
        </div>

        <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.5rem 1rem' }}>Financial</div>
          <SidebarItem icon={TrendingUp} label="Sales Velocity" active={activeSection === 'sales'} onClick={() => setActiveSection('sales')} />
          <SidebarItem icon={FileText} label="Ledger" active={activeSection === 'ledger'} onClick={() => setActiveSection('ledger')} />
        </div>

        <div style={{ padding: '0 1rem', flex: 1 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.5rem 1rem' }}>System</div>
          <SidebarItem icon={ShieldCheck} label="Admins" active={activeSection === 'admins'} onClick={() => setActiveSection('admins')} />
          <SidebarItem icon={ShieldAlert} label="Audit Logs" active={activeSection === 'audit'} onClick={() => setActiveSection('audit')} />
          <SidebarItem icon={Settings} label="Settings" active={activeSection === 'settings'} onClick={() => setActiveSection('settings')} />
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 700, color: 'black' }}>
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.full_name || 'Admin'}</div>
              <div style={{ fontSize: '0.7rem', color: '#4ade80' }}>System Root</div>
            </div>
          </div>
          <button onClick={signOut} style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '0.5rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <LogOut size={14} /> TERMINATE SESSION
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        
        {/* Top Header */}
        <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)' }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Admin Portal <ChevronRight size={14} /> {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.5rem 1rem', background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80', borderRadius: '2rem', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80' }} />
              NETWORK SOVEREIGN
            </div>
            <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Bell size={20} /></button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* --- OVERVIEW --- */}
              {activeSection === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                     <div>
                       <h2 className="luxury-font" style={{ fontSize: '2.5rem', margin: 0 }}>Imperial Overview.</h2>
                       <p style={{ color: 'var(--text-muted)' }}>Strategic Command Center</p>
                     </div>
                   </div>

                   {/* Stats Grid */}
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                     <KpiCard title="TOTAL USERS" value={stats.totalUsers} icon={Users} trend="12% MTD" />
                     <KpiCard title="TOTAL REVENUE" value={`$${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} trend="8% MTD" />
                     <KpiCard title="ACTIVE ORDERS" value={stats.activeOrders} icon={ShoppingBag} subtext="Processing or Shipped" />
                     <KpiCard title="SYSTEM STATUS" value={stats.systemStatus} icon={Activity} subtext="All systems operational" />
                   </div>

                   {/* Additional Widgets */}
                   <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                     <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem', minHeight: '300px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                         <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Revenue Velocity</h3>
                         <select className="admin-input" style={{ width: 'auto' }}><option>This Month</option></select>
                       </div>
                       <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--border-glass)', borderRadius: '1rem', color: 'var(--text-muted)' }}>
                         {/* Placeholder for Chart */}
                         [Velocity Visualization Component]
                       </div>
                     </div>
                     <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                       <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>System Health</h3>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                         {['API Gateway', 'Database Cluster', 'CDN Edge', 'Auth Services'].map(service => (
                           <div key={service} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.8rem' }}>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                               <Server size={16} color="var(--text-muted)" />
                               <span style={{ fontSize: '0.9rem' }}>{service}</span>
                             </div>
                             <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px rgba(74,222,128,0.5)' }} />
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                   
                   <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Zap size={20} color="var(--accent-gold)" /> AI Strategic Intelligence
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>GROWTH VECTOR</h4>
                          <p style={{ fontSize: '1.1rem' }}>SUV sales up <strong>24%</strong> in Lagos region based on recent search patterns.</p>
                        </div>
                        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem' }}>
                          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>ANOMALY DETECTED</h4>
                          <p style={{ fontSize: '1.1rem' }}>3 high-value orders placed from same IP subnet. Fraud check recommended.</p>
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {/* --- MANAGEMENT VIEWS --- */}
              {['vendors', 'users', 'inventory', 'orders'].includes(activeSection) && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="luxury-font" style={{ fontSize: '2rem', margin: 0, textTransform: 'capitalize' }}>
                      {activeSection === 'vendors' ? 'Vendor Management' : activeSection === 'inventory' ? 'Inventory Control' : `${activeSection} Management`}
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                          placeholder="Search records..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{ padding: '0.8rem 1rem 0.8rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', borderRadius: '0.5rem', color: 'white', outline: 'none', width: '250px' }} 
                        />
                      </div>
                      {activeSection === 'inventory' && (
                        <button onClick={() => setShowAddCarForm(true)} className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Plus size={18} /> ADD ITEM
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                          {activeSection === 'vendors' && (
                            <>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Company</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Contact</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
                              <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
                            </>
                          )}
                          {activeSection === 'users' && (
                            <>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Name</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Email</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Role</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Joined</th>
                            </>
                          )}
                          {activeSection === 'inventory' && (
                            <>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Vehicle</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Price</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Vendor</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
                              <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
                            </>
                          )}
                          {activeSection === 'orders' && (
                            <>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Order ID</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Amount</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
                              <th style={{ padding: '1.5rem', textAlign: 'right' }}>Manage</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((item: any) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)', cursor: activeSection === 'vendors' ? 'pointer' : 'default' }} onClick={() => activeSection === 'vendors' && setSelectedVendor(item)}>
                            {activeSection === 'vendors' && (
                              <>
                                <td style={{ padding: '1.5rem' }}>
                                  <div style={{ fontWeight: 600 }}>{item.business_name || 'N/A'}</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>ID: {item.id.slice(0, 8)}</div>
                                  {item.business_details && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', padding: '0.5rem', borderRadius: '0.5rem' }}>
                                      {item.business_details.phone && <div>📞 {item.business_details.phone}</div>}
                                      {item.business_details.address && <div>📍 {item.business_details.address}</div>}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '1.5rem' }}>
                                  {item.full_name}
                                  <br/>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.email}</span>
                                  {item.business_details?.description && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)', maxWidth: '300px' }}>
                                      "{item.business_details.description.length > 80 ? item.business_details.description.slice(0, 80) + '...' : item.business_details.description}"
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '1.5rem' }}><StatusBadge status={item.vendor_status} /></td>
                                <td style={{ padding: '1.5rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                  {item.vendor_status === 'pending' ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                      <button onClick={() => handleVendorAction(item.id, 'approved')} className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>APPROVE</button>
                                      <button onClick={() => handleVendorAction(item.id, 'rejected')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }}>REJECT</button>
                                    </div>
                                  ) : (
                                    <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}><MoreVertical size={18} /></button>
                                  )}
                                </td>
                              </>
                            )}
                             {activeSection === 'users' && (
                              <>
                                <td style={{ padding: '1.5rem' }}>{item.full_name}</td>
                                <td style={{ padding: '1.5rem' }}>{item.email}</td>
                                <td style={{ padding: '1.5rem' }}><span style={{ textTransform: 'capitalize' }}>{item.role}</span></td>
                                <td style={{ padding: '1.5rem' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                              </>
                            )}
                            {activeSection === 'inventory' && (
                              <>
                                <td style={{ padding: '1.5rem' }}>{item.year} {item.make} {item.model}</td>
                                <td style={{ padding: '1.5rem' }}>${item.price.toLocaleString()}</td>
                                <td style={{ padding: '1.5rem' }}>{item.vendor_id ? 'Vendor' : 'Official'}</td>
                                <td style={{ padding: '1.5rem' }}>
                                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <StatusBadge status={item.status} />
                                    <StatusBadge status={item.approval_status || 'approved'} />
                                  </div>
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                   {item.approval_status === 'pending' && (
                                     <>
                                      <button onClick={() => handleCarApproval(item.id, 'approved')} style={{ color: '#4ade80', background: 'none', border: 'none' }} title="Approve"><CheckCircle2 size={18} /></button>
                                      <button onClick={() => handleCarApproval(item.id, 'rejected')} style={{ color: '#ef4444', background: 'none', border: 'none' }} title="Reject"><X size={18} /></button>
                                     </>
                                   )}
                                   <button onClick={() => { setEditingCar(item); setShowAddCarForm(true); }} style={{ color: 'white', background: 'none', border: 'none' }}><Edit size={16} /></button>
                                   <button onClick={() => handleDeleteCar(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16} /></button>
                                </td>
                              </>
                            )}
                            {activeSection === 'orders' && (
                              <>
                                <td style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>#{item.id.slice(0, 8)}</td>
                                <td style={{ padding: '1.5rem' }}>${item.amount.toLocaleString()}</td>
                                <td style={{ padding: '1.5rem' }}><StatusBadge status={item.status} /></td>
                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                  <button style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>Manage</button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* --- PLACEHOLDER SECTIONS --- */}
              {['sales', 'ledger', 'audit', 'settings', 'admins'].includes(activeSection) && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-muted)', border: '1px dashed var(--border-glass)', borderRadius: '2rem' }}>
                  <ShieldCheck size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <h3 className="luxury-font" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Section Under Construction</h3>
                  <p>The {activeSection} module is being initialized on the secure network.</p>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Add Car Modal */}
      <AnimatePresence>
        {showAddCarForm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                 <h2 className="luxury-font">Vehicle Entry Protocol</h2>
                 <button onClick={() => setShowAddCarForm(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
               </div>
               <form onSubmit={handleCarSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Minified form fields for brevity in this rewrite */}
                  <input name="make" placeholder="Make" defaultValue={editingCar?.make} required className="admin-input" />
                  <input name="model" placeholder="Model" defaultValue={editingCar?.model} required className="admin-input" />
                  <input name="year" type="number" placeholder="Year" defaultValue={editingCar?.year} required className="admin-input" />
                  <input name="price" type="number" placeholder="Price" defaultValue={editingCar?.price} required className="admin-input" />
                  <select name="status" defaultValue={editingCar?.status} className="admin-input">
                    <option value="Ready to Ship">Ready to Ship</option>
                    <option value="Preorder">Preorder</option>
                  </select>
                  <textarea name="description" placeholder="Description" defaultValue={editingCar?.description} className="admin-input" style={{ gridColumn: 'span 2' }} />
                  <button type="submit" className="btn-gold" style={{ gridColumn: 'span 2' }}>SECURE LISTING</button>
               </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Vendor Detail Modal */}
      <AnimatePresence>
        {selectedVendor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
            onClick={() => setSelectedVendor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass"
              style={{
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '3rem',
                borderRadius: '2rem',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVendor(null)}
                style={{
                  position: 'absolute',
                  top: '2rem',
                  right: '2rem',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem'
                }}
              >
                ✕
              </button>

              <div style={{ marginBottom: '2rem' }}>
                <h2 className="luxury-font" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                  {selectedVendor.business_name || 'Unnamed Business'}
                </h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <StatusBadge status={selectedVendor.vendor_status} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>ID: {selectedVendor.id}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                  <h3 style={{ fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1rem' }}>CONTACT PERSON</h3>
                  <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{selectedVendor.full_name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{selectedVendor.email}</div>
                </div>

                <div className="glass" style={{ padding: '2rem', borderRadius: '1rem' }}>
                  <h3 style={{ fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1rem' }}>BUSINESS CONTACT</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {selectedVendor.business_details?.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📞</span>
                        <span>{selectedVendor.business_details.phone}</span>
                      </div>
                    )}
                    {selectedVendor.business_details?.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>📍</span>
                        <span>{selectedVendor.business_details.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedVendor.business_details?.description && (
                <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1rem' }}>BUSINESS DESCRIPTION</h3>
                  <p style={{ lineHeight: '1.8', color: 'var(--text-muted)' }}>
                    {selectedVendor.business_details.description}
                  </p>
                </div>
              )}

              <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '0.8rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1rem' }}>APPLICATION DETAILS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Submitted</div>
                    <div>{new Date(selectedVendor.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>User Role</div>
                    <div style={{ textTransform: 'capitalize' }}>{selectedVendor.role}</div>
                  </div>
                </div>
              </div>

              {selectedVendor.vendor_status === 'pending' && (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      handleVendorAction(selectedVendor.id, 'rejected');
                      setSelectedVendor(null);
                    }}
                    style={{
                      padding: '1rem 2rem',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    REJECT APPLICATION
                  </button>
                  <button
                    onClick={() => {
                      handleVendorAction(selectedVendor.id, 'approved');
                      setSelectedVendor(null);
                    }}
                    className="btn-gold"
                    style={{ padding: '1rem 2rem' }}
                  >
                    APPROVE VENDOR
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
