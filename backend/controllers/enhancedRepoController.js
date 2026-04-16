const axios = require('axios');
const Repository = require('../models/Repository');
const Commit = require('../models/Commit');
const Analytics = require('../models/Analytics');

/**
 * Advanced Analytics Engine with Database Integration
 */
class EnhancedAnalyticsEngine {
  /**
   * Calculate advanced productivity metrics
   * @param {Array} commits - Array of commit objects
   * @param {Array} contributors - Array of contributor objects
   * @param {Object} commitsByDay - Commits grouped by day
   * @returns {Object} Productivity metrics
   */
  static calculateProductivityMetrics(commits, contributors, commitsByDay) {
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

    // Create commit frequency trend
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
  }

  /**
   * Generate AI-powered insights with advanced logic
   * @param {Object} analyticsData - Analytics data
   * @param {Object} repoData - Repository data
   * @returns {Array} Array of insight strings
   */
  static generateAdvancedInsights(analyticsData, repoData) {
    const insights = [];
    const { 
      commitsPerContributor, 
      mostActiveDay, 
      averageCommitsPerDay, 
      topContributor, 
      commitFrequencyTrend,
      repoHealthScore 
    } = analyticsData;

    // Health score insight
    if (repoHealthScore >= 80) {
      insights.push(`🏆 Excellent repository health score: ${repoHealthScore}/100. This repository shows strong engagement and activity.`);
    } else if (repoHealthScore >= 60) {
      insights.push(`📊 Good repository health score: ${repoHealthScore}/100. Room for improvement in engagement.`);
    } else {
      insights.push(`⚠️ Low repository health score: ${repoHealthScore}/100. Consider increasing contributor diversity and activity.`);
    }

    // Activity velocity insight
    if (averageCommitsPerDay > 15) {
      insights.push(`🚀 Exceptional development velocity with ${averageCommitsPerDay} commits/day. High productivity observed.`);
    } else if (averageCommitsPerDay > 8) {
      insights.push(`📈 High development velocity with ${averageCommitsPerDay} commits/day. Strong activity level.`);
    } else if (averageCommitsPerDay > 3) {
      insights.push(`📊 Moderate development velocity with ${averageCommitsPerDay} commits/day. Consistent activity.`);
    } else if (averageCommitsPerDay > 0) {
      insights.push(`🐌 Low development velocity with ${averageCommitsPerDay} commits/day. Consider increasing development activity.`);
    } else {
      insights.push(`🛑 No development activity in the last 7 days. Repository may be inactive or abandoned.`);
    }

    // Contributor diversity insight
    if (commitsPerContributor.length > 20) {
      insights.push(`👥 Highly diverse contribution pattern with ${commitsPerContributor.length} active contributors. Excellent community engagement.`);
    } else if (commitsPerContributor.length > 10) {
      insights.push(`👥 Good contributor diversity with ${commitsPerContributor.length} active contributors.`);
    } else if (commitsPerContributor.length > 5) {
      insights.push(`👥 Moderate contributor diversity with ${commitsPerContributor.length} active contributors.`);
    } else if (commitsPerContributor.length > 1) {
      insights.push(`⚠️ Low contributor diversity with only ${commitsPerContributor.length} active contributors. Consider community outreach.`);
    } else {
      insights.push(`🚨 Single contributor repository. High dependency risk - consider diversifying contributors.`);
    }

    // Top contributor dominance insight
    if (topContributor && topContributor.username !== 'N/A') {
      const totalCommits = commitFrequencyTrend.reduce((sum, day) => sum + day.commits, 0);
      const contributionPercentage = ((topContributor.commits / totalCommits) * 100).toFixed(1);
      
      if (contributionPercentage > 70) {
        insights.push(`👑 ${topContributor.username} dominates with ${contributionPercentage}% of commits. High dependency risk.`);
      } else if (contributionPercentage > 50) {
        insights.push(`👑 ${topContributor.username} leads with ${contributionPercentage}% of commits. Moderate dependency risk.`);
      } else {
        insights.push(`👑 ${topContributor.username} is most active with ${contributionPercentage}% of commits. Good balance.`);
      }
    }

    // Trend analysis insight
    if (commitFrequencyTrend.length >= 4) {
      const recentDays = commitFrequencyTrend.slice(-3);
      const earlierDays = commitFrequencyTrend.slice(0, -3);
      const recentAvg = recentDays.reduce((sum, day) => sum + day.commits, 0) / recentDays.length;
      const earlierAvg = earlierDays.reduce((sum, day) => sum + day.commits, 0) / earlierDays.length;

      if (recentAvg > earlierAvg * 1.3) {
        insights.push(`📅 Accelerating development activity. Recent velocity is ${(recentAvg/earlierAvg).toFixed(1)}x higher than earlier period.`);
      } else if (recentAvg > earlierAvg * 1.1) {
        insights.push(`📈 Increasing development activity. Positive growth trend detected.`);
      } else if (recentAvg < earlierAvg * 0.7) {
        insights.push(`📉 Decreasing development activity. Recent velocity is ${(earlierAvg/recentAvg).toFixed(1)}x lower than earlier period.`);
      } else if (recentAvg < earlierAvg * 0.9) {
        insights.push(`📊 Slightly decreasing development activity. Monitor trend closely.`);
      } else {
        insights.push(`📊 Stable development activity. Consistent velocity maintained.`);
      }
    }

    // Issue management insight
    if (repoData.openIssues > 100) {
      insights.push(`🐛 High issue backlog with ${repoData.openIssues} open issues. May impact development velocity.`);
    } else if (repoData.openIssues > 50) {
      insights.push(`🐛 Moderate issue backlog with ${repoData.openIssues} open issues. Consider issue triage.`);
    } else if (repoData.openIssues > 10) {
      insights.push(`✅ Manageable issue backlog with ${repoData.openIssues} open issues.`);
    } else {
      insights.push(`✅ Excellent issue management with only ${repoData.openIssues} open issues.`);
    }

    // Pull request insight
    if (repoData.pullRequests > 50) {
      insights.push(`🔄 High PR activity with ${repoData.pullRequests} open pull requests. Active collaboration.`);
    } else if (repoData.pullRequests > 20) {
      insights.push(`🔄 Good PR activity with ${repoData.pullRequests} open pull requests.`);
    } else if (repoData.pullRequests > 5) {
      insights.push(`🔄 Moderate PR activity with ${repoData.pullRequests} open pull requests.`);
    } else {
      insights.push(`🔄 Low PR activity with ${repoData.pullRequests} open pull requests. Encourage contributions.`);
    }

    // Repository maturity insight
    if (repoData.created_at) {
      const repoAge = Math.floor((new Date() - new Date(repoData.created_at)) / (1000 * 60 * 60 * 24 * 365));
      if (repoAge < 0.5) {
        insights.push(`🆕 Very new repository (${Math.floor(repoAge * 12)} months old). Early stage development.`);
      } else if (repoAge < 2) {
        insights.push(`📅 Young repository (${repoAge.toFixed(1)} years old). Growing project.`);
      } else if (repoAge < 5) {
        insights.push(`📅 Mature repository (${repoAge.toFixed(1)} years old). Established project.`);
      } else {
        insights.push(`🏛️ Legacy repository (${repoAge.toFixed(1)} years old). Well-established with history.`);
      }
    }

    // Limit to 6 most relevant insights
    return insights.slice(0, 6);
  }

  /**
   * Calculate commit trend
   * @param {Array} commitFrequencyTrend - Commit frequency data
   * @returns {string} Trend status
   */
  static calculateTrend(commitFrequencyTrend) {
    if (commitFrequencyTrend.length < 2) return 'insufficient_data';
    
    const recentDays = commitFrequencyTrend.slice(-3);
    const earlierDays = commitFrequencyTrend.slice(0, -3);
    
    if (recentDays.length === 0 || earlierDays.length === 0) return 'insufficient_data';
    
    const recentAvg = recentDays.reduce((sum, day) => sum + day.commits, 0) / recentDays.length;
    const earlierAvg = earlierDays.reduce((sum, day) => sum + day.commits, 0) / earlierDays.length;
    
    if (recentAvg > earlierAvg * 1.2) return 'increasing';
    if (recentAvg < earlierAvg * 0.8) return 'decreasing';
    return 'stable';
  }
}

/**
 * Enhanced repository controller with database integration
 */
const getEnhancedRepoMetrics = async (owner, repo) => {
  try {
    const repoFullName = `${owner}/${repo}`;
    
    // Check if repository was recently fetched (within last hour)
    const wasRecentlyFetched = await Repository.wasRecentlyFetched(repo, owner);
    let repoData, analyticsData;
    
    if (wasRecentlyFetched) {
      // Get data from database
      repoData = await Repository.findByRepoAndOwner(repo, owner);
      analyticsData = await Analytics.findByRepo(repoFullName);
      
      if (repoData && analyticsData) {
        return {
          ...repoData,
          ...analyticsData,
          fromCache: true,
          rateLimited: false
        };
      }
    }
    
    // Fetch fresh data from GitHub API
    const GITHUB_API_BASE = 'https://api.github.com';
    
    // Prepare headers with optional GitHub token
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
      headers['User-Agent'] = 'Engineering-Insights-Dashboard/1.0';
    }
    
    // Fetch basic repository info
    const repoResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, { headers });
    const repoDataFromAPI = repoResponse.data;
    
    // Fetch contributors
    const contributorsResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors`, {
      params: { per_page: 100 },
      headers
    });
    const allContributors = contributorsResponse.data;
    
    // Fetch commits for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const commitsResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits`, {
      params: { 
        since: sevenDaysAgo.toISOString(),
        per_page: 100 
      },
      headers
    });
    const commits = commitsResponse.data;
    
    // Fetch open issues
    const issuesResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`, {
      params: { 
        state: 'open',
        per_page: 1 
      },
      headers
    });
    const linkMatch = issuesResponse.headers.link ? 
      issuesResponse.headers.link.match(/page=(\d+)>; rel="last"/) : null;
    const openIssuesCount = linkMatch ? 
      parseInt(linkMatch[1]) : 
      issuesResponse.data.length;
    
    // Fetch pull requests
    const prsResponse = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls`, {
      params: { 
        state: 'open',
        per_page: 1 
      },
      headers
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
    
    // Convert commits data to array format
    const commitsLast7Days = Object.keys(commitsByDay).map(date => ({
      date,
      commits: commitsByDay[date]
    }));
    
    // Calculate advanced productivity metrics
    const productivityMetrics = EnhancedAnalyticsEngine.calculateProductivityMetrics(
      commits, 
      allContributors, 
      commitsByDay
    );
    
    // Prepare repository data
    repoData = {
      repoName: repoDataFromAPI.full_name,
      owner: owner,
      stars: repoDataFromAPI.stargazers_count,
      openIssues: openIssuesCount,
      pullRequests: pullRequestsCount,
      contributorsCount: allContributors.length,
      topContributors: allContributors.slice(0, 5).map(contributor => ({
        username: contributor.login,
        avatar: contributor.avatar_url,
        contributions: contributor.contributions
      })),
      commitsLast7Days,
      created_at: repoDataFromAPI.created_at
    };
    
    // Calculate repository health score
    const repoHealthScore = Analytics.calculateHealthScore(repoData, productivityMetrics);
    
    // Generate AI insights
    const aiInsights = EnhancedAnalyticsEngine.generateAdvancedInsights(
      { ...productivityMetrics, repoHealthScore }, 
      repoData
    );
    
    // Prepare analytics data
    analyticsData = {
      ...productivityMetrics,
      repoHealthScore,
      aiInsights,
      commitTrend: EnhancedAnalyticsEngine.calculateTrend(productivityMetrics.commitFrequencyTrend)
    };
    
    // Store in database
    await Repository.save(repoData);
    await Commit.saveBatch(repoFullName, commitsLast7Days);
    await Analytics.save(repoFullName, analyticsData);
    
    return {
      ...repoData,
      ...analyticsData,
      fromCache: false
    };
    
  } catch (error) {
    console.error('Error fetching enhanced repository data:', error.message);
    
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Repository not found. Please check the owner and repository name.');
      } else if (error.response.status === 403) {
        // Check if it's rate limit
        const rateLimitRemaining = error.response.headers['x-ratelimit-remaining'];
        const rateLimitReset = error.response.headers['x-ratelimit-reset'];
        
        if (rateLimitRemaining === '0') {
          const resetTime = new Date(rateLimitReset * 1000);
          const waitTime = Math.ceil((resetTime - new Date()) / 1000 / 60); // minutes
          
          throw new Error(`GitHub API rate limit exceeded. Resets in ${waitTime} minutes. Please try again later.`);
        } else {
          throw new Error('GitHub API rate limit exceeded. Please try again later.');
        }
      } else {
        throw new Error(`GitHub API error: ${error.response.data.message || 'Unknown error'}`);
      }
    } else if (error.request) {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error('An unexpected error occurred while fetching repository data.');
    }
  }
};

module.exports = {
  getEnhancedRepoMetrics,
  EnhancedAnalyticsEngine
};
