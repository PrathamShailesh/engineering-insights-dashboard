import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

/**
 * ActivityTrend component displays commit frequency trend over last 7 days
 * @param {Array} commitFrequencyTrend - Array of daily commit data
 */
const ActivityTrend = ({ commitFrequencyTrend }) => {
  const trendData = commitFrequencyTrend || [];

  // Custom tooltip for the line chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.date}</p>
          <p className="text-sm text-gray-600">
            {data.commits} {data.commits === 1 ? 'commit' : 'commits'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate trend statistics
  const calculateTrend = () => {
    if (trendData.length < 2) return 'stable';
    
    const firstHalf = trendData.slice(0, Math.floor(trendData.length / 2));
    const secondHalf = trendData.slice(Math.floor(trendData.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, day) => sum + day.commits, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, day) => sum + day.commits, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg * 1.2) return 'increasing';
    if (secondAvg < firstAvg * 0.8) return 'decreasing';
    return 'stable';
  };

  const trend = calculateTrend();
  const totalCommits = trendData.reduce((sum, day) => sum + day.commits, 0);
  const maxCommits = Math.max(...trendData.map(day => day.commits), 0);

  // Get trend icon and color
  const getTrendInfo = () => {
    switch (trend) {
      case 'increasing':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0l-8-8-8 8m8-8v16" />
            </svg>
          ),
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          text: 'Increasing'
        };
      case 'decreasing':
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0l-8 8-8-8m8 8V3" />
            </svg>
          ),
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          text: 'Decreasing'
        };
      default:
        return {
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
            </svg>
          ),
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          borderColor: 'border-blue-200',
          text: 'Stable'
        };
    }
  };

  const trendInfo = getTrendInfo();

  // If no data, show empty state
  if (!trendData || trendData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Trend</h2>
        <p className="text-gray-500 text-center py-8">No activity trend data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Activity Trend (Last 7 Days)</h2>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${trendInfo.bgColor} ${trendInfo.borderColor} border`}>
          <span className={trendInfo.color}>{trendInfo.icon}</span>
          <span className={`text-sm font-medium ${trendInfo.color}`}>{trendInfo.text}</span>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-64 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={trendData}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={false}
              label={{ value: 'Commits', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="commits" 
              stroke="#3B82F6" 
              strokeWidth={2}
              fill="url(#colorCommits)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Trend statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total commits */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Total Commits</p>
              <p className="text-xl font-bold text-gray-900">{totalCommits}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Peak day */}
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700">Peak Day</p>
              <p className="text-xl font-bold text-purple-900">{maxCommits}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Average per day */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Daily Average</p>
              <p className="text-xl font-bold text-blue-900">
                {trendData.length > 0 ? (totalCommits / trendData.length).toFixed(1) : '0'}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3-3m-3 6l3 3 3-3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Active days */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Active Days</p>
              <p className="text-xl font-bold text-green-900">
                {trendData.filter(day => day.commits > 0).length}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Trend summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className={`flex items-center space-x-3 p-4 rounded-lg ${trendInfo.bgColor} ${trendInfo.borderColor} border`}>
          <span className={trendInfo.color}>{trendInfo.icon}</span>
          <div>
            <p className={`font-medium ${trendInfo.color}`}>
              Activity is {trendInfo.text.toLowerCase()}
            </p>
            <p className="text-sm text-gray-600">
              {trend === 'increasing' && 'Recent activity shows significant increase compared to earlier days.'}
              {trend === 'decreasing' && 'Recent activity shows decline compared to earlier days.'}
              {trend === 'stable' && 'Activity remains consistent throughout the week.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTrend;
