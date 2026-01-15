import { useState, useCallback } from 'react';
import { LoadingButton } from '@/shared/components/loading';
import { ErrorDisplay } from '@/shared/components/errors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

interface SaleLeasebackInputs {
  propertyValue: number;
  capRate: number;
  leaseTermYears: number;
  annualRentEscalation: number;
  currentDebt: number;
  debtRate: number;
  currentEbitda: number;
  taxRate: number;
}

interface SaleLeasebackResult {
  sale_proceeds: number;
  annual_rent: number;
  net_debt_paydown: number;
  post_transaction_debt: number;
  rent_coverage_ratio: number;
  implied_rent_multiple: number;
  npv_rent_obligation: number;
  ebitdar: number;
  ebitdar_margin_impact: number;
}

export function SaleLeasebackPage() {
  const [inputs, setInputs] = useState<SaleLeasebackInputs>({
    propertyValue: 100,
    capRate: 6.5,
    leaseTermYears: 20,
    annualRentEscalation: 2.0,
    currentDebt: 80,
    debtRate: 5.0,
    currentEbitda: 50,
    taxRate: 25,
  });

  const [result, setResult] = useState<SaleLeasebackResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof SaleLeasebackInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleAnalyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/v1/industry/sale-leaseback/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_value: inputs.propertyValue,
          cap_rate: inputs.capRate / 100,
          lease_term_years: inputs.leaseTermYears,
          annual_rent_escalation: inputs.annualRentEscalation / 100,
          current_debt: inputs.currentDebt,
          debt_rate: inputs.debtRate / 100,
          current_ebitda: inputs.currentEbitda,
          tax_rate: inputs.taxRate / 100,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setResult(data);
    } catch {
      // Fallback calculation
      const annualRent = inputs.propertyValue * (inputs.capRate / 100);
      const netDebtPaydown = inputs.propertyValue - inputs.currentDebt;
      const rentCoverage = inputs.currentEbitda / annualRent;
      const ebitdar = inputs.currentEbitda + annualRent;

      setResult({
        sale_proceeds: inputs.propertyValue,
        annual_rent: annualRent,
        net_debt_paydown: netDebtPaydown > 0 ? netDebtPaydown : 0,
        post_transaction_debt: netDebtPaydown < 0 ? Math.abs(netDebtPaydown) : 0,
        rent_coverage_ratio: rentCoverage,
        implied_rent_multiple: inputs.propertyValue / annualRent,
        npv_rent_obligation: annualRent * inputs.leaseTermYears * 0.85,
        ebitdar: ebitdar,
        ebitdar_margin_impact: (annualRent / inputs.currentEbitda) * 100,
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputs]);

  const formatCurrency = (val: number) => `$${val.toFixed(1)}M`;
  const formatPercent = (val: number) => `${val.toFixed(1)}%`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sale-Leaseback Analysis</h1>
          <p className="text-gray-500 mt-1">Property sale and leaseback transaction modeling</p>
        </div>
        <LoadingButton
          isLoading={isLoading}
          onClick={handleAnalyze}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Run Analysis
        </LoadingButton>
      </div>

      {error && <ErrorDisplay message={error} onDismiss={() => setError(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Inputs</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Value ($M)</label>
              <input
                type="number"
                value={inputs.propertyValue}
                onChange={(e) => handleInputChange('propertyValue', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cap Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.capRate}
                onChange={(e) => handleInputChange('capRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease Term (Years)</label>
              <input
                type="number"
                value={inputs.leaseTermYears}
                onChange={(e) => handleInputChange('leaseTermYears', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Annual Escalation (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.annualRentEscalation}
                onChange={(e) => handleInputChange('annualRentEscalation', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Debt ($M)</label>
              <input
                type="number"
                value={inputs.currentDebt}
                onChange={(e) => handleInputChange('currentDebt', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Debt Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={inputs.debtRate}
                onChange={(e) => handleInputChange('debtRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current EBITDA ($M)</label>
              <input
                type="number"
                value={inputs.currentEbitda}
                onChange={(e) => handleInputChange('currentEbitda', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
              <input
                type="number"
                value={inputs.taxRate}
                onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 bg-emerald-600 rounded-t-xl">
            <h2 className="text-lg font-semibold text-white">Transaction Summary</h2>
          </div>
          <div className="p-6">
            {result ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-emerald-600">Sale Proceeds</p>
                    <p className="text-2xl font-bold text-emerald-700">{formatCurrency(result.sale_proceeds)}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Annual Rent</p>
                    <p className="text-2xl font-bold text-blue-700">{formatCurrency(result.annual_rent)}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Net Debt Paydown</span>
                    <span className="font-semibold text-green-600">{formatCurrency(result.net_debt_paydown)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Post-Transaction Debt</span>
                    <span className="font-semibold">{formatCurrency(result.post_transaction_debt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rent Coverage (EBITDA/Rent)</span>
                    <span className="font-semibold">{result.rent_coverage_ratio.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Implied Rent Multiple</span>
                    <span className="font-semibold">{result.implied_rent_multiple.toFixed(1)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">NPV of Rent Obligation</span>
                    <span className="font-semibold">{formatCurrency(result.npv_rent_obligation)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">EBITDAR (Pro Forma)</span>
                    <span className="text-lg font-bold text-emerald-600">{formatCurrency(result.ebitdar)}</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-gray-600">EBITDAR Margin Impact</span>
                    <span className="font-semibold text-amber-600">+{formatPercent(result.ebitdar_margin_impact)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Click "Run Analysis" to see results</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
