import React, { useState } from 'react';
import { getRepoMetrics } from './api';
import RepoInput from './components/RepoInput';
import MetricsCards from './components/MetricsCards';
import ContributorsList from './components/ContributorsList';
import CommitsChart from './components/CommitsChart';
import ProductivityMetrics from './components/ProductivityMetrics';
import ContributorEfficiency from './components/ContributorEfficiency';
import ActivityTrend from './components/ActivityTrend';
import InsightsPanel from './components/InsightsPanel';
import LoadingSkeleton, { 
  MetricsCardSkeleton, 
  ChartSkeleton, 
  ListSkeleton, 
  InsightSkeleton 
} from './components/LoadingSkeleton';

const App = () => {
  const [repoData, setRepoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRepoSubmit = async (owner, repo) => {
    setIsLoading(true);
    setError('');
    setRepoData(null);

    try {
      const data = await getRepoMetrics(owner, repo);
      setRepoData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRepoData(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Engineering Insights Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Analyze GitHub repositories and view engineering metrics
              </p>
            </div>
            {repoData && (
              <button
                onClick={handleReset}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Analyze Another Repository
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!repoData ? (
          <div className="space-y-8">
            {/* Input Section */}
            <div className="text-center space-y-4">
              <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Get Started
                </h2>
                <p className="text-gray-600 mb-8">
                  Enter a GitHub repository URL to analyze its engineering metrics and insights
                </p>
                <RepoInput onRepoSubmit={handleRepoSubmit} isLoading={isLoading} />
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center space-x-2">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="text-gray-600">Fetching repository data...</span>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center space-x-3">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <h3 className="text-red-800 font-medium">Error</h3>
                    <p className="text-red-600 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="space-y-8">
            {/* Loading Repository Info */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center space-x-4">
                <LoadingSkeleton width="w-8 h-8" rounded="rounded-full" />
                <div>
                  <LoadingSkeleton width="w-48 h-8" />
                  <LoadingSkeleton width="w-32 h-4" className="mt-2" />
                </div>
              </div>
            </div>

            {/* Loading Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <MetricsCardSkeleton key={index} />
              ))}
            </div>

            {/* Loading Productivity Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <LoadingSkeleton width="w-64 h-8" className="mb-6" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ChartSkeleton title="Loading Productivity Metrics..." />
                <ChartSkeleton title="Loading Activity Trend..." />
              </div>
            </div>

            {/* Loading Contributor and AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartSkeleton title="Loading Contributor Efficiency..." />
              <InsightSkeleton />
            </div>

            {/* Loading Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ChartSkeleton title="Loading Commit Activity..." />
              <ListSkeleton title="Loading Contributors..." itemCount={5} />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Repository Info */}
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <svg
                    className="h-8 w-8 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{repoData.repoName}</h2>
                  <p className="text-gray-600">Repository Analysis</p>
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            <MetricsCards metrics={repoData} />

            {/* Developer Productivity Insights Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Developer Productivity Insights
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ProductivityMetrics metrics={repoData} />
                <ActivityTrend commitFrequencyTrend={repoData.commitFrequencyTrend} />
              </div>
            </div>

            {/* Contributor Efficiency and AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ContributorEfficiency commitsPerContributor={repoData.commitsPerContributor} />
              <InsightsPanel insights={repoData.aiInsights} />
            </div>

            {/* Original Charts and Lists Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CommitsChart commitsData={repoData.commitsLast7Days} />
              <ContributorsList contributors={repoData.topContributors} />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            Engineering Insights Dashboard - Built with React, Node.js, and GitHub API
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
