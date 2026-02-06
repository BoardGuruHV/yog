import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useSubscriptionStore } from "@/store";
import { offlineStorage, formatBytes } from "@/services/offline/storage";
import { syncService } from "@/services/offline/syncService";
import { Card, Button, Badge } from "@/components/common";

export function OfflineSettingsScreen() {
  const { isPremium } = useSubscriptionStore();
  const [stats, setStats] = useState({
    asanaCount: 0,
    programCount: 0,
    downloadedCount: 0,
    syncQueueCount: 0,
  });
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadStats();
    checkOnlineStatus();

    const unsubscribe = offlineStorage.subscribeToNetworkChanges((online) => {
      setIsOnline(online);
    });

    return unsubscribe;
  }, []);

  const loadStats = () => {
    setStats(offlineStorage.getStorageStats());
  };

  const checkOnlineStatus = async () => {
    const online = await offlineStorage.isOnline();
    setIsOnline(online);
  };

  const handleSync = async () => {
    if (!isOnline) {
      Alert.alert("Offline", "You need an internet connection to sync");
      return;
    }

    setIsSyncing(true);
    const result = await syncService.syncPendingItems();
    setIsSyncing(false);
    loadStats();

    if (result.success > 0 || result.failed === 0) {
      Alert.alert(
        "Sync Complete",
        `${result.success} item${result.success !== 1 ? "s" : ""} synced successfully`
      );
    } else {
      Alert.alert(
        "Sync Issues",
        `${result.failed} item${result.failed !== 1 ? "s" : ""} failed to sync`
      );
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will remove all cached data. You will need to download content again for offline use.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            offlineStorage.clearAll();
            loadStats();
            Alert.alert("Cleared", "Cache has been cleared");
          },
        },
      ]
    );
  };

  if (!isPremium()) {
    return (
      <View style={styles.container}>
        <View style={styles.premiumGate}>
          <Text style={styles.premiumIcon}>⭐</Text>
          <Text style={styles.premiumTitle}>Premium Feature</Text>
          <Text style={styles.premiumDescription}>
            Offline mode is available with Premium and Pro subscriptions.
            Download poses and programs to practice without internet.
          </Text>
          <Button
            title="Upgrade to Premium"
            onPress={() => {}}
            style={styles.upgradeButton}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Connection Status */}
      <Card variant="outlined" padding="md" style={styles.statusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Connection Status</Text>
          <Badge
            label={isOnline ? "Online" : "Offline"}
            variant={isOnline ? "success" : "warning"}
          />
        </View>
      </Card>

      {/* Storage Stats */}
      <Card variant="elevated" padding="md" style={styles.statsCard}>
        <Text style={styles.sectionTitle}>Cached Data</Text>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Cached Poses</Text>
          <Text style={styles.statValue}>{stats.asanaCount}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Cached Programs</Text>
          <Text style={styles.statValue}>{stats.programCount}</Text>
        </View>

        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Downloaded for Offline</Text>
          <Text style={styles.statValue}>{stats.downloadedCount}</Text>
        </View>

        <View style={[styles.statRow, styles.statRowLast]}>
          <Text style={styles.statLabel}>Pending Sync Items</Text>
          <Badge
            label={stats.syncQueueCount.toString()}
            variant={stats.syncQueueCount > 0 ? "warning" : "default"}
            size="sm"
          />
        </View>
      </Card>

      {/* Sync */}
      {stats.syncQueueCount > 0 && (
        <Card variant="outlined" padding="md" style={styles.syncCard}>
          <View style={styles.syncInfo}>
            <Text style={styles.syncTitle}>Pending Changes</Text>
            <Text style={styles.syncDescription}>
              You have {stats.syncQueueCount} change
              {stats.syncQueueCount !== 1 ? "s" : ""} waiting to sync
            </Text>
          </View>
          <Button
            title="Sync Now"
            variant="outline"
            size="sm"
            onPress={handleSync}
            loading={isSyncing}
            disabled={!isOnline}
          />
        </Card>
      )}

      {/* Download Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Download Content</Text>
        <Text style={styles.sectionDescription}>
          Download content to practice without internet connection
        </Text>

        <Card variant="outlined" padding="none">
          <TouchableOpacity style={styles.downloadItem}>
            <View style={styles.downloadInfo}>
              <Text style={styles.downloadTitle}>All Poses</Text>
              <Text style={styles.downloadSize}>~2 MB</Text>
            </View>
            <Button title="Download" size="sm" variant="outline" onPress={() => {}} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.downloadItem}>
            <View style={styles.downloadInfo}>
              <Text style={styles.downloadTitle}>My Programs</Text>
              <Text style={styles.downloadSize}>~500 KB</Text>
            </View>
            <Button title="Download" size="sm" variant="outline" onPress={() => {}} />
          </TouchableOpacity>
        </Card>
      </View>

      {/* Clear Cache */}
      <Button
        title="Clear Cache"
        variant="outline"
        onPress={handleClearCache}
        style={styles.clearButton}
        textStyle={styles.clearButtonText}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  premiumGate: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  premiumIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
  },
  premiumDescription: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  upgradeButton: {
    minWidth: 200,
  },
  statusCard: {
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1e293b",
  },
  statsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  statRowLast: {
    borderBottomWidth: 0,
  },
  statLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  syncCard: {
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  syncInfo: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1e293b",
  },
  syncDescription: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionDescription: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 12,
    marginTop: -8,
  },
  downloadItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  downloadInfo: {
    flex: 1,
  },
  downloadTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1e293b",
  },
  downloadSize: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginLeft: 16,
  },
  clearButton: {
    borderColor: "#ef4444",
  },
  clearButtonText: {
    color: "#ef4444",
  },
});

export default OfflineSettingsScreen;
