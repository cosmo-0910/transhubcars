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
  },

  async reverseGeocode(lat: number, lon: number): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TranshubWeb/1.0',
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
