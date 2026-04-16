import React, { useState } from 'react';
import { parseGitHubUrl } from '../api';

const RepoInput = ({ onRepoSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  // Enhanced validation function
  const validateInput = (inputUrl) => {
    const trimmedUrl = inputUrl.trim();
    
    // Empty input validation
    if (!trimmedUrl) {
      return {
        isValid: false,
        error: 'Please enter a GitHub repository URL'
      };
    }

    // Basic URL format validation
    const urlPattern = /^https?:\/\/github\.com\/[\w\-_.]+\/[\w\-_.]+\/?$/;
    if (!urlPattern.test(trimmedUrl)) {
      return {
        isValid: false,
        error: 'Invalid GitHub URL format. Please use: https://github.com/owner/repo'
      };
    }

    // Length validation
    if (trimmedUrl.length > 200) {
      return {
        isValid: false,
        error: 'URL too long. Please enter a valid GitHub repository URL.'
      };
    }

    return { isValid: true, error: null };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsValidating(true);

    // Enhanced validation
    const validation = validateInput(url);
    if (!validation.isValid) {
      setError(validation.error);
      setIsValidating(false);
      return;
    }

    try {
      // Parse GitHub URL to extract owner and repo
      const { owner, repo } = parseGitHubUrl(url);
      
      // Additional validation for owner and repo names
      if (!owner || !repo) {
        setError('Unable to extract repository information. Please check the URL format.');
        setIsValidating(false);
        return;
      }

      // Call parent submit function
      onRepoSubmit(owner, repo);
    } catch (err) {
      setError(err.message || 'An error occurred while processing the repository URL.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
    
    // Real-time validation feedback (optional)
    if (newUrl.trim()) {
      const validation = validateInput(newUrl);
      if (!validation.isValid && newUrl.length > 10) {
        // Only show validation error after user has typed enough
        setError(validation.error);
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL
          </label>
          <div className="relative">
            <input
              id="repo-url"
              type="text"
              value={url}
              onChange={handleInputChange}
              placeholder="https://github.com/facebook/react"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || isValidating || !url.trim()}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading || isValidating ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              {isValidating ? 'Validating...' : 'Analyzing Repository...'}
            </span>
          ) : (
            'Analyze Repository'
          )}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-500 text-center">
        Example: https://github.com/facebook/react
      </div>
    </div>
  );
};

export default RepoInput;
