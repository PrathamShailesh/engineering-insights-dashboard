import React, { useState } from 'react';
import { getRepoComparison } from '../api';

/**
 * CompareRepos component for comparing two repositories
 */
const CompareRepos = () => {
  const [repo1Url, setRepo1Url] = useState('');
  const [repo2Url, setRepo2Url] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Parse GitHub URL to get owner and repo
  const parseGitHubUrl = (url) => {
    const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/\?#]+)/i;
    const match = url.match(githubRegex);
    if (match) {
      return { owner: match[1], repo: match[2] };
    }
    
    // Handle direct owner/repo format
    const parts = url.trim().split('/');
    if (parts.length === 2) {
      return { owner: parts[0], repo: parts[1] };
    }
    
    return null;
  };

  // Handle comparison
  const handleCompare = async () => {
    setError('');
    setComparisonData(null);

    const repo1 = parseGitHubUrl(repo1Url);
    const repo2 = parseGitHubUrl(repo2Url);

    if (!repo1 || !repo2) {
      setError('Please enter valid GitHub repository URLs or owner/repo format');
      return;
    }

    // Prevent comparing the same repository
    if (repo1.owner === repo2.owner && repo1.repo === repo2.repo) {
      setError('Cannot compare the same repository. Please enter two different repositories.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await getRepoComparison(
        `${repo1.owner}/${repo1.repo}`,
        `${repo2.owner}/${repo2.repo}`
      );
      setComparisonData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset comparison
  const handleReset = () => {
    setRepo1Url('');
    setRepo2Url('');
    setComparisonData(null);
    setError('');
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get winner badge
  const getWinnerBadge = (winner, repo) => {
    if (winner === 'tie') return null;
    return (
      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
        winner === repo 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-600'
      }`}>
        {winner === repo ? 'Winner' : 'Loser'}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Repository Comparison</h2>
      
      {/* Input Section */}
      <div className="space-y-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repository 1
            </label>
            <input
              type="text"
              value={repo1Url}
              onChange={(e) => setRepo1Url(e.target.value)}
              placeholder="https://github.com/owner/repo or owner/repo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Repository 2
            </label>
            <input
              type="text"
              value={repo2Url}
              onChange={(e) => setRepo2Url(e.target.value)}
              placeholder="https://github.com/owner/repo or owner/repo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleCompare}
            disabled={isLoading || !repo1Url || !repo2Url}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Comparing...' : 'Compare Repositories'}
          </button>
          {comparisonData && (
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-flex items-center space-x-2">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-gray-600">Comparing repositories...</span>
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {comparisonData && comparisonData.data && comparisonData.data.repo1 && comparisonData.data.repo2 && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Comparison Summary</h3>
            <div className="flex items-center space-x-3">
              <div className={`text-lg font-bold ${
                comparisonData.winner === 'tie' ? 'text-gray-700' : 'text-green-700'
              }`}>
                {comparisonData.winner === 'tie' ? 'Tie' : 
                 `${comparisonData.winner === 'repo1' ? comparisonData.data.repo1.repoName : comparisonData.data.repo2.repoName} wins`}
              </div>
              <div className="text-gray-600">{comparisonData.summary || 'Comparison completed'}</div>
            </div>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Repository 1 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {comparisonData.data.repo1.repoName}
                  {getWinnerBadge(comparisonData.winner, 'repo1')}
                </h3>
                <div className={`text-lg font-bold ${getScoreColor(comparisonData.data.repo1.comparisonScore)}`}>
                  Score: {comparisonData.data.repo1.comparisonScore}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stars</span>
                  <span className="font-medium">{comparisonData.data.repo1.stars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contributors</span>
                  <span className="font-medium">{comparisonData.data.repo1.contributorsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Commits</span>
                  <span className="font-medium">{comparisonData.data.repo1.averageCommitsPerDay?.toFixed(1) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Health Score</span>
                  <span className={`font-medium ${getScoreColor(comparisonData.data.repo1.repoHealthScore)}`}>
                    {comparisonData.data.repo1.repoHealthScore}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Open Issues</span>
                  <span className="font-medium">{comparisonData.data.repo1.openIssues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pull Requests</span>
                  <span className="font-medium">{comparisonData.data.repo1.pullRequests}</span>
                </div>
              </div>
            </div>

            {/* Repository 2 */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {comparisonData.data.repo2.repoName}
                  {getWinnerBadge(comparisonData.winner, 'repo2')}
                </h3>
                <div className={`text-lg font-bold ${getScoreColor(comparisonData.data.repo2.comparisonScore)}`}>
                  Score: {comparisonData.data.repo2.comparisonScore}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Stars</span>
                  <span className="font-medium">{comparisonData.data.repo2.stars.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contributors</span>
                  <span className="font-medium">{comparisonData.data.repo2.contributorsCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Commits</span>
                  <span className="font-medium">{comparisonData.data.repo2.averageCommitsPerDay?.toFixed(1) || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Health Score</span>
                  <span className={`font-medium ${getScoreColor(comparisonData.data.repo2.repoHealthScore)}`}>
                    {comparisonData.data.repo2.repoHealthScore}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Open Issues</span>
                  <span className="font-medium">{comparisonData.data.repo2.openIssues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pull Requests</span>
                  <span className="font-medium">{comparisonData.data.repo2.pullRequests}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Comparison */}
          {comparisonData.comparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Advantages */}
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <h4 className="font-semibold text-green-900 mb-4">Advantages</h4>
                <div className="space-y-3">
                  <div>
                    <h5 className="font-medium text-green-800 mb-2">
                      {comparisonData.data.repo1.repoName} Advantages:
                    </h5>
                    {comparisonData.comparison.repo1Advantages && comparisonData.comparison.repo1Advantages.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-green-700">
                        {comparisonData.comparison.repo1Advantages.map((advantage, index) => (
                          <li key={index}>{advantage}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-green-600 text-sm">No significant advantages</p>
                    )}
                  </div>
                  <div>
                    <h5 className="font-medium text-green-800 mb-2">
                      {comparisonData.data.repo2.repoName} Advantages:
                    </h5>
                    {comparisonData.comparison.repo2Advantages && comparisonData.comparison.repo2Advantages.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1 text-green-700">
                        {comparisonData.comparison.repo2Advantages.map((advantage, index) => (
                          <li key={index}>{advantage}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-green-600 text-sm">No significant advantages</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Similarities */}
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-4">Similarities</h4>
                {comparisonData.comparison.similar && comparisonData.comparison.similar.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    {comparisonData.comparison.similar.map((similarity, index) => (
                      <li key={index}>{similarity}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-blue-600">No significant similarities found</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompareRepos;
