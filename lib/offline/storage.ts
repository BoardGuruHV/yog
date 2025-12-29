// IndexedDB-based offline storage for the PWA

const DB_NAME = "yog-offline-db";
const DB_VERSION = 1;

interface DBSchema {
  asanas: {
    key: string;
    value: {
      id: string;
      data: unknown;
      cachedAt: number;
    };
  };
  programs: {
    key: string;
    value: {
      id: string;
      data: unknown;
      cachedAt: number;
      isDownloaded: boolean;
    };
  };
  favorites: {
    key: string;
    value: {
      asanaId: string;
      cachedAt: number;
    };
  };
  pendingSync: {
    key: string;
    value: {
      id: string;
      action: "create" | "update" | "delete";
      type: "practice" | "favorite" | "program";
      data: unknown;
      createdAt: number;
    };
  };
}

let db: IDBDatabase | null = null;

// Initialize the database
export async function initDB(): Promise<IDBDatabase> {
  if (db) return db;

  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      // Create asanas store
      if (!database.objectStoreNames.contains("asanas")) {
        const asanasStore = database.createObjectStore("asanas", {
          keyPath: "id",
        });
        asanasStore.createIndex("cachedAt", "cachedAt", { unique: false });
      }

      // Create programs store
      if (!database.objectStoreNames.contains("programs")) {
        const programsStore = database.createObjectStore("programs", {
          keyPath: "id",
        });
        programsStore.createIndex("cachedAt", "cachedAt", { unique: false });
        programsStore.createIndex("isDownloaded", "isDownloaded", {
          unique: false,
        });
      }

      // Create favorites store
      if (!database.objectStoreNames.contains("favorites")) {
        database.createObjectStore("favorites", { keyPath: "asanaId" });
      }

      // Create pending sync store
      if (!database.objectStoreNames.contains("pendingSync")) {
        const syncStore = database.createObjectStore("pendingSync", {
          keyPath: "id",
        });
        syncStore.createIndex("createdAt", "createdAt", { unique: false });
        syncStore.createIndex("type", "type", { unique: false });
      }
    };
  });
}

// Generic store operations
async function getStore(
  storeName: keyof DBSchema,
  mode: IDBTransactionMode = "readonly"
): Promise<IDBObjectStore> {
  const database = await initDB();
  const transaction = database.transaction(storeName, mode);
  return transaction.objectStore(storeName);
}

// Save an item to a store
export async function saveItem<K extends keyof DBSchema>(
  storeName: K,
  item: DBSchema[K]["value"]
): Promise<void> {
  const store = await getStore(storeName, "readwrite");
  return new Promise((resolve, reject) => {
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to save item to ${storeName}`));
  });
}

// Get an item from a store
export async function getItem<K extends keyof DBSchema>(
  storeName: K,
  key: string
): Promise<DBSchema[K]["value"] | undefined> {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to get item from ${storeName}`));
  });
}

// Get all items from a store
export async function getAllItems<K extends keyof DBSchema>(
  storeName: K
): Promise<DBSchema[K]["value"][]> {
  const store = await getStore(storeName);
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error(`Failed to get items from ${storeName}`));
  });
}

// Delete an item from a store
export async function deleteItem(
  storeName: keyof DBSchema,
  key: string
): Promise<void> {
  const store = await getStore(storeName, "readwrite");
  return new Promise((resolve, reject) => {
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to delete item from ${storeName}`));
  });
}

// Clear all items from a store
export async function clearStore(storeName: keyof DBSchema): Promise<void> {
  const store = await getStore(storeName, "readwrite");
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(new Error(`Failed to clear ${storeName}`));
  });
}

// Asana-specific operations
export async function cacheAsana(asana: unknown): Promise<void> {
  const asanaData = asana as { id: string };
  await saveItem("asanas", {
    id: asanaData.id,
    data: asana,
    cachedAt: Date.now(),
  });
}

export async function getCachedAsana(id: string): Promise<unknown | undefined> {
  const item = await getItem("asanas", id);
  return item?.data;
}

export async function getAllCachedAsanas(): Promise<unknown[]> {
  const items = await getAllItems("asanas");
  return items.map((item) => item.data);
}

// Program-specific operations
export async function cacheProgram(
  program: unknown,
  isDownloaded = false
): Promise<void> {
  const programData = program as { id: string };
  await saveItem("programs", {
    id: programData.id,
    data: program,
    cachedAt: Date.now(),
    isDownloaded,
  });
}

export async function getCachedProgram(id: string): Promise<unknown | undefined> {
  const item = await getItem("programs", id);
  return item?.data;
}

export async function getDownloadedPrograms(): Promise<unknown[]> {
  const items = await getAllItems("programs");
  return items.filter((item) => item.isDownloaded).map((item) => item.data);
}

export async function markProgramAsDownloaded(id: string): Promise<void> {
  const item = await getItem("programs", id);
  if (item) {
    item.isDownloaded = true;
    await saveItem("programs", item);
  }
}

// Sync queue operations
export async function addToSyncQueue(
  action: "create" | "update" | "delete",
  type: "practice" | "favorite" | "program",
  data: unknown
): Promise<void> {
  const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  await saveItem("pendingSync", {
    id,
    action,
    type,
    data,
    createdAt: Date.now(),
  });
}

export async function getPendingSyncItems(): Promise<DBSchema["pendingSync"]["value"][]> {
  return getAllItems("pendingSync");
}

export async function removeSyncItem(id: string): Promise<void> {
  await deleteItem("pendingSync", id);
}

// Check if we're online
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

// Get storage estimate
export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
  percentUsed: number;
} | null> {
  if (typeof window === "undefined" || !navigator.storage?.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;
    const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

    return { usage, quota, percentUsed };
  } catch {
    return null;
  }
}

// Format bytes to human-readable
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
