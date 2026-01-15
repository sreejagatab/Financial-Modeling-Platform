import { useState, useCallback } from 'react';
import { LoadingButton } from '@/shared/components/loading';
import { ErrorDisplay } from '@/shared/components/errors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

interface Asset {
  name: string;
  noi: number;
  capRate: number;
  value?: number;
}

interface NAVInputs {
  assets: Asset[];
  cashAndEquivalents: number;
  otherAssets: number;
  totalDebt: number;
  preferredEquity: number;
  minorityInterest: number;
  sharesOutstanding: number;
  currentPrice: number;
}

interface NAVResult {
  gross_asset_value: number;
  total_liabilities: number;
  net_asset_value: number;
  nav_per_share: number;
  premium_discount: number;
  implied_cap_rate: number;
  asset_breakdown: { name: string; value: number; percentage: number }[];
}

export function NAVAnalysisPage() {
  const [inputs, setInputs] = useState<NAVInputs>({
    assets: [
      { name: 'Office Portfolio', noi: 50, capRate: 6.0 },
      { name: 'Industrial Portfolio', noi: 35, capRate: 5.5 },
      { name: 'Retail Portfolio', noi: 25, capRate: 7.0 },
      { name: 'Multifamily', noi: 20, capRate: 5.0 },
    ],
    cashAndEquivalents: 50,
    otherAssets: 30,
    totalDebt: 800,
    preferredEquity: 50,
    minorityInterest: 20,
    sharesOutstanding: 100,
    currentPrice: 25,
  });

  const [result, setResult] = useState<NAVResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssetChange = (index: number, field: keyof Asset, value: string | number) => {
    setInputs(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) =>
        i === index ? { ...asset, [field]: value } : asset
      ),
    }));
  };

  const addAsset = () => {
    setInputs(prev => ({
      ...prev,
      assets: [...prev.assets, { name: 'New Asset', noi: 0, capRate: 6.0 }],
    }));
  };

  const removeAsset = (index: number) => {
    setInputs(prev => ({
      ...prev,
      assets: prev.assets.filter((_, i) => i !== index),
    }));
  };

  const handleInputChange = (field: keyof Omit<NAVInputs, 'assets'>, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/industry/nav/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assets: inputs.assets.map(a => ({
            name: a.name,
            noi: a.noi,
            cap_rate: a.capRate / 100,
          })),
          cash_and_equivalents: inputs.cashAndEquivalents,
          other_assets: inputs.otherAssets,
          total_debt: inputs.totalDebt,
          preferred_equity: inputs.preferredEquity,
          minority_interest: inputs.minorityInterest,
          shares_outstanding: inputs.sharesOutstanding,
          current_price: inputs.currentPrice,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResult(data);
    } catch {
      // Fallback calculation
      const assetValues = inputs.assets.map(a => ({
        name: a.name,
        value: a.noi / (a.capRate / 100),
      }));

      const grossAssetValue = assetValues.reduce((sum, a) => sum + a.value, 0) +
        inputs.cashAndEquivalents + inputs.otherAssets;

      const totalLiabilities = inputs.totalDebt + inputs.preferredEquity + inputs.minorityInterest;
      const nav = grossAssetValue - totalLiabilities;
      const navPerShare = nav / inputs.sharesOutstanding;
      const totalNOI = inputs.assets.reduce((sum, a) => sum + a.noi, 0);

      setResult({
        gross_asset_value: grossAssetValue,
        total_liabilities: totalLiabilities,
        net_asset_value: nav,
        nav_per_share: navPerShare,
        premium_discount: ((inputs.currentPrice / navPerShare) - 1) * 100,
        implied_cap_rate: (totalNOI / (inputs.currentPrice * inputs.sharesOutstanding + inputs.totalDebt)) * 100,
        asset_breakdown: assetValues.map(a => ({
          name: a.name,
          value: a.value,
          percentage: (a.value / grossAssetValue) * 100,
        })),
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputs]);

  const formatCurrency = (val: number) => `$${val.toFixed(0)}M`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">NAV Analysis</h1>
          <p className="text-gray-500 mt-1">Net Asset Value and Sum-of-the-Parts valuation</p>
        </div>
        <LoadingButton
          isLoading={isLoading}
          onClick={handleAnalyze}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Calculate NAV
        </LoadingButton>
      </div>

      {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Asset Portfolio</h2>
            <button
              onClick={addAsset}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              + Add Asset
            </button>
          </div>
          <div className="space-y-3">
            {inputs.assets.map((asset, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <input
                    type="text"
                    value={asset.name}
                    onChange={(e) => handleAssetChange(idx, 'name', e.target.value)}
                    className="font-medium text-gray-900 bg-transparent border-none focus:outline-none"
                  />
                  <button
                    onClick={() => removeAsset(idx)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">NOI ($M)</label>
                    <input
                      type="number"
                      value={asset.noi}
                      onChange={(e) => handleAssetChange(idx, 'noi', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Cap Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={asset.capRate}
                      onChange={(e) => handleAssetChange(idx, 'capRate', parseFloat(e.target.value))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-2 text-right">
                  <span className="text-sm text-gray-500">Implied Value: </span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(asset.noi / (asset.capRate / 100))}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Other Assets */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Other Assets</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cash ($M)</label>
                <input
                  type="number"
                  value={inputs.cashAndEquivalents}
                  onChange={(e) => handleInputChange('cashAndEquivalents', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Other Assets ($M)</label>
                <input
                  type="number"
                  value={inputs.otherAssets}
                  onChange={(e) => handleInputChange('otherAssets', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Liabilities */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Liabilities</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Total Debt ($M)</label>
                <input
                  type="number"
                  value={inputs.totalDebt}
                  onChange={(e) => handleInputChange('totalDebt', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Preferred ($M)</label>
                <input
                  type="number"
                  value={inputs.preferredEquity}
                  onChange={(e) => handleInputChange('preferredEquity', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Minority Int ($M)</label>
                <input
                  type="number"
                  value={inputs.minorityInterest}
                  onChange={(e) => handleInputChange('minorityInterest', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Market */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Market Data</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Shares (M)</label>
                <input
                  type="number"
                  value={inputs.sharesOutstanding}
                  onChange={(e) => handleInputChange('sharesOutstanding', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Current Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.currentPrice}
                  onChange={(e) => handleInputChange('currentPrice', parseFloat(e.target.value))}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* NAV Summary */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 bg-teal-600 rounded-t-xl">
              <h2 className="text-lg font-semibold text-white">NAV Summary</h2>
            </div>
            <div className="p-6">
              {result ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Asset Value</span>
                      <span className="font-semibold">{formatCurrency(result.gross_asset_value)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Less: Total Liabilities</span>
                      <span className="font-semibold text-red-600">({formatCurrency(result.total_liabilities)})</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">Net Asset Value</span>
                      <span className="text-xl font-bold text-teal-600">{formatCurrency(result.net_asset_value)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-teal-50 rounded-lg text-center">
                      <p className="text-sm text-teal-600">NAV per Share</p>
                      <p className="text-2xl font-bold text-teal-700">${result.nav_per_share.toFixed(2)}</p>
                    </div>
                    <div className={`p-4 rounded-lg text-center ${result.premium_discount >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                      <p className={`text-sm ${result.premium_discount >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {result.premium_discount >= 0 ? 'Premium' : 'Discount'} to NAV
                      </p>
                      <p className={`text-2xl font-bold ${result.premium_discount >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                        {result.premium_discount >= 0 ? '+' : ''}{result.premium_discount.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Implied Cap Rate</span>
                      <span className="font-semibold">{result.implied_cap_rate.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Click "Calculate NAV" to see results</p>
                </div>
              )}
            </div>
          </div>

          {/* Asset Breakdown */}
          {result && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Breakdown</h2>
              <div className="space-y-3">
                {result.asset_breakdown.map((asset, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{asset.name}</span>
                      <span className="font-medium">{formatCurrency(asset.value)} ({asset.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full"
                        style={{ width: `${asset.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
