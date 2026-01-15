import { useState } from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    items: [
      { id: 'overview', title: 'Overview' },
      { id: 'quickstart', title: 'Quick Start' },
      { id: 'authentication', title: 'Authentication' },
      { id: 'errors', title: 'Error Handling' },
      { id: 'pagination', title: 'Pagination' },
    ],
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    items: [
      { id: 'models', title: 'Models' },
      { id: 'cells', title: 'Cells & Formulas' },
      { id: 'scenarios', title: 'Scenarios' },
      { id: 'valuations', title: 'Valuations' },
      { id: 'deals', title: 'Deals' },
      { id: 'exports', title: 'Exports' },
      { id: 'users', title: 'Users & Teams' },
    ],
  },
  {
    id: 'webhooks',
    title: 'Webhooks',
    items: [
      { id: 'webhook-setup', title: 'Setup' },
      { id: 'webhook-events', title: 'Events' },
      { id: 'webhook-security', title: 'Security' },
    ],
  },
  {
    id: 'sdks',
    title: 'SDKs & Libraries',
    items: [
      { id: 'python', title: 'Python SDK' },
      { id: 'javascript', title: 'JavaScript SDK' },
      { id: 'excel', title: 'Excel Add-in' },
    ],
  },
  {
    id: 'guides',
    title: 'Guides',
    items: [
      { id: 'guide-dcf', title: 'Building a DCF Model' },
      { id: 'guide-lbo', title: 'LBO Analysis' },
      { id: 'guide-sync', title: 'Real-time Sync' },
    ],
  },
];

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2">
        <button
          onClick={handleCopy}
          className="px-2 py-1 text-xs text-gray-400 bg-gray-800 rounded hover:bg-gray-700 transition-colors"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-300 overflow-x-auto">
        <div className="text-xs text-gray-500 mb-2">{language}</div>
        <pre className="whitespace-pre-wrap">{code}</pre>
      </div>
    </div>
  );
}

function EndpointBadge({ method }: { method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' }) {
  const colors = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    PATCH: 'bg-orange-100 text-orange-800',
    DELETE: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-block px-2 py-1 ${colors[method]} text-xs font-mono font-bold rounded mr-2`}>
      {method}
    </span>
  );
}

function ParamTable({ params }: { params: Array<{ name: string; type: string; required?: boolean; description: string }> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-2 px-3 font-semibold text-gray-900">Parameter</th>
            <th className="text-left py-2 px-3 font-semibold text-gray-900">Type</th>
            <th className="text-left py-2 px-3 font-semibold text-gray-900">Description</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) => (
            <tr key={param.name} className="border-b border-gray-100">
              <td className="py-2 px-3">
                <code className="text-sm bg-gray-100 px-1 rounded">{param.name}</code>
                {param.required && <span className="ml-1 text-red-500 text-xs">required</span>}
              </td>
              <td className="py-2 px-3 text-gray-600">{param.type}</td>
              <td className="py-2 px-3 text-gray-600">{param.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const filteredSections = searchQuery
    ? sections.map(section => ({
        ...section,
        items: section.items.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(section => section.items.length > 0)
    : sections;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
              <p className="text-sm text-gray-600 mt-1">
                Build powerful integrations with FinModel Pro
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <a
                href="https://github.com/finmodelpro/api-examples"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Examples
              </a>
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 py-8">
          {/* Sidebar */}
          <nav className={`w-64 flex-shrink-0 ${mobileMenuOpen ? 'block fixed inset-0 z-40 bg-white p-4 overflow-y-auto' : 'hidden lg:block'}`}>
            {mobileMenuOpen && (
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h2 className="font-semibold text-gray-900">Navigation</h2>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <div className="sticky top-24 space-y-6">
              {/* Version Badge */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <span className="text-xs font-medium text-gray-600">API Version</span>
                <span className="px-2 py-0.5 text-xs font-bold text-green-700 bg-green-100 rounded">v1.0</span>
              </div>

              {filteredSections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                    {section.title}
                  </h3>
                  <ul className="space-y-0.5">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => {
                            setActiveSection(item.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                            activeSection === item.id
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Help Links */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                  Resources
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link to="/help" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Contact Support
                    </Link>
                  </li>
                  <li>
                    <a
                      href="https://status.finmodelpro.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      API Status
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-4xl">
            {/* Overview */}
            {activeSection === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Overview</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    The FinModel Pro API enables you to programmatically interact with financial models,
                    run valuations, manage scenarios, and automate your workflows. Our RESTful API uses
                    JSON for all request and response bodies.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Quick Start</h3>
                    <p className="text-sm text-gray-600 mb-3">Get up and running in minutes with our step-by-step guide.</p>
                    <button onClick={() => setActiveSection('quickstart')} className="text-sm text-blue-600 font-medium hover:underline">
                      View Quick Start →
                    </button>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Authentication</h3>
                    <p className="text-sm text-gray-600 mb-3">Learn how to authenticate your API requests securely.</p>
                    <button onClick={() => setActiveSection('authentication')} className="text-sm text-blue-600 font-medium hover:underline">
                      View Authentication →
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Base URL</h3>
                  <p className="text-gray-600 mb-4">All API requests should be made to:</p>
                  <CodeBlock code="https://api.finmodelpro.com/v1" language="url" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Rate Limits</h3>
                  <p className="text-gray-600 mb-4">
                    API requests are rate limited based on your plan. Rate limit information is included in response headers.
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Plan</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Requests/min</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Requests/day</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4">Starter</td>
                          <td className="py-3 px-4">100</td>
                          <td className="py-3 px-4">10,000</td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="py-3 px-4">Professional</td>
                          <td className="py-3 px-4">1,000</td>
                          <td className="py-3 px-4">100,000</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4">Enterprise</td>
                          <td className="py-3 px-4">10,000</td>
                          <td className="py-3 px-4">Unlimited</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Response Headers</h3>
                  <ParamTable
                    params={[
                      { name: 'X-RateLimit-Limit', type: 'integer', description: 'Maximum requests per minute' },
                      { name: 'X-RateLimit-Remaining', type: 'integer', description: 'Remaining requests in current window' },
                      { name: 'X-RateLimit-Reset', type: 'timestamp', description: 'Unix timestamp when limit resets' },
                      { name: 'X-Request-Id', type: 'string', description: 'Unique request identifier for debugging' },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Quick Start */}
            {activeSection === 'quickstart' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Start</h2>
                  <p className="text-lg text-gray-600">
                    Get started with the FinModel Pro API in just a few minutes. This guide walks you through
                    making your first API calls.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">Prerequisites</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• A FinModel Pro account (Professional plan or higher)</li>
                    <li>• An API key from Settings → API Keys</li>
                    <li>• curl or any HTTP client</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Get Your API Key</h3>
                  <p className="text-gray-600 mb-4">
                    Navigate to <strong>Settings → API Keys</strong> in your FinModel Pro dashboard and click
                    "Generate New Key". Give it a descriptive name and copy the key.
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Important:</strong> Your API key will only be shown once. Store it securely and never expose it in client-side code.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Make Your First Request</h3>
                  <p className="text-gray-600 mb-4">Test your API key by listing your models:</p>
                  <CodeBlock
                    language="bash"
                    code={`curl -X GET "https://api.finmodelpro.com/v1/models" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
                  />
                  <p className="text-gray-600 mt-4 mb-4">You should receive a response like:</p>
                  <CodeBlock
                    language="json"
                    code={`{
  "data": [
    {
      "id": "mod_abc123xyz",
      "name": "Q4 2024 DCF Analysis",
      "type": "dcf",
      "status": "active",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T14:22:00Z"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "per_page": 20
  }
}`}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Create a Model</h3>
                  <p className="text-gray-600 mb-4">Create a new DCF model:</p>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/models" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My First API Model",
    "type": "dcf",
    "currency": "USD",
    "description": "Created via API"
  }'`}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 4: Run a DCF Valuation</h3>
                  <p className="text-gray-600 mb-4">Execute a DCF valuation with your projections:</p>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/valuations/dcf" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_id": "mod_abc123xyz",
    "fcf_projections": [100, 110, 121, 133, 146],
    "projection_years": 5,
    "wacc": 0.10,
    "terminal_growth_rate": 0.025,
    "net_debt": 200,
    "shares_outstanding": 50
  }'`}
                  />
                  <p className="text-gray-600 mt-4 mb-4">Response:</p>
                  <CodeBlock
                    language="json"
                    code={`{
  "valuation_id": "val_xyz789",
  "enterprise_value": 1847.52,
  "equity_value": 1647.52,
  "price_per_share": 32.95,
  "terminal_value": 1993.33,
  "present_value_fcf": 454.19,
  "present_value_terminal": 1393.33,
  "implied_multiples": {
    "ev_ebitda": 12.3,
    "ev_revenue": 3.2,
    "pe_ratio": 18.5
  }
}`}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => setActiveSection('models')}
                      className="text-left p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">Models API</h4>
                      <p className="text-sm text-gray-600">Learn to create and manage financial models</p>
                    </button>
                    <button
                      onClick={() => setActiveSection('valuations')}
                      className="text-left p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">Valuations API</h4>
                      <p className="text-sm text-gray-600">Run DCF, comps, and precedent analyses</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Authentication */}
            {activeSection === 'authentication' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentication</h2>
                  <p className="text-lg text-gray-600">
                    The FinModel Pro API uses API keys for authentication. All API requests must include
                    a valid API key in the Authorization header.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Using API Keys</h3>
                  <p className="text-gray-600 mb-4">
                    Include your API key in the <code className="bg-gray-100 px-1 rounded">Authorization</code> header using the Bearer scheme:
                  </p>
                  <CodeBlock
                    language="bash"
                    code={`curl -X GET "https://api.finmodelpro.com/v1/models" \\
  -H "Authorization: Bearer fm_live_abc123xyz789..."`}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">API Key Types</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Prefix</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Use Case</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4 font-medium">Live Key</td>
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">fm_live_</code></td>
                          <td className="py-3 px-4 text-gray-600">Production environment</td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="py-3 px-4 font-medium">Test Key</td>
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">fm_test_</code></td>
                          <td className="py-3 px-4 text-gray-600">Development & testing</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4 font-medium">Restricted Key</td>
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">fm_rk_</code></td>
                          <td className="py-3 px-4 text-gray-600">Limited permissions</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Generating API Keys</h3>
                  <ol className="space-y-3 text-gray-600">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
                      <span>Navigate to <strong>Settings → API Keys</strong> in your dashboard</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
                      <span>Click <strong>"Generate New Key"</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
                      <span>Enter a descriptive name (e.g., "Production Server")</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">4</span>
                      <span>Select permissions (for restricted keys)</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">5</span>
                      <span>Copy and securely store your key</span>
                    </li>
                  </ol>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <h4 className="font-semibold text-red-900 mb-2">Security Best Practices</h4>
                  <ul className="text-sm text-red-800 space-y-2">
                    <li>• Never expose API keys in client-side code or public repositories</li>
                    <li>• Use environment variables to store keys</li>
                    <li>• Rotate keys periodically and after any suspected compromise</li>
                    <li>• Use restricted keys with minimal permissions when possible</li>
                    <li>• Enable IP allowlisting for production keys</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">OAuth 2.0 (Enterprise)</h3>
                  <p className="text-gray-600 mb-4">
                    Enterprise customers can use OAuth 2.0 for user-level authentication. Contact your account manager for setup.
                  </p>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/oauth/token" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET"`}
                  />
                </div>
              </div>
            )}

            {/* Error Handling */}
            {activeSection === 'errors' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Error Handling</h2>
                  <p className="text-lg text-gray-600">
                    The FinModel Pro API uses conventional HTTP response codes and returns detailed error messages in JSON format.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">HTTP Status Codes</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Code</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4"><code className="bg-green-100 text-green-800 px-2 py-0.5 rounded">200</code></td>
                          <td className="py-3 px-4 font-medium">OK</td>
                          <td className="py-3 px-4 text-gray-600">Request succeeded</td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="py-3 px-4"><code className="bg-green-100 text-green-800 px-2 py-0.5 rounded">201</code></td>
                          <td className="py-3 px-4 font-medium">Created</td>
                          <td className="py-3 px-4 text-gray-600">Resource created successfully</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4"><code className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">400</code></td>
                          <td className="py-3 px-4 font-medium">Bad Request</td>
                          <td className="py-3 px-4 text-gray-600">Invalid request parameters</td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="py-3 px-4"><code className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">401</code></td>
                          <td className="py-3 px-4 font-medium">Unauthorized</td>
                          <td className="py-3 px-4 text-gray-600">Invalid or missing API key</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4"><code className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">403</code></td>
                          <td className="py-3 px-4 font-medium">Forbidden</td>
                          <td className="py-3 px-4 text-gray-600">Insufficient permissions</td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="py-3 px-4"><code className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">404</code></td>
                          <td className="py-3 px-4 font-medium">Not Found</td>
                          <td className="py-3 px-4 text-gray-600">Resource not found</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4"><code className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded">429</code></td>
                          <td className="py-3 px-4 font-medium">Too Many Requests</td>
                          <td className="py-3 px-4 text-gray-600">Rate limit exceeded</td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="py-3 px-4"><code className="bg-red-100 text-red-800 px-2 py-0.5 rounded">500</code></td>
                          <td className="py-3 px-4 font-medium">Internal Error</td>
                          <td className="py-3 px-4 text-gray-600">Server error (contact support)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Error Response Format</h3>
                  <CodeBlock
                    language="json"
                    code={`{
  "error": {
    "code": "invalid_parameter",
    "message": "The 'wacc' parameter must be between 0 and 1",
    "param": "wacc",
    "doc_url": "https://docs.finmodelpro.com/errors/invalid_parameter"
  },
  "request_id": "req_abc123xyz"
}`}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Error Codes</h3>
                  <ParamTable
                    params={[
                      { name: 'invalid_parameter', type: 'string', description: 'A request parameter is invalid or malformed' },
                      { name: 'missing_parameter', type: 'string', description: 'A required parameter is missing' },
                      { name: 'invalid_api_key', type: 'string', description: 'The API key is invalid or expired' },
                      { name: 'resource_not_found', type: 'string', description: 'The requested resource does not exist' },
                      { name: 'rate_limit_exceeded', type: 'string', description: 'Too many requests in a short period' },
                      { name: 'calculation_error', type: 'string', description: 'Error during financial calculation' },
                    ]}
                  />
                </div>
              </div>
            )}

            {/* Pagination */}
            {activeSection === 'pagination' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Pagination</h2>
                  <p className="text-lg text-gray-600">
                    List endpoints support cursor-based pagination for efficient traversal of large datasets.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Pagination Parameters</h3>
                  <ParamTable
                    params={[
                      { name: 'limit', type: 'integer', description: 'Number of items per page (default: 20, max: 100)' },
                      { name: 'starting_after', type: 'string', description: 'Cursor for fetching next page (use last item ID)' },
                      { name: 'ending_before', type: 'string', description: 'Cursor for fetching previous page' },
                    ]}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Example Request</h3>
                  <CodeBlock
                    language="bash"
                    code={`curl "https://api.finmodelpro.com/v1/models?limit=10&starting_after=mod_xyz789" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Response Format</h3>
                  <CodeBlock
                    language="json"
                    code={`{
  "data": [...],
  "has_more": true,
  "meta": {
    "total": 150,
    "page": 2,
    "per_page": 20
  }
}`}
                  />
                </div>
              </div>
            )}

            {/* Models API */}
            {activeSection === 'models' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Models API</h2>
                  <p className="text-lg text-gray-600">
                    Create, retrieve, update, and delete financial models. Models are the core objects in FinModel Pro.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Model Object</h3>
                  <CodeBlock
                    language="json"
                    code={`{
  "id": "mod_abc123xyz",
  "object": "model",
  "name": "Q4 2024 DCF Analysis",
  "type": "dcf",
  "status": "active",
  "currency": "USD",
  "description": "Quarterly valuation update",
  "metadata": {
    "client": "Acme Corp",
    "analyst": "jsmith"
  },
  "settings": {
    "fiscal_year_end": "12-31",
    "projection_years": 5
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T14:22:00Z"
}`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">List Models</h3>
                  <div className="mb-4">
                    <EndpointBadge method="GET" />
                    <code className="text-sm">/v1/models</code>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Query Parameters</h4>
                  <ParamTable
                    params={[
                      { name: 'limit', type: 'integer', description: 'Number of models to return (default: 20, max: 100)' },
                      { name: 'starting_after', type: 'string', description: 'Cursor for pagination' },
                      { name: 'type', type: 'string', description: 'Filter by type: dcf, lbo, merger, operating, comps' },
                      { name: 'status', type: 'string', description: 'Filter by status: active, archived, draft' },
                    ]}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Model</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/models</code>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Request Body</h4>
                  <ParamTable
                    params={[
                      { name: 'name', type: 'string', required: true, description: 'Model name' },
                      { name: 'type', type: 'string', required: true, description: 'Model type: dcf, lbo, merger, operating, comps' },
                      { name: 'currency', type: 'string', description: 'Currency code (default: USD)' },
                      { name: 'description', type: 'string', description: 'Model description' },
                      { name: 'template_id', type: 'string', description: 'ID of template to use' },
                      { name: 'metadata', type: 'object', description: 'Custom key-value pairs' },
                    ]}
                  />
                  <div className="mt-4">
                    <CodeBlock
                      language="bash"
                      code={`curl -X POST "https://api.finmodelpro.com/v1/models" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Acme Corp LBO",
    "type": "lbo",
    "currency": "USD",
    "description": "LBO analysis for potential acquisition",
    "metadata": {
      "deal_team": "MA-2024-001"
    }
  }'`}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Model</h3>
                  <div className="mb-4">
                    <EndpointBadge method="GET" />
                    <code className="text-sm">/v1/models/:id</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl "https://api.finmodelpro.com/v1/models/mod_abc123xyz" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Update Model</h3>
                  <div className="mb-4">
                    <EndpointBadge method="PATCH" />
                    <code className="text-sm">/v1/models/:id</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X PATCH "https://api.finmodelpro.com/v1/models/mod_abc123xyz" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Updated Model Name",
    "status": "archived"
  }'`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Model</h3>
                  <div className="mb-4">
                    <EndpointBadge method="DELETE" />
                    <code className="text-sm">/v1/models/:id</code>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Warning:</strong> This action is irreversible. Consider archiving instead.
                    </p>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X DELETE "https://api.finmodelpro.com/v1/models/mod_abc123xyz" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                  />
                </div>
              </div>
            )}

            {/* Cells & Formulas */}
            {activeSection === 'cells' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Cells & Formulas</h2>
                  <p className="text-lg text-gray-600">
                    Read and write cell values, formulas, and metadata within your models.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Cell Object</h3>
                  <CodeBlock
                    language="json"
                    code={`{
  "id": "cell_abc123",
  "address": "B5",
  "sheet": "Assumptions",
  "value": 150000000,
  "formula": "=SUM(B2:B4)",
  "formatted_value": "$150,000,000",
  "data_type": "number",
  "cell_type": "formula",
  "dependencies": ["B2", "B3", "B4"],
  "metadata": {
    "label": "Total Revenue",
    "note": "FY2024 projected revenue"
  }
}`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Get Cell Value</h3>
                  <div className="mb-4">
                    <EndpointBadge method="GET" />
                    <code className="text-sm">/v1/models/:model_id/cells/:address</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl "https://api.finmodelpro.com/v1/models/mod_abc123/cells/Assumptions!B5" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Update Cell</h3>
                  <div className="mb-4">
                    <EndpointBadge method="PUT" />
                    <code className="text-sm">/v1/models/:model_id/cells/:address</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X PUT "https://api.finmodelpro.com/v1/models/mod_abc123/cells/Assumptions!B5" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "value": 175000000
  }'`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Batch Update Cells</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/models/:model_id/cells/batch</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/models/mod_abc123/cells/batch" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "updates": [
      { "address": "Assumptions!B5", "value": 175000000 },
      { "address": "Assumptions!B6", "value": 0.25 },
      { "address": "Assumptions!B7", "formula": "=B5*B6" }
    ],
    "recalculate": true
  }'`}
                  />
                </div>
              </div>
            )}

            {/* Scenarios */}
            {activeSection === 'scenarios' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Scenarios</h2>
                  <p className="text-lg text-gray-600">
                    Create and manage scenarios for sensitivity analysis and what-if modeling.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Scenario Object</h3>
                  <CodeBlock
                    language="json"
                    code={`{
  "id": "scn_xyz789",
  "model_id": "mod_abc123",
  "name": "Bull Case",
  "type": "bull",
  "description": "Optimistic growth scenario",
  "assumptions": {
    "revenue_growth": 0.25,
    "ebitda_margin": 0.35,
    "exit_multiple": 12.0
  },
  "outputs": {
    "irr": 0.28,
    "moic": 3.2,
    "equity_value": 850000000
  },
  "is_base": false,
  "created_at": "2024-01-15T10:30:00Z"
}`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">List Scenarios</h3>
                  <div className="mb-4">
                    <EndpointBadge method="GET" />
                    <code className="text-sm">/v1/models/:model_id/scenarios</code>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Scenario</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/models/:model_id/scenarios</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/models/mod_abc123/scenarios" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Bear Case",
    "type": "bear",
    "assumptions": {
      "revenue_growth": 0.10,
      "ebitda_margin": 0.25,
      "exit_multiple": 8.0
    }
  }'`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Compare Scenarios</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/models/:model_id/scenarios/compare</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/models/mod_abc123/scenarios/compare" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "scenario_ids": ["scn_base", "scn_bull", "scn_bear"],
    "metrics": ["irr", "moic", "equity_value"]
  }'`}
                  />
                </div>
              </div>
            )}

            {/* Valuations API */}
            {activeSection === 'valuations' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Valuations API</h2>
                  <p className="text-lg text-gray-600">
                    Run DCF, trading comps, and precedent transaction analyses programmatically.
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">DCF Valuation</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/valuations/dcf</code>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">Request Body</h4>
                  <ParamTable
                    params={[
                      { name: 'model_id', type: 'string', description: 'Associated model ID (optional)' },
                      { name: 'fcf_projections', type: 'array', required: true, description: 'Array of projected free cash flows' },
                      { name: 'projection_years', type: 'integer', description: 'Number of projection years' },
                      { name: 'wacc', type: 'number', required: true, description: 'Weighted average cost of capital (0-1)' },
                      { name: 'terminal_growth_rate', type: 'number', required: true, description: 'Perpetuity growth rate (0-1)' },
                      { name: 'net_debt', type: 'number', description: 'Net debt to subtract from enterprise value' },
                      { name: 'shares_outstanding', type: 'number', description: 'Shares for per-share calculation' },
                    ]}
                  />
                  <div className="mt-4">
                    <CodeBlock
                      language="bash"
                      code={`curl -X POST "https://api.finmodelpro.com/v1/valuations/dcf" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fcf_projections": [100, 115, 132, 152, 175],
    "wacc": 0.10,
    "terminal_growth_rate": 0.025,
    "net_debt": 200,
    "shares_outstanding": 50
  }'`}
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Trading Comps</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/valuations/comps</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/valuations/comps" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target": {
      "revenue": 500,
      "ebitda": 100,
      "net_income": 50
    },
    "comparables": [
      { "name": "Comp A", "ev_revenue": 4.5, "ev_ebitda": 15.0, "pe": 25.0 },
      { "name": "Comp B", "ev_revenue": 3.8, "ev_ebitda": 12.5, "pe": 20.0 },
      { "name": "Comp C", "ev_revenue": 5.2, "ev_ebitda": 18.0, "pe": 30.0 }
    ],
    "multiples": ["ev_revenue", "ev_ebitda", "pe"]
  }'`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Precedent Transactions</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/valuations/precedents</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/valuations/precedents" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target": {
      "ltm_revenue": 500,
      "ltm_ebitda": 100
    },
    "transactions": [
      { "date": "2023-06-15", "ev_revenue": 5.0, "ev_ebitda": 16.0, "premium": 0.35 },
      { "date": "2023-03-20", "ev_revenue": 4.2, "ev_ebitda": 14.0, "premium": 0.28 }
    ]
  }'`}
                  />
                </div>
              </div>
            )}

            {/* Deals API */}
            {activeSection === 'deals' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Deals API</h2>
                  <p className="text-lg text-gray-600">
                    Run LBO returns analysis and merger accretion/dilution calculations.
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">LBO Analysis</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/deals/lbo/analyze</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/deals/lbo/analyze" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "entry_ev": 1000,
    "entry_ebitda": 100,
    "entry_multiple": 10.0,
    "exit_multiple": 10.0,
    "holding_period": 5,
    "debt": {
      "senior": { "amount": 400, "rate": 0.06, "amortization": 0.05 },
      "subordinated": { "amount": 200, "rate": 0.10, "amortization": 0 }
    },
    "ebitda_projections": [105, 115, 125, 135, 150],
    "capex_percent": 0.03,
    "nwc_percent": 0.10
  }'`}
                  />
                  <p className="text-gray-600 mt-4 mb-4">Response:</p>
                  <CodeBlock
                    language="json"
                    code={`{
  "returns": {
    "irr": 0.245,
    "moic": 2.8,
    "cash_on_cash": 2.8
  },
  "sources_uses": {
    "sources": { "senior_debt": 400, "sub_debt": 200, "equity": 400 },
    "uses": { "purchase_price": 950, "fees": 30, "cash_to_bs": 20 }
  },
  "exit_analysis": {
    "exit_ev": 1500,
    "exit_equity": 1120,
    "debt_paydown": 380
  }
}`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Merger Accretion/Dilution</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/deals/merger/accretion</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/deals/merger/accretion" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "acquirer": {
      "share_price": 50,
      "shares_outstanding": 100,
      "net_income": 200,
      "eps": 2.00
    },
    "target": {
      "share_price": 30,
      "shares_outstanding": 50,
      "net_income": 75,
      "premium": 0.25
    },
    "deal_structure": {
      "cash_percent": 0.5,
      "stock_percent": 0.5,
      "debt_rate": 0.05,
      "synergies": 25,
      "synergy_phase_in": [0.25, 0.75, 1.0]
    }
  }'`}
                  />
                </div>
              </div>
            )}

            {/* Exports API */}
            {activeSection === 'exports' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Exports API</h2>
                  <p className="text-lg text-gray-600">
                    Export models and valuations to PDF, PowerPoint, and Excel formats.
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Export to PDF</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/exports/pdf</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/exports/pdf" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_id": "mod_abc123",
    "template": "executive_summary",
    "include_sections": ["summary", "assumptions", "outputs", "sensitivity"],
    "branding": {
      "logo_url": "https://example.com/logo.png",
      "company_name": "Acme Capital"
    }
  }'`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Export to PowerPoint</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/exports/pptx</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/exports/pptx" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_id": "mod_abc123",
    "template": "investment_committee",
    "slides": ["title", "executive_summary", "financials", "valuation", "returns"]
  }'`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Export to Excel</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/exports/xlsx</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/exports/xlsx" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model_id": "mod_abc123",
    "include_formulas": true,
    "sheets": ["Assumptions", "Model", "Outputs"]
  }'`}
                  />
                </div>
              </div>
            )}

            {/* Users & Teams */}
            {activeSection === 'users' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Users & Teams</h2>
                  <p className="text-lg text-gray-600">
                    Manage users, teams, and permissions within your organization.
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">List Team Members</h3>
                  <div className="mb-4">
                    <EndpointBadge method="GET" />
                    <code className="text-sm">/v1/team/members</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl "https://api.finmodelpro.com/v1/team/members" \\
  -H "Authorization: Bearer YOUR_API_KEY"`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Invite User</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/team/invitations</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/team/invitations" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "analyst@company.com",
    "role": "analyst",
    "teams": ["deal-team-alpha"]
  }'`}
                  />
                </div>

                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Update Permissions</h3>
                  <div className="mb-4">
                    <EndpointBadge method="PATCH" />
                    <code className="text-sm">/v1/team/members/:user_id</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X PATCH "https://api.finmodelpro.com/v1/team/members/usr_abc123" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "role": "admin",
    "permissions": ["models:read", "models:write", "exports:create"]
  }'`}
                  />
                </div>
              </div>
            )}

            {/* Webhooks Setup */}
            {activeSection === 'webhook-setup' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Webhook Setup</h2>
                  <p className="text-lg text-gray-600">
                    Configure webhooks to receive real-time notifications about events in your account.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Create Webhook Endpoint</h3>
                  <div className="mb-4">
                    <EndpointBadge method="POST" />
                    <code className="text-sm">/v1/webhooks</code>
                  </div>
                  <CodeBlock
                    language="bash"
                    code={`curl -X POST "https://api.finmodelpro.com/v1/webhooks" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-server.com/webhooks/finmodel",
    "events": ["model.created", "model.updated", "valuation.completed"],
    "secret": "whsec_your_secret_key"
  }'`}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Webhook Payload</h3>
                  <CodeBlock
                    language="json"
                    code={`{
  "id": "evt_abc123xyz",
  "type": "model.updated",
  "created": 1705312200,
  "data": {
    "object": {
      "id": "mod_xyz789",
      "name": "Updated Model",
      "type": "dcf",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  }
}`}
                  />
                </div>
              </div>
            )}

            {/* Webhook Events */}
            {activeSection === 'webhook-events' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Webhook Events</h2>
                  <p className="text-lg text-gray-600">
                    Subscribe to specific events to receive targeted notifications.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Events</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Event</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">model.created</code></td>
                          <td className="py-3 px-4 text-gray-600">A new model was created</td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">model.updated</code></td>
                          <td className="py-3 px-4 text-gray-600">A model was modified</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">model.deleted</code></td>
                          <td className="py-3 px-4 text-gray-600">A model was deleted</td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">valuation.completed</code></td>
                          <td className="py-3 px-4 text-gray-600">A valuation calculation finished</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">export.ready</code></td>
                          <td className="py-3 px-4 text-gray-600">An export file is ready for download</td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">scenario.created</code></td>
                          <td className="py-3 px-4 text-gray-600">A new scenario was created</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">team.member_added</code></td>
                          <td className="py-3 px-4 text-gray-600">A new team member joined</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Webhook Security */}
            {activeSection === 'webhook-security' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Webhook Security</h2>
                  <p className="text-lg text-gray-600">
                    Verify webhook signatures to ensure requests are from FinModel Pro.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Signature Verification</h3>
                  <p className="text-gray-600 mb-4">
                    Each webhook request includes a signature in the <code className="bg-gray-100 px-1 rounded">X-FinModel-Signature</code> header. Verify this signature to authenticate the request.
                  </p>
                  <CodeBlock
                    language="python"
                    code={`import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(f"sha256={expected}", signature)`}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                  <h4 className="font-semibold text-yellow-900 mb-2">Security Best Practices</h4>
                  <ul className="text-sm text-yellow-800 space-y-2">
                    <li>• Always verify webhook signatures before processing</li>
                    <li>• Use HTTPS endpoints only</li>
                    <li>• Implement idempotency to handle duplicate deliveries</li>
                    <li>• Respond quickly (within 5 seconds) to avoid retries</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Python SDK */}
            {activeSection === 'python' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Python SDK</h2>
                  <p className="text-lg text-gray-600">
                    The official Python SDK for FinModel Pro API.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Installation</h3>
                  <CodeBlock language="bash" code="pip install finmodelpro" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h3>
                  <CodeBlock
                    language="python"
                    code={`import finmodelpro

# Initialize the client
client = finmodelpro.Client(api_key="fm_live_xxx")

# List models
models = client.models.list(limit=10)
for model in models.data:
    print(f"{model.name} ({model.type})")

# Create a model
model = client.models.create(
    name="Q4 Analysis",
    type="dcf",
    currency="USD"
)

# Run DCF valuation
valuation = client.valuations.dcf(
    fcf_projections=[100, 110, 121, 133, 146],
    wacc=0.10,
    terminal_growth_rate=0.025,
    net_debt=200,
    shares_outstanding=50
)

print(f"Enterprise Value: \${valuation.enterprise_value:,.0f}")
print(f"Price per Share: \${valuation.price_per_share:.2f}")`}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Async Support</h3>
                  <CodeBlock
                    language="python"
                    code={`import asyncio
import finmodelpro

async def main():
    client = finmodelpro.AsyncClient(api_key="fm_live_xxx")

    # Concurrent requests
    models, valuations = await asyncio.gather(
        client.models.list(),
        client.valuations.list()
    )

asyncio.run(main())`}
                  />
                </div>
              </div>
            )}

            {/* JavaScript SDK */}
            {activeSection === 'javascript' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">JavaScript SDK</h2>
                  <p className="text-lg text-gray-600">
                    The official JavaScript/TypeScript SDK for FinModel Pro API.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Installation</h3>
                  <CodeBlock language="bash" code="npm install @finmodelpro/sdk" />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h3>
                  <CodeBlock
                    language="typescript"
                    code={`import FinModelPro from '@finmodelpro/sdk';

// Initialize the client
const client = new FinModelPro({
  apiKey: 'fm_live_xxx'
});

// List models
const models = await client.models.list({ limit: 10 });
models.data.forEach(model => {
  console.log(\`\${model.name} (\${model.type})\`);
});

// Create a model
const model = await client.models.create({
  name: 'Q4 Analysis',
  type: 'dcf',
  currency: 'USD'
});

// Run DCF valuation
const valuation = await client.valuations.dcf({
  fcfProjections: [100, 110, 121, 133, 146],
  wacc: 0.10,
  terminalGrowthRate: 0.025,
  netDebt: 200,
  sharesOutstanding: 50
});

console.log(\`Enterprise Value: $\${valuation.enterpriseValue.toLocaleString()}\`);`}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">TypeScript Types</h3>
                  <CodeBlock
                    language="typescript"
                    code={`import type { Model, Valuation, DCFInput } from '@finmodelpro/sdk';

const dcfInput: DCFInput = {
  fcfProjections: [100, 110, 121],
  wacc: 0.10,
  terminalGrowthRate: 0.025
};

const valuation: Valuation = await client.valuations.dcf(dcfInput);`}
                  />
                </div>
              </div>
            )}

            {/* Excel Add-in */}
            {activeSection === 'excel' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Excel Add-in</h2>
                  <p className="text-lg text-gray-600">
                    Connect Excel to FinModel Pro with custom functions and real-time sync.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Installation</h3>
                  <ol className="space-y-3 text-gray-600">
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">1</span>
                      <span>Open Excel and go to <strong>Insert → Get Add-ins</strong></span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">2</span>
                      <span>Search for "FinModel Pro"</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">3</span>
                      <span>Click <strong>Add</strong> and sign in with your account</span>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Custom Functions</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Function</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">=FP.GET(model, cell)</code></td>
                          <td className="py-3 px-4 text-gray-600">Get a value from a cloud model</td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">=FP.LINK(model, cell)</code></td>
                          <td className="py-3 px-4 text-gray-600">Bidirectional link to cloud model</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">=FP.SCENARIO(model, scenario, cell)</code></td>
                          <td className="py-3 px-4 text-gray-600">Get scenario-specific value</td>
                        </tr>
                        <tr className="border-t border-gray-200 bg-gray-50">
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">=FP.DCF(fcf, wacc, g)</code></td>
                          <td className="py-3 px-4 text-gray-600">Quick DCF calculation</td>
                        </tr>
                        <tr className="border-t border-gray-200">
                          <td className="py-3 px-4"><code className="bg-gray-100 px-1 rounded text-xs">=FP.IRR(cashflows)</code></td>
                          <td className="py-3 px-4 text-gray-600">Calculate IRR with custom solver</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Example Usage</h3>
                  <CodeBlock
                    language="excel"
                    code={`// Get enterprise value from cloud model
=FP.GET("Acme DCF 2024", "Outputs!B10")

// Link cell bidirectionally (changes sync both ways)
=FP.LINK("Acme DCF 2024", "Assumptions!B5")

// Get bull case scenario value
=FP.SCENARIO("Acme DCF 2024", "Bull", "Outputs!B15")

// Quick DCF calculation
=FP.DCF({100,110,121,133,146}, 0.10, 0.025)`}
                  />
                </div>
              </div>
            )}

            {/* Guide: Building a DCF Model */}
            {activeSection === 'guide-dcf' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Building a DCF Model</h2>
                  <p className="text-lg text-gray-600">
                    A step-by-step guide to creating a comprehensive DCF valuation using the API.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h4 className="font-semibold text-blue-900 mb-2">What You'll Build</h4>
                  <p className="text-sm text-blue-800">
                    A complete DCF model with revenue projections, margin analysis, WACC calculation,
                    and sensitivity tables. Estimated time: 30 minutes.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 1: Create the Model</h3>
                  <CodeBlock
                    language="python"
                    code={`import finmodelpro

client = finmodelpro.Client(api_key="fm_live_xxx")

# Create a new DCF model
model = client.models.create(
    name="Acme Corp DCF Valuation",
    type="dcf",
    currency="USD",
    metadata={
        "analyst": "jsmith",
        "client": "Acme Corp",
        "purpose": "Acquisition Analysis"
    }
)`}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 2: Input Assumptions</h3>
                  <CodeBlock
                    language="python"
                    code={`# Set up assumptions
assumptions = {
    "base_revenue": 500_000_000,
    "revenue_growth": [0.15, 0.12, 0.10, 0.08, 0.05],
    "ebitda_margin": [0.25, 0.26, 0.27, 0.28, 0.28],
    "capex_percent": 0.05,
    "nwc_percent": 0.10,
    "tax_rate": 0.25
}

# Update model cells
client.models.cells.batch_update(
    model_id=model.id,
    updates=[
        {"address": "Assumptions!B5", "value": assumptions["base_revenue"]},
        {"address": "Assumptions!B6:F6", "value": assumptions["revenue_growth"]},
        {"address": "Assumptions!B7:F7", "value": assumptions["ebitda_margin"]},
    ]
)`}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Step 3: Run the Valuation</h3>
                  <CodeBlock
                    language="python"
                    code={`# Calculate projections
base = assumptions["base_revenue"]
fcf_projections = []

for i, growth in enumerate(assumptions["revenue_growth"]):
    revenue = base * (1 + growth)
    ebitda = revenue * assumptions["ebitda_margin"][i]
    capex = revenue * assumptions["capex_percent"]
    nwc_change = revenue * assumptions["nwc_percent"] * growth
    tax = ebitda * assumptions["tax_rate"]
    fcf = ebitda - tax - capex - nwc_change
    fcf_projections.append(fcf)
    base = revenue

# Run DCF
valuation = client.valuations.dcf(
    model_id=model.id,
    fcf_projections=fcf_projections,
    wacc=0.10,
    terminal_growth_rate=0.025,
    net_debt=150_000_000,
    shares_outstanding=100_000_000
)

print(f"Enterprise Value: \${valuation.enterprise_value:,.0f}")
print(f"Equity Value: \${valuation.equity_value:,.0f}")
print(f"Price per Share: \${valuation.price_per_share:.2f}")`}
                  />
                </div>
              </div>
            )}

            {/* Guide: LBO Analysis */}
            {activeSection === 'guide-lbo' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">LBO Analysis Guide</h2>
                  <p className="text-lg text-gray-600">
                    Learn to build comprehensive LBO models with returns analysis.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Complete Example</h3>
                  <CodeBlock
                    language="python"
                    code={`import finmodelpro

client = finmodelpro.Client(api_key="fm_live_xxx")

# Run LBO analysis
lbo = client.deals.lbo_analyze(
    entry_ev=1_000_000_000,
    entry_ebitda=100_000_000,
    entry_multiple=10.0,
    exit_multiple=10.0,
    holding_period=5,
    debt={
        "senior": {
            "amount": 400_000_000,
            "rate": 0.06,
            "amortization": 0.05
        },
        "subordinated": {
            "amount": 200_000_000,
            "rate": 0.10,
            "amortization": 0
        }
    },
    ebitda_projections=[105, 115, 125, 135, 150],  # in millions
    capex_percent=0.03,
    nwc_percent=0.10
)

print(f"IRR: {lbo.returns.irr:.1%}")
print(f"MOIC: {lbo.returns.moic:.2f}x")
print(f"Exit Equity: \${lbo.exit_analysis.exit_equity:,.0f}")`}
                  />
                </div>
              </div>
            )}

            {/* Guide: Real-time Sync */}
            {activeSection === 'guide-sync' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Real-time Sync</h2>
                  <p className="text-lg text-gray-600">
                    Implement real-time model synchronization using WebSockets.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">WebSocket Connection</h3>
                  <CodeBlock
                    language="javascript"
                    code={`import { FinModelProRealtime } from '@finmodelpro/sdk';

const realtime = new FinModelProRealtime({
  apiKey: 'fm_live_xxx'
});

// Subscribe to model changes
realtime.subscribe('mod_abc123', {
  onCellChange: (change) => {
    console.log(\`Cell \${change.address} changed to \${change.value}\`);
  },
  onUserJoin: (user) => {
    console.log(\`\${user.name} started editing\`);
  },
  onError: (error) => {
    console.error('Sync error:', error);
  }
});

// Push changes
realtime.updateCell('mod_abc123', {
  address: 'Assumptions!B5',
  value: 175000000
});`}
                  />
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Conflict Resolution</h3>
                  <p className="text-gray-600 mb-4">
                    When multiple users edit the same cell, the last write wins. You can implement
                    optimistic locking using version numbers:
                  </p>
                  <CodeBlock
                    language="javascript"
                    code={`realtime.updateCell('mod_abc123', {
  address: 'Assumptions!B5',
  value: 175000000,
  expectedVersion: 42  // Will fail if version changed
});`}
                  />
                </div>
              </div>
            )}

            {/* Default fallback for any unmapped sections */}
            {!['overview', 'quickstart', 'authentication', 'errors', 'pagination', 'models', 'cells', 'scenarios', 'valuations', 'deals', 'exports', 'users', 'webhook-setup', 'webhook-events', 'webhook-security', 'python', 'javascript', 'excel', 'guide-dcf', 'guide-lbo', 'guide-sync'].includes(activeSection) && (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Documentation Coming Soon</h2>
                <p className="text-gray-600 mb-6">
                  This section is currently being written. Check back soon for updates.
                </p>
                <Link to="/contact" className="text-blue-600 hover:underline">
                  Contact support for help →
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} FinModel Pro. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/help" className="text-sm text-gray-500 hover:text-gray-700">Help Center</Link>
              <Link to="/contact" className="text-sm text-gray-500 hover:text-gray-700">Contact</Link>
              <a href="https://status.finmodelpro.com" className="text-sm text-gray-500 hover:text-gray-700">API Status</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
