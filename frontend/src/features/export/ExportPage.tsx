import { useState } from 'react';
import { LoadingButton } from '@/shared/components/loading';
import { ErrorDisplay } from '@/shared/components/errors';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

type ExportFormat = 'pdf' | 'pptx';
type ExportType = 'lbo' | 'three-statement' | '13-week-cash-flow' | 'valuation' | 'scenario-comparison' | 'custom';

interface ExportConfig {
  format: ExportFormat;
  type: ExportType;
  modelId?: string;
  title: string;
  includeCharts: boolean;
  includeSensitivity: boolean;
  includeAssumptions: boolean;
  companyName: string;
  preparedBy: string;
  confidential: boolean;
}

const exportTypes: { id: ExportType; label: string; description: string; formats: ExportFormat[] }[] = [
  { id: 'lbo', label: 'LBO Analysis', description: 'Full LBO model with returns, debt schedule, and projections', formats: ['pdf', 'pptx'] },
  { id: 'three-statement', label: '3-Statement Model', description: 'Income statement, balance sheet, and cash flow', formats: ['pdf'] },
  { id: '13-week-cash-flow', label: '13-Week Cash Flow', description: 'Weekly cash flow forecast and liquidity analysis', formats: ['pdf'] },
  { id: 'valuation', label: 'Valuation Summary', description: 'DCF, comps, and precedent transactions summary', formats: ['pdf', 'pptx'] },
  { id: 'scenario-comparison', label: 'Scenario Comparison', description: 'Compare multiple scenarios side by side', formats: ['pptx'] },
  { id: 'custom', label: 'Custom Report', description: 'Build your own report with selected sections', formats: ['pdf', 'pptx'] },
];

const PDFIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="4" fill="#DC2626" />
    <path d="M8 8h10l6 6v12a2 2 0 01-2 2H8a2 2 0 01-2-2V10a2 2 0 012-2z" fill="white" fillOpacity="0.2" />
    <text x="16" y="22" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">PDF</text>
  </svg>
);

const PPTXIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
    <rect width="32" height="32" rx="4" fill="#D97706" />
    <path d="M8 8h10l6 6v12a2 2 0 01-2 2H8a2 2 0 01-2-2V10a2 2 0 012-2z" fill="white" fillOpacity="0.2" />
    <text x="16" y="22" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">PPTX</text>
  </svg>
);

export function ExportPage() {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'pdf',
    type: 'lbo',
    title: 'Financial Analysis Report',
    includeCharts: true,
    includeSensitivity: true,
    includeAssumptions: true,
    companyName: 'Target Company',
    preparedBy: 'Financial Modeling Platform',
    confidential: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentExports, setRecentExports] = useState<{ name: string; format: string; date: string }[]>([
    { name: 'Project Alpha LBO Analysis', format: 'PDF', date: '2 hours ago' },
    { name: 'Tech Acquisition Valuation', format: 'PPTX', date: 'Yesterday' },
    { name: 'Q4 Cash Flow Forecast', format: 'PDF', date: '3 days ago' },
  ]);

  const selectedExportType = exportTypes.find(t => t.id === config.type);

  const handleExport = async () => {
    setIsExporting(true);
    setError(null);

    try {
      const endpoint = config.format === 'pdf'
        ? `/api/v1/export/pdf/${config.type}`
        : `/api/v1/export/pptx/${config.type}`;

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: config.title,
          company_name: config.companyName,
          prepared_by: config.preparedBy,
          confidential: config.confidential,
          include_charts: config.includeCharts,
          include_sensitivity: config.includeSensitivity,
          include_assumptions: config.includeAssumptions,
          // Demo data for export
          data: {
            enterprise_value: 500,
            equity_value: 350,
            irr: 24.5,
            moic: 2.8,
          },
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Export failed');
      }

      // Get the blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.title.replace(/\s+/g, '_')}.${config.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Add to recent exports
      setRecentExports(prev => [
        { name: config.title, format: config.format.toUpperCase(), date: 'Just now' },
        ...prev.slice(0, 4),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export & Reports</h1>
        <p className="text-gray-500 mt-1">Generate professional PDF and PowerPoint reports</p>
      </div>

      {error && (
        <ErrorDisplay message={error} onDismiss={() => setError(null)} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Format Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setConfig({ ...config, format: 'pdf' })}
                className={`p-4 rounded-xl border-2 transition-colors flex items-center gap-4 ${
                  config.format === 'pdf'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <PDFIcon />
                <div className="text-left">
                  <p className={`font-semibold ${config.format === 'pdf' ? 'text-red-700' : 'text-gray-900'}`}>
                    PDF Document
                  </p>
                  <p className="text-sm text-gray-500">Printable report format</p>
                </div>
              </button>
              <button
                onClick={() => setConfig({ ...config, format: 'pptx' })}
                className={`p-4 rounded-xl border-2 transition-colors flex items-center gap-4 ${
                  config.format === 'pptx'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <PPTXIcon />
                <div className="text-left">
                  <p className={`font-semibold ${config.format === 'pptx' ? 'text-orange-700' : 'text-gray-900'}`}>
                    PowerPoint
                  </p>
                  <p className="text-sm text-gray-500">Presentation slides</p>
                </div>
              </button>
            </div>
          </div>

          {/* Report Type */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Type</h2>
            <div className="grid grid-cols-2 gap-3">
              {exportTypes
                .filter(t => t.formats.includes(config.format))
                .map(type => (
                  <button
                    key={type.id}
                    onClick={() => setConfig({ ...config, type: type.id })}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      config.type === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <p className={`font-medium ${config.type === type.id ? 'text-blue-700' : 'text-gray-900'}`}>
                      {type.label}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                  </button>
                ))}
            </div>
          </div>

          {/* Report Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Report Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Title</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => setConfig({ ...config, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={config.companyName}
                  onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prepared By</label>
                <input
                  type="text"
                  value={config.preparedBy}
                  onChange={(e) => setConfig({ ...config, preparedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Include Options */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Include in Report</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Charts & Visualizations</p>
                  <p className="text-sm text-gray-500">Include graphs, charts, and visual data</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.includeCharts}
                  onChange={(e) => setConfig({ ...config, includeCharts: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Sensitivity Analysis</p>
                  <p className="text-sm text-gray-500">Include sensitivity tables and scenarios</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.includeSensitivity}
                  onChange={(e) => setConfig({ ...config, includeSensitivity: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Assumptions Summary</p>
                  <p className="text-sm text-gray-500">Include key assumptions and inputs</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.includeAssumptions}
                  onChange={(e) => setConfig({ ...config, includeAssumptions: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <div>
                  <p className="font-medium text-gray-900">Confidential Watermark</p>
                  <p className="text-sm text-gray-500">Add confidential marking to pages</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.confidential}
                  onChange={(e) => setConfig({ ...config, confidential: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Export Button */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h2>
            <div className="p-4 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                {config.format === 'pdf' ? <PDFIcon /> : <PPTXIcon />}
                <div>
                  <p className="font-medium text-gray-900">{selectedExportType?.label}</p>
                  <p className="text-sm text-gray-500">{config.format.toUpperCase()} format</p>
                </div>
              </div>
            </div>
            <LoadingButton
              isLoading={isExporting}
              loadingText="Generating..."
              onClick={handleExport}
              className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
            >
              Export Report
            </LoadingButton>
          </div>

          {/* Recent Exports */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h2>
            <div className="space-y-3">
              {recentExports.map((exp, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                  {exp.format === 'PDF' ? (
                    <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-red-600">PDF</span>
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-orange-600">PPT</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{exp.name}</p>
                    <p className="text-xs text-gray-500">{exp.date}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
