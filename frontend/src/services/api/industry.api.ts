/**
 * Industry-Specific Models API Service
 * Handles Sale-Leaseback, REIT, and NAV analysis
 */

import { apiClient } from './client';
import type {
  SaleLeasebackRequest,
  SaleLeasebackResponse,
  REITRequest,
  REITResponse,
  NAVRequest,
  NAVResponse,
} from './types';

export interface SaleLeasebackSensitivityRequest extends SaleLeasebackRequest {
  sensitivity: {
    variable: 'cap_rate' | 'rent_escalation_rate' | 'discount_rate';
    range: number[];
  };
}

export interface REITSensitivityRequest extends REITRequest {
  sensitivity: {
    variable: 'cap_rate' | 'noi_growth' | 'discount_rate';
    range: number[];
  };
}

export interface NAVSensitivityRequest extends NAVRequest {
  sensitivity: {
    variable: 'cap_rate' | 'discount';
    range: number[];
  };
}

export const industryApi = {
  // ===== Sale-Leaseback =====

  /**
   * Analyze sale-leaseback transaction
   */
  async analyzeSaleLeaseback(data: SaleLeasebackRequest): Promise<SaleLeasebackResponse> {
    const response = await apiClient.post<SaleLeasebackResponse>(
      '/industry/sale-leaseback/analyze',
      data
    );
    return response.data;
  },

  /**
   * Run sale-leaseback sensitivity analysis
   */
  async saleLeasebackSensitivity(
    data: SaleLeasebackSensitivityRequest
  ): Promise<{
    base_case: SaleLeasebackResponse;
    sensitivity: Array<{
      value: number;
      npv: number;
      rent_coverage: number;
    }>;
  }> {
    const response = await apiClient.post('/industry/sale-leaseback/sensitivity', data);
    return response.data;
  },

  /**
   * Compare sale-leaseback vs ownership
   */
  async compareOwnershipVsLeaseback(data: {
    property_value: number;
    annual_rent: number;
    lease_term_years: number;
    financing_rate: number;
    property_appreciation_rate: number;
    discount_rate: number;
    tax_rate: number;
  }): Promise<{
    ownership_npv: number;
    leaseback_npv: number;
    difference: number;
    recommendation: 'ownership' | 'leaseback';
    break_even_rent: number;
  }> {
    const response = await apiClient.post('/industry/sale-leaseback/compare', data);
    return response.data;
  },

  // ===== REIT Analysis =====

  /**
   * Analyze REIT metrics
   */
  async analyzeREIT(data: REITRequest): Promise<REITResponse> {
    const response = await apiClient.post<REITResponse>('/industry/reit/analyze', data);
    return response.data;
  },

  /**
   * Calculate FFO/AFFO
   */
  async calculateFFO(data: {
    net_income: number;
    depreciation: number;
    amortization: number;
    gains_on_sales: number;
    impairments: number;
  }): Promise<{
    ffo: number;
    components: {
      net_income: number;
      depreciation_add: number;
      amortization_add: number;
      gains_subtract: number;
      impairments_add: number;
    };
  }> {
    const response = await apiClient.post('/industry/reit/ffo-affo', data);
    return response.data;
  },

  /**
   * Run REIT sensitivity analysis
   */
  async reitSensitivity(data: REITSensitivityRequest): Promise<{
    base_case: REITResponse;
    sensitivity: Array<{
      value: number;
      ffo_per_share: number;
      affo_per_share: number;
      price_to_ffo: number;
    }>;
  }> {
    const response = await apiClient.post('/industry/reit/sensitivity', data);
    return response.data;
  },

  /**
   * Get REIT sector benchmarks
   */
  async getREITBenchmarks(sector: string): Promise<{
    sector: string;
    metrics: {
      avg_price_to_ffo: number;
      avg_dividend_yield: number;
      avg_payout_ratio: number;
      avg_debt_to_ebitda: number;
    };
    comparable_reits: Array<{
      name: string;
      ticker: string;
      price_to_ffo: number;
      dividend_yield: number;
    }>;
  }> {
    const response = await apiClient.get(`/industry/reit/benchmarks/${sector}`);
    return response.data;
  },

  // ===== NAV Analysis =====

  /**
   * Calculate NAV
   */
  async analyzeNAV(data: NAVRequest): Promise<NAVResponse> {
    const response = await apiClient.post<NAVResponse>('/industry/nav/analyze', data);
    return response.data;
  },

  /**
   * Sum-of-the-parts analysis
   */
  async calculateSOTP(data: {
    segments: Array<{
      name: string;
      type: string;
      metric: number;
      multiple: number;
    }>;
    corporate_costs: number;
    net_debt: number;
    shares_outstanding: number;
  }): Promise<{
    segment_values: Array<{
      name: string;
      value: number;
      percentage: number;
    }>;
    gross_value: number;
    less_corporate_costs: number;
    enterprise_value: number;
    equity_value: number;
    nav_per_share: number;
  }> {
    const response = await apiClient.post('/industry/nav/sotp', data);
    return response.data;
  },

  /**
   * Run NAV sensitivity analysis
   */
  async navSensitivity(data: NAVSensitivityRequest): Promise<{
    base_case: NAVResponse;
    sensitivity: Array<{
      value: number;
      nav: number;
      nav_per_share: number;
      premium_discount: number;
    }>;
  }> {
    const response = await apiClient.post('/industry/nav/sensitivity', data);
    return response.data;
  },

  /**
   * Compare NAV to market price
   */
  async navPremiumDiscount(data: {
    nav_per_share: number;
    current_price: number;
    historical_premium_discount?: number[];
  }): Promise<{
    current_premium_discount: number;
    is_discount: boolean;
    historical_avg?: number;
    percentile_rank?: number;
    recommendation: 'undervalued' | 'fairly_valued' | 'overvalued';
  }> {
    const response = await apiClient.post('/industry/nav/premium-discount', data);
    return response.data;
  },
};
