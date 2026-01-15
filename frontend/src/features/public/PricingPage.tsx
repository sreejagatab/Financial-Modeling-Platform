import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CheckIcon = () => (
  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

interface PricingTier {
  name: string;
  description: string;
  monthlyPrice: number | null;
  annualPrice: number | null;
  features: string[];
  highlighted?: boolean;
  cta: string;
  ctaAction: 'trial' | 'contact';
  badge?: string;
  gradient: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Starter',
    description: 'Perfect for individuals and small teams getting started with financial modeling.',
    monthlyPrice: 99,
    annualPrice: 79,
    cta: 'Start Free Trial',
    ctaAction: 'trial',
    gradient: 'from-slate-600 to-slate-700',
    features: [
      'Up to 3 users',
      '10 active models',
      '3-Statement modeling',
      'DCF valuation',
      'Basic collaboration',
      'Email support',
      '30-day version history',
      'PDF export',
    ],
  },
  {
    name: 'Professional',
    description: 'For growing teams that need advanced modeling capabilities and integrations.',
    monthlyPrice: 249,
    annualPrice: 199,
    cta: 'Start Free Trial',
    ctaAction: 'trial',
    highlighted: true,
    badge: 'Most Popular',
    gradient: 'from-blue-600 to-violet-600',
    features: [
      'Up to 10 users',
      'Unlimited models',
      'LBO & M&A modeling',
      'Trading comps & precedents',
      'Real-time collaboration',
      'Excel add-in',
      'Priority support',
      '1-year version history',
      'Custom templates',
      'API access (limited)',
    ],
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with advanced security, compliance, and customization needs.',
    monthlyPrice: null,
    annualPrice: null,
    cta: 'Contact Sales',
    ctaAction: 'contact',
    gradient: 'from-slate-800 to-slate-900',
    features: [
      'Unlimited users',
      'Unlimited models',
      'All model types',
      'Industry-specific modules',
      'SSO & SAML',
      'Full API access',
      'Dedicated support',
      'Unlimited version history',
      'Custom integrations',
      'On-premise option',
      'SLA guarantee',
      'Training & onboarding',
    ],
  },
];

const comparisonFeatures = [
  {
    category: 'Models & Limits',
    features: [
      { name: 'Active models', starter: '10', professional: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'Users included', starter: 'Up to 3', professional: 'Up to 10', enterprise: 'Unlimited' },
      { name: 'Storage', starter: '5 GB', professional: '50 GB', enterprise: 'Unlimited' },
      { name: 'Calculation speed', starter: 'Standard', professional: 'Priority', enterprise: 'Dedicated' },
    ],
  },
  {
    category: 'Model Types',
    features: [
      { name: '3-Statement Model', starter: true, professional: true, enterprise: true },
      { name: 'DCF Valuation', starter: true, professional: true, enterprise: true },
      { name: 'Operating Model', starter: true, professional: true, enterprise: true },
      { name: 'LBO Analysis', starter: false, professional: true, enterprise: true },
      { name: 'M&A / Merger Model', starter: false, professional: true, enterprise: true },
      { name: 'Trading Comps', starter: false, professional: true, enterprise: true },
      { name: 'Precedent Transactions', starter: false, professional: true, enterprise: true },
      { name: 'REIT / NAV Model', starter: false, professional: false, enterprise: true },
      { name: 'Sale-Leaseback', starter: false, professional: false, enterprise: true },
      { name: 'Infrastructure / Project Finance', starter: false, professional: false, enterprise: true },
    ],
  },
  {
    category: 'Collaboration',
    features: [
      { name: 'Real-time editing', starter: 'Basic', professional: 'Full', enterprise: 'Full' },
      { name: 'Comments & annotations', starter: true, professional: true, enterprise: true },
      { name: 'Version history', starter: '30 days', professional: '1 year', enterprise: 'Unlimited' },
      { name: 'Approval workflows', starter: false, professional: true, enterprise: true },
      { name: 'Team management', starter: false, professional: true, enterprise: true },
    ],
  },
  {
    category: 'Integrations',
    features: [
      { name: 'Excel add-in', starter: false, professional: true, enterprise: true },
      { name: 'PDF export', starter: true, professional: true, enterprise: true },
      { name: 'PowerPoint export', starter: false, professional: true, enterprise: true },
      { name: 'API access', starter: false, professional: 'Limited', enterprise: 'Full' },
      { name: 'Custom integrations', starter: false, professional: false, enterprise: true },
      { name: 'Webhooks', starter: false, professional: false, enterprise: true },
    ],
  },
  {
    category: 'Security & Compliance',
    features: [
      { name: 'SSO / SAML', starter: false, professional: false, enterprise: true },
      { name: 'Audit logging', starter: 'Basic', professional: 'Full', enterprise: 'Full' },
      { name: 'Data residency options', starter: false, professional: false, enterprise: true },
      { name: 'Custom retention policies', starter: false, professional: false, enterprise: true },
    ],
  },
  {
    category: 'Support',
    features: [
      { name: 'Support channel', starter: 'Email', professional: 'Priority Email + Chat', enterprise: 'Dedicated Team' },
      { name: 'Response time', starter: '48 hours', professional: '4 hours', enterprise: '1 hour' },
      { name: 'SLA guarantee', starter: false, professional: false, enterprise: true },
      { name: 'Training & onboarding', starter: false, professional: 'Self-serve', enterprise: 'White-glove' },
    ],
  },
];

const faqs = [
  {
    question: 'How does the 14-day free trial work?',
    answer: 'Start with a full-featured 14-day trial of any plan. No credit card required. At the end of your trial, choose the plan that fits your needs or continue with our free tier.',
  },
  {
    question: 'Can I change plans anytime?',
    answer: "Yes, upgrade or downgrade anytime. When upgrading, you'll be prorated for the remaining billing period. Downgrades take effect at the next billing cycle. Your data is never lost when changing plans.",
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express). Enterprise customers can pay via ACH, wire transfer, or invoicing with NET-30 terms.',
  },
  {
    question: 'Is there a discount for annual billing?',
    answer: 'Yes, save 20% when you choose annual billing on Starter and Professional plans. Enterprise pricing is customized based on your specific needs.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'Your data remains accessible for 30 days after cancellation. You can export all your models during this period. After 30 days, data is permanently deleted per our retention policy.',
  },
  {
    question: 'Do you offer educational or nonprofit discounts?',
    answer: 'Yes, we offer special pricing for educational institutions and registered nonprofits. Contact our sales team with verification documents to learn more.',
  },
  {
    question: 'Can I export my models if I leave?',
    answer: 'Absolutely. You own your data. Export any model to Excel at any time. Enterprise customers can also use our API for bulk exports.',
  },
  {
    question: 'How secure is my financial data?',
    answer: "Very secure. We're SOC 2 Type II certified with bank-grade AES-256 encryption at rest and TLS 1.3 in transit. Enterprise customers can choose their data residency region.",
  },
];

export function PricingPage() {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('annual');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-slate-50 via-blue-50/30 to-white py-24 lg:py-32">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-8">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            14-Day Free Trial on All Plans
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            Simple, transparent
            <span className="block bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              pricing
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10">
            Choose the plan that fits your team. Start with a free trial,
            upgrade as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                billingPeriod === 'annual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annual
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-3xl p-8 transition-all duration-300 ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-2xl shadow-blue-500/25 scale-105 lg:scale-110 z-10'
                    : 'bg-white border border-slate-200 hover:border-slate-300 hover:shadow-xl'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 text-xs font-bold rounded-full shadow-lg">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className={`text-2xl font-bold mb-2 ${tier.highlighted ? 'text-white' : 'text-slate-900'}`}>
                    {tier.name}
                  </h3>
                  <p className={`text-sm leading-relaxed ${tier.highlighted ? 'text-blue-100' : 'text-slate-600'}`}>
                    {tier.description}
                  </p>
                </div>

                <div className="mb-8">
                  {tier.monthlyPrice !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className={`text-5xl font-bold tracking-tight ${tier.highlighted ? 'text-white' : 'text-slate-900'}`}>
                        ${billingPeriod === 'annual' ? tier.annualPrice : tier.monthlyPrice}
                      </span>
                      <span className={`text-lg ${tier.highlighted ? 'text-blue-100' : 'text-slate-500'}`}>
                        /user/mo
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-baseline">
                      <span className={`text-4xl font-bold ${tier.highlighted ? 'text-white' : 'text-slate-900'}`}>
                        Custom
                      </span>
                    </div>
                  )}
                  {billingPeriod === 'annual' && tier.monthlyPrice !== null && (
                    <p className={`text-sm mt-2 ${tier.highlighted ? 'text-blue-200' : 'text-slate-500'}`}>
                      Billed annually (${((tier.annualPrice || 0) * 12).toLocaleString()}/user/year)
                    </p>
                  )}
                </div>

                <button
                  onClick={() => tier.ctaAction === 'trial' ? navigate('/register') : navigate('/contact')}
                  className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all mb-8 ${
                    tier.highlighted
                      ? 'bg-white text-blue-600 hover:bg-slate-50 shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 shadow-lg shadow-blue-500/25'
                  }`}
                >
                  {tier.cta}
                </button>

                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`mt-0.5 ${tier.highlighted ? 'text-emerald-300' : ''}`}>
                        <CheckIcon />
                      </div>
                      <span className={`text-sm ${tier.highlighted ? 'text-blue-50' : 'text-slate-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Enterprise Callout */}
          <div className="mt-16 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 lg:p-12 text-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Need a custom solution for your organization?
            </h3>
            <p className="text-slate-300 max-w-2xl mx-auto mb-8">
              Our enterprise team will work with you to create a tailored solution that meets
              your specific security, compliance, and workflow requirements.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => navigate('/contact')}
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-slate-900 bg-white rounded-2xl hover:bg-slate-100 transition-all"
              >
                Talk to Sales
              </button>
              <button
                onClick={() => navigate('/features')}
                className="w-full sm:w-auto px-8 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all"
              >
                See All Features
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Compare plans in detail</h2>
            <p className="text-lg text-slate-600">See all features side by side to find the right fit</p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-6 px-6 font-semibold text-slate-900 w-1/3 bg-slate-50">
                      Features
                    </th>
                    <th className="text-center py-6 px-6 font-semibold text-slate-900 bg-slate-50">
                      <div className="flex flex-col items-center">
                        <span>Starter</span>
                        <span className="text-sm font-normal text-slate-500 mt-1">$79/user/mo</span>
                      </div>
                    </th>
                    <th className="text-center py-6 px-6 font-semibold text-blue-600 bg-blue-50/50">
                      <div className="flex flex-col items-center">
                        <span className="flex items-center gap-2">
                          Professional
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                            Popular
                          </span>
                        </span>
                        <span className="text-sm font-normal text-slate-500 mt-1">$199/user/mo</span>
                      </div>
                    </th>
                    <th className="text-center py-6 px-6 font-semibold text-slate-900 bg-slate-50">
                      <div className="flex flex-col items-center">
                        <span>Enterprise</span>
                        <span className="text-sm font-normal text-slate-500 mt-1">Custom</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((category) => (
                    <>
                      <tr key={category.category} className="bg-slate-100/50">
                        <td colSpan={4} className="py-4 px-6 font-semibold text-slate-800 text-sm uppercase tracking-wider">
                          {category.category}
                        </td>
                      </tr>
                      {category.features.map((feature) => (
                        <tr key={feature.name} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 text-sm text-slate-700">{feature.name}</td>
                          <td className="py-4 px-6 text-center">
                            {typeof feature.starter === 'boolean' ? (
                              <div className="flex justify-center">
                                {feature.starter ? <CheckIcon /> : <XIcon />}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-600">{feature.starter}</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center bg-blue-50/30">
                            {typeof feature.professional === 'boolean' ? (
                              <div className="flex justify-center">
                                {feature.professional ? <CheckIcon /> : <XIcon />}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-600 font-medium">{feature.professional}</span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-center">
                            {typeof feature.enterprise === 'boolean' ? (
                              <div className="flex justify-center">
                                {feature.enterprise ? <CheckIcon /> : <XIcon />}
                              </div>
                            ) : (
                              <span className="text-sm text-slate-600">{feature.enterprise}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-slate-600">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-slate-100/50 transition-colors"
                >
                  <span className="font-semibold text-slate-900">{faq.question}</span>
                  <div
                    className={`flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center transition-transform ${
                      expandedFaq === idx ? 'rotate-180 bg-blue-100' : ''
                    }`}
                  >
                    <ChevronDownIcon />
                  </div>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedFaq === idx ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-slate-600">Financial institutions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">$2T+</div>
              <div className="text-slate-600">Transactions modeled</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">99.99%</div>
              <div className="text-slate-600">Uptime SLA</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">4.9/5</div>
              <div className="text-slate-600">Customer rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-violet-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNGRkYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Still have questions?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10">
            Our team is here to help. Schedule a call to discuss your specific needs
            and find the perfect plan for your organization.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/contact')}
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold text-blue-600 bg-white rounded-2xl hover:bg-slate-50 transition-all shadow-xl"
            >
              Contact Sales
            </button>
            <button
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto px-10 py-4 text-lg font-semibold text-white border-2 border-white/30 rounded-2xl hover:bg-white/10 transition-all"
            >
              Start Free Trial
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
