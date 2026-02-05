import { supabase } from './supabase';

export { supabase };

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
  vendor_id?: string;
  approval_status?: 'pending' | 'approved' | 'rejected';
  profiles?: {
    business_name: string;
  };
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
    const response = await fetch('http://localhost:3001/api/admin/create', {
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

  async uploadImage(file: File, bucket: string = 'car-images'): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        if (uploadError.message.includes('bucket not found') || uploadError.message.includes('does not exist')) {
          throw new Error(`Storage bucket '${bucket}' not found. Please create it in your Supabase Dashboard (Storage section) and set it to Public.`);
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

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
      .select('*')
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

  // Orders
  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select('*, cars(*)')
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
      .select('*, cars!inner(*)')
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
      .select('*, profiles(full_name)')
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
  }
};
