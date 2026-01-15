/**
 * Models Async Thunks
 * Redux thunks for financial model operations
 */

import { createAsyncThunk } from '@reduxjs/toolkit';
import { modelsApi } from '../../../services/api';
import type {
  FinancialModel,
  Sheet,
  Cell,
  CellValue,
  Scenario,
  CreateModelRequest,
  UpdateModelRequest,
  CreateScenarioRequest,
  ModelType,
} from '../../../services/api';
import {
  addModel,
  updateModel as updateModelAction,
  removeModel,
  loadModelData,
  addSheet,
  addScenario,
  calculationComplete,
  calculationError,
} from '../slices/models.slice';

// ===== Model Operations =====

/**
 * Fetch all models for current user
 */
export const fetchModels = createAsyncThunk<
  FinancialModel[],
  { model_type?: ModelType; include_archived?: boolean } | void,
  { rejectValue: string }
>('models/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const models = await modelsApi.listModels(params || {});
    return models;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch models';
    return rejectWithValue(message);
  }
});

/**
 * Fetch a single model with all data
 */
export const fetchModel = createAsyncThunk<
  { model: FinancialModel; sheets: Sheet[]; cells: (Cell & { value?: CellValue })[]; scenarios: Scenario[] },
  string,
  { rejectValue: string }
>('models/fetchOne', async (modelId, { dispatch, rejectWithValue }) => {
  try {
    // Fetch model with sheets
    const modelData = await modelsApi.getModel(modelId, true);

    // Fetch cells for each sheet
    const allCells: (Cell & { value?: CellValue })[] = [];
    for (const sheet of modelData.sheets || []) {
      const cells = await modelsApi.getCells(modelId, sheet.id);
      allCells.push(...cells);
    }

    // Fetch scenarios
    const scenarios = await modelsApi.getScenarios(modelId);

    const result = {
      model: modelData,
      sheets: modelData.sheets || [],
      cells: allCells,
      scenarios,
    };

    // Transform and load into store
    dispatch(
      loadModelData({
        model: {
          id: modelData.id,
          name: modelData.name,
          modelType: modelData.model_type,
          description: modelData.description,
          version: modelData.version,
          ownerId: modelData.owner_id,
          createdAt: modelData.created_at,
          updatedAt: modelData.updated_at,
        },
        sheets: (modelData.sheets || []).map((s) => ({
          id: s.id,
          modelId: s.model_id,
          name: s.name,
          purpose: s.purpose,
          index: s.index,
        })),
        cells: allCells.map((c) => ({
          id: c.id,
          sheetId: c.sheet_id,
          address: c.address,
          row: c.row,
          column: c.column,
          cellType: c.cell_type,
          dataType: c.data_type,
          value: c.value?.calculated_value ?? c.value?.raw_value ?? null,
          formula: c.value?.formula,
        })),
        scenarios: scenarios.map((s) => ({
          id: s.id,
          modelId: s.model_id,
          name: s.name,
          scenarioType: s.scenario_type as 'base' | 'bull' | 'bear' | 'management' | 'custom',
          isActive: s.is_active,
        })),
      })
    );

    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch model';
    return rejectWithValue(message);
  }
});

/**
 * Create a new model
 */
export const createModel = createAsyncThunk<
  FinancialModel,
  CreateModelRequest,
  { rejectValue: string }
>('models/create', async (data, { dispatch, rejectWithValue }) => {
  try {
    const model = await modelsApi.createModel(data);

    dispatch(
      addModel({
        id: model.id,
        name: model.name,
        modelType: model.model_type,
        description: model.description,
        version: model.version,
        ownerId: model.owner_id,
        createdAt: model.created_at,
        updatedAt: model.updated_at,
      })
    );

    return model;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create model';
    return rejectWithValue(message);
  }
});

/**
 * Update a model
 */
export const updateModel = createAsyncThunk<
  FinancialModel,
  { modelId: string; data: UpdateModelRequest },
  { rejectValue: string }
>('models/update', async ({ modelId, data }, { dispatch, rejectWithValue }) => {
  try {
    const model = await modelsApi.updateModel(modelId, data);

    dispatch(
      updateModelAction({
        id: modelId,
        changes: {
          name: model.name,
          description: model.description,
          updatedAt: model.updated_at,
        },
      })
    );

    return model;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update model';
    return rejectWithValue(message);
  }
});

/**
 * Delete a model
 */
export const deleteModel = createAsyncThunk<string, string, { rejectValue: string }>(
  'models/delete',
  async (modelId, { dispatch, rejectWithValue }) => {
    try {
      await modelsApi.deleteModel(modelId);
      dispatch(removeModel(modelId));
      return modelId;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete model';
      return rejectWithValue(message);
    }
  }
);

// ===== Sheet Operations =====

/**
 * Create a new sheet
 */
export const createSheet = createAsyncThunk<
  Sheet,
  { modelId: string; name: string; purpose: string },
  { rejectValue: string }
>('models/createSheet', async ({ modelId, name, purpose }, { dispatch, rejectWithValue }) => {
  try {
    const sheet = await modelsApi.createSheet(modelId, { name, purpose });

    dispatch(
      addSheet({
        id: sheet.id,
        modelId: sheet.model_id,
        name: sheet.name,
        purpose: sheet.purpose,
        index: sheet.index,
      })
    );

    return sheet;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create sheet';
    return rejectWithValue(message);
  }
});

// ===== Cell Operations =====

/**
 * Update cells and trigger calculation
 */
export const updateCells = createAsyncThunk<
  CellValue[],
  { modelId: string; cells: Array<{ cell_id: string; raw_value?: string; formula?: string }> },
  { rejectValue: string }
>('models/updateCells', async ({ modelId, cells }, { dispatch, rejectWithValue }) => {
  try {
    const updatedValues = await modelsApi.updateCells(modelId, { cells });

    // Trigger calculation
    const calcResult = await modelsApi.calculate(modelId);

    dispatch(
      calculationComplete({
        cells: calcResult.cells.map((cv) => ({
          id: cv.cell_id,
          sheetId: '', // Would need to look this up
          address: '',
          row: 0,
          column: 0,
          cellType: 'formula' as const,
          dataType: 'number' as const,
          value: cv.calculated_value ?? cv.raw_value ?? null,
          formula: cv.formula,
        })),
        timestamp: calcResult.timestamp,
      })
    );

    return updatedValues;
  } catch (error: unknown) {
    dispatch(calculationError());
    const message = error instanceof Error ? error.message : 'Failed to update cells';
    return rejectWithValue(message);
  }
});

// ===== Scenario Operations =====

/**
 * Create a scenario
 */
export const createScenario = createAsyncThunk<
  Scenario,
  { modelId: string; data: CreateScenarioRequest },
  { rejectValue: string }
>('models/createScenario', async ({ modelId, data }, { dispatch, rejectWithValue }) => {
  try {
    const scenario = await modelsApi.createScenario(modelId, data);

    dispatch(
      addScenario({
        id: scenario.id,
        modelId: scenario.model_id,
        name: scenario.name,
        scenarioType: scenario.scenario_type as 'base' | 'bull' | 'bear' | 'management' | 'custom',
        isActive: scenario.is_active,
      })
    );

    return scenario;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create scenario';
    return rejectWithValue(message);
  }
});

// ===== Calculation =====

/**
 * Trigger model recalculation
 */
export const calculateModel = createAsyncThunk<
  { cells: CellValue[]; timestamp: string },
  { modelId: string; scenarioId?: string },
  { rejectValue: string }
>('models/calculate', async ({ modelId, scenarioId }, { dispatch, rejectWithValue }) => {
  try {
    const result = await modelsApi.calculate(modelId, scenarioId);

    dispatch(
      calculationComplete({
        cells: result.cells.map((cv) => ({
          id: cv.cell_id,
          sheetId: '',
          address: '',
          row: 0,
          column: 0,
          cellType: 'formula' as const,
          dataType: 'number' as const,
          value: cv.calculated_value ?? cv.raw_value ?? null,
          formula: cv.formula,
        })),
        timestamp: result.timestamp,
      })
    );

    return result;
  } catch (error: unknown) {
    dispatch(calculationError());
    const message = error instanceof Error ? error.message : 'Calculation failed';
    return rejectWithValue(message);
  }
});
