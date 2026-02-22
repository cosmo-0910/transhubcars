

import { db, supabase } from '../shared/lib/db';
import type { Car, Order, Inquiry, Preorder, SparePartOrder, TowRequest, SparePart } from '../shared/lib/db';
import { formatPrice } from '../shared/lib/formatters';
import { generateInvoice } from '../client/utils/invoiceGenerator';
import { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Users, ShoppingBag, CarFront, Store, 
  Settings, ShieldAlert, FileText, Activity, 
  LogOut, ChevronRight,
  TrendingUp, Zap, ShieldCheck, DollarSign,
  CheckCircle2, X, Plus, Trash2, Edit, RefreshCw, Copy,
  Menu, Wrench, Truck, Phone, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../shared/lib/AuthContext';
import { useAlert } from '../shared/context/AlertContext';
import SearchAutocomplete from '../shared/components/SearchAutocomplete';
import { VehicleDetail } from '../client/components/VehicleDetail';
import LuxuryAutocomplete from '../vendor/components/LuxuryAutocomplete';
import LuxurySelect from '../vendor/components/LuxurySelect';
import ImageUploadField from '../shared/components/ImageUploadField';
import { useRef } from 'react';
import { ThemeToggle } from '../shared/components/ThemeToggle';
import { TowingManagement } from './components/TowingManagement';
import { StatsOverview } from './components/StatsOverview';
import type { KpiData } from './components/StatsOverview';
import { StatusBadge } from './components/StatusBadge';
import { CarManagementTable } from './components/CarManagementTable';
import { NotificationInbox } from '../shared/components/NotificationInbox';
import { ChatSystem } from '../shared/components/ChatSystem';
import { UserManagementTable } from './components/UserManagementTable';
import { InquiryFeed } from './components/InquiryFeed';
import { VendorManagementTable } from './components/VendorManagementTable';
import { OrderManagementTable } from './components/OrderManagementTable';
import { PreorderManagementTable } from './components/PreorderManagementTable';
import { PartsRequestManagementTable } from './components/PartsRequestManagementTable';
import { SparePartsCatalogTable } from './components/SparePartsCatalogTable';
import AddPartModal from '../vendor/components/AddPartModal';
import { MessageManagement } from './components/MessageManagement';
import { MessageSquare } from 'lucide-react';

// --- Types ---
type Section = 'overview' | 'vendors' | 'users' | 'inventory' | 'orders' | 'sales' | 'ledger' | 'audit' | 'settings' | 'admins' | 'mechanics' | 'towing' | 'inquiries' | 'preorders' | 'parts-requests' | 'parts-catalog' | 'messages';



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





const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

const CAR_CONDITIONS = [
  "Foreign Used", "Nigerian Used", "New"
];

const CAR_BODY_TYPES = [
  "SUV", "Saloon", "Coupe", "Convertible", "Sports", "Pickup", "Crossover", 
  "Hatchback", "Van", "Wagon", "Limousine", "Other"
];

// Mapping for auto-selection (expand as needed)
const MODEL_BODY_TYPE_MAPPING: Record<string, string> = {
  // SUVs
  "Lx": "SUV", "Rx": "SUV", "Gx": "SUV", "Nx": "SUV", "Ux": "SUV",
  "G-Class": "SUV", "Gle": "SUV", "Glc": "SUV", "Gls": "SUV", "Gla": "SUV",
  "X1": "SUV", "X3": "SUV", "X5": "SUV", "X6": "SUV", "X7": "SUV",
  "Range Rover": "SUV", "Defender": "SUV", "Discovery": "SUV", "Velar": "SUV",
  "Cullinan": "SUV", "Urus": "SUV", "Bentayga": "SUV", "Cayenne": "SUV", "Macan": "SUV",
  "Land Cruiser": "SUV", "Prado": "SUV", "Highlander": "SUV", "Rav4": "SUV", "Fortuner": "SUV",
  
  // Saloons (Sedans)
  "Es": "Saloon", "Ls": "Saloon", "Is": "Saloon", "Gs": "Saloon",
  "S-Class": "Saloon", "E-Class": "Saloon", "C-Class": "Saloon", "A-Class": "Saloon",
  "7 Series": "Saloon", "5 Series": "Saloon", "3 Series": "Saloon",
  "Camry": "Saloon", "Corolla": "Saloon", "Avalon": "Saloon",
  "Ghost": "Saloon", "Phantom": "Saloon", "Flying Spur": "Saloon",

  // Sports / Supercars
  "911": "Sports", "718": "Sports", "Huracan": "Sports", "Aventador": "Sports", 
  "Revuelto": "Sports", "F8": "Sports", "Roma": "Sports", "812": "Sports",
  "R8": "Sports", "Amg Gt": "Sports", "Sl": "Convertible",

  // Coupes (Standard)
  "Mustang": "Coupe", "Camaro": "Coupe", "Challenger": "Coupe",
  "Lc": "Coupe", "Rc": "Coupe", "Supra": "Coupe", "Cle": "Coupe"
};

const STANDARD_FEATURES = [
  'Air Conditioning', 'Alloy Wheels', 'AM/FM Radio', 'Android Auto / Apple CarPlay',
  'Anti-Lock Brakes', 'Armrests', 'Blind Spot Monitor', 'CD Player',
  'Cruise Control', 'Cup Holders', 'DVD Player', 'Electric Mirrors',
  'Electric Windows', 'Fog Lights', 'Front Fog Lamps', 'Heated Seats',
  'Keyless Entry / Start', 'Leather Seats / Upholstery', 'LED Headlights',
  'Navigation System', 'Parking Sensors', 'Power Steering', 'Rear Camera',
  'Roof Rack', 'Sunroof / Moonroof', 'Touchscreen', 'Traction Control',
  'USB / AUX Port', 'Xenon Lights',
];

const NIGERIAN_MARKET_TAGS = [
  'Accident Free', 'First Body', 'First Owner', 'Full Option / Fully Loaded',
  'Leather Interior', 'Low Mileage', 'Neatly Used', 'New Shape / Facelift',
  'No Faults', 'Registered', 'Reverse Camera', 'Soundproofed',
];

export const AdminDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const { showAlert } = useAlert();
  
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
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [partsRequests, setPartsRequests] = useState<SparePartOrder[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [towRequests, setTowRequests] = useState<TowRequest[]>([]);
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
  const [activeSettingsTab, setActiveSettingsTab] = useState('branding');

  // Detail View State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [selectedPreorder, setSelectedPreorder] = useState<Preorder | null>(null);
  const [selectedPartsRequest, setSelectedPartsRequest] = useState<SparePartOrder | null>(null);
  const [selectedSparePart, setSelectedSparePart] = useState<SparePart | null>(null);
  const [selectedTowRequest, setSelectedTowRequest] = useState<TowRequest | null>(null);

  // Editing State
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [previewCar, setPreviewCar] = useState<Car | null>(null);
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [showAddPartForm, setShowAddPartForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingMechanic, setEditingMechanic] = useState<any | null>(null);
  const [showAddMechanicForm, setShowAddMechanicForm] = useState(false);

  // Form State
  const [primaryImage, setPrimaryImage] = useState<File | string | null>(null);
  const [galleryImages, setGalleryImages] = useState<(File | string)[]>([]);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [adminSelectedFeatures, setAdminSelectedFeatures] = useState<string[]>([]);
  const cachedMakes = useRef<any[] | null>(null);

  // Sync state when editing
  useEffect(() => {
    if (editingCar) {
      setPrimaryImage(editingCar.image_url || null);
      setGalleryImages(editingCar.gallery_urls || []);
      setSelectedMake(editingCar.make || '');
      setAdminSelectedFeatures(editingCar.features || []);
      // If editing, use existing body_type or auto-detect if missing
    } else {
      setPrimaryImage(null);
      setGalleryImages([]);
      setSelectedMake('');
      setAdminSelectedFeatures([]);
    }
  }, [editingCar, showAddCarForm]);

  // Auto-populate Body Type based on Model
  const [selectedBodyType, setSelectedBodyType] = useState<string>('');

  const handleModelChange = (model: string) => {
    if (!model) return;
    
    // Simple check: does the model string contain any of our keys?
    // We check longer keys first to match specific models (e.g. "Range Rover Sport" vs "Range Rover")
    // But our mapping is simple keys. Let's do a direct lookup or partial match.
    
    const normalizedModel = model.toLowerCase();
    
    // Check for exact keys or partial matches in the mapping
    const matchedKey = Object.keys(MODEL_BODY_TYPE_MAPPING).find(key => 
      normalizedModel.includes(key.toLowerCase())
    );

    if (matchedKey) {
      setSelectedBodyType(MODEL_BODY_TYPE_MAPPING[matchedKey]);
    }
  };

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
    const [
      carsData, 
      ordersData, 
      allProfiles, 
      adminsData, 
      inquiriesData, 
      preordersData, 
      partsRequestsData, 
      sparePartsData,
      towData, 
      settingsData
    ] = await Promise.all([
      db.getCars().catch(err => { console.error('Cars fetch fail:', err); return []; }),
      db.getOrders().catch(err => { console.error('Orders fetch fail:', err); return []; }),
      db.getProfiles().catch(err => { console.error('Profiles fetch fail:', err); return []; }),
      db.getAdmins().catch(err => { console.error('Admins fetch fail:', err); return []; }),
      db.getInquiries().catch(err => { console.error('Inquiries fetch fail:', err); return []; }),
      db.getPreorders().catch(err => { console.error('Preorders fetch fail:', err); return []; }),
      db.getSparePartOrders().catch(err => { console.error('Parts requests fetch fail:', err); return []; }),
      db.getSpareParts().catch(err => { console.error('Spare parts fetch fail:', err); return []; }),
      db.getTowRequests().catch(err => { console.error('Tow fetch fail:', err); return []; }),
      db.getPlatformSettings().catch(err => { console.error('Settings fetch fail:', err); return []; })
    ]);
      
      let logsData: any[] = [];
      try {
        logsData = await db.getAuditLogs();
      } catch (logErr: any) {
        console.error('Audit log failure:', logErr);
        // We don't throw here to allow the rest of the dashboard to work
        // but we could set a specific state if we wanted to show a warning
      }
      
      setCars(carsData);
      setOrders(ordersData);
    setUsers(allProfiles); 
    setVendors(allProfiles.filter((p: any) => ['pending', 'approved', 'rejected'].includes(p.vendor_status)));
    setAdmins(adminsData);
    setInquiries(inquiriesData);
    setPreorders(preordersData);
    setPartsRequests(partsRequestsData);
    setSpareParts(sparePartsData);
    setTowRequests(towData);
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
    showAlert({
      title: 'Vendor Verification',
      message: `Are you sure you want to ${status} this vendor?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: status === 'approved' ? 'Approve' : 'Reject', 
          style: status === 'approved' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              const updates: any = { vendor_status: status };
              if (status === 'approved') updates.role = 'vendor';
              
              const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', id);
              
              if (error) throw error;
              
              await db.logAction(`Vendor ${status}`, 'profile', id, { business_name: updates.business_name });
              await loadAllData();
              showAlert({
                title: 'Success',
                message: `Vendor ${status} successfully!`,
              });
            } catch (error) {
              showAlert({
                title: 'Error',
                message: `Failed to ${status} vendor: ${(error as any)?.message || 'Unknown error'}`,
                buttons: [{ text: 'OK', style: 'destructive' }]
              });
            }
          }
        }
      ]
    });
  };

  const handleRevokeVendor = async (id: string, name: string) => {
    showAlert({
      title: 'Revoke Vendor Status',
      message: `Are you sure you want to revoke vendor status for ${name}? This will convert them back to a regular customer.`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Revoke Status', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('profiles')
                .update({
                  role: 'customer',
                  vendor_status: null,
                  vendor_type: null,
                  business_name: null,
                  business_details: null
                })
                .eq('id', id);
              
              if (error) throw error;
              
              await db.logAction('Revoke Vendor Status', 'profile', id, { name });
              await loadAllData();
              showAlert({
                title: 'Status Revoked',
                message: `${name} has been successfully converted to a regular customer.`,
              });
            } catch (error) {
              showAlert({
                title: 'Error',
                message: `Failed to revoke vendor status: ${(error as any)?.message || 'Unknown error'}`,
                buttons: [{ text: 'OK', style: 'destructive' }]
              });
            }
          }
        }
      ]
    });
  };

  const handleCarApproval = async (id: string, status: 'approved' | 'rejected') => {
    showAlert({
      title: 'Review Listing',
      message: `Are you sure you want to ${status} this vehicle listing?`,
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: status === 'approved' ? 'Approve' : 'Reject', 
          style: status === 'approved' ? 'default' : 'destructive',
          onPress: async () => {
            await db.updateCar(id, { approval_status: status });
            await db.logAction(`Listing ${status}`, 'car', id);
            loadAllData();
          }
        }
      ]
    });
  };

  const handleDeleteCar = async (id: string) => {
    showAlert({
      title: 'Decommission Asset',
      message: 'Are you sure you want to permanently remove this vehicle from the inventory?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            const carToDelete = cars.find(c => c.id === id);
            await db.deleteCar(id);
            await db.logAction('Delete Vehicle', 'car', id, { 
              vehicle: carToDelete ? `${carToDelete.year} ${carToDelete.make} ${carToDelete.model}` : 'Unknown' 
            });
            loadAllData();
          }
        }
      ]
    });
  };

  const handlePinCar = async (id: string, currentStatus: boolean | undefined) => {
    try {
      await db.togglePinCar(id, !currentStatus);
      await db.logAction(currentStatus ? 'Unpin Vehicle' : 'Pin Vehicle', 'car', id);
      loadAllData();
      showAlert({ title: 'Success', message: `Vehicle ${currentStatus ? 'unpinned' : 'pinned'} successfully.` });
    } catch (err: any) {
      showAlert({ title: 'Error', message: err.message, buttons: [{ text: 'OK', style: 'destructive' }] });
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
      showAlert({
        title: 'Incomplete Protocol',
        message: 'Please provide all required credentials to proceed with admin registration.',
        buttons: [{ text: 'Affirmative', style: 'default' }]
      });
      return;
    }

    const actionText = editingAdmin ? 'update permissions' : 'create account';
    
    showAlert({
      title: 'Credential Authority',
      message: `Are you sure you want to ${actionText} for ${newAdmin.fullName}?`,
      buttons: [
        { text: 'Abort', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: 'default',
          onPress: async () => {
            try {
              if (editingAdmin) {
                await db.updateAdmin({
                  id: editingAdmin.id,
                  fullName: newAdmin.fullName,
                  permissions: newAdmin.permissions
                });
                await db.logAction('Update Admin Permissions', 'profile', editingAdmin.id, { 
                  fullName: newAdmin.fullName,
                  permissions: newAdmin.permissions 
                });
                showAlert({ title: 'Success', message: 'Admin permissions updated successfully.' });
                setShowAdminModal(false);
                setEditingAdmin(null);
                setNewAdmin({ fullName: '', email: '', password: '', permissions: [] });
                loadAllData();
              } else {
                const result = await db.createAdmin(newAdmin);
                await db.logAction('Create Admin Account', 'profile', result.id, { 
                  fullName: newAdmin.fullName,
                  email: newAdmin.email 
                });
                showAlert({ title: 'Success', message: 'Admin account created successfully.' });
                setShowAdminModal(false);
                setNewAdmin({ fullName: '', email: '', password: '', permissions: [] });
                loadAllData();
              }
            } catch (err: any) {
              const errorMessage = err.message === 'Failed to fetch' 
                ? 'Failed to connect to the management server. Please ensure the backend (port 3001) is running.'
                : `Failed to ${editingAdmin ? 'update' : 'create'} admin: ${err.message}`;
              
              showAlert({
                title: 'System Access Error',
                message: errorMessage,
                buttons: [{ text: 'Acknowledged', style: 'destructive' }]
              });
            }
          }
        }
      ]
    });
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
    { id: 'orders', label: 'Orders Management' },
    { id: 'sales', label: 'Sales Velocity' },
    { id: 'ledger', label: 'Financial Ledger' },
    { id: 'admins', label: 'Admin Management' },
    { id: 'audit', label: 'Audit Logs' },
    { id: 'settings', label: 'System Settings' },
    { id: 'mechanics', label: 'Workshop Management' },
    { id: 'towing', label: 'Towing Fleet' },
    { id: 'inquiries', label: 'Client Inquiries' },
    { id: 'preorders', label: 'Preorder Requests' },
    { id: 'parts-requests', label: 'Parts Requests' }
  ];

  const handleUpdateSetting = async (key: string, updates: any) => {
    try {
      setLoading(true);
      const currentSetting = platformSettings.find(s => s.key === key);
      const newValue = { ...(currentSetting?.value || {}), ...updates };
      
      await db.updatePlatformSetting(key, newValue);
      await db.logAction(`Update ${key.charAt(0).toUpperCase() + key.slice(1)} Settings`, 'platform_settings', key, updates);
      
      await loadAllData();
      showAlert({
        title: 'System Synchronized',
        message: 'Security configurations and platform settings have been updated.',
      });
    } catch (err: any) {
      showAlert({
        title: 'Synthesis Failed',
        message: `System was unable to synchronize settings: ${err.message}`,
        buttons: [{ text: 'Acknowledged', style: 'destructive' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const SETTINGS_TABS = [
    { id: 'branding', label: 'Identity & Aesthetics', icon: Zap },
    { id: 'support', label: 'Communication Hub', icon: Phone },
    { id: 'operations', label: 'Engine Room (Ops)', icon: Activity },
    { id: 'finance', label: 'Treasury (Fees)', icon: DollarSign },
    { id: 'legal', label: 'Compliance & Legal', icon: ShieldAlert },
    { id: 'security', label: 'Security & Analytics', icon: ShieldCheck }
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
        original_price: parseFloat(formData.get('original_price') as string) || null,
        status: formData.get('status'),
        condition: formData.get('condition'),
        body_type: formData.get('body_type'),
        state: formData.get('state'),
        mileage: parseInt(formData.get('mileage') as string) || 0,
        transmission: formData.get('transmission'),
        fuel_type: formData.get('fuel_type'),
        exterior_color: formData.get('exterior_color'),
        interior_color: formData.get('interior_color'),
        engine: formData.get('engine'),
        vin: formData.get('vin'),
        description: formData.get('description'),
        features: adminSelectedFeatures,
        image_url: primaryUrl || 'https://images.unsplash.com/photo-1542362567-b055034b4c1d?q=80',
        gallery_urls: galleryUrls.filter(url => typeof url === 'string' && url.trim() !== ''),
        vendor_id: null, // Explicitly null for Transhub Official posts
        approval_status: 'approved' // Admins are auto-approved
      };

      if (editingCar) {
        await db.updateCar(editingCar.id, carData);
        await db.logAction('Update Vehicle Listing', 'car', editingCar.id, { 
          vehicle: `${carData.year} ${carData.make} ${carData.model}` 
        });
        showAlert({ title: 'Success', message: 'Vehicle protocol updated successfully.' });
      } else {
        const result = await db.saveCar(carData);
        await db.logAction('Create Vehicle Listing', 'car', result.id, { 
          vehicle: `${carData.year} ${carData.make} ${carData.model}` 
        });
        showAlert({ title: 'Success', message: 'New vehicle asset published to the showroom.' });
      }
      
      loadAllData();
      setShowAddCarForm(false);
      setEditingCar(null);
    } catch (err: any) {
      console.error('Failed to save vehicle:', err);
      const isDuplicate = err.message === 'Duplicate image prohibited';
      
      showAlert({
        title: isDuplicate ? 'Integrity Check' : 'Publishing Error',
        message: isDuplicate ? 'Duplicate image prohibited. This asset has already been registered on the platform.' : (err.message === 'HTTP 400 error' ? 'System rejected the upload protocol. Please verify your network connection or try again.' : (err.message || 'Failed to save vehicle listings')),
        buttons: [{ text: 'OK', style: 'destructive' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: 'active' | 'suspended' | 'banned' | 'disabled') => {
    showAlert({
      title: 'Status Authority',
      message: `Are you sure you want to change this user's status to ${action}?`,
      buttons: [
        { text: 'Abort', style: 'cancel' },
        { 
          text: 'Confirm', 
          style: action === 'active' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await db.updateProfileStatus(userId, action);
              const user = users.find(u => u.id === userId);
              await db.logAction(`User ${action.toUpperCase()}`, 'profile', userId, { 
                email: user?.email,
                fullName: user?.full_name 
              });
              loadAllData();
              showAlert({ title: 'Success', message: `User status updated to ${action}` });
            } catch (err: any) {
              showAlert({
                title: 'Operation Failed',
                message: `Failed to update status: ${err.message}`,
                buttons: [{ text: 'OK', style: 'destructive' }]
              });
            }
          }
        }
      ]
    });
  };

  const handlePreorderReview = async (userId: string, status: 'approved' | 'rejected') => {
    showAlert({
      title: 'Preorder Verification',
      message: `Confirm ${status.toUpperCase()} for preorder access application?`,
      buttons: [
        { text: 'Abort', style: 'cancel' },
        { 
          text: status === 'approved' ? 'Approve' : 'Reject', 
          style: status === 'approved' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await db.reviewPreorderApplication(userId, status);
              const user = users.find(u => u.id === userId);
              await db.logAction(`Preorder Application ${status.toUpperCase()}`, 'profile', userId, { 
                email: user?.email 
              });
              loadAllData();
              showAlert({ title: 'Success', message: `Application ${status}` });
            } catch (err: any) {
              showAlert({
                title: 'Review Error',
                message: `Failed to process application: ${err.message}`,
                buttons: [{ text: 'OK', style: 'destructive' }]
              });
            }
          }
        }
      ]
    });
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
        showAlert({ title: 'Success', message: 'Mechanic record updated successfully.' });
      } else {
        await db.saveMechanic(mechanicData);
        await db.logAction('Add Mechanic', 'mechanic');
        showAlert({ title: 'Success', message: 'New mechanic registered in the network.' });
      }
      
      loadAllData();
      setShowAddMechanicForm(false);
      setEditingMechanic(null);
    } catch (err: any) {
      console.error('Failed to save mechanic:', err);
      showAlert({
        title: 'Registry Error',
        message: err.message || 'Failed to save mechanic details',
        buttons: [{ text: 'OK', style: 'destructive' }]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMechanic = async (id: string) => {
    showAlert({
      title: 'Remove Mechanic',
      message: 'Are you sure you want to delete this specialist from the registry?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await db.deleteMechanic(id);
              await db.logAction('Delete Mechanic', 'mechanic', id);
              loadAllData();
              showAlert({ title: 'Success', message: 'Mechanic record decommissioned.' });
            } catch (err: any) {
              showAlert({
                title: 'Operation Failed',
                message: `Failed to delete mechanic: ${err.message}`,
                buttons: [{ text: 'OK', style: 'destructive' }]
              });
            }
          }
        }
      ]
    });
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
    pendingListings: cars.filter(c => c.approval_status === 'pending').length,
    pendingInquiries: inquiries.filter(i => i.status === 'New').length,
    pendingPreorders: preorders.filter(p => p.status === 'Searching').length,
    pendingParts: partsRequests.filter(p => p.status === 'Pending').length,
    pendingTowing: towRequests.filter(t => t.status === 'Searching').length,
    volumeByBodyType: Object.entries(orders.reduce((acc, order) => {
      const bodyType = order.cars?.body_type || 'Other';
      acc[bodyType] = (acc[bodyType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>))
      .map(([name, count]) => ({ name, value: orders.length > 0 ? (count / orders.length) * 100 : 0 }))
      .sort((a, b) => b.value - a.value),
    topRegions: Object.entries(orders.reduce((acc, order) => {
      // Prioritize shipping address state if available, fallback to user state
      // Note: order.shipping_address isn't in Order interface yet, using user profile state
      const state = users.find(u => u.id === order.user_id)?.state || 'Unknown';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {} as Record<string, number>))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }), [users, vendors, orders, cars, inquiries, preorders, partsRequests, towRequests]);

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
      case 'inventory': return cars.filter(c => 
        `${c.make} ${c.model}`.toLowerCase().includes(q) || 
        (Array.isArray(c.features) && c.features.some(f => f.toLowerCase().includes(q)))
      );
      case 'orders': 
      case 'sales':
      case 'ledger': return orders.filter(o => o.id.includes(q) || (o.payment_ref || '').toLowerCase().includes(q));
      case 'audit': return auditLogs.filter(l => (l.action || '').toLowerCase().includes(q) || (l.profiles?.full_name || '').toLowerCase().includes(q));
      case 'admins': return admins.filter(a => (a.full_name || '').toLowerCase().includes(q) || (a.email || '').toLowerCase().includes(q));
      case 'mechanics': return mechanics.filter(m => (m.name || '').toLowerCase().includes(q) || (m.specialty || '').toLowerCase().includes(q));
      case 'inquiries': return inquiries.filter(i => (i.name || '').toLowerCase().includes(q) || (i.email || '').toLowerCase().includes(q) || (i.carName || '').toLowerCase().includes(q));
      case 'preorders': return preorders.filter(p => (p.name || '').toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q) || (p.make || '').toLowerCase().includes(q) || (p.model || '').toLowerCase().includes(q));
      case 'parts-requests': return partsRequests.filter(p => (p.part_name || '').toLowerCase().includes(q) || (p.vehicle_make || '').toLowerCase().includes(q) || (p.vehicle_model || '').toLowerCase().includes(q));
      default: return [];
    }
  }, [activeSection, vendors, users, cars, orders, auditLogs, admins, mechanics, inquiries, preorders, partsRequests, towRequests, searchQuery]);

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
            {hasPermission('inquiries') && <SidebarItem icon={Phone} label="Client Inquiries" active={activeSection === 'inquiries'} onClick={() => setActiveSection('inquiries')} badge={stats.pendingInquiries} />}
            {hasPermission('preorders') && <SidebarItem icon={RefreshCw} label="Preorder Requests" active={activeSection === 'preorders'} onClick={() => setActiveSection('preorders')} badge={stats.pendingPreorders} />}
            {hasPermission('parts-requests') && <SidebarItem icon={Package} label="Parts Requests" active={activeSection === 'parts-requests'} onClick={() => setActiveSection('parts-requests')} badge={stats.pendingParts} />}
            <SidebarItem icon={Wrench} label="Parts Catalog" active={activeSection === 'parts-catalog'} onClick={() => setActiveSection('parts-catalog')} />
            <SidebarItem icon={MessageSquare} label="Messages" active={activeSection === 'messages'} onClick={() => setActiveSection('messages')} />
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
            <NotificationInbox />
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
                <StatsOverview stats={stats} orders={orders} hasPermission={hasPermission} />
              )}

              {/* --- MANAGEMENT VIEWS --- */}
              {['vendors', 'users', 'inventory', 'orders', 'inquiries', 'preorders', 'parts-requests', 'parts-catalog'].includes(activeSection) && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 className="luxury-font" style={{ fontSize: '2rem', margin: 0, textTransform: 'capitalize' }}>
                      {activeSection === 'vendors' ? 'Vendor Management' : 
                       activeSection === 'inventory' ? 'Inventory Control' : 
                       activeSection === 'inquiries' ? 'Client Inquiries' :
                       activeSection === 'preorders' ? 'Preorder Requests' :
                       activeSection === 'parts-requests' ? 'Parts Sourcing' :
                       activeSection === 'parts-catalog' ? 'Parts Catalog' :
                       `${activeSection} Management`}
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

                  <div style={{ marginTop: '1rem' }}>
                    {activeSection === 'vendors' && (
                      <VendorManagementTable 
                        vendors={filteredData}
                        vendorFilter={vendorFilter}
                        onVendorAction={handleVendorAction}
                        onPreorderReview={handlePreorderReview}
                        onSelectVendor={setSelectedVendor}
                        onRevokeVendor={handleRevokeVendor}
                      />
                    )}
                    {activeSection === 'users' && (
                      <UserManagementTable 
                        users={filteredData} 
                        onAction={handleUserAction} 
                      />
                    )}
                    {activeSection === 'inventory' && (
                      <CarManagementTable
                        cars={filteredData}
                        onEdit={(car) => { setEditingCar(car); setShowAddCarForm(true); }}
                        onDelete={handleDeleteCar}
                        onPin={handlePinCar}
                        onPreview={setPreviewCar}
                        onApproval={handleCarApproval}
                      />
                    )}
                    {activeSection === 'orders' && (
                      <OrderManagementTable 
                        orders={filteredData}
                        onSelectedOrder={setSelectedOrder}
                      />
                    )}
                    {activeSection === 'inquiries' && (
                      <InquiryFeed 
                        inquiries={filteredData}
                        onViewDetails={setSelectedInquiry}
                        onMarkContacted={(id) => db.updateInquiryStatus(id, 'Contacted').then(loadAllData)}
                        onArchive={(id) => db.updateInquiryStatus(id, 'Archived').then(loadAllData)}
                      />
                    )}
                    {activeSection === 'preorders' && (
                      <PreorderManagementTable 
                        preorders={filteredData}
                        onSelectedPreorder={setSelectedPreorder}
                        onUpdateStatus={(id, status) => db.updatePreorderStatus(id, status).then(loadAllData)}
                      />
                    )}
                    {activeSection === 'parts-requests' && (
                      <PartsRequestManagementTable 
                        partsRequests={filteredData}
                        onSelectedPartsRequest={setSelectedPartsRequest}
                        onUpdateStatus={(id, status) => db.updateSparePartOrderStatus(id, status).then(loadAllData)}
                      />
                    )}
                    {activeSection === 'parts-catalog' && (
                      <SparePartsCatalogTable 
                        parts={spareParts} 
                        onRefresh={loadAllData} 
                        onEdit={(part) => { setEditingPart(part); setShowAddPartForm(true); }}
                        onAdd={() => { setEditingPart(null); setShowAddPartForm(true); }}
                      />
                    )}
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
                          {stats.volumeByBodyType.length > 0 ? stats.volumeByBodyType.map(item => (
                            <div key={item.name} style={{ width: '100%' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                                <span>{item.name}</span>
                                <span style={{ color: 'var(--accent-gold)' }}>{item.value.toFixed(1)}%</span>
                              </div>
                              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${item.value}%`, background: 'var(--accent-gold)' }} />
                              </div>
                            </div>
                          )) : <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No sales data available</div>}
                        </div>
                     </div>
                     <div className="glass" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>TOP ACTIVE REGIONS</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {stats.topRegions && stats.topRegions.length > 0 ? stats.topRegions.map(([region, count]) => (
                             <div key={region} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                               <span style={{ fontWeight: 600 }}>{region}</span>
                               <span style={{ color: 'var(--accent-gold)' }}>{count} Orders</span>
                             </div>
                          )) : <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No regional data</div>}
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
                                <span style={{ color: '#4ade80', fontSize: '0.8rem' }}>100%</span>
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
              {activeSection === 'towing' && <TowingManagement onSelectRequest={setSelectedTowRequest} />}

              {/* --- MESSAGES --- */}
              {activeSection === 'messages' && <MessageManagement />}

              {/* --- SETTINGS --- */}
              {activeSection === 'settings' && (
                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '3rem', minHeight: '600px' }}>
                  {/* Left Sidebar Tabs */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRight: '1px solid var(--border-glass)', paddingRight: '1.5rem' }}>
                    {SETTINGS_TABS.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveSettingsTab(tab.id)}
                        className="smooth-transition"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '1rem 1.2rem',
                          borderRadius: '0.8rem',
                          background: activeSettingsTab === tab.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.03)',
                          color: activeSettingsTab === tab.id ? 'black' : 'var(--text-muted)',
                          border: 'none',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontSize: '0.9rem',
                          fontWeight: 600
                        }}
                      >
                        <tab.icon size={18} />
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Right Content Area */}
                  <div className="glass" style={{ padding: '2.5rem', borderRadius: '1.5rem', minHeight: '600px' }}>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeSettingsTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* Branding Tab */}
                        {activeSettingsTab === 'branding' && (
                          <div>
                            <h3 className="luxury-font" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Identity & Aesthetics</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>PLATFORM NAME</label>
                                <input 
                                  className="admin-input" 
                                  style={{ width: '100%' }} 
                                  placeholder="e.g. Transhub Luxury"
                                  defaultValue={platformSettings.find(s => s.key === 'branding')?.value?.name}
                                  onBlur={(e) => handleUpdateSetting('branding', { name: e.target.value })}
                                />
                              </div>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>SLOGAN / TAGLINE</label>
                                <input 
                                  className="admin-input" 
                                  style={{ width: '100%' }} 
                                  placeholder="Elevating Nigerian Automotive..."
                                  defaultValue={platformSettings.find(s => s.key === 'branding')?.value?.tagline}
                                  onBlur={(e) => handleUpdateSetting('branding', { tagline: e.target.value })}
                                />
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                <div className="form-group">
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>PRIMARY COLOR</label>
                                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <input 
                                      type="color" 
                                      defaultValue={platformSettings.find(s => s.key === 'branding')?.value?.primary_color || "#c5a059"}
                                      onChange={(e) => handleUpdateSetting('branding', { primary_color: e.target.value })}
                                      style={{ width: '50px', height: '40px', border: '1px solid var(--border-glass)', background: 'none' }} 
                                    />
                                    <span style={{ fontSize: '0.9rem', fontFamily: 'monospace' }}>{platformSettings.find(s => s.key === 'branding')?.value?.primary_color || "#C5A059"}</span>
                                  </div>
                                </div>
                                <div className="form-group">
                                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>LOGO ASSET URL</label>
                                  <input 
                                    className="admin-input" 
                                    style={{ width: '100%' }} 
                                    defaultValue={platformSettings.find(s => s.key === 'branding')?.value?.logo_url}
                                    onBlur={(e) => handleUpdateSetting('branding', { logo_url: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Support Tab */}
                        {activeSettingsTab === 'support' && (
                          <div>
                            <h3 className="luxury-font" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Communication Hub</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>SUPPORT EMAIL</label>
                                <input 
                                  className="admin-input" 
                                  style={{ width: '100%' }} 
                                  defaultValue={platformSettings.find(s => s.key === 'support')?.value?.email}
                                  onBlur={(e) => handleUpdateSetting('support', { email: e.target.value })}
                                />
                              </div>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>HOTLINE PHONE</label>
                                <input 
                                  className="admin-input" 
                                  style={{ width: '100%' }} 
                                  defaultValue={platformSettings.find(s => s.key === 'support')?.value?.phone}
                                  onBlur={(e) => handleUpdateSetting('support', { phone: e.target.value })}
                                />
                              </div>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>WHATSAPP BUSINESS</label>
                                <input 
                                  className="admin-input" 
                                  style={{ width: '100%' }} 
                                  defaultValue={platformSettings.find(s => s.key === 'support')?.value?.whatsapp}
                                  onBlur={(e) => handleUpdateSetting('support', { whatsapp: e.target.value })}
                                />
                              </div>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>OFFICE ADDRESS</label>
                                <input 
                                  className="admin-input" 
                                  style={{ width: '100%' }} 
                                  defaultValue={platformSettings.find(s => s.key === 'support')?.value?.address}
                                  onBlur={(e) => handleUpdateSetting('support', { address: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Operations Tab */}
                        {activeSettingsTab === 'operations' && (
                          <div>
                            <h3 className="luxury-font" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Engine Room (Operations)</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: platformSettings.find(s => s.key === 'operations')?.value?.maintenance_mode ? '1px solid #ef4444' : '1px solid transparent' }}>
                                <div>
                                  <div style={{ fontWeight: 600 }}>Maintenance Mode</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Immediately suspend public access for emergency protocols</div>
                                </div>
                                <button 
                                  onClick={() => handleUpdateSetting('operations', { maintenance_mode: !platformSettings.find(s => s.key === 'operations')?.value?.maintenance_mode })}
                                  style={{ 
                                    width: '50px', height: '26px', borderRadius: '13px', border: 'none', position: 'relative', cursor: 'pointer',
                                    background: platformSettings.find(s => s.key === 'operations')?.value?.maintenance_mode ? '#ef4444' : '#333'
                                  }}
                                >
                                  <motion.div 
                                    animate={{ x: platformSettings.find(s => s.key === 'operations')?.value?.maintenance_mode ? 24 : 2 }}
                                    style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px' }} 
                                  />
                                </button>
                              </div>
                              
                              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 600 }}>Towing Service Gateway</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enable or disable the real-time recovery fleet requests</div>
                                </div>
                                <button 
                                  onClick={() => handleUpdateSetting('operations', { towing_service_enabled: !platformSettings.find(s => s.key === 'operations')?.value?.towing_service_enabled })}
                                  style={{ 
                                    width: '50px', height: '26px', borderRadius: '13px', border: 'none', position: 'relative', cursor: 'pointer',
                                    background: platformSettings.find(s => s.key === 'operations')?.value?.towing_service_enabled ? 'var(--accent-gold)' : '#333'
                                  }}
                                >
                                  <motion.div 
                                    animate={{ x: platformSettings.find(s => s.key === 'operations')?.value?.towing_service_enabled ? 24 : 2 }}
                                    style={{ width: '20px', height: '20px', background: platformSettings.find(s => s.key === 'operations')?.value?.towing_service_enabled ? 'black' : 'white', borderRadius: '50%', position: 'absolute', top: '3px' }} 
                                  />
                                </button>
                              </div>

                              <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>AUDIT LOG VERBOSITY</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  {['Low', 'Medium', 'High'].map(level => (
                                    <button 
                                      key={level}
                                      onClick={() => handleUpdateSetting('operations', { audit_level: level })}
                                      style={{ 
                                        flex: 1, padding: '0.8rem', borderRadius: '0.5rem', border: '1px solid var(--border-glass)', cursor: 'pointer',
                                        background: platformSettings.find(s => s.key === 'operations')?.value?.audit_level === level ? 'var(--accent-gold)' : 'transparent',
                                        color: platformSettings.find(s => s.key === 'operations')?.value?.audit_level === level ? 'black' : 'white'
                                      }}
                                    >
                                      {level}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Finance Tab */}
                        {activeSettingsTab === 'finance' && (
                          <div>
                            <h3 className="luxury-font" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Treasury & Economics</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>TOWING BASE FEE (₦)</label>
                                <input 
                                  type="number" className="admin-input" style={{ width: '100%' }} 
                                  defaultValue={platformSettings.find(s => s.key === 'finance')?.value?.towing_base_fee}
                                  onBlur={(e) => handleUpdateSetting('finance', { towing_base_fee: Number(e.target.value) })}
                                />
                              </div>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>TOWING COST PER KM (₦)</label>
                                <input 
                                  type="number" className="admin-input" style={{ width: '100%' }} 
                                  defaultValue={platformSettings.find(s => s.key === 'finance')?.value?.towing_cost_per_km}
                                  onBlur={(e) => handleUpdateSetting('finance', { towing_cost_per_km: Number(e.target.value) })}
                                />
                              </div>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>LISTING COMMISSION (%)</label>
                                <input 
                                  type="number" className="admin-input" style={{ width: '100%' }} 
                                  defaultValue={platformSettings.find(s => s.key === 'finance')?.value?.car_listing_commission_pct}
                                  onBlur={(e) => handleUpdateSetting('finance', { car_listing_commission_pct: Number(e.target.value) })}
                                />
                              </div>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>PARTS COMMISSION (%)</label>
                                <input 
                                  type="number" className="admin-input" style={{ width: '100%' }} 
                                  defaultValue={platformSettings.find(s => s.key === 'finance')?.value?.parts_sale_commission_pct}
                                  onBlur={(e) => handleUpdateSetting('finance', { parts_sale_commission_pct: Number(e.target.value) })}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Legal Tab */}
                        {activeSettingsTab === 'legal' && (
                          <div>
                            <h3 className="luxury-font" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Compliance & Legal</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>TERMS OF SERVICE URL</label>
                                <input 
                                  className="admin-input" style={{ width: '100%' }} 
                                  defaultValue={platformSettings.find(s => s.key === 'legal')?.value?.terms_url}
                                  onBlur={(e) => handleUpdateSetting('legal', { terms_url: e.target.value })}
                                />
                              </div>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>PRIVACY POLICY URL</label>
                                <input 
                                  className="admin-input" style={{ width: '100%' }} 
                                  defaultValue={platformSettings.find(s => s.key === 'legal')?.value?.privacy_url}
                                  onBlur={(e) => handleUpdateSetting('legal', { privacy_url: e.target.value })}
                                />
                              </div>
                              <div className="form-group">
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>REFUND POLICY OVERVIEW</label>
                                <textarea 
                                  className="admin-input" style={{ width: '100%', height: '100px', resize: 'none', padding: '1rem' }} 
                                  defaultValue={platformSettings.find(s => s.key === 'legal')?.value?.refund_policy}
                                  onBlur={(e) => handleUpdateSetting('legal', { refund_policy: e.target.value })}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Security & Analytics Tab */}
                        {activeSettingsTab === 'security' && (
                          <div>
                            <h3 className="luxury-font" style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Security & Analytics</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 600 }}>Two-Factor Authentication Requirement</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enforce 2FA for all administrative accounts</div>
                                </div>
                                <button 
                                  onClick={() => handleUpdateSetting('security', { enforce_2fa: !platformSettings.find(s => s.key === 'security')?.value?.enforce_2fa })}
                                  style={{ 
                                    width: '50px', height: '26px', borderRadius: '13px', border: 'none', position: 'relative', cursor: 'pointer',
                                    background: platformSettings.find(s => s.key === 'security')?.value?.enforce_2fa ? 'var(--accent-gold)' : '#333'
                                  }}
                                >
                                  <motion.div 
                                    animate={{ x: platformSettings.find(s => s.key === 'security')?.value?.enforce_2fa ? 24 : 2 }}
                                    style={{ width: '20px', height: '20px', background: platformSettings.find(s => s.key === 'security')?.value?.enforce_2fa ? 'black' : 'white', borderRadius: '50%', position: 'absolute', top: '3px' }} 
                                  />
                                </button>
                              </div>

                              <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontWeight: 600 }}>Advanced Telemetry</div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Track user heatmaps and strategic session interactions</div>
                                </div>
                                <button 
                                  onClick={() => handleUpdateSetting('security', { telemetry_enabled: !platformSettings.find(s => s.key === 'security')?.value?.telemetry_enabled })}
                                  style={{ 
                                    width: '50px', height: '26px', borderRadius: '13px', border: 'none', position: 'relative', cursor: 'pointer',
                                    background: platformSettings.find(s => s.key === 'security')?.value?.telemetry_enabled ? 'var(--accent-gold)' : '#333'
                                  }}
                                >
                                  <motion.div 
                                    animate={{ x: platformSettings.find(s => s.key === 'security')?.value?.telemetry_enabled ? 24 : 2 }}
                                    style={{ width: '20px', height: '20px', background: platformSettings.find(s => s.key === 'security')?.value?.telemetry_enabled ? 'black' : 'white', borderRadius: '50%', position: 'absolute', top: '3px' }} 
                                  />
                                </button>
                              </div>

                              <div className="form-group" style={{ marginTop: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>SESSION TIMEOUT (MINUTES)</label>
                                <input 
                                  type="number" className="admin-input" style={{ width: '100%' }} 
                                  defaultValue={platformSettings.find(s => s.key === 'security')?.value?.session_timeout || 60}
                                  onBlur={(e) => handleUpdateSetting('security', { session_timeout: Number(e.target.value) })}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
          )}
        </div>
      </main>

      <ChatSystem />

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
                        onSelect={handleModelChange}
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
                  <div className="form-group">
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Original Price (Optional)</label>
                    <input name="original_price" type="number" defaultValue={editingCar?.original_price || ''} className="admin-input" style={{ width: '100%' }} placeholder="For discount calculation..." />
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <LuxurySelect 
                      name="condition" 
                      label="Vehicle Condition"
                      defaultValue={editingCar?.condition}
                      options={CAR_CONDITIONS.map(c => ({ value: c, label: c }))}
                    />
                    <LuxurySelect 
                      name="body_type" 
                      label="Architecture"
                      defaultValue={editingCar?.body_type || selectedBodyType}
                      options={CAR_BODY_TYPES.map(c => ({ value: c, label: c }))}
                      key={selectedBodyType}
                    />
                  </div>
                  <LuxurySelect 
                    name="state" 
                    label="Location (State)"
                    defaultValue={editingCar?.state}
                    options={NIGERIAN_STATES.map(s => ({ value: s, label: s }))}
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
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Engine Details</label>
                        <input name="engine" type="text" defaultValue={editingCar?.engine} className="admin-input" style={{ width: '100%' }} placeholder="e.g. 4.0L V8" />
                      </div>
                      <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>VIN Reference</label>
                        <input name="vin" type="text" defaultValue={editingCar?.vin} className="admin-input" style={{ width: '100%' }} placeholder="VIN..." />
                      </div>
                    </div>
                  </div>

                  {/* Features & Options */}
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ fontSize: '0.7rem', letterSpacing: '2px', color: 'var(--accent-gold)', marginBottom: '1.5rem', marginTop: '1rem' }}>VEHICLE FEATURES & OPTIONS</div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', fontWeight: 600 }}>STANDARD FEATURES</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {STANDARD_FEATURES.map(feature => {
                          const active = adminSelectedFeatures.includes(feature);
                          return (
                            <button
                              key={feature}
                              type="button"
                              onClick={() => setAdminSelectedFeatures(prev =>
                                prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
                              )}
                              style={{
                                padding: '0.4rem 0.9rem',
                                borderRadius: '2rem',
                                border: active ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                                background: active ? 'rgba(197,160,89,0.12)' : 'rgba(255,255,255,0.03)',
                                color: active ? 'var(--accent-gold)' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                fontWeight: active ? 700 : 400,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                transition: 'all 0.2s',
                              }}
                            >
                              {active && <CheckCircle2 size={11} />}
                              {feature}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.8rem', fontWeight: 600 }}>MARKET CONDITION TAGS</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {NIGERIAN_MARKET_TAGS.map(tag => {
                          const active = adminSelectedFeatures.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => setAdminSelectedFeatures(prev =>
                                prev.includes(tag) ? prev.filter(f => f !== tag) : [...prev, tag]
                              )}
                              style={{
                                padding: '0.4rem 0.9rem',
                                borderRadius: '2rem',
                                border: active ? '1px solid #3b82f6' : '1px solid var(--border-glass)',
                                background: active ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                                color: active ? '#60a5fa' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontSize: '0.72rem',
                                fontWeight: active ? 700 : 400,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                transition: 'all 0.2s',
                              }}
                            >
                              {active && <CheckCircle2 size={11} />}
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {adminSelectedFeatures.length > 0 && (
                      <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: 'var(--accent-gold)' }}>
                        {adminSelectedFeatures.length} feature{adminSelectedFeatures.length !== 1 ? 's' : ''} selected
                      </div>
                    )}
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
            onVendorClick={(vendorId) => {
              const vendor = vendors.find(v => v.id === vendorId);
              if (vendor) setSelectedVendor(vendor);
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

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }} onClick={() => setSelectedOrder(null)}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass" style={{ width: '100%', maxWidth: '900px', padding: '0', borderRadius: '1.5rem', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
               <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h2 className="luxury-font" style={{ fontSize: '1.8rem', margin: 0 }}>Transaction Dossier</h2>
                   <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', alignItems: 'center' }}>
                     <span style={{ fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>#{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                     <StatusBadge status={selectedOrder.status} />
                   </div>
                 </div>
                 <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}><X size={24} /></button>
               </div>

               <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                      <h3 style={{ fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--accent-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CarFront size={14} /> VEHICLE ASSET</h3>
                      <div style={{ display: 'flex', gap: '1.5rem' }}>
                        {selectedOrder.cars?.image_url && (
                          <img src={selectedOrder.cars.image_url} alt="Vehicle" style={{ width: '100px', height: '100px', borderRadius: '0.8rem', objectFit: 'cover' }} />
                        )}
                        <div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>{selectedOrder.cars?.year} {selectedOrder.cars?.make} {selectedOrder.cars?.model}</div>
                          <div style={{ fontSize: '1.2rem', color: 'var(--accent-gold)', fontWeight: 700, margin: '0.2rem 0' }}>{formatPrice(selectedOrder.amount)}</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <div>VIN: <span style={{ fontFamily: 'monospace', color: 'white' }}>{selectedOrder.cars?.vin || 'N/A'}</span></div>
                            <div>Mileage: <span style={{ color: 'white' }}>{selectedOrder.cars?.mileage?.toLocaleString() || 'N/A'} mi</span></div>
                            <div>Fuel: <span style={{ color: 'white' }}>{selectedOrder.cars?.fuel_type}</span></div>
                            <div>Trans: <span style={{ color: 'white' }}>{selectedOrder.cars?.transmission}</span></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                       <h3 style={{ fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--accent-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={14} /> LOGISTICS CONTROL</h3>
                       <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                        <button onClick={() => db.updateOrderStatus(selectedOrder.id, 'Processing').then(() => { setSelectedOrder(null); loadAllData(); })} className="btn-gold" style={{ flex: 1, padding: '0.8rem', fontSize: '0.75rem' }}>MARK PROCESSING</button>
                        <button onClick={() => db.updateOrderStatus(selectedOrder.id, 'Shipped').then(() => { setSelectedOrder(null); loadAllData(); })} className="btn-gold" style={{ flex: 1, padding: '0.8rem', fontSize: '0.75rem' }}>MARK SHIPPED</button>
                        <button onClick={() => db.updateOrderStatus(selectedOrder.id, 'Delivered').then(() => { setSelectedOrder(null); loadAllData(); })} style={{ flex: 1, padding: '0.8rem', fontSize: '0.75rem', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid rgba(74, 222, 128, 0.3)', color: '#4ade80', borderRadius: '4px' }}>CONFIRM DELIVERY</button>
                        <button onClick={() => generateInvoice(selectedOrder, platformSettings)} style={{ flex: 1, padding: '0.8rem', fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '4px' }}>GENERATE INVOICE</button>
                       </div>

                    </div>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                       <h3 style={{ fontSize: '0.75rem', letterSpacing: '1px', color: 'var(--accent-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Users size={14} /> CUSTOMER IDENTITY</h3>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                         <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #c5a059 0%, #a67c00 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                           {selectedOrder.user_id?.slice(0, 2).toUpperCase()}
                         </div>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{selectedOrder.profiles?.full_name || `Client #${selectedOrder.user_id?.slice(0, 8)}`}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified Buyer</div>
                          </div>
                       </div>
                       <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem' }}>
                         <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>PAYMENT REFERENCE</div>
                         <div style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{selectedOrder.payment_ref || 'PENDING_VERIFICATION'}</div>
                       </div>
                    </div>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inquiry Detail Modal */}
      <AnimatePresence>
        {selectedInquiry && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }} onClick={() => setSelectedInquiry(null)}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass" style={{ width: '100%', maxWidth: '800px', padding: '0', borderRadius: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
               <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h2 className="luxury-font" style={{ fontSize: '1.8rem', margin: 0 }}>Inquiry Dossier</h2>
                   <p style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', letterSpacing: '2px', marginTop: '0.5rem' }}>{selectedInquiry.type.toUpperCase()} REQUEST</p>
                 </div>
                 <button onClick={() => setSelectedInquiry(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
               </div>

               <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                 <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                     <Users size={16} color="var(--accent-gold)" /> 
                     <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>PROSPECT PROFILE</span>
                   </div>
                   <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                     <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>{selectedInquiry.name}</div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                         <span style={{ flex: 1 }}>{selectedInquiry.email}</span>
                         <button className="text-btn" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>COPY</button>
                       </div>
                       {selectedInquiry.phone && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                           <span style={{ flex: 1 }}>{selectedInquiry.phone}</span>
                           <button className="text-btn" style={{ fontSize: '0.7rem', color: 'var(--accent-gold)' }}>COPY</button>
                         </div>
                       )}
                     </div>
                   </div>

                   <div style={{ marginTop: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <CarFront size={16} color="var(--accent-gold)" /> 
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>TARGET VEHICLE</span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {selectedInquiry.cars?.image_url && (
                          <img src={selectedInquiry.cars.image_url} alt="Vehicle" style={{ width: '80px', height: '60px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                        )}
                        <div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{selectedInquiry.carName || 'General Inquiry / Stock Request'}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Created: {new Date(selectedInquiry.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                   </div>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                   <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                       <FileText size={16} color="var(--accent-gold)" /> 
                       <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px' }}>CLIENT MESSAGE</span>
                     </div>
                     <p style={{ lineHeight: '1.6', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', flex: 1 }}>"{selectedInquiry.message}"</p>
                   </div>
                   
                   <div style={{ display: 'flex', gap: '1rem' }}>
                      <button onClick={() => db.updateInquiryStatus(selectedInquiry.id, 'Contacted').then(() => { setSelectedInquiry(null); loadAllData(); })} className="btn-gold" style={{ flex: 1, padding: '1rem', fontSize: '0.8rem' }}>MARK CONTACTED</button>
                      <button onClick={() => db.updateInquiryStatus(selectedInquiry.id, 'Archived').then(() => { setSelectedInquiry(null); loadAllData(); })} style={{ flex: 1, padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', color: 'white', borderRadius: '8px', fontSize: '0.8rem' }}>ARCHIVE</button>
                   </div>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preorder Detail Modal */}
      <AnimatePresence>
        {selectedPreorder && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }} onClick={() => setSelectedPreorder(null)}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass" style={{ width: '100%', maxWidth: '800px', padding: '0', borderRadius: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
               <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h2 className="luxury-font" style={{ fontSize: '1.8rem', margin: 0 }}>Sourcing Request</h2>
                   <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Exclusive Pre-Order Specification</p>
                 </div>
                 <button onClick={() => setSelectedPreorder(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
               </div>

               <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ padding: '1.5rem', borderRadius: '1rem', background: 'linear-gradient(135deg, rgba(197, 160, 89, 0.1) 0%, transparent 100%)', border: '1px solid rgba(197, 160, 89, 0.2)' }}>
                       <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--accent-gold)', marginBottom: '0.5rem', letterSpacing: '1px', fontWeight: 700 }}>TARGET VEHICLE</label>
                       <div style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.2 }}>{selectedPreorder.year} {selectedPreorder.make}</div>
                       <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{selectedPreorder.model}</div>
                    </div>
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem' }}>
                       <label style={{ display: 'block', fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '0.5rem', letterSpacing: '1px' }}>ALLOCATED BUDGET</label>
                       <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#4ade80' }}>
                         {selectedPreorder.budget ? formatPrice(selectedPreorder.budget) : <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Unspecified</span>}
                       </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem' }}>
                    <div>
                       <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>CLIENT</label>
                       <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.2rem' }}>{selectedPreorder.name}</div>
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedPreorder.email}</div>
                       {selectedPreorder.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedPreorder.phone}</div>}
                    </div>
                    <div>
                       <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>SPECIFIC REQUIREMENTS</label>
                       <p style={{ lineHeight: '1.6', fontSize: '0.95rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--border-glass)' }}>
                         "{selectedPreorder.message || 'No additional specifications provided.'}"
                       </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.5rem' }}>
                    <button onClick={() => db.updatePreorderStatus(selectedPreorder.id, 'Sourced').then(() => { setSelectedPreorder(null); loadAllData(); })} className="btn-gold" style={{ flex: 1, padding: '1rem' }}>CONFIRM SOURCING</button>
                    <button onClick={() => db.updatePreorderStatus(selectedPreorder.id, 'Delivered').then(() => { setSelectedPreorder(null); loadAllData(); })} style={{ flex: 1, padding: '1rem', background: 'rgba(74, 222, 128, 0.05)', border: '1px solid rgba(74, 222, 128, 0.2)', color: '#4ade80', borderRadius: '8px' }}>MARK DELIVERED</button>
                  </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Parts Request Detail Modal */}
      <AnimatePresence>
        {selectedPartsRequest && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }} onClick={() => setSelectedPartsRequest(null)}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass" style={{ width: '100%', maxWidth: '700px', padding: '0', borderRadius: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
               <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h2 className="luxury-font" style={{ fontSize: '1.8rem', margin: 0 }}>Parts Requisition</h2>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                     <Wrench size={14} color="var(--accent-gold)" />
                     <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>SERVICE COMPONENT ORDER</span>
                   </div>
                 </div>
                 <button onClick={() => setSelectedPartsRequest(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
               </div>

               <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-glass)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                     <div>
                       <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--accent-gold)', marginBottom: '0.4rem', letterSpacing: '1px' }}>COMPONENT</label>
                       <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{selectedPartsRequest.part_name}</div>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                       <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '1px' }}>QUANTITY</label>
                       <div style={{ fontSize: '1.4rem', fontWeight: 600 }}>x{selectedPartsRequest.quantity}</div>
                     </div>
                   </div>
                   <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                     <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '1px' }}>FOR VEHICLE</label>
                     <div style={{ fontSize: '1rem' }}>{selectedPartsRequest.vehicle_year} {selectedPartsRequest.vehicle_make} {selectedPartsRequest.vehicle_model}</div>
                   </div>
                 </div>

                 <div>
                   <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>NOTES & DESCRIPTION</label>
                   <p style={{ lineHeight: '1.6', fontSize: '0.95rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--border-glass)' }}>
                     "{selectedPartsRequest.description || 'No detailed description provided.'}"
                   </p>
                 </div>

                 <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => db.updateSparePartOrderStatus(selectedPartsRequest.id, 'Sourced').then(() => { setSelectedPartsRequest(null); loadAllData(); })} className="btn-gold" style={{ flex: 1, padding: '1rem' }}>MARK AS SOURCED</button>
                    <button onClick={() => db.updateSparePartOrderStatus(selectedPartsRequest.id, 'Shipped').then(() => { setSelectedPartsRequest(null); loadAllData(); })} className="btn-gold" style={{ flex: 1, padding: '1rem' }}>MARK AS SHIPPED</button>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tow Request Detail Modal */}
      <AnimatePresence>
        {selectedTowRequest && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }} onClick={() => setSelectedTowRequest(null)}>
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass" style={{ width: '100%', maxWidth: '800px', padding: '0', borderRadius: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
               <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h2 className="luxury-font" style={{ fontSize: '1.8rem', margin: 0 }}>Recovery Operation</h2>
                   <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                     <Truck size={14} /> <span>TOW REQUEST DETAILS</span>
                   </div>
                 </div>
                 <button onClick={() => setSelectedTowRequest(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={24} /></button>
               </div>

               <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--accent-gold)', marginBottom: '0.5rem', letterSpacing: '1px' }}>PICKUP</label>
                     <div style={{ fontSize: '1.1rem', fontWeight: 500, lineHeight: '1.4' }}>{selectedTowRequest.pickup_address}</div>
                     {(selectedTowRequest.pickup_lat && selectedTowRequest.pickup_long) && (
                       <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                         {selectedTowRequest.pickup_lat.toFixed(6)}, {selectedTowRequest.pickup_long.toFixed(6)}
                       </div>
                     )}
                   </div>
                   <div>
                     <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--accent-gold)', marginBottom: '0.5rem', letterSpacing: '1px' }}>DESTINATION</label>
                     <div style={{ fontSize: '1.1rem', fontWeight: 500, lineHeight: '1.4' }}>{selectedTowRequest.destination_address || 'TBD / Nearest Hub'}</div>
                   </div>
                 </div>

                 <div className="glass" style={{ padding: '1.5rem', borderRadius: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                      <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '1px' }}>VEHICLE TYPE</label>
                      <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>{selectedTowRequest.vehicle_type}</div>
                   </div>
                   <div>
                      <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '0.4rem', letterSpacing: '1px', textAlign: 'right' }}>STATUS</label>
                      <StatusBadge status={selectedTowRequest.status} />
                   </div>
                 </div>

                 <div>
                   <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.8rem', letterSpacing: '1px' }}>NOTES</label>
                   <p style={{ lineHeight: '1.6', fontSize: '0.95rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.6rem', border: '1px solid var(--border-glass)' }}>
                     "{selectedTowRequest.notes || 'No additional notes.'}"
                   </p>
                 </div>
               </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AddPartModal for Parts Catalog */}
      {showAddPartForm && (
        <AddPartModal 
          editingPart={editingPart}
          onClose={() => setShowAddPartForm(false)}
          onSuccess={() => {
            setShowAddPartForm(false);
            loadAllData();
            showAlert({ title: 'Success', message: 'Catalog entry synchronized.' });
          }}
        />
      )}

    </div>
  );
};
