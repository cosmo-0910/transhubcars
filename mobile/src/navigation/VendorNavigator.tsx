import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, FONT_SIZES } from '../utils/theme';

// Placeholder screens - to be implemented
import { VendorDashboardScreen } from '../screens/vendor/VendorDashboardScreen';
import { ManageInventoryScreen } from '../screens/vendor/ManageInventoryScreen';
import { AddVehicleScreen } from '../screens/vendor/AddVehicleScreen';
import { VendorProfileScreen } from '../screens/vendor/VendorProfileScreen';

export type VendorTabParamList = {
  Dashboard: undefined;
  ManageInventory: undefined;
  AddVehicle: undefined;
  VendorProfile: undefined;
};

const Tab = createBottomTabNavigator<VendorTabParamList>();

export const VendorNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.backgroundCard,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={VendorDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ManageInventory"
        component={ManageInventoryScreen}
        options={{
          tabBarLabel: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <Icon name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AddVehicle"
        component={AddVehicleScreen}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ color, size }) => (
            <Icon name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="VendorProfile"
        component={VendorProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
