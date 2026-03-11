import React from 'react';

const ContributorsList = ({ contributors }) => {
  if (!contributors || contributors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Top Contributors</h2>
        <p className="text-gray-500 text-center py-8">No contributors data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Top 5 Contributors</h2>
      
      <div className="space-y-4">
        {contributors.map((contributor, index) => (
          <div
            key={contributor.username}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-4">
              {/* Rank number */}
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-semibold text-sm">
                {index + 1}
              </div>
              
              {/* Avatar */}
              <img
                src={contributor.avatar}
                alt={`${contributor.username} avatar`}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  // Fallback to a default avatar if image fails to load
                  e.target.src = `https://ui-avatars.com/api/?name=${contributor.username}&background=3B82F6&color=fff&size=40`;
                }}
              />
              
              {/* Username */}
              <div>
                <p className="font-medium text-gray-900">{contributor.username}</p>
                <p className="text-sm text-gray-500">@{contributor.username}</p>
              </div>
            </div>
            
            {/* Contribution count */}
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {contributor.contributions.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">contributions</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer with total contributors info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          Showing top 5 contributors by number of contributions
        </p>
      </div>
    </div>
  );
};

export default ContributorsList;
