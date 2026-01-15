import { useState } from 'react';

const upcomingWebinars = [
  {
    id: 1,
    title: 'Mastering M&A Modeling: From LOI to Close',
    date: 'Jan 25, 2024',
    time: '11:00 AM EST',
    speaker: 'Michael Park',
    speakerRole: 'Chief Product Officer',
    description: 'Learn best practices for merger modeling including accretion/dilution analysis, synergy modeling, and purchase price allocation.',
  },
  {
    id: 2,
    title: 'AI in Financial Modeling: What\'s Possible Today',
    date: 'Feb 8, 2024',
    time: '2:00 PM EST',
    speaker: 'Sarah Mitchell',
    speakerRole: 'CTO',
    description: 'Explore how AI is transforming financial modeling and see our new AI-powered scenario analysis in action.',
  },
  {
    id: 3,
    title: 'Real Estate Valuation: NAV and REIT Models',
    date: 'Feb 22, 2024',
    time: '11:00 AM EST',
    speaker: 'Emily Watson',
    speakerRole: 'Head of Customer Success',
    description: 'Deep dive into real estate valuation methodologies including NAV analysis and REIT-specific metrics.',
  },
];

const pastWebinars = [
  {
    id: 101,
    title: 'LBO Modeling Masterclass',
    date: 'Dec 14, 2023',
    speaker: 'Michael Park',
    attendees: 847,
    duration: '58:32',
  },
  {
    id: 102,
    title: 'Excel to Cloud: Migration Best Practices',
    date: 'Nov 30, 2023',
    speaker: 'James Chen',
    attendees: 623,
    duration: '45:18',
  },
  {
    id: 103,
    title: 'Building Bulletproof DCF Models',
    date: 'Nov 16, 2023',
    speaker: 'Emily Watson',
    attendees: 912,
    duration: '52:45',
  },
  {
    id: 104,
    title: 'Collaboration Features Deep Dive',
    date: 'Oct 26, 2023',
    speaker: 'Sarah Mitchell',
    attendees: 534,
    duration: '38:22',
  },
];

export function WebinarsPage() {
  const [registeredWebinars, setRegisteredWebinars] = useState<number[]>([]);

  const handleRegister = (id: number) => {
    setRegisteredWebinars(prev => [...prev, id]);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-purple-600 to-purple-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Webinars</h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            Join our expert-led webinars to learn advanced techniques and stay up-to-date with the latest features.
          </p>
        </div>
      </section>

      {/* Upcoming Webinars */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Upcoming Webinars</h2>
          <div className="space-y-6">
            {upcomingWebinars.map((webinar) => (
              <div key={webinar.id} className="bg-gray-50 rounded-xl p-6 md:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                        {webinar.date}
                      </span>
                      <span className="text-sm text-gray-500">{webinar.time}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{webinar.title}</h3>
                    <p className="text-gray-600 mb-4">{webinar.description}</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {webinar.speaker.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{webinar.speaker}</p>
                        <p className="text-xs text-gray-500">{webinar.speakerRole}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    {registeredWebinars.includes(webinar.id) ? (
                      <div className="text-center">
                        <span className="inline-flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg font-medium">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Registered
                        </span>
                        <p className="text-sm text-gray-500 mt-2">Check your email for details</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRegister(webinar.id)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                      >
                        Register Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Past Webinars */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Past Webinars</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pastWebinars.map((webinar) => (
              <div key={webinar.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group">
                <div className="bg-gradient-to-br from-gray-700 to-gray-900 h-40 relative flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {webinar.duration}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">{webinar.date}</p>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                    {webinar.title}
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">by {webinar.speaker}</p>
                    <p className="text-sm text-gray-500">{webinar.attendees} viewers</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Never miss a webinar</h2>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
            Subscribe to get notified about upcoming webinars and new recordings.
          </p>
          <form className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 text-purple-600 bg-white rounded-lg font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
