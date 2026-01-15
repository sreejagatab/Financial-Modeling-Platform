import { useState, useEffect } from 'react';
import { aiService, AIAssumption } from '../../../services/aiService';

interface AIAssumptionsHelperProps {
  industry: string;
  companySize: 'small' | 'medium' | 'large';
  modelType: string;
  currentAssumptions?: Record<string, number>;
  onApplyAssumption?: (key: string, value: number) => void;
  onApplyAll?: (assumptions: Record<string, number>) => void;
}

export function AIAssumptionsHelper({
  industry,
  companySize,
  modelType,
  currentAssumptions = {},
  onApplyAssumption,
  onApplyAll,
}: AIAssumptionsHelperProps) {
  const [assumptions, setAssumptions] = useState<AIAssumption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAssumptions, setSelectedAssumptions] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadAssumptions();
  }, [industry, companySize, modelType]);

  const loadAssumptions = async () => {
    setIsLoading(true);
    try {
      const suggestions = await aiService.getAssumptionSuggestions(industry, companySize, modelType);
      setAssumptions(suggestions);
    } catch (error) {
      console.error('Failed to load assumptions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = ['all', ...new Set(assumptions.map((a) => a.category))];

  const filteredAssumptions =
    selectedCategory === 'all'
      ? assumptions
      : assumptions.filter((a) => a.category === selectedCategory);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatValue = (value: number, name: string) => {
    const lowerName = name.toLowerCase();
    if (
      lowerName.includes('rate') ||
      lowerName.includes('margin') ||
      lowerName.includes('growth') ||
      lowerName.includes('yield') ||
      lowerName.includes('percent')
    ) {
      return `${(value * 100).toFixed(1)}%`;
    }
    if (lowerName.includes('multiple') || lowerName.includes('ratio')) {
      return `${value.toFixed(1)}x`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(2);
  };

  const toggleAssumptionSelection = (id: string) => {
    setSelectedAssumptions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApplySelected = () => {
    if (onApplyAll) {
      const toApply: Record<string, number> = {};
      assumptions
        .filter((a) => selectedAssumptions.has(a.id))
        .forEach((a) => {
          toApply[a.name] = a.suggestedValue;
        });
      onApplyAll(toApply);
      setSelectedAssumptions(new Set());
    }
  };

  const getDifferenceFromCurrent = (assumption: AIAssumption) => {
    const currentValue = currentAssumptions[assumption.name];
    if (currentValue === undefined) return null;
    const diff = ((assumption.suggestedValue - currentValue) / currentValue) * 100;
    return diff;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">AI Assumptions Helper</h2>
            <p className="text-emerald-100 text-sm">
              Industry-standard assumptions for {industry} ({companySize})
            </p>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="w-8 h-8 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        ) : (
          <>
            {/* Selection Actions */}
            {selectedAssumptions.size > 0 && onApplyAll && (
              <div className="mb-4 p-3 bg-emerald-50 rounded-lg flex items-center justify-between">
                <span className="text-sm text-emerald-700">
                  {selectedAssumptions.size} assumption{selectedAssumptions.size > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedAssumptions(new Set())}
                    className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleApplySelected}
                    className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Apply Selected
                  </button>
                </div>
              </div>
            )}

            {/* Assumptions List */}
            <div className="space-y-3">
              {filteredAssumptions.map((assumption) => {
                const difference = getDifferenceFromCurrent(assumption);
                const isExpanded = expandedId === assumption.id;

                return (
                  <div
                    key={assumption.id}
                    className={`border rounded-lg overflow-hidden transition-all ${
                      selectedAssumptions.has(assumption.id)
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start gap-3">
                        {onApplyAll && (
                          <input
                            type="checkbox"
                            checked={selectedAssumptions.has(assumption.id)}
                            onChange={() => toggleAssumptionSelection(assumption.id)}
                            className="mt-1 w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-medium text-gray-900">{assumption.name}</h4>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full ${getConfidenceColor(
                                  assumption.confidence
                                )}`}
                              >
                                {Math.round(assumption.confidence * 100)}% confidence
                              </span>
                              <span className="text-lg font-semibold text-gray-900">
                                {formatValue(assumption.suggestedValue, assumption.name)}
                              </span>
                            </div>
                          </div>

                          {/* Range Visualization */}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {formatValue(assumption.range.min, assumption.name)}
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full relative">
                              <div
                                className="absolute h-full bg-emerald-500 rounded-full"
                                style={{
                                  left: '0%',
                                  width: `${
                                    ((assumption.suggestedValue - assumption.range.min) /
                                      (assumption.range.max - assumption.range.min)) *
                                    100
                                  }%`,
                                }}
                              />
                              <div
                                className="absolute w-3 h-3 bg-emerald-600 rounded-full -mt-0.5 shadow"
                                style={{
                                  left: `${
                                    ((assumption.suggestedValue - assumption.range.min) /
                                      (assumption.range.max - assumption.range.min)) *
                                    100
                                  }%`,
                                  transform: 'translateX(-50%)',
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatValue(assumption.range.max, assumption.name)}
                            </span>
                          </div>

                          {/* Difference from Current */}
                          {difference !== null && (
                            <div className="mt-2">
                              <span
                                className={`text-xs font-medium ${
                                  difference > 0 ? 'text-green-600' : difference < 0 ? 'text-red-600' : 'text-gray-500'
                                }`}
                              >
                                {difference > 0 ? '+' : ''}
                                {difference.toFixed(1)}% vs current
                              </span>
                            </div>
                          )}

                          {/* Expand/Collapse */}
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : assumption.id)}
                            className="mt-2 text-xs text-emerald-600 hover:text-emerald-700"
                          >
                            {isExpanded ? 'Show less' : 'Show rationale'}
                          </button>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                              <p className="mb-2">{assumption.rationale}</p>
                              <p className="text-xs text-gray-500">Source: {assumption.source}</p>
                            </div>
                          )}
                        </div>

                        {/* Apply Button */}
                        {onApplyAssumption && (
                          <button
                            onClick={() => onApplyAssumption(assumption.name, assumption.suggestedValue)}
                            className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredAssumptions.length === 0 && (
              <div className="text-center py-12">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600">No assumptions found for this category.</p>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={loadAssumptions}
              disabled={isLoading}
              className="mt-6 w-full py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh Suggestions
            </button>
          </>
        )}
      </div>
    </div>
  );
}
