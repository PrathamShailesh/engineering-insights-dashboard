import React, { useState, useEffect, useRef } from 'react';
import { parseGitHubUrl } from '../api';

const RepoInput = ({ onRepoSubmit, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Track mouse position for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

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
    <div 
      ref={containerRef}
      className="w-full max-w-2xl mx-auto relative overflow-hidden rounded-2xl"
      style={{
        background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, 
          rgba(99, 102, 241, 0.15) 0%, 
          rgba(168, 85, 247, 0.1) 25%, 
          rgba(236, 72, 153, 0.05) 50%, 
          transparent 70%)`,
        transition: 'background 0.3s ease-out'
      }}
    >
      <div className="relative z-10 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="repo-url" className="block text-sm font-semibold text-gray-800 mb-3">
              GitHub Repository URL
            </label>
            <div className="relative">
              <input
                id="repo-url"
                type="text"
                value={url}
                onChange={handleInputChange}
                placeholder="https://github.com/facebook/react"
                className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm hover:shadow-md"
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
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
              <p className="mt-3 text-sm text-red-500 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || isValidating || !url.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

        <div className="mt-6 text-sm text-gray-500 text-center">
          Example: <span className="text-indigo-600 font-medium">https://github.com/facebook/react</span>
        </div>
      </div>
    </div>
  );
};

export default RepoInput;
