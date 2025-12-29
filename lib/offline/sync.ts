// Background sync utilities for the PWA

import {
  getPendingSyncItems,
  removeSyncItem,
  isOnline,
} from "./storage";

interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

// Sync all pending items when back online
export async function syncPendingItems(): Promise<SyncResult> {
  if (!isOnline()) {
    return {
      success: false,
      syncedCount: 0,
      failedCount: 0,
      errors: ["Device is offline"],
    };
  }

  const pendingItems = await getPendingSyncItems();

  if (pendingItems.length === 0) {
    return {
      success: true,
      syncedCount: 0,
      failedCount: 0,
      errors: [],
    };
  }

  const result: SyncResult = {
    success: true,
    syncedCount: 0,
    failedCount: 0,
    errors: [],
  };

  for (const item of pendingItems) {
    try {
      await syncItem(item);
      await removeSyncItem(item.id);
      result.syncedCount++;
    } catch (error) {
      result.failedCount++;
      result.success = false;
      result.errors.push(
        `Failed to sync ${item.type} (${item.action}): ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  return result;
}

// Sync a single item
async function syncItem(item: {
  action: "create" | "update" | "delete";
  type: "practice" | "favorite" | "program";
  data: unknown;
}): Promise<void> {
  const { action, type, data } = item;

  let endpoint = "";
  let method = "POST";

  switch (type) {
    case "practice":
      endpoint = "/api/streak";
      method = action === "create" ? "POST" : "PUT";
      break;
    case "favorite":
      endpoint = "/api/favorites";
      method = action === "delete" ? "DELETE" : "POST";
      break;
    case "program":
      endpoint = "/api/programs";
      method = action === "create" ? "POST" : action === "update" ? "PUT" : "DELETE";
      break;
    default:
      throw new Error(`Unknown sync type: ${type}`);
  }

  const response = await fetch(endpoint, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
}

// Register online/offline event listeners
export function registerSyncListeners(
  onSyncComplete?: (result: SyncResult) => void
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleOnline = async () => {
    console.log("Back online, syncing pending items...");
    const result = await syncPendingItems();
    console.log("Sync complete:", result);
    onSyncComplete?.(result);
  };

  const handleOffline = () => {
    console.log("Device went offline");
  };

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Initial sync if online
  if (isOnline()) {
    syncPendingItems().then(onSyncComplete);
  }

  // Return cleanup function
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}

// Check if service worker is registered
export async function isServiceWorkerRegistered(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    return !!registration;
  } catch {
    return false;
  }
}

// Request persistent storage (helps prevent cache eviction)
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.storage?.persist) {
    return false;
  }

  try {
    const isPersisted = await navigator.storage.persist();
    return isPersisted;
  } catch {
    return false;
  }
}

// Check if persistent storage is granted
export async function isPersistentStorageGranted(): Promise<boolean> {
  if (typeof window === "undefined" || !navigator.storage?.persisted) {
    return false;
  }

  try {
    return await navigator.storage.persisted();
  } catch {
    return false;
  }
}
