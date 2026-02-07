import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore, useSubscriptionStore } from '@/store';
import { Card, Badge } from '@/components/common';
import { ProfileStackScreenProps } from '@/navigation/types';

export function SettingsScreen({ navigation }: ProfileStackScreenProps<'Settings'>) {
  const { user, logout } = useAuthStore();
  const { subscription, isPremium } = useSubscriptionStore();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: logout,
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Section */}
      <Card
        variant="elevated"
        padding="md"
        style={styles.profileCard}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <View style={styles.profileContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Yogi'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
      </Card>

      {/* Subscription */}
      <Card
        variant="elevated"
        padding="md"
        style={styles.subscriptionCard}
        onPress={() => navigation.navigate('Subscription')}
      >
        <View style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Text style={styles.settingEmoji}>⭐</Text>
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>Subscription</Text>
            <Text style={styles.settingDescription}>
              {subscription?.tier || 'FREE'} Plan
            </Text>
          </View>
          <Badge
            label={isPremium() ? 'Premium' : 'Free'}
            variant={isPremium() ? 'success' : 'default'}
            size="sm"
          />
        </View>
      </Card>

      {/* Settings List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <Card variant="outlined" padding="none">
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('OfflineSettings')}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.menuEmoji}>📥</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Offline Mode</Text>
              <Text style={styles.menuDescription}>Download content for offline use</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuEmoji}>🔔</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Notifications</Text>
              <Text style={styles.menuDescription}>Practice reminders</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuEmoji}>🔊</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Sound Settings</Text>
              <Text style={styles.menuDescription}>Timer bells & ambient</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>

        <Card variant="outlined" padding="none">
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuEmoji}>❓</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Help & FAQ</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuEmoji}>💬</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Contact Support</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuEmoji}>📄</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Privacy Policy</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuEmoji}>📋</Text>
            </View>
            <View style={styles.menuInfo}>
              <Text style={styles.menuTitle}>Terms of Service</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </Card>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.version}>Yog Mobile v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  subscriptionCard: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingEmoji: {
    fontSize: 22,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  settingDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuEmoji: {
    fontSize: 18,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  menuDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 64,
  },
  chevron: {
    fontSize: 20,
    color: '#94a3b8',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
  version: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default SettingsScreen;
