import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, FONT_SIZES } from '../utils/theme';
import { Car } from '../types';

// Screens
import { HomeScreen } from '../screens/client/HomeScreen';
import { InventoryScreen } from '../screens/client/InventoryScreen';
import { ProfileScreen } from '../screens/client/ProfileScreen';
import { VehicleDetailScreen } from '../screens/client/VehicleDetailScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { NotificationSettingsScreen } from '../screens/profile/NotificationSettingsScreen';
import { SecurityScreen } from '../screens/profile/SecurityScreen';
import { MyOrdersScreen } from '../screens/profile/MyOrdersScreen';
import { MyInquiriesScreen } from '../screens/profile/MyInquiriesScreen';
import { FavoritesScreen } from '../screens/profile/FavoritesScreen';
import { HelpCenterScreen } from '../screens/profile/HelpCenterScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';
import { OrderDetailScreen } from '../screens/profile/OrderDetailScreen';
import { InquiryDetailScreen } from '../screens/profile/InquiryDetailScreen';
import { ServicesScreen } from '../screens/client/ServicesScreen';
import { SparePartsMarketplaceScreen } from '../screens/client/SparePartsMarketplaceScreen';
import { SparePartsScreen as SparePartsRequestScreen } from '../screens/client/SparePartsScreen';
import { SparePartDetailScreen } from '../screens/client/SparePartDetailScreen';
import { TowTruckScreen } from '../screens/client/TowTruckScreen';
import { TowTruckMapScreen } from '../screens/client/TowTruckMapScreen';
import { TowTrackingScreen } from '../screens/client/TowTrackingScreen';
import { MechanicsScreen } from '../screens/client/MechanicsScreen';

export type ClientStackParamList = {
  MainTabs: undefined;
  VehicleDetail: { car: Car };
  EditProfile: undefined;
  NotificationSettings: undefined;
  Security: undefined;
  MyOrders: undefined;
  MyInquiries: undefined;
  Favorites: undefined;
  HelpCenter: undefined;
  About: undefined;
  OrderDetail: { order: any };
  InquiryDetail: { inquiry: any };
  Services: undefined;
  SpareParts: undefined;
  SparePartsRequest: undefined;
  SparePartDetail: { part: any };
  TowTruck: undefined;
  TowTruckMap: undefined;
  TowTracking: { requestId: string };
  Mechanics: undefined;
};

export type ClientTabParamList = {
  Home: undefined;
  Inventory: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<ClientTabParamList>();
const Stack = createStackNavigator<ClientStackParamList>();

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
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="car-sport-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const ClientNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="VehicleDetail" component={VehicleDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="MyInquiries" component={MyInquiriesScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="InquiryDetail" component={InquiryDetailScreen} />
      <Stack.Screen name="Services" component={ServicesScreen} />
      <Stack.Screen name="SpareParts" component={SparePartsMarketplaceScreen} />
      <Stack.Screen name="SparePartsRequest" component={SparePartsRequestScreen} />
      <Stack.Screen name="SparePartDetail" component={SparePartDetailScreen} />
      <Stack.Screen name="TowTruck" component={TowTruckScreen} />
      <Stack.Screen name="TowTruckMap" component={TowTruckMapScreen} />
      <Stack.Screen name="TowTracking" component={TowTrackingScreen} />
      <Stack.Screen name="Mechanics" component={MechanicsScreen} />
    </Stack.Navigator>
  );
};
