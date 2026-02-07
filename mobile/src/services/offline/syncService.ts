// Sync Service - Handles syncing offline data when back online

import { offlineStorage } from './storage';
import { logPractice } from '@/api/endpoints/streak';
import { addFavorite, removeFavorite } from '@/api/endpoints/favorites';

class SyncService {
  private isSyncing: boolean = false;
  private unsubscribeNetwork: (() => void) | null = null;

  // Start listening for network changes
  startNetworkListener(): void {
    if (this.unsubscribeNetwork) {
      return;
    }

    this.unsubscribeNetwork = offlineStorage.subscribeToNetworkChanges(
      async (isOnline) => {
        if (isOnline) {
          await this.syncPendingItems();
        }
      }
    );
  }

  // Stop listening for network changes
  stopNetworkListener(): void {
    if (this.unsubscribeNetwork) {
      this.unsubscribeNetwork();
      this.unsubscribeNetwork = null;
    }
  }

  // Sync all pending items
  async syncPendingItems(): Promise<{
    success: number;
    failed: number;
    errors: string[];
  }> {
    if (this.isSyncing) {
      return { success: 0, failed: 0, errors: ['Sync already in progress'] };
    }

    const isOnline = await offlineStorage.isOnline();
    if (!isOnline) {
      return { success: 0, failed: 0, errors: ['No network connection'] };
    }

    this.isSyncing = true;
    const queue = await offlineStorage.getSyncQueue();

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const item of queue) {
      try {
        const result = await this.processQueueItem(item);

        if (result.success) {
          await offlineStorage.removeSyncItem(item.id);
          success++;
        } else {
          failed++;
          if (result.error) {
            errors.push(`${item.type}: ${result.error}`);
          }
        }
      } catch (error) {
        failed++;
        errors.push(
          `${item.type}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    if (success > 0) {
      offlineStorage.setLastSyncTime();
    }

    this.isSyncing = false;
    return { success, failed, errors };
  }

  // Process individual queue item
  private async processQueueItem(item: {
    action: 'create' | 'update' | 'delete';
    type: 'practice' | 'favorite' | 'program';
    data: unknown;
  }): Promise<{ success: boolean; error?: string }> {
    switch (item.type) {
      case 'practice':
        return this.syncPractice(item.action, item.data);

      case 'favorite':
        return this.syncFavorite(item.action, item.data);

      case 'program':
        // Programs are typically read-only for sync
        return { success: true };

      default:
        return { success: false, error: 'Unknown item type' };
    }
  }

  // Sync practice log
  private async syncPractice(
    action: string,
    data: unknown
  ): Promise<{ success: boolean; error?: string }> {
    if (action !== 'create') {
      return { success: true }; // Only support creating practice logs
    }

    const practiceData = data as {
      programId?: string;
      durationSeconds: number;
      notes?: string;
    };

    const response = await logPractice(practiceData);

    if (response.success) {
      return { success: true };
    }

    return {
      success: false,
      error: response.error?.message || 'Failed to sync practice',
    };
  }

  // Sync favorite toggle
  private async syncFavorite(
    action: string,
    data: unknown
  ): Promise<{ success: boolean; error?: string }> {
    const favoriteData = data as { asanaId: string };

    if (action === 'create') {
      const response = await addFavorite(favoriteData.asanaId);
      if (response.success) {
        return { success: true };
      }
      return {
        success: false,
        error: response.error?.message || 'Failed to add favorite',
      };
    }

    if (action === 'delete') {
      const response = await removeFavorite(favoriteData.asanaId);
      if (response.success) {
        return { success: true };
      }
      return {
        success: false,
        error: response.error?.message || 'Failed to remove favorite',
      };
    }

    return { success: true };
  }

  // Get sync status
  getSyncStatus(): { isSyncing: boolean; pendingCount: number } {
    const stats = offlineStorage.getStorageStats();
    return {
      isSyncing: this.isSyncing,
      pendingCount: stats.syncQueueCount,
    };
  }

  // Check if there are pending items
  async hasPendingItems(): Promise<boolean> {
    const queue = await offlineStorage.getSyncQueue();
    return queue.length > 0;
  }
}

// Singleton instance
export const syncService = new SyncService();

// Export class for testing
export { SyncService };
