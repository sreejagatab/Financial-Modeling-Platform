import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AIScenarioGenerator, AIAssumptionsHelper } from '../../shared/components/ai';

interface SheetTab {
  id: string;
  name: string;
  purpose: 'input' | 'calculation' | 'output';
}

const mockSheets: SheetTab[] = [
  { id: '1', name: 'Assumptions', purpose: 'input' },
  { id: '2', name: 'Revenue Build', purpose: 'calculation' },
  { id: '3', name: 'Income Statement', purpose: 'calculation' },
  { id: '4', name: 'Balance Sheet', purpose: 'calculation' },
  { id: '5', name: 'Cash Flow', purpose: 'calculation' },
  { id: '6', name: 'Returns', purpose: 'output' },
];

export function ModelBuilder() {
  const { modelId } = useParams();
  const [activeSheetId, setActiveSheetId] = useState(mockSheets[0].id);
  const [showAssumptions, setShowAssumptions] = useState(true);
  const [showAIScenarios, setShowAIScenarios] = useState(false);
  const [showAIAssumptions, setShowAIAssumptions] = useState(false);

  // Base assumptions for AI features
  const baseAssumptions = {
    purchase_price: 500000000,
    entry_multiple: 8.0,
    senior_debt: 250000000,
    interest_rate: 0.06,
    equity_check: 200000000,
    revenue_growth: 0.05,
    ebitda_margin: 0.20,
    capex_percent: 0.03,
    exit_year: 5,
    exit_multiple: 8.0,
  };

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col bg-white rounded-lg border border-gray-200">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-4">
          <h3 className="font-medium text-gray-900">
            {modelId ? `Model: ${modelId}` : 'New Model'}
          </h3>
          <select className="px-3 py-1 text-sm border border-gray-300 rounded-md">
            <option>Base Case</option>
            <option>Bull Case</option>
            <option>Bear Case</option>
            <option>Management Case</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAssumptions(!showAssumptions)}
            className={`px-3 py-1 text-sm rounded-md ${
              showAssumptions
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Assumptions
          </button>
          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
            Sensitivity
          </button>
          <button
            onClick={() => setShowAIScenarios(!showAIScenarios)}
            className={`px-3 py-1 text-sm rounded-md flex items-center gap-1 ${
              showAIScenarios
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Scenarios
          </button>
          <button
            onClick={() => setShowAIAssumptions(!showAIAssumptions)}
            className={`px-3 py-1 text-sm rounded-md flex items-center gap-1 ${
              showAIAssumptions
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            AI Assumptions
          </button>
          <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Calculate
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Assumptions panel */}
        {showAssumptions && (
          <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-4">Key Assumptions</h4>
              <div className="space-y-4">
                <AssumptionGroup title="Transaction">
                  <AssumptionInput label="Purchase Price" value="500" suffix="M" />
                  <AssumptionInput label="Entry Multiple" value="8.0" suffix="x" />
                </AssumptionGroup>
                <AssumptionGroup title="Capital Structure">
                  <AssumptionInput label="Senior Debt" value="250" suffix="M" />
                  <AssumptionInput label="Interest Rate" value="6.0" suffix="%" />
                  <AssumptionInput label="Equity Check" value="200" suffix="M" />
                </AssumptionGroup>
                <AssumptionGroup title="Operations">
                  <AssumptionInput label="Revenue Growth" value="5.0" suffix="%" />
                  <AssumptionInput label="EBITDA Margin" value="20.0" suffix="%" />
                  <AssumptionInput label="CapEx % Rev" value="3.0" suffix="%" />
                </AssumptionGroup>
                <AssumptionGroup title="Exit">
                  <AssumptionInput label="Exit Year" value="5" suffix="yr" />
                  <AssumptionInput label="Exit Multiple" value="8.0" suffix="x" />
                </AssumptionGroup>
              </div>
            </div>
          </div>
        )}

        {/* Spreadsheet area */}
        <div className="flex-1 flex flex-col">
          {/* Sheet tabs */}
          <div className="flex border-b border-gray-200 bg-gray-100 px-2 pt-2">
            {mockSheets.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => setActiveSheetId(sheet.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-md ${
                  activeSheetId === sheet.id
                    ? 'bg-white text-blue-600 border-t border-l border-r border-gray-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {sheet.name}
              </button>
            ))}
          </div>

          {/* Grid placeholder */}
          <div className="flex-1 p-4">
            <div className="h-full border border-gray-300 rounded-md bg-white flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium">AG Grid Integration</p>
                <p className="text-sm mt-1">
                  Spreadsheet view for{' '}
                  {mockSheets.find((s) => s.id === activeSheetId)?.name}
                </p>
                <p className="text-xs mt-4 text-gray-400">
                  Full grid implementation with formulas, formatting, and real-time sync
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
        <span>Ready</span>
        <span>Last calculated: Just now</span>
      </div>

      {/* AI Scenarios Modal */}
      {showAIScenarios && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AIScenarioGenerator
              modelType="LBO"
              baseAssumptions={baseAssumptions}
              industry="Private Equity"
              onApplyScenario={(scenario) => {
                console.log('Apply scenario:', scenario);
                setShowAIScenarios(false);
              }}
              onClose={() => setShowAIScenarios(false)}
            />
          </div>
        </div>
      )}

      {/* AI Assumptions Modal */}
      {showAIAssumptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <button
                onClick={() => setShowAIAssumptions(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-gray-500 hover:text-gray-700 z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <AIAssumptionsHelper
                industry="Private Equity"
                companySize="medium"
                modelType="LBO"
                currentAssumptions={baseAssumptions}
                onApplyAssumption={(key, value) => {
                  console.log('Apply assumption:', key, value);
                }}
                onApplyAll={(assumptions) => {
                  console.log('Apply all assumptions:', assumptions);
                  setShowAIAssumptions(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssumptionGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <h5 className="text-sm font-medium text-gray-700">{title}</h5>
      </div>
      <div className="p-3 space-y-2">{children}</div>
    </div>
  );
}

function AssumptionInput({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-gray-600">{label}</label>
      <div className="flex items-center">
        <input
          type="text"
          defaultValue={value}
          className="w-20 px-2 py-1 text-right text-sm font-medium text-blue-600 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {suffix && (
          <span className="ml-1 text-sm text-gray-500 w-6">{suffix}</span>
        )}
      </div>
    </div>
  );
}
