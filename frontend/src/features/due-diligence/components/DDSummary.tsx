/**
 * DD Summary Component
 * Display analysis results and recommendations
 */

import React, { useState } from 'react';
import { dueDiligenceService } from '../services/dueDiligenceService';
import type {
  DDAnalysisResponse,
  DDFinding,
  RiskItem,
  QoEAdjustment,
  DealRecommendation,
} from '../types';

interface DDSummaryProps {
  analysisResult: DDAnalysisResponse | null;
  targetName: string;
  reportedEbitda: number;
  findings: DDFinding[];
  risks: RiskItem[];
  qoeAdjustments: QoEAdjustment[];
}

export function DDSummary({
  analysisResult,
  targetName,
  reportedEbitda,
  findings,
  risks,
  qoeAdjustments,
}: DDSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localResult, setLocalResult] = useState<DDAnalysisResponse | null>(
    analysisResult
  );

  async function fetchRecommendations() {
    if (!targetName) return;

    setIsLoading(true);
    try {
      const response = await dueDiligenceService.getRecommendations({
        target_name: targetName,
        reported_ebitda: reportedEbitda,
        findings,
        risks,
        qoe_adjustments: qoeAdjustments,
      });
      setLocalResult({
        success: true,
        outputs: {
          checklist: { vertical: 'general', categories: {}, total_items: 0 },
          findings_summary: response.findings_summary,
          qoe_summary: {
            reported_ebitda: reportedEbitda,
            total_addbacks: qoeAdjustments
              .filter((a) => a.is_addback)
              .reduce((sum, a) => sum + a.amount, 0),
            total_deductions: qoeAdjustments
              .filter((a) => !a.is_addback)
              .reduce((sum, a) => sum + a.amount, 0),
            adjusted_ebitda:
              reportedEbitda +
              qoeAdjustments.reduce(
                (sum, a) => sum + (a.is_addback ? a.amount : -a.amount),
                0
              ),
            adjustment_count: qoeAdjustments.length,
          },
          risk_summary: response.risk_summary,
          progress: {
            overall_completion: 0,
            items_completed: 0,
            items_in_progress: 0,
            items_not_started: 0,
            items_total: 0,
            documents_received: 0,
            documents_required: 0,
            by_category: {},
          },
          recommendations: response.recommendations,
        },
      });
    } catch (err) {
      console.error('Failed to get recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const result = localResult || analysisResult;

  if (!result) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Analysis Results Yet
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Complete the Overview tab with deal information, add findings, risks,
            and QoE adjustments, then run the full analysis.
          </p>
          <button
            onClick={fetchRecommendations}
            disabled={isLoading || !targetName}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isLoading || !targetName
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Loading...' : 'Get Recommendations'}
          </button>
        </div>
      </div>
    );
  }

  const { outputs } = result;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold">DD Summary & Recommendations</h2>
          <p className="text-sm text-gray-600">
            {targetName ? `Analysis for ${targetName}` : 'Due diligence summary'}
          </p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={isLoading}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Deal Recommendation Banner */}
      <DealRecommendationBanner
        recommendation={outputs.recommendations.deal_recommendation}
      />

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Findings Summary */}
        <SummaryCard title="Findings Summary">
          <div className="space-y-2">
            <StatRow
              label="Total Findings"
              value={outputs.findings_summary.total_findings}
            />
            <StatRow
              label="Critical"
              value={outputs.findings_summary.critical}
              color="red"
            />
            <StatRow
              label="High"
              value={outputs.findings_summary.high}
              color="orange"
            />
            <StatRow
              label="Medium"
              value={outputs.findings_summary.medium}
              color="yellow"
            />
            <StatRow
              label="Open Issues"
              value={outputs.findings_summary.open_findings}
              color="blue"
            />
            <StatRow
              label="Total Impact"
              value={formatCurrency(outputs.findings_summary.total_quantified_impact)}
              color="red"
            />
          </div>
        </SummaryCard>

        {/* Risk Summary */}
        <SummaryCard title="Risk Summary">
          <div className="space-y-2">
            <StatRow
              label="Total Risks"
              value={outputs.risk_summary.total_risks}
            />
            <StatRow
              label="Critical"
              value={outputs.risk_summary.risk_distribution?.critical || 0}
              color="red"
            />
            <StatRow
              label="High"
              value={outputs.risk_summary.risk_distribution?.high || 0}
              color="orange"
            />
            <StatRow
              label="Avg Risk Score"
              value={outputs.risk_summary.average_risk_score?.toFixed(1) || 0}
            />
          </div>
        </SummaryCard>

        {/* QoE Summary */}
        <SummaryCard title="Quality of Earnings">
          <div className="space-y-2">
            <StatRow
              label="Reported EBITDA"
              value={formatCurrency(outputs.qoe_summary.reported_ebitda)}
            />
            <StatRow
              label="Addbacks"
              value={`+${formatCurrency(outputs.qoe_summary.total_addbacks)}`}
              color="green"
            />
            <StatRow
              label="Deductions"
              value={`-${formatCurrency(outputs.qoe_summary.total_deductions)}`}
              color="red"
            />
            <div className="pt-2 border-t border-gray-200">
              <StatRow
                label="Adjusted EBITDA"
                value={formatCurrency(outputs.qoe_summary.adjusted_ebitda)}
                bold
              />
            </div>
          </div>
        </SummaryCard>

        {/* Progress */}
        <SummaryCard title="DD Progress">
          <div className="space-y-2">
            <div className="text-center py-4">
              <div className="text-3xl font-bold text-blue-600">
                {outputs.progress.overall_completion?.toFixed(0) || 0}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
            <StatRow
              label="Items Completed"
              value={outputs.progress.items_completed || 0}
            />
            <StatRow
              label="In Progress"
              value={outputs.progress.items_in_progress || 0}
            />
            <StatRow
              label="Documents"
              value={`${outputs.progress.documents_received || 0}/${
                outputs.progress.documents_required || 0
              }`}
            />
          </div>
        </SummaryCard>
      </div>

      {/* Recommendations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Actions */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <span>🚨</span> Priority Actions
          </h3>
          {outputs.recommendations.priority_actions?.length > 0 ? (
            <ul className="space-y-2">
              {outputs.recommendations.priority_actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="font-bold">{i + 1}.</span>
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-red-600">No priority actions identified</p>
          )}
        </div>

        {/* Key Concerns */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
            <span>⚠️</span> Key Concerns
          </h3>
          {outputs.recommendations.key_concerns?.length > 0 ? (
            <ul className="space-y-2">
              {outputs.recommendations.key_concerns.map((concern, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-yellow-700"
                >
                  <span>•</span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-yellow-600">No key concerns identified</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span>💡</span> Recommendations
          </h3>
          {outputs.recommendations.recommendations?.length > 0 ? (
            <ul className="space-y-2">
              {outputs.recommendations.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-blue-700">
                  <span>•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-blue-600">No recommendations at this time</p>
          )}
        </div>

        {/* Risk Mitigations */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
            <span>🛡️</span> Risk Mitigations
          </h3>
          {outputs.recommendations.risk_mitigations?.length > 0 ? (
            <ul className="space-y-2">
              {outputs.recommendations.risk_mitigations.map((mitigation, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-green-700"
                >
                  <span>•</span>
                  <span>{mitigation}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-green-600">No risk mitigations identified</p>
          )}
        </div>
      </div>

      {/* Findings by Category */}
      {outputs.findings_summary.by_category &&
        Object.keys(outputs.findings_summary.by_category).length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Findings by Category
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(outputs.findings_summary.by_category).map(
                ([category, count]) => (
                  <div
                    key={category}
                    className="px-3 py-1.5 bg-gray-100 rounded-full text-sm"
                  >
                    <span className="capitalize">
                      {category.replace('_', ' ')}
                    </span>
                    : <span className="font-medium">{count as number}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}
    </div>
  );
}

// Deal Recommendation Banner
function DealRecommendationBanner({
  recommendation,
}: {
  recommendation: DealRecommendation;
}) {
  const config: Record<
    DealRecommendation,
    { bg: string; text: string; icon: string; label: string; description: string }
  > = {
    PROCEED: {
      bg: 'bg-green-100 border-green-300',
      text: 'text-green-800',
      icon: '✅',
      label: 'Proceed',
      description: 'No significant issues identified. Deal recommended.',
    },
    PROCEED_WITH_CAUTION: {
      bg: 'bg-yellow-100 border-yellow-300',
      text: 'text-yellow-800',
      icon: '⚠️',
      label: 'Proceed with Caution',
      description:
        'Issues identified that require attention. Deal may proceed with appropriate mitigations.',
    },
    DO_NOT_PROCEED: {
      bg: 'bg-red-100 border-red-300',
      text: 'text-red-800',
      icon: '🛑',
      label: 'Do Not Proceed',
      description:
        'Critical issues identified. Deal not recommended without significant remediation.',
    },
  };

  const { bg, text, icon, label, description } = config[recommendation] || config.PROCEED_WITH_CAUTION;

  return (
    <div className={`${bg} border-2 rounded-lg p-6 mb-6`}>
      <div className="flex items-center gap-4">
        <div className="text-4xl">{icon}</div>
        <div>
          <h3 className={`text-xl font-bold ${text}`}>
            Deal Recommendation: {label}
          </h3>
          <p className={`${text} opacity-80 mt-1`}>{description}</p>
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      {children}
    </div>
  );
}

// Stat Row Component
function StatRow({
  label,
  value,
  color,
  bold,
}: {
  label: string;
  value: string | number;
  color?: string;
  bold?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    red: 'text-red-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
  };

  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span
        className={`${bold ? 'font-bold' : 'font-medium'} ${
          color ? colorClasses[color] : 'text-gray-900'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

// Utility function
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export default DDSummary;
