import type { TowRequest } from '../../shared/lib/db';

export const towService = {
  async requestTow(request: Omit<TowRequest, 'id' | 'status' | 'created_at'>): Promise<TowRequest> {
    const mockRequest: TowRequest = {
      id: Math.random().toString(36).substring(7),
      ...request,
      status: 'Searching',
      created_at: new Date().toISOString(),
    };

    console.log('Web: Requesting Tow Truck:', mockRequest);
    
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockRequest), 1500);
    });
  }
};
