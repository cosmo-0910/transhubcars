import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { NotificationSettingsScreen } from '../screens/profile/NotificationSettingsScreen';
import { SecurityScreen } from '../screens/profile/SecurityScreen';
import { MyOrdersScreen } from '../screens/profile/MyOrdersScreen';
import { MyInquiriesScreen } from '../screens/profile/MyInquiriesScreen';
import { FavoritesScreen } from '../screens/profile/FavoritesScreen';
import { HelpCenterScreen } from '../screens/profile/HelpCenterScreen';
import { AboutScreen } from '../screens/profile/AboutScreen';

export type ProfileStackParamList = {
  EditProfile: undefined;
  NotificationSettings: undefined;
  Security: undefined;
  MyOrders: undefined;
  MyInquiries: undefined;
  Favorites: undefined;
  HelpCenter: undefined;
  About: undefined;
};

const Stack = createStackNavigator<ProfileStackParamList>();

export const ProfileNavigator = ({ initialRouteName }: { initialRouteName?: keyof ProfileStackParamList }) => {
  return (
    <Stack.Navigator 
      initialRouteName={initialRouteName}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <Stack.Screen name="Security" component={SecurityScreen} />
      <Stack.Screen name="MyOrders" component={MyOrdersScreen} />
      <Stack.Screen name="MyInquiries" component={MyInquiriesScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
};
