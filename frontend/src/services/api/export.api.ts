/**
 * Export API Service
 * Handles PDF, PowerPoint, and Excel export generation
 */

import { apiClient, API_BASE_URL, API_VERSION } from './client';
import type { ExportRequest, ExportResponse, ReportType, ExportFormat } from './types';

export interface ReportTemplate {
  id: string;
  name: string;
  report_type: ReportType;
  format: ExportFormat;
  description: string;
  preview_url?: string;
  created_at: string;
}

export interface CustomReportSection {
  id: string;
  type: 'chart' | 'table' | 'text' | 'metrics' | 'assumptions';
  title: string;
  data: Record<string, unknown>;
  options?: Record<string, unknown>;
}

export const exportApi = {
  // ===== PDF Exports =====

  /**
   * Generate LBO PDF report
   */
  async generateLBOPdf(data: {
    model_name: string;
    company_name: string;
    outputs: Record<string, unknown>;
    assumptions: Record<string, unknown>;
    charts?: boolean;
  }): Promise<Blob> {
    const response = await apiClient.post('/export/pdf/lbo', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generate 3-Statement PDF report
   */
  async generateThreeStatementPdf(data: {
    model_name: string;
    company_name: string;
    income_statement: Record<string, unknown>[];
    balance_sheet: Record<string, unknown>[];
    cash_flow: Record<string, unknown>[];
    assumptions?: Record<string, unknown>;
  }): Promise<Blob> {
    const response = await apiClient.post('/export/pdf/three-statement', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generate 13-Week Cash Flow PDF
   */
  async generate13WeekCFPdf(data: {
    model_name: string;
    company_name: string;
    weekly_data: Record<string, unknown>[];
    summary: Record<string, unknown>;
  }): Promise<Blob> {
    const response = await apiClient.post('/export/pdf/13-week-cash-flow', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generate custom PDF report
   */
  async generateCustomPdf(data: {
    title: string;
    subtitle?: string;
    sections: CustomReportSection[];
    options?: {
      include_toc?: boolean;
      include_page_numbers?: boolean;
      orientation?: 'portrait' | 'landscape';
    };
  }): Promise<Blob> {
    const response = await apiClient.post('/export/pdf/custom', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ===== PowerPoint Exports =====

  /**
   * Generate LBO presentation
   */
  async generateLBOPptx(data: {
    model_name: string;
    company_name: string;
    outputs: Record<string, unknown>;
    assumptions: Record<string, unknown>;
    include_sensitivity?: boolean;
    include_returns_chart?: boolean;
  }): Promise<Blob> {
    const response = await apiClient.post('/export/pptx/lbo', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generate valuation deck
   */
  async generateValuationPptx(data: {
    company_name: string;
    valuation_summary: {
      dcf?: { low: number; high: number; midpoint: number };
      comps?: { low: number; high: number; midpoint: number };
      precedents?: { low: number; high: number; midpoint: number };
    };
    football_field?: boolean;
    include_methodology?: boolean;
  }): Promise<Blob> {
    const response = await apiClient.post('/export/pptx/valuation', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generate scenario comparison presentation
   */
  async generateScenarioComparisonPptx(data: {
    model_name: string;
    scenarios: Array<{
      name: string;
      type: string;
      assumptions: Record<string, unknown>;
      outputs: Record<string, unknown>;
    }>;
    comparison_metrics: string[];
  }): Promise<Blob> {
    const response = await apiClient.post('/export/pptx/scenario-comparison', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Generate custom presentation
   */
  async generateCustomPptx(data: {
    title: string;
    subtitle?: string;
    slides: Array<{
      type: 'title' | 'content' | 'chart' | 'table' | 'two_column';
      title?: string;
      content?: Record<string, unknown>;
    }>;
  }): Promise<Blob> {
    const response = await apiClient.post('/export/pptx/custom', data, {
      responseType: 'blob',
    });
    return response.data;
  },

  // ===== Generic Export =====

  /**
   * Generic export function
   */
  async export(request: ExportRequest): Promise<ExportResponse> {
    const response = await apiClient.post<ExportResponse>('/export', request);
    return response.data;
  },

  // ===== Templates =====

  /**
   * Get available report templates
   */
  async getTemplates(): Promise<ReportTemplate[]> {
    const response = await apiClient.get<{ templates: ReportTemplate[] }>('/export/templates');
    return response.data.templates;
  },

  /**
   * Create a custom template
   */
  async createTemplate(data: {
    name: string;
    report_type: ReportType;
    format: ExportFormat;
    description: string;
    template_config: Record<string, unknown>;
  }): Promise<ReportTemplate> {
    const response = await apiClient.post<ReportTemplate>('/export/templates', data);
    return response.data;
  },

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`/export/templates/${templateId}`);
  },

  // ===== Utility =====

  /**
   * Download file from URL
   */
  downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Get download URL for export
   */
  getDownloadUrl(fileId: string): string {
    return `${API_BASE_URL}${API_VERSION}/export/download/${fileId}`;
  },
};
