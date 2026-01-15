import { useState } from 'react';
import { aiService, AIComparable } from '../../../services/aiService';

interface AICompsFinderProps {
  targetCompany?: {
    name: string;
    industry: string;
    revenue: number;
    ebitda: number;
    marketCap?: number;
  };
  onSelectComp?: (comp: AIComparable) => void;
  onSelectMultiple?: (comps: AIComparable[]) => void;
}

export function AICompsFinder({ targetCompany, onSelectComp, onSelectMultiple }: AICompsFinderProps) {
  const [comps, setComps] = useState<AIComparable[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedComps, setSelectedComps] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'relevanceScore' | 'evEbitda' | 'peRatio' | 'revenue'>('relevanceScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minRelevance: 0,
    minRevenue: 0,
    maxRevenue: Infinity,
  });

  // Form state for target company input
  const [formData, setFormData] = useState({
    name: targetCompany?.name || '',
    industry: targetCompany?.industry || '',
    revenue: targetCompany?.revenue || 0,
    ebitda: targetCompany?.ebitda || 0,
    marketCap: targetCompany?.marketCap || 0,
  });

  const findComps = async () => {
    if (!formData.name || !formData.industry) return;

    setIsLoading(true);
    try {
      const found = await aiService.findComparables({
        name: formData.name,
        industry: formData.industry,
        revenue: formData.revenue,
        ebitda: formData.ebitda,
        marketCap: formData.marketCap,
      });
      setComps(found);
    } catch (error) {
      console.error('Failed to find comparables:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSortedAndFilteredComps = () => {
    return comps
      .filter(
        (c) =>
          c.relevanceScore >= filters.minRelevance &&
          c.revenue >= filters.minRevenue &&
          c.revenue <= filters.maxRevenue
      )
      .sort((a, b) => {
        const aVal = a[sortBy];
        const bVal = b[sortBy];
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      });
  };

  const toggleCompSelection = (id: string) => {
    setSelectedComps((prev) => {
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
    if (onSelectMultiple) {
      const selected = comps.filter((c) => selectedComps.has(c.id));
      onSelectMultiple(selected);
      setSelectedComps(new Set());
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    }
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(0)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-100 text-green-700';
    if (score >= 0.6) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const sortedComps = getSortedAndFilteredComps();

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg">AI Comps Finder</h2>
            <p className="text-amber-100 text-sm">Find comparable companies powered by AI</p>
          </div>
        </div>
      </div>

      {/* Target Company Form */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-900 mb-4">Target Company</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Company Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
              placeholder="Enter company name"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Industry</label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
            >
              <option value="">Select industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Consumer">Consumer</option>
              <option value="Industrial">Industrial</option>
              <option value="Energy">Energy</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Telecom">Telecom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Revenue ($M)</label>
            <input
              type="number"
              value={formData.revenue / 1000000 || ''}
              onChange={(e) => setFormData({ ...formData, revenue: parseFloat(e.target.value) * 1000000 || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
              placeholder="Revenue"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">EBITDA ($M)</label>
            <input
              type="number"
              value={formData.ebitda / 1000000 || ''}
              onChange={(e) => setFormData({ ...formData, ebitda: parseFloat(e.target.value) * 1000000 || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
              placeholder="EBITDA"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Market Cap ($M)</label>
            <input
              type="number"
              value={formData.marketCap / 1000000 || ''}
              onChange={(e) => setFormData({ ...formData, marketCap: parseFloat(e.target.value) * 1000000 || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
              placeholder="Market Cap"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={findComps}
              disabled={isLoading || !formData.name || !formData.industry}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Finding...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  Find Comps
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="p-6">
        {comps.length > 0 && (
          <>
            {/* Actions Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    showFilters ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  Filters
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="relevanceScore">Sort by Relevance</option>
                  <option value="evEbitda">Sort by EV/EBITDA</option>
                  <option value="peRatio">Sort by P/E Ratio</option>
                  <option value="revenue">Sort by Revenue</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              {selectedComps.size > 0 && onSelectMultiple && (
                <button
                  onClick={handleApplySelected}
                  className="px-4 py-1.5 text-sm bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Add {selectedComps.size} Selected
                </button>
              )}
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min Relevance</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={filters.minRelevance * 100}
                      onChange={(e) =>
                        setFilters({ ...filters, minRelevance: parseInt(e.target.value) / 100 })
                      }
                      className="w-full accent-amber-500"
                    />
                    <span className="text-xs text-gray-500">{Math.round(filters.minRelevance * 100)}%</span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Min Revenue ($M)</label>
                    <input
                      type="number"
                      value={filters.minRevenue / 1000000 || ''}
                      onChange={(e) =>
                        setFilters({ ...filters, minRevenue: parseFloat(e.target.value) * 1000000 || 0 })
                      }
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Max Revenue ($M)</label>
                    <input
                      type="number"
                      value={filters.maxRevenue === Infinity ? '' : filters.maxRevenue / 1000000}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxRevenue: parseFloat(e.target.value) * 1000000 || Infinity,
                        })
                      }
                      className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
                      placeholder="No limit"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Comps Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {onSelectMultiple && <th className="py-3 px-2 text-left w-8"></th>}
                    <th className="py-3 px-3 text-left font-medium text-gray-500">Company</th>
                    <th className="py-3 px-3 text-right font-medium text-gray-500">Revenue</th>
                    <th className="py-3 px-3 text-right font-medium text-gray-500">EBITDA</th>
                    <th className="py-3 px-3 text-right font-medium text-gray-500">Market Cap</th>
                    <th className="py-3 px-3 text-right font-medium text-gray-500">EV/EBITDA</th>
                    <th className="py-3 px-3 text-right font-medium text-gray-500">P/E</th>
                    <th className="py-3 px-3 text-center font-medium text-gray-500">Relevance</th>
                    {onSelectComp && <th className="py-3 px-3 text-right w-20"></th>}
                  </tr>
                </thead>
                <tbody>
                  {sortedComps.map((comp) => (
                    <tr
                      key={comp.id}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                        selectedComps.has(comp.id) ? 'bg-amber-50' : ''
                      }`}
                    >
                      {onSelectMultiple && (
                        <td className="py-3 px-2">
                          <input
                            type="checkbox"
                            checked={selectedComps.has(comp.id)}
                            onChange={() => toggleCompSelection(comp.id)}
                            className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                          />
                        </td>
                      )}
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-medium text-gray-900">{comp.name}</p>
                          <p className="text-xs text-gray-500">{comp.ticker}</p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right text-gray-900">{formatCurrency(comp.revenue)}</td>
                      <td className="py-3 px-3 text-right text-gray-900">{formatCurrency(comp.ebitda)}</td>
                      <td className="py-3 px-3 text-right text-gray-900">{formatCurrency(comp.marketCap)}</td>
                      <td className="py-3 px-3 text-right font-medium text-gray-900">{comp.evEbitda.toFixed(1)}x</td>
                      <td className="py-3 px-3 text-right font-medium text-gray-900">{comp.peRatio.toFixed(1)}x</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getRelevanceColor(
                            comp.relevanceScore
                          )}`}
                        >
                          {Math.round(comp.relevanceScore * 100)}%
                        </span>
                      </td>
                      {onSelectComp && (
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => onSelectComp(comp)}
                            className="px-3 py-1 text-xs bg-amber-100 text-amber-700 font-medium rounded-lg hover:bg-amber-200 transition-colors"
                          >
                            Add
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary Stats */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-3">Peer Group Metrics</h4>
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(sortedComps.reduce((sum, c) => sum + c.evEbitda, 0) / sortedComps.length).toFixed(1)}x
                  </p>
                  <p className="text-xs text-gray-500">Avg EV/EBITDA</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {(sortedComps.reduce((sum, c) => sum + c.peRatio, 0) / sortedComps.length).toFixed(1)}x
                  </p>
                  <p className="text-xs text-gray-500">Avg P/E</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      sortedComps.reduce((sum, c) => sum + c.revenue, 0) / sortedComps.length
                    )}
                  </p>
                  <p className="text-xs text-gray-500">Avg Revenue</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(
                      (sortedComps.reduce((sum, c) => sum + c.relevanceScore, 0) / sortedComps.length) * 100
                    )}%
                  </p>
                  <p className="text-xs text-gray-500">Avg Relevance</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {comps.length === 0 && !isLoading && (
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Find Comparable Companies</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              Enter your target company details above and let AI find the most relevant peer companies for
              your valuation analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
