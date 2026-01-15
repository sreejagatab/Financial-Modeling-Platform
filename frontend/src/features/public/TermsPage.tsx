export function TermsPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Last updated: January 15, 2024</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="lead">
            Welcome to FinModel Pro. By using our services, you agree to these Terms of Service.
            Please read them carefully.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using FinModel Pro ("Service"), you agree to be bound by these Terms of Service
            ("Terms"). If you do not agree to these Terms, you may not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            FinModel Pro provides a cloud-based platform for financial modeling, valuation analysis,
            and collaboration. The Service includes web applications, APIs, Excel add-ins, and related
            documentation.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            To use the Service, you must:
          </p>
          <ul>
            <li>Create an account with accurate, complete information</li>
            <li>Be at least 18 years old</li>
            <li>Maintain the security of your account credentials</li>
            <li>Promptly notify us of any unauthorized use</li>
          </ul>
          <p>
            You are responsible for all activities that occur under your account.
          </p>

          <h2>4. Subscription and Billing</h2>
          <h3>4.1 Subscription Plans</h3>
          <p>
            We offer various subscription plans with different features and pricing. Plan details are
            available on our pricing page.
          </p>

          <h3>4.2 Payment</h3>
          <p>
            You agree to pay all fees associated with your subscription plan. Fees are billed in advance
            on a monthly or annual basis based on your plan selection.
          </p>

          <h3>4.3 Automatic Renewal</h3>
          <p>
            Subscriptions automatically renew unless cancelled before the renewal date. You may cancel
            at any time from your account settings.
          </p>

          <h3>4.4 Refunds</h3>
          <p>
            We offer a 14-day money-back guarantee for new subscriptions. After this period, fees are
            non-refundable except as required by law.
          </p>

          <h2>5. User Content</h2>
          <h3>5.1 Ownership</h3>
          <p>
            You retain all rights to the financial models, data, and content you create or upload to
            the Service ("User Content"). We do not claim ownership of your User Content.
          </p>

          <h3>5.2 License to Us</h3>
          <p>
            You grant us a limited license to store, process, and display your User Content solely to
            provide the Service. This license terminates when you delete your content or account.
          </p>

          <h3>5.3 Responsibility</h3>
          <p>
            You are solely responsible for your User Content. You represent that you have all necessary
            rights to use and share your User Content.
          </p>

          <h2>6. Acceptable Use</h2>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Violate any laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Upload malicious code or content</li>
            <li>Attempt to gain unauthorized access</li>
            <li>Interfere with the Service's operation</li>
            <li>Resell or redistribute the Service</li>
            <li>Use the Service for illegal financial activities</li>
          </ul>

          <h2>7. Intellectual Property</h2>
          <p>
            The Service, including its code, design, and features, is owned by FinModel Pro and protected
            by intellectual property laws. You may not copy, modify, or distribute any part of the Service
            without our written permission.
          </p>

          <h2>8. Confidentiality</h2>
          <p>
            We treat your User Content as confidential and will not access, use, or disclose it except
            as necessary to provide the Service, with your consent, or as required by law.
          </p>

          <h2>9. Third-Party Services</h2>
          <p>
            The Service may integrate with third-party services. Your use of such services is governed
            by their respective terms. We are not responsible for third-party services.
          </p>

          <h2>10. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM ALL WARRANTIES,
            EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
            NON-INFRINGEMENT.
          </p>
          <p>
            The Service is a tool for financial analysis and does not constitute financial advice.
            You are responsible for your financial decisions.
          </p>

          <h2>11. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, FINMODEL PRO SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
          </p>
          <p>
            Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
          </p>

          <h2>12. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless FinModel Pro from any claims, damages, or expenses
            arising from your use of the Service or violation of these Terms.
          </p>

          <h2>13. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service at any time for violation of these
            Terms or for any other reason. Upon termination, your right to use the Service ceases
            immediately.
          </p>

          <h2>14. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will notify you of material changes by email or
            through the Service. Continued use after changes constitutes acceptance.
          </p>

          <h2>15. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of California, without regard to conflict
            of law principles. Any disputes shall be resolved in the courts of San Francisco, California.
          </p>

          <h2>16. Contact</h2>
          <p>
            For questions about these Terms, contact us:
          </p>
          <ul>
            <li>Email: legal@finmodelpro.com</li>
            <li>Address: 100 California Street, Suite 2000, San Francisco, CA 94111</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
