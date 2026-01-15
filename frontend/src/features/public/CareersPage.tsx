import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const departments = ['All', 'Engineering', 'Product', 'Sales', 'Marketing', 'Operations', 'Finance'];

const jobs = [
  {
    id: 1,
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
    description: 'Build beautiful, performant user interfaces for our financial modeling platform.',
  },
  {
    id: 2,
    title: 'Backend Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
    description: 'Design and implement scalable APIs and services for complex financial calculations.',
  },
  {
    id: 3,
    title: 'Product Manager',
    department: 'Product',
    location: 'New York, NY',
    type: 'Full-time',
    remote: false,
    description: 'Drive product strategy and roadmap for our valuation and modeling tools.',
  },
  {
    id: 4,
    title: 'Enterprise Account Executive',
    department: 'Sales',
    location: 'New York, NY',
    type: 'Full-time',
    remote: false,
    description: 'Sell to Fortune 500 companies and top-tier investment banks.',
  },
  {
    id: 5,
    title: 'Customer Success Manager',
    department: 'Sales',
    location: 'London, UK',
    type: 'Full-time',
    remote: true,
    description: 'Ensure our enterprise customers achieve their goals with FinModel Pro.',
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
    description: 'Build and maintain our cloud infrastructure and CI/CD pipelines.',
  },
  {
    id: 7,
    title: 'Content Marketing Manager',
    department: 'Marketing',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: true,
    description: 'Create compelling content that educates finance professionals.',
  },
  {
    id: 8,
    title: 'Financial Analyst',
    department: 'Finance',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: false,
    description: 'Support FP&A and help build our internal financial models.',
  },
];

const benefits = [
  { icon: '💰', title: 'Competitive Salary', description: 'Top-of-market compensation with equity packages' },
  { icon: '🏥', title: 'Health & Wellness', description: 'Comprehensive medical, dental, and vision coverage' },
  { icon: '🏖️', title: 'Unlimited PTO', description: 'Take the time you need to recharge' },
  { icon: '🏠', title: 'Remote Friendly', description: 'Work from anywhere with flexible hours' },
  { icon: '📚', title: 'Learning Budget', description: '$2,000 annual budget for courses and conferences' },
  { icon: '🍼', title: 'Parental Leave', description: '16 weeks paid leave for all new parents' },
  { icon: '💻', title: 'Equipment', description: 'Latest MacBook Pro and home office setup stipend' },
  { icon: '🎉', title: 'Team Events', description: 'Quarterly offsites and regular team activities' },
];

const values = [
  {
    title: 'Customer Obsession',
    description: 'We start with the customer and work backwards. Their success is our success.',
  },
  {
    title: 'Excellence',
    description: 'We hold ourselves to the highest standards in everything we do.',
  },
  {
    title: 'Move Fast',
    description: 'We ship quickly, learn from feedback, and iterate rapidly.',
  },
  {
    title: 'Transparency',
    description: 'We share information openly and communicate directly.',
  },
];

export function CareersPage() {
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  const filteredJobs = selectedDepartment === 'All'
    ? jobs
    : jobs.filter(job => job.department === selectedDepartment);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Join Our Team
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Help us transform how the world builds financial models. We're looking for passionate people to join our mission.
          </p>
          <a
            href="#openings"
            className="inline-block px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-xl hover:bg-gray-50 transition-all"
          >
            View Open Positions ({jobs.length})
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">150+</p>
              <p className="text-gray-600">Team Members</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">4</p>
              <p className="text-gray-600">Global Offices</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">30+</p>
              <p className="text-gray-600">Countries</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-600 mb-2">4.8</p>
              <p className="text-gray-600">Glassdoor Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">The principles that guide how we work</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div key={value.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Benefits & Perks</h2>
            <p className="text-lg text-gray-600">We take care of our team so they can do their best work</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="text-center p-6">
                <span className="text-4xl mb-4 block">{benefit.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section id="openings" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Open Positions</h2>
            <p className="text-lg text-gray-600">Find your next opportunity</p>
          </div>

          {/* Department Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDepartment === dept
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Job List */}
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
                onClick={() => navigate(`/careers/${job.id}`)}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{job.description}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {job.department}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                      {job.remote && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Remote OK
                        </span>
                      )}
                    </div>
                  </div>
                  <button className="px-6 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No open positions in this department right now.</p>
              <p className="text-gray-500 mt-2">Check back soon or explore other departments.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Don't see the right role?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="px-8 py-4 text-lg font-medium text-gray-900 bg-white rounded-xl hover:bg-gray-100 transition-all"
          >
            Get in Touch
          </button>
        </div>
      </section>
    </div>
  );
}
