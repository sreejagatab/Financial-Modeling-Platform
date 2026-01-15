/**
 * Excel Add-in API Service
 * Handles Excel integration, cell linking, and sync operations
 */

import { apiClient, WS_BASE_URL } from './client';
import type {
  ExcelGetValueRequest,
  ExcelGetValueResponse,
  ExcelCreateLinkRequest,
  ExcelSyncRequest,
  ExcelSyncResponse,
  DataType,
} from './types';

export interface LinkedCell {
  id: string;
  model_path: string;
  cell_address: string;
  excel_cell: string;
  client_id: string;
  last_synced: string;
  value: string | number | null;
  data_type: DataType;
}

export interface SyncBatchRequest {
  operations: ExcelSyncRequest[];
}

export interface SyncBatchResponse {
  success: boolean;
  results: Array<{
    cell_address: string;
    synced: boolean;
    error?: string;
  }>;
  conflicts: Array<{
    cell_address: string;
    server_value: string | number;
    client_value: string | number;
  }>;
}

export interface AuditInfo {
  cell_address: string;
  last_modified: string;
  modified_by: string;
  version: number;
  history: Array<{
    version: number;
    value: string | number;
    modified_by: string;
    modified_at: string;
  }>;
}

export const excelApi = {
  // ===== Value Operations =====

  /**
   * Get value from platform
   */
  async getValue(data: ExcelGetValueRequest): Promise<ExcelGetValueResponse> {
    const response = await apiClient.post<ExcelGetValueResponse>('/excel/get-value', data);
    return response.data;
  },

  /**
   * Get multiple values in batch
   */
  async getValues(
    requests: ExcelGetValueRequest[]
  ): Promise<{ results: ExcelGetValueResponse[] }> {
    const response = await apiClient.post('/excel/get-values', { requests });
    return response.data;
  },

  // ===== Linking =====

  /**
   * Create a bidirectional link
   */
  async createLink(data: ExcelCreateLinkRequest): Promise<LinkedCell> {
    const response = await apiClient.post<LinkedCell>('/excel/create-link', data);
    return response.data;
  },

  /**
   * Remove a link
   */
  async unlink(data: { model_path: string; cell_address: string; client_id: string }): Promise<void> {
    await apiClient.post('/excel/unlink', data);
  },

  /**
   * Get all linked cells for a client
   */
  async getLinkedCells(clientId: string): Promise<LinkedCell[]> {
    const response = await apiClient.get<{ cells: LinkedCell[] }>(`/excel/links/${clientId}`);
    return response.data.cells;
  },

  // ===== Sync =====

  /**
   * Sync a single cell change
   */
  async sync(data: ExcelSyncRequest): Promise<ExcelSyncResponse> {
    const response = await apiClient.post<ExcelSyncResponse>('/excel/sync', data);
    return response.data;
  },

  /**
   * Sync multiple cell changes in batch
   */
  async syncBatch(data: SyncBatchRequest): Promise<SyncBatchResponse> {
    const response = await apiClient.post<SyncBatchResponse>('/excel/sync-batch', data);
    return response.data;
  },

  // ===== Scenario Values =====

  /**
   * Get scenario-specific value
   */
  async getScenarioValue(data: {
    model_path: string;
    cell_address: string;
    scenario_name: string;
  }): Promise<ExcelGetValueResponse> {
    const response = await apiClient.post<ExcelGetValueResponse>('/excel/scenario-value', data);
    return response.data;
  },

  // ===== Sensitivity =====

  /**
   * Calculate sensitivity table
   */
  async calculateSensitivity(data: {
    model_path: string;
    input_cell: string;
    output_cell: string;
    steps: number;
    range?: { min: number; max: number };
  }): Promise<{
    input_values: number[];
    output_values: number[];
    base_input: number;
    base_output: number;
  }> {
    const response = await apiClient.post('/excel/sensitivity', data);
    return response.data;
  },

  // ===== Audit =====

  /**
   * Get audit information for a cell
   */
  async getAuditInfo(data: { model_path: string; cell_address: string }): Promise<AuditInfo> {
    const response = await apiClient.post<AuditInfo>('/excel/audit', data);
    return response.data;
  },

  // ===== Comments =====

  /**
   * Get comments for a cell
   */
  async getCellComments(data: {
    model_path: string;
    cell_address: string;
  }): Promise<{
    comments: Array<{
      id: string;
      user_name: string;
      content: string;
      created_at: string;
      is_resolved: boolean;
    }>;
  }> {
    const response = await apiClient.post('/excel/comments', data);
    return response.data;
  },

  // ===== WebSocket =====

  /**
   * Create WebSocket connection for real-time sync
   */
  createSyncWebSocket(clientId: string, token: string): WebSocket {
    const wsUrl = `${WS_BASE_URL}/ws/excel?client_id=${clientId}&token=${token}`;
    return new WebSocket(wsUrl);
  },

  /**
   * Get WebSocket URL for Excel sync
   */
  getWebSocketUrl(clientId: string, token: string): string {
    return `${WS_BASE_URL}/ws/excel?client_id=${clientId}&token=${token}`;
  },
};
