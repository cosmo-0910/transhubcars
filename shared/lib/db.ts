import { supabase } from './supabase';
import { applyWatermark } from './watermark';

export { supabase };

export interface Profile {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  role: 'customer' | 'admin' | 'vendor';
  vendor_status: 'none' | 'pending' | 'approved' | 'rejected';
  vendor_type: 'car' | 'parts' | 'both';
  business_name?: string;
  business_details?: {
    phone?: string;
    address?: string;
    description?: string;
  };
  store_video_url?: string;
  store_image_url?: string;
  preorder_status?: 'none' | 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: 'Readily Available' | 'Preorder';
  description: string;
  image_url: string; 
  gallery_urls: string[]; 
  mileage: number;
  vin: string;
  transmission: 'Automatic' | 'Manual' | 'Semi-Auto';
  fuel_type: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric';
  interior_color: string;
  exterior_color: string;
  engine: string;
  stock_number: string;
  features?: string[];
  vendor_id?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  profiles?: Profile;
  is_pinned?: boolean;
  pinned_at?: string;
  state?: string;
  original_price?: number;
  condition?: 'Foreign Used' | 'Nigerian Used' | 'New';
  body_type?: string;
  powertrain?: string;
  registered_car?: boolean;
  exchange_possible?: boolean;
  second_condition?: string;
  created_at?: string;
}

export interface Inquiry {
  id: string;
  carId?: string;
  carName?: string;
  name: string;
  email: string;
  phone?: string;
  type: 'Inspection' | 'Purchase';
  message: string;
  status: 'New' | 'Contacted' | 'Archived';
  createdAt: string;
  cars?: Car;
}

export interface Preorder {
  id: string;
  name: string;
  email: string;
  phone?: string;
  make: string;
  model: string;
  year?: number;
  budget?: number;
  message?: string;
  status: 'Searching' | 'Sourced' | 'Delivered';
  createdAt: string;
}

export interface Order {
  id: string;
  user_id: string;
  car_id: string;
  amount: number;
  status: 'Pending' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered';
  payment_ref?: string;
  created_at: string;
  cars?: Car;
  profiles?: {
    full_name: string;
    email?: string;
  };
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details: any;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export interface PlatformSetting {
  key: string;
  value: any;
  updated_at: string;
}

export interface SparePart {
  id: string;
  vendor_id: string;
  name: string;
  category: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  price: number;
  image_url?: string;
  description?: string;
  condition: 'New' | 'Used' | 'Refurbished';
  stock_quantity: number;
  status: 'active' | 'out_of_stock' | 'discontinued';
  created_at: string;
}

export interface SparePartOrder {
  id: string;
  user_id: string;
  part_id?: string;
  part_name: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string;
  quantity: number;
  description?: string;
  status: 'Pending' | 'Sourced' | 'Shipped' | 'Delivered';
  created_at: string;
}

export interface TowRequest {
  id: string;
  user_id: string;
  pickup_address: string;
  destination_address: string;
  vehicle_type: string;
  notes?: string;
  status: 'Searching' | 'En Route' | 'At Pickup' | 'In Transit' | 'Completed' | 'Cancelled';
  pickup_lat?: number;
  pickup_long?: number;
  destination_lat?: number;
  destination_long?: number;
  driver_id?: string;
  price?: number;
  estimated_arrival_time?: string;
  created_at: string;
}

export interface Mechanic {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number;
  is_approved: boolean;
  phone?: string;
  image_url?: string;
  created_at: string;
}

export const db = {
  // Profiles
  updateProfile: async (userId: string, updates: any) => {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates });
    
    if (error) throw error;
  },

  getVendors: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('vendor_status', 'none')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getProfiles: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getAdmins: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  createAdmin: async (adminData: { email: string; password: string; fullName: string; permissions: string[] }) => {
    // Determine the host for the admin API. 
    // In local dev, it's usually localhost:3001. 
    // If accessed via internal IP, we should use that same IP.
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const apiUrl = `http://${host}:3001/api/admin/create`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to create admin');
    }
    return result;
  },

  updateAdmin: async (adminData: { id: string; fullName: string; permissions: string[] }) => {
    const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const apiUrl = `http://${host}:3001/api/admin/update`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to update admin');
    }
    return result;
  },

  updateProfileStatus: async (userId: string, status: 'active' | 'suspended' | 'banned' | 'disabled') => {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);
    
    if (error) throw error;
  },

  submitPreorderApplication: async (userId: string, videoUrl: string, imageUrl: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        preorder_status: 'pending',
        store_video_url: videoUrl,
        store_image_url: imageUrl
      })
      .eq('id', userId);
    
    if (error) throw error;
  },

  reviewPreorderApplication: async (userId: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('profiles')
      .update({ preorder_status: status })
      .eq('id', userId);
    
    if (error) throw error;
  },

  async calculateFileHash(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  },

  async uploadImage(file: File, bucket: string = 'car-images', watermarkUser?: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required for upload');

      // 1. Calculate Hash of original file for duplicate prevention
      const contentHash = await this.calculateFileHash(file);

      // 2. Check registry for duplicates
      const { data: existing, error: checkError } = await supabase
        .from('media_fingerprints')
        .select('*')
        .eq('content_hash', contentHash)
        .single();

      if (checkError) {
        if (checkError.code === '42P01') { // undefined_table
          console.error('media_fingerprints table missing. Please run the migration: 20260218_media_fingerprints.sql');
        } else if (checkError.code !== 'PGRST116') {
          console.error('Hash check failed:', checkError);
        }
      }

      if (existing) {
        throw new Error('Duplicate image prohibited');
      }

      let uploadFile: File | Blob = file;

      // Apply watermark if username is provided
      if (watermarkUser) {
        try {
          uploadFile = await applyWatermark(file, watermarkUser);
        } catch (wmError) {
          console.error('Watermarking failed, uploading original:', wmError);
          // Fallback to original file if watermarking fails
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, uploadFile);

      if (uploadError) {
        if (uploadError.message.includes('bucket not found') || uploadError.message.includes('does not exist')) {
          throw new Error(`Storage bucket '${bucket}' not found. Please create it in your Supabase Dashboard (Storage section) and set it to Public.`);
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      // 3. Register the fingerprint if it's new
      if (!existing) {
        const { error: regError } = await supabase
          .from('media_fingerprints')
          .insert([{
            content_hash: contentHash,
            uploader_id: user.id
          }]);
        
        if (regError) console.error('Failed to register media fingerprint:', regError);
      }

      return publicUrl;
    } catch (err: any) {
      console.error('Upload error detail:', err);
      if (err.message === 'Failed to fetch') {
        throw new Error('Network error during upload. Please check your internet connection and ensure your Supabase project URL is correct.');
      }
      throw err;
    }
  },

  // Cars
  getCars: async (options?: { onlyApproved?: boolean }): Promise<Car[]> => {
    let query = supabase
      .from('cars')
      .select('*, profiles(business_name)');
    
    if (options?.onlyApproved) {
      query = query.eq('approval_status', 'approved');
      // Also include cars with null approval_status assuming they are official/legacy
      // query = query.or('approval_status.eq.approved,approval_status.is.null'); 
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getPaginatedCars: async (options?: { onlyApproved?: boolean, page?: number, pageSize?: number }): Promise<Car[]> => {
    let query = supabase
      .from('cars')
      .select('*, profiles(business_name)');
    
    if (options?.onlyApproved) {
      query = query.eq('approval_status', 'approved');
    }

    if (options?.page !== undefined && options?.pageSize !== undefined) {
      const from = options.page * options.pageSize;
      const to = from + options.pageSize - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getVendorCars: async (vendorId: string): Promise<Car[]> => {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  saveCar: async (car: Omit<Car, 'id'>) => {
    const { data, error } = await supabase
      .from('cars')
      .insert([car])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateCar: async (id: string, car: Partial<Car>) => {
    const { error } = await supabase
      .from('cars')
      .update(car)
      .eq('id', id);
    
    if (error) throw error;
  },

  deleteCar: async (id: string) => {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Inquiries
  getInquiries: async (): Promise<Inquiry[]> => {
    const { data, error } = await supabase
      .from('inquiries')
      .select('*, cars(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      ...item,
      carId: item.car_id,
      carName: item.car_name,
      createdAt: item.created_at
    }));
  },

  saveInquiry: async (inquiry: Omit<Inquiry, 'id' | 'createdAt' | 'status'>) => {
    const { data, error } = await supabase
      .from('inquiries')
      .insert([{
        car_id: inquiry.carId,
        car_name: inquiry.carName,
        name: inquiry.name,
        email: inquiry.email,
        phone: inquiry.phone,
        type: inquiry.type,
        message: inquiry.message
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateInquiryStatus: async (id: string, status: Inquiry['status']) => {
    const { error } = await supabase
      .from('inquiries')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Preorders
  getPreorders: async (): Promise<Preorder[]> => {
    const { data, error } = await supabase
      .from('preorders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    return (data || []).map((item: any) => ({
      ...item,
      createdAt: item.created_at
    }));
  },

  savePreorder: async (preorder: Omit<Preorder, 'id' | 'createdAt' | 'status'>) => {
    const { data, error } = await supabase
      .from('preorders')
      .insert([preorder])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updatePreorderStatus: async (id: string, status: Preorder['status']) => {
    const { error } = await supabase
      .from('preorders')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  },

  getSparePartOrders: async (): Promise<SparePartOrder[]> => {
    const { data, error } = await supabase
      .from('spare_part_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  updateSparePartOrderStatus: async (id: string, status: SparePartOrder['status']) => {
    const { error } = await supabase
      .from('spare_part_orders')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  },

  getTowRequests: async (): Promise<TowRequest[]> => {
    const { data, error } = await supabase
      .from('tow_requests')
      .select('*, profiles!user_id(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  saveTowRequest: async (request: Omit<TowRequest, 'id' | 'status' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('tow_requests')
      .insert([request])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, cars(*), profiles!user_id(full_name, email)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  saveOrder: async (order: Omit<Order, 'id' | 'created_at' | 'status'>) => {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateOrderStatus: async (id: string, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);
    
    if (error) throw error;
  },

  // Vendor-specific functions
  getOrdersForVendor: async (vendorId: string): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, cars!inner(*), profiles!user_id(full_name, email)')
      .eq('cars.vendor_id', vendorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getVendorStats: async (vendorId: string) => {
    const { data: cars, error: carsError } = await supabase
      .from('cars')
      .select('price, approval_status')
      .eq('vendor_id', vendorId);
    
    if (carsError) throw carsError;

    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('amount, status, cars!inner(vendor_id)')
      .eq('cars.vendor_id', vendorId)
      .eq('status', 'Paid');
    
    if (ordersError) throw ordersError;

    const totalEarnings = orders?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;
    const activeListings = cars?.filter(c => c.approval_status === 'approved').length || 0;
    const pendingApprovals = cars?.filter(c => c.approval_status === 'pending' || !c.approval_status).length || 0;

    return {
      totalEarnings,
      activeListings,
      totalSales: orders?.length || 0,
      pendingApprovals
    };
  },

  getSearchSuggestions: async (query: string): Promise<{ label: string, value: string }[]> => {
    if (!query) return [];
    
    const { data: cars, error } = await supabase
      .from('cars')
      .select('make, model')
      .ilike('model', `%${query}%`)
      .limit(10);
    
    if (error) throw error;
    
    // Create unique labels for "Make Model"
    const suggestions = cars.map(car => ({
      label: `${car.make} ${car.model}`,
      value: `${car.make} ${car.model}`
    }));
    
    // Filter out duplicates if any (e.g. multiple cars of same make/model)
    return suggestions.filter((v, i, a) => a.findIndex(t => t.label === v.label) === i);
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, profiles!user_id(full_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    return data || [];
  },

  logAction: async (action: string, targetType?: string, targetId?: string, details: any = {}) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details
      }]);
    
    if (error) console.error('Failed to log action:', error);
  },

  // Platform Settings
  getPlatformSettings: async (): Promise<PlatformSetting[]> => {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*');
    
    if (error) throw error;
    return data || [];
  },

  updatePlatformSetting: async (key: string, value: any) => {
    const { error } = await supabase
      .from('platform_settings')
      .upsert({ key, value, updated_at: new Date().toISOString() });
    
    if (error) throw error;
  },

  // Mechanics
  getMechanics: async (options?: { onlyApproved?: boolean }): Promise<Mechanic[]> => {
    let query = supabase
      .from('mechanics')
      .select('*');
    
    if (options?.onlyApproved) {
      query = query.eq('is_approved', true);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  saveMechanic: async (mechanic: Omit<Mechanic, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('mechanics')
      .insert([mechanic])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  updateMechanic: async (id: string, mechanic: Partial<Mechanic>) => {
    const { error } = await supabase
      .from('mechanics')
      .update(mechanic)
      .eq('id', id);
    
    if (error) throw error;
  },

  deleteMechanic: async (id: string) => {
    const { error } = await supabase
      .from('mechanics')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Spare Parts
  searchSpareParts: async (filters: { 
    category?: string; 
    condition?: string; 
    make?: string; 
    model?: string; 
    year?: number; 
    search?: string;
  }): Promise<SparePart[]> => {
    let query = supabase
      .from('spare_parts')
      .select('*')
      .eq('status', 'active');

    if (filters.category) query = query.eq('category', filters.category);
    if (filters.condition) query = query.eq('condition', filters.condition);
    if (filters.make) query = query.eq('vehicle_make', filters.make);
    if (filters.model) query = query.eq('vehicle_model', filters.model);
    if (filters.year) query = query.eq('vehicle_year', filters.year);
    if (filters.search) query = query.ilike('name', `%${filters.search}%`);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  getSparePartSuggestions: async (field: string, searchTerm: string): Promise<string[]> => {
    const dbField = field === 'make' ? 'vehicle_make' : 
                    field === 'model' ? 'vehicle_model' : 
                    field === 'year' ? 'vehicle_year' : field;
    
    const { data, error } = await supabase
      .from('spare_parts')
      .select(dbField)
      .ilike(dbField, `%${searchTerm}%`)
      .limit(10);

    if (error) throw error;
    const values = data?.map((item: any) => item[dbField].toString()) || [];
    return [...new Set(values)];
  },

  getSpareParts: async (): Promise<SparePart[]> => {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  getVendorSpareParts: async (vendorId: string): Promise<SparePart[]> => {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  saveSparePart: async (part: Omit<SparePart, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('spare_parts')
      .insert([part])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Engagement checks
  hasEngagementWithVendor: async (userId: string, vendorId: string): Promise<boolean> => {
    // Check for inquiries tied to this vendor's cars
    const { data: inquiryCount, error: inquiryError } = await supabase
      .from('inquiries')
      .select('id, cars!inner(vendor_id)', { count: 'exact', head: true })
      .eq('cars.vendor_id', vendorId);

    if (inquiryError) console.error('Engagement check (inquiries) failed:', inquiryError);
    if (inquiryCount && inquiryCount.length > 0) return true;

    // Check for orders tied to this vendor's cars
    const { data: orderCount, error: orderError } = await supabase
      .from('orders')
      .select('id, cars!inner(vendor_id)', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('cars.vendor_id', vendorId);

    if (orderError) console.error('Engagement check (orders) failed:', orderError);
    return (orderCount && orderCount.length > 0) || false;
  },

  updateSparePart: async (id: string, part: Partial<SparePart>) => {
    const { error } = await supabase
      .from('spare_parts')
      .update(part)
      .eq('id', id);
    if (error) throw error;
  },

  deleteSparePart: async (id: string) => {
    const { error } = await supabase
      .from('spare_parts')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  submitSparePartOrder: async (order: Omit<SparePartOrder, 'id' | 'status' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('spare_part_orders')
      .insert([order])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // Ranking & Personalization
  getRecommendedCars: async (userId?: string): Promise<Car[]> => {
    const { data, error } = await supabase.rpc('get_recommended_cars', { p_user_id: userId || null });
    if (error) throw error;
    return data || [];
  },

  logActivity: async (userId: string | null | undefined, eventName: string, metadata: any = {}) => {
    const { error } = await supabase
      .from('usage_logs')
      .insert([{ user_id: userId || null, event_name: eventName, metadata }]);
    
    if (error) console.error('Failed to log activity:', error);
  },

  togglePinCar: async (carId: string, isPinned: boolean) => {
    const { error } = await supabase
      .from('cars')
      .update({ 
        is_pinned: isPinned, 
        pinned_at: isPinned ? new Date().toISOString() : null 
      })
      .eq('id', carId);
    
    if (error) throw error;
  },

  toggleFeatureCar: async (carId: string, isFeatured: boolean) => {
    const { error } = await supabase
      .from('cars')
      .update({ 
        is_pinned: isFeatured, 
        pinned_at: isFeatured ? new Date().toISOString() : null 
      })
      .eq('id', carId);
    
    if (error) throw error;
  },

  getGlobalStats: async () => {
    const [carsCount, usersCount, vendorsCount] = await Promise.all([
      supabase.from('cars').select('id', { count: 'exact', head: true }).eq('approval_status', 'approved'),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }).neq('vendor_status', 'none')
    ]);

    return {
      carsCount: carsCount.count || 0,
      usersCount: usersCount.count || 0,
      vendorsCount: vendorsCount.count || 0
    };
  },

  getUnreadCounts: async (userId: string) => {
    try {
      // 1. Get Conversation IDs the user is involved in
      const { data: convIds } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${userId},vendor_id.eq.${userId}`);
      
      const ids = convIds?.map(c => c.id) || [];
      
      // 2. Count unread messages in those conversations where the user is NOT the sender
      let msgCount = 0;
      if (ids.length > 0) {
        const { count } = await supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .in('conversation_id', ids)
          .eq('is_read', false)
          .neq('sender_id', userId);
        msgCount = count || 0;
      }

      // 3. Count unread notifications
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      return {
        unreadMessages: msgCount,
        unreadNotifications: notifCount || 0
      };
    } catch (err) {
      console.error('Failed to fetch unread counts:', err);
      return { unreadMessages: 0, unreadNotifications: 0 };
    }
  }
};
