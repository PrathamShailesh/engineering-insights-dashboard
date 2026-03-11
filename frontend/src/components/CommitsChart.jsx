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

const CommitsChart = ({ commitsData }) => {
  if (!commitsData || commitsData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Commit Activity (Last 7 Days)</h2>
        <p className="text-gray-500 text-center py-8">No commit data available for the last 7 days</p>
      </div>
    );
  }

  // Format date for display (e.g., "Mon, Dec 4")
  const formatChartData = commitsData.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.displayDate}</p>
          <p className="text-sm text-gray-600">
            {data.commits} {data.commits === 1 ? 'commit' : 'commits'}
          </p>
        </div>
      );
    }
    return null;
  };

  // Bar colors based on activity level
  const getBarColor = (commits) => {
    if (commits === 0) return '#E5E7EB'; // gray-200
    if (commits <= 5) return '#93C5FD'; // blue-300
    if (commits <= 10) return '#60A5FA'; // blue-400
    if (commits <= 20) return '#3B82F6'; // blue-500
    return '#2563EB'; // blue-600
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Commit Activity (Last 7 Days)</h2>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={formatChartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fill: '#6B7280', fontSize: 12 }}
              tickLine={{ stroke: '#E5E7EB' }}
              label={{ value: 'Commits', angle: -90, position: 'insideLeft', fill: '#6B7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="commits" radius={[8, 8, 0, 0]}>
              {formatChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.commits)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Total commits in last 7 days:
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {commitsData.reduce((sum, day) => sum + day.commits, 0).toLocaleString()}
          </div>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm text-gray-500">
            Daily average:
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {(commitsData.reduce((sum, day) => sum + day.commits, 0) / 7).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitsChart;
