import React from 'react';

/**
 * RateLimitAlert component for displaying GitHub API rate limit information
 */
const RateLimitAlert = ({ error, onDismiss }) => {
  if (!error || !error.rateLimitReset) {
    return null;
  }

  const resetTime = new Date(error.rateLimitReset);
  const now = new Date();
  const timeUntilReset = Math.max(0, Math.ceil((resetTime - now) / 1000 / 60)); // minutes
  
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours} hour${hours === 1 ? '' : 's'} ${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-yellow-50 border-l-4 border-yellow-200 rounded-lg shadow-lg p-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="bg-yellow-100 border-l-4 border-yellow-400 p-3 rounded-lg">
            <div className="flex">
              <div className="py-2">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ GitHub API Rate Limit Exceeded
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  You've hit the GitHub API rate limit. Requests will be available again in:
                </p>
                <div className="mt-2 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-900">
                      {formatTime(timeUntilReset)}
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      until rate limit resets
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="ml-4 pl-3 border-l border-yellow-300">
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-2">🔧 Solutions:</p>
                  <ul className="space-y-2 text-yellow-700">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Wait {formatTime(timeUntilReset)} for the rate limit to reset</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Add a GitHub Personal Access Token to increase rate limits</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Use cached data from previously analyzed repositories</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 p-2 rounded-lg transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RateLimitAlert;
