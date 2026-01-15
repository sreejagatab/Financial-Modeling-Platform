import { useState, useEffect } from 'react';
import { aiService, AIRiskAssessment } from '../../../services/aiService';

interface Finding {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

interface AIRiskAnalyzerProps {
  findings: Finding[];
  industry: string;
  onMitigationApply?: (riskId: string, mitigation: string) => void;
}

export function AIRiskAnalyzer({ findings, industry, onMitigationApply }: AIRiskAnalyzerProps) {
  const [assessment, setAssessment] = useState<AIRiskAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedRisk, setExpandedRisk] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');

  useEffect(() => {
    if (findings.length > 0) {
      analyzeRisks();
    }
  }, [findings, industry]);

  const analyzeRisks = async () => {
    setIsLoading(true);
    try {
      const result = await aiService.analyzeRisks(findings, industry);
      setAssessment(result);
    } catch (error) {
      console.error('Failed to analyze risks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getSeverityBorder = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500';
      case 'high':
        return 'border-orange-500';
      case 'medium':
        return 'border-yellow-500';
      case 'low':
        return 'border-green-500';
      default:
        return 'border-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-yellow-50';
    if (score >= 40) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const getRiskPosition = (impact: string, likelihood: string) => {
    const impactMap: Record<string, number> = { low: 0, medium: 1, high: 2 };
    const likelihoodMap: Record<string, number> = { low: 0, medium: 1, high: 2 };
    return {
      row: 2 - impactMap[impact],
      col: likelihoodMap[likelihood],
    };
  };

  const getMatrixCellColor = (row: number, col: number) => {
    const risk = row + col;
    if (risk >= 3) return 'bg-red-100';
    if (risk >= 2) return 'bg-orange-100';
    if (risk >= 1) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">AI Risk Analyzer</h2>
            <p className="text-red-100 text-sm">Automated risk assessment and scoring</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="w-12 h-12 text-red-600 animate-spin mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <p className="text-gray-600">Analyzing {findings.length} findings...</p>
            </div>
          </div>
        ) : assessment ? (
          <>
            {/* Overall Score */}
            <div className={`p-6 rounded-xl mb-6 ${getScoreBg(assessment.overallScore)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Overall Risk Score</h3>
                  <p className="text-sm text-gray-600">{assessment.summary}</p>
                </div>
                <div className="text-right">
                  <p className={`text-4xl font-bold ${getScoreColor(assessment.overallScore)}`}>
                    {assessment.overallScore}
                  </p>
                  <p className="text-sm text-gray-500">out of 100</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      assessment.overallScore >= 80
                        ? 'bg-green-500'
                        : assessment.overallScore >= 60
                        ? 'bg-yellow-500'
                        : assessment.overallScore >= 40
                        ? 'bg-orange-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${assessment.overallScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Risk Details</h3>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'matrix' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
                  }`}
                >
                  Matrix
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow' : 'text-gray-600'
                  }`}
                >
                  List
                </button>
              </div>
            </div>

            {/* Risk Matrix View */}
            {viewMode === 'matrix' && (
              <div className="mb-6">
                <div className="flex">
                  <div className="w-20 flex flex-col justify-around text-center">
                    <span className="text-xs text-gray-500 -rotate-90 origin-center">High</span>
                    <span className="text-xs text-gray-500 -rotate-90 origin-center">Impact</span>
                    <span className="text-xs text-gray-500 -rotate-90 origin-center">Low</span>
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-3 gap-1">
                      {[0, 1, 2].map((row) =>
                        [0, 1, 2].map((col) => {
                          const risksInCell = assessment.risks.filter((r) => {
                            const pos = getRiskPosition(r.impact, r.likelihood);
                            return pos.row === row && pos.col === col;
                          });
                          return (
                            <div
                              key={`${row}-${col}`}
                              className={`h-24 p-2 rounded-lg ${getMatrixCellColor(row, col)} flex flex-wrap gap-1 items-start justify-center overflow-hidden`}
                            >
                              {risksInCell.map((risk) => (
                                <button
                                  key={risk.id}
                                  onClick={() => setExpandedRisk(risk.id)}
                                  className={`w-6 h-6 rounded-full ${getSeverityColor(
                                    risk.severity
                                  )} flex items-center justify-center text-xs font-bold hover:scale-110 transition-transform`}
                                  title={risk.title}
                                >
                                  {risk.title.charAt(0)}
                                </button>
                              ))}
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="flex justify-around mt-2">
                      <span className="text-xs text-gray-500">Low</span>
                      <span className="text-xs text-gray-500">Likelihood</span>
                      <span className="text-xs text-gray-500">High</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Risk List View */}
            {viewMode === 'list' && (
              <div className="space-y-3 mb-6">
                {assessment.risks.map((risk) => (
                  <div
                    key={risk.id}
                    className={`border-l-4 rounded-lg overflow-hidden ${getSeverityBorder(risk.severity)}`}
                  >
                    <div
                      onClick={() => setExpandedRisk(expandedRisk === risk.id ? null : risk.id)}
                      className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(
                              risk.severity
                            )}`}
                          >
                            {risk.severity.toUpperCase()}
                          </span>
                          <div>
                            <h4 className="font-medium text-gray-900">{risk.title}</h4>
                            <p className="text-sm text-gray-500 capitalize">{risk.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Impact</p>
                            <p className="text-sm font-medium text-gray-900 capitalize">{risk.impact}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Likelihood</p>
                            <p className="text-sm font-medium text-gray-900 capitalize">{risk.likelihood}</p>
                          </div>
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              expandedRisk === risk.id ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    {expandedRisk === risk.id && (
                      <div className="p-4 border-t border-gray-200 bg-white">
                        <p className="text-gray-600 mb-4">{risk.description}</p>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <h5 className="text-sm font-medium text-blue-800 mb-1">Recommended Mitigation</h5>
                          <p className="text-sm text-blue-700">{risk.mitigation}</p>
                          {onMitigationApply && (
                            <button
                              onClick={() => onMitigationApply(risk.id, risk.mitigation)}
                              className="mt-3 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Apply Mitigation
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">Key Recommendations</h4>
              <div className="space-y-2">
                {assessment.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 grid grid-cols-4 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">
                  {assessment.risks.filter((r) => r.severity === 'critical').length}
                </p>
                <p className="text-xs text-gray-500">Critical</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">
                  {assessment.risks.filter((r) => r.severity === 'high').length}
                </p>
                <p className="text-xs text-gray-500">High</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {assessment.risks.filter((r) => r.severity === 'medium').length}
                </p>
                <p className="text-xs text-gray-500">Medium</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {assessment.risks.filter((r) => r.severity === 'low').length}
                </p>
                <p className="text-xs text-gray-500">Low</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Findings to Analyze</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Add due diligence findings to get AI-powered risk analysis and recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
