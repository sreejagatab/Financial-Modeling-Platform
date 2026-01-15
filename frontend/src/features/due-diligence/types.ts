/**
 * Due Diligence Types
 */

// Enums
export type DDVertical =
  | 'technology'
  | 'healthcare'
  | 'manufacturing'
  | 'real_estate'
  | 'financial_services'
  | 'retail'
  | 'general';

export type DDPhase =
  | 'phase_1'
  | 'phase_2'
  | 'phase_3'
  | 'completed';

export type FindingSeverity =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'info';

export type FindingCategory =
  | 'financial'
  | 'legal'
  | 'operational'
  | 'commercial'
  | 'technology'
  | 'hr'
  | 'environmental'
  | 'regulatory'
  | 'tax';

export type FindingStatus =
  | 'open'
  | 'in_review'
  | 'resolved'
  | 'accepted';

export type RiskLikelihood =
  | 'rare'
  | 'unlikely'
  | 'possible'
  | 'likely'
  | 'almost_certain';

export type RiskImpact =
  | 'minor'
  | 'moderate'
  | 'major'
  | 'severe'
  | 'catastrophic';

export type DealRecommendation =
  | 'PROCEED'
  | 'PROCEED_WITH_CAUTION'
  | 'DO_NOT_PROCEED';

// Work Item
export interface DDWorkItem {
  id: string;
  category: FindingCategory;
  title: string;
  description?: string;
  owner?: string;
  due_date?: string;
  status?: string;
  completion_percent: number;
  documents_required: string[];
  documents_received: string[];
  notes?: string;
}

// Finding
export interface DDFinding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  title: string;
  description: string;
  impact_amount?: number;
  impact_description?: string;
  status: FindingStatus;
  recommendation?: string;
  mitigation?: string;
  owner?: string;
  date_identified?: string;
  source_documents?: string[];
  related_findings?: string[];
}

// QoE Adjustment
export interface QoEAdjustment {
  id: string;
  category: string;
  description: string;
  amount: number;
  is_addback: boolean;
  is_recurring: boolean;
  confidence_level?: number;
  notes?: string;
}

// Risk Item
export interface RiskItem {
  id: string;
  category: FindingCategory;
  title: string;
  description: string;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  mitigation_strategy?: string;
  contingency_plan?: string;
  owner?: string;
  monitoring_frequency?: string;
  related_findings?: string[];
}

// Team Member
export interface TeamMember {
  name: string;
  role: string;
  email?: string;
}

// Request Types
export interface DDAnalysisRequest {
  target_name: string;
  transaction_type?: string;
  deal_value?: number;
  vertical?: DDVertical;
  current_phase?: DDPhase;
  reported_revenue?: number;
  reported_ebitda?: number;
  reported_net_income?: number;
  work_items?: DDWorkItem[];
  findings?: DDFinding[];
  qoe_adjustments?: QoEAdjustment[];
  risks?: RiskItem[];
  dd_start_date?: string;
  dd_end_date?: string;
  closing_date?: string;
  team_members?: TeamMember[];
}

export interface QoERequest {
  reported_ebitda: number;
  adjustments: QoEAdjustment[];
}

export interface RiskMatrixRequest {
  risks: RiskItem[];
}

// Response Types
export interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  priority: string;
  status: string;
}

export interface ChecklistCategory {
  name: string;
  items: ChecklistItem[];
}

export interface DDChecklist {
  vertical: string;
  categories: Record<string, ChecklistItem[]>;
  total_items: number;
}

export interface FindingsSummary {
  total_findings: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  total_quantified_impact: number;
  open_findings: number;
  by_category: Record<string, number>;
}

export interface QoESummary {
  reported_ebitda: number;
  total_addbacks: number;
  total_deductions: number;
  adjusted_ebitda: number;
  adjustment_count: number;
  confidence_weighted_ebitda?: number;
  recurring_adjustments?: number;
  non_recurring_adjustments?: number;
}

export interface RiskSummary {
  total_risks: number;
  total_weighted_risk: number;
  average_risk_score: number;
  risk_distribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  by_category: Record<string, number>;
}

export interface RiskDetail {
  id: string;
  category: string;
  title: string;
  description: string;
  likelihood: string;
  impact: string;
  risk_score: number;
  risk_level: string;
}

export interface ProgressSummary {
  overall_completion: number;
  items_completed: number;
  items_in_progress: number;
  items_not_started: number;
  items_total: number;
  documents_received: number;
  documents_required: number;
  by_category: Record<string, {
    completed: number;
    total: number;
    completion_percent: number;
  }>;
}

export interface DDRecommendations {
  deal_recommendation: DealRecommendation;
  recommendations: string[];
  priority_actions: string[];
  risk_mitigations: string[];
  key_concerns: string[];
}

export interface DDAnalysisResponse {
  success: boolean;
  outputs: {
    checklist: DDChecklist;
    findings_summary: FindingsSummary;
    qoe_summary: QoESummary;
    risk_summary: RiskSummary;
    progress: ProgressSummary;
    recommendations: DDRecommendations;
  };
}

export interface VerticalOption {
  value: string;
  label: string;
}

export interface CategoryOption {
  value: string;
  label: string;
}

export interface SeverityOption {
  value: string;
  label: string;
}

// Severity colors for UI
export const SEVERITY_COLORS: Record<FindingSeverity, string> = {
  critical: '#dc2626', // red-600
  high: '#ea580c',     // orange-600
  medium: '#ca8a04',   // yellow-600
  low: '#16a34a',      // green-600
  info: '#2563eb',     // blue-600
};

// Risk level colors
export const RISK_LEVEL_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#ca8a04',
  low: '#16a34a',
};

// Likelihood scores for risk matrix
export const LIKELIHOOD_SCORES: Record<RiskLikelihood, number> = {
  rare: 1,
  unlikely: 2,
  possible: 3,
  likely: 4,
  almost_certain: 5,
};

// Impact scores for risk matrix
export const IMPACT_SCORES: Record<RiskImpact, number> = {
  minor: 1,
  moderate: 2,
  major: 3,
  severe: 4,
  catastrophic: 5,
};
