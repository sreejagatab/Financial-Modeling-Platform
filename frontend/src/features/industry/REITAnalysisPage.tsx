import { useState, useCallback } from 'react';
import { LoadingButton } from '@/shared/components/loading';
import { ErrorDisplay } from '@/shared/components/errors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

interface REITInputs {
  netIncome: number;
  depreciation: number;
  gainsOnSales: number;
  recurringCapex: number;
  straightLineRent: number;
  sharesOutstanding: number;
  currentPrice: number;
  annualDividend: number;
  totalAssets: number;
  totalDebt: number;
}

interface REITResult {
  ffo: number;
  ffo_per_share: number;
  affo: number;
  affo_per_share: number;
  price_to_ffo: number;
  price_to_affo: number;
  dividend_yield: number;
  ffo_payout_ratio: number;
  affo_payout_ratio: number;
  nav_per_share: number;
  premium_to_nav: number;
  debt_to_assets: number;
}

export function REITAnalysisPage() {
  const [inputs, setInputs] = useState<REITInputs>({
    netIncome: 100,
    depreciation: 50,
    gainsOnSales: 5,
    recurringCapex: 15,
    straightLineRent: 3,
    sharesOutstanding: 50,
    currentPrice: 45,
    annualDividend: 2.5,
    totalAssets: 2000,
    totalDebt: 800,
  });

  const [result, setResult] = useState<REITResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof REITInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/industry/reit/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          net_income: inputs.netIncome,
          depreciation: inputs.depreciation,
          gains_on_sales: inputs.gainsOnSales,
          recurring_capex: inputs.recurringCapex,
          straight_line_rent: inputs.straightLineRent,
          shares_outstanding: inputs.sharesOutstanding,
          current_price: inputs.currentPrice,
          annual_dividend: inputs.annualDividend,
          total_assets: inputs.totalAssets,
          total_debt: inputs.totalDebt,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResult(data);
    } catch {
      // Fallback calculation
      const ffo = inputs.netIncome + inputs.depreciation - inputs.gainsOnSales;
      const affo = ffo - inputs.recurringCapex - inputs.straightLineRent;
      const ffoPerShare = ffo / inputs.sharesOutstanding;
      const affoPerShare = affo / inputs.sharesOutstanding;
      const navPerShare = (inputs.totalAssets - inputs.totalDebt) / inputs.sharesOutstanding;

      setResult({
        ffo,
        ffo_per_share: ffoPerShare,
        affo,
        affo_per_share: affoPerShare,
        price_to_ffo: inputs.currentPrice / ffoPerShare,
        price_to_affo: inputs.currentPrice / affoPerShare,
        dividend_yield: (inputs.annualDividend / inputs.currentPrice) * 100,
        ffo_payout_ratio: (inputs.annualDividend * inputs.sharesOutstanding / ffo) * 100,
        affo_payout_ratio: (inputs.annualDividend * inputs.sharesOutstanding / affo) * 100,
        nav_per_share: navPerShare,
        premium_to_nav: ((inputs.currentPrice / navPerShare) - 1) * 100,
        debt_to_assets: (inputs.totalDebt / inputs.totalAssets) * 100,
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputs]);

  const formatCurrency = (val: number) => `$${val.toFixed(1)}M`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">REIT Analysis</h1>
          <p className="text-gray-500 mt-1">FFO, AFFO, and NAV calculation</p>
        </div>
        <LoadingButton
          isLoading={isLoading}
          onClick={handleAnalyze}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Calculate Metrics
        </LoadingButton>
      </div>

      {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income Inputs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Income Statement</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Net Income ($M)</label>
              <input
                type="number"
                value={inputs.netIncome}
                onChange={(e) => handleInputChange('netIncome', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Depreciation ($M)</label>
              <input
                type="number"
                value={inputs.depreciation}
                onChange={(e) => handleInputChange('depreciation', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gains on Sales ($M)</label>
              <input
                type="number"
                value={inputs.gainsOnSales}
                onChange={(e) => handleInputChange('gainsOnSales', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recurring CapEx ($M)</label>
              <input
                type="number"
                value={inputs.recurringCapex}
                onChange={(e) => handleInputChange('recurringCapex', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Straight-Line Rent Adj ($M)</label>
              <input
                type="number"
                value={inputs.straightLineRent}
                onChange={(e) => handleInputChange('straightLineRent', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Market Inputs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Market Data</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shares Outstanding (M)</label>
              <input
                type="number"
                value={inputs.sharesOutstanding}
                onChange={(e) => handleInputChange('sharesOutstanding', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={inputs.currentPrice}
                onChange={(e) => handleInputChange('currentPrice', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Dividend ($)</label>
              <input
                type="number"
                step="0.01"
                value={inputs.annualDividend}
                onChange={(e) => handleInputChange('annualDividend', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Assets ($M)</label>
              <input
                type="number"
                value={inputs.totalAssets}
                onChange={(e) => handleInputChange('totalAssets', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Debt ($M)</label>
              <input
                type="number"
                value={inputs.totalDebt}
                onChange={(e) => handleInputChange('totalDebt', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 bg-purple-600 rounded-t-xl">
            <h2 className="text-lg font-semibold text-white">REIT Metrics</h2>
          </div>
          <div className="p-6">
            {result ? (
              <div className="space-y-4">
                {/* FFO/AFFO */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Operating Metrics</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-xs text-purple-600">FFO</p>
                      <p className="text-lg font-bold text-purple-700">{formatCurrency(result.ffo)}</p>
                      <p className="text-xs text-gray-500">${result.ffo_per_share.toFixed(2)}/share</p>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg">
                      <p className="text-xs text-indigo-600">AFFO</p>
                      <p className="text-lg font-bold text-indigo-700">{formatCurrency(result.affo)}</p>
                      <p className="text-xs text-gray-500">${result.affo_per_share.toFixed(2)}/share</p>
                    </div>
                  </div>
                </div>

                {/* Valuation */}
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Valuation</h3>
                  <div className="flex justify-between">
                    <span className="text-gray-600">P/FFO</span>
                    <span className="font-semibold">{result.price_to_ffo.toFixed(1)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">P/AFFO</span>
                    <span className="font-semibold">{result.price_to_affo.toFixed(1)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">NAV per Share</span>
                    <span className="font-semibold">${result.nav_per_share.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Premium to NAV</span>
                    <span className={`font-semibold ${result.premium_to_nav >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {result.premium_to_nav >= 0 ? '+' : ''}{result.premium_to_nav.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Dividend */}
                <div className="space-y-2 pt-3 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase">Dividend</h3>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dividend Yield</span>
                    <span className="font-semibold text-green-600">{result.dividend_yield.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">FFO Payout Ratio</span>
                    <span className="font-semibold">{result.ffo_payout_ratio.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">AFFO Payout Ratio</span>
                    <span className="font-semibold">{result.affo_payout_ratio.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Leverage */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Debt / Assets</span>
                    <span className="font-semibold">{result.debt_to_assets.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Click "Calculate Metrics" to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
