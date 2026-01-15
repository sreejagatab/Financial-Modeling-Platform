/**
 * Due Diligence API Service
 */

import axios from 'axios';
import type {
  DDAnalysisRequest,
  DDAnalysisResponse,
  DDChecklist,
  QoERequest,
  QoESummary,
  RiskMatrixRequest,
  RiskSummary,
  RiskDetail,
  DDFinding,
  FindingsSummary,
  DDRecommendations,
  VerticalOption,
  CategoryOption,
  SeverityOption,
} from '../types';

// @ts-ignore - Vite environment variable
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:8001';
const DD_API = `${API_BASE_URL}/api/v1/due-diligence`;

// API Client
const apiClient = axios.create({
  baseURL: DD_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Run comprehensive DD analysis
 */
export async function analyzeDueDiligence(
  request: DDAnalysisRequest
): Promise<DDAnalysisResponse> {
  const response = await apiClient.post<DDAnalysisResponse>('/analyze', request);
  return response.data;
}

/**
 * Get vertical-specific checklist
 */
export async function getChecklist(vertical: string): Promise<{
  success: boolean;
  checklist: DDChecklist;
}> {
  const response = await apiClient.post(`/checklist/${vertical}`);
  return response.data;
}

/**
 * Calculate Quality of Earnings
 */
export async function calculateQoE(request: QoERequest): Promise<{
  success: boolean;
  qoe_analysis: QoESummary;
}> {
  const response = await apiClient.post('/qoe', request);
  return response.data;
}

/**
 * Calculate risk matrix
 */
export async function calculateRiskMatrix(request: RiskMatrixRequest): Promise<{
  success: boolean;
  risk_summary: RiskSummary;
  risk_detail: RiskDetail[];
}> {
  const response = await apiClient.post('/risk-matrix', request);
  return response.data;
}

/**
 * Summarize findings
 */
export async function summarizeFindings(findings: DDFinding[]): Promise<{
  success: boolean;
  findings_summary: FindingsSummary;
}> {
  const response = await apiClient.post('/findings/summarize', findings);
  return response.data;
}

/**
 * Get recommendations
 */
export async function getRecommendations(request: DDAnalysisRequest): Promise<{
  success: boolean;
  recommendations: DDRecommendations;
  findings_summary: FindingsSummary;
  risk_summary: RiskSummary;
}> {
  const response = await apiClient.post('/recommendations', request);
  return response.data;
}

/**
 * Get available verticals
 */
export async function getVerticals(): Promise<{
  verticals: VerticalOption[];
}> {
  const response = await apiClient.get('/verticals');
  return response.data;
}

/**
 * Get finding categories
 */
export async function getCategories(): Promise<{
  categories: CategoryOption[];
}> {
  const response = await apiClient.get('/categories');
  return response.data;
}

/**
 * Get severity levels
 */
export async function getSeverities(): Promise<{
  severities: SeverityOption[];
}> {
  const response = await apiClient.get('/severities');
  return response.data;
}

// Export all functions
export const dueDiligenceService = {
  analyzeDueDiligence,
  getChecklist,
  calculateQoE,
  calculateRiskMatrix,
  summarizeFindings,
  getRecommendations,
  getVerticals,
  getCategories,
  getSeverities,
};

export default dueDiligenceService;
