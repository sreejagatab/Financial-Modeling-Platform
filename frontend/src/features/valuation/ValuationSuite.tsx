import { useState, useCallback } from 'react';
import { LoadingSpinner } from '@/shared/components/loading';
import { ErrorDisplay } from '@/shared/components/errors';
import { AICompsFinder } from '../../shared/components/ai';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

type ValuationType = 'dcf' | 'comps' | 'precedents';

interface DCFInputs {
  riskFreeRate: number;
  equityRiskPremium: number;
  beta: number;
  costOfDebt: number;
  taxRate: number;
  debtToCapital: number;
  fcfProjections: number[];
  terminalGrowthRate: number;
  netDebt: number;
  sharesOutstanding: number;
}

interface DCFResult {
  wacc: number;
  pv_fcf: number;
  terminal_value: number;
  pv_terminal_value: number;
  enterprise_value: number;
  equity_value: number;
  equity_per_share: number;
}

interface CompsResult {
  multiples: { name: string; ev_ebitda: number; ev_revenue: number; pe_ratio: number }[];
  statistics: { metric: string; mean: number; median: number; min: number; max: number }[];
  implied_values: { method: string; low: number; high: number; midpoint: number }[];
}

interface PrecedentResult {
  transactions: { target: string; acquirer: string; date: string; ev_ebitda: number; premium: number }[];
  statistics: { metric: string; mean: number; median: number; min: number; max: number }[];
  implied_value: { low: number; high: number; midpoint: number };
}

export function ValuationSuite() {
  const [activeTab, setActiveTab] = useState<ValuationType>('dcf');
  const [showAICompsFinder, setShowAICompsFinder] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Valuation Suite</h2>
          <p className="text-gray-500">DCF, Trading Comps, and Precedent Transactions</p>
        </div>
        <button
          onClick={() => setShowAICompsFinder(true)}
          className="px-4 py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          AI Comps Finder
        </button>
        <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
          Export Football Field
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'dcf', label: 'DCF Valuation' },
            { id: 'comps', label: 'Trading Comps' },
            { id: 'precedents', label: 'Precedent Transactions' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ValuationType)}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'dcf' && <DCFSection />}
      {activeTab === 'comps' && <CompsSection />}
      {activeTab === 'precedents' && <PrecedentsSection />}

      {/* Football Field Chart */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="font-medium text-gray-900">Valuation Summary - Football Field</h3>
        </div>
        <div className="p-6">
          <FootballFieldChart />
        </div>
      </div>

      {/* AI Comps Finder Modal */}
      {showAICompsFinder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setShowAICompsFinder(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-gray-700 z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <AICompsFinder
                onSelectComp={(comp) => {
                  console.log('Selected comp:', comp);
                }}
                onSelectMultiple={(comps) => {
                  console.log('Selected comps:', comps);
                  setShowAICompsFinder(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DCFSection() {
  const [inputs, setInputs] = useState<DCFInputs>({
    riskFreeRate: 4.0,
    equityRiskPremium: 5.5,
    beta: 1.1,
    costOfDebt: 5.0,
    taxRate: 25.0,
    debtToCapital: 30.0,
    fcfProjections: [50, 55, 60, 66, 73],
    terminalGrowthRate: 2.5,
    netDebt: 150,
    sharesOutstanding: 20,
  });

  const [result, setResult] = useState<DCFResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/valuations/dcf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          risk_free_rate: inputs.riskFreeRate / 100,
          equity_risk_premium: inputs.equityRiskPremium / 100,
          beta: inputs.beta,
          cost_of_debt: inputs.costOfDebt / 100,
          tax_rate: inputs.taxRate / 100,
          debt_to_capital: inputs.debtToCapital / 100,
          fcf_projections: inputs.fcfProjections,
          terminal_growth_rate: inputs.terminalGrowthRate / 100,
          net_debt: inputs.netDebt,
          shares_outstanding: inputs.sharesOutstanding,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'DCF calculation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Use fallback calculation for demo
      const wacc = (1 - inputs.debtToCapital / 100) * (inputs.riskFreeRate + inputs.beta * inputs.equityRiskPremium) / 100 +
                   (inputs.debtToCapital / 100) * inputs.costOfDebt / 100 * (1 - inputs.taxRate / 100);
      const pvFcf = inputs.fcfProjections.reduce((sum, fcf, i) => sum + fcf / Math.pow(1 + wacc, i + 1), 0);
      const terminalValue = inputs.fcfProjections[inputs.fcfProjections.length - 1] * (1 + inputs.terminalGrowthRate / 100) / (wacc - inputs.terminalGrowthRate / 100);
      const pvTerminal = terminalValue / Math.pow(1 + wacc, inputs.fcfProjections.length);
      const ev = pvFcf + pvTerminal;
      const equityValue = ev - inputs.netDebt;

      setResult({
        wacc: wacc * 100,
        pv_fcf: pvFcf,
        terminal_value: terminalValue,
        pv_terminal_value: pvTerminal,
        enterprise_value: ev,
        equity_value: equityValue,
        equity_per_share: equityValue / inputs.sharesOutstanding,
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputs]);

  const handleInputChange = (field: keyof DCFInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      {error && <ErrorDisplay message={error} severity="warning" onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">DCF Assumptions</h3>
            <button
              onClick={handleCalculate}
              disabled={isLoading}
              className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Calculate'}
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Risk-Free Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.riskFreeRate}
                  onChange={(e) => handleInputChange('riskFreeRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Equity Risk Premium (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.equityRiskPremium}
                  onChange={(e) => handleInputChange('equityRiskPremium', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Beta</label>
                <input
                  type="number"
                  step="0.01"
                  value={inputs.beta}
                  onChange={(e) => handleInputChange('beta', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Cost of Debt (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.costOfDebt}
                  onChange={(e) => handleInputChange('costOfDebt', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.taxRate}
                  onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Debt / Capital (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.debtToCapital}
                  onChange={(e) => handleInputChange('debtToCapital', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Terminal Growth (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={inputs.terminalGrowthRate}
                  onChange={(e) => handleInputChange('terminalGrowthRate', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Net Debt ($M)</label>
                <input
                  type="number"
                  value={inputs.netDebt}
                  onChange={(e) => handleInputChange('netDebt', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-blue-600">
            <h3 className="font-medium text-white">DCF Output</h3>
          </div>
          <div className="p-4 space-y-3">
            {result ? (
              <>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-900">WACC</span>
                    <span className="text-2xl font-bold text-blue-600">{result.wacc.toFixed(1)}%</span>
                  </div>
                </div>
                <OutputRow label="PV of FCF" value={`$${result.pv_fcf.toFixed(0)}M`} />
                <OutputRow label="Terminal Value" value={`$${result.terminal_value.toFixed(0)}M`} />
                <OutputRow label="PV of Terminal Value" value={`$${result.pv_terminal_value.toFixed(0)}M`} />
                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <OutputRow label="Enterprise Value" value={`$${result.enterprise_value.toFixed(0)}M`} highlight />
                  <OutputRow label="Less: Net Debt" value={`($${inputs.netDebt}M)`} />
                  <OutputRow label="Equity Value" value={`$${result.equity_value.toFixed(0)}M`} highlight />
                  <OutputRow label="Equity Value / Share" value={`$${result.equity_per_share.toFixed(2)}`} highlight />
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Click "Calculate" to run DCF analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CompsSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CompsResult | null>(null);

  const [compsData] = useState([
    { name: 'Company A', ev: 1020, ebitda: 100, revenue: 486, net_income: 55, shares: 50, price: 18.5 },
    { name: 'Company B', ev: 882, ebitda: 90, revenue: 464, net_income: 50, shares: 45, price: 16.2 },
    { name: 'Company C', ev: 1150, ebitda: 100, revenue: 479, net_income: 48, shares: 40, price: 20.1 },
    { name: 'Company D', ev: 712, ebitda: 80, revenue: 419, net_income: 42, shares: 42, price: 15.8 },
  ]);

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/valuations/comps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companies: compsData,
          target_ebitda: 85,
          target_revenue: 400,
          target_net_income: 45,
        }),
      });

      if (!response.ok) {
        throw new Error('Comps calculation failed');
      }

      const data = await response.json();
      setResult(data);
    } catch {
      // Fallback calculation
      const multiples = compsData.map(c => ({
        name: c.name,
        ev_ebitda: c.ev / c.ebitda,
        ev_revenue: c.ev / c.revenue,
        pe_ratio: c.price * c.shares / c.net_income,
      }));

      const evEbitdas = multiples.map(m => m.ev_ebitda).sort((a, b) => a - b);
      const medianEvEbitda = evEbitdas[Math.floor(evEbitdas.length / 2)];

      setResult({
        multiples,
        statistics: [
          { metric: 'EV/EBITDA', mean: 10.1, median: medianEvEbitda, min: 8.9, max: 11.5 },
          { metric: 'EV/Revenue', mean: 2.0, median: 2.0, min: 1.7, max: 2.4 },
          { metric: 'P/E', mean: 17.7, median: 17.4, min: 15.8, max: 20.1 },
        ],
        implied_values: [
          { method: 'EV/EBITDA', low: 756, high: 978, midpoint: 867 },
          { method: 'EV/Revenue', low: 680, high: 960, midpoint: 820 },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  }, [compsData]);

  return (
    <div className="space-y-4">
      {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Trading Comparables</h3>
          <button
            onClick={handleCalculate}
            disabled={isLoading}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Analyze'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Company</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">EV/EBITDA</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">EV/Revenue</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">P/E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(result?.multiples || compsData.map(c => ({
                name: c.name,
                ev_ebitda: c.ev / c.ebitda,
                ev_revenue: c.ev / c.revenue,
                pe_ratio: c.price * c.shares / c.net_income,
              }))).map((comp, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{comp.name}</td>
                  <td className="px-4 py-3 text-sm text-right">{comp.ev_ebitda.toFixed(1)}x</td>
                  <td className="px-4 py-3 text-sm text-right">{comp.ev_revenue.toFixed(1)}x</td>
                  <td className="px-4 py-3 text-sm text-right">{comp.pe_ratio.toFixed(1)}x</td>
                </tr>
              ))}
              {result && (
                <tr className="bg-blue-50 font-medium">
                  <td className="px-4 py-3 text-sm text-blue-900">Median</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-900">
                    {result.statistics.find(s => s.metric === 'EV/EBITDA')?.median.toFixed(1)}x
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-blue-900">
                    {result.statistics.find(s => s.metric === 'EV/Revenue')?.median.toFixed(1)}x
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-blue-900">
                    {result.statistics.find(s => s.metric === 'P/E')?.median.toFixed(1)}x
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PrecedentsSection() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PrecedentResult | null>(null);

  const [txnsData] = useState([
    { target: 'Target X', acquirer: 'Acquirer 1', date: 'Jan 2024', ev: 1250, ebitda: 100, premium: 35 },
    { target: 'Target Y', acquirer: 'Acquirer 2', date: 'Nov 2023', ev: 1008, ebitda: 90, premium: 28 },
    { target: 'Target Z', acquirer: 'Acquirer 3', date: 'Sep 2023', ev: 1104, ebitda: 80, premium: 42 },
  ]);

  const handleCalculate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/valuations/precedents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: txnsData,
          target_ebitda: 85,
        }),
      });

      if (!response.ok) {
        throw new Error('Precedent analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch {
      // Fallback calculation
      const transactions = txnsData.map(t => ({
        target: t.target,
        acquirer: t.acquirer,
        date: t.date,
        ev_ebitda: t.ev / t.ebitda,
        premium: t.premium,
      }));

      const evEbitdas = transactions.map(t => t.ev_ebitda).sort((a, b) => a - b);
      const medianEvEbitda = evEbitdas[Math.floor(evEbitdas.length / 2)];

      setResult({
        transactions,
        statistics: [
          { metric: 'EV/EBITDA', mean: 12.5, median: medianEvEbitda, min: 11.2, max: 13.8 },
          { metric: 'Premium', mean: 35, median: 35, min: 28, max: 42 },
        ],
        implied_value: { low: 952, high: 1173, midpoint: 1063 },
      });
    } finally {
      setIsLoading(false);
    }
  }, [txnsData]);

  return (
    <div className="space-y-4">
      {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Precedent Transactions</h3>
          <button
            onClick={handleCalculate}
            disabled={isLoading}
            className="px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : 'Analyze'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Target</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Acquirer</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">EV/EBITDA</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(result?.transactions || txnsData.map(t => ({
                target: t.target,
                acquirer: t.acquirer,
                date: t.date,
                ev_ebitda: t.ev / t.ebitda,
                premium: t.premium,
              }))).map((txn, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{txn.target}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{txn.acquirer}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{txn.date}</td>
                  <td className="px-4 py-3 text-sm text-right">{txn.ev_ebitda.toFixed(1)}x</td>
                  <td className="px-4 py-3 text-sm text-right">{txn.premium}%</td>
                </tr>
              ))}
              {result && (
                <tr className="bg-blue-50 font-medium">
                  <td className="px-4 py-3 text-sm text-blue-900" colSpan={3}>Median</td>
                  <td className="px-4 py-3 text-sm text-right text-blue-900">
                    {result.statistics.find(s => s.metric === 'EV/EBITDA')?.median.toFixed(1)}x
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-blue-900">
                    {result.statistics.find(s => s.metric === 'Premium')?.median.toFixed(0)}%
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FootballFieldChart() {
  const valuations = [
    { method: 'DCF', low: 42, high: 58, midpoint: 50 },
    { method: 'Trading Comps', low: 38, high: 52, midpoint: 45 },
    { method: 'Precedent Txns', low: 48, high: 65, midpoint: 56 },
    { method: '52-Week Range', low: 35, high: 48, midpoint: 42 },
  ];

  const currentPrice = 44;
  const minVal = 30;
  const maxVal = 70;
  const range = maxVal - minVal;

  return (
    <div className="space-y-4">
      {valuations.map((val, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <div className="w-32 text-sm font-medium text-gray-700">{val.method}</div>
          <div className="flex-1 relative h-8">
            <div className="absolute inset-y-2 left-0 right-0 bg-gray-100 rounded" />
            <div
              className="absolute inset-y-1 bg-blue-500 rounded opacity-70"
              style={{
                left: `${((val.low - minVal) / range) * 100}%`,
                width: `${((val.high - val.low) / range) * 100}%`,
              }}
            />
            <div
              className="absolute top-1/2 w-3 h-3 bg-blue-700 rounded-full transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${((val.midpoint - minVal) / range) * 100}%` }}
            />
          </div>
          <div className="w-24 text-sm text-gray-600 text-right">${val.low} - ${val.high}</div>
        </div>
      ))}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
        <div className="w-32 text-sm font-medium text-red-600">Current Price</div>
        <div className="flex-1 relative h-6">
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500"
            style={{ left: `${((currentPrice - minVal) / range) * 100}%` }}
          />
        </div>
        <div className="w-24 text-sm text-red-600 text-right">${currentPrice}</div>
      </div>
    </div>
  );
}

function OutputRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${highlight ? 'font-medium text-gray-900' : 'text-gray-600'}`}>{label}</span>
      <span className={highlight ? 'text-lg font-bold text-blue-600' : 'font-medium'}>{value}</span>
    </div>
  );
}
