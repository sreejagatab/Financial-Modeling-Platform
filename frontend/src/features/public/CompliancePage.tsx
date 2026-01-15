import { useNavigate } from 'react-router-dom';

const frameworks = [
  {
    name: 'SOC 2 Type II',
    description: 'Annual audit verifying security, availability, processing integrity, confidentiality, and privacy controls.',
    status: 'Certified',
    lastAudit: 'October 2023',
  },
  {
    name: 'ISO 27001',
    description: 'International standard for information security management systems.',
    status: 'Certified',
    lastAudit: 'September 2023',
  },
  {
    name: 'GDPR',
    description: 'European Union General Data Protection Regulation compliance.',
    status: 'Compliant',
    lastAudit: 'Ongoing',
  },
  {
    name: 'CCPA',
    description: 'California Consumer Privacy Act compliance.',
    status: 'Compliant',
    lastAudit: 'Ongoing',
  },
  {
    name: 'HIPAA',
    description: 'Health Insurance Portability and Accountability Act (available for healthcare customers).',
    status: 'Available',
    lastAudit: 'Upon Request',
  },
];

const dataHandling = [
  {
    title: 'Data Encryption',
    description: 'All data is encrypted using AES-256 at rest and TLS 1.3 in transit.',
  },
  {
    title: 'Data Residency',
    description: 'Choose where your data is stored: US, EU, or APAC regions.',
  },
  {
    title: 'Data Retention',
    description: 'Configurable retention policies with automatic deletion.',
  },
  {
    title: 'Data Backup',
    description: 'Daily backups with point-in-time recovery up to 30 days.',
  },
  {
    title: 'Data Export',
    description: 'Export all your data in standard formats at any time.',
  },
  {
    title: 'Data Deletion',
    description: 'Complete data deletion within 30 days of account closure.',
  },
];

export function CompliancePage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-6">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Compliance</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            We maintain the highest standards of security and compliance to protect your sensitive financial data.
          </p>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Certifications & Frameworks</h2>
            <p className="text-lg text-gray-600">Industry-standard compliance certifications</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frameworks.map((framework) => (
              <div key={framework.name} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{framework.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    framework.status === 'Certified' ? 'bg-green-100 text-green-700' :
                    framework.status === 'Compliant' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {framework.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{framework.description}</p>
                <p className="text-sm text-gray-500">Last Audit: {framework.lastAudit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Handling */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Data Handling</h2>
            <p className="text-lg text-gray-600">How we protect and manage your data</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dataHandling.map((item) => (
              <div key={item.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subprocessors */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Subprocessors</h2>
            <p className="text-lg text-gray-600">Third-party services that process customer data</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Service</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Purpose</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-4 px-6">Amazon Web Services</td>
                  <td className="py-4 px-6 text-gray-600">Cloud infrastructure</td>
                  <td className="py-4 px-6 text-gray-600">US, EU, APAC</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">Stripe</td>
                  <td className="py-4 px-6 text-gray-600">Payment processing</td>
                  <td className="py-4 px-6 text-gray-600">US</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">SendGrid</td>
                  <td className="py-4 px-6 text-gray-600">Email delivery</td>
                  <td className="py-4 px-6 text-gray-600">US</td>
                </tr>
                <tr>
                  <td className="py-4 px-6">Datadog</td>
                  <td className="py-4 px-6 text-gray-600">Monitoring & logging</td>
                  <td className="py-4 px-6 text-gray-600">US</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            For the complete list of subprocessors, please contact us.
          </p>
        </div>
      </section>

      {/* Documentation */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Whitepaper</h3>
              <p className="text-gray-600 mb-4">Detailed overview of our security architecture.</p>
              <button className="text-blue-600 font-medium hover:text-blue-700">Download PDF</button>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">SOC 2 Report</h3>
              <p className="text-gray-600 mb-4">Request our SOC 2 Type II report.</p>
              <button className="text-blue-600 font-medium hover:text-blue-700">Request Report</button>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">DPA</h3>
              <p className="text-gray-600 mb-4">Data Processing Agreement for GDPR compliance.</p>
              <button className="text-blue-600 font-medium hover:text-blue-700">Download DPA</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Have compliance questions?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Our security and compliance team is happy to discuss your specific requirements.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-xl hover:bg-gray-50 transition-all"
          >
            Contact Compliance Team
          </button>
        </div>
      </section>
    </div>
  );
}
