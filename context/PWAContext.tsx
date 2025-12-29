"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  initDB,
  isOnline as checkOnline,
  getStorageEstimate,
  formatBytes,
  cacheAsana,
  getCachedAsana,
  getAllCachedAsanas,
  cacheProgram,
  getCachedProgram,
  getDownloadedPrograms,
  markProgramAsDownloaded,
  addToSyncQueue,
} from "@/lib/offline/storage";
import {
  registerSyncListeners,
  isServiceWorkerRegistered,
  requestPersistentStorage,
} from "@/lib/offline/sync";

interface StorageInfo {
  usage: string;
  quota: string;
  percentUsed: number;
}

interface PWAContextType {
  isOnline: boolean;
  isInstalled: boolean;
  isServiceWorkerActive: boolean;
  storageInfo: StorageInfo | null;
  // Offline data operations
  cacheAsana: (asana: unknown) => Promise<void>;
  getCachedAsana: (id: string) => Promise<unknown | undefined>;
  getAllCachedAsanas: () => Promise<unknown[]>;
  cacheProgram: (program: unknown, download?: boolean) => Promise<void>;
  getCachedProgram: (id: string) => Promise<unknown | undefined>;
  getDownloadedPrograms: () => Promise<unknown[]>;
  downloadProgram: (id: string) => Promise<void>;
  // Sync operations
  queueForSync: (
    action: "create" | "update" | "delete",
    type: "practice" | "favorite" | "program",
    data: unknown
  ) => Promise<void>;
  // Storage management
  refreshStorageInfo: () => Promise<void>;
  requestPersistence: () => Promise<boolean>;
}

const PWAContext = createContext<PWAContextType | null>(null);

export function PWAProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isServiceWorkerActive, setIsServiceWorkerActive] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  // Initialize
  useEffect(() => {
    const init = async () => {
      // Check online status
      setIsOnline(checkOnline());

      // Check if installed as PWA
      if (typeof window !== "undefined") {
        setIsInstalled(
          window.matchMedia("(display-mode: standalone)").matches
        );
      }

      // Initialize IndexedDB
      try {
        await initDB();
      } catch (error) {
        console.error("Failed to initialize IndexedDB:", error);
      }

      // Check service worker
      const swActive = await isServiceWorkerRegistered();
      setIsServiceWorkerActive(swActive);

      // Get storage info
      await refreshStorageInfo();
    };

    init();

    // Register sync listeners
    const unregister = registerSyncListeners((result) => {
      if (result.syncedCount > 0) {
        console.log(`Synced ${result.syncedCount} pending items`);
      }
    });

    // Listen for online/offline
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      unregister();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Refresh storage info
  const refreshStorageInfo = useCallback(async () => {
    const estimate = await getStorageEstimate();
    if (estimate) {
      setStorageInfo({
        usage: formatBytes(estimate.usage),
        quota: formatBytes(estimate.quota),
        percentUsed: Math.round(estimate.percentUsed * 100) / 100,
      });
    }
  }, []);

  // Request persistent storage
  const requestPersistence = useCallback(async () => {
    const granted = await requestPersistentStorage();
    return granted;
  }, []);

  // Queue item for sync when back online
  const queueForSync = useCallback(
    async (
      action: "create" | "update" | "delete",
      type: "practice" | "favorite" | "program",
      data: unknown
    ) => {
      await addToSyncQueue(action, type, data);
    },
    []
  );

  // Download a program for offline use
  const downloadProgram = useCallback(async (id: string) => {
    try {
      // Fetch program data
      const response = await fetch(`/api/programs/${id}`);
      if (!response.ok) throw new Error("Failed to fetch program");

      const program = await response.json();

      // Cache the program
      await cacheProgram(program, true);
      await markProgramAsDownloaded(id);

      // Cache all asanas in the program
      if (program.asanas && Array.isArray(program.asanas)) {
        for (const programAsana of program.asanas) {
          if (programAsana.asana) {
            await cacheAsana(programAsana.asana);
          }
        }
      }
    } catch (error) {
      console.error("Failed to download program:", error);
      throw error;
    }
  }, []);

  const value: PWAContextType = {
    isOnline,
    isInstalled,
    isServiceWorkerActive,
    storageInfo,
    cacheAsana,
    getCachedAsana,
    getAllCachedAsanas,
    cacheProgram,
    getCachedProgram,
    getDownloadedPrograms,
    downloadProgram,
    queueForSync,
    refreshStorageInfo,
    requestPersistence,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return context;
}
