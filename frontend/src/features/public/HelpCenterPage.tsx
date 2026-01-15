import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const categories = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Learn the basics of FinModel Pro',
    icon: '🚀',
    articles: [
      { title: 'Quick Start Guide', views: 12453 },
      { title: 'Creating Your First Model', views: 8932 },
      { title: 'Understanding the Interface', views: 6721 },
      { title: 'Keyboard Shortcuts', views: 4532 },
    ],
  },
  {
    id: 'modeling',
    title: 'Financial Modeling',
    description: 'Build and manage financial models',
    icon: '📊',
    articles: [
      { title: '3-Statement Model Tutorial', views: 15234 },
      { title: 'Building an LBO Model', views: 11432 },
      { title: 'DCF Valuation Guide', views: 9876 },
      { title: 'Working with Scenarios', views: 7654 },
    ],
  },
  {
    id: 'collaboration',
    title: 'Collaboration',
    description: 'Work together with your team',
    icon: '👥',
    articles: [
      { title: 'Sharing Models', views: 8765 },
      { title: 'Real-time Collaboration', views: 6543 },
      { title: 'Comments and Annotations', views: 5432 },
      { title: 'Version Control', views: 4321 },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connect with other tools',
    icon: '🔗',
    articles: [
      { title: 'Excel Add-in Setup', views: 9876 },
      { title: 'API Documentation', views: 7654 },
      { title: 'Data Imports', views: 5432 },
      { title: 'Export Options', views: 4321 },
    ],
  },
  {
    id: 'account',
    title: 'Account & Billing',
    description: 'Manage your account settings',
    icon: '⚙️',
    articles: [
      { title: 'Managing Your Subscription', views: 6543 },
      { title: 'User Permissions', views: 5432 },
      { title: 'Billing FAQ', views: 4321 },
      { title: 'Changing Your Plan', views: 3210 },
    ],
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Keep your data safe',
    icon: '🔒',
    articles: [
      { title: 'Security Overview', views: 5432 },
      { title: 'Two-Factor Authentication', views: 4321 },
      { title: 'Data Encryption', views: 3210 },
      { title: 'Compliance Certifications', views: 2109 },
    ],
  },
];

const popularArticles = [
  { title: 'Quick Start Guide', category: 'Getting Started', views: 12453 },
  { title: '3-Statement Model Tutorial', category: 'Modeling', views: 15234 },
  { title: 'Building an LBO Model', category: 'Modeling', views: 11432 },
  { title: 'Excel Add-in Setup', category: 'Integrations', views: 9876 },
  { title: 'DCF Valuation Guide', category: 'Modeling', views: 9876 },
];

export function HelpCenterPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            How can we help?
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Search our knowledge base or browse categories below
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for articles..."
              className="w-full pl-12 pr-4 py-4 rounded-xl border-0 text-lg focus:ring-2 focus:ring-white shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Popular Articles</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {popularArticles.map((article, idx) => (
              <a
                key={idx}
                href={`/help/article/${idx}`}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 mb-1">{article.title}</p>
                <p className="text-xs text-gray-500">{article.category}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-3xl">{category.icon}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {category.articles.map((article, idx) => (
                    <li key={idx}>
                      <a
                        href={`/help/${category.id}/${idx}`}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center justify-between"
                      >
                        <span>{article.title}</span>
                        <span className="text-gray-400 text-xs">{article.views.toLocaleString()} views</span>
                      </a>
                    </li>
                  ))}
                </ul>
                <a
                  href={`/help/${category.id}`}
                  className="inline-block mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View all articles →
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tutorials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Video Tutorials</h2>
            <a href="/tutorials" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View all →
            </a>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Getting Started with FinModel Pro', duration: '5:32' },
              { title: 'Building Your First LBO Model', duration: '12:45' },
              { title: 'Mastering DCF Valuation', duration: '18:20' },
            ].map((video, idx) => (
              <div key={idx} className="group cursor-pointer">
                <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl h-48 mb-3 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {video.duration}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                  {video.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Live Chat</h3>
              <p className="text-gray-400 text-sm mb-4">Chat with our support team in real-time</p>
              <button className="px-4 py-2 text-sm font-medium text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                Start Chat
              </button>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Email Support</h3>
              <p className="text-gray-400 text-sm mb-4">Get a response within 24 hours</p>
              <button
                onClick={() => navigate('/contact')}
                className="px-4 py-2 text-sm font-medium text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
              >
                Contact Us
              </button>
            </div>

            <div className="text-center p-6">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
              <p className="text-gray-400 text-sm mb-4">Join our community forum</p>
              <button className="px-4 py-2 text-sm font-medium text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors">
                Join Forum
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
