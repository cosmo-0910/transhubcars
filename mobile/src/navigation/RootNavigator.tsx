import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/theme';

// Import navigators (to be created)
import { AuthNavigator } from './AuthNavigator';
import { ClientNavigator } from './ClientNavigator';
import { VendorNavigator } from './VendorNavigator';

const Stack = createStackNavigator();

export const RootNavigator = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Not authenticated - show auth screens
  if (!user || !profile) {
    return <AuthNavigator />;
  }

  // Authenticated - route based on role (excluding admin)
  if (profile.role === 'vendor' && profile.vendor_status === 'approved') {
    return <VendorNavigator />;
  }

  // Default to client navigator for customers and pending vendors
  return <ClientNavigator />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
