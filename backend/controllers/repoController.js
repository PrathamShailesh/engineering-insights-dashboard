const axios = require('axios');

/**
 * Calculate advanced productivity metrics from commit and contributor data
 * @param {Array} commits - Array of commit objects
 * @param {Array} contributors - Array of contributor objects
 * @param {Object} commitsByDay - Commits grouped by day
 * @returns {Object} Productivity metrics
 */
const calculateProductivityMetrics = (commits, contributors, commitsByDay) => {
  // Calculate commits per contributor
  const commitsPerContributor = {};
  commits.forEach(commit => {
    const author = commit.author?.login || commit.commit.author.name;
    if (author) {
      commitsPerContributor[author] = (commitsPerContributor[author] || 0) + 1;
    }
  });

  // Convert to array format for frontend
  const commitsPerContributorArray = Object.entries(commitsPerContributor)
    .map(([username, commits]) => ({ username, commits }))
    .sort((a, b) => b.commits - a.commits)
    .slice(0, 10); // Top 10 contributors

  // Find most active day
  let mostActiveDay = '';
  let maxCommits = 0;
  Object.entries(commitsByDay).forEach(([date, commitCount]) => {
    if (commitCount > maxCommits) {
      maxCommits = commitCount;
      mostActiveDay = date;
    }
  });

  // Calculate average commits per day
  const totalCommits = Object.values(commitsByDay).reduce((sum, count) => sum + count, 0);
  const averageCommitsPerDay = Math.round((totalCommits / 7) * 10) / 10;

  // Find top contributor
  const topContributor = commitsPerContributorArray[0] || { username: 'N/A', commits: 0 };

  // Create commit frequency trend (same as commitsLast7Days but for trend analysis)
  const commitFrequencyTrend = Object.keys(commitsByDay).map(date => ({
    date: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    commits: commitsByDay[date]
  }));

  return {
    commitsPerContributor: commitsPerContributorArray,
    mostActiveDay,
    averageCommitsPerDay,
    topContributor,
    commitFrequencyTrend
  };
};

/**
 * Generate AI-powered insights based on repository metrics
 * @param {Object} productivityMetrics - Productivity metrics data
 * @param {Object} repoData - Repository basic information
 * @returns {Array} Array of insight strings
 */
const generateInsights = (productivityMetrics, repoData) => {
  const insights = [];
  const { commitsPerContributor, mostActiveDay, averageCommitsPerDay, topContributor, commitFrequencyTrend } = productivityMetrics;

  // Activity level insight
  if (averageCommitsPerDay > 10) {
    insights.push(`🔥 This repository shows very high activity with an average of ${averageCommitsPerDay} commits per day.`);
  } else if (averageCommitsPerDay > 5) {
    insights.push(`📈 Repository shows high activity with an average of ${averageCommitsPerDay} commits per day.`);
  } else if (averageCommitsPerDay > 0) {
    insights.push(`📊 Repository shows moderate activity with an average of ${averageCommitsPerDay} commits per day.`);
  } else {
    insights.push(`📉 Repository shows low activity with no commits in the last 7 days.`);
  }

  // Top contributor insight
  if (topContributor && topContributor.username !== 'N/A') {
    const contributionPercentage = ((topContributor.commits / commitFrequencyTrend.reduce((sum, day) => sum + day.commits, 0)) * 100).toFixed(1);
    insights.push(`👑 ${topContributor.username} is the most active contributor with ${topContributor.commits} commits (${contributionPercentage}% of total activity).`);
  }

  // Most active day insight
  if (mostActiveDay) {
    const dayName = new Date(mostActiveDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    const dayCommits = commitFrequencyTrend.find(day => day.date.includes(dayName.split(',')[0]))?.commits || 0;
    insights.push(`📅 Peak activity occurred on ${dayName} with ${dayCommits} commits.`);
  }

  // Trend analysis insight
  const recentDays = commitFrequencyTrend.slice(-3); // Last 3 days
  const earlierDays = commitFrequencyTrend.slice(0, -3); // First 4 days
  const recentAvg = recentDays.reduce((sum, day) => sum + day.commits, 0) / recentDays.length;
  const earlierAvg = earlierDays.reduce((sum, day) => sum + day.commits, 0) / earlierDays.length;

  if (recentAvg > earlierAvg * 1.2) {
    insights.push(`🚀 Commit activity is increasing significantly in recent days.`);
  } else if (recentAvg < earlierAvg * 0.8) {
    insights.push(`📉 Commit activity is decreasing in recent days.`);
  } else {
    insights.push(`📊 Commit activity remains stable throughout the week.`);
  }

  // Contributor diversity insight
  if (commitsPerContributor.length > 20) {
    insights.push(`👥 Highly diverse contribution pattern with ${commitsPerContributor.length} active contributors.`);
  } else if (commitsPerContributor.length > 10) {
    insights.push(`👥 Good contributor diversity with ${commitsPerContributor.length} active contributors.`);
  } else if (commitsPerContributor.length > 1) {
    insights.push(`👥 Limited contributor base with ${commitsPerContributor.length} active contributors.`);
  }

  // Repository age insight (if creation date is available)
  if (repoData.created_at) {
    const repoAge = Math.floor((new Date() - new Date(repoData.created_at)) / (1000 * 60 * 60 * 24 * 365));
    if (repoAge < 1) {
      insights.push(`🆕 This is a relatively new repository (${Math.floor(repoAge * 12)} months old).`);
    } else if (repoAge < 5) {
      insights.push(`📅 This repository is ${repoAge} years old and actively maintained.`);
    } else {
      insights.push(`🏛️ Well-established repository with ${repoAge} years of development history.`);
    }
  }

  // Limit to 4 most relevant insights
  return insights.slice(0, 4);
};

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

    // Fetch all contributors for detailed analysis
    const allContributorsResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors`, {
      params: { per_page: 100 }
    });
    const allContributors = allContributorsResponse.data;
    
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

    // Calculate advanced productivity metrics
    const productivityMetrics = calculateProductivityMetrics(commits, allContributors, commitsByDay);
    
    // Generate AI insights
    const aiInsights = generateInsights(productivityMetrics, repoData);
    
    // Process top contributors
    const topContributors = contributors.map(contributor => ({
      username: contributor.login,
      avatar: contributor.avatar_url,
      contributions: contributor.contributions
    }));
    
    // Return processed metrics with new fields
    return {
      repoName: repoData.full_name,
      stars: repoData.stargazers_count,
      openIssues: openIssuesCount,
      pullRequests: pullRequestsCount,
      contributorsCount: repoData.contributors_url ? contributors.length : 0,
      topContributors,
      commitsLast7Days,
      ...productivityMetrics,
      aiInsights
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
