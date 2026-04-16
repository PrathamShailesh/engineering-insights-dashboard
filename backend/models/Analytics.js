const database = require('../config/database');

/**
 * Analytics model for storing and retrieving analytics data
 */
class Analytics {
  /**
   * Store analytics data for a repository
   * @param {string} repoName - Repository name
   * @param {Object} analyticsData - Analytics data
   */
  static async save(repoName, analyticsData) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = `
        INSERT OR REPLACE INTO analytics 
        (repo_name, commits_per_contributor, most_active_day, average_commits_per_day, 
         top_contributor, commit_frequency_trend, repo_health_score, ai_insights)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [
        repoName,
        JSON.stringify(analyticsData.commitsPerContributor || []),
        analyticsData.mostActiveDay || '',
        analyticsData.averageCommitsPerDay || 0,
        JSON.stringify(analyticsData.topContributor || {}),
        JSON.stringify(analyticsData.commitFrequencyTrend || []),
        analyticsData.repoHealthScore || 0,
        JSON.stringify(analyticsData.aiInsights || [])
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, repoName, ...analyticsData });
        }
      });
    });
  }

  /**
   * Get analytics for a repository
   * @param {string} repoName - Repository name
   */
  static async findByRepo(repoName) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = 'SELECT * FROM analytics WHERE repo_name = ? ORDER BY created_at DESC LIMIT 1';
      
      db.get(sql, [repoName], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          // Parse JSON fields
          resolve({
            ...row,
            commitsPerContributor: JSON.parse(row.commits_per_contributor || '[]'),
            topContributor: JSON.parse(row.top_contributor || '{}'),
            commitFrequencyTrend: JSON.parse(row.commit_frequency_trend || '[]'),
            aiInsights: JSON.parse(row.ai_insights || '[]')
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  /**
   * Get analytics for multiple repositories
   * @param {Array} repoNames - Array of repository names
   */
  static async findByRepos(repoNames) {
    return new Promise((resolve, reject) => {
      if (repoNames.length === 0) {
        resolve([]);
        return;
      }

      const db = database.getDb();
      const placeholders = repoNames.map(() => '?').join(',');
      const sql = `
        SELECT * FROM analytics 
        WHERE repo_name IN (${placeholders})
        ORDER BY created_at DESC
      `;
      
      db.all(sql, repoNames, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parse JSON fields for each row
          const analytics = rows.map(row => ({
            ...row,
            commitsPerContributor: JSON.parse(row.commits_per_contributor || '[]'),
            topContributor: JSON.parse(row.top_contributor || '{}'),
            commitFrequencyTrend: JSON.parse(row.commit_frequency_trend || '[]'),
            aiInsights: JSON.parse(row.ai_insights || '[]')
          }));
          resolve(analytics);
        }
      });
    });
  }

  /**
   * Get top repositories by health score
   * @param {number} limit - Number of repositories to return
   */
  static async getTopByHealthScore(limit = 10) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = `
        SELECT a.*, r.repo_name, r.owner, r.stars
        FROM analytics a
        JOIN repositories r ON a.repo_name = r.repo_name
        ORDER BY a.repo_health_score DESC
        LIMIT ?
      `;
      
      db.all(sql, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const analytics = rows.map(row => ({
            ...row,
            commitsPerContributor: JSON.parse(row.commits_per_contributor || '[]'),
            topContributor: JSON.parse(row.top_contributor || '{}'),
            commitFrequencyTrend: JSON.parse(row.commit_frequency_trend || '[]'),
            aiInsights: JSON.parse(row.ai_insights || '[]')
          }));
          resolve(analytics);
        }
      });
    });
  }

  /**
   * Calculate repository health score
   * @param {Object} repoData - Repository data
   * @param {Object} analyticsData - Analytics data
   */
  static calculateHealthScore(repoData, analyticsData) {
    const {
      stars = 0,
      openIssues = 0,
      contributorsCount = 0
    } = repoData;

    const {
      averageCommitsPerDay = 0,
      commitFrequencyTrend = []
    } = analyticsData;

    // Base score from stars and contributors
    const engagementScore = Math.log10(stars + 1) * 10 + contributorsCount * 5;
    
    // Penalty for open issues
    const issuesPenalty = Math.min(openIssues * 2, 50);
    
    // Activity bonus
    const activityBonus = Math.min(averageCommitsPerDay * 3, 30);
    
    // Trend bonus
    let trendBonus = 0;
    if (commitFrequencyTrend.length >= 2) {
      const recentDays = commitFrequencyTrend.slice(-3);
      const earlierDays = commitFrequencyTrend.slice(0, -3);
      const recentAvg = recentDays.reduce((sum, day) => sum + day.commits, 0) / recentDays.length;
      const earlierAvg = earlierDays.reduce((sum, day) => sum + day.commits, 0) / earlierDays.length;
      
      if (recentAvg > earlierAvg * 1.2) {
        trendBonus = 15; // Increasing trend
      } else if (recentAvg < earlierAvg * 0.8) {
        trendBonus = -10; // Decreasing trend
      } else {
        trendBonus = 5; // Stable trend
      }
    }

    // Calculate final score (0-100)
    let healthScore = Math.max(0, Math.min(100, 
      engagementScore - issuesPenalty + activityBonus + trendBonus
    ));

    return Math.round(healthScore);
  }

  /**
   * Delete old analytics (older than 30 days)
   */
  static async deleteOld() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = 'DELETE FROM analytics WHERE created_at < datetime("now", "-30 days")';
      
      db.run(sql, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ deletedCount: this.changes });
        }
      });
    });
  }
}

module.exports = Analytics;
