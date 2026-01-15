/**
 * Financial Models API Service
 * Handles CRUD operations for financial models, sheets, cells, and scenarios
 */

import { apiClient } from './client';
import type {
  FinancialModel,
  Sheet,
  Cell,
  CellValue,
  Scenario,
  ModelVersion,
  ModelType,
  CreateModelRequest,
  UpdateModelRequest,
  UpdateCellsRequest,
  CreateScenarioRequest,
  LBORequest,
  LBOResponse,
} from './types';

export interface ListModelsParams {
  model_type?: ModelType;
  include_archived?: boolean;
  limit?: number;
  offset?: number;
}

export interface ModelWithSheets extends FinancialModel {
  sheets: Sheet[];
}

export interface SheetWithCells extends Sheet {
  cells: Array<Cell & { value?: CellValue }>;
}

export const modelsApi = {
  // ===== Model CRUD =====

  /**
   * List all models for current user
   */
  async listModels(params?: ListModelsParams): Promise<FinancialModel[]> {
    const response = await apiClient.get<FinancialModel[]>('/models', { params });
    return response.data;
  },

  /**
   * Get a model by ID
   */
  async getModel(modelId: string, includeSheets = false): Promise<ModelWithSheets> {
    const response = await apiClient.get<ModelWithSheets>(`/models/${modelId}`, {
      params: { include_sheets: includeSheets },
    });
    return response.data;
  },

  /**
   * Create a new model
   */
  async createModel(data: CreateModelRequest): Promise<FinancialModel> {
    const response = await apiClient.post<FinancialModel>('/models', data);
    return response.data;
  },

  /**
   * Update a model
   */
  async updateModel(modelId: string, data: UpdateModelRequest): Promise<FinancialModel> {
    const response = await apiClient.put<FinancialModel>(`/models/${modelId}`, data);
    return response.data;
  },

  /**
   * Delete (archive) a model
   */
  async deleteModel(modelId: string): Promise<void> {
    await apiClient.delete(`/models/${modelId}`);
  },

  /**
   * Permanently delete a model
   */
  async hardDeleteModel(modelId: string): Promise<void> {
    await apiClient.delete(`/models/${modelId}`, { params: { hard: true } });
  },

  // ===== Sheet Operations =====

  /**
   * Get sheets for a model
   */
  async getSheets(modelId: string): Promise<Sheet[]> {
    const response = await apiClient.get<Sheet[]>(`/models/${modelId}/sheets`);
    return response.data;
  },

  /**
   * Create a new sheet
   */
  async createSheet(
    modelId: string,
    data: { name: string; purpose: string; index?: number }
  ): Promise<Sheet> {
    const response = await apiClient.post<Sheet>(`/models/${modelId}/sheets`, data);
    return response.data;
  },

  /**
   * Update a sheet
   */
  async updateSheet(
    modelId: string,
    sheetId: string,
    data: Partial<Pick<Sheet, 'name' | 'index' | 'is_hidden' | 'is_protected'>>
  ): Promise<Sheet> {
    const response = await apiClient.put<Sheet>(`/models/${modelId}/sheets/${sheetId}`, data);
    return response.data;
  },

  /**
   * Delete a sheet
   */
  async deleteSheet(modelId: string, sheetId: string): Promise<void> {
    await apiClient.delete(`/models/${modelId}/sheets/${sheetId}`);
  },

  // ===== Cell Operations =====

  /**
   * Get cells with values for a sheet
   */
  async getCells(modelId: string, sheetId: string): Promise<Array<Cell & { value?: CellValue }>> {
    const response = await apiClient.get<Array<Cell & { value?: CellValue }>>(
      `/models/${modelId}/sheets/${sheetId}/cells`
    );
    return response.data;
  },

  /**
   * Batch update cells
   */
  async updateCells(modelId: string, data: UpdateCellsRequest): Promise<CellValue[]> {
    const response = await apiClient.put<CellValue[]>(`/models/${modelId}/cells`, data);
    return response.data;
  },

  /**
   * Get cell history
   */
  async getCellHistory(
    modelId: string,
    sheetId: string,
    cellAddress: string,
    limit = 50
  ): Promise<CellValue[]> {
    const response = await apiClient.get<CellValue[]>(
      `/models/${modelId}/sheets/${sheetId}/cells/${cellAddress}/history`,
      { params: { limit } }
    );
    return response.data;
  },

  // ===== Calculation =====

  /**
   * Trigger model recalculation
   */
  async calculate(modelId: string, scenarioId?: string): Promise<{ cells: CellValue[]; timestamp: string }> {
    const response = await apiClient.post<{ cells: CellValue[]; timestamp: string }>(
      `/models/${modelId}/calculate`,
      { scenario_id: scenarioId }
    );
    return response.data;
  },

  // ===== Scenarios =====

  /**
   * Get scenarios for a model
   */
  async getScenarios(modelId: string): Promise<Scenario[]> {
    const response = await apiClient.get<Scenario[]>(`/models/${modelId}/scenarios`);
    return response.data;
  },

  /**
   * Create a scenario
   */
  async createScenario(modelId: string, data: CreateScenarioRequest): Promise<Scenario> {
    const response = await apiClient.post<Scenario>(`/models/${modelId}/scenarios`, data);
    return response.data;
  },

  /**
   * Update a scenario
   */
  async updateScenario(
    modelId: string,
    scenarioId: string,
    data: Partial<CreateScenarioRequest>
  ): Promise<Scenario> {
    const response = await apiClient.put<Scenario>(
      `/models/${modelId}/scenarios/${scenarioId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a scenario
   */
  async deleteScenario(modelId: string, scenarioId: string): Promise<void> {
    await apiClient.delete(`/models/${modelId}/scenarios/${scenarioId}`);
  },

  /**
   * Compare scenarios
   */
  async compareScenarios(
    modelId: string,
    scenarioIds: string[]
  ): Promise<{ scenarios: Scenario[]; differences: Record<string, unknown> }> {
    const response = await apiClient.post<{ scenarios: Scenario[]; differences: Record<string, unknown> }>(
      `/models/${modelId}/scenarios/compare`,
      { scenario_ids: scenarioIds }
    );
    return response.data;
  },

  // ===== Versions =====

  /**
   * Get version history for a model
   */
  async getVersions(modelId: string): Promise<ModelVersion[]> {
    const response = await apiClient.get<ModelVersion[]>(`/models/${modelId}/versions`);
    return response.data;
  },

  /**
   * Create a new version (commit)
   */
  async createVersion(modelId: string, message: string): Promise<ModelVersion> {
    const response = await apiClient.post<ModelVersion>(`/models/${modelId}/versions`, { message });
    return response.data;
  },

  /**
   * Restore to a specific version
   */
  async restoreVersion(modelId: string, versionId: string): Promise<FinancialModel> {
    const response = await apiClient.post<FinancialModel>(
      `/models/${modelId}/versions/${versionId}/restore`
    );
    return response.data;
  },

  // ===== LBO Analysis =====

  /**
   * Run LBO analysis
   */
  async analyzeLBO(data: LBORequest): Promise<LBOResponse> {
    const response = await apiClient.post<LBOResponse>('/models/lbo/analyze', data);
    return response.data;
  },

  /**
   * Run LBO sensitivity analysis
   */
  async lboSensitivity(
    data: LBORequest,
    sensitivityParams: {
      variable: string;
      range: { min: number; max: number; steps: number };
    }
  ): Promise<{ base_case: LBOResponse; sensitivity: Array<{ value: number; irr: number; moic: number }> }> {
    const response = await apiClient.post('/models/lbo/sensitivity', {
      ...data,
      sensitivity: sensitivityParams,
    });
    return response.data;
  },
};
