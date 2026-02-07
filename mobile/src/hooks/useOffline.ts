import { useState, useEffect, useCallback } from 'react';
import { offlineStorage } from '@/services/offline/storage';
import { syncService } from '@/services/offline/syncService';

interface UseOfflineReturn {
  isOnline: boolean;
  hasPendingSync: boolean;
  pendingCount: number;
  isSyncing: boolean;
  lastSyncTime: number | null;
  sync: () => Promise<{ success: number; failed: number }>;
}

export function useOffline(): UseOfflineReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [hasPendingSync, setHasPendingSync] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  useEffect(() => {
    // Initial status check
    checkStatus();

    // Subscribe to network changes
    const unsubscribe = offlineStorage.subscribeToNetworkChanges((online) => {
      setIsOnline(online);
      if (online) {
        checkPendingItems();
      }
    });

    // Start network listener for auto-sync
    syncService.startNetworkListener();

    return () => {
      unsubscribe();
      syncService.stopNetworkListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkStatus = async () => {
    const online = await offlineStorage.isOnline();
    setIsOnline(online);
    await checkPendingItems();
    setLastSyncTime(offlineStorage.getLastSyncTime());
  };

  const checkPendingItems = async () => {
    const stats = offlineStorage.getStorageStats();
    setHasPendingSync(stats.syncQueueCount > 0);
    setPendingCount(stats.syncQueueCount);
  };

  const sync = useCallback(async () => {
    if (isSyncing) {
      return { success: 0, failed: 0 };
    }

    setIsSyncing(true);
    const result = await syncService.syncPendingItems();
    setIsSyncing(false);
    await checkPendingItems();
    setLastSyncTime(offlineStorage.getLastSyncTime());

    return { success: result.success, failed: result.failed };
  }, [isSyncing]);

  return {
    isOnline,
    hasPendingSync,
    pendingCount,
    isSyncing,
    lastSyncTime,
    sync,
  };
}

export default useOffline;
