import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

// Types
export interface Model {
  id: string;
  name: string;
  modelType: string;
  description?: string;
  version: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sheet {
  id: string;
  modelId: string;
  name: string;
  purpose: 'input' | 'calculation' | 'output' | 'dashboard';
  index: number;
}

export interface Cell {
  id: string;
  sheetId: string;
  address: string;
  row: number;
  column: number;
  cellType: 'input' | 'formula' | 'output' | 'label';
  dataType: 'number' | 'text' | 'date' | 'boolean' | 'percentage' | 'currency';
  value: string | number | null;
  formula?: string;
  format?: Record<string, unknown>;
}

export interface Scenario {
  id: string;
  modelId: string;
  name: string;
  scenarioType: 'base' | 'bull' | 'bear' | 'management' | 'custom';
  isActive: boolean;
}

// Entity adapters
const modelsAdapter = createEntityAdapter<Model>();
const sheetsAdapter = createEntityAdapter<Sheet>();
const cellsAdapter = createEntityAdapter<Cell>();
const scenariosAdapter = createEntityAdapter<Scenario>();

// Initial state
interface ModelsState {
  models: ReturnType<typeof modelsAdapter.getInitialState>;
  sheets: ReturnType<typeof sheetsAdapter.getInitialState>;
  cells: ReturnType<typeof cellsAdapter.getInitialState>;
  scenarios: ReturnType<typeof scenariosAdapter.getInitialState>;
  activeModelId: string | null;
  activeSheetId: string | null;
  activeScenarioId: string | null;
  calculationStatus: 'idle' | 'calculating' | 'error';
  lastCalculatedAt: string | null;
  selectedCells: string[];
}

const initialState: ModelsState = {
  models: modelsAdapter.getInitialState(),
  sheets: sheetsAdapter.getInitialState(),
  cells: cellsAdapter.getInitialState(),
  scenarios: scenariosAdapter.getInitialState(),
  activeModelId: null,
  activeSheetId: null,
  activeScenarioId: null,
  calculationStatus: 'idle',
  lastCalculatedAt: null,
  selectedCells: [],
};

// Slice
const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    // Model operations
    setActiveModel: (state, action: PayloadAction<string | null>) => {
      state.activeModelId = action.payload;
    },
    addModel: (state, action: PayloadAction<Model>) => {
      modelsAdapter.addOne(state.models, action.payload);
    },
    updateModel: (state, action: PayloadAction<{ id: string; changes: Partial<Model> }>) => {
      modelsAdapter.updateOne(state.models, action.payload);
    },
    removeModel: (state, action: PayloadAction<string>) => {
      modelsAdapter.removeOne(state.models, action.payload);
    },

    // Sheet operations
    setActiveSheet: (state, action: PayloadAction<string | null>) => {
      state.activeSheetId = action.payload;
    },
    addSheet: (state, action: PayloadAction<Sheet>) => {
      sheetsAdapter.addOne(state.sheets, action.payload);
    },
    removeSheet: (state, action: PayloadAction<string>) => {
      sheetsAdapter.removeOne(state.sheets, action.payload);
    },

    // Cell operations
    updateCell: (
      state,
      action: PayloadAction<{ id: string; value: string | number | null; formula?: string }>
    ) => {
      const { id, value, formula } = action.payload;
      cellsAdapter.updateOne(state.cells, {
        id,
        changes: { value, formula },
      });
      state.calculationStatus = 'calculating';
    },
    updateCellsBatch: (state, action: PayloadAction<Cell[]>) => {
      cellsAdapter.upsertMany(state.cells, action.payload);
    },
    setSelectedCells: (state, action: PayloadAction<string[]>) => {
      state.selectedCells = action.payload;
    },

    // Scenario operations
    setActiveScenario: (state, action: PayloadAction<string | null>) => {
      state.activeScenarioId = action.payload;
      state.calculationStatus = 'calculating';
    },
    addScenario: (state, action: PayloadAction<Scenario>) => {
      scenariosAdapter.addOne(state.scenarios, action.payload);
    },

    // Calculation status
    calculationComplete: (
      state,
      action: PayloadAction<{ cells: Cell[]; timestamp: string }>
    ) => {
      cellsAdapter.upsertMany(state.cells, action.payload.cells);
      state.calculationStatus = 'idle';
      state.lastCalculatedAt = action.payload.timestamp;
    },
    calculationError: (state) => {
      state.calculationStatus = 'error';
    },

    // Load model data
    loadModelData: (
      state,
      action: PayloadAction<{
        model: Model;
        sheets: Sheet[];
        cells: Cell[];
        scenarios: Scenario[];
      }>
    ) => {
      const { model, sheets, cells, scenarios } = action.payload;
      modelsAdapter.upsertOne(state.models, model);
      sheetsAdapter.upsertMany(state.sheets, sheets);
      cellsAdapter.upsertMany(state.cells, cells);
      scenariosAdapter.upsertMany(state.scenarios, scenarios);
      state.activeModelId = model.id;
      if (sheets.length > 0) {
        state.activeSheetId = sheets[0].id;
      }
    },
  },
});

// Export actions
export const {
  setActiveModel,
  addModel,
  updateModel,
  removeModel,
  setActiveSheet,
  addSheet,
  removeSheet,
  updateCell,
  updateCellsBatch,
  setSelectedCells,
  setActiveScenario,
  addScenario,
  calculationComplete,
  calculationError,
  loadModelData,
} = modelsSlice.actions;

// Export reducer
export const modelsReducer = modelsSlice.reducer;

// Selectors
export const {
  selectAll: selectAllModels,
  selectById: selectModelById,
} = modelsAdapter.getSelectors((state: RootState) => state.models.models);

export const {
  selectAll: selectAllSheets,
  selectById: selectSheetById,
} = sheetsAdapter.getSelectors((state: RootState) => state.models.sheets);

export const {
  selectAll: selectAllCells,
  selectById: selectCellById,
} = cellsAdapter.getSelectors((state: RootState) => state.models.cells);

export const {
  selectAll: selectAllScenarios,
  selectById: selectScenarioById,
} = scenariosAdapter.getSelectors((state: RootState) => state.models.scenarios);

// Custom selectors
export const selectActiveModel = (state: RootState) =>
  state.models.activeModelId
    ? selectModelById(state, state.models.activeModelId)
    : null;

export const selectActiveSheet = (state: RootState) =>
  state.models.activeSheetId
    ? selectSheetById(state, state.models.activeSheetId)
    : null;

export const selectSheetsByModelId = (modelId: string) => (state: RootState) =>
  selectAllSheets(state).filter((sheet) => sheet.modelId === modelId);

export const selectCellsBySheetId = (sheetId: string) => (state: RootState) =>
  selectAllCells(state).filter((cell) => cell.sheetId === sheetId);

export const selectCalculationStatus = (state: RootState) =>
  state.models.calculationStatus;
