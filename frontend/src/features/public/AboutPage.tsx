import { useNavigate } from 'react-router-dom';

const team = [
  {
    name: 'David Chen',
    role: 'CEO & Co-Founder',
    bio: 'Former MD at Goldman Sachs with 15 years in investment banking. Led $50B+ in M&A transactions. Harvard MBA.',
    avatar: 'DC',
    gradient: 'from-blue-500 to-cyan-500',
    linkedin: '#',
  },
  {
    name: 'Sarah Mitchell',
    role: 'CTO & Co-Founder',
    bio: 'Ex-Google Staff Engineer. Built trading systems at Citadel. Stanford CS PhD. 20+ patents in distributed computing.',
    avatar: 'SM',
    gradient: 'from-violet-500 to-purple-500',
    linkedin: '#',
  },
  {
    name: 'Michael Park',
    role: 'Chief Product Officer',
    bio: 'Previously product lead at Bloomberg Terminal. Launched 3 successful fintech products. MIT MBA.',
    avatar: 'MP',
    gradient: 'from-emerald-500 to-teal-500',
    linkedin: '#',
  },
  {
    name: 'Jennifer Wu',
    role: 'VP of Engineering',
    bio: 'Former tech lead at Stripe. Built financial APIs serving $100B+ annually. Carnegie Mellon CS.',
    avatar: 'JW',
    gradient: 'from-orange-500 to-amber-500',
    linkedin: '#',
  },
  {
    name: 'Robert Martinez',
    role: 'VP of Sales',
    bio: 'Enterprise sales leader. Scaled ARR from $5M to $100M at two fintech startups. Wharton MBA.',
    avatar: 'RM',
    gradient: 'from-rose-500 to-pink-500',
    linkedin: '#',
  },
  {
    name: 'Emily Thompson',
    role: 'Head of Customer Success',
    bio: 'Former relationship manager at Morgan Stanley Private Wealth. CFA charterholder. Columbia MBA.',
    avatar: 'ET',
    gradient: 'from-indigo-500 to-blue-500',
    linkedin: '#',
  },
];

const investors = [
  { name: 'Sequoia Capital', tier: 'Lead Seed' },
  { name: 'Andreessen Horowitz', tier: 'Series A' },
  { name: 'Accel Partners', tier: 'Series B' },
  { name: 'Index Ventures', tier: 'Series B' },
  { name: 'GIC', tier: 'Strategic' },
  { name: 'Tiger Global', tier: 'Series B' },
];

const milestones = [
  {
    year: '2019',
    title: 'Founded',
    description: 'FinModel Pro founded in San Francisco by David Chen and Sarah Mitchell, combining deep finance expertise with world-class engineering.',
    highlight: true,
  },
  {
    year: '2020',
    title: 'Seed Round',
    description: 'Raised $5M seed round led by Sequoia Capital. Launched beta product to 50 design partners from top investment banks.',
  },
  {
    year: '2021',
    title: 'Series A',
    description: 'Raised $25M Series A led by Andreessen Horowitz. Crossed 100 enterprise customers and launched the Excel add-in.',
  },
  {
    year: '2022',
    title: 'Global Expansion',
    description: 'Opened offices in London and Hong Kong. Launched industry-specific modules for real estate and infrastructure.',
  },
  {
    year: '2023',
    title: 'Series B',
    description: 'Raised $80M Series B at $500M valuation. Crossed 500 customers globally and achieved SOC 2 Type II certification.',
    highlight: true,
  },
  {
    year: '2024',
    title: 'AI Launch',
    description: 'Launched AI-powered scenario analysis and intelligent assumptions. Crossed $50M ARR. Acquired DataComps.io.',
  },
];

const values = [
  {
    title: 'Excellence',
    description: 'We hold ourselves to the highest standards. Our customers trust us with mission-critical financial decisions, and we take that responsibility seriously.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Innovation',
    description: "We constantly push the boundaries of what's possible in financial technology. We embrace new ideas and aren't afraid to challenge the status quo.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Trust',
    description: "Security and reliability are non-negotiable. We protect our customers' data as if it were our own and always deliver on our promises.",
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Customer Focus',
    description: 'Everything we build starts with the customer. We listen, learn, and iterate to deliver solutions that truly solve real problems.',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-500',
  },
];

const offices = [
  {
    city: 'San Francisco',
    country: 'USA',
    address: '100 California St, Suite 2000',
    type: 'Headquarters',
    timezone: 'PST',
    employees: '80+',
  },
  {
    city: 'New York',
    country: 'USA',
    address: '375 Park Avenue, 25th Floor',
    type: 'Sales & Support',
    timezone: 'EST',
    employees: '35+',
  },
  {
    city: 'London',
    country: 'UK',
    address: '30 St Mary Axe, Level 20',
    type: 'EMEA Hub',
    timezone: 'GMT',
    employees: '25+',
  },
  {
    city: 'Hong Kong',
    country: 'China',
    address: 'Two IFC, 88th Floor',
    type: 'APAC Hub',
    timezone: 'HKT',
    employees: '15+',
  },
];

const stats = [
  { value: '500+', label: 'Customers', detail: 'Financial institutions worldwide' },
  { value: '155+', label: 'Employees', detail: 'Across 4 global offices' },
  { value: '$110M', label: 'Funding Raised', detail: 'From top-tier investors' },
  { value: '$500M', label: 'Valuation', detail: 'Series B (2023)' },
];

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 via-blue-50/30 to-white py-24 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Founded 2019 in San Francisco
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Transforming how the world
            <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              builds financial models
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            We're on a mission to give every finance professional the tools they need to build
            world-class models, collaborate seamlessly, and make better decisions faster.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <p className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform">
                  {stat.value}
                </p>
                <p className="text-lg font-semibold text-slate-900">{stat.label}</p>
                <p className="text-sm text-slate-500">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Our Story</p>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Born from frustration,
                <span className="block">built with purpose</span>
              </h2>
              <div className="space-y-5 text-slate-600 leading-relaxed">
                <p>
                  FinModel Pro was born from frustration. After years of building financial models in investment
                  banking, our founders knew there had to be a better way. Spreadsheets were powerful but error-prone.
                  Collaboration was painful. Version control was non-existent.
                </p>
                <p>
                  In 2019, David Chen (former Goldman Sachs MD) and Sarah Mitchell (former Google Staff Engineer)
                  came together to build the financial modeling platform they always wished they had. They combined
                  deep finance expertise with world-class engineering to create something truly new.
                </p>
                <p>
                  Today, FinModel Pro is used by over 500 financial institutions worldwide, from boutique advisory
                  firms to the largest investment banks. We've processed over $2 trillion in transaction value and
                  continue to grow every day.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 to-violet-500/10 rounded-3xl blur-2xl" />
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10">
                <svg className="w-12 h-12 text-blue-400 mb-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <blockquote className="text-2xl font-medium text-white mb-8 leading-relaxed">
                  "We built FinModel Pro to be the tool we always wished we had during our banking days.
                  A platform that combines the flexibility of Excel with the power of modern software."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <span className="text-white text-lg font-bold">DC</span>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">David Chen</p>
                    <p className="text-slate-400">CEO & Co-Founder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Our Journey</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Key milestones</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From a seed-stage startup to a global platform trusted by 500+ institutions
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-violet-500 to-blue-500" />

            <div className="space-y-12 lg:space-y-0">
              {milestones.map((milestone, idx) => (
                <div
                  key={milestone.year}
                  className={`relative lg:flex items-center ${idx % 2 === 0 ? '' : 'lg:flex-row-reverse'}`}
                >
                  <div className={`lg:w-1/2 ${idx % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:pl-16'} mb-8 lg:mb-12`}>
                    <div
                      className={`bg-white rounded-2xl p-8 shadow-sm border transition-all duration-300 hover:shadow-lg ${
                        milestone.highlight ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-200'
                      }`}
                    >
                      <span className={`inline-block px-4 py-1.5 text-sm font-bold rounded-full mb-4 ${
                        milestone.highlight
                          ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {milestone.year}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 mb-3">{milestone.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
                    <div className={`w-5 h-5 rounded-full border-4 border-white shadow-lg ${
                      milestone.highlight ? 'bg-blue-600' : 'bg-slate-400'
                    }`} />
                  </div>
                  <div className="lg:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Our Values</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">The principles that guide us</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              These values shape our culture, decisions, and the way we serve our customers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value) => (
              <div key={value.title} className="group text-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center text-white mx-auto mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Leadership</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Meet the team</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Industry veterans from Goldman Sachs, Google, Bloomberg, and Stripe building the future of financial modeling
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all group"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform shadow-lg`}>
                  <span className="text-white text-2xl font-bold">{member.avatar}</span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-slate-900">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{member.role}</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Investors Section */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-wider mb-10">
            Backed by the world's leading investors
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
            {investors.map((investor) => (
              <div key={investor.name} className="text-center group">
                <span className="text-2xl font-bold text-slate-300 group-hover:text-slate-400 transition-colors">
                  {investor.name}
                </span>
                <p className="text-xs text-slate-400 mt-1">{investor.tier}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">Global Presence</p>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Our offices</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              With teams across the Americas, Europe, and Asia, we're here to support you wherever you are
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offices.map((office) => (
              <div
                key={office.city}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                    {office.type}
                  </span>
                  <span className="text-xs text-slate-400">{office.timezone}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-1">{office.city}</h3>
                <p className="text-sm text-slate-500 mb-4">{office.country}</p>
                <p className="text-sm text-slate-600 mb-4">{office.address}</p>
                <p className="text-sm text-blue-600 font-medium">{office.employees} employees</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Careers CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-violet-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Join our team
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            We're always looking for talented people who are passionate about building great products
            and transforming the financial industry. Check out our open positions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/careers')}
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold text-blue-600 bg-white rounded-2xl hover:bg-slate-50 transition-all shadow-xl"
            >
              View Open Positions
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
