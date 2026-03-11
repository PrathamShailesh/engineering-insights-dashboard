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
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data.error || 'Failed to fetch repository data';
      throw new Error(errorMessage);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other error
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
