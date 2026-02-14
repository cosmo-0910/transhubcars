import { supabase } from './supabase';
import { Mechanic } from '../types';

export const mechanicService = {
  async getMechanics(options?: { onlyApproved?: boolean }): Promise<Mechanic[]> {
    try {
      let query = supabase
        .from('mechanics')
        .select('*');
      
      if (options?.onlyApproved) {
        query = query.eq('is_approved', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Mobile: Error fetching mechanics:', error);
      throw error;
    }
  },

  async getMechanicById(id: string): Promise<Mechanic | null> {
    try {
      const { data, error } = await supabase
        .from('mechanics')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Mobile: Error fetching mechanic by ID:', error);
      return null;
    }
  }
};
