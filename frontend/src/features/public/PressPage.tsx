const pressReleases = [
  {
    date: 'Jan 10, 2024',
    title: 'FinModel Pro Launches AI-Powered Scenario Analysis',
    excerpt: 'New feature automatically generates bull, base, and bear cases for financial models.',
  },
  {
    date: 'Dec 15, 2023',
    title: 'FinModel Pro Raises $80M Series B',
    excerpt: 'Funding round led by Sequoia Capital brings total funding to $110M.',
  },
  {
    date: 'Sep 5, 2023',
    title: 'FinModel Pro Crosses 500 Enterprise Customers',
    excerpt: 'Milestone achievement includes 8 of the top 10 global investment banks.',
  },
  {
    date: 'Jun 20, 2023',
    title: 'FinModel Pro Opens London Office',
    excerpt: 'Expansion into EMEA to better serve European financial institutions.',
  },
  {
    date: 'Mar 1, 2023',
    title: 'FinModel Pro Launches Excel Add-in',
    excerpt: 'New add-in enables seamless bidirectional sync between Excel and cloud.',
  },
];

const newsArticles = [
  {
    publication: 'TechCrunch',
    title: 'FinModel Pro raises $80M to modernize financial modeling',
    date: 'Dec 15, 2023',
  },
  {
    publication: 'Bloomberg',
    title: 'Wall Street banks adopt new modeling platform',
    date: 'Oct 8, 2023',
  },
  {
    publication: 'Financial Times',
    title: 'The fintech startup disrupting investment banking',
    date: 'Aug 22, 2023',
  },
  {
    publication: 'Forbes',
    title: 'FinModel Pro named to Cloud 100 list',
    date: 'Jul 15, 2023',
  },
];

const awards = [
  { name: 'Forbes Cloud 100', year: '2023' },
  { name: 'CB Insights Fintech 250', year: '2023' },
  { name: 'G2 Leader - Financial Modeling', year: '2023' },
  { name: 'Deloitte Fast 500', year: '2022' },
];

export function PressPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Press & Media</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            News, press releases, and media resources from FinModel Pro.
          </p>
        </div>
      </section>

      {/* Press Releases */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Press Releases</h2>
          <div className="space-y-6">
            {pressReleases.map((release, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-6 last:border-0">
                <p className="text-sm text-gray-500 mb-2">{release.date}</p>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 cursor-pointer">
                  {release.title}
                </h3>
                <p className="text-gray-600">{release.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In The News */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">In The News</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {newsArticles.map((article, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <p className="text-sm font-semibold text-blue-600 mb-2">{article.publication}</p>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-sm text-gray-500">{article.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Awards & Recognition</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {awards.map((award, idx) => (
              <div key={idx} className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">{award.name}</h3>
                <p className="text-sm text-gray-500">{award.year}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Media Kit</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Download our brand assets, logos, and executive photos for press use.
          </p>
          <button className="px-8 py-4 text-lg font-medium text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-all">
            Download Media Kit
          </button>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Media Inquiries</h2>
          <p className="text-gray-600 mb-4">For press inquiries, please contact:</p>
          <a href="mailto:press@finmodelpro.com" className="text-lg text-blue-600 hover:underline">
            press@finmodelpro.com
          </a>
        </div>
      </section>
    </div>
  );
}
