import { useNavigate } from 'react-router-dom';

const securityFeatures = [
  {
    icon: '🔐',
    title: 'Encryption',
    description: 'All data is encrypted using AES-256 at rest and TLS 1.3 in transit.',
  },
  {
    icon: '🏢',
    title: 'SOC 2 Type II',
    description: 'Annual third-party audits verify our security, availability, and confidentiality controls.',
  },
  {
    icon: '🔑',
    title: 'Single Sign-On',
    description: 'Enterprise SSO support with SAML 2.0 and OIDC integration.',
  },
  {
    icon: '👁️',
    title: 'Audit Logging',
    description: 'Complete audit trail of all user actions for compliance and security monitoring.',
  },
  {
    icon: '🌐',
    title: 'Data Residency',
    description: 'Choose where your data is stored to meet regulatory requirements.',
  },
  {
    icon: '🛡️',
    title: 'DDoS Protection',
    description: 'Enterprise-grade protection against distributed denial-of-service attacks.',
  },
];

const certifications = [
  { name: 'SOC 2 Type II', description: 'Security, Availability, Confidentiality' },
  { name: 'ISO 27001', description: 'Information Security Management' },
  { name: 'GDPR', description: 'EU Data Protection Compliance' },
  { name: 'CCPA', description: 'California Consumer Privacy Act' },
];

const securityPractices = [
  {
    title: 'Infrastructure Security',
    items: [
      'Hosted on AWS with SOC 2 certified data centers',
      'Multi-region deployment with automatic failover',
      'Network segmentation and firewalls',
      'Regular vulnerability scanning and patching',
      '24/7 infrastructure monitoring',
    ],
  },
  {
    title: 'Application Security',
    items: [
      'Secure development lifecycle (SDLC)',
      'Regular penetration testing by third parties',
      'Static and dynamic code analysis',
      'Dependency vulnerability scanning',
      'Bug bounty program',
    ],
  },
  {
    title: 'Data Protection',
    items: [
      'AES-256 encryption at rest',
      'TLS 1.3 encryption in transit',
      'Key management with HSM',
      'Regular backup and disaster recovery testing',
      'Secure data deletion procedures',
    ],
  },
  {
    title: 'Access Control',
    items: [
      'Role-based access control (RBAC)',
      'Multi-factor authentication (MFA)',
      'Session management and timeout',
      'IP allowlisting for enterprise',
      'Privileged access management',
    ],
  },
];

export function SecurityPage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Enterprise-Grade Security
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            Your financial data is protected by the same security standards used by the world's largest banks
            and financial institutions.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/contact')}
              className="px-8 py-4 text-lg font-medium text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-all"
            >
              Request Security Review
            </button>
            <a
              href="#certifications"
              className="px-8 py-4 text-lg font-medium text-white border border-gray-600 rounded-xl hover:bg-gray-700 transition-all"
            >
              View Certifications
            </a>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Security Features</h2>
            <p className="text-lg text-gray-600">Comprehensive protection for your sensitive financial data</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature) => (
              <div key={feature.title} className="p-6 bg-gray-50 rounded-xl">
                <span className="text-4xl mb-4 block">{feature.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section id="certifications" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Certifications & Compliance</h2>
            <p className="text-lg text-gray-600">Meeting the highest industry standards</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {certifications.map((cert) => (
              <div key={cert.name} className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{cert.name}</h3>
                <p className="text-sm text-gray-600">{cert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Security Practices</h2>
            <p className="text-lg text-gray-600">A comprehensive approach to security</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {securityPractices.map((practice) => (
              <div key={practice.title} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{practice.title}</h3>
                <ul className="space-y-3">
                  {practice.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bug Bounty */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Bug Bounty Program</h2>
              <p className="text-gray-400 mb-6">
                We partner with security researchers to identify and fix vulnerabilities. Our bug bounty
                program rewards responsible disclosure of security issues.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Rewards from $100 to $10,000
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Safe harbor for good-faith research
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Hall of fame recognition
                </li>
              </ul>
              <button className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                Learn More About Bug Bounty
              </button>
            </div>
            <div className="bg-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Report a Vulnerability</h3>
              <p className="text-gray-400 mb-4">
                Found a security issue? Please report it responsibly to our security team.
              </p>
              <p className="text-gray-300 font-mono">
                security@finmodelpro.com
              </p>
              <p className="text-gray-400 text-sm mt-4">
                PGP key available on request for encrypted communication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Have security questions?
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Our security team is happy to discuss our practices and provide additional documentation
            for your security review.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-xl hover:bg-gray-50 transition-all"
          >
            Contact Security Team
          </button>
        </div>
      </section>
    </div>
  );
}
