// Offline Storage Service using MMKV
// Adapted from web IndexedDB implementation (lib/offline/storage.ts)

import { MMKV } from 'react-native-mmkv';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Asana, Program, Favorite, Streak } from '@/types';

// Initialize MMKV storage
const storage = new MMKV({ id: 'yog-offline-storage' });

// Storage keys
const KEYS = {
  ASANAS: 'offline:asanas',
  PROGRAMS: 'offline:programs',
  FAVORITES: 'offline:favorites',
  STREAK: 'offline:streak',
  SYNC_QUEUE: 'offline:sync_queue',
  LAST_SYNC: 'offline:last_sync',
  DOWNLOADED_PROGRAMS: 'offline:downloaded_programs',
} as const;

// Sync queue item type
interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  type: 'practice' | 'favorite' | 'program';
  data: unknown;
  createdAt: number;
}

class OfflineStorageService {
  // ==========================================
  // Asanas
  // ==========================================

  async saveAsanas(asanas: Asana[]): Promise<void> {
    const data = JSON.stringify(
      asanas.map((a) => ({
        ...a,
        cachedAt: Date.now(),
      }))
    );
    storage.set(KEYS.ASANAS, data);
  }

  async getAsanas(): Promise<Asana[]> {
    const data = storage.getString(KEYS.ASANAS);
    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async getAsanaById(id: string): Promise<Asana | null> {
    const asanas = await this.getAsanas();
    return asanas.find((a) => a.id === id) || null;
  }

  // ==========================================
  // Programs
  // ==========================================

  async savePrograms(programs: Program[]): Promise<void> {
    const data = JSON.stringify(
      programs.map((p) => ({
        ...p,
        cachedAt: Date.now(),
      }))
    );
    storage.set(KEYS.PROGRAMS, data);
  }

  async getPrograms(): Promise<Program[]> {
    const data = storage.getString(KEYS.PROGRAMS);
    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async getProgramById(id: string): Promise<Program | null> {
    const programs = await this.getPrograms();
    return programs.find((p) => p.id === id) || null;
  }

  async markProgramAsDownloaded(id: string): Promise<void> {
    const downloaded = this.getDownloadedProgramIds();
    if (!downloaded.includes(id)) {
      downloaded.push(id);
      storage.set(KEYS.DOWNLOADED_PROGRAMS, JSON.stringify(downloaded));
    }
  }

  getDownloadedProgramIds(): string[] {
    const data = storage.getString(KEYS.DOWNLOADED_PROGRAMS);
    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async getDownloadedPrograms(): Promise<Program[]> {
    const downloadedIds = this.getDownloadedProgramIds();
    const programs = await this.getPrograms();
    return programs.filter((p) => downloadedIds.includes(p.id));
  }

  async removeProgramDownload(id: string): Promise<void> {
    const downloaded = this.getDownloadedProgramIds();
    const filtered = downloaded.filter((d) => d !== id);
    storage.set(KEYS.DOWNLOADED_PROGRAMS, JSON.stringify(filtered));
  }

  // ==========================================
  // Favorites
  // ==========================================

  async saveFavorites(favorites: Favorite[]): Promise<void> {
    storage.set(KEYS.FAVORITES, JSON.stringify(favorites));
  }

  async getFavorites(): Promise<Favorite[]> {
    const data = storage.getString(KEYS.FAVORITES);
    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  // ==========================================
  // Streak
  // ==========================================

  async saveStreak(streak: Streak): Promise<void> {
    storage.set(KEYS.STREAK, JSON.stringify(streak));
  }

  async getStreak(): Promise<Streak | null> {
    const data = storage.getString(KEYS.STREAK);
    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  // ==========================================
  // Sync Queue
  // ==========================================

  async addToSyncQueue(
    action: 'create' | 'update' | 'delete',
    type: 'practice' | 'favorite' | 'program',
    data: unknown
  ): Promise<void> {
    const queue = await this.getSyncQueue();
    const item: SyncQueueItem = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      type,
      data,
      createdAt: Date.now(),
    };
    queue.push(item);
    storage.set(KEYS.SYNC_QUEUE, JSON.stringify(queue));
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const data = storage.getString(KEYS.SYNC_QUEUE);
    if (!data) {
      return [];
    }

    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async removeSyncItem(id: string): Promise<void> {
    const queue = await this.getSyncQueue();
    const filtered = queue.filter((item) => item.id !== id);
    storage.set(KEYS.SYNC_QUEUE, JSON.stringify(filtered));
  }

  async clearSyncQueue(): Promise<void> {
    storage.set(KEYS.SYNC_QUEUE, JSON.stringify([]));
  }

  // ==========================================
  // Network & Sync
  // ==========================================

  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  }

  subscribeToNetworkChanges(callback: (isOnline: boolean) => void): () => void {
    return NetInfo.addEventListener((state: NetInfoState) => {
      callback(state.isConnected === true);
    });
  }

  getLastSyncTime(): number | null {
    const time = storage.getNumber(KEYS.LAST_SYNC);
    return time || null;
  }

  setLastSyncTime(): void {
    storage.set(KEYS.LAST_SYNC, Date.now());
  }

  // ==========================================
  // Storage Stats
  // ==========================================

  getStorageStats(): {
    asanaCount: number;
    programCount: number;
    downloadedCount: number;
    syncQueueCount: number;
  } {
    let asanaCount = 0;
    let programCount = 0;

    try {
      const asanas = storage.getString(KEYS.ASANAS);
      if (asanas) {
        asanaCount = JSON.parse(asanas).length;
      }
    } catch {}

    try {
      const programs = storage.getString(KEYS.PROGRAMS);
      if (programs) {
        programCount = JSON.parse(programs).length;
      }
    } catch {}

    const downloadedCount = this.getDownloadedProgramIds().length;

    let syncQueueCount = 0;
    try {
      const queue = storage.getString(KEYS.SYNC_QUEUE);
      if (queue) {
        syncQueueCount = JSON.parse(queue).length;
      }
    } catch {}

    return {
      asanaCount,
      programCount,
      downloadedCount,
      syncQueueCount,
    };
  }

  // ==========================================
  // Clear All Data
  // ==========================================

  clearAll(): void {
    Object.values(KEYS).forEach((key) => {
      storage.delete(key);
    });
  }
}

// Singleton instance
export const offlineStorage = new OfflineStorageService();

// Export class for testing
export { OfflineStorageService };

// Utility functions
export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
