import { db } from '../../shared/lib/db';
import type { SparePart, SparePartOrder } from '../../shared/lib/db';

export const partsService = {
  async searchParts(filters: any): Promise<SparePart[]> {
    return db.searchSpareParts(filters);
  },

  async getFilterSuggestions(field: string, searchTerm: string): Promise<string[]> {
    return db.getSparePartSuggestions(field, searchTerm);
  },

  async submitOrder(order: Omit<SparePartOrder, 'id' | 'status' | 'created_at'>): Promise<SparePartOrder> {
    try {
      return db.submitSparePartOrder(order);
    } catch (error) {
      console.error('DB Insert failed:', error);
      throw error;
    }
  },
  
  async getVendorParts(vendorId: string): Promise<SparePart[]> {
    return db.getVendorSpareParts(vendorId);
  }
};
