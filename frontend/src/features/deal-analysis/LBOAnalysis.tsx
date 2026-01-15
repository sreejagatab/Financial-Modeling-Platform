import { useState } from 'react';

// @ts-ignore
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

interface LBOInputs {
  enterpriseValue: number;
  equityPurchasePrice: number;
  seniorDebtAmount: number;
  seniorDebtRate: number;
  sponsorEquity: number;
  projectionYears: number;
  revenueBase: number;
  revenueGrowthRate: number;
  ebitdaMargin: number;
  exitYear: number;
  exitMultiple: number;
}

interface LBOOutputs {
  irr: number;
  moic: number;
  totalEquityInvested: number;
  totalEquityReturned: number;
  entryEvEbitda: number;
  exitEvEbitda: number;
  equityContributionPercent: number;
  exitEquityValue: number;
  exitDebtBalance: number;
  sources: Record<string, number>;
  uses: Record<string, number>;
  years: number[];
  revenues: number[];
  ebitda: number[];
  freeCashFlow: number[];
  debtBalances: number[];
}

const defaultInputs: LBOInputs = {
  enterpriseValue: 500,
  equityPurchasePrice: 450,
  seniorDebtAmount: 250,
  seniorDebtRate: 6.0,
  sponsorEquity: 200,
  projectionYears: 5,
  revenueBase: 300,
  revenueGrowthRate: 5.0,
  ebitdaMargin: 20.0,
  exitYear: 5,
  exitMultiple: 8.0,
};

// Icons
const CalculatorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

export function LBOAnalysis() {
  const [inputs, setInputs] = useState<LBOInputs>(defaultInputs);
  const [outputs, setOutputs] = useState<LBOOutputs | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inputs' | 'sensitivity'>('inputs');

  const handleInputChange = (key: keyof LBOInputs, value: string) => {
    setInputs((prev) => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    setError(null);

    try {
      // Build growth rates and margins arrays
      const growthRates = Array(inputs.projectionYears).fill(inputs.revenueGrowthRate / 100);
      const margins = Array(inputs.projectionYears).fill(inputs.ebitdaMargin / 100);

      const response = await fetch(`${API_URL}/api/v1/models/lbo/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enterprise_value: inputs.enterpriseValue,
          equity_purchase_price: inputs.equityPurchasePrice,
          senior_debt_amount: inputs.seniorDebtAmount,
          senior_debt_rate: inputs.seniorDebtRate / 100,
          sponsor_equity: inputs.sponsorEquity,
          projection_years: inputs.projectionYears,
          revenue_base: inputs.revenueBase,
          revenue_growth_rates: growthRates,
          ebitda_margins: margins,
          exit_year: inputs.exitYear,
          exit_multiple: inputs.exitMultiple,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate LBO');
      }

      const data = await response.json();

      if (data.success) {
        setOutputs({
          irr: data.outputs.irr * 100,
          moic: data.outputs.moic,
          totalEquityInvested: data.outputs.total_equity_invested,
          totalEquityReturned: data.outputs.total_equity_returned,
          entryEvEbitda: data.outputs.entry_ev_ebitda,
          exitEvEbitda: data.outputs.exit_multiple || inputs.exitMultiple,
          equityContributionPercent: data.outputs.equity_contribution_percent * 100,
          exitEquityValue: data.outputs.exit_equity_value,
          exitDebtBalance: data.outputs.exit_debt_balance,
          sources: data.outputs.sources,
          uses: data.outputs.uses,
          years: data.outputs.years,
          revenues: data.outputs.revenues,
          ebitda: data.outputs.ebitda,
          freeCashFlow: data.outputs.free_cash_flow,
          debtBalances: data.outputs.debt_balances,
        });
      } else {
        setError('Calculation failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">LBO Analysis</h2>
          <p className="text-gray-500 mt-1">Leveraged buyout returns analysis with real-time calculations</p>
        </div>
        <button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {isCalculating ? <RefreshIcon /> : <CalculatorIcon />}
          {isCalculating ? 'Calculating...' : 'Calculate Returns'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'inputs', label: 'Model Inputs' },
            { id: 'sensitivity', label: 'Sensitivity Analysis' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'inputs' | 'sensitivity')}
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

      {activeTab === 'inputs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction */}
            <InputSection title="Transaction" icon="💼">
              <InputField
                label="Enterprise Value"
                value={inputs.enterpriseValue}
                onChange={(v) => handleInputChange('enterpriseValue', v)}
                suffix="$M"
              />
              <InputField
                label="Equity Purchase Price"
                value={inputs.equityPurchasePrice}
                onChange={(v) => handleInputChange('equityPurchasePrice', v)}
                suffix="$M"
              />
            </InputSection>

            {/* Capital Structure */}
            <InputSection title="Capital Structure" icon="🏦">
              <InputField
                label="Senior Debt"
                value={inputs.seniorDebtAmount}
                onChange={(v) => handleInputChange('seniorDebtAmount', v)}
                suffix="$M"
              />
              <InputField
                label="Senior Debt Rate"
                value={inputs.seniorDebtRate}
                onChange={(v) => handleInputChange('seniorDebtRate', v)}
                suffix="%"
              />
              <InputField
                label="Sponsor Equity"
                value={inputs.sponsorEquity}
                onChange={(v) => handleInputChange('sponsorEquity', v)}
                suffix="$M"
              />
            </InputSection>

            {/* Operating Assumptions */}
            <InputSection title="Operating Assumptions" icon="📊">
              <InputField
                label="Base Revenue"
                value={inputs.revenueBase}
                onChange={(v) => handleInputChange('revenueBase', v)}
                suffix="$M"
              />
              <InputField
                label="Revenue Growth"
                value={inputs.revenueGrowthRate}
                onChange={(v) => handleInputChange('revenueGrowthRate', v)}
                suffix="%"
              />
              <InputField
                label="EBITDA Margin"
                value={inputs.ebitdaMargin}
                onChange={(v) => handleInputChange('ebitdaMargin', v)}
                suffix="%"
              />
              <InputField
                label="Projection Years"
                value={inputs.projectionYears}
                onChange={(v) => handleInputChange('projectionYears', v)}
                suffix="yrs"
              />
            </InputSection>

            {/* Exit */}
            <InputSection title="Exit Assumptions" icon="🚀">
              <InputField
                label="Exit Year"
                value={inputs.exitYear}
                onChange={(v) => handleInputChange('exitYear', v)}
                suffix="yr"
              />
              <InputField
                label="Exit Multiple (EV/EBITDA)"
                value={inputs.exitMultiple}
                onChange={(v) => handleInputChange('exitMultiple', v)}
                suffix="x"
              />
            </InputSection>
          </div>

          {/* Outputs */}
          <div className="space-y-6">
            {/* Key Returns */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700">
                <h3 className="text-lg font-semibold text-white">Returns Summary</h3>
              </div>
              <div className="p-5 space-y-4">
                <OutputMetric
                  label="IRR"
                  value={outputs ? `${outputs.irr.toFixed(1)}%` : '--'}
                  highlight
                  color={outputs && outputs.irr >= 20 ? 'green' : outputs && outputs.irr >= 15 ? 'yellow' : 'red'}
                />
                <OutputMetric
                  label="MOIC"
                  value={outputs ? `${outputs.moic.toFixed(2)}x` : '--'}
                  highlight
                />
                <div className="border-t border-gray-100 pt-4">
                  <OutputMetric
                    label="Total Equity Invested"
                    value={outputs ? `$${outputs.totalEquityInvested.toFixed(0)}M` : '--'}
                  />
                  <OutputMetric
                    label="Exit Equity Value"
                    value={outputs ? `$${outputs.exitEquityValue.toFixed(0)}M` : '--'}
                  />
                </div>
              </div>
            </div>

            {/* Entry/Exit Metrics */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Entry / Exit</h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Entry EV/EBITDA</span>
                  <span className="font-medium">{outputs ? `${outputs.entryEvEbitda.toFixed(1)}x` : '--'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Exit EV/EBITDA</span>
                  <span className="font-medium">{outputs ? `${outputs.exitEvEbitda.toFixed(1)}x` : '--'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Equity Contribution</span>
                  <span className="font-medium">{outputs ? `${outputs.equityContributionPercent.toFixed(1)}%` : '--'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Exit Debt Balance</span>
                  <span className="font-medium">{outputs ? `$${outputs.exitDebtBalance.toFixed(0)}M` : '--'}</span>
                </div>
              </div>
            </div>

            {/* Sources & Uses */}
            {outputs && (
              <div className="bg-white rounded-xl border border-gray-200">
                <div className="px-5 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Sources & Uses</h3>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Sources</h4>
                      {Object.entries(outputs.sources).map(([key, value]) => (
                        value > 0 && (
                          <div key={key} className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">{key}</span>
                            <span className="font-medium">${value.toFixed(0)}M</span>
                          </div>
                        )
                      ))}
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Uses</h4>
                      {Object.entries(outputs.uses).map(([key, value]) => (
                        value > 0 && (
                          <div key={key} className="flex justify-between text-sm py-1">
                            <span className="text-gray-600">{key}</span>
                            <span className="font-medium">${value.toFixed(0)}M</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'sensitivity' && (
        <SensitivityTable inputs={inputs} />
      )}

      {/* Projections Table */}
      {outputs && activeTab === 'inputs' && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Financial Projections</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metric</th>
                  {outputs.years.map((year) => (
                    <th key={year} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Year {year}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Revenue</td>
                  {outputs.revenues.map((rev, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-right">${rev.toFixed(1)}M</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">EBITDA</td>
                  {outputs.ebitda.map((eb, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-right">${eb.toFixed(1)}M</td>
                  ))}
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">Free Cash Flow</td>
                  {outputs.freeCashFlow.map((fcf, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-right">${fcf.toFixed(1)}M</td>
                  ))}
                </tr>
                <tr className="bg-blue-50">
                  <td className="px-4 py-3 text-sm font-medium text-blue-900">Debt Balance</td>
                  {outputs.debtBalances.map((debt, idx) => (
                    <td key={idx} className="px-4 py-3 text-sm text-right font-medium text-blue-900">
                      ${debt.toFixed(1)}M
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function SensitivityTable({ inputs }: { inputs: LBOInputs }) {
  const [results, setResults] = useState<number[][] | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const exitMultiples = [6.0, 7.0, 8.0, 9.0, 10.0];
  const exitYears = [3, 4, 5, 6, 7];

  const runSensitivity = async () => {
    setIsCalculating(true);
    const matrix: number[][] = [];

    for (const year of exitYears) {
      const row: number[] = [];
      for (const multiple of exitMultiples) {
        try {
          const growthRates = Array(inputs.projectionYears).fill(inputs.revenueGrowthRate / 100);
          const margins = Array(inputs.projectionYears).fill(inputs.ebitdaMargin / 100);

          const response = await fetch(`${API_URL}/api/v1/models/lbo/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              enterprise_value: inputs.enterpriseValue,
              equity_purchase_price: inputs.equityPurchasePrice,
              senior_debt_amount: inputs.seniorDebtAmount,
              senior_debt_rate: inputs.seniorDebtRate / 100,
              sponsor_equity: inputs.sponsorEquity,
              projection_years: Math.max(inputs.projectionYears, year),
              revenue_base: inputs.revenueBase,
              revenue_growth_rates: growthRates,
              ebitda_margins: margins,
              exit_year: year,
              exit_multiple: multiple,
            }),
          });

          const data = await response.json();
          row.push(data.success ? data.outputs.irr * 100 : 0);
        } catch {
          row.push(0);
        }
      }
      matrix.push(row);
    }

    setResults(matrix);
    setIsCalculating(false);
  };

  const getColor = (irr: number) => {
    if (irr >= 25) return 'bg-green-100 text-green-800';
    if (irr >= 20) return 'bg-green-50 text-green-700';
    if (irr >= 15) return 'bg-yellow-50 text-yellow-700';
    if (irr >= 10) return 'bg-orange-50 text-orange-700';
    return 'bg-red-50 text-red-700';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">IRR Sensitivity Matrix</h3>
          <p className="text-sm text-gray-500 mt-1">Exit Year vs Exit Multiple</p>
        </div>
        <button
          onClick={runSensitivity}
          disabled={isCalculating}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isCalculating ? 'Calculating...' : 'Run Sensitivity'}
        </button>
      </div>
      <div className="p-5">
        {results ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Exit Year \ Multiple
                  </th>
                  {exitMultiples.map((m) => (
                    <th key={m} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      {m.toFixed(1)}x
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {exitYears.map((year, yIdx) => (
                  <tr key={year}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Year {year}</td>
                    {exitMultiples.map((_, mIdx) => (
                      <td key={mIdx} className="px-4 py-3 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getColor(results[yIdx][mIdx])}`}>
                          {results[yIdx][mIdx].toFixed(1)}%
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="text-lg font-medium">Sensitivity Analysis</p>
              <p className="text-sm mt-1">Click "Run Sensitivity" to generate the matrix</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InputSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-5 grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  suffix?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
        />
        {suffix && (
          <span className="ml-2 text-sm text-gray-500 w-10">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function OutputMetric({
  label,
  value,
  highlight,
  color,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  color?: 'green' | 'yellow' | 'red';
}) {
  const colorClasses = {
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span
        className={`font-bold ${
          highlight
            ? `text-2xl ${color ? colorClasses[color] : 'text-blue-600'}`
            : 'text-lg text-gray-900'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
