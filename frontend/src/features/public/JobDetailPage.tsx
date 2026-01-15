import { useParams, Link } from 'react-router-dom';

const jobs = [
  {
    id: 1,
    title: 'Senior Full-Stack Engineer',
    department: 'Engineering',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$180,000 - $220,000',
    description: 'We\'re looking for a Senior Full-Stack Engineer to help build the future of financial modeling. You\'ll work on complex problems at the intersection of finance and technology.',
    responsibilities: [
      'Design and implement new features for our core financial modeling platform',
      'Write clean, maintainable, and well-tested code',
      'Collaborate with product and design teams to define and ship new features',
      'Mentor junior engineers and contribute to our engineering culture',
      'Participate in code reviews and architectural discussions',
      'Help improve our development processes and tooling',
    ],
    requirements: [
      '5+ years of experience in full-stack development',
      'Strong proficiency in TypeScript, React, and Node.js',
      'Experience with PostgreSQL and Redis',
      'Understanding of financial concepts is a plus',
      'Excellent communication skills',
      'BS/MS in Computer Science or equivalent experience',
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health, dental, and vision insurance',
      'Unlimited PTO',
      'Remote-friendly work environment',
      '401(k) with company match',
      'Learning and development budget',
    ],
  },
  {
    id: 2,
    title: 'Product Designer',
    department: 'Design',
    location: 'San Francisco, CA',
    type: 'Full-time',
    salary: '$140,000 - $180,000',
    description: 'Join our design team to create intuitive, beautiful experiences for finance professionals. You\'ll shape how thousands of analysts interact with complex financial data.',
    responsibilities: [
      'Lead end-to-end design for new product features',
      'Create wireframes, prototypes, and high-fidelity designs',
      'Conduct user research and usability testing',
      'Collaborate closely with engineering and product teams',
      'Maintain and evolve our design system',
      'Advocate for user-centered design across the organization',
    ],
    requirements: [
      '4+ years of product design experience',
      'Strong portfolio demonstrating complex B2B product work',
      'Proficiency in Figma and prototyping tools',
      'Experience with design systems',
      'Understanding of accessibility best practices',
      'Experience in fintech or enterprise software is a plus',
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health, dental, and vision insurance',
      'Unlimited PTO',
      'Remote-friendly work environment',
      '401(k) with company match',
      'Conference and workshop budget',
    ],
  },
  {
    id: 3,
    title: 'Financial Modeling Analyst',
    department: 'Product',
    location: 'Remote',
    type: 'Full-time',
    salary: '$120,000 - $160,000',
    description: 'Help define the future of our financial modeling products by bringing your deep domain expertise to our team.',
    responsibilities: [
      'Build and validate financial models to test product features',
      'Work with product team to define modeling requirements',
      'Create content for tutorials, documentation, and training',
      'Engage with customers to understand their modeling needs',
      'Stay current on industry best practices and methodologies',
      'Contribute to product roadmap discussions',
    ],
    requirements: [
      '3+ years in investment banking, private equity, or similar',
      'Expert-level proficiency in financial modeling',
      'Deep understanding of LBO, M&A, and valuation methodologies',
      'Strong Excel skills',
      'Excellent written and verbal communication',
      'CFA or MBA preferred',
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health, dental, and vision insurance',
      'Unlimited PTO',
      'Fully remote position',
      '401(k) with company match',
      'Home office setup allowance',
    ],
  },
  {
    id: 4,
    title: 'Enterprise Account Executive',
    department: 'Sales',
    location: 'New York, NY',
    type: 'Full-time',
    salary: '$150,000 - $200,000 OTE',
    description: 'Drive revenue growth by selling to investment banks, private equity firms, and Fortune 500 companies.',
    responsibilities: [
      'Manage full sales cycle from prospecting to close',
      'Build relationships with senior decision makers',
      'Conduct product demonstrations and presentations',
      'Collaborate with customer success for smooth handoffs',
      'Meet and exceed quarterly sales targets',
      'Provide market feedback to product team',
    ],
    requirements: [
      '5+ years of enterprise B2B sales experience',
      'Track record of exceeding quota',
      'Experience selling to financial services preferred',
      'Strong presentation and negotiation skills',
      'Proficiency with CRM tools (Salesforce)',
      'Bachelor\'s degree required',
    ],
    benefits: [
      'Competitive base salary + uncapped commission',
      'Comprehensive health, dental, and vision insurance',
      'Unlimited PTO',
      'Hybrid work environment',
      '401(k) with company match',
      'President\'s Club trips',
    ],
  },
  {
    id: 5,
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    salary: '$160,000 - $200,000',
    description: 'Build and maintain the infrastructure that powers our platform. Help us scale reliably as we grow.',
    responsibilities: [
      'Manage cloud infrastructure on AWS',
      'Implement CI/CD pipelines and automation',
      'Monitor system performance and reliability',
      'Implement security best practices',
      'Support development teams with tooling',
      'Participate in on-call rotation',
    ],
    requirements: [
      '4+ years of DevOps/SRE experience',
      'Strong AWS experience (EC2, ECS, RDS, Lambda)',
      'Proficiency with Terraform and Docker',
      'Experience with monitoring tools (Datadog, Prometheus)',
      'Strong scripting skills (Python, Bash)',
      'Security certifications a plus',
    ],
    benefits: [
      'Competitive salary and equity package',
      'Comprehensive health, dental, and vision insurance',
      'Unlimited PTO',
      'Fully remote position',
      '401(k) with company match',
      'Home office setup allowance',
    ],
  },
  {
    id: 6,
    title: 'Customer Success Manager',
    department: 'Customer Success',
    location: 'London, UK',
    type: 'Full-time',
    salary: '£80,000 - £100,000',
    description: 'Help our enterprise customers succeed with FinModel Pro. You\'ll be their trusted advisor and advocate.',
    responsibilities: [
      'Own relationships with portfolio of enterprise accounts',
      'Drive adoption and expansion within accounts',
      'Conduct business reviews and training sessions',
      'Identify and mitigate churn risks',
      'Collaborate with sales on renewal and upsell',
      'Gather and communicate customer feedback',
    ],
    requirements: [
      '3+ years in customer success or account management',
      'Experience with enterprise B2B SaaS',
      'Financial services background preferred',
      'Strong analytical and problem-solving skills',
      'Excellent presentation skills',
      'Based in or willing to relocate to London',
    ],
    benefits: [
      'Competitive salary and equity package',
      'Private health insurance',
      '25 days holiday + bank holidays',
      'Hybrid work environment',
      'Pension contribution',
      'Learning and development budget',
    ],
  },
];

export function JobDetailPage() {
  const { jobId } = useParams();
  const job = jobs.find((j) => j.id === Number(jobId));

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600 mb-8">The job posting you're looking for doesn't exist or has been filled.</p>
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            View All Jobs
          </Link>
        </div>
      </div>
    );
  }

  const similarJobs = jobs.filter((j) => j.id !== job.id && j.department === job.department).slice(0, 2);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/careers"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white font-medium mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            All Jobs
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
              {job.department}
            </span>
            <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
              {job.type}
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {job.location}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {job.salary}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Role</h2>
                <p className="text-gray-600 text-lg">{job.description}</p>
              </div>

              {/* Responsibilities */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Requirements */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
                <ul className="space-y-3">
                  {job.benefits.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      <span className="text-gray-600">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Apply Card */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Interested?</h3>
                  <button className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium mb-3">
                    Apply Now
                  </button>
                  <p className="text-sm text-gray-500 text-center">
                    or send your resume to{' '}
                    <a href="mailto:careers@finmodelpro.com" className="text-blue-600 hover:underline">
                      careers@finmodelpro.com
                    </a>
                  </p>
                </div>

                {/* Share Card */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this job</h3>
                  <div className="flex items-center gap-3">
                    <button className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </button>
                    <button className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </button>
                    <button className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-200">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Jobs */}
      {similarJobs.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Similar Positions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {similarJobs.map((similarJob) => (
                <Link
                  key={similarJob.id}
                  to={`/careers/${similarJob.id}`}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <span className="text-sm text-blue-600 font-medium">{similarJob.department}</span>
                  <h3 className="text-lg font-semibold text-gray-900 mt-2">{similarJob.title}</h3>
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    <span>{similarJob.location}</span>
                    <span>{similarJob.type}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
