/**
 * Excel Sync Engine
 *
 * Handles synchronization between Excel workbooks and the Financial Modeling Platform.
 * Supports real-time collaboration, conflict resolution, and offline capabilities.
 */

import { offlineStore, SyncOperation as StoredOperation, LinkedCell } from '../offline/IndexedDBStore';

interface FetchValueRequest {
  modelPath: string;
  reference: string;
  version: string | number;
}

interface LinkRequest {
  modelPath: string;
  reference: string;
}

interface ScenarioRequest {
  scenario: string;
  reference: string;
}

interface LiveDataParams {
  source: string;
  id: string;
  field: string;
}

interface SensitivityRequest {
  inputAddress: string;
  outputAddress: string;
  steps: number;
  variationPercent: number;
}

interface AuditRequest {
  reference: string;
  field: string;
}

interface CommentRequest {
  reference: string;
}

export interface SyncOperation {
  type: 'update' | 'delete' | 'insert';
  address: string;
  value?: string | number;
  formula?: string;
  timestamp: string;
  clientId: string;
  modelPath?: string;
}

interface ConflictResolution {
  operation: SyncOperation;
  resolution: 'accept' | 'reject' | 'merge';
  resolvedValue?: string | number;
}

interface SyncStatus {
  isOnline: boolean;
  pendingOperations: number;
  lastSyncTime: string | null;
  linkedCells: number;
}

type ConnectionStatusCallback = (isOnline: boolean) => void;
type SyncStatusCallback = (status: SyncStatus) => void;

export class SyncEngine {
  private apiBaseUrl: string;
  private wsConnection: WebSocket | null = null;
  private pendingOperations: Map<string, SyncOperation> = new Map();
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private clientId: string;
  private isOnline: boolean = true;
  private authToken: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectDelay: number = 1000;
  private syncStatusCallbacks: Set<SyncStatusCallback> = new Set();
  private connectionStatusCallbacks: Set<ConnectionStatusCallback> = new Set();
  private lastSyncTime: string | null = null;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.apiBaseUrl = this.getApiBaseUrl();
    this.clientId = this.generateClientId();
    this.initializeConnectionMonitor();
    this.loadPendingOperationsFromStorage();
    this.startPeriodicSync();
  }

  private getApiBaseUrl(): string {
    // Check for environment variable or use default
    return (typeof process !== 'undefined' && process.env?.PLATFORM_API_URL) ||
      'http://localhost:8001/api/v1';
  }

  private generateClientId(): string {
    const stored = localStorage.getItem('fp_excel_client_id');
    if (stored) return stored;

    const newId = `excel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('fp_excel_client_id', newId);
    return newId;
  }

  private initializeConnectionMonitor(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyConnectionStatus(true);
        this.syncPendingOperations();
        this.ensureWebSocketConnection();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyConnectionStatus(false);
      });

      // Initial check
      this.isOnline = navigator.onLine;
    }
  }

  private async loadPendingOperationsFromStorage(): Promise<void> {
    try {
      const storedOperations = await offlineStore.getPendingOperations();
      storedOperations.forEach((op) => {
        this.pendingOperations.set(op.address, {
          type: op.type,
          address: op.address,
          value: op.value,
          formula: op.formula,
          timestamp: op.timestamp,
          clientId: op.clientId,
          modelPath: op.modelPath,
        });
      });
    } catch (error) {
      console.error('Failed to load pending operations:', error);
    }
  }

  private startPeriodicSync(): void {
    // Sync every 30 seconds if online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.pendingOperations.size > 0) {
        this.syncPendingOperations();
      }
    }, 30000);
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionStatusChange(callback: ConnectionStatusCallback): () => void {
    this.connectionStatusCallbacks.add(callback);
    // Immediately notify of current status
    callback(this.isOnline);
    return () => this.connectionStatusCallbacks.delete(callback);
  }

  /**
   * Subscribe to sync status changes
   */
  onSyncStatusChange(callback: SyncStatusCallback): () => void {
    this.syncStatusCallbacks.add(callback);
    // Immediately notify of current status
    this.notifySyncStatus();
    return () => this.syncStatusCallbacks.delete(callback);
  }

  private notifyConnectionStatus(isOnline: boolean): void {
    this.connectionStatusCallbacks.forEach((cb) => cb(isOnline));
  }

  private async notifySyncStatus(): Promise<void> {
    const stats = await offlineStore.getStats();
    const status: SyncStatus = {
      isOnline: this.isOnline,
      pendingOperations: stats.pendingOperations,
      lastSyncTime: this.lastSyncTime,
      linkedCells: stats.linkedCells,
    };
    this.syncStatusCallbacks.forEach((cb) => cb(status));
  }

  /**
   * Get current sync status
   */
  async getSyncStatus(): Promise<SyncStatus> {
    const stats = await offlineStore.getStats();
    return {
      isOnline: this.isOnline,
      pendingOperations: stats.pendingOperations,
      lastSyncTime: this.lastSyncTime,
      linkedCells: stats.linkedCells,
    };
  }

  /**
   * Fetch a value from the platform
   */
  async fetchValue(request: FetchValueRequest): Promise<{ value: string | number }> {
    // Try cache first if offline
    if (!this.isOnline) {
      const cached = await offlineStore.getCachedValue(request.modelPath, request.reference);
      if (cached) {
        return { value: cached.value };
      }
      throw new Error('Offline and no cached value available');
    }

    try {
      const response = await this.makeRequest('/excel/get-value', {
        method: 'POST',
        body: JSON.stringify(request),
      });

      // Cache the value
      await offlineStore.cacheValue(request.modelPath, request.reference, response.value);

      return response;
    } catch (error) {
      // Fall back to cache on network error
      const cached = await offlineStore.getCachedValue(request.modelPath, request.reference);
      if (cached) {
        return { value: cached.value };
      }
      throw error;
    }
  }

  /**
   * Create a bidirectional link
   */
  async createLink(request: LinkRequest): Promise<{ value: string | number }> {
    const response = await this.makeRequest('/excel/create-link', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        clientId: this.clientId,
      }),
    });

    // Store linked cell info
    await offlineStore.upsertLinkedCell({
      localAddress: request.reference,
      modelPath: request.modelPath,
      remoteReference: request.reference,
      lastSyncedAt: new Date().toISOString(),
      lastValue: response.value,
      syncDirection: 'bidirectional',
    });

    return response;
  }

  /**
   * Get value from a specific scenario
   */
  async getScenarioValue(request: ScenarioRequest): Promise<{ value: string | number }> {
    const cacheKey = `scenario:${request.scenario}`;

    if (!this.isOnline) {
      const cached = await offlineStore.getCachedValue(cacheKey, request.reference);
      if (cached) {
        return { value: cached.value };
      }
      throw new Error('Offline and no cached scenario value');
    }

    const response = await this.makeRequest('/excel/scenario-value', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    await offlineStore.cacheValue(cacheKey, request.reference, response.value);
    return response;
  }

  /**
   * Subscribe to live data updates
   */
  subscribeToLiveData(
    params: LiveDataParams,
    onData: (data: { value: string | number }) => void,
    onError: (error: Error) => void
  ): () => void {
    const subscriptionKey = `${params.source}:${params.id}:${params.field}`;

    if (!this.subscribers.has(subscriptionKey)) {
      this.subscribers.set(subscriptionKey, new Set());
    }
    this.subscribers.get(subscriptionKey)!.add(onData);

    // Ensure WebSocket connection
    this.ensureWebSocketConnection();

    // Send subscription message
    this.sendWebSocketMessage({
      type: 'subscribe',
      payload: params,
    });

    // Return unsubscribe function
    return () => {
      this.subscribers.get(subscriptionKey)?.delete(onData);
      if (this.subscribers.get(subscriptionKey)?.size === 0) {
        this.sendWebSocketMessage({
          type: 'unsubscribe',
          payload: params,
        });
        this.subscribers.delete(subscriptionKey);
      }
    };
  }

  /**
   * Calculate sensitivity analysis
   */
  async calculateSensitivity(
    request: SensitivityRequest
  ): Promise<{ matrix: (string | number)[][] }> {
    const response = await this.makeRequest('/excel/sensitivity', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response;
  }

  /**
   * Get audit information for a cell
   */
  async getAuditInfo(request: AuditRequest): Promise<{ value: string }> {
    const response = await this.makeRequest('/excel/audit', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response;
  }

  /**
   * Get comments for a cell
   */
  async getComments(request: CommentRequest): Promise<{ latestComment: string | null }> {
    const response = await this.makeRequest('/excel/comments', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return response;
  }

  /**
   * Sync a cell change to the platform
   */
  async syncCellChange(
    operation: Omit<SyncOperation, 'timestamp' | 'clientId'>
  ): Promise<void> {
    const fullOperation: SyncOperation = {
      ...operation,
      timestamp: new Date().toISOString(),
      clientId: this.clientId,
    };

    if (!this.isOnline) {
      // Store for later sync
      this.pendingOperations.set(operation.address, fullOperation);
      await offlineStore.addPendingOperation(fullOperation);
      this.notifySyncStatus();
      return;
    }

    try {
      await this.makeRequest('/excel/sync', {
        method: 'POST',
        body: JSON.stringify(fullOperation),
      });

      this.lastSyncTime = new Date().toISOString();
      this.notifySyncStatus();
    } catch (error) {
      // Store for retry
      this.pendingOperations.set(operation.address, fullOperation);
      await offlineStore.addPendingOperation(fullOperation);
      this.notifySyncStatus();
      throw error;
    }
  }

  /**
   * Handle incoming sync from server
   */
  handleIncomingSync(operation: SyncOperation): ConflictResolution {
    // Check for conflicts with pending local changes
    const localOperation = this.pendingOperations.get(operation.address);

    if (!localOperation) {
      // No conflict, accept server change
      return { operation, resolution: 'accept' };
    }

    // Conflict detected - use Last-Write-Wins with vector clock
    const serverTime = new Date(operation.timestamp).getTime();
    const localTime = new Date(localOperation.timestamp).getTime();

    if (serverTime > localTime) {
      // Server wins
      this.pendingOperations.delete(operation.address);
      return { operation, resolution: 'accept' };
    } else {
      // Local wins - server will be updated on next sync
      return { operation, resolution: 'reject' };
    }
  }

  /**
   * Sync all pending operations
   */
  async syncPendingOperations(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline || this.pendingOperations.size === 0) {
      return { success: 0, failed: 0 };
    }

    const operations = await offlineStore.getPendingOperations();
    let success = 0;
    let failed = 0;

    for (const operation of operations) {
      try {
        await this.makeRequest('/excel/sync', {
          method: 'POST',
          body: JSON.stringify(operation),
        });

        // Remove from local storage
        if (operation.id) {
          await offlineStore.removePendingOperation(operation.id);
        }
        this.pendingOperations.delete(operation.address);
        success++;
      } catch (error) {
        // Update retry count
        if (operation.id) {
          await offlineStore.updatePendingOperation({
            ...operation,
            retryCount: (operation.retryCount || 0) + 1,
          });
        }
        failed++;
      }
    }

    if (success > 0) {
      this.lastSyncTime = new Date().toISOString();
    }

    this.notifySyncStatus();
    return { success, failed };
  }

  /**
   * Force sync all pending operations
   */
  async forceSyncAll(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }
    return this.syncPendingOperations();
  }

  /**
   * Get all linked cells
   */
  async getLinkedCells(): Promise<LinkedCell[]> {
    return offlineStore.getAllLinkedCells();
  }

  /**
   * Remove a linked cell
   */
  async unlinkCell(localAddress: string): Promise<void> {
    await offlineStore.removeLinkedCell(localAddress);

    // Notify server
    if (this.isOnline) {
      await this.makeRequest('/excel/unlink', {
        method: 'POST',
        body: JSON.stringify({ localAddress, clientId: this.clientId }),
      });
    }
  }

  /**
   * Refresh all linked cells
   */
  async refreshLinkedCells(): Promise<void> {
    const linkedCells = await offlineStore.getAllLinkedCells();

    for (const cell of linkedCells) {
      try {
        const response = await this.fetchValue({
          modelPath: cell.modelPath,
          reference: cell.remoteReference,
          version: 'latest',
        });

        await offlineStore.upsertLinkedCell({
          ...cell,
          lastValue: response.value,
          lastSyncedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`Failed to refresh linked cell ${cell.localAddress}:`, error);
      }
    }

    this.notifySyncStatus();
  }

  /**
   * WebSocket connection management
   */
  private ensureWebSocketConnection(): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) return;
    if (!this.isOnline) return;

    const wsUrl = this.apiBaseUrl.replace('http', 'ws') + '/excel/ws';

    try {
      this.wsConnection = new WebSocket(wsUrl);

      this.wsConnection.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;

        // Send authentication
        if (this.authToken) {
          this.sendWebSocketMessage({
            type: 'authenticate',
            payload: { token: this.authToken, clientId: this.clientId },
          });
        }

        // Re-subscribe to all active subscriptions
        this.subscribers.forEach((_, key) => {
          const [source, id, field] = key.split(':');
          this.sendWebSocketMessage({
            type: 'subscribe',
            payload: { source, id, field },
          });
        });
      };

      this.wsConnection.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.wsConnection.onclose = () => {
        console.log('WebSocket disconnected');
        this.wsConnection = null;

        // Attempt reconnection with exponential backoff
        if (this.isOnline && this.reconnectAttempts < this.maxReconnectAttempts) {
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
          this.reconnectAttempts++;
          setTimeout(() => this.ensureWebSocketConnection(), delay);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }

  private sendWebSocketMessage(message: object): void {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message));
    }
  }

  private handleWebSocketMessage(message: { type: string; payload: any }): void {
    switch (message.type) {
      case 'data_update':
        const dataKey = `${message.payload.source}:${message.payload.id}:${message.payload.field}`;
        this.subscribers.get(dataKey)?.forEach((callback) => callback(message.payload));
        break;

      case 'cell_sync':
        const resolution = this.handleIncomingSync(message.payload);
        if (resolution.resolution === 'accept') {
          // Notify any listeners about the cell update
          this.notifyCellUpdate(message.payload);
        }
        break;

      case 'model_update':
        // Model was updated on server, refresh cached values
        this.refreshModelCache(message.payload.modelPath);
        break;

      case 'error':
        console.error('Server error:', message.payload);
        break;
    }
  }

  private notifyCellUpdate(operation: SyncOperation): void {
    // Emit event for Excel to update the cell
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('fp-cell-update', { detail: operation }));
    }
  }

  private async refreshModelCache(modelPath: string): Promise<void> {
    // Clear cache for this model and refresh linked cells
    const linkedCells = await offlineStore.getLinkedCellsByModel(modelPath);

    for (const cell of linkedCells) {
      try {
        const response = await this.fetchValue({
          modelPath: cell.modelPath,
          reference: cell.remoteReference,
          version: 'latest',
        });

        await offlineStore.upsertLinkedCell({
          ...cell,
          lastValue: response.value,
          lastSyncedAt: new Date().toISOString(),
        });

        // Notify Excel about the update
        this.notifyCellUpdate({
          type: 'update',
          address: cell.localAddress,
          value: response.value,
          timestamp: new Date().toISOString(),
          clientId: 'server',
        });
      } catch (error) {
        console.error(`Failed to refresh cell ${cell.localAddress}:`, error);
      }
    }
  }

  /**
   * HTTP request helper
   */
  private async makeRequest(endpoint: string, options: RequestInit): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API error: ${response.status} - ${errorBody}`);
    }

    return response.json();
  }

  /**
   * Clear all offline data
   */
  async clearOfflineData(): Promise<void> {
    await offlineStore.clearAll();
    this.pendingOperations.clear();
    this.notifySyncStatus();
  }

  /**
   * Destroy the sync engine
   */
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.wsConnection) {
      this.wsConnection.close();
    }
    this.subscribers.clear();
    this.syncStatusCallbacks.clear();
    this.connectionStatusCallbacks.clear();
  }
}

// Export singleton instance
export const syncEngine = new SyncEngine();
