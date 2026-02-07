import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../types';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { OfflineSettingsScreen } from '@/screens/settings/OfflineSettingsScreen';
import { SubscriptionScreen } from '@/screens/settings/SubscriptionScreen';
import { EditProfileScreen } from '@/screens/settings/EditProfileScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#1e293b',
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name="OfflineSettings"
        component={OfflineSettingsScreen}
        options={{ title: 'Offline Mode' }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{ title: 'Subscription' }}
      />
    </Stack.Navigator>
  );
}

export default ProfileNavigator;
