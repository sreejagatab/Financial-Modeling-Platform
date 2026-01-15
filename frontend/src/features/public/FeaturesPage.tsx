import { useNavigate } from 'react-router-dom';

const CheckIcon = () => (
  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

// Feature category icons
const ModelingIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

const CollaborationIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const IntegrationIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const IndustryIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const featureCategories = [
  {
    id: 'modeling',
    icon: ModelingIcon,
    title: 'Financial Modeling',
    subtitle: 'Build comprehensive models with ease',
    description: 'Our powerful modeling engine handles everything from basic valuations to complex multi-entity structures with automatic error checking and circular reference resolution.',
    gradient: 'from-blue-500 to-cyan-500',
    features: [
      {
        title: '3-Statement Models',
        description: 'Integrated income statement, balance sheet, and cash flow statement with automatic linking and circular reference handling.',
        capabilities: ['Auto-balancing balance sheet', 'Working capital schedules', 'Debt & interest schedules', 'Depreciation schedules', 'Deferred taxes'],
        highlight: true,
      },
      {
        title: 'LBO Models',
        description: 'Full-featured leveraged buyout analysis with multiple debt tranches, management rollover, and comprehensive returns analysis.',
        capabilities: ['Sources & uses', 'Debt waterfall', 'IRR/MOIC sensitivity', 'PIK toggle modeling', 'Sponsor returns'],
      },
      {
        title: 'M&A Models',
        description: 'Comprehensive merger analysis including purchase price allocation, synergy modeling, and accretion/dilution analysis.',
        capabilities: ['Contribution analysis', 'Exchange ratio optimization', 'Synergy phasing', 'Pro forma financials', 'Deal structure comparison'],
      },
      {
        title: 'DCF Valuation',
        description: 'Discounted cash flow analysis with WACC build-up, terminal value calculations, and integrated scenario analysis.',
        capabilities: ['WACC calculation', 'Unlevered FCF projection', 'Terminal value (perpetuity & exit)', 'Football field charts', 'Sensitivity tables'],
      },
    ],
  },
  {
    id: 'collaboration',
    icon: CollaborationIcon,
    title: 'Collaboration',
    subtitle: 'Work together seamlessly',
    description: 'Real-time collaboration features designed for modern finance teams working across offices, time zones, and devices.',
    gradient: 'from-violet-500 to-purple-500',
    features: [
      {
        title: 'Real-Time Editing',
        description: 'Multiple users can work on the same model simultaneously with live cursor tracking, instant sync, and conflict-free editing.',
        capabilities: ['Live presence indicators', 'Automatic conflict resolution', 'Change notifications', 'Activity feed', 'Offline support'],
        highlight: true,
      },
      {
        title: 'Comments & Annotations',
        description: 'Add comments to any cell or section. Tag team members, resolve discussions, and maintain complete audit trails.',
        capabilities: ['Cell-level comments', '@mentions & notifications', 'Comment threads', 'Resolution tracking', 'Comment history'],
      },
      {
        title: 'Version Control',
        description: 'Git-like version control for financial models. Create branches, compare versions, and merge changes with confidence.',
        capabilities: ['Unlimited history', 'Named versions & tags', 'Branch & merge', 'Diff visualization', 'Rollback support'],
      },
      {
        title: 'Role-Based Access',
        description: 'Granular permissions for different user types. Control who can view, edit, comment, or approve models.',
        capabilities: ['Viewer/Editor/Admin roles', 'Sheet-level permissions', 'Approval workflows', 'Audit logging', 'Team management'],
      },
    ],
  },
  {
    id: 'integration',
    icon: IntegrationIcon,
    title: 'Integrations',
    subtitle: 'Connect your workflow',
    description: 'Seamless integrations with the tools your team already uses, plus a powerful API for building custom workflows.',
    gradient: 'from-emerald-500 to-teal-500',
    features: [
      {
        title: 'Excel Add-in',
        description: 'Bidirectional sync with Microsoft Excel. Work in your preferred environment while keeping everything connected to the cloud.',
        capabilities: ['Two-way sync', 'Custom functions (UDFs)', 'Offline support', 'Formula preservation', 'Range linking'],
        highlight: true,
      },
      {
        title: 'Market Data',
        description: 'Live market data feeds for real-time pricing, trading comps, and valuation benchmarks from leading providers.',
        capabilities: ['Stock prices & indices', 'Trading multiples', 'Precedent transactions', 'Economic indicators', 'Custom data feeds'],
      },
      {
        title: 'Document Generation',
        description: 'Export professional reports to PDF and PowerPoint with customizable templates and automated formatting.',
        capabilities: ['One-click export', 'Custom templates', 'White-labeling', 'Batch generation', 'Scheduled exports'],
      },
      {
        title: 'API Access',
        description: 'Full REST API for custom integrations with your existing systems, data warehouses, and workflows.',
        capabilities: ['RESTful endpoints', 'Webhooks', 'SDK libraries (Python, JS)', 'Rate limiting', 'OAuth 2.0'],
      },
    ],
  },
  {
    id: 'industry',
    icon: IndustryIcon,
    title: 'Industry-Specific',
    subtitle: 'Specialized solutions',
    description: 'Purpose-built modules for specific industries and transaction types with pre-built templates and industry metrics.',
    gradient: 'from-orange-500 to-amber-500',
    features: [
      {
        title: 'Real Estate / REIT',
        description: 'Specialized models for real estate transactions including NAV analysis, REIT conversion, and property-level modeling.',
        capabilities: ['NAV / SOTP analysis', 'FFO/AFFO metrics', 'Cap rate analysis', 'Lease roll schedules', 'Development models'],
        highlight: true,
      },
      {
        title: 'Sale-Leaseback',
        description: 'Model sale-leaseback transactions with rent coverage analysis, accounting treatment, and tax implications.',
        capabilities: ['Rent coverage ratios', 'EBITDAR analysis', 'NPV calculations', 'ASC 842 treatment', 'Tax optimization'],
      },
      {
        title: 'Infrastructure',
        description: 'Project finance models for infrastructure investments with complex debt structures and concession modeling.',
        capabilities: ['DSCR modeling', 'Construction draws', 'Concession periods', 'Tariff escalation', 'Availability payments'],
      },
      {
        title: 'Financial Services',
        description: 'Bank and insurance company models with regulatory capital requirements and specialized metrics.',
        capabilities: ['ROE decomposition', 'Capital ratios (CET1, Tier 1)', 'Loan loss provisions', 'Embedded value', 'ALM analysis'],
      },
    ],
  },
];

const securityFeatures = [
  {
    title: 'SOC 2 Type II Certified',
    description: 'Annual third-party audits verify our security controls meet the highest standards',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: 'Bank-Grade Encryption',
    description: 'AES-256 encryption at rest and TLS 1.3 in transit protects your data end-to-end',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    title: 'Single Sign-On (SSO)',
    description: 'SAML 2.0 and OIDC support for enterprise identity providers like Okta, Azure AD, and more',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
  {
    title: 'Complete Audit Logging',
    description: 'Every action is logged with timestamps, user info, and IP addresses for compliance',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    title: '99.99% Uptime SLA',
    description: 'Enterprise-grade infrastructure with guaranteed availability and 24/7 monitoring',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
  },
  {
    title: 'Data Residency Options',
    description: 'Choose where your data is stored to meet regional compliance requirements (US, EU, APAC)',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const aiFeatures = [
  {
    title: 'Intelligent Assumptions',
    description: 'AI suggests assumptions based on industry benchmarks, comparable companies, and historical data.',
  },
  {
    title: 'Anomaly Detection',
    description: 'Automatically flags potential errors, unusual values, and circular references in your models.',
  },
  {
    title: 'Scenario Generation',
    description: 'Generate bull, bear, and base case scenarios with AI-powered sensitivity analysis.',
  },
  {
    title: 'Natural Language Queries',
    description: 'Ask questions about your model in plain English and get instant, accurate answers.',
  },
];

export function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 via-blue-50/30 to-white py-24 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Enterprise-Ready Features
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Powerful features for
            <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              modern finance teams
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
            Everything you need to build, collaborate on, and share world-class financial models.
            From simple valuations to complex deal structures.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="group w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl hover:from-blue-700 hover:to-violet-700 transition-all shadow-xl shadow-blue-500/25"
            >
              Start Free Trial
              <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all"
            >
              Request Demo
            </button>
          </div>
        </div>
      </section>

      {/* Feature Navigation */}
      <section className="sticky top-16 bg-white/95 backdrop-blur-md border-b border-slate-200 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8 overflow-x-auto py-4 scrollbar-hide">
            {featureCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 whitespace-nowrap transition-colors group"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity"><category.icon /></span>
                {category.title}
              </a>
            ))}
            <a
              href="#ai"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 whitespace-nowrap transition-colors"
            >
              AI Features
            </a>
            <a
              href="#security"
              className="text-sm font-medium text-slate-600 hover:text-blue-600 whitespace-nowrap transition-colors"
            >
              Security
            </a>
          </nav>
        </div>
      </section>

      {/* Feature Categories */}
      {featureCategories.map((category, idx) => (
        <section
          key={category.id}
          id={category.id}
          className={`py-24 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category Header */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
              <div className="max-w-2xl">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${category.gradient} text-white mb-6`}>
                  <category.icon />
                </div>
                <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2">
                  {category.subtitle}
                </p>
                <h2 className="text-4xl font-bold text-slate-900 mb-4">
                  {category.title}
                </h2>
                <p className="text-lg text-slate-600">
                  {category.description}
                </p>
              </div>
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors group"
              >
                Learn more
                <span className="group-hover:translate-x-1 transition-transform"><ArrowRightIcon /></span>
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {category.features.map((feature) => (
                <div
                  key={feature.title}
                  className={`bg-white rounded-2xl p-8 shadow-sm border transition-all duration-300 ${
                    feature.highlight
                      ? 'border-blue-200 hover:border-blue-300 hover:shadow-xl ring-1 ring-blue-100'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-lg'
                  }`}
                >
                  {feature.highlight && (
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-4">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl font-semibold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.capabilities.map((capability) => (
                      <li key={capability} className="flex items-center gap-3 text-sm text-slate-700">
                        <CheckIcon />
                        {capability}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* AI Features Section */}
      <section id="ai" className="py-24 bg-gradient-to-b from-slate-900 to-slate-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500 rounded-full mix-blend-multiply filter blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-6 border border-blue-500/30">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
              </svg>
              Powered by AI
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              AI-powered financial modeling
            </h2>
            <p className="text-xl text-slate-300">
              Leverage cutting-edge AI to build models faster, catch errors earlier, and generate insights automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {aiFeatures.map((feature, idx) => (
              <div
                key={feature.title}
                className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold">{idx + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/register')}
              className="px-8 py-4 text-lg font-semibold text-slate-900 bg-white rounded-2xl hover:bg-slate-100 transition-all shadow-xl"
            >
              Try AI Features Free
            </button>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Enterprise-Grade
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Security & Compliance
            </h2>
            <p className="text-xl text-slate-600">
              Your financial data is protected by the same security standards used by the world's largest banks.
              We take security seriously so you can focus on your work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Compliance Badges */}
          <div className="mt-16 pt-16 border-t border-slate-200">
            <p className="text-center text-sm font-medium text-slate-500 mb-8 uppercase tracking-wider">
              Compliance & Certifications
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {['SOC 2 Type II', 'GDPR Compliant', 'ISO 27001', 'HIPAA Ready', 'PCI DSS'].map((cert) => (
                <div key={cert} className="px-6 py-3 bg-slate-100 rounded-xl">
                  <span className="font-semibold text-slate-600">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-violet-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to see these features in action?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Start your free trial today and experience the power of modern financial modeling.
            No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold text-blue-600 bg-white rounded-2xl hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/pricing')}
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all"
            >
              View Pricing
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
