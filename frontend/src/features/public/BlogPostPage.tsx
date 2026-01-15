import { useParams, Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: 'Advanced DCF Modeling: Best Practices for 2024',
    category: 'Valuation',
    date: 'Jan 8, 2024',
    readTime: '8 min read',
    author: 'Sarah Chen',
    authorRole: 'Head of Valuation',
    authorAvatar: 'SC',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
    content: `
      <p>Discounted Cash Flow (DCF) modeling remains one of the most fundamental and widely-used valuation methodologies in finance. As we enter 2024, it's crucial to understand the best practices that can help you build more accurate and defensible models.</p>

      <h2>1. Start with a Solid Foundation</h2>
      <p>Before diving into projections, ensure you have a thorough understanding of the company's historical performance. Analyze at least 3-5 years of financial statements to identify trends, seasonality, and any one-time items that need to be normalized.</p>

      <h2>2. Revenue Build-Up Approach</h2>
      <p>Rather than simply growing revenue at an assumed rate, build up your revenue forecast using key drivers specific to the business. This might include:</p>
      <ul>
        <li>Volume × Price for product companies</li>
        <li>Users × ARPU for SaaS businesses</li>
        <li>Square footage × Revenue per sqft for retail</li>
      </ul>

      <h2>3. Margin Analysis</h2>
      <p>Don't just assume margins stay constant or improve linearly. Consider the operating leverage inherent in the business model, competitive dynamics, and potential scale benefits or diseconomies.</p>

      <h2>4. Working Capital Considerations</h2>
      <p>Many analysts overlook working capital's impact on free cash flow. Model each component (receivables, inventory, payables) based on historical days ratios and expected changes in business dynamics.</p>

      <h2>5. WACC Calculation</h2>
      <p>Your discount rate should reflect the true cost of capital. Key considerations include:</p>
      <ul>
        <li>Risk-free rate based on government bond yields</li>
        <li>Equity risk premium appropriate for the market</li>
        <li>Beta reflecting systematic risk</li>
        <li>Company-specific risk adjustments</li>
      </ul>

      <h2>6. Terminal Value</h2>
      <p>The terminal value often represents 60-80% of enterprise value. Use both the Gordon Growth Model and Exit Multiple approaches, and ensure your assumptions are reasonable (growth rates should not exceed long-term GDP growth).</p>

      <h2>Conclusion</h2>
      <p>A well-constructed DCF model is a powerful tool for understanding intrinsic value. By following these best practices and maintaining intellectual rigor throughout your analysis, you'll produce more reliable valuations that stand up to scrutiny.</p>
    `,
  },
  {
    id: 2,
    title: 'The Future of Financial Modeling: AI and Automation',
    category: 'Industry Trends',
    date: 'Jan 5, 2024',
    readTime: '6 min read',
    author: 'Michael Torres',
    authorRole: 'CTO',
    authorAvatar: 'MT',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    content: `
      <p>Artificial intelligence is transforming every aspect of finance, and financial modeling is no exception. Here's what finance professionals need to know about the future of their craft.</p>

      <h2>The Current State</h2>
      <p>Today's financial models are still largely built manually in spreadsheets. While powerful, this approach has limitations in terms of speed, accuracy, and scalability.</p>

      <h2>Where AI Adds Value</h2>
      <p>AI and machine learning can enhance financial modeling in several key areas:</p>
      <ul>
        <li><strong>Data gathering:</strong> Automated extraction from financial statements and reports</li>
        <li><strong>Scenario analysis:</strong> AI can generate and test thousands of scenarios instantly</li>
        <li><strong>Error detection:</strong> ML algorithms can identify formula errors and inconsistencies</li>
        <li><strong>Predictive analytics:</strong> Better forecasting through pattern recognition</li>
      </ul>

      <h2>The Human Element</h2>
      <p>Despite AI advances, human judgment remains essential. Understanding business context, making qualitative assessments, and communicating findings effectively are skills that can't be automated.</p>

      <h2>Preparing for the Future</h2>
      <p>Finance professionals should embrace these tools while continuing to develop core analytical skills. The most valuable analysts will be those who can leverage AI to enhance their work while providing the strategic insight that machines cannot.</p>
    `,
  },
  {
    id: 3,
    title: 'LBO Modeling: A Step-by-Step Guide',
    category: 'Deal Modeling',
    date: 'Dec 28, 2023',
    readTime: '12 min read',
    author: 'Emily Watson',
    authorRole: 'VP, Private Equity',
    authorAvatar: 'EW',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
    content: `
      <p>Leveraged buyout (LBO) modeling is a critical skill for anyone working in private equity, investment banking, or corporate development. This guide walks through the key components of building a comprehensive LBO model.</p>

      <h2>Understanding the LBO Structure</h2>
      <p>An LBO involves acquiring a company using a significant amount of debt. The goal is to generate returns through operational improvements, deleveraging, and eventual exit at a higher valuation.</p>

      <h2>Key Model Components</h2>

      <h3>1. Sources and Uses</h3>
      <p>Start by mapping out where the money comes from (equity, debt tranches) and where it goes (purchase price, fees, cash to balance sheet).</p>

      <h3>2. Debt Schedule</h3>
      <p>Model each debt tranche with its specific terms: interest rate, amortization, covenants, and prepayment provisions.</p>

      <h3>3. Operating Model</h3>
      <p>Project the company's financial performance, including revenue growth, margin expansion, and capital expenditure requirements.</p>

      <h3>4. Exit Analysis</h3>
      <p>Model different exit scenarios with varying holding periods and exit multiples to understand the range of potential returns.</p>

      <h2>Return Metrics</h2>
      <p>Key metrics in LBO analysis include:</p>
      <ul>
        <li><strong>IRR:</strong> Internal rate of return measuring time-weighted returns</li>
        <li><strong>MOIC:</strong> Multiple of invested capital (cash-on-cash return)</li>
        <li><strong>Cash yield:</strong> Annual cash distributions as a percentage of equity</li>
      </ul>

      <h2>Sensitivity Analysis</h2>
      <p>Run sensitivities on key drivers like entry/exit multiple, revenue growth, and EBITDA margin to understand how returns change under different scenarios.</p>
    `,
  },
  {
    id: 4,
    title: 'Merger Model Fundamentals: Accretion/Dilution Analysis',
    category: 'Deal Modeling',
    date: 'Dec 20, 2023',
    readTime: '10 min read',
    author: 'James Park',
    authorRole: 'Managing Director, M&A',
    authorAvatar: 'JP',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
    content: `
      <p>Understanding whether a proposed merger will be accretive or dilutive to earnings per share (EPS) is fundamental to M&A analysis. This article covers the key concepts and mechanics of accretion/dilution analysis.</p>

      <h2>What is Accretion/Dilution?</h2>
      <p>A merger is accretive if the combined company's EPS is higher than the acquirer's standalone EPS. It's dilutive if EPS decreases. This analysis helps acquirers understand the immediate financial impact of a transaction.</p>

      <h2>Key Drivers</h2>

      <h3>Purchase Price</h3>
      <p>Higher purchase prices generally lead to more dilution, as the acquirer pays more for each dollar of target earnings.</p>

      <h3>Consideration Mix</h3>
      <p>Cash deals funded with debt add interest expense but no shares. Stock deals add shares but no interest. The optimal mix depends on relative valuations and cost of capital.</p>

      <h3>Synergies</h3>
      <p>Revenue and cost synergies can offset dilution. The key is to model realistic synergy estimates with appropriate timing and achievement risk.</p>

      <h2>Building the Model</h2>
      <ol>
        <li>Project standalone financials for both companies</li>
        <li>Model the transaction structure and financing</li>
        <li>Calculate purchase accounting adjustments</li>
        <li>Combine the companies and add synergies</li>
        <li>Calculate pro forma EPS and compare to standalone</li>
      </ol>

      <h2>Beyond EPS</h2>
      <p>While accretion/dilution is important, it shouldn't be the only consideration. Strategic rationale, synergy potential, integration risk, and long-term value creation are equally important factors.</p>
    `,
  },
  {
    id: 5,
    title: 'Real Estate Valuation: NAV vs. Cap Rate Approaches',
    category: 'Real Estate',
    date: 'Dec 15, 2023',
    readTime: '9 min read',
    author: 'Lisa Chen',
    authorRole: 'Director, Real Estate',
    authorAvatar: 'LC',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800',
    content: `
      <p>Real estate valuation requires specialized approaches that differ from traditional corporate valuation. The two most common methodologies are Net Asset Value (NAV) and Capitalization Rate approaches.</p>

      <h2>Net Asset Value (NAV)</h2>
      <p>NAV analysis values a real estate company by summing the individual values of its properties and adjusting for other assets and liabilities.</p>

      <h3>Steps in NAV Analysis</h3>
      <ul>
        <li>Value each property using direct cap or DCF</li>
        <li>Add value of land and development projects</li>
        <li>Include other assets (cash, receivables)</li>
        <li>Subtract debt and other liabilities</li>
        <li>Divide by shares outstanding for NAV per share</li>
      </ul>

      <h2>Capitalization Rate Approach</h2>
      <p>The cap rate approach values properties based on their net operating income (NOI) divided by an appropriate capitalization rate.</p>

      <p><strong>Property Value = NOI / Cap Rate</strong></p>

      <h3>Selecting Cap Rates</h3>
      <p>Cap rates vary by property type, location, quality, and market conditions. Sources include:</p>
      <ul>
        <li>Recent comparable transactions</li>
        <li>Published cap rate surveys</li>
        <li>Broker opinions and market research</li>
      </ul>

      <h2>When to Use Each</h2>
      <p>NAV is most useful for companies with diverse property portfolios. Cap rate analysis works well for individual properties or portfolios with similar assets. Most analysts use both approaches to triangulate value.</p>
    `,
  },
];

export function BlogPostPage() {
  const { postId } = useParams();
  const post = blogPosts.find((p) => p.id === Number(postId));

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts.filter((p) => p.id !== post.id && p.category === post.category).slice(0, 2);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog
          </Link>
          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-4">
            {post.category}
          </span>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">{post.title}</h1>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">{post.authorAvatar}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{post.author}</p>
              <p className="text-sm text-gray-500">{post.authorRole}</p>
            </div>
            <span className="text-gray-300">|</span>
            <p className="text-sm text-gray-500">{post.date}</p>
            <span className="text-gray-300">|</span>
            <p className="text-sm text-gray-500">{post.readTime}</p>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="aspect-video bg-gray-200 rounded-2xl overflow-hidden">
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <svg className="w-24 h-24 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <article
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </section>

      {/* Share */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="border-t border-b border-gray-200 py-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 font-medium">Share this article</p>
            <div className="flex items-center gap-3">
              <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </button>
              <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </button>
              <button className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Author */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gray-50 rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-2xl font-medium">{post.authorAvatar}</span>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Written by</p>
              <h3 className="text-xl font-bold text-gray-900 mb-1">{post.author}</h3>
              <p className="text-gray-600 mb-4">{post.authorRole}</p>
              <p className="text-gray-600">
                Expert in financial modeling and valuation with over 15 years of experience in investment banking and private equity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.id}`}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
                >
                  <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-200"></div>
                  <div className="p-6">
                    <span className="text-sm text-blue-600 font-medium">{relatedPost.category}</span>
                    <h3 className="text-lg font-semibold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2">{relatedPost.date}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to level up your modeling?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Start building professional financial models with FinModel Pro today.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-xl hover:bg-gray-50 transition-all"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
