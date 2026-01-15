import { useState } from 'react';

const categories = ['All', 'Getting Started', 'Modeling', 'Valuation', 'Collaboration', 'Excel'];

const tutorials = [
  {
    id: 1,
    title: 'Getting Started with FinModel Pro',
    category: 'Getting Started',
    duration: '5:32',
    level: 'Beginner',
    thumbnail: 'bg-gradient-to-br from-blue-500 to-cyan-500',
    description: 'Learn the basics of navigating the platform and creating your first model.',
  },
  {
    id: 2,
    title: 'Building a 3-Statement Model',
    category: 'Modeling',
    duration: '18:45',
    level: 'Intermediate',
    thumbnail: 'bg-gradient-to-br from-green-500 to-teal-500',
    description: 'Step-by-step guide to building an integrated income statement, balance sheet, and cash flow.',
  },
  {
    id: 3,
    title: 'LBO Modeling Fundamentals',
    category: 'Modeling',
    duration: '24:12',
    level: 'Advanced',
    thumbnail: 'bg-gradient-to-br from-purple-500 to-pink-500',
    description: 'Master leveraged buyout modeling including debt schedules and returns analysis.',
  },
  {
    id: 4,
    title: 'DCF Valuation Tutorial',
    category: 'Valuation',
    duration: '15:30',
    level: 'Intermediate',
    thumbnail: 'bg-gradient-to-br from-orange-500 to-red-500',
    description: 'Complete guide to discounted cash flow valuation with WACC calculation.',
  },
  {
    id: 5,
    title: 'Trading Comps Analysis',
    category: 'Valuation',
    duration: '12:18',
    level: 'Intermediate',
    thumbnail: 'bg-gradient-to-br from-indigo-500 to-purple-500',
    description: 'How to build and analyze trading comparable company analysis.',
  },
  {
    id: 6,
    title: 'Real-Time Collaboration',
    category: 'Collaboration',
    duration: '8:45',
    level: 'Beginner',
    thumbnail: 'bg-gradient-to-br from-pink-500 to-rose-500',
    description: 'Learn how to collaborate with your team in real-time on financial models.',
  },
  {
    id: 7,
    title: 'Excel Add-in Setup',
    category: 'Excel',
    duration: '6:20',
    level: 'Beginner',
    thumbnail: 'bg-gradient-to-br from-emerald-500 to-green-500',
    description: 'Install and configure the FinModel Pro Excel add-in.',
  },
  {
    id: 8,
    title: 'Syncing Excel with Cloud',
    category: 'Excel',
    duration: '10:15',
    level: 'Intermediate',
    thumbnail: 'bg-gradient-to-br from-cyan-500 to-blue-500',
    description: 'Bidirectional sync between Excel spreadsheets and cloud platform.',
  },
  {
    id: 9,
    title: 'Scenario Analysis',
    category: 'Modeling',
    duration: '14:22',
    level: 'Intermediate',
    thumbnail: 'bg-gradient-to-br from-amber-500 to-orange-500',
    description: 'Create and manage multiple scenarios for sensitivity analysis.',
  },
];

export function TutorialsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const filteredTutorials = tutorials.filter(tutorial => {
    const categoryMatch = selectedCategory === 'All' || tutorial.category === selectedCategory;
    const levelMatch = selectedLevel === 'All' || tutorial.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Video Tutorials</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Learn how to use FinModel Pro with our comprehensive video tutorials.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Level:</span>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Tutorial Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTutorials.map((tutorial) => (
              <div key={tutorial.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
                <div className={`${tutorial.thumbnail} h-48 relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {tutorial.duration}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                      {tutorial.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      tutorial.level === 'Beginner' ? 'bg-green-100 text-green-700' :
                      tutorial.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {tutorial.level}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {tutorial.title}
                  </h3>
                  <p className="text-sm text-gray-600">{tutorial.description}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredTutorials.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No tutorials match your filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Want more personalized training?</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Enterprise customers get access to live training sessions and dedicated onboarding.
          </p>
          <a href="/contact" className="inline-block px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-xl hover:bg-gray-50 transition-all">
            Contact Sales
          </a>
        </div>
      </section>
    </div>
  );
}
