/**
 * Due Diligence API Service
 * Handles DD workflows, checklists, QoE analysis, and risk matrix
 */

import { apiClient } from './client';
import type {
  DDVertical,
  DDFinding,
  DDChecklistItem,
  QoERequest,
  QoEResponse,
  RiskMatrixRequest,
  RiskMatrixResponse,
} from './types';

export interface DDAnalysisRequest {
  vertical: DDVertical;
  company_name: string;
  findings: DDFinding[];
  financials?: {
    reported_ebitda: number;
    reported_revenue: number;
    reported_net_income: number;
  };
}

export interface DDAnalysisResponse {
  success: boolean;
  analysis: {
    overall_risk_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    key_risks: DDFinding[];
    qoe_summary?: {
      reported_ebitda: number;
      adjusted_ebitda: number;
      adjustment_percentage: number;
    };
    recommendation: 'proceed' | 'proceed_with_caution' | 'do_not_proceed';
    recommendation_rationale: string;
  };
}

export interface DDSummaryRequest {
  findings: DDFinding[];
  include_recommendations?: boolean;
}

export interface DDSummaryResponse {
  success: boolean;
  summary: {
    total_findings: number;
    by_severity: Record<string, number>;
    by_category: Record<string, number>;
    critical_items: DDFinding[];
    key_themes: string[];
    executive_summary: string;
  };
}

export const dueDiligenceApi = {
  // ===== Comprehensive Analysis =====

  /**
   * Run comprehensive DD analysis
   */
  async analyze(data: DDAnalysisRequest): Promise<DDAnalysisResponse> {
    const response = await apiClient.post<DDAnalysisResponse>('/due-diligence/analyze', data);
    return response.data;
  },

  // ===== Checklists =====

  /**
   * Get available DD verticals
   */
  async getVerticals(): Promise<{ verticals: DDVertical[]; descriptions: Record<DDVertical, string> }> {
    const response = await apiClient.get('/due-diligence/verticals');
    return response.data;
  },

  /**
   * Get checklist for a vertical
   */
  async getChecklist(vertical: DDVertical): Promise<DDChecklistItem[]> {
    const response = await apiClient.post<{ checklist: DDChecklistItem[] }>(
      `/due-diligence/checklist/${vertical}`
    );
    return response.data.checklist;
  },

  /**
   * Get all DD categories
   */
  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<{ categories: string[] }>('/due-diligence/categories');
    return response.data.categories;
  },

  /**
   * Get all severity levels
   */
  async getSeverities(): Promise<string[]> {
    const response = await apiClient.get<{ severities: string[] }>('/due-diligence/severities');
    return response.data.severities;
  },

  // ===== Quality of Earnings =====

  /**
   * Run QoE analysis
   */
  async calculateQoE(data: QoERequest): Promise<QoEResponse> {
    const response = await apiClient.post<QoEResponse>('/due-diligence/qoe', data);
    return response.data;
  },

  /**
   * Get standard QoE adjustment categories
   */
  async getQoECategories(): Promise<{
    categories: Array<{
      name: string;
      description: string;
      typical_adjustments: string[];
      is_addback: boolean;
    }>;
  }> {
    const response = await apiClient.get('/due-diligence/qoe/categories');
    return response.data;
  },

  // ===== Risk Matrix =====

  /**
   * Calculate risk matrix
   */
  async calculateRiskMatrix(data: RiskMatrixRequest): Promise<RiskMatrixResponse> {
    const response = await apiClient.post<RiskMatrixResponse>('/due-diligence/risk-matrix', data);
    return response.data;
  },

  // ===== Findings =====

  /**
   * Summarize findings
   */
  async summarizeFindings(data: DDSummaryRequest): Promise<DDSummaryResponse> {
    const response = await apiClient.post<DDSummaryResponse>(
      '/due-diligence/findings/summarize',
      data
    );
    return response.data;
  },

  /**
   * Get recommendations based on findings
   */
  async getRecommendations(
    findings: DDFinding[],
    dealContext?: {
      deal_size: number;
      industry: string;
      deal_type: string;
    }
  ): Promise<{
    success: boolean;
    recommendations: {
      overall: 'proceed' | 'proceed_with_caution' | 'do_not_proceed';
      rationale: string;
      conditions: string[];
      price_adjustments?: {
        reason: string;
        suggested_adjustment: number;
      }[];
      key_negotiation_points: string[];
      post_close_items: string[];
    };
  }> {
    const response = await apiClient.post('/due-diligence/recommendations', {
      findings,
      deal_context: dealContext,
    });
    return response.data;
  },

  // ===== Templates =====

  /**
   * Get DD report template
   */
  async getReportTemplate(vertical: DDVertical): Promise<{
    template_id: string;
    sections: Array<{
      name: string;
      description: string;
      required: boolean;
    }>;
  }> {
    const response = await apiClient.get(`/due-diligence/templates/${vertical}`);
    return response.data;
  },
};
