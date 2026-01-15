/**
 * Valuations API Service
 * Handles DCF, Trading Comps, Precedent Transactions, and Merger analysis
 */

import { apiClient } from './client';
import type {
  DCFRequest,
  DCFResponse,
  CompsRequest,
  CompsResponse,
} from './types';

export interface PrecedentTxnRequest {
  target_industry: string;
  deal_size_range?: { min: number; max: number };
  date_range?: { start: string; end: string };
  deal_type?: string;
}

export interface PrecedentTxnResponse {
  success: boolean;
  transactions: Array<{
    id: string;
    target: string;
    acquirer: string;
    deal_value: number;
    date: string;
    ev_revenue: number;
    ev_ebitda: number;
    premium: number;
    deal_type: string;
  }>;
  statistics: {
    mean: Record<string, number>;
    median: Record<string, number>;
    count: number;
  };
}

export interface MergerRequest {
  acquirer: {
    name: string;
    shares_outstanding: number;
    share_price: number;
    net_income: number;
    eps: number;
  };
  target: {
    name: string;
    shares_outstanding: number;
    share_price: number;
    net_income: number;
    eps: number;
  };
  deal_structure: {
    offer_price_per_share: number;
    cash_percentage: number;
    stock_percentage: number;
    synergies: number;
    synergy_realization_years: number;
  };
}

export interface MergerResponse {
  success: boolean;
  outputs: {
    transaction_value: number;
    premium_paid: number;
    premium_percentage: number;
    shares_issued?: number;
    cash_used?: number;
    pro_forma_eps: number;
    acquirer_eps_impact: number;
    accretion_dilution: number;
    accretion_dilution_percentage: number;
    is_accretive: boolean;
    breakeven_synergies: number;
    contribution_analysis: {
      acquirer_revenue_contribution: number;
      target_revenue_contribution: number;
      acquirer_ebitda_contribution: number;
      target_ebitda_contribution: number;
    };
  };
}

export const valuationsApi = {
  // ===== DCF =====

  /**
   * Run DCF valuation
   */
  async runDCF(data: DCFRequest): Promise<DCFResponse> {
    const response = await apiClient.post<DCFResponse>('/valuations/dcf', data);
    return response.data;
  },

  /**
   * Run DCF sensitivity analysis
   */
  async dcfSensitivity(
    data: DCFRequest,
    sensitivity: {
      row_variable: 'wacc' | 'terminal_growth_rate';
      col_variable: 'wacc' | 'terminal_growth_rate';
      row_range: number[];
      col_range: number[];
    }
  ): Promise<{
    base_case: DCFResponse;
    sensitivity_table: number[][];
    row_labels: number[];
    col_labels: number[];
  }> {
    const response = await apiClient.post('/valuations/dcf/sensitivity', {
      ...data,
      sensitivity,
    });
    return response.data;
  },

  // ===== Trading Comps =====

  /**
   * Get trading comparables
   */
  async getComps(data: CompsRequest): Promise<CompsResponse> {
    const response = await apiClient.post<CompsResponse>('/valuations/comps', data);
    return response.data;
  },

  /**
   * Get implied valuation from comps
   */
  async impliedValuation(
    targetMetrics: {
      revenue: number;
      ebitda: number;
      net_income: number;
      shares_outstanding: number;
    },
    multiples: {
      ev_revenue: number;
      ev_ebitda: number;
      pe_ratio: number;
    },
    netDebt: number
  ): Promise<{
    implied_ev_from_revenue: number;
    implied_ev_from_ebitda: number;
    implied_equity_from_pe: number;
    implied_share_price: {
      from_revenue: number;
      from_ebitda: number;
      from_pe: number;
    };
  }> {
    const response = await apiClient.post('/valuations/comps/implied', {
      target_metrics: targetMetrics,
      multiples,
      net_debt: netDebt,
    });
    return response.data;
  },

  // ===== Precedent Transactions =====

  /**
   * Get precedent transactions
   */
  async getPrecedents(data: PrecedentTxnRequest): Promise<PrecedentTxnResponse> {
    const response = await apiClient.post<PrecedentTxnResponse>('/valuations/precedents', data);
    return response.data;
  },

  // ===== Merger Analysis =====

  /**
   * Run merger accretion/dilution analysis
   */
  async analyzemerger(data: MergerRequest): Promise<MergerResponse> {
    const response = await apiClient.post<MergerResponse>('/deals/merger/accretion', data);
    return response.data;
  },

  /**
   * Run merger sensitivity on deal terms
   */
  async mergerSensitivity(
    data: MergerRequest,
    sensitivity: {
      variable: 'offer_price' | 'synergies' | 'cash_percentage';
      range: number[];
    }
  ): Promise<{
    base_case: MergerResponse;
    sensitivity: Array<{
      value: number;
      accretion_dilution: number;
      is_accretive: boolean;
    }>;
  }> {
    const response = await apiClient.post('/deals/merger/sensitivity', {
      ...data,
      sensitivity,
    });
    return response.data;
  },

  // ===== Football Field =====

  /**
   * Get football field data
   */
  async getFootballField(
    data: {
      dcf: { low: number; high: number };
      comps: { low: number; high: number };
      precedents: { low: number; high: number };
      lbo?: { low: number; high: number };
      fifty_two_week?: { low: number; high: number };
    }
  ): Promise<{
    methodologies: Array<{
      name: string;
      low: number;
      high: number;
      midpoint: number;
    }>;
    implied_range: { low: number; high: number };
    mean: number;
    median: number;
  }> {
    const response = await apiClient.post('/valuations/football-field', data);
    return response.data;
  },
};
