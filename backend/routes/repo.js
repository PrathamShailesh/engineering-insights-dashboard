const express = require('express');
const router = express.Router();
const { getRepoMetrics } = require('../controllers/repoController');

/**
 * GET /api/repo/:owner/:repo
 * Fetch repository metrics from GitHub API
 * 
 * Route Parameters:
 * - owner: Repository owner/organization name
 * - repo: Repository name
 * 
 * Returns:
 * {
 *   repoName: string,
 *   stars: number,
 *   openIssues: number,
 *   pullRequests: number,
 *   contributorsCount: number,
 *   topContributors: Array,
 *   commitsLast7Days: Array
 * }
 */
router.get('/repo/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    
    // Validate input parameters
    if (!owner || !repo) {
      return res.status(400).json({
        error: 'Both owner and repository name are required'
      });
    }
    
    // Sanitize input (remove potential malicious characters)
    const sanitizedOwner = owner.replace(/[^a-zA-Z0-9_.-]/g, '');
    const sanitizedRepo = repo.replace(/[^a-zA-Z0-9_.-]/g, '');
    
    if (sanitizedOwner !== owner || sanitizedRepo !== repo) {
      return res.status(400).json({
        error: 'Invalid characters in owner or repository name'
      });
    }
    
    // Fetch repository metrics
    const metrics = await getRepoMetrics(sanitizedOwner, sanitizedRepo);
    
    // Return successful response
    res.status(200).json(metrics);
    
  } catch (error) {
    console.error('Error in repo route:', error.message);
    
    // Return appropriate error response
    if (error.message.includes('not found')) {
      res.status(404).json({ error: error.message });
    } else if (error.message.includes('rate limit')) {
      res.status(429).json({ error: error.message });
    } else if (error.message.includes('Network error')) {
      res.status(503).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

module.exports = router;
