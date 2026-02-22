import { supabase } from './supabase';

export const vendorService = {
  /**
   * Fetches comprehensive statistics for a vendor.
   * Handles car, spare parts, and tow truck vendors.
   */
  async getVendorStats(vendorId: string, vendorType: 'car' | 'parts' | 'both' | 'tow_truck') {
    let stats = {
      totalEarnings: 0,
      activeListings: 0,
      totalSales: 0,
      pendingApprovals: 0,
    };

    try {
      if (vendorType === 'car' || vendorType === 'both') {
        // Fetch car stats
        const { data: cars, error: carsError } = await supabase
          .from('cars')
          .select('price, approval_status')
          .eq('vendor_id', vendorId);
        
        if (carsError) throw carsError;

        // Fetch paid car orders
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('amount, status, cars!inner(vendor_id)')
          .eq('cars.vendor_id', vendorId)
          .eq('status', 'Paid');
        
        if (ordersError) throw ordersError;

        stats.totalEarnings += orders?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;
        stats.activeListings += cars?.filter(c => c.approval_status === 'approved').length || 0;
        stats.totalSales += orders?.length || 0;
        stats.pendingApprovals += cars?.filter(c => c.approval_status === 'pending' || !c.approval_status).length || 0;
      }

      if (vendorType === 'parts' || vendorType === 'both') {
        // Fetch spare parts stats
        const { data: parts, error: partsError } = await supabase
          .from('spare_parts')
          .select('price, status, stock_quantity')
          .eq('vendor_id', vendorId);
        
        if (!partsError) {
          stats.activeListings += parts?.filter(p => p.status === 'active').length || 0;
          stats.pendingApprovals += parts?.filter(p => p.stock_quantity === 0).length || 0;
          // Note: In current schema, spare_part_orders might not have easy tracking for totalEarnings yet
        }
      }

      if (vendorType === 'tow_truck') {
        // Fetch tow request stats
        const { data: requests, error: towError } = await supabase
          .from('tow_requests')
          .select('status, price')
          .eq('driver_id', vendorId);
        
        if (!towError && requests) {
          stats.totalEarnings += requests.filter(r => r.status === 'Completed').reduce((sum, r) => sum + (r.price || 0), 0);
          stats.totalSales += requests.filter(r => r.status === 'Completed').length;
          stats.pendingApprovals += requests.filter(r => r.status === 'Searching').length;
        }
      }

      return stats;
    } catch (error) {
      console.error('[VendorService] Error fetching stats:', error);
      throw error;
    }
  },

  /**
   * Fetches financial history/payouts for a vendor.
   * Placeholder as this might require specialized tables.
   */
  async getEarningsHistory(vendorId: string) {
    // This would typically query a 'payouts' or 'revenue_logs' table.
    // For now, we return empty as a placeholder for the UI.
    return [];
  },

  /**
   * Fetches platform finance settings (commissions, base fees).
   */
  async getPlatformFinanceSettings() {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'finance')
      .single();
    
    if (error) {
      console.warn('[VendorService] Using default finance settings due to error:', error);
      return {
        car_listing_commission_pct: 2.5,
        parts_sale_commission_pct: 10.0,
        towing_base_fee: 25000,
        currency: 'NGN'
      };
    }

    return data.value;
  }
};
