import { useState } from 'react';
import { aiService, AIScenario } from '../../../services/aiService';

interface AIScenarioGeneratorProps {
  modelType: string;
  baseAssumptions: Record<string, number>;
  industry?: string;
  onApplyScenario?: (scenario: AIScenario) => void;
  onClose?: () => void;
}

export function AIScenarioGenerator({
  modelType,
  baseAssumptions,
  industry = 'Technology',
  onApplyScenario,
  onClose,
}: AIScenarioGeneratorProps) {
  const [scenarios, setScenarios] = useState<AIScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<AIScenario | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const generateScenarios = async () => {
    setIsLoading(true);
    try {
      const generated = await aiService.generateScenarios(modelType, baseAssumptions, industry);
      setScenarios(generated);
    } catch (error) {
      console.error('Failed to generate scenarios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScenarioColor = (type: string) => {
    switch (type) {
      case 'bull':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'bear':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'base':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getScenarioIcon = (type: string) => {
    switch (type) {
      case 'bull':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'bear':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      case 'base':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
    }
  };

  const toggleCompareSelection = (scenarioId: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(scenarioId) ? prev.filter((id) => id !== scenarioId) : [...prev, scenarioId]
    );
  };

  const getComparisonData = () => {
    return scenarios.filter((s) => selectedForCompare.includes(s.id));
  };

  const formatValue = (value: number, key: string) => {
    if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('margin') || key.toLowerCase().includes('growth')) {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(2);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">AI Scenario Generator</h2>
              <p className="text-purple-100 text-sm">Generate bull, base, and bear case scenarios</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Model Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Model Configuration</h3>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
              {modelType}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(baseAssumptions).slice(0, 6).map(([key, value]) => (
              <div key={key} className="text-sm">
                <span className="text-gray-500">{key.replace(/_/g, ' ')}:</span>
                <span className="ml-2 font-medium text-gray-900">{formatValue(value, key)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        {scenarios.length === 0 && (
          <button
            onClick={generateScenarios}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generating Scenarios...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate AI Scenarios
              </>
            )}
          </button>
        )}

        {/* Scenarios List */}
        {scenarios.length > 0 && (
          <div className="space-y-4">
            {/* Actions Bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  compareMode
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {compareMode ? 'Exit Compare' : 'Compare Scenarios'}
              </button>
              <button
                onClick={generateScenarios}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50"
              >
                Regenerate
              </button>
            </div>

            {/* Scenario Cards */}
            <div className="grid gap-4">
              {scenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  onClick={() => !compareMode && setSelectedScenario(scenario)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    compareMode && selectedForCompare.includes(scenario.id)
                      ? 'border-purple-500 bg-purple-50'
                      : getScenarioColor(scenario.type)
                  } ${!compareMode && 'hover:shadow-md'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {compareMode && (
                        <input
                          type="checkbox"
                          checked={selectedForCompare.includes(scenario.id)}
                          onChange={() => toggleCompareSelection(scenario.id)}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                      )}
                      <div className={`p-2 rounded-lg ${getScenarioColor(scenario.type)}`}>
                        {getScenarioIcon(scenario.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                        <p className="text-sm text-gray-500 capitalize">{scenario.type} Case</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      {Math.round(scenario.probability * 100)}% probability
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{scenario.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(scenario.assumptions).slice(0, 4).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-1 bg-white/50 text-xs text-gray-600 rounded border border-gray-200"
                      >
                        {key}: {formatValue(value, key)}
                      </span>
                    ))}
                  </div>
                  {!compareMode && onApplyScenario && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onApplyScenario(scenario);
                      }}
                      className="mt-3 w-full py-2 bg-white text-gray-700 font-medium text-sm rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      Apply This Scenario
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            {compareMode && selectedForCompare.length >= 2 && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-4">Scenario Comparison</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left py-2 px-3 font-medium text-gray-500">Assumption</th>
                        {getComparisonData().map((s) => (
                          <th key={s.id} className="text-right py-2 px-3 font-medium text-gray-900">
                            {s.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.keys(getComparisonData()[0]?.assumptions || {}).map((key) => (
                        <tr key={key} className="border-t border-gray-200">
                          <td className="py-2 px-3 text-gray-600">{key.replace(/_/g, ' ')}</td>
                          {getComparisonData().map((s) => (
                            <td key={s.id} className="text-right py-2 px-3 font-medium text-gray-900">
                              {formatValue(s.assumptions[key], key)}
                            </td>
                          ))}
                        </tr>
                      ))}
                      <tr className="border-t-2 border-gray-300">
                        <td className="py-2 px-3 font-medium text-gray-900">Probability</td>
                        {getComparisonData().map((s) => (
                          <td key={s.id} className="text-right py-2 px-3 font-medium text-gray-900">
                            {Math.round(s.probability * 100)}%
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scenario Detail Modal */}
      {selectedScenario && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className={`p-6 border-b ${getScenarioColor(selectedScenario.type)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getScenarioColor(selectedScenario.type)}`}>
                    {getScenarioIcon(selectedScenario.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedScenario.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{selectedScenario.type} Case Scenario</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedScenario(null)}
                  className="w-8 h-8 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">{selectedScenario.description}</p>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-500">Probability: </span>
                <span className="font-semibold text-gray-900">
                  {Math.round(selectedScenario.probability * 100)}%
                </span>
              </div>
              <h4 className="font-medium text-gray-900 mb-3">Assumptions</h4>
              <div className="space-y-2">
                {Object.entries(selectedScenario.assumptions).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">{key.replace(/_/g, ' ')}</span>
                    <span className="font-medium text-gray-900">{formatValue(value, key)}</span>
                  </div>
                ))}
              </div>
              {onApplyScenario && (
                <button
                  onClick={() => {
                    onApplyScenario(selectedScenario);
                    setSelectedScenario(null);
                  }}
                  className="mt-6 w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  Apply This Scenario
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
