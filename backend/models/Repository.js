const database = require('../config/database');

/**
 * Repository model for database operations
 */
class Repository {
  /**
   * Store or update repository data
   * @param {Object} repoData - Repository data from GitHub API
   */
  static async save(repoData) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = `
        INSERT OR REPLACE INTO repositories 
        (repo_name, owner, stars, open_issues, pull_requests, contributors_count, fetched_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [
        repoData.repoName,
        repoData.owner || repoData.repoName.split('/')[0],
        repoData.stars,
        repoData.openIssues,
        repoData.pullRequests,
        repoData.contributorsCount,
        new Date().toISOString()
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...repoData });
        }
      });
    });
  }

  /**
   * Get repository by name and owner
   * @param {string} repoName - Repository name
   * @param {string} owner - Repository owner
   */
  static async findByRepoAndOwner(repoName, owner) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = 'SELECT * FROM repositories WHERE repo_name = ? AND owner = ? ORDER BY fetched_at DESC LIMIT 1';
      
      db.get(sql, [repoName, owner], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Get all repositories with pagination
   * @param {number} limit - Number of records to return
   * @param {number} offset - Number of records to skip
   */
  static async findAll(limit = 50, offset = 0) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = `
        SELECT * FROM repositories 
        ORDER BY fetched_at DESC 
        LIMIT ? OFFSET ?
      `;
      
      db.all(sql, [limit, offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Get recently fetched repositories (last 24 hours)
   */
  static async getRecent() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = `
        SELECT * FROM repositories 
        WHERE fetched_at >= datetime('now', '-24 hours')
        ORDER BY fetched_at DESC
        LIMIT 10
      `;
      
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Check if repository was recently fetched (within last hour)
   * @param {string} repoName - Repository name
   * @param {string} owner - Repository owner
   */
  static async wasRecentlyFetched(repoName, owner) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = `
        SELECT COUNT(*) as count FROM repositories 
        WHERE repo_name = ? AND owner = ? 
        AND fetched_at >= datetime('now', '-1 hour')
      `;
      
      db.get(sql, [repoName, owner], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });
  }

  /**
   * Delete old repositories (older than 30 days)
   */
  static async deleteOld() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = 'DELETE FROM repositories WHERE fetched_at < datetime("now", "-30 days")';
      
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

module.exports = Repository;
