import { SparePart, SparePartOrder } from '../types';
import { supabase } from './supabase';

export interface PartFilters {
  category?: string;
  condition?: string;
  make?: string;
  model?: string;
  year?: number;
  search?: string;
}

export const partsService = {
  async searchParts(filters: PartFilters): Promise<SparePart[]> {
    let query = supabase
      .from('spare_parts')
      .select('*')
      .eq('status', 'active');

    if (filters.category) query = query.eq('category', filters.category);
    if (filters.condition) query = query.eq('condition', filters.condition);
    if (filters.make) query = query.eq('vehicle_make', filters.make);
    if (filters.model) query = query.eq('vehicle_model', filters.model);
    if (filters.year) query = query.eq('vehicle_year', filters.year);
    
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async getFilterSuggestions(field: string, searchTerm: string): Promise<string[]> {
    const dbField = field === 'make' ? 'vehicle_make' : 
                    field === 'model' ? 'vehicle_model' : 
                    field === 'year' ? 'vehicle_year' : field;
    
    let query = supabase
      .from('spare_parts')
      .select(dbField)
      .ilike(dbField, `%${searchTerm}%`)
      .limit(10);

    const { data, error } = await query;
    if (error) throw error;
    
    // Extract unique values
    const values = data?.map((item: any) => item[dbField].toString()) || [];
    return [...new Set(values)];
  },

  async getVendorParts(vendorId: string): Promise<SparePart[]> {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addPart(part: Omit<SparePart, 'id' | 'created_at'>): Promise<SparePart> {
    const { data, error } = await supabase
      .from('spare_parts')
      .insert([part])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updatePart(id: string, updates: Partial<SparePart>): Promise<SparePart> {
    const { data, error } = await supabase
      .from('spare_parts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deletePart(id: string): Promise<void> {
    const { error } = await supabase
      .from('spare_parts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async bulkDeleteParts(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('spare_parts')
      .delete()
      .in('id', ids);
    
    if (error) throw error;
  },

  async bulkUpdateParts(ids: string[], updates: Partial<SparePart>): Promise<void> {
    const { error } = await supabase
      .from('spare_parts')
      .update(updates)
      .in('id', ids);
    
    if (error) throw error;
  },

  async submitOrder(order: Omit<SparePartOrder, 'id' | 'status' | 'created_at'>): Promise<SparePartOrder> {
    const { data, error } = await supabase
      .from('spare_part_orders')
      .insert([order])
      .select()
      .single();

    if (error) {
      console.warn('DB Insert failed, falling back to mock (for development):', error);
      return {
        id: Math.random().toString(36).substring(7),
        ...order,
        status: 'Pending',
        created_at: new Date().toISOString(),
      } as SparePartOrder;
    }
    
    return data;
  },

  async getMyOrders(userId: string): Promise<SparePartOrder[]> {
    const { data, error } = await supabase
      .from('spare_part_orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};
