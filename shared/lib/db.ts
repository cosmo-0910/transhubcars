import { supabase } from './supabase';

export { supabase };

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  status: 'Ready to Ship' | 'Preorder';
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

  // Cars
  getCars: async (): Promise<Car[]> => {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
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
  }
};
