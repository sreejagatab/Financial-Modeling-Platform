/**
 * IndexedDB Offline Storage for Excel Add-in
 *
 * Provides persistent offline storage for sync operations, cached values,
 * and user preferences using IndexedDB.
 */

// Database configuration
const DB_NAME = 'FinancialPlatformExcel';
const DB_VERSION = 1;

// Store names
const STORES = {
  PENDING_OPERATIONS: 'pendingOperations',
  CACHED_VALUES: 'cachedValues',
  LINKED_CELLS: 'linkedCells',
  USER_PREFERENCES: 'userPreferences',
  SYNC_METADATA: 'syncMetadata',
} as const;

// Types
export interface SyncOperation {
  id?: number;
  type: 'update' | 'delete' | 'insert';
  address: string;
  value?: string | number;
  formula?: string;
  timestamp: string;
  clientId: string;
  modelPath?: string;
  retryCount?: number;
}

export interface CachedValue {
  key: string;
  modelPath: string;
  reference: string;
  value: string | number;
  timestamp: string;
  expiresAt: string;
  version?: number;
}

export interface LinkedCell {
  id?: number;
  localAddress: string;
  modelPath: string;
  remoteReference: string;
  lastSyncedAt: string;
  lastValue: string | number;
  syncDirection: 'bidirectional' | 'pull' | 'push';
}

export interface SyncMetadata {
  key: string;
  lastSyncTimestamp: string;
  syncVersion: number;
  serverVersion: number;
}

export interface UserPreference {
  key: string;
  value: any;
  updatedAt: string;
}

/**
 * IndexedDB Store Manager
 */
export class IndexedDBStore {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initializeDatabase();
  }

  /**
   * Initialize the IndexedDB database
   */
  private async initializeDatabase(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('IndexedDB error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });

    return this.dbPromise;
  }

  /**
   * Create object stores
   */
  private createStores(db: IDBDatabase): void {
    // Pending operations store
    if (!db.objectStoreNames.contains(STORES.PENDING_OPERATIONS)) {
      const pendingStore = db.createObjectStore(STORES.PENDING_OPERATIONS, {
        keyPath: 'id',
        autoIncrement: true,
      });
      pendingStore.createIndex('address', 'address', { unique: false });
      pendingStore.createIndex('timestamp', 'timestamp', { unique: false });
      pendingStore.createIndex('modelPath', 'modelPath', { unique: false });
    }

    // Cached values store
    if (!db.objectStoreNames.contains(STORES.CACHED_VALUES)) {
      const cacheStore = db.createObjectStore(STORES.CACHED_VALUES, {
        keyPath: 'key',
      });
      cacheStore.createIndex('modelPath', 'modelPath', { unique: false });
      cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
    }

    // Linked cells store
    if (!db.objectStoreNames.contains(STORES.LINKED_CELLS)) {
      const linkedStore = db.createObjectStore(STORES.LINKED_CELLS, {
        keyPath: 'id',
        autoIncrement: true,
      });
      linkedStore.createIndex('localAddress', 'localAddress', { unique: true });
      linkedStore.createIndex('modelPath', 'modelPath', { unique: false });
    }

    // User preferences store
    if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
      db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'key' });
    }

    // Sync metadata store
    if (!db.objectStoreNames.contains(STORES.SYNC_METADATA)) {
      db.createObjectStore(STORES.SYNC_METADATA, { keyPath: 'key' });
    }
  }

  /**
   * Get database connection
   */
  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return this.initializeDatabase();
  }

  // ===== Pending Operations =====

  /**
   * Add a pending sync operation
   */
  async addPendingOperation(operation: Omit<SyncOperation, 'id'>): Promise<number> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.PENDING_OPERATIONS, 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_OPERATIONS);
      const request = store.add({ ...operation, retryCount: 0 });

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending operations
   */
  async getPendingOperations(): Promise<SyncOperation[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.PENDING_OPERATIONS, 'readonly');
      const store = transaction.objectStore(STORES.PENDING_OPERATIONS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get pending operations by address
   */
  async getPendingOperationByAddress(address: string): Promise<SyncOperation | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.PENDING_OPERATIONS, 'readonly');
      const store = transaction.objectStore(STORES.PENDING_OPERATIONS);
      const index = store.index('address');
      const request = index.get(address);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Update a pending operation
   */
  async updatePendingOperation(operation: SyncOperation): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.PENDING_OPERATIONS, 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_OPERATIONS);
      const request = store.put(operation);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove a pending operation by ID
   */
  async removePendingOperation(id: number): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.PENDING_OPERATIONS, 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_OPERATIONS);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all pending operations
   */
  async clearPendingOperations(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.PENDING_OPERATIONS, 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_OPERATIONS);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ===== Cached Values =====

  /**
   * Cache a value
   */
  async cacheValue(modelPath: string, reference: string, value: string | number, ttlMs: number = 300000): Promise<void> {
    const db = await this.getDB();
    const key = `${modelPath}:${reference}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMs);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.CACHED_VALUES, 'readwrite');
      const store = transaction.objectStore(STORES.CACHED_VALUES);
      const request = store.put({
        key,
        modelPath,
        reference,
        value,
        timestamp: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a cached value
   */
  async getCachedValue(modelPath: string, reference: string): Promise<CachedValue | undefined> {
    const db = await this.getDB();
    const key = `${modelPath}:${reference}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.CACHED_VALUES, 'readonly');
      const store = transaction.objectStore(STORES.CACHED_VALUES);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as CachedValue | undefined;
        if (result && new Date(result.expiresAt) > new Date()) {
          resolve(result);
        } else {
          resolve(undefined);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear expired cached values
   */
  async clearExpiredCache(): Promise<void> {
    const db = await this.getDB();
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.CACHED_VALUES, 'readwrite');
      const store = transaction.objectStore(STORES.CACHED_VALUES);
      const index = store.index('expiresAt');
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cached values
   */
  async clearAllCache(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.CACHED_VALUES, 'readwrite');
      const store = transaction.objectStore(STORES.CACHED_VALUES);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ===== Linked Cells =====

  /**
   * Add or update a linked cell
   */
  async upsertLinkedCell(cell: Omit<LinkedCell, 'id'>): Promise<void> {
    const db = await this.getDB();

    // Check if exists
    const existing = await this.getLinkedCellByAddress(cell.localAddress);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.LINKED_CELLS, 'readwrite');
      const store = transaction.objectStore(STORES.LINKED_CELLS);

      const data = existing ? { ...cell, id: existing.id } : cell;
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a linked cell by local address
   */
  async getLinkedCellByAddress(localAddress: string): Promise<LinkedCell | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.LINKED_CELLS, 'readonly');
      const store = transaction.objectStore(STORES.LINKED_CELLS);
      const index = store.index('localAddress');
      const request = index.get(localAddress);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all linked cells
   */
  async getAllLinkedCells(): Promise<LinkedCell[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.LINKED_CELLS, 'readonly');
      const store = transaction.objectStore(STORES.LINKED_CELLS);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get linked cells by model path
   */
  async getLinkedCellsByModel(modelPath: string): Promise<LinkedCell[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.LINKED_CELLS, 'readonly');
      const store = transaction.objectStore(STORES.LINKED_CELLS);
      const index = store.index('modelPath');
      const request = index.getAll(modelPath);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Remove a linked cell
   */
  async removeLinkedCell(localAddress: string): Promise<void> {
    const existing = await this.getLinkedCellByAddress(localAddress);
    if (!existing?.id) return;

    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.LINKED_CELLS, 'readwrite');
      const store = transaction.objectStore(STORES.LINKED_CELLS);
      const request = store.delete(existing.id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // ===== User Preferences =====

  /**
   * Set a user preference
   */
  async setPreference(key: string, value: any): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.USER_PREFERENCES, 'readwrite');
      const store = transaction.objectStore(STORES.USER_PREFERENCES);
      const request = store.put({
        key,
        value,
        updatedAt: new Date().toISOString(),
      });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get a user preference
   */
  async getPreference<T = any>(key: string): Promise<T | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.USER_PREFERENCES, 'readonly');
      const store = transaction.objectStore(STORES.USER_PREFERENCES);
      const request = store.get(key);

      request.onsuccess = () => {
        const result = request.result as UserPreference | undefined;
        resolve(result?.value);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all preferences
   */
  async getAllPreferences(): Promise<Record<string, any>> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.USER_PREFERENCES, 'readonly');
      const store = transaction.objectStore(STORES.USER_PREFERENCES);
      const request = store.getAll();

      request.onsuccess = () => {
        const result: Record<string, any> = {};
        (request.result as UserPreference[]).forEach((pref) => {
          result[pref.key] = pref.value;
        });
        resolve(result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ===== Sync Metadata =====

  /**
   * Update sync metadata
   */
  async updateSyncMetadata(metadata: SyncMetadata): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_METADATA, 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_METADATA);
      const request = store.put(metadata);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get sync metadata
   */
  async getSyncMetadata(key: string): Promise<SyncMetadata | undefined> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORES.SYNC_METADATA, 'readonly');
      const store = transaction.objectStore(STORES.SYNC_METADATA);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // ===== Utilities =====

  /**
   * Get database statistics
   */
  async getStats(): Promise<{
    pendingOperations: number;
    cachedValues: number;
    linkedCells: number;
  }> {
    const db = await this.getDB();

    const countStore = (storeName: string): Promise<number> => {
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    };

    const [pendingOperations, cachedValues, linkedCells] = await Promise.all([
      countStore(STORES.PENDING_OPERATIONS),
      countStore(STORES.CACHED_VALUES),
      countStore(STORES.LINKED_CELLS),
    ]);

    return { pendingOperations, cachedValues, linkedCells };
  }

  /**
   * Clear all data
   */
  async clearAll(): Promise<void> {
    const db = await this.getDB();
    const storeNames = Object.values(STORES);

    await Promise.all(
      storeNames.map(
        (storeName) =>
          new Promise<void>((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          })
      )
    );
  }

  /**
   * Close database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }
}

// Export singleton instance
export const offlineStore = new IndexedDBStore();
