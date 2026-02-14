import { supabase } from './supabase';
import { watermarkImage } from '../utils/imageUtils';
import type { Car } from '../types';

export const carsService = {
  /**
   * Fetch all approved cars
   */
  async getCars(filters?: {
    make?: string;
    model?: string;
    status?: 'Readily Available' | 'Preorder';
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Car[]> {
    let query = supabase
      .from('cars')
      .select('*')
      .eq('approval_status', 'approved')
      .order('created_at', { ascending: false });

    if (filters?.make) {
      query = query.ilike('make', `%${filters.make}%`);
    }
    if (filters?.model) {
      query = query.ilike('model', `%${filters.model}%`);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single car by ID
   */
  async getCarById(id: string): Promise<Car | null> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get cars by vendor ID
   */
  async getVendorCars(vendorId: string): Promise<Car[]> {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Add a new car (vendor only)
   */
  async addCar(car: Omit<Car, 'id' | 'created_at'>): Promise<Car> {
    const { data, error } = await supabase
      .from('cars')
      .insert([car])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a car (vendor only)
   */
  async updateCar(id: string, updates: Partial<Car>): Promise<Car> {
    const { data, error } = await supabase
      .from('cars')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a car (vendor only)
   */
  async deleteCar(id: string): Promise<void> {
    const { error } = await supabase
      .from('cars')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Search cars by query or filters
   */
  async searchCars(filters?: {
    search?: string;
    make?: string;
    model?: string;
    status?: 'Readily Available' | 'Preorder';
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
  }): Promise<Car[]> {
    let query = supabase
      .from('cars')
      .select('*')
      .eq('approval_status', 'approved')
      .order('created_at', { ascending: false });

    if (filters?.search) {
      query = query.or(`make.ilike.%${filters.search}%,model.ilike.%${filters.search}%`);
    }
    if (filters?.make) {
      query = query.ilike('make', `%${filters.make}%`);
    }
    if (filters?.model) {
      query = query.ilike('model', `%${filters.model}%`);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(20);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Upload car image to Supabase Storage
   */
  async uploadCarImage(file: { uri: string; type: string; name: string }, vendorId: string, username: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${vendorId}/${Date.now()}.${fileExt}`;

    // Apply watermark
    const watermarkedUri = await watermarkImage(file.uri, username);

    // Convert file URI to blob for upload
    const response = await fetch(watermarkedUri);
    const blob = await response.blob();

    const { data, error } = await supabase.storage
      .from('car-images')
      .upload(fileName, blob, {
        contentType: file.type,
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('car-images')
      .getPublicUrl(data.path);

    return publicUrl;
  },

  /**
   * Submit customer inquiry for a car
   */
  async submitInquiry(inquiry: {
    carId: string;
    type: 'Inspection' | 'Purchase';
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    message?: string;
  }): Promise<any> {
    const { data, error } = await supabase
      .from('inquiries')
      .insert([{
        car_id: inquiry.carId,
        inquiry_type: inquiry.type,
        customer_name: inquiry.customerName,
        customer_email: inquiry.customerEmail,
        customer_phone: inquiry.customerPhone,
        message: inquiry.message,
        status: 'pending',
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  /**
   * Get cars favorited by user
   */
  async getFavoriteCars(userId: string): Promise<Car[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('car_id, cars (*)')
      .eq('user_id', userId);

    if (error) throw error;
    return (data || []).map(f => (f as any).cars);
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(userId: string, carId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('car_id', carId)
      .single();

    if (existing) {
      await supabase.from('favorites').delete().eq('id', (existing as any).id);
      return false;
    } else {
      await supabase.from('favorites').insert([{ user_id: userId, car_id: carId }]);
      return true;
    }
  },

  /**
   * Get Platform Statistics (Admin)
   */
  async getPlatformStats() {
    const { data: usersCount } = await supabase.from('profiles').select('id', { count: 'exact' });
    const { data: carsCount } = await supabase.from('cars').select('id', { count: 'exact' });
    const { data: ordersData } = await supabase.from('orders').select('amount');
    
    const totalRevenue = ordersData?.reduce((acc, curr) => acc + curr.amount, 0) || 0;

    return {
      totalUsers: (usersCount as any)?.length || 0,
      totalCars: (carsCount as any)?.length || 0,
      totalRevenue,
      activeOrders: ordersData?.length || 0,
      systemStatus: 'Operational'
    };
  }
};
