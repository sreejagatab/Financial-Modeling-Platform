/**
 * Due Diligence - Main Page
 * Comprehensive DD workflow management
 */

import { useState, useEffect } from 'react';
import { FindingsTracker } from './components/FindingsTracker';
import { RiskMatrix } from './components/RiskMatrix';
import { QoECalculator } from './components/QoECalculator';
import { DDChecklist } from './components/DDChecklist';
import { DDSummary } from './components/DDSummary';
import { dueDiligenceService } from './services/dueDiligenceService';
import { AIRiskAnalyzer } from '../../shared/components/ai';
import type {
  DDVertical,
  DDPhase,
  DDFinding,
  RiskItem,
  QoEAdjustment,
  DDAnalysisResponse,
  VerticalOption,
} from './types';

type TabType = 'overview' | 'checklist' | 'findings' | 'qoe' | 'risks' | 'recommendations';

export function DueDiligence() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAIRiskAnalyzer, setShowAIRiskAnalyzer] = useState(false);

  // DD State
  const [targetName, setTargetName] = useState('');
  const [dealValue, setDealValue] = useState<number>(0);
  const [vertical, setVertical] = useState<DDVertical>('technology');
  const [phase, setPhase] = useState<DDPhase>('phase_1');
  const [reportedEbitda, setReportedEbitda] = useState<number>(0);

  // Collections
  const [findings, setFindings] = useState<DDFinding[]>([]);
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [qoeAdjustments, setQoeAdjustments] = useState<QoEAdjustment[]>([]);

  // Analysis results
  const [analysisResult, setAnalysisResult] = useState<DDAnalysisResponse | null>(null);

  // Available options
  const [verticals, setVerticals] = useState<VerticalOption[]>([]);

  useEffect(() => {
    loadVerticals();
  }, []);

  async function loadVerticals() {
    try {
      const response = await dueDiligenceService.getVerticals();
      setVerticals(response.verticals);
    } catch (err) {
      console.error('Failed to load verticals:', err);
    }
  }

  async function runAnalysis() {
    if (!targetName) {
      setError('Target name is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await dueDiligenceService.analyzeDueDiligence({
        target_name: targetName,
        deal_value: dealValue,
        vertical,
        current_phase: phase,
        reported_ebitda: reportedEbitda,
        findings,
        risks,
        qoe_adjustments: qoeAdjustments,
      });
      setAnalysisResult(result);
      setActiveTab('recommendations');
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'checklist', label: 'Checklist', icon: '✅' },
    { id: 'findings', label: 'Findings', icon: '🔍' },
    { id: 'qoe', label: 'Quality of Earnings', icon: '💰' },
    { id: 'risks', label: 'Risk Matrix', icon: '⚠️' },
    { id: 'recommendations', label: 'Recommendations', icon: '📋' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Due Diligence</h1>
          <p className="text-gray-600 mt-1">
            Comprehensive due diligence workflow with findings tracking, risk assessment, and QoE analysis
          </p>
        </div>
        <button
          onClick={() => setShowAIRiskAnalyzer(true)}
          disabled={findings.length === 0}
          className="px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          AI Risk Analysis
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow">
        {activeTab === 'overview' && (
          <OverviewTab
            targetName={targetName}
            setTargetName={setTargetName}
            dealValue={dealValue}
            setDealValue={setDealValue}
            vertical={vertical}
            setVertical={setVertical}
            phase={phase}
            setPhase={setPhase}
            reportedEbitda={reportedEbitda}
            setReportedEbitda={setReportedEbitda}
            verticals={verticals}
            findings={findings}
            risks={risks}
            qoeAdjustments={qoeAdjustments}
            onRunAnalysis={runAnalysis}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'checklist' && (
          <DDChecklist vertical={vertical} />
        )}

        {activeTab === 'findings' && (
          <FindingsTracker
            findings={findings}
            onFindingsChange={setFindings}
          />
        )}

        {activeTab === 'qoe' && (
          <QoECalculator
            reportedEbitda={reportedEbitda}
            adjustments={qoeAdjustments}
            onAdjustmentsChange={setQoeAdjustments}
            onReportedEbitdaChange={setReportedEbitda}
          />
        )}

        {activeTab === 'risks' && (
          <RiskMatrix
            risks={risks}
            onRisksChange={setRisks}
          />
        )}

        {activeTab === 'recommendations' && (
          <DDSummary
            analysisResult={analysisResult}
            targetName={targetName}
            reportedEbitda={reportedEbitda}
            findings={findings}
            risks={risks}
            qoeAdjustments={qoeAdjustments}
          />
        )}
      </div>

      {/* AI Risk Analyzer Modal */}
      {showAIRiskAnalyzer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setShowAIRiskAnalyzer(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-gray-700 z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <AIRiskAnalyzer
                findings={findings
                  .filter((f) => f.severity !== 'info')
                  .map((f) => ({
                    category: f.category,
                    severity: f.severity as 'low' | 'medium' | 'high' | 'critical',
                    description: f.description,
                  }))}
                industry={vertical}
                onMitigationApply={(riskId, mitigation) => {
                  console.log('Apply mitigation:', riskId, mitigation);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Overview Tab Component
interface OverviewTabProps {
  targetName: string;
  setTargetName: (v: string) => void;
  dealValue: number;
  setDealValue: (v: number) => void;
  vertical: DDVertical;
  setVertical: (v: DDVertical) => void;
  phase: DDPhase;
  setPhase: (v: DDPhase) => void;
  reportedEbitda: number;
  setReportedEbitda: (v: number) => void;
  verticals: VerticalOption[];
  findings: DDFinding[];
  risks: RiskItem[];
  qoeAdjustments: QoEAdjustment[];
  onRunAnalysis: () => void;
  isLoading: boolean;
}

function OverviewTab({
  targetName,
  setTargetName,
  dealValue,
  setDealValue,
  vertical,
  setVertical,
  phase,
  setPhase,
  reportedEbitda,
  setReportedEbitda,
  verticals,
  findings,
  risks,
  qoeAdjustments,
  onRunAnalysis,
  isLoading,
}: OverviewTabProps) {
  const phases: { value: DDPhase; label: string }[] = [
    { value: 'phase_1', label: 'Phase 1 - Preliminary' },
    { value: 'phase_2', label: 'Phase 2 - Detailed' },
    { value: 'phase_3', label: 'Phase 3 - Final' },
    { value: 'completed', label: 'Completed' },
  ];

  const criticalFindings = findings.filter((f) => f.severity === 'critical').length;
  const highFindings = findings.filter((f) => f.severity === 'high').length;
  const openFindings = findings.filter((f) => f.status === 'open').length;
  const highRisks = risks.filter((r) =>
    ['likely', 'almost_certain'].includes(r.likelihood) &&
    ['major', 'severe', 'catastrophic'].includes(r.impact)
  ).length;

  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-4">Deal Information</h2>

      {/* Deal Info Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Name *
          </label>
          <input
            type="text"
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter target company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deal Value ($)
          </label>
          <input
            type="number"
            value={dealValue || ''}
            onChange={(e) => setDealValue(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter deal value"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reported EBITDA ($)
          </label>
          <input
            type="number"
            value={reportedEbitda || ''}
            onChange={(e) => setReportedEbitda(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter reported EBITDA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industry Vertical
          </label>
          <select
            value={vertical}
            onChange={(e) => setVertical(e.target.value as DDVertical)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {verticals.length > 0 ? (
              verticals.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))
            ) : (
              <>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="real_estate">Real Estate</option>
                <option value="financial_services">Financial Services</option>
                <option value="retail">Retail</option>
                <option value="general">General</option>
              </>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Phase
          </label>
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value as DDPhase)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {phases.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <h2 className="text-lg font-semibold mb-4">DD Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          title="Findings"
          value={findings.length}
          subtitle={`${openFindings} open`}
          color="blue"
        />
        <SummaryCard
          title="Critical/High Issues"
          value={criticalFindings + highFindings}
          subtitle={`${criticalFindings} critical, ${highFindings} high`}
          color={criticalFindings > 0 ? 'red' : highFindings > 0 ? 'orange' : 'green'}
        />
        <SummaryCard
          title="Risks Identified"
          value={risks.length}
          subtitle={`${highRisks} high priority`}
          color={highRisks > 0 ? 'orange' : 'green'}
        />
        <SummaryCard
          title="QoE Adjustments"
          value={qoeAdjustments.length}
          subtitle={formatCurrency(
            qoeAdjustments.reduce((sum, adj) =>
              sum + (adj.is_addback ? adj.amount : -adj.amount), 0
            )
          )}
          color="purple"
        />
      </div>

      {/* Run Analysis Button */}
      <div className="flex justify-end">
        <button
          onClick={onRunAnalysis}
          disabled={isLoading || !targetName}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            isLoading || !targetName
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Analyzing...' : 'Run Full Analysis'}
        </button>
      </div>
    </div>
  );
}

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

function SummaryCard({ title, value, subtitle, color }: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <div className="text-sm font-medium opacity-80">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
      <div className="text-xs opacity-70 mt-1">{subtitle}</div>
    </div>
  );
}

// Utility function
function formatCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value >= 0 ? '+' : '-';
  if (absValue >= 1000000) {
    return `${sign}$${(absValue / 1000000).toFixed(1)}M`;
  } else if (absValue >= 1000) {
    return `${sign}$${(absValue / 1000).toFixed(0)}K`;
  }
  return `${sign}$${absValue.toFixed(0)}`;
}

export default DueDiligence;
