import { supabase } from './supabase';
import type { Profile } from '../types';

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(email: string, password: string, fullName: string, role: 'customer' | 'vendor' = 'customer') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign in an existing user
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get the current user's session
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Get the current user
   */
  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  /**
   * Fetch user profile
   */
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Apply to become a vendor
   */
  async applyAsVendor(userId: string, businessName: string, businessDetails: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        vendor_status: 'pending',
        business_name: businessName,
        business_details: businessDetails,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Listen to auth state changes
   */
  /**
   * Upload profile image
   */
  async uploadProfileImage(userId: string, file: { uri: string; type: string; name: string }) {
    try {
      console.log('[Upload] Starting profile image upload for user:', userId);
      console.log('[Upload] File details:', { name: file.name, type: file.type, uri: file.uri.substring(0, 50) + '...' });

      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar_${Date.now()}.${fileExt}`;
      console.log('[Upload] Generated file name:', fileName);

      // Convert file URI to blob for upload
      console.log('[Upload] Fetching file from URI...');
      const response = await fetch(file.uri);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log('[Upload] File converted to blob, size:', blob.size, 'bytes');

      console.log('[Upload] Uploading to storage bucket "avatars"...');
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          contentType: file.type,
          upsert: true,
        });

      if (error) {
        console.error('[Upload] Storage upload error:', error);
        throw new Error(`Storage upload failed: ${error.message}`);
      }

      console.log('[Upload] Upload successful, path:', data.path);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path);

      console.log('[Upload] Public URL generated:', publicUrl);

      // Update profile with new avatar URL
      console.log('[Upload] Updating profile with new avatar URL...');
      await this.updateProfile(userId, { avatar_url: publicUrl });

      console.log('[Upload] Profile updated successfully!');
      return publicUrl;
    } catch (error: any) {
      console.error('[Upload] Error in uploadProfileImage:', error);
      console.error('[Upload] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 200),
      });
      throw error;
    }
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
