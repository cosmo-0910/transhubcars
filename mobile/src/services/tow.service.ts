import { TowRequest } from '../types';
import { supabase } from './supabase';

export const towService = {
  async requestTow(request: Omit<TowRequest, 'id' | 'status' | 'created_at'>): Promise<TowRequest> {
    // Mocking the database call for now
    const mockRequest: TowRequest = {
      id: Math.random().toString(36).substring(7),
      ...request,
      status: 'Searching',
      created_at: new Date().toISOString(),
    };

    console.log('Requesting Tow Truck:', mockRequest);
    
    // In a real scenario, we would use Supabase:
    // const { data, error } = await supabase.from('tow_requests').insert([request]).select().single();
    // if (error) throw error;
    // return data;

    return new Promise((resolve) => {
      setTimeout(() => resolve(mockRequest), 1500);
    });
  },

  async getNearbyTowTrucks(latitude: number, longitude: number) {
    // Filter by vicinity logic would go here
    return [
      { id: '1', name: 'Elite Towing', distance: '1.2km' },
      { id: '2', name: 'Rapid Recovery', distance: '2.5km' },
    ];
  }
};
