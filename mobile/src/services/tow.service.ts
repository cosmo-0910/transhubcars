import { TowRequest, Profile } from '../types';
import { supabase } from './supabase';
import { analyticsService } from './analytics.service';

export const towService = {
  async requestTow(request: Omit<TowRequest, 'id' | 'status' | 'created_at'>): Promise<TowRequest> {
    const { data, error } = await supabase
      .from('tow_requests')
      .insert([request])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getNearbyTowTrucks(latitude: number, longitude: number): Promise<Profile[]> {
    const { data, error } = await supabase.rpc('find_nearest_tow_driver', {
      p_lat: latitude,
      p_long: longitude,
      p_limit: 10
    });

    if (error) throw error;
    return data;
  },

  async updateDriverLocation(driverId: string, latitude: number, longitude: number) {
    // Update active profile location
    const { error } = await supabase
      .from('profiles')
      .update({
        last_lat: latitude,
        last_long: longitude,
        is_online: true
      })
      .eq('id', driverId);

    if (error) throw error;

    // Record in history log
    await analyticsService.logLocation(driverId, latitude, longitude);
  },

  async setDriverOnlineStatus(driverId: string, isOnline: boolean) {
    const { error } = await supabase
      .from('profiles')
      .update({ is_online: isOnline })
      .eq('id', driverId);

    if (error) throw error;
  },

  subscribeToRequest(requestId: string, onUpdate: (payload: TowRequest) => void) {
    return supabase
      .channel(`tow_request_${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'tow_requests',
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          onUpdate(payload.new as TowRequest);
        }
      )
      .subscribe();
  },

  subscribeToNearbyRequests(onUpdate: (payload: TowRequest) => void) {
    return supabase
      .channel('nearby_requests')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tow_requests',
          filter: 'status=eq.Searching',
        },
        (payload) => {
          onUpdate(payload.new as TowRequest);
        }
      )
      .subscribe();
  },

  subscribeToNearbyDrivers(onUpdate: (drivers: Profile[]) => void) {
    // This is a bit more complex since we want to subscribe to all online tow truck drivers
    // For simplicity, we subscribe to all profile changes where role is vendor and vendor_type is tow_truck
    return supabase
      .channel('online_drivers')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: 'role=eq.vendor',
        },
        async () => {
          // Whenever any vendor profile changes, we might want to refresh the nearby drivers list
          // In a real app, you might want more granular filtering if possible
          // But for now, we'll let the component decide when to re-fetch based on this trigger
          onUpdate([]); // Just a trigger
        }
      )
      .subscribe();
  },

  async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TranshubApp/1.0',
          },
        }
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse Geocoding Error:', error);
      return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
  }
};
