import { useState } from 'react';
import { LoadingButton } from '@/shared/components/loading';
import { ErrorDisplay } from '@/shared/components/errors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

interface MergerInputs {
  // Acquirer
  acquirerName: string;
  acquirerSharePrice: number;
  acquirerSharesOutstanding: number;
  acquirerNetIncome: number;
  acquirerEPS: number;
  // Target
  targetName: string;
  targetSharePrice: number;
  targetSharesOutstanding: number;
  targetNetIncome: number;
  targetEPS: number;
  // Deal terms
  offerPricePerShare: number;
  cashPercentage: number;
  stockPercentage: number;
  synergies: number;
  integrationCosts: number;
}

interface MergerResult {
  premium_paid: number;
  exchange_ratio: number;
  acquirer_ownership: number;
  target_ownership: number;
  combined_shares: number;
  combined_net_income: number;
  pro_forma_eps: number;
  accretion_dilution: number;
  accretion_dilution_pct: number;
  is_accretive: boolean;
  break_even_synergies: number;
}

export function MergerAnalysis() {
  const [inputs, setInputs] = useState<MergerInputs>({
    acquirerName: 'Acquirer Corp',
    acquirerSharePrice: 50.0,
    acquirerSharesOutstanding: 100,
    acquirerNetIncome: 500,
    acquirerEPS: 5.0,
    targetName: 'Target Inc',
    targetSharePrice: 30.0,
    targetSharesOutstanding: 50,
    targetNetIncome: 150,
    targetEPS: 3.0,
    offerPricePerShare: 40.0,
    cashPercentage: 50,
    stockPercentage: 50,
    synergies: 50,
    integrationCosts: 20,
  });

  const [result, setResult] = useState<MergerResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof MergerInputs, value: number | string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/deals/merger/accretion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acquirer_share_price: inputs.acquirerSharePrice,
          acquirer_shares_outstanding: inputs.acquirerSharesOutstanding,
          acquirer_net_income: inputs.acquirerNetIncome,
          target_share_price: inputs.targetSharePrice,
          target_shares_outstanding: inputs.targetSharesOutstanding,
          target_net_income: inputs.targetNetIncome,
          offer_price_per_share: inputs.offerPricePerShare,
          cash_percentage: inputs.cashPercentage / 100,
          synergies: inputs.synergies,
          integration_costs: inputs.integrationCosts,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merger Analysis</h1>
          <p className="text-gray-500 mt-1">Accretion / Dilution Analysis</p>
        </div>
        <LoadingButton
          isLoading={isLoading}
          loadingText="Analyzing..."
          onClick={handleAnalyze}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Run Analysis
        </LoadingButton>
      </div>

      {error && (
        <ErrorDisplay message={error} onDismiss={() => setError(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Acquirer Inputs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Acquirer
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={inputs.acquirerName}
                onChange={(e) => handleInputChange('acquirerName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Share Price ($)</label>
              <input
                type="number"
                value={inputs.acquirerSharePrice}
                onChange={(e) => handleInputChange('acquirerSharePrice', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shares Outstanding (M)</label>
              <input
                type="number"
                value={inputs.acquirerSharesOutstanding}
                onChange={(e) => handleInputChange('acquirerSharesOutstanding', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Net Income ($M)</label>
              <input
                type="number"
                value={inputs.acquirerNetIncome}
                onChange={(e) => handleInputChange('acquirerNetIncome', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Market Cap</span>
                <span className="font-medium">{formatCurrency(inputs.acquirerSharePrice * inputs.acquirerSharesOutstanding)}M</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">EPS</span>
                <span className="font-medium">${(inputs.acquirerNetIncome / inputs.acquirerSharesOutstanding).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Target Inputs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Target
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={inputs.targetName}
                onChange={(e) => handleInputChange('targetName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Share Price ($)</label>
              <input
                type="number"
                value={inputs.targetSharePrice}
                onChange={(e) => handleInputChange('targetSharePrice', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shares Outstanding (M)</label>
              <input
                type="number"
                value={inputs.targetSharesOutstanding}
                onChange={(e) => handleInputChange('targetSharesOutstanding', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Net Income ($M)</label>
              <input
                type="number"
                value={inputs.targetNetIncome}
                onChange={(e) => handleInputChange('targetNetIncome', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Market Cap</span>
                <span className="font-medium">{formatCurrency(inputs.targetSharePrice * inputs.targetSharesOutstanding)}M</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">EPS</span>
                <span className="font-medium">${(inputs.targetNetIncome / inputs.targetSharesOutstanding).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Deal Terms */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            Deal Terms
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Offer Price per Share ($)</label>
              <input
                type="number"
                value={inputs.offerPricePerShare}
                onChange={(e) => handleInputChange('offerPricePerShare', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cash Consideration (%)</label>
              <input
                type="number"
                value={inputs.cashPercentage}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  handleInputChange('cashPercentage', val);
                  handleInputChange('stockPercentage', 100 - val);
                }}
                min={0}
                max={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Consideration (%)</label>
              <input
                type="number"
                value={inputs.stockPercentage}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Synergies ($M)</label>
              <input
                type="number"
                value={inputs.synergies}
                onChange={(e) => handleInputChange('synergies', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Integration Costs ($M)</label>
              <input
                type="number"
                value={inputs.integrationCosts}
                onChange={(e) => handleInputChange('integrationCosts', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Premium to Current</span>
                <span className="font-medium text-green-600">
                  {formatPercent(((inputs.offerPricePerShare / inputs.targetSharePrice) - 1) * 100)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-600">Total Deal Value</span>
                <span className="font-medium">{formatCurrency(inputs.offerPricePerShare * inputs.targetSharesOutstanding)}M</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Accretion/Dilution Summary */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Accretion / Dilution Summary</h2>
            <div className={`text-center p-6 rounded-xl ${result.is_accretive ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className="text-sm text-gray-600 mb-1">Pro Forma EPS Impact</p>
              <p className={`text-4xl font-bold ${result.is_accretive ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(result.accretion_dilution_pct)}
              </p>
              <p className={`text-lg font-semibold mt-2 ${result.is_accretive ? 'text-green-600' : 'text-red-600'}`}>
                {result.is_accretive ? 'ACCRETIVE' : 'DILUTIVE'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Standalone EPS</p>
                <p className="text-xl font-bold text-gray-900">${(inputs.acquirerNetIncome / inputs.acquirerSharesOutstanding).toFixed(2)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Pro Forma EPS</p>
                <p className="text-xl font-bold text-gray-900">${result.pro_forma_eps.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Deal Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Deal Metrics</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Premium Paid</span>
                <span className="font-semibold text-gray-900">{formatPercent(result.premium_paid)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Exchange Ratio</span>
                <span className="font-semibold text-gray-900">{result.exchange_ratio.toFixed(4)}x</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Acquirer Ownership</span>
                <span className="font-semibold text-gray-900">{result.acquirer_ownership.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Target Ownership</span>
                <span className="font-semibold text-gray-900">{result.target_ownership.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Combined Shares (M)</span>
                <span className="font-semibold text-gray-900">{result.combined_shares.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Break-even Synergies</span>
                <span className="font-semibold text-gray-900">{formatCurrency(result.break_even_synergies)}M</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
