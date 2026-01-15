export function PrivacyPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last updated: January 15, 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="lead">
            At FinModel Pro, we take your privacy seriously. This Privacy Policy explains how we collect,
            use, disclose, and safeguard your information when you use our platform.
          </p>

          <h2>1. Information We Collect</h2>

          <h3>Information You Provide</h3>
          <p>
            We collect information you provide directly to us, including:
          </p>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Profile information (company, job title)</li>
            <li>Financial model data you create and upload</li>
            <li>Communications with our support team</li>
            <li>Payment and billing information</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <p>
            When you use our platform, we automatically collect:
          </p>
          <ul>
            <li>Device information (browser type, operating system)</li>
            <li>Usage data (features used, actions taken)</li>
            <li>Log data (IP address, access times)</li>
            <li>Cookies and similar technologies</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send technical notices and support messages</li>
            <li>Respond to your comments and questions</li>
            <li>Analyze usage patterns to improve user experience</li>
            <li>Detect and prevent fraud and abuse</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell your personal information. We may share your information in the following situations:
          </p>
          <ul>
            <li><strong>With your consent:</strong> When you authorize us to share your information</li>
            <li><strong>Service providers:</strong> With vendors who assist in providing our services</li>
            <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your data:
          </p>
          <ul>
            <li>AES-256 encryption at rest</li>
            <li>TLS 1.3 encryption in transit</li>
            <li>Regular security audits and penetration testing</li>
            <li>SOC 2 Type II certification</li>
            <li>Access controls and authentication</li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>
            We retain your information for as long as your account is active or as needed to provide services.
            After account deletion, we retain certain information for legal and business purposes for up to
            7 years, after which it is permanently deleted.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            Depending on your location, you may have the following rights:
          </p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
            <li><strong>Deletion:</strong> Request deletion of your data</li>
            <li><strong>Portability:</strong> Request a copy in a portable format</li>
            <li><strong>Opt-out:</strong> Opt-out of marketing communications</li>
          </ul>
          <p>
            To exercise these rights, contact us at privacy@finmodelpro.com.
          </p>

          <h2>7. Cookies</h2>
          <p>
            We use cookies and similar technologies to:
          </p>
          <ul>
            <li>Keep you logged in</li>
            <li>Remember your preferences</li>
            <li>Understand how you use our platform</li>
            <li>Improve our services</li>
          </ul>
          <p>
            You can control cookies through your browser settings. Note that disabling cookies may
            affect the functionality of our platform.
          </p>

          <h2>8. International Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your own.
            We ensure appropriate safeguards are in place, including Standard Contractual Clauses
            approved by the European Commission.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not intended for individuals under 18 years of age. We do not knowingly
            collect personal information from children.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes
            by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us:
          </p>
          <ul>
            <li>Email: privacy@finmodelpro.com</li>
            <li>Address: 100 California Street, Suite 2000, San Francisco, CA 94111</li>
            <li>Data Protection Officer: dpo@finmodelpro.com</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
