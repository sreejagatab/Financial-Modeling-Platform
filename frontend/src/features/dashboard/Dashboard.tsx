import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIInsightsPanel } from '../../shared/components/ai';

// Icons
const TrendUpIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const CompareIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface MetricCard {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: string;
  color: string;
}

const mockMetrics: MetricCard[] = [
  { title: 'Active Models', value: '24', change: 3, changeLabel: 'this month', icon: '📊', color: 'blue' },
  { title: 'Total AUM', value: '$2.4B', change: 12.5, changeLabel: 'YoY', icon: '💰', color: 'green' },
  { title: 'Avg IRR', value: '22.4%', change: 2.1, changeLabel: 'vs target', icon: '📈', color: 'purple' },
  { title: 'Pending Reviews', value: '7', change: -2, changeLabel: 'this week', icon: '📋', color: 'orange' },
];

interface RecentModel {
  id: string;
  name: string;
  type: string;
  lastModified: string;
  status: 'draft' | 'review' | 'approved';
  owner: string;
  avatar: string;
}

const mockRecentModels: RecentModel[] = [
  { id: '1', name: 'Project Alpha LBO', type: 'LBO', lastModified: '2 hours ago', status: 'draft', owner: 'John D.', avatar: 'JD' },
  { id: '2', name: 'Omega Merger', type: 'M&A', lastModified: '5 hours ago', status: 'review', owner: 'Sarah M.', avatar: 'SM' },
  { id: '3', name: 'Tech Co DCF', type: 'DCF', lastModified: '1 day ago', status: 'approved', owner: 'Mike R.', avatar: 'MR' },
  { id: '4', name: 'Retail REIT NAV', type: 'NAV', lastModified: '2 days ago', status: 'draft', owner: 'John D.', avatar: 'JD' },
  { id: '5', name: 'Healthcare Roll-up', type: 'LBO', lastModified: '3 days ago', status: 'approved', owner: 'Lisa T.', avatar: 'LT' },
];

interface Activity {
  id: string;
  user: string;
  avatar: string;
  action: string;
  target: string;
  time: string;
}

const mockActivities: Activity[] = [
  { id: '1', user: 'Sarah M.', avatar: 'SM', action: 'commented on', target: 'Project Alpha LBO', time: '5 min ago' },
  { id: '2', user: 'Mike R.', avatar: 'MR', action: 'approved', target: 'Tech Co DCF', time: '1 hour ago' },
  { id: '3', user: 'John D.', avatar: 'JD', action: 'created', target: 'New Scenario: Bull Case', time: '2 hours ago' },
  { id: '4', user: 'Lisa T.', avatar: 'LT', action: 'updated', target: 'Healthcare Roll-up', time: '3 hours ago' },
];

// Simple bar chart data
const chartData = [
  { month: 'Jul', value: 42 },
  { month: 'Aug', value: 58 },
  { month: 'Sep', value: 45 },
  { month: 'Oct', value: 72 },
  { month: 'Nov', value: 65 },
  { month: 'Dec', value: 88 },
];

export function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const navigate = useNavigate();

  const maxValue = Math.max(...chartData.map(d => d.value));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Overview of your financial modeling activity</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'quarter'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate('/models')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon />
            New Model
          </button>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockMetrics.map((metric, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <span className="text-2xl">{metric.icon}</span>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {metric.change >= 0 ? <TrendUpIcon /> : <TrendDownIcon />}
                {metric.change >= 0 ? '+' : ''}{metric.change}%
              </span>
              <span className="text-sm text-gray-500">{metric.changeLabel}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Model Performance</h3>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
              <option>IRR by Month</option>
              <option>MOIC by Month</option>
              <option>Deal Count</option>
            </select>
          </div>
          <div className="p-6">
            {/* Simple Bar Chart */}
            <div className="flex items-end justify-between h-48 gap-4">
              {chartData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex items-end justify-center h-40">
                    <div
                      className="w-full max-w-12 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500 cursor-pointer"
                      style={{ height: `${(item.value / maxValue) * 100}%` }}
                      title={`${item.value}%`}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-500">{item.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
              <span className="text-gray-500">Average: <span className="font-semibold text-gray-900">61.7%</span></span>
              <span className="text-gray-500">Target: <span className="font-semibold text-green-600">55%</span></span>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {mockActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-medium">{activity.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-gray-600">{activity.action}</span>{' '}
                      <span className="font-medium text-blue-600">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <ClockIcon />
                      {activity.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-gray-100">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View all activity
            </button>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <AIInsightsPanel compact />

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent models */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Recent Models</h3>
            <button
              onClick={() => navigate('/models')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {mockRecentModels.map((model) => (
              <div
                key={model.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/models/${model.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg">
                      {model.type === 'LBO' ? '📊' : model.type === 'M&A' ? '🤝' : model.type === 'DCF' ? '💵' : '🏢'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{model.name}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-medium">{model.type}</span>
                      <span>•</span>
                      <span>{model.lastModified}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{model.avatar}</span>
                  </div>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      model.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : model.status === 'review'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {model.status.charAt(0).toUpperCase() + model.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <QuickActionCard
              icon={<PlusIcon />}
              title="New LBO Model"
              description="Create leveraged buyout analysis"
              color="blue"
              onClick={() => navigate('/deals/lbo')}
            />
            <QuickActionCard
              icon={<ChartIcon />}
              title="Run DCF"
              description="Discounted cash flow"
              color="green"
              onClick={() => navigate('/valuations')}
            />
            <QuickActionCard
              icon={<CompareIcon />}
              title="Compare Scenarios"
              description="Side-by-side analysis"
              color="purple"
              onClick={() => navigate('/models')}
            />
            <QuickActionCard
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
              title="Due Diligence"
              description="Review checklist"
              color="orange"
              onClick={() => navigate('/due-diligence')}
            />
          </div>

          {/* Stats Summary */}
          <div className="px-6 pb-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <h4 className="font-semibold mb-4">Portfolio Summary</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-blue-200 text-sm">Total Deals</p>
                  <p className="text-2xl font-bold">47</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">Active</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
                <div>
                  <p className="text-blue-200 text-sm">This Quarter</p>
                  <p className="text-2xl font-bold">+8</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  onClick: () => void;
}) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
    green: 'bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white',
    purple: 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white',
    orange: 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white',
  };

  return (
    <button
      onClick={onClick}
      className="group flex flex-col items-center p-4 text-center border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${colors[color]}`}>
        {icon}
      </div>
      <p className="mt-3 font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </button>
  );
}
