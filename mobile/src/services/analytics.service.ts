import { Platform } from 'react-native';
import { supabase } from './supabase';

export const analyticsService = {
  /**
   * Captures device information and updates the user's profile.
   * In a production app, use react-native-device-info for more precise data.
   */
  async updateDeviceInfo(userId: string) {
    const deviceInfo = {
      device_os: Platform.OS,
      device_model: Platform.Version.toString(), // Simplified model/version
      // unique_hardware_id: '...', // Would require native module
      // ip_address: '...', // Would require external fetch
    };

    const { error } = await supabase
      .from('profiles')
      .update(deviceInfo)
      .eq('id', userId);

    if (error) {
      console.error('Error updating device info:', error);
    }
  },

  /**
   * Logs a user location to the history table.
   */
  async logLocation(userId: string, latitude: number, longitude: number) {
    const { error } = await supabase
      .from('user_location_history')
      .insert({
        user_id: userId,
        latitude,
        longitude,
        recorded_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging location history:', error);
    }
  },

  /**
   * Logs a generic usage event.
   */
  async logEvent(userId: string, eventName: string, metadata: any = {}) {
    const { error } = await supabase
      .from('usage_logs')
      .insert({
        user_id: userId,
        event_name: eventName,
        metadata,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error logging usage event:', error);
    }
  }
};
