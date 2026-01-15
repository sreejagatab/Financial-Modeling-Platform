/**
 * API Type Definitions
 * Types that match the backend database models and API responses
 */

// ===== User & Auth Types =====

export type UserRole = 'analyst' | 'stakeholder' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface RegisterResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
}

// ===== Financial Model Types =====

export type ModelType =
  | 'three_statement'
  | 'operating_model'
  | 'cash_flow_13_week'
  | 'lbo'
  | 'merger'
  | 'dcf'
  | 'trading_comps'
  | 'precedent_txns'
  | 'sale_leaseback'
  | 'reit_conversion'
  | 'nav'
  | 'custom';

export type SheetPurpose = 'input' | 'calculation' | 'output' | 'dashboard';
export type CellType = 'input' | 'formula' | 'output' | 'label';
export type DataType = 'number' | 'text' | 'date' | 'boolean' | 'percentage' | 'currency';

export interface FinancialModel {
  id: string;
  name: string;
  description?: string;
  model_type: ModelType;
  version: number;
  owner_id: string;
  branch_id?: string;
  parent_model_id?: string;
  settings: Record<string, unknown>;
  metadata: Record<string, unknown>;
  is_archived: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface Sheet {
  id: string;
  model_id: string;
  name: string;
  purpose: SheetPurpose;
  index: number;
  is_hidden: boolean;
  is_protected: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Cell {
  id: string;
  sheet_id: string;
  address: string;
  row: number;
  column: number;
  cell_type: CellType;
  data_type: DataType;
  name?: string;
  tags: string[];
}

export interface CellValue {
  id: string;
  cell_id: string;
  version: number;
  raw_value?: string;
  formula?: string;
  formula_ast?: Record<string, unknown>;
  calculated_value?: string;
  dependencies: string[];
  format: Record<string, unknown>;
  changed_by: string;
  changed_at: string;
}

export interface Scenario {
  id: string;
  model_id: string;
  name: string;
  description?: string;
  scenario_type: 'base' | 'bull' | 'bear' | 'management' | 'custom';
  base_version_id?: string;
  assumptions_override: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModelVersion {
  id: string;
  model_id: string;
  version_number: number;
  parent_version_id?: string;
  message: string;
  author_id: string;
  committed_at: string;
  snapshot_ref: string;
  changes_summary: Record<string, unknown>;
}

// ===== Model CRUD Requests =====

export interface CreateModelRequest {
  name: string;
  model_type: ModelType;
  description?: string;
}

export interface UpdateModelRequest {
  name?: string;
  description?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateCellsRequest {
  cells: Array<{
    cell_id: string;
    raw_value?: string;
    formula?: string;
  }>;
}

export interface CreateScenarioRequest {
  name: string;
  scenario_type?: string;
  description?: string;
  assumptions_override?: Record<string, unknown>;
}

// ===== Collaboration Types =====

export interface Comment {
  id: string;
  model_id: string;
  sheet_id?: string;
  cell_address?: string;
  user_id: string;
  user_name: string;
  content: string;
  parent_id?: string;
  is_resolved: boolean;
  resolved_at?: string;
  resolved_by?: string;
  mentions: string[];
  created_at: string;
  updated_at: string;
  replies?: Comment[];
}

export interface Annotation {
  id: string;
  model_id: string;
  sheet_id: string;
  cell_address: string;
  user_id: string;
  annotation_type: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CellEdit {
  id: string;
  model_id: string;
  sheet_id: string;
  cell_address: string;
  user_id: string;
  old_value?: string;
  new_value: string;
  old_formula?: string;
  new_formula?: string;
  created_at: string;
  sequence_number: number;
  is_conflict: boolean;
  resolved_value?: string;
}

export interface CreateCommentRequest {
  model_id: string;
  content: string;
  cell_address?: string;
  sheet_id?: string;
  parent_id?: string;
}

export interface UpdateCommentRequest {
  content?: string;
  is_resolved?: boolean;
}

export interface CreateAnnotationRequest {
  model_id: string;
  sheet_id: string;
  cell_address: string;
  annotation_type: string;
  content: string;
  metadata?: Record<string, unknown>;
}

// ===== Valuation Types =====

export interface DCFRequest {
  revenue_base: number;
  revenue_growth_rates: number[];
  ebitda_margins: number[];
  tax_rate: number;
  capex_percent: number;
  nwc_percent: number;
  wacc: number;
  terminal_growth_rate: number;
  shares_outstanding: number;
  net_debt: number;
}

export interface DCFResponse {
  success: boolean;
  outputs: {
    enterprise_value: number;
    equity_value: number;
    equity_value_per_share: number;
    terminal_value: number;
    terminal_value_pv: number;
    fcf_projections: number[];
    fcf_pv: number[];
    implied_exit_multiple: number;
  };
}

export interface CompsRequest {
  target_company: string;
  industry: string;
  market_cap_range?: { min: number; max: number };
  metrics: string[];
}

export interface CompsResponse {
  success: boolean;
  comparables: Array<{
    name: string;
    ticker: string;
    market_cap: number;
    ev_revenue: number;
    ev_ebitda: number;
    pe_ratio: number;
    revenue_growth: number;
    ebitda_margin: number;
  }>;
  statistics: {
    mean: Record<string, number>;
    median: Record<string, number>;
    percentile_25: Record<string, number>;
    percentile_75: Record<string, number>;
  };
}

// ===== LBO Types =====

export interface LBORequest {
  enterprise_value: number;
  equity_purchase_price: number;
  senior_debt_amount: number;
  senior_debt_rate: number;
  sponsor_equity: number;
  projection_years: number;
  revenue_base: number;
  revenue_growth_rates: number[];
  ebitda_margins: number[];
  capex_percent?: number;
  nwc_percent?: number;
  exit_year: number;
  exit_multiple: number;
}

export interface LBOResponse {
  success: boolean;
  outputs: {
    irr: number;
    moic: number;
    entry_ev_ebitda: number;
    exit_ev_ebitda: number;
    exit_equity_value: number;
    sources: Record<string, number>;
    uses: Record<string, number>;
    debt_schedule: Array<{
      year: number;
      beginning_balance: number;
      interest: number;
      principal: number;
      ending_balance: number;
    }>;
    projections: Array<{
      year: number;
      revenue: number;
      ebitda: number;
      fcf: number;
    }>;
  };
}

// ===== Due Diligence Types =====

export type DDVertical = 'technology' | 'healthcare' | 'manufacturing' | 'retail' | 'financial' | 'real_estate';
export type DDSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type DDCategory = 'financial' | 'operational' | 'legal' | 'tax' | 'hr' | 'it' | 'commercial' | 'environmental';

export interface DDFinding {
  id: string;
  title: string;
  category: DDCategory;
  severity: DDSeverity;
  description: string;
  impact?: string;
  recommendation?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'accepted';
}

export interface DDChecklistItem {
  id: string;
  category: string;
  item: string;
  required: boolean;
  status: 'pending' | 'completed' | 'na';
  notes?: string;
}

export interface QoEAdjustment {
  id: string;
  category: string;
  description: string;
  amount: number;
  is_addback: boolean;
  is_recurring: boolean;
  confidence_level: number;
}

export interface QoERequest {
  reported_ebitda: number;
  adjustments: QoEAdjustment[];
}

export interface QoEResponse {
  success: boolean;
  qoe_analysis: {
    reported_ebitda: number;
    total_addbacks: number;
    total_deductions: number;
    adjusted_ebitda: number;
    adjustment_count: number;
    confidence_weighted_ebitda: number;
    adjustments_by_category: Record<string, number>;
  };
}

export interface RiskMatrixRequest {
  findings: DDFinding[];
}

export interface RiskMatrixResponse {
  success: boolean;
  risk_matrix: {
    overall_score: number;
    risk_level: 'low' | 'medium' | 'high' | 'critical';
    risks_by_category: Record<string, number>;
    risks_by_severity: Record<string, number>;
    top_risks: DDFinding[];
    recommendation: 'proceed' | 'proceed_with_caution' | 'do_not_proceed';
  };
}

// ===== Export Types =====

export type ExportFormat = 'pdf' | 'pptx' | 'xlsx';
export type ReportType = 'lbo' | 'three_statement' | '13_week_cash_flow' | 'valuation' | 'custom';

export interface ExportRequest {
  model_id?: string;
  report_type: ReportType;
  format: ExportFormat;
  options?: {
    include_charts?: boolean;
    include_assumptions?: boolean;
    include_scenarios?: boolean;
    template_id?: string;
  };
  data?: Record<string, unknown>;
}

export interface ExportResponse {
  success: boolean;
  file_url?: string;
  file_data?: string; // Base64 encoded
  filename: string;
  content_type: string;
}

// ===== Industry Model Types =====

export interface SaleLeasebackRequest {
  property_value: number;
  annual_rent: number;
  lease_term_years: number;
  rent_escalation_rate: number;
  cap_rate: number;
  discount_rate: number;
  corporate_tax_rate: number;
}

export interface SaleLeasebackResponse {
  success: boolean;
  outputs: {
    sale_proceeds: number;
    annual_rent_expense: number[];
    rent_tax_shield: number[];
    net_rent_cost: number[];
    npv_of_lease: number;
    rent_coverage_ratio: number;
    book_gain_loss: number;
  };
}

export interface REITRequest {
  net_income: number;
  depreciation: number;
  amortization: number;
  gains_on_sales: number;
  impairments: number;
  recurring_capex: number;
  shares_outstanding: number;
  current_price: number;
  dividend_per_share: number;
}

export interface REITResponse {
  success: boolean;
  outputs: {
    ffo: number;
    ffo_per_share: number;
    affo: number;
    affo_per_share: number;
    price_to_ffo: number;
    price_to_affo: number;
    dividend_yield: number;
    payout_ratio: number;
  };
}

export interface NAVRequest {
  assets: Array<{
    name: string;
    type: string;
    value: number;
    cap_rate?: number;
    noi?: number;
  }>;
  liabilities: Array<{
    name: string;
    amount: number;
  }>;
  shares_outstanding: number;
  current_price: number;
}

export interface NAVResponse {
  success: boolean;
  outputs: {
    gross_asset_value: number;
    total_liabilities: number;
    net_asset_value: number;
    nav_per_share: number;
    premium_discount: number;
    assets_by_type: Record<string, number>;
  };
}

// ===== Excel API Types =====

export interface ExcelGetValueRequest {
  model_path: string;
  cell_address: string;
  version?: number;
}

export interface ExcelGetValueResponse {
  success: boolean;
  value: string | number | null;
  formula?: string;
  data_type: DataType;
  last_modified: string;
  modified_by: string;
}

export interface ExcelCreateLinkRequest {
  model_path: string;
  cell_address: string;
  client_id: string;
  excel_cell: string;
}

export interface ExcelSyncRequest {
  model_id: string;
  sheet_id: string;
  cell_address: string;
  value: string | number;
  formula?: string;
  client_id: string;
  timestamp: string;
}

export interface ExcelSyncResponse {
  success: boolean;
  synced: boolean;
  conflict?: {
    server_value: string | number;
    server_timestamp: string;
  };
}
