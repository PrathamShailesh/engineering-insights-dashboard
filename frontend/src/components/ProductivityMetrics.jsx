import React from 'react';

/**
 * ProductivityMetrics component displays key productivity indicators
 * @param {Object} metrics - Repository productivity metrics
 */
const ProductivityMetrics = ({ metrics }) => {
  const { mostActiveDay, averageCommitsPerDay, topContributor } = metrics;

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const productivityCards = [
    {
      title: 'Most Active Day',
      value: formatDate(mostActiveDay),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    {
      title: 'Average Commits/Day',
      value: averageCommitsPerDay.toFixed(1),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'bg-green-100 text-green-800 border-green-200'
    },
    {
      title: 'Top Contributor',
      value: topContributor?.username || 'N/A',
      subtitle: `${topContributor?.commits || 0} commits`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Developer Productivity Metrics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {productivityCards.map((card, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-lg ${card.color}`}>
                {card.icon}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {card.value}
              </h3>
              {card.subtitle && (
                <p className="text-sm text-gray-600">{card.subtitle}</p>
              )}
              <p className="text-sm font-medium text-gray-700 uppercase tracking-wider mt-2">
                {card.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Additional insights section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Activity Level</h4>
            <div className="flex items-center">
              {averageCommitsPerDay > 10 ? (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-blue-800">Very High Activity</span>
                </>
              ) : averageCommitsPerDay > 5 ? (
                <>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-blue-800">High Activity</span>
                </>
              ) : averageCommitsPerDay > 0 ? (
                <>
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-blue-800">Moderate Activity</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                  <span className="text-blue-800">Low Activity</span>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Contribution Pattern</h4>
            <div className="text-green-800">
              {topContributor?.username && topContributor.username !== 'N/A' ? (
                <span>Dominated by {topContributor.username}</span>
              ) : (
                <span>Distributed contributions</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductivityMetrics;
