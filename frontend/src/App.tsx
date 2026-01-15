import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from './shared/components/layout/PublicLayout';
import {
  HomePage,
  FeaturesPage,
  PricingPage,
  AboutPage,
  ContactPage,
  CareersPage,
  BlogPage,
  BlogPostPage,
  JobDetailPage,
  HelpCenterPage,
  DocsPage,
  PrivacyPage,
  TermsPage,
  SecurityPage,
  PressPage,
  TutorialsPage,
  WebinarsPage,
  CompliancePage,
} from './features/public';
import { ErrorBoundary, NotFoundPage } from './shared/components/errors';

// Demo placeholder for auth pages
function ComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center p-8">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h1>
        <p className="text-gray-600 mb-6 max-w-md">
          The full application with financial modeling, valuation tools, and collaboration features is coming soon.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Application error:', error, errorInfo);
      }}
    >
      <Routes>
        {/* Public marketing pages with PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/careers/:jobId" element={<JobDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:postId" element={<BlogPostPage />} />
          <Route path="/help" element={<HelpCenterPage />} />
          <Route path="/docs" element={<DocsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/press" element={<PressPage />} />
          <Route path="/tutorials" element={<TutorialsPage />} />
          <Route path="/webinars" element={<WebinarsPage />} />
          <Route path="/compliance" element={<CompliancePage />} />
        </Route>

        {/* Auth routes - show coming soon */}
        <Route path="/login" element={<ComingSoonPage />} />
        <Route path="/register" element={<ComingSoonPage />} />

        {/* App routes - redirect to coming soon */}
        <Route path="/app/*" element={<ComingSoonPage />} />

        {/* 404 - catch all unmatched routes */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
