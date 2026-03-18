import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

/**
 * ContributorEfficiency component displays commits per contributor in a bar chart
 * @param {Array} commitsPerContributor - Array of contributors with commit counts
 */
const ContributorEfficiency = ({ commitsPerContributor }) => {
  // Limit to top 10 contributors for better visualization
  const topContributors = commitsPerContributor?.slice(0, 10) || [];

  // Custom tooltip for the bar chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.username}</p>
          <p className="text-sm text-gray-600">
            {data.commits} {data.commits === 1 ? 'commit' : 'commits'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Color palette for bars
  const getBarColor = (index) => {
    const colors = [
      '#3B82F6', // blue-500
      '#10B981', // emerald-500
      '#F59E0B', // amber-500
      '#EF4444', // red-500
      '#8B5CF6', // violet-500
      '#EC4899', // pink-500
      '#14B8A6', // teal-500
      '#F97316', // orange-500
      '#6366F1', // indigo-500
      '#84CC16'  // lime-500
    ];
    return colors[index % colors.length];
  };

  // If no data, show empty state
  if (!topContributors || topContributors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Contributor Efficiency</h2>
        <p className="text-gray-500 text-center py-8">No contributor data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Contributor Efficiency</h2>
        <div className="text-sm text-gray-500">
          Top {topContributors.length} contributors by commits
        </div>
      </div>
      
      {/* Chart container */}
      <div className="h-80 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={topContributors}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60, // Increased bottom margin for better label display
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="username" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              angle={-45} // Rotate labels for better readability
              textAnchor="end"
              height={80} // Increase height for rotated labels
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              label={{ value: 'Commits', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="commits" radius={[8, 8, 0, 0]}>
              {topContributors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Contributor summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total contributors */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Total Contributors</p>
              <p className="text-2xl font-bold text-blue-900">
                {topContributors.length}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average commits per contributor */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Avg Commits/Contributor</p>
              <p className="text-2xl font-bold text-green-900">
                {topContributors.length > 0 
                  ? (topContributors.reduce((sum, c) => sum + c.commits, 0) / topContributors.length).toFixed(1)
                  : '0'
                }
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Leading contributor */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-900">Leading Contributor</p>
              <p className="text-lg font-bold text-purple-900 truncate">
                {topContributors[0]?.username || 'N/A'}
              </p>
              <p className="text-sm text-purple-700">
                {topContributors[0]?.commits || 0} commits
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Contributor list */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {topContributors.map((contributor, index) => (
            <div
              key={contributor.username}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{contributor.username}</p>
                  <p className="text-sm text-gray-500">
                    {contributor.commits} {contributor.commits === 1 ? 'commit' : 'commits'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {contributor.commits}
                </div>
                <div className="text-sm text-gray-500">
                  {((contributor.commits / topContributors.reduce((sum, c) => sum + c.commits, 0)) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContributorEfficiency;
