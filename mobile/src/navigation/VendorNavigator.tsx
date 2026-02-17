import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, FONT_SIZES } from '../utils/theme';

// Placeholder screens - to be implemented
import { VendorDashboardScreen } from '../screens/vendor/VendorDashboardScreen';
import { ManageInventoryScreen } from '../screens/vendor/ManageInventoryScreen';
import { AddVehicleScreen } from '../screens/vendor/AddVehicleScreen';
import { ManageSparePartsScreen } from '../screens/vendor/ManageSparePartsScreen';
import { AddSparePartScreen } from '../screens/vendor/AddSparePartScreen';
import { VendorProfileScreen } from '../screens/vendor/VendorProfileScreen';
import { DriverTowDashboard } from '../screens/vendor/DriverTowDashboard';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { NotificationSettingsScreen } from '../screens/profile/NotificationSettingsScreen';
import { SecurityScreen } from '../screens/profile/SecurityScreen';
import { MyInquiriesScreen } from '../screens/profile/MyInquiriesScreen';
import { HelpCenterScreen } from '../screens/profile/HelpCenterScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';
import { VehicleDetailScreen } from '../screens/client/VehicleDetailScreen';
import { Car } from '../types';

export type VendorTabParamList = {
  Dashboard: undefined;
  ManageInventory: undefined;
  AddVehicle: undefined;
  VendorProfile: undefined;
  DriverTowDashboard: undefined;
};

export type VendorStackParamList = {
  MainTabs: undefined;
  VehicleDetail: { car: Car };
  EditProfile: undefined;
  NotificationSettings: undefined;
  Security: undefined;
  MyInquiries: undefined;
  HelpCenter: undefined;
  About: undefined;
  ManageSpareParts: undefined;
  AddSparePart: { part?: any };
};

const Tab = createBottomTabNavigator<VendorTabParamList>();

const TabNavigator = () => {
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
      <Tab.Screen
        name="DriverTowDashboard"
        component={DriverTowDashboard}
        options={{
          tabBarLabel: 'Tow',
          tabBarIcon: ({ color, size }) => (
            <Icon name="car-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const Stack = createStackNavigator<VendorStackParamList>();

export const VendorNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="MyInquiries" component={MyInquiriesScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="ManageSpareParts" component={ManageSparePartsScreen} />
      <Stack.Screen name="AddSparePart" component={AddSparePartScreen} />
    </Stack.Navigator>
  );
};
