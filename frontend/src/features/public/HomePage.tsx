import { useNavigate } from 'react-router-dom';

// Animated gradient background component
const AnimatedBackground = () => (
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
    <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
    <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
  </div>
);

// Icons
const CheckIcon = () => (
  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ModelIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

const CollaborateIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const ExcelIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const SecurityIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const AIIcon = () => (
  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const SparkleIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
  </svg>
);

const features = [
  {
    icon: ModelIcon,
    title: 'Integrated Financial Models',
    description: 'Build sophisticated 3-statement models with automatic linking between income statement, balance sheet, and cash flow.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: ChartIcon,
    title: 'Advanced Valuation Suite',
    description: 'Complete DCF analysis, trading comps, and precedent transactions with dynamic football field visualizations.',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    icon: CollaborateIcon,
    title: 'Real-Time Collaboration',
    description: 'Work simultaneously with your team. Comments, version control, and complete audit trails built in.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: ExcelIcon,
    title: 'Seamless Excel Integration',
    description: 'Bidirectional sync with Excel. Use our add-in to connect your spreadsheets to the cloud platform.',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: SecurityIcon,
    title: 'Enterprise-Grade Security',
    description: 'SOC 2 Type II certified with bank-grade encryption, SSO, and granular access controls.',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    icon: AIIcon,
    title: 'AI-Powered Insights',
    description: 'Leverage AI for scenario analysis, anomaly detection, and intelligent assumptions recommendations.',
    gradient: 'from-indigo-500 to-blue-500',
  },
];

const stats = [
  { value: '500+', label: 'Financial Institutions', sublabel: 'Trust our platform' },
  { value: '$2T+', label: 'Transactions Modeled', sublabel: 'Across all industries' },
  { value: '99.99%', label: 'Uptime SLA', sublabel: 'Enterprise reliability' },
  { value: '<50ms', label: 'Calculation Speed', sublabel: 'Instant recalculation' },
];

const testimonials = [
  {
    quote: "FinModel Pro transformed how our team builds and shares financial models. The collaboration features alone saved us hundreds of hours on complex deals.",
    author: 'Sarah Chen',
    title: 'Managing Director, Investment Banking',
    company: 'Goldman Sachs',
    avatar: 'SC',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    quote: "The Excel integration is seamless. Our analysts can work in their preferred environment while everything stays perfectly synced to the cloud.",
    author: 'Michael Rodriguez',
    title: 'Partner',
    company: 'KKR',
    avatar: 'MR',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    quote: "We evaluated 10 platforms before choosing FinModel Pro. The depth of the LBO and M&A modules is simply unmatched in the industry.",
    author: 'Emily Watson',
    title: 'VP Corporate Development',
    company: 'Microsoft',
    avatar: 'EW',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

const logos = [
  { name: 'Goldman Sachs', short: 'GS' },
  { name: 'Morgan Stanley', short: 'MS' },
  { name: 'JPMorgan', short: 'JPM' },
  { name: 'Blackstone', short: 'BX' },
  { name: 'KKR', short: 'KKR' },
  { name: 'Carlyle', short: 'CG' },
  { name: 'Apollo', short: 'APO' },
  { name: 'Bain Capital', short: 'BC' },
];

const workflowSteps = [
  { step: '01', title: 'Import or Build', description: 'Start from scratch or import existing Excel models' },
  { step: '02', title: 'Collaborate', description: 'Work together in real-time with your team' },
  { step: '03', title: 'Analyze', description: 'Run scenarios and generate insights instantly' },
  { step: '04', title: 'Present', description: 'Export professional reports with one click' },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center bg-gradient-to-b from-slate-50 via-blue-50/30 to-white">
        <AnimatedBackground />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center max-w-5xl mx-auto">
            {/* Announcement Badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-blue-600/10 to-violet-600/10 border border-blue-200/50 rounded-full mb-8 backdrop-blur-sm">
              <span className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                <SparkleIcon />
                New
              </span>
              <span className="w-px h-4 bg-blue-300" />
              <span className="text-slate-600 text-sm">AI-powered scenario analysis is here</span>
              <ArrowRightIcon />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
              <span className="text-slate-900">Financial Modeling</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent">
                Reimagined for Teams
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl lg:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              The enterprise platform where world-class financial models are built,
              analyzed, and shared. Trusted by 500+ leading institutions.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <button
                onClick={() => navigate('/register')}
                className="group w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl hover:from-blue-700 hover:to-violet-700 transition-all shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
              >
                Start Free Trial
                <span className="inline-block ml-2 transition-transform group-hover:translate-x-1">→</span>
              </button>
              <button
                onClick={() => navigate('/features')}
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-slate-700 bg-white/80 backdrop-blur border border-slate-200 rounded-2xl hover:bg-white hover:border-slate-300 transition-all flex items-center justify-center gap-3"
              >
                <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <PlayIcon />
                </span>
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span>14-day free trial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckIcon />
                <span>SOC 2 Type II certified</span>
              </div>
            </div>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />

            {/* Floating Elements */}
            <div className="absolute -left-4 top-20 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-20 hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-medium text-slate-700">3 team members editing</span>
              </div>
            </div>

            <div className="absolute -right-4 top-32 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-20 hidden lg:block">
              <div className="text-xs text-slate-500 mb-1">Auto-saved</div>
              <div className="text-sm font-semibold text-emerald-600">All changes synced</div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
              {/* Window Chrome */}
              <div className="bg-slate-100/80 px-6 py-4 flex items-center gap-4 border-b border-slate-200/50">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 hover:bg-red-500 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400 hover:bg-emerald-500 transition-colors" />
                </div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="px-4 py-1.5 bg-white/60 rounded-lg text-xs text-slate-500 font-medium">
                    FinModel Pro - Acme Corp LBO Analysis
                  </div>
                </div>
                <div className="w-20" />
              </div>

              {/* Dashboard Content */}
              <div className="p-8 bg-gradient-to-br from-slate-50/50 to-slate-100/50 min-h-[350px] lg:min-h-[450px]">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">IRR (5yr)</p>
                    <p className="text-3xl font-bold text-emerald-600">24.3%</p>
                    <p className="text-xs text-emerald-600 mt-1">+2.1% vs base case</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">MOIC</p>
                    <p className="text-3xl font-bold text-blue-600">2.97x</p>
                    <p className="text-xs text-blue-600 mt-1">Equity return multiple</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Exit Value</p>
                    <p className="text-3xl font-bold text-slate-900">$892M</p>
                    <p className="text-xs text-slate-500 mt-1">10.5x exit multiple</p>
                  </div>
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/50 hover:shadow-md transition-shadow">
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Debt Paydown</p>
                    <p className="text-3xl font-bold text-violet-600">68%</p>
                    <p className="text-xs text-violet-600 mt-1">Over holding period</p>
                  </div>
                </div>

                {/* Chart placeholder */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">Sensitivity Analysis</h3>
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">Entry Multiple</span>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">Exit Multiple</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {[...Array(24)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-8 rounded-lg ${
                          i < 8 ? 'bg-red-100' : i < 16 ? 'bg-amber-100' : 'bg-emerald-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-10">
            Trusted by the world's leading financial institutions
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {logos.map((logo) => (
              <div key={logo.name} className="group relative">
                <span className="text-xl font-bold text-slate-300 group-hover:text-slate-400 transition-colors">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <p className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform">
                  {stat.value}
                </p>
                <p className="text-lg font-semibold text-slate-900 mb-1">{stat.label}</p>
                <p className="text-sm text-slate-500">{stat.sublabel}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Powerful Features</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Everything you need to build
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
                world-class models
              </span>
            </h2>
            <p className="text-xl text-slate-600">
              From simple valuations to complex M&A scenarios, our platform handles it all with enterprise-grade reliability.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/features')}
              className="inline-flex items-center gap-2 px-6 py-3 text-blue-600 hover:text-blue-700 font-semibold transition-colors group"
            >
              Explore all features
              <span className="group-hover:translate-x-1 transition-transform"><ArrowRightIcon /></span>
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Simple Workflow</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              From data to insights in minutes
            </h2>
            <p className="text-xl text-slate-600">
              Our intuitive workflow gets you from raw data to presentation-ready analysis faster than ever.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflowSteps.map((item, idx) => (
              <div key={item.step} className="relative">
                {idx < workflowSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-blue-300 to-transparent" />
                )}
                <div className="text-5xl font-bold text-slate-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Testimonials</p>
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Loved by finance professionals
            </h2>
            <p className="text-xl text-slate-600">
              See what industry leaders are saying about FinModel Pro.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.author}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-700 mb-8 text-lg leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center shadow-lg`}>
                    <span className="text-white text-sm font-bold">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{testimonial.author}</p>
                    <p className="text-sm text-slate-500">{testimonial.title}</p>
                    <p className="text-sm text-blue-600 font-medium">{testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-violet-600 to-blue-700 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to transform your
            <span className="block">financial modeling?</span>
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Join 500+ financial institutions already using FinModel Pro to build better models, faster.
            Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold text-blue-600 bg-white rounded-2xl hover:bg-slate-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all"
            >
              Talk to Sales
            </button>
          </div>
          <p className="text-blue-200 text-sm mt-8">
            No credit card required. 14-day free trial.
          </p>
        </div>
      </section>
    </div>
  );
}
