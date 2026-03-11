const axios = require('axios');

/**
 * Fetch repository data from GitHub API and return engineering metrics
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Object} Processed repository metrics
 */
const getRepoMetrics = async (owner, repo) => {
  try {
    // GitHub API base URL
    const GITHUB_API_BASE = 'https://api.github.com';
    
    // Fetch basic repository info
    const repoResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);
    const repoData = repoResponse.data;
    
    // Fetch contributors
    const contributorsResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors`, {
      params: { per_page: 5 } // Get top 5 contributors
    });
    const contributors = contributorsResponse.data;
    
    // Fetch commits for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const commitsResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits`, {
      params: { 
        since: sevenDaysAgo.toISOString(),
        per_page: 100 
      }
    });
    const commits = commitsResponse.data;
    
    // Fetch open issues
    const issuesResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`, {
      params: { 
        state: 'open',
        per_page: 1 
      }
    });
    // Get total count from Link header or use the length of first page
    const linkMatch = issuesResponse.headers.link ? 
      issuesResponse.headers.link.match(/page=(\d+)>; rel="last"/) : null;
    const openIssuesCount = linkMatch ? 
      parseInt(linkMatch[1]) : 
      issuesResponse.data.length;
    
    // Fetch pull requests (open)
    const prsResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`, {
      params: { 
        state: 'open',
        per_page: 1 
      }
    });
    const prLinkMatch = prsResponse.headers.link ? 
      prsResponse.headers.link.match(/page=(\d+)>; rel="last"/) : null;
    const pullRequestsCount = prLinkMatch ? 
      parseInt(prLinkMatch[1]) : 
      prsResponse.data.length;
    
    // Process commits for the last 7 days
    const commitsByDay = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      commitsByDay[dateStr] = 0;
    }
    
    commits.forEach(commit => {
      const commitDate = commit.commit.author.date.split('T')[0];
      if (commitsByDay.hasOwnProperty(commitDate)) {
        commitsByDay[commitDate]++;
      }
    });
    
    // Convert commits data to array format for charts
    const commitsLast7Days = Object.keys(commitsByDay).map(date => ({
      date,
      commits: commitsByDay[date]
    }));
    
    // Process top contributors
    const topContributors = contributors.map(contributor => ({
      username: contributor.login,
      avatar: contributor.avatar_url,
      contributions: contributor.contributions
    }));
    
    // Return processed metrics
    return {
      repoName: repoData.full_name,
      stars: repoData.stargazers_count,
      openIssues: openIssuesCount,
      pullRequests: pullRequestsCount,
      contributorsCount: repoData.contributors_url ? contributors.length : 0,
      topContributors,
      commitsLast7Days
    };
    
  } catch (error) {
    console.error('Error fetching repository data:', error.message);
    
    // Handle different error types
    if (error.response) {
      // GitHub API returned an error
      if (error.response.status === 404) {
        throw new Error('Repository not found. Please check the owner and repository name.');
      } else if (error.response.status === 403) {
        throw new Error('API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`GitHub API error: ${error.response.data.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your internet connection.');
    } else {
      // Other error
      throw new Error('An unexpected error occurred while fetching repository data.');
    }
  }
};

module.exports = {
  getRepoMetrics
};
