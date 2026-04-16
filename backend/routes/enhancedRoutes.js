const express = require('express');
const { getEnhancedRepoMetrics, EnhancedAnalyticsEngine } = require('../controllers/enhancedRepoController');
const Repository = require('../models/Repository');
const Analytics = require('../models/Analytics');

const router = express.Router();

/**
 * GET /api/repo/:owner/:repo - Enhanced repository metrics with database storage
 */
router.get('/repo/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    // Validate input
    if (!owner || !repo) {
      return res.status(400).json({
        error: 'Owner and repository name are required'
      });
    }
    
    // Validate repository name format
    const repoNameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!repoNameRegex.test(repo) || !repoNameRegex.test(owner)) {
      return res.status(400).json({
        error: 'Invalid owner or repository name format'
      });
    }
    
    const data = await getEnhancedRepoMetrics(owner, repo);
    
    res.json({
      success: true,
      data,
      fromCache: data.fromCache || false
    });
    
  } catch (error) {
    console.error('Enhanced repo metrics error:', error.message);
    
    // Handle specific error types
    if (error.message.includes('Repository not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error: error.message
      });
    }
    
    if (error.message.includes('Network error')) {
      return res.status(503).json({
        success: false,
        error: 'Service temporarily unavailable. Please try again later.'
      });
    }
    
    // Default server error
    res.status(500).json({
      success: false,
      error: 'Internal server error. Please try again later.'
    });
  }
});

/**
 * GET /api/history - Get previously fetched repositories
 */
router.get('/history', async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    // Validate pagination parameters
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const parsedOffset = Math.max(parseInt(offset) || 0, 0);
    
    const repositories = await Repository.findAll(parsedLimit, parsedOffset);
    
    res.json({
      success: true,
      data: repositories,
      pagination: {
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: repositories.length === parsedLimit
      }
    });
    
  } catch (error) {
    console.error('History fetch error:', error.message);
    
    if (error.message.includes('Database') || error.message.includes('SQL')) {
      return res.status(503).json({
        success: false,
        error: 'Database temporarily unavailable. Please try again later.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to fetch repository history. Please try again later.'
    });
  }
});

/**
 * GET /api/compare - Compare two repositories
 */
router.get('/compare', async (req, res) => {
  try {
    const { repo1, repo2 } = req.query;
    
    if (!repo1 || !repo2) {
      return res.status(400).json({
        success: false,
        error: 'Both repo1 and repo2 parameters are required (format: owner/repo)'
      });
    }
    
    // Parse repository names
    const [owner1, name1] = repo1.split('/');
    const [owner2, name2] = repo2.split('/');
    
    if (!owner1 || !name1 || !owner2 || !name2) {
      return res.status(400).json({
        success: false,
        error: 'Invalid repository format. Use: owner/repo'
      });
    }
    
    // Fetch data for both repositories
    const [data1, data2] = await Promise.all([
      getEnhancedRepoMetrics(owner1.trim(), name1.trim()),
      getEnhancedRepoMetrics(owner2.trim(), name2.trim())
    ]);
    
    // Calculate comparison scores
    const score1 = calculateComparisonScore(data1);
    const score2 = calculateComparisonScore(data2);
    
    // Determine winner
    const winner = score1 > score2 ? 'repo1' : score2 > score1 ? 'repo2' : 'tie';
    
    // Generate comparison summary
    const summary = generateComparisonSummary(data1, data2, winner);
    
    res.json({
      success: true,
      data: {
        repo1: { ...data1, comparisonScore: score1 },
        repo2: { ...data2, comparisonScore: score2 },
        winner,
        summary,
        comparison: {
          repo1Advantages: getAdvantages(data1, data2),
          repo2Advantages: getAdvantages(data2, data1),
          similar: getSimilarities(data1, data2)
        }
      }
    });
    
  } catch (error) {
    console.error('Repository comparison error:', error.message);
    
    if (error.message.includes('Repository not found')) {
      return res.status(404).json({
        success: false,
        error: 'One or both repositories not found. Please check the repository names.'
      });
    }
    
    if (error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error: 'API rate limit exceeded. Please try again later.'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to compare repositories. Please try again later.'
    });
  }
});

/**
 * POST /api/ask - Ask AI questions about repositories
 */
router.post('/ask', async (req, res) => {
  try {
    const { question, data } = req.body;
    
    if (!question || !data) {
      return res.status(400).json({
        success: false,
        error: 'Question and data are required'
      });
    }
    
    // Generate AI-like response based on rules
    const response = await generateAIResponse(question, data);
    
    res.json({
      success: true,
      question,
      response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Ask AI error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI response'
    });
  }
});

/**
 * GET /api/analytics/top - Get top repositories by health score
 */
router.get('/analytics/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 50);
    
    const topRepos = await Analytics.getTopByHealthScore(parsedLimit);
    
    res.json({
      success: true,
      data: topRepos,
      count: topRepos.length
    });
    
  } catch (error) {
    console.error('Top analytics error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch top repositories'
    });
  }
});

/**
 * Calculate comparison score for repository
 */
function calculateComparisonScore(repoData) {
  const {
    stars = 0,
    contributorsCount = 0,
    averageCommitsPerDay = 0,
    repoHealthScore = 0,
    openIssues = 0,
    pullRequests = 0
  } = repoData;
  
  // Weighted scoring system
  const score = 
    (Math.log10(stars + 1) * 20) +           // Stars (logarithmic)
    (contributorsCount * 15) +                   // Contributors
    (averageCommitsPerDay * 10) +                // Activity
    (repoHealthScore * 0.5) +                   // Health score
    (pullRequests * 2) -                         // PRs (positive)
    (openIssues * 1);                            // Issues (penalty)
  
  return Math.round(score);
}

/**
 * Generate comparison summary
 */
function generateComparisonSummary(data1, data2, winner) {
  if (winner === 'tie') {
    return 'Both repositories show similar performance and engagement levels.';
  }
  
  const winnerData = winner === 'repo1' ? data1 : data2;
  const loserData = winner === 'repo1' ? data2 : data1;
  
  const advantages = [];
  
  if (winnerData.stars > loserData.stars * 1.5) {
    advantages.push('significantly more popular');
  }
  if (winnerData.averageCommitsPerDay > loserData.averageCommitsPerDay * 1.5) {
    advantages.push('much more active development');
  }
  if (winnerData.contributorsCount > loserData.contributorsCount * 1.5) {
    advantages.push('larger contributor community');
  }
  if (winnerData.repoHealthScore > loserData.repoHealthScore + 20) {
    advantages.push('better repository health');
  }
  
  const winnerName = winner === 'repo1' ? data1.repoName : data2.repoName;
  const loserName = winner === 'repo1' ? data2.repoName : data1.repoName;
  
  if (advantages.length > 0) {
    return `${winnerName} appears stronger with ${advantages.join(', ')} compared to ${loserName}.`;
  } else {
    return `${winnerName} shows slightly better metrics overall compared to ${loserName}.`;
  }
}

/**
 * Get advantages of repo1 over repo2
 */
function getAdvantages(repo1, repo2) {
  const advantages = [];
  
  if (repo1.stars > repo2.stars) {
    advantages.push(`${Math.round((repo1.stars / repo2.stars - 1) * 100)}% more stars`);
  }
  if (repo1.contributorsCount > repo2.contributorsCount) {
    advantages.push(`${repo1.contributorsCount - repo2.contributorsCount} more contributors`);
  }
  if (repo1.averageCommitsPerDay > repo2.averageCommitsPerDay) {
    advantages.push(`${(repo1.averageCommitsPerDay - repo2.averageCommitsPerDay).toFixed(1)} more daily commits`);
  }
  if (repo1.repoHealthScore > repo2.repoHealthScore) {
    advantages.push(`${repo1.repoHealthScore - repo2.repoHealthScore} points higher health score`);
  }
  if (repo1.openIssues < repo2.openIssues) {
    advantages.push(`${repo2.openIssues - repo1.openIssues} fewer open issues`);
  }
  
  return advantages;
}

/**
 * Get similarities between repositories
 */
function getSimilarities(repo1, repo2) {
  const similarities = [];
  
  const starRatio = Math.min(repo1.stars, repo2.stars) / Math.max(repo1.stars, repo2.stars);
  if (starRatio > 0.8) {
    similarities.push('Similar popularity');
  }
  
  const contributorRatio = Math.min(repo1.contributorsCount, repo2.contributorsCount) / 
                        Math.max(repo1.contributorsCount, repo2.contributorsCount);
  if (contributorRatio > 0.8) {
    similarities.push('Similar contributor base size');
  }
  
  const activityRatio = Math.min(repo1.averageCommitsPerDay, repo2.averageCommitsPerDay) / 
                       Math.max(repo1.averageCommitsPerDay, repo2.averageCommitsPerDay);
  if (activityRatio > 0.8) {
    similarities.push('Similar activity levels');
  }
  
  return similarities;
}

/**
 * Generate AI-like response based on rules
 */
async function generateAIResponse(question, data) {
  const lowerQuestion = question.toLowerCase();
  
  // Activity questions
  if (lowerQuestion.includes('active') || lowerQuestion.includes('activity')) {
    if (data.averageCommitsPerDay > 10) {
      return 'This repository shows very high activity with excellent development velocity.';
    } else if (data.averageCommitsPerDay > 5) {
      return 'This repository shows good activity with consistent development.';
    } else if (data.averageCommitsPerDay > 0) {
      return 'This repository shows moderate activity with room for improvement.';
    } else {
      return 'This repository shows no recent activity and may be inactive.';
    }
  }
  
  // Health questions
  if (lowerQuestion.includes('health') || lowerQuestion.includes('score')) {
    if (data.repoHealthScore >= 80) {
      return `Excellent repository health score of ${data.repoHealthScore}/100. This repository demonstrates strong engagement and activity.`;
    } else if (data.repoHealthScore >= 60) {
      return `Good repository health score of ${data.repoHealthScore}/100. There are opportunities for improvement.`;
    } else {
      return `Low repository health score of ${data.repoHealthScore}/100. Consider increasing contributor diversity and activity.`;
    }
  }
  
  // Comparison questions
  if (lowerQuestion.includes('better') || lowerQuestion.includes('compare')) {
    return 'Based on the available metrics, I recommend comparing both repositories using the comparison feature for a detailed analysis.';
  }
  
  // Trend questions
  if (lowerQuestion.includes('trend') || lowerQuestion.includes('increasing') || lowerQuestion.includes('decreasing')) {
    if (data.commitTrend === 'increasing') {
      return 'The repository shows an increasing trend in development activity, which is a positive sign.';
    } else if (data.commitTrend === 'decreasing') {
      return 'The repository shows a decreasing trend in development activity, which may need attention.';
    } else {
      return 'The repository shows stable development activity with consistent patterns.';
    }
  }

  // Maintenance questions
  if (lowerQuestion.includes('maintained') || lowerQuestion.includes('maintenance')) {
    if (data.repoHealthScore >= 80 && data.averageCommitsPerDay > 1) {
      return 'Yes, this repository appears to be very well-maintained with high health score and consistent activity.';
    } else if (data.repoHealthScore >= 60 && data.averageCommitsPerDay > 0.5) {
      return 'This repository appears to be reasonably well-maintained, though there is room for improvement.';
    } else if (data.openIssues > 100) {
      return 'This repository may not be well-maintained due to high issue backlog and low activity.';
    } else {
      return 'This repository shows signs of limited maintenance activity.';
    }
  }

  // Advantage questions
  if (lowerQuestion.includes('advantage') || lowerQuestion.includes('strength') || lowerQuestion.includes('good')) {
    const advantages = [];
    
    if (data.stars > 10000) {
      advantages.push('high popularity and community trust');
    }
    if (data.contributorsCount > 10) {
      advantages.push('strong contributor community');
    }
    if (data.averageCommitsPerDay > 5) {
      advantages.push('active development');
    }
    if (data.repoHealthScore >= 70) {
      advantages.push('good repository health');
    }
    if (data.openIssues < data.contributorsCount * 2) {
      advantages.push('effective issue management');
    }
    
    if (advantages.length > 0) {
      return `The main advantages of this repository are: ${advantages.join(', ')}.`;
    } else {
      return 'This repository has limited advantages but shows potential for growth.';
    }
  }

  // Development velocity questions
  if (lowerQuestion.includes('velocity') || lowerQuestion.includes('development') || lowerQuestion.includes('pace')) {
    if (data.averageCommitsPerDay > 10) {
      return `Excellent development velocity with ${data.averageCommitsPerDay.toFixed(1)} commits per day. This indicates very active development.`;
    } else if (data.averageCommitsPerDay > 5) {
      return `Good development velocity with ${data.averageCommitsPerDay.toFixed(1)} commits per day. Development is progressing steadily.`;
    } else if (data.averageCommitsPerDay > 1) {
      return `Moderate development velocity with ${data.averageCommitsPerDay.toFixed(1)} commits per day. Development is ongoing but could be more active.`;
    } else if (data.averageCommitsPerDay > 0) {
      return `Slow development velocity with ${data.averageCommitsPerDay.toFixed(1)} commits per day. Development activity is limited.`;
    } else {
      return 'No recent development activity detected. The repository may be inactive or in maintenance mode.';
    }
  }

  // Contribution questions
  if (lowerQuestion.includes('contribute') || lowerQuestion.includes('participate') || lowerQuestion.includes('join')) {
    if (data.repoHealthScore >= 70 && data.averageCommitsPerDay > 1 && data.openIssues < 50) {
      return 'Yes, this appears to be a good repository to contribute to. It has good health, active development, and manageable issues.';
    } else if (data.contributorsCount > 20) {
      return 'This repository has an active community and welcomes contributions. Look for issues labeled "good first issue" or "help wanted".';
    } else if (data.openIssues > 100) {
      return 'This repository has many open issues, which could indicate opportunities for contribution, but also potential maintenance challenges.';
    } else if (data.averageCommitsPerDay < 0.5) {
      return 'This repository shows limited recent activity, so contributions may not receive timely review.';
    } else {
      return 'This repository may be suitable for contributions, but consider reviewing the issue tracker and recent activity first.';
    }
  }
  
  // Contributor questions
  if (lowerQuestion.includes('contributor')) {
    if (data.contributorsCount > 20) {
      return `This repository has a large and diverse contributor base with ${data.contributorsCount} contributors.`;
    } else if (data.contributorsCount > 10) {
      return `This repository has a good contributor base with ${data.contributorsCount} contributors.`;
    } else if (data.contributorsCount > 1) {
      return `This repository has a small contributor base with ${data.contributorsCount} contributors. Consider community outreach.`;
    } else {
      return 'This repository appears to have a single contributor, which may present dependency risks.';
    }
  }
  
  // Default response
  return 'Based on the repository data, I can provide insights about activity, health, contributors, and trends. Please ask a more specific question about any of these aspects.';
}

module.exports = router;
