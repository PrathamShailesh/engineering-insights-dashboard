import axios from 'axios';

// Create axios instance with base URL
const getBaseUrl = () => {
  // Use environment variable for production, fallback to proxy for development
  return import.meta.env.VITE_API_URL || '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // 10 second timeout
});

/**
 * Fetch repository metrics from backend API
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Repository metrics data
 */
export const getRepoMetrics = async (owner, repo) => {
  try {
    const response = await api.get(`/repo/${owner}/${repo}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data.error || 'Failed to fetch repository data';
      
      // Check for rate limit information
      if (error.response.status === 403 && error.response.headers) {
        const rateLimitRemaining = error.response.headers['x-ratelimit-remaining'];
        const rateLimitReset = error.response.headers['x-ratelimit-reset'];
        
        if (rateLimitRemaining === '0') {
          const resetTime = new Date(rateLimitReset * 1000);
          const waitTime = Math.ceil((resetTime - new Date()) / 1000 / 60);
          const enhancedError = new Error(`${errorMessage} Resets in ${waitTime} minutes.`);
          enhancedError.rateLimitReset = resetTime;
          enhancedError.rateLimitRemaining = 0;
          throw enhancedError;
        }
      }
      
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

/**
 * Fetch enhanced repository metrics with database storage
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Enhanced repository metrics data
 */
export const getEnhancedRepoMetrics = async (owner, repo) => {
  try {
    const response = await api.get(`/repo/${owner}/${repo}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.error || 'Failed to fetch enhanced repository data';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

/**
 * Fetch repository history
 * @param {number} limit - Number of repositories to fetch
 * @param {number} offset - Number of repositories to skip
 * @returns {Promise<Object>} Repository history data
 */
export const getRepositoryHistory = async (limit = 20, offset = 0) => {
  try {
    const response = await api.get('/history', {
      params: { limit, offset }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.error || 'Failed to fetch repository history';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

/**
 * Compare two repositories
 * @param {string} repo1 - First repository (owner/repo)
 * @param {string} repo2 - Second repository (owner/repo)
 * @returns {Promise<Object>} Comparison data
 */
export const getRepoComparison = async (repo1, repo2) => {
  try {
    const response = await api.get('/compare', {
      params: { repo1, repo2 }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.error || 'Failed to compare repositories';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

/**
 * Ask AI a question about repository data
 * @param {string} question - The question to ask
 * @param {Object} data - Repository data
 * @returns {Promise<Object>} AI response
 */
export const askAI = async (question, data) => {
  try {
    const response = await api.post('/ask', {
      question,
      data
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.error || 'Failed to get AI response';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

/**
 * Get top repositories by health score
 * @param {number} limit - Number of repositories to fetch
 * @returns {Promise<Object>} Top repositories data
 */
export const getTopRepositories = async (limit = 10) => {
  try {
    const response = await api.get('/analytics/top', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      const errorMessage = error.response.data.error || 'Failed to fetch top repositories';
      throw new Error(errorMessage);
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('An unexpected error occurred.');
    }
  }
};

/**
 * Extract owner and repo from GitHub URL
 * @param {string} url - GitHub repository URL
 * @returns {Object} Object with owner and repo properties
 */
export const parseGitHubUrl = (url) => {
  try {
    // Remove trailing slash and split URL
    const cleanUrl = url.replace(/\/$/, '');
    const parts = cleanUrl.split('/');
    
    // GitHub URLs can be in formats:
    // https://github.com/owner/repo
    // https://github.com/owner/repo/
    // github.com/owner/repo
    
    const githubIndex = parts.findIndex(part => part === 'github.com');
    
    if (githubIndex === -1 || parts.length <= githubIndex + 2) {
      throw new Error('Invalid GitHub URL format');
    }
    
    const owner = parts[githubIndex + 1];
    const repo = parts[githubIndex + 2];
    
    if (!owner || !repo) {
      throw new Error('Could not extract owner and repository from URL');
    }
    
    return { owner, repo };
  } catch (error) {
    throw new Error('Invalid GitHub URL. Please use format: https://github.com/owner/repo');
  }
};

export default api;
