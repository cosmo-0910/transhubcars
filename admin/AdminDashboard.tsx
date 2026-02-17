

import { db, supabase } from '../shared/lib/db';
import type { Car, Order } from '../shared/lib/db';
import { formatPrice } from '../shared/lib/formatters';
import { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, ShoppingBag, CarFront, Store, 
  Settings, ShieldAlert, FileText, Activity, 
  MoreVertical, Bell, LogOut, ChevronRight,
  TrendingUp, Zap, Server, ShieldCheck, DollarSign,
  CheckCircle2, X, Plus, Trash2, Edit, Eye, RefreshCw, Copy,
  Video, Menu, Wrench, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../shared/lib/AuthContext';
import SearchAutocomplete from '../shared/components/SearchAutocomplete';
import { VehicleDetail } from '../client/components/VehicleDetail';
import LuxuryAutocomplete from '../vendor/components/LuxuryAutocomplete';
import LuxurySelect from '../vendor/components/LuxurySelect';
import ImageUploadField from '../shared/components/ImageUploadField';
import { useRef } from 'react';
import { ThemeToggle } from '../shared/components/ThemeToggle';
import { TowingManagement } from './components/TowingManagement';

// --- Types ---
type Section = 'overview' | 'vendors' | 'users' | 'inventory' | 'orders' | 'sales' | 'ledger' | 'audit' | 'settings' | 'admins' | 'mechanics' | 'towing';

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
  const { user, profile, signOut } = useAuth();
  
  const hasPermission = (perm: string) => {
    // Root admin key override
    if (user?.email === 'admin@transhub.com') return true;
    // Check permissions array
    return Array.isArray(profile?.permissions) && profile.permissions.includes(perm);
  };
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Data State
  const [cars, setCars] = useState<Car[]>([]);
  const [users, setUsers] = useState<any[]>([]); // Profiles
  const [vendors, setVendors] = useState<any[]>([]); // Vendor Profiles
  const [orders, setOrders] = useState<Order[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [platformSettings, setPlatformSettings] = useState<any[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [vendorFilter, setVendorFilter] = useState('all'); // 'all', 'pending', 'preorder_pending'
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ 
    fullName: '', 
    email: '', 
    password: '', 
    permissions: [] as string[] 
  });
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);

  // Editing State
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [previewCar, setPreviewCar] = useState<Car | null>(null);
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMechanic, setEditingMechanic] = useState<any | null>(null);
  const [showAddMechanicForm, setShowAddMechanicForm] = useState(false);

  // Form State
  const [primaryImage, setPrimaryImage] = useState<File | string | null>(null);
  const [galleryImages, setGalleryImages] = useState<(File | string)[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const cachedMakes = useRef<any[] | null>(null);

  // Sync state when editing
  useEffect(() => {
    if (editingCar) {
      setPrimaryImage(editingCar.image_url || null);
      setGalleryImages(editingCar.gallery_urls || []);
      setSelectedMake(editingCar.make || '');
    } else {
      setPrimaryImage(null);
      setGalleryImages([]);
      setSelectedMake('');
    }
  }, [editingCar, showAddCarForm]);

  const fetchMakes = async (query: string) => {
    try {
      if (!cachedMakes.current) {
        const response = await fetch('https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json');
        const data = await response.json();
        cachedMakes.current = data.Results;
      }
      return cachedMakes.current!
        .filter((item: any) => item.MakeName.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
        .map((item: any) => ({ value: item.MakeName, label: item.MakeName }));
    } catch (error) {
      console.error('Error fetching makes:', error);
      return [];
    }
  };

  const fetchModels = async (query: string) => {
    if (!selectedMake) return [];
    try {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMake/${selectedMake}?format=json`);
      const data = await response.json();
      return data.Results
        .filter((item: any) => item.Model_Name.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 10)
        .map((item: any) => ({ value: item.Model_Name, label: item.Model_Name }));
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  };

  const handleAddGalleryImage = () => {
    setGalleryImages([...galleryImages, '']);
  };

  const handleGalleryImageChange = (index: number, value: File | string) => {
    const updated = [...galleryImages];
    updated[index] = value;
    setGalleryImages(updated);
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      const [carsData, ordersData, allProfiles, adminsData, logsData, settingsData] = await Promise.all([
        db.getCars(),
        db.getOrders(),
        db.getProfiles(),
        db.getAdmins(),
        db.getAuditLogs().catch(() => []), // Handle missing table gracefully
        db.getPlatformSettings().catch(() => [])
      ]);
      
      setCars(carsData);
      setOrders(ordersData);
      setUsers(allProfiles); 
      setVendors(allProfiles.filter((p: any) => ['pending', 'approved', 'rejected'].includes(p.vendor_status)));
      setAdmins(adminsData);
      setAuditLogs(logsData);
      setPlatformSettings(settingsData);
      
      const mechanicsData = await db.getMechanics().catch(() => []);
      setMechanics(mechanicsData);
    } catch (err: any) {
      console.error('Failed to load portal data:', err);
      setError(err.message || 'Failed to connect to the secure network. Please check your connection.');
    } finally {
      setInitialLoading(false);
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
        await db.logAction(`Vendor ${status}`, 'profile', id, { business_name: updates.business_name });
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
      await db.logAction(`Listing ${status}`, 'car', id);
      loadAllData();
    }
  };

  const handleDeleteCar = async (id: string) => {
    if (window.confirm('Delete this vehicle?')) {
      await db.deleteCar(id);
      loadAllData();
    }
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewAdmin(prev => ({ ...prev, password }));
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdmin.fullName || (!editingAdmin && (!newAdmin.email || !newAdmin.password))) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      if (editingAdmin) {
        if (confirm(`Update permissions for ${newAdmin.fullName}?`)) {
          await db.updateAdmin({
            id: editingAdmin.id,
            fullName: newAdmin.fullName,
            permissions: newAdmin.permissions
          });
          alert('Admin permissions updated successfully.');
          setShowAdminModal(false);
          setEditingAdmin(null);
          setNewAdmin({ fullName: '', email: '', password: '', permissions: [] });
          loadAllData();
        }
      } else {
        if (confirm(`Create admin account for ${newAdmin.fullName}?`)) {
          await db.createAdmin(newAdmin);
          alert('Admin account created successfully.');
          setShowAdminModal(false);
          setNewAdmin({ fullName: '', email: '', password: '', permissions: [] });
          loadAllData();
        }
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch') {
        alert('Failed to connect to the management server. Please ensure the backend (port 3001) is running.');
      } else {
        alert(`Failed to ${editingAdmin ? 'update' : 'create'} admin: ${err.message}`);
      }
    }
  };

  const togglePermission = (perm: string) => {
    setNewAdmin(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm) 
        ? prev.permissions.filter(p => p !== perm)
        : [...prev.permissions, perm]
    }));
  };

  const AVAILABLE_PERMISSIONS = [
    { id: 'inventory', label: 'Inventory Control' },
    { id: 'vendors', label: 'Vendor Management' },
    { id: 'users', label: 'User Supervision' },
    { id: 'finance', label: 'Financial Access' },
    { id: 'audit', label: 'Audit Logs' },
    { id: 'settings', label: 'System Settings' },
    { id: 'mechanics', label: 'Workshop Management' },
    { id: 'towing', label: 'Towing Fleet' }
  ];

  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    
    try {
      setLoading(true);
      setError(null);

      // 1. Upload Primary Image if it's a File
      let primaryUrl = editingCar?.image_url || '';
      if (primaryImage instanceof File) {
        primaryUrl = await db.uploadImage(primaryImage, 'car-images', 'admin');
      } else if (typeof primaryImage === 'string') {
        primaryUrl = primaryImage;
      }

      // 2. Upload Gallery Images
      const galleryUrls = await Promise.all(
        galleryImages.map(async (img) => {
          if (img instanceof File) {
            return await db.uploadImage(img, 'car-images', 'admin');
          }
          return img;
        })
      );

      const formData = new FormData(form);
      const carData: any = {
        make: formData.get('make'),
        model: formData.get('model'),
        year: parseInt(formData.get('year') as string),
        price: parseFloat(formData.get('price') as string),
        status: formData.get('status'),
        mileage: parseInt(formData.get('mileage') as string) || 0,
        transmission: formData.get('transmission'),
        fuel_type: formData.get('fuel_type'),
        exterior_color: formData.get('exterior_color'),
        interior_color: formData.get('interior_color'),
        engine: formData.get('engine'),
        vin: formData.get('vin'),
        description: formData.get('description'),
        image_url: primaryUrl || 'https://images.unsplash.com/photo-1542362567-b055034b4c1d?q=80',
        gallery_urls: galleryUrls.filter(url => typeof url === 'string' && url.trim() !== ''),
        vendor_id: null, // Explicitly null for Transhub Official posts
        approval_status: 'approved' // Admins are auto-approved
      };

      if (editingCar) {
        await db.updateCar(editingCar.id, carData);
      } else {
        await db.saveCar(carData);
      }
      
      loadAllData();
      setShowAddCarForm(false);
      setEditingCar(null);
    } catch (err: any) {
      console.error('Failed to save vehicle:', err);
      setError(err.message || 'Failed to save vehicle listings');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'active' | 'suspended' | 'banned' | 'disabled') => {
    if (!confirm(`Are you sure you want to change this user's status to ${action}?`)) return;
    try {
      await db.updateProfileStatus(userId, action);
      loadAllData();
      alert(`User status updated to ${action}`);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handlePreorderReview = async (userId: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Confirm ${status.toUpperCase()} for preorder access?`)) return;
    try {
      await db.reviewPreorderApplication(userId, status);
      loadAllData();
      alert(`Application ${status}`);
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    }
  };

  const handleMechanicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    
    try {
      setLoading(true);
      setError(null);

      const mechanicData: any = {
        name: formData.get('name'),
        specialty: formData.get('specialty'),
        location: formData.get('location'),
        rating: parseFloat(formData.get('rating') as string) || 0,
        is_approved: formData.get('is_approved') === 'true',
        phone: formData.get('phone'),
        image_url: formData.get('image_url') || 'https://images.unsplash.com/photo-1530046339160-ce3e5b097ea1?q=80&w=2070'
      };

      if (editingMechanic) {
        await db.updateMechanic(editingMechanic.id, mechanicData);
        await db.logAction('Update Mechanic', 'mechanic', editingMechanic.id);
      } else {
        await db.saveMechanic(mechanicData);
        await db.logAction('Add Mechanic', 'mechanic');
      }
      
      loadAllData();
      setShowAddMechanicForm(false);
      setEditingMechanic(null);
    } catch (err: any) {
      console.error('Failed to save mechanic:', err);
      setError(err.message || 'Failed to save mechanic details');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMechanic = async (id: string) => {
    if (window.confirm('Delete this mechanic record?')) {
      try {
        await db.deleteMechanic(id);
        await db.logAction('Delete Mechanic', 'mechanic', id);
        loadAllData();
      } catch (err: any) {
        alert(`Failed to delete mechanic: ${err.message}`);
      }
    }
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
      case 'vendors': return vendors.filter(v => {
        const matchesQuery = (v.business_name || '').toLowerCase().includes(q) || (v.full_name || '').toLowerCase().includes(q);
        if (vendorFilter === 'pending') return matchesQuery && v.vendor_status === 'pending';
        if (vendorFilter === 'preorder_pending') return matchesQuery && v.preorder_status === 'pending';
        return matchesQuery;
      });
      case 'users': return users.filter(u => (u.full_name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q));
      case 'inventory': return cars.filter(c => `${c.make} ${c.model}`.toLowerCase().includes(q));
      case 'orders': 
      case 'sales':
      case 'ledger': return orders.filter(o => o.id.includes(q) || (o.payment_ref || '').toLowerCase().includes(q));
      case 'audit': return auditLogs.filter(l => (l.action || '').toLowerCase().includes(q) || (l.profiles?.full_name || '').toLowerCase().includes(q));
      case 'admins': return admins.filter(a => (a.full_name || '').toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q));
      case 'mechanics': return mechanics.filter(m => (m.name || '').toLowerCase().includes(q) || (m.specialty || '').toLowerCase().includes(q));
      default: return [];
    }
  }, [activeSection, vendors, users, cars, orders, auditLogs, admins, mechanics, searchQuery]);

  return (
    <div className="logo-grid-bg dashboard-container" style={{ color: 'var(--text-main)' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-deep)', zIndex: -2 }}></div>
      
      {/* --- MOBILE TOGGLE --- */}
      <div className="mobile-only-flex" style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 3000 }}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="glass" 
          style={{ width: '60px', height: '60px', borderRadius: '50%', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- SIDEBAR --- */}
      <aside 
        className={`dashboard-sidebar ${isSidebarOpen ? 'mobile-sidebar-open' : ''}`}
        style={{ width: '260px', borderRight: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)', zIndex: 2000 }}
      >
        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <img src="/logo.png" alt="Transhub Logo" style={{ height: '32px', width: 'auto' }} />
          <h1 className="luxury-font" style={{ fontSize: '1.2rem', margin: 0 }}>Transhub.</h1>
        </div>

        <div className="sidebar-scroll" style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.5rem 1rem' }}>Control Center</div>
            <SidebarItem icon={LayoutDashboard} label="Imperial Overview" active={activeSection === 'overview'} onClick={() => setActiveSection('overview')} />
          </div>

          <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.5rem 1rem' }}>Management</div>
            {hasPermission('vendors') && <SidebarItem icon={Store} label="Vendors" active={activeSection === 'vendors'} onClick={() => setActiveSection('vendors')} badge={stats.pendingVendors} />}
            {hasPermission('users') && <SidebarItem icon={Users} label="Users" active={activeSection === 'users'} onClick={() => setActiveSection('users')} />}
            {hasPermission('inventory') && <SidebarItem icon={CarFront} label="Inventory" active={activeSection === 'inventory'} onClick={() => setActiveSection('inventory')} badge={stats.pendingListings} />}
            {hasPermission('inventory') && <SidebarItem icon={ShoppingBag} label="Orders" active={activeSection === 'orders'} onClick={() => setActiveSection('orders')} />}
            {hasPermission('mechanics') && <SidebarItem icon={Wrench} label="Workshops" active={activeSection === 'mechanics'} onClick={() => setActiveSection('mechanics')} />}
            {hasPermission('towing') && <SidebarItem icon={Truck} label="Towing Fleet" active={activeSection === 'towing'} onClick={() => setActiveSection('towing')} />}
          </div>

          {(hasPermission('finance') || hasPermission('sales')) && (
            <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.5rem 1rem' }}>Financial</div>
              {hasPermission('finance') && <SidebarItem icon={TrendingUp} label="Sales Velocity" active={activeSection === 'sales'} onClick={() => setActiveSection('sales')} />}
              {hasPermission('finance') && <SidebarItem icon={FileText} label="Ledger" active={activeSection === 'ledger'} onClick={() => setActiveSection('ledger')} />}
            </div>
          )}

          <div style={{ padding: '0 1rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.5rem 1rem' }}>System</div>
            {user?.email === 'admin@transhub.com' && <SidebarItem icon={ShieldCheck} label="Admins" active={activeSection === 'admins'} onClick={() => setActiveSection('admins')} />}
            {hasPermission('audit') && <SidebarItem icon={ShieldAlert} label="Audit Logs" active={activeSection === 'audit'} onClick={() => setActiveSection('audit')} />}
            {hasPermission('settings') && <SidebarItem icon={Settings} label="Settings" active={activeSection === 'settings'} onClick={() => setActiveSection('settings')} />}
          </div>
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
            <ThemeToggle />
            <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Bell size={20} /></button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {/* Profile Diagnostic Warning */}
          {!initialLoading && profile?.full_name === 'System Admin' && (
            <div style={{ 
              background: 'rgba(234, 179, 8, 0.1)', 
              border: '1px solid rgba(234, 179, 8, 0.3)', 
              padding: '1rem', 
              borderRadius: '0.8rem', 
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <ShieldAlert size={20} color="#eab308" />
              <div style={{ fontSize: '0.9rem', color: '#eab308' }}>
                <strong>Limited Access Active:</strong> Your profile record was not found in the database. 
                Some administrative functions and viewing permissions may be restricted. 
                Please ensure you have run the profile setup script in the Supabase console.
              </div>
            </div>
          )}

          {error && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.3)', 
              padding: '1rem', 
              borderRadius: '0.8rem', 
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <ShieldAlert size={20} color="#ef4444" />
              <div style={{ fontSize: '0.9rem', color: '#ef4444' }}>
                <strong>System Error:</strong> {error}
              </div>
            </div>
          )}

          {initialLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '1rem' }}>
               <motion.div 
                 animate={{ rotate: 360 }} 
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 style={{ width: '40px', height: '40px', border: '2px solid var(--accent-gold)', borderTopColor: 'transparent', borderRadius: '50%' }}
               />
               <div className="luxury-font" style={{ color: 'var(--text-muted)', fontSize: '0.8rem', letterSpacing: '2px' }}>SYNCHRONIZING SECURE DATA...</div>
            </div>
          ) : (
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
                     {hasPermission('users') && <KpiCard title="TOTAL USERS" value={stats.totalUsers} icon={Users} trend="12% MTD" />}
                     {hasPermission('finance') && <KpiCard title="TOTAL REVENUE" value={formatPrice(stats.totalRevenue)} icon={DollarSign} trend="8% MTD" />}
                     {hasPermission('orders') && <KpiCard title="ACTIVE ORDERS" value={stats.activeOrders} icon={ShoppingBag} subtext="Processing or Shipped" />}
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
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {activeSection === 'vendors' && (
                        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.3rem', borderRadius: '0.8rem', border: '1px solid var(--border-glass)' }}>
                           <button onClick={() => setVendorFilter('all')} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', background: vendorFilter === 'all' ? 'var(--accent-gold)' : 'transparent', color: vendorFilter === 'all' ? 'black' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>ALL</button>
                           <button onClick={() => setVendorFilter('pending')} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', background: vendorFilter === 'pending' ? 'var(--accent-gold)' : 'transparent', color: vendorFilter === 'pending' ? 'black' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>NEW JOINERS</button>
                           <button onClick={() => setVendorFilter('preorder_pending')} style={{ padding: '0.4rem 0.8rem', borderRadius: '0.5rem', background: vendorFilter === 'preorder_pending' ? 'var(--accent-gold)' : 'transparent', color: vendorFilter === 'preorder_pending' ? 'black' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}>PREORDER APPS</button>
                        </div>
                      )}
                      <SearchAutocomplete 
                        placeholder="Search records..." 
                        onSearch={setSearchQuery}
                        style={{ width: '250px' }}
                        enableSuggestions={activeSection === 'inventory'}
                      />
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
                              {vendorFilter === 'preorder_pending' && <th style={{ padding: '1.5rem', textAlign: 'left' }}>Evidence</th>}
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
                              <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
                            </>
                          )}
                          {activeSection === 'users' && (
                            <>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Name</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Email</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
                              <th style={{ padding: '1.5rem', textAlign: 'left' }}>Joined</th>
                              <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
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
                                {vendorFilter === 'preorder_pending' && (
                                  <td style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                      {item.store_video_url && <a href={item.store_video_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#60a5fa', textDecoration: 'none', fontSize: '0.8rem' }}><Video size={14} /> Video</a>}
                                      {item.store_image_url && <a href={item.store_image_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#60a5fa', textDecoration: 'none', fontSize: '0.8rem' }}><Eye size={14} /> Image</a>}
                                    </div>
                                  </td>
                                )}
                                <td style={{ padding: '1.5rem' }}>
                                  <StatusBadge status={item.vendor_status} />
                                  {item.preorder_status === 'pending' && <div style={{ fontSize: '0.7rem', color: '#eab308', marginTop: '0.3rem' }}>Preorder App Pending</div>}
                                </td>
                                <td style={{ padding: '1.5rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                  {item.vendor_status === 'pending' ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                      <button onClick={() => handleVendorAction(item.id, 'approved')} className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>APPROVE VENDOR</button>
                                      <button onClick={() => handleVendorAction(item.id, 'rejected')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }}>REJECT</button>
                                    </div>
                                  ) : item.preorder_status === 'pending' ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                      <button onClick={() => handlePreorderReview(item.id, 'approved')} className="btn-gold" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>APPROVE PREORDER</button>
                                      <button onClick={() => handlePreorderReview(item.id, 'rejected')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem', background: '#333', border: 'none', color: 'white', borderRadius: '4px' }}>REJECT</button>
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
                                <td style={{ padding: '1.5rem' }}><StatusBadge status={item.status || 'active'} /></td>
                                <td style={{ padding: '1.5rem' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                                <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                   <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    {item.status !== 'suspended' && (
                                      <button onClick={() => handleUserAction(item.id, 'suspended')} style={{ color: '#eab308', background: 'rgba(234, 179, 8, 0.1)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem' }}>SUSPEND</button>
                                    )}
                                    {item.status !== 'banned' && (
                                      <button onClick={() => handleUserAction(item.id, 'banned')} style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem' }}>BAN</button>
                                    )}
                                    {item.status !== 'active' && (
                                      <button onClick={() => handleUserAction(item.id, 'active')} style={{ color: '#4ade80', background: 'rgba(74, 222, 128, 0.1)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem' }}>ACTIVATE</button>
                                    )}
                                   </div>
                                 </td>
                              </>
                            )}
                            {activeSection === 'inventory' && (
                              <>
                                <td style={{ padding: '1.5rem' }}>{item.year} {item.make} {item.model}</td>
                                <td style={{ padding: '1.5rem' }}>{formatPrice(item.price)}</td>
                                <td style={{ padding: '1.5rem' }}>
                                  {item.profiles?.business_name ? (
                                    <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{item.profiles.business_name}</span>
                                  ) : item.vendor_id ? (
                                    'Vendor'
                                  ) : (
                                    'Official'
                                  )}
                                </td>
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
                                    <button onClick={() => setPreviewCar(item)} style={{ color: 'var(--accent-gold)', background: 'none', border: 'none' }} title="Preview"><Eye size={18} /></button>
                                    <button onClick={() => { setEditingCar(item); setShowAddCarForm(true); }} style={{ color: 'white', background: 'none', border: 'none' }}><Edit size={16} /></button>
                                    <button onClick={() => handleDeleteCar(item.id)} style={{ color: '#ef4444', background: 'none', border: 'none' }}><Trash2 size={16} /></button>
                                </td>
                              </>
                            )}
                            {activeSection === 'orders' && (
                              <>
                                <td style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>#{item.id.slice(0, 8)}</td>
                                <td style={{ padding: '1.5rem' }}>{formatPrice(item.amount)}</td>
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

              {/* --- SALES VELOCITY --- */}
              {activeSection === 'sales' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                   <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                     <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>VOLUME DISTRIBUTION</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {['SUV', 'Luxury Sedan', 'Hypercar', 'Classic'].map(cat => (
                            <div key={cat} style={{ width: '100%' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                                <span>{cat}</span>
                                <span style={{ color: 'var(--accent-gold)' }}>{Math.floor(Math.random() * 40 + 20)}%</span>
                              </div>
                              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.random() * 40 + 20}%`, background: 'var(--accent-gold)' }} />
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>
                     <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>REGIONAL HEATMAP</h4>
                        <div style={{ height: '150px', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          [Visual Map Data Placeholder]
                        </div>
                     </div>
                   </div>

                   <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                          <tr>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Product</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '1.5rem', textAlign: 'left' }}>Revenue</th>
                            <th style={{ padding: '1.5rem', textAlign: 'right' }}>Velocity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.slice(0, 5).map((o: any) => (
                            <tr key={o.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                              <td style={{ padding: '1.5rem' }}>{o.cars?.year} {o.cars?.make} {o.cars?.model}</td>
                              <td style={{ padding: '1.5rem' }}><StatusBadge status={o.status} /></td>
                              <td style={{ padding: '1.5rem' }}>{formatPrice(o.amount)}</td>
                              <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                                <span style={{ color: '#4ade80', fontSize: '0.8rem' }}>+{(Math.random() * 5).toFixed(1)}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
              )}

              {/* --- LEDGER --- */}
              {activeSection === 'ledger' && (
                <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                      <tr>
                        <th style={{ padding: '1.5rem', textAlign: 'left' }}>Reference</th>
                        <th style={{ padding: '1.5rem', textAlign: 'left' }}>Date</th>
                        <th style={{ padding: '1.5rem', textAlign: 'left' }}>Entity</th>
                        <th style={{ padding: '1.5rem', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '1.5rem', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((o: any) => (
                        <tr key={o.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                          <td style={{ padding: '1.5rem', fontFamily: 'monospace' }}>TRX-{o.id.slice(0, 8).toUpperCase()}</td>
                          <td style={{ padding: '1.5rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '1.5rem' }}>{o.user_id?.slice(0, 8)}...</td>
                          <td style={{ padding: '1.5rem' }}>{o.payment_ref ? 'Credit' : 'Pending'}</td>
                          <td style={{ padding: '1.5rem', textAlign: 'right', color: '#4ade80', fontWeight: 600 }}>
                            {formatPrice(o.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* --- AUDIT LOGS --- */}
              {activeSection === 'audit' && (
                <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
                   <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.01)' }}>
                     <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Historical record of all administrative actions performed on the sovereign network.</p>
                   </div>
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                      <tr>
                        <th style={{ padding: '1.5rem', textAlign: 'left' }}>Administrator</th>
                        <th style={{ padding: '1.5rem', textAlign: 'left' }}>Action</th>
                        <th style={{ padding: '1.5rem', textAlign: 'left' }}>Target</th>
                        <th style={{ padding: '1.5rem', textAlign: 'right' }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No tactical logs found. System records are clean.
                          </td>
                        </tr>
                      ) : filteredData.map((log: any) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                          <td style={{ padding: '1.5rem' }}>{log.profiles?.full_name || 'System'}</td>
                          <td style={{ padding: '1.5rem' }}>
                            <span style={{ color: 'var(--accent-gold)' }}>{log.action}</span>
                          </td>
                          <td style={{ padding: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {log.target_type && `${log.target_type}: `}{log.target_id?.slice(0, 8)}...
                          </td>
                          <td style={{ padding: '1.5rem', textAlign: 'right', fontSize: '0.8rem' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                   </table>
                </div>
              )}

              {/* --- ADMINS --- */}
              {activeSection === 'admins' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => {
                        setEditingAdmin(null);
                        setNewAdmin({ fullName: '', email: '', password: '', permissions: [] });
                        setShowAdminModal(true);
                      }}
                      className="btn-gold" 
                      style={{ padding: '0.8rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                    >
                      <Plus size={16} /> PROVISION NEW ADMIN
                    </button>
                  </div>
                
                  <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
                     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                        <tr>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>Identity</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>Access Level</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
                          <th style={{ padding: '1.5rem', textAlign: 'right' }}>Protocols</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map((admin: any) => (
                          <tr key={admin.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <td style={{ padding: '1.5rem' }}>
                              <div style={{ fontWeight: 600 }}>{admin.full_name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{admin.email}</div>
                            </td>
                            <td style={{ padding: '1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShieldCheck size={14} color="var(--accent-gold)" />
                                {admin.email === 'admin@transhub.com' ? 'Root Administrator' : 'Administrator'}
                              </div>
                              {admin.permissions && admin.permissions.length > 0 && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                  {Array.isArray(admin.permissions) ? admin.permissions.join(', ') : 'Restricted'}
                                </div>
                              )}
                            </td>
                            <td style={{ padding: '1.5rem' }}><StatusBadge status="ACTIVE" /></td>
                            <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                              {admin.email !== 'admin@transhub.com' && (
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                  <button 
                                    onClick={() => {
                                      setEditingAdmin(admin);
                                      setNewAdmin({
                                        fullName: admin.full_name,
                                        email: admin.email,
                                        password: 'LOCKED', // Not used for updates
                                        permissions: admin.permissions || []
                                      });
                                      setShowAdminModal(true);
                                    }}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontSize: '0.7rem', cursor: 'pointer' }}
                                  >
                                    EDIT ACCESS
                                  </button>
                                  <button style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0.4rem 0.8rem', borderRadius: '0.4rem', fontSize: '0.7rem', cursor: 'pointer' }}>
                                    REVOKE ACCESS
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                     </table>
                  </div>
                </div>
              )}

              {/* --- MECHANICS --- */}
              {activeSection === 'mechanics' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className="luxury-font" style={{ fontSize: '2rem', margin: 0 }}>Certified Workshops</h2>
                    <button 
                      onClick={() => {
                        setEditingMechanic(null);
                        setShowAddMechanicForm(true);
                      }}
                      className="btn-gold" 
                      style={{ padding: '0.8rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                    >
                      <Plus size={16} /> ADD CERTIFIED WORKSHOP
                    </button>
                  </div>
                
                  <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
                     <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-glass)' }}>
                        <tr>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>Workshop</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>Specialty</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>Location</th>
                          <th style={{ padding: '1.5rem', textAlign: 'left' }}>Status</th>
                          <th style={{ padding: '1.5rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                              No mechanics found in the database.
                            </td>
                          </tr>
                        ) : filteredData.map((mech: any) => (
                          <tr key={mech.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <td style={{ padding: '1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <img src={mech.image_url} alt={mech.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                <div>
                                  <div style={{ fontWeight: 600 }}>{mech.name}</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{mech.phone}</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '1.5rem' }}>{mech.specialty}</td>
                            <td style={{ padding: '1.5rem' }}>{mech.location}</td>
                            <td style={{ padding: '1.5rem' }}>
                              <StatusBadge status={mech.is_approved ? 'APPROVED' : 'PENDING'} />
                            </td>
                            <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <button 
                                  onClick={() => {
                                    setEditingMechanic(mech);
                                    setShowAddMechanicForm(true);
                                  }}
                                  style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer' }}
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteMechanic(mech.id)}
                                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', padding: '0.4rem', borderRadius: '0.4rem', cursor: 'pointer' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                     </table>
                  </div>
                </div>
              )}

              {/* --- TOWING FLEET --- */}
              {activeSection === 'towing' && <TowingManagement />}

              {/* --- SETTINGS --- */}
              {activeSection === 'settings' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                    <h3 className="luxury-font" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Branding Center</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '1px' }}>PLATFORM NAME</label>
                        <input 
                          className="admin-input" 
                          style={{ width: '100%' }} 
                          defaultValue={platformSettings.find(s => s.key === 'branding')?.value?.name || "Transhub Luxury Automotive"} 
                        />
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '1px' }}>ACCENT COLOR</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <input 
                            type="color" 
                            defaultValue={platformSettings.find(s => s.key === 'branding')?.value?.primary_color || "#c5a059"} 
                            style={{ border: 'none', background: 'none' }} 
                          />
                          <span style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>
                            {platformSettings.find(s => s.key === 'branding')?.value?.primary_color || "#C5A059"}
                          </span>
                        </div>
                      </div>
                      <button className="btn-gold" style={{ marginTop: '1rem' }} onClick={() => alert('Branding settings locked for root security.')}>COMMIT CHANGES</button>
                    </div>
                  </div>

                  <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                    <h3 className="luxury-font" style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>System Integrity</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                           <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Maintenance Mode</div>
                           <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Disable public access for updates</div>
                         </div>
                         <div style={{ width: '40px', height: '20px', background: '#333', borderRadius: '10px', position: 'relative' }}>
                            <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', left: '2px', top: '2px' }} />
                         </div>
                      </div>
                      <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <div>
                           <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Detailed Logging</div>
                           <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Increase audit granularity</div>
                         </div>
                         <div style={{ width: '40px', height: '20px', background: 'var(--accent-gold)', borderRadius: '10px', position: 'relative' }}>
                            <div style={{ width: '16px', height: '16px', background: 'black', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }} />
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
          )}
        </div>
      </main>

      {/* Add Car Modal */}
      <AnimatePresence>
        {showAddCarForm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '3rem', borderRadius: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                 <div>
                   <h2 className="luxury-font" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Vehicle Entry Protocol</h2>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Strategic Asset Registration</p>
                 </div>
                 <button onClick={() => setShowAddCarForm(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
               </div>

               {error && (
                 <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', borderRadius: '0.8rem', marginBottom: '2rem', fontSize: '0.9rem' }}>
                   {error}
                 </div>
               )}

               <form onSubmit={handleCarSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* Core Specifications */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1.5rem' }}>CORE SPECIFICATIONS</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <LuxuryAutocomplete
                        name="make"
                        label="Make"
                        placeholder="e.g. Rolls-Royce"
                        defaultValue={editingCar?.make}
                        required
                        fetchSuggestions={fetchMakes}
                        onSelect={setSelectedMake}
                      />
                      <LuxuryAutocomplete
                        name="model"
                        label="Model"
                        placeholder={selectedMake ? `Models for ${selectedMake}...` : "Select a make first"}
                        defaultValue={editingCar?.model}
                        required
                        fetchSuggestions={fetchModels}
                      />
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Year</label>
                        <input name="year" type="number" defaultValue={editingCar?.year} required className="admin-input" style={{ width: '100%' }} placeholder="2024" />
                      </div>
                    </div>
                  </div>

                  {/* Value & Status */}
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Listing Price (₦)</label>
                    <input name="price" type="number" defaultValue={editingCar?.price} required className="admin-input" style={{ width: '100%' }} placeholder="450000" />
                  </div>
                  <LuxurySelect 
                    name="status" 
                    label="Inventory Status"
                    defaultValue={editingCar?.status}
                    options={[
                      { value: 'Readily Available', label: 'Readily Available' },
                      { value: 'Preorder', label: 'Preorder' }
                    ]}
                  />

                  {/* Aesthetic Identity */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1.5rem', marginTop: '1rem' }}>AESTHETIC IDENTITY</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Exterior Color</label>
                        <input name="exterior_color" type="text" defaultValue={editingCar?.exterior_color} required className="admin-input" style={{ width: '100%' }} placeholder="e.g. Nero Noctis" />
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Interior Color</label>
                        <input name="interior_color" type="text" defaultValue={editingCar?.interior_color} required className="admin-input" style={{ width: '100%' }} placeholder="e.g. Rosso Alala" />
                      </div>
                    </div>
                  </div>

                  {/* Technical Dossier */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1.5rem', marginTop: '1rem' }}>TECHNICAL DOSSIER</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Mileage</label>
                        <input name="mileage" type="number" defaultValue={editingCar?.mileage} required className="admin-input" style={{ width: '100%' }} placeholder="650" />
                      </div>
                      <LuxurySelect 
                        name="transmission" 
                        label="Transmission"
                        defaultValue={editingCar?.transmission}
                        options={[
                          { value: 'Automatic', label: 'Automatic' },
                          { value: 'Manual', label: 'Manual' },
                          { value: 'Semi-Auto', label: 'Semi-Auto' }
                        ]}
                      />
                      <LuxurySelect 
                        name="fuel_type" 
                        label="Fuel Type"
                        defaultValue={editingCar?.fuel_type}
                        options={[
                          { value: 'Petrol', label: 'Petrol' },
                          { value: 'Diesel', label: 'Diesel' },
                          { value: 'Hybrid', label: 'Hybrid' },
                          { value: 'Electric', label: 'Electric' }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Media */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Primary Visual Asset</label>
                    <ImageUploadField 
                      value={primaryImage} 
                      onChange={setPrimaryImage} 
                      placeholder="Select primary vehicle image"
                    />

                    <div style={{ marginTop: '2rem' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Gallery Protocol (Secondary Assets)</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {galleryImages.map((img, index) => (
                          <div key={index} style={{ position: 'relative' }}>
                            <ImageUploadField 
                              value={img} 
                              onChange={(val) => handleGalleryImageChange(index, val)} 
                              placeholder={`Gallery asset #${index + 1}`}
                            />
                            <button 
                              type="button"
                              onClick={() => handleRemoveGalleryImage(index)}
                              style={{ position: 'absolute', top: '-0.5rem', right: '-0.5rem', background: '#ef4444', border: 'none', color: 'white', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button 
                          type="button"
                          onClick={handleAddGalleryImage}
                          style={{ height: '120px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-glass)', color: 'var(--text-muted)', borderRadius: '1rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: '0.3s' }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
                        >
                          <Plus size={24} />
                          <span style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>ADD VISUAL</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Vehicle Description</label>
                    <textarea name="description" defaultValue={editingCar?.description} className="admin-input" style={{ width: '100%', height: '120px', resize: 'none', padding: '1rem' }} placeholder="Detailed overview of luxury features and condition..." />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="button" onClick={() => setShowAddCarForm(false)} style={{ flex: 1, padding: '1.2rem', borderRadius: '1rem', border: '1px solid var(--border-glass)', background: 'transparent', color: 'white', cursor: 'pointer', fontWeight: 600 }}>ABORT</button>
                    <button type="submit" disabled={loading} className="btn-gold" style={{ flex: 2, padding: '1.2rem' }}>
                      {loading ? 'SYNCHRONIZING...' : editingCar ? 'SECURE UPDATES' : 'PUBLISH ASSET'}
                    </button>
                  </div>
               </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Add Mechanic Modal */}
      <AnimatePresence>
        {showAddMechanicForm && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ width: '100%', maxWidth: '600px', padding: '3rem', borderRadius: '1.5rem' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3rem' }}>
                 <div>
                   <h2 className="luxury-font" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Workshop Registration</h2>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Elite Workshop Profile Management</p>
                 </div>
                 <button onClick={() => setShowAddMechanicForm(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
               </div>

               <form onSubmit={handleMechanicSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Full Name / Workshop Name</label>
                    <input name="name" defaultValue={editingMechanic?.name} required className="admin-input" style={{ width: '100%' }} placeholder="e.g. AutoTech Solutions" />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Specialty</label>
                    <input name="specialty" defaultValue={editingMechanic?.specialty} required className="admin-input" style={{ width: '100%' }} placeholder="e.g. Engine Diagnostics" />
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Location / Address</label>
                    <input name="location" defaultValue={editingMechanic?.location} required className="admin-input" style={{ width: '100%' }} placeholder="e.g. Victoria Island, Lagos" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Contact Phone</label>
                      <input name="phone" defaultValue={editingMechanic?.phone} className="admin-input" style={{ width: '100%' }} placeholder="+234..." />
                    </div>
                    <div className="form-group">
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Rating (0-5)</label>
                      <input name="rating" type="number" step="0.1" max="5" defaultValue={editingMechanic?.rating || 0} className="admin-input" style={{ width: '100%' }} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Image URL</label>
                    <input name="image_url" defaultValue={editingMechanic?.image_url} className="admin-input" style={{ width: '100%' }} placeholder="https://..." />
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <label style={{ fontSize: '0.9rem' }}>Transhub Approved</label>
                    <select name="is_approved" defaultValue={editingMechanic?.is_approved ? 'true' : 'false'} className="admin-input" style={{ width: 'auto' }}>
                      <option value="true">YES</option>
                      <option value="false">NO</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setShowAddMechanicForm(false)} style={{ flex: 1, padding: '1rem', borderRadius: '0.8rem', border: '1px solid var(--border-glass)', background: 'transparent', color: 'white', cursor: 'pointer' }}>CANCEL</button>
                    <button type="submit" disabled={loading} className="btn-gold" style={{ flex: 2, padding: '1rem' }}>
                      {loading ? 'SAVING...' : editingMechanic ? 'UPDATE WORKSHOP' : 'REGISTER WORKSHOP'}
                    </button>
                  </div>
               </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* Vehicle Preview Modal */}
      <AnimatePresence>
        {previewCar && (
          <VehicleDetail 
            car={previewCar} 
            onClose={() => setPreviewCar(null)} 
            onInquiry={() => {
              alert('Preview Mode: Inquiry functionality disabled for administrators.');
            }}
          />
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

      {/* --- ADMIN PROVISIONING MODAL --- */}
      <AnimatePresence>
        {showAdminModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="glass" 
               style={{ width: '90%', maxWidth: '500px', borderRadius: '1.5rem', padding: '2rem', border: '1px solid var(--accent-gold)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 className="luxury-font" style={{ fontSize: '1.5rem' }}>
                  {editingAdmin ? 'Modify Admin Access' : 'Provision New Admin'}
                </h3>
                <button onClick={() => {
                  setShowAdminModal(false);
                  setEditingAdmin(null);
                  setNewAdmin({ fullName: '', email: '', password: '', permissions: [] });
                }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <form onSubmit={handleCreateAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label>FULL NAME</label>
                  <input className="admin-input" required value={newAdmin.fullName} onChange={e => setNewAdmin({...newAdmin, fullName: e.target.value})} placeholder="e.g. Officer K" />
                </div>
                
                <div className="form-group">
                  <label>EMAIL IDENTITY</label>
                  <input 
                    className="admin-input" 
                    required 
                    type="email" 
                    value={newAdmin.email} 
                    onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} 
                    placeholder="officer@transhub.com" 
                    disabled={!!editingAdmin}
                    style={{ opacity: editingAdmin ? 0.6 : 1 }}
                  />
                </div>

                {!editingAdmin && (
                  <div className="form-group">
                    <label>ACCESS CREDENTIAL (PASSWORD)</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input className="admin-input" required value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})} style={{ flex: 1, fontFamily: 'monospace' }} />
                      <button type="button" onClick={generatePassword} className="btn-gold" style={{ padding: '0 1rem' }} title="Generate Secure Password">
                        <RefreshCw size={18} />
                      </button>
                      <button type="button" onClick={() => navigator.clipboard.writeText(newAdmin.password)} className="btn-secondary" style={{ padding: '0 1rem', background: 'rgba(255,255,255,0.1)' }} title="Copy to Clipboard">
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                )}

                <div>
                   <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '1px' }}>GRANTED PERMISSIONS</label>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.8rem' }}>
                     {AVAILABLE_PERMISSIONS.map(perm => (
                       <div key={perm.id} 
                            onClick={() => togglePermission(perm.id)}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem', 
                              borderRadius: '0.5rem', cursor: 'pointer',
                              background: newAdmin.permissions.includes(perm.id) ? 'rgba(197, 160, 89, 0.2)' : 'rgba(255,255,255,0.03)',
                              border: newAdmin.permissions.includes(perm.id) ? '1px solid var(--accent-gold)' : '1px solid transparent'
                            }}
                       >
                         <div style={{ 
                           width: '16px', height: '16px', borderRadius: '4px', border: '1px solid var(--text-muted)',
                           background: newAdmin.permissions.includes(perm.id) ? 'var(--accent-gold)' : 'transparent',
                           display: 'flex', alignItems: 'center', justifyContent: 'center'
                         }}>
                           {newAdmin.permissions.includes(perm.id) && <CheckCircle2 size={12} color="black" />}
                         </div>
                         <span style={{ fontSize: '0.8rem' }}>{perm.label}</span>
                       </div>
                     ))}
                   </div>
                </div>

                <button type="submit" className="btn-gold" style={{ marginTop: '1rem' }}>
                  {editingAdmin ? 'SECURE PERMISSION UPDATES' : 'INITIALIZE ADMIN ACCOUNT'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
