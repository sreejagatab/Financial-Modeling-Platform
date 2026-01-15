/**
 * API Service Index
 * Central export for all API services and types
 */

// Export API client
export { apiClient, API_BASE_URL, API_VERSION, WS_BASE_URL } from './client';
export type { ApiResponse, PaginatedResponse } from './client';

// Export all types
export * from './types';

// Export API services
export { authApi } from './auth.api';
export { modelsApi } from './models.api';
export type { ListModelsParams, ModelWithSheets, SheetWithCells } from './models.api';

export { collaborationApi } from './collaboration.api';
export type { UserPresence } from './collaboration.api';

export { valuationsApi } from './valuations.api';
export type { PrecedentTxnRequest, PrecedentTxnResponse, MergerRequest, MergerResponse } from './valuations.api';

export { dueDiligenceApi } from './dueDiligence.api';
export type { DDAnalysisRequest, DDAnalysisResponse, DDSummaryRequest, DDSummaryResponse } from './dueDiligence.api';

export { exportApi } from './export.api';
export type { ReportTemplate, CustomReportSection } from './export.api';

export { industryApi } from './industry.api';
export type {
  SaleLeasebackSensitivityRequest,
  REITSensitivityRequest,
  NAVSensitivityRequest,
} from './industry.api';

export { excelApi } from './excel.api';
export type { LinkedCell, SyncBatchRequest, SyncBatchResponse, AuditInfo } from './excel.api';

// Convenience object with all APIs
export const api = {
  auth: () => import('./auth.api').then(m => m.authApi),
  models: () => import('./models.api').then(m => m.modelsApi),
  collaboration: () => import('./collaboration.api').then(m => m.collaborationApi),
  valuations: () => import('./valuations.api').then(m => m.valuationsApi),
  dueDiligence: () => import('./dueDiligence.api').then(m => m.dueDiligenceApi),
  export: () => import('./export.api').then(m => m.exportApi),
  industry: () => import('./industry.api').then(m => m.industryApi),
  excel: () => import('./excel.api').then(m => m.excelApi),
};
