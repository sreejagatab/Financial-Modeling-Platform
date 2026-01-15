import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const categories = ['All', 'Product', 'Engineering', 'Finance', 'Company', 'Tutorials'];

const posts = [
  {
    id: 1,
    title: 'Introducing AI-Powered Scenario Analysis',
    excerpt: 'Today we\'re excited to announce our newest feature: AI-powered scenario analysis that automatically generates bull, base, and bear cases for your models.',
    category: 'Product',
    author: 'Sarah Mitchell',
    authorRole: 'CTO',
    date: 'Jan 10, 2024',
    readTime: '5 min read',
    image: 'bg-gradient-to-br from-purple-500 to-pink-500',
    featured: true,
  },
  {
    id: 2,
    title: 'How We Scaled Our Calculation Engine to Handle 1M Cells',
    excerpt: 'A deep dive into the technical challenges we faced and how we built a calculation engine that can handle complex financial models with millions of cells.',
    category: 'Engineering',
    author: 'James Chen',
    authorRole: 'Senior Engineer',
    date: 'Jan 5, 2024',
    readTime: '12 min read',
    image: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    featured: true,
  },
  {
    id: 3,
    title: 'Best Practices for LBO Modeling in 2024',
    excerpt: 'Learn the key techniques and best practices for building robust LBO models, including debt structuring, returns analysis, and sensitivity testing.',
    category: 'Finance',
    author: 'Michael Park',
    authorRole: 'CPO',
    date: 'Dec 28, 2023',
    readTime: '8 min read',
    image: 'bg-gradient-to-br from-green-500 to-teal-500',
    featured: false,
  },
  {
    id: 4,
    title: 'FinModel Pro Raises $80M Series B',
    excerpt: 'We\'re thrilled to announce our $80M Series B funding round led by Sequoia Capital, bringing our total funding to $110M.',
    category: 'Company',
    author: 'David Chen',
    authorRole: 'CEO',
    date: 'Dec 15, 2023',
    readTime: '3 min read',
    image: 'bg-gradient-to-br from-orange-500 to-red-500',
    featured: false,
  },
  {
    id: 5,
    title: 'Getting Started with DCF Valuation',
    excerpt: 'A comprehensive guide to building your first DCF model in FinModel Pro, from projecting cash flows to calculating terminal value.',
    category: 'Tutorials',
    author: 'Emily Watson',
    authorRole: 'Customer Success',
    date: 'Dec 10, 2023',
    readTime: '15 min read',
    image: 'bg-gradient-to-br from-indigo-500 to-purple-500',
    featured: false,
  },
  {
    id: 6,
    title: 'The Future of Financial Modeling',
    excerpt: 'Our vision for how AI, collaboration, and cloud computing will transform financial modeling over the next decade.',
    category: 'Product',
    author: 'Sarah Mitchell',
    authorRole: 'CTO',
    date: 'Dec 1, 2023',
    readTime: '7 min read',
    image: 'bg-gradient-to-br from-pink-500 to-rose-500',
    featured: false,
  },
];

export function BlogPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = selectedCategory === 'All'
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  const featuredPosts = posts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Insights, tutorials, and updates from the FinModel Pro team.
          </p>
        </div>
      </section>

      {/* Featured Posts */}
      {selectedCategory === 'All' && (
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <article
                  key={post.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/blog/${post.id}`)}
                >
                  <div className={`${post.image} h-64 rounded-xl mb-4 flex items-end p-6 transition-transform group-hover:scale-[1.02]`}>
                    <span className="px-3 py-1 bg-white/90 text-gray-900 text-sm font-medium rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{post.author}</p>
                      <p className="text-xs text-gray-500">{post.date} · {post.readTime}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8 bg-gray-50 border-y border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {selectedCategory === 'All' ? 'All Posts' : selectedCategory}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(selectedCategory === 'All' ? regularPosts : filteredPosts).map((post) => (
              <article
                key={post.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/blog/${post.id}`)}
              >
                <div className={`${post.image} h-48 rounded-xl mb-4 flex items-end p-4 transition-transform group-hover:scale-[1.02]`}>
                  <span className="px-3 py-1 bg-white/90 text-gray-900 text-xs font-medium rounded-full">
                    {post.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{post.author}</p>
                    <p className="text-xs text-gray-500">{post.date} · {post.readTime}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No posts in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Subscribe to our newsletter
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Get the latest articles, tutorials, and product updates delivered to your inbox.
          </p>
          <form className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 text-blue-600 bg-white rounded-lg font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
