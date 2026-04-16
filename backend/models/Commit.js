const database = require('../config/database');

/**
 * Commit model for database operations
 */
class Commit {
  /**
   * Store commit data for a repository
   * @param {string} repoName - Repository name
   * @param {Array} commitsData - Array of commit data
   */
  static async saveBatch(repoName, commitsData) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO commits (repo_name, date, commit_count)
        VALUES (?, ?, ?)
      `);

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        commitsData.forEach(commit => {
          stmt.run([repoName, commit.date, commit.commits]);
        });

        stmt.finalize((err) => {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
          } else {
            db.run('COMMIT', (commitErr) => {
              if (commitErr) {
                reject(commitErr);
              } else {
                resolve({ saved: commitsData.length });
              }
            });
          }
        });
      });
    });
  }

  /**
   * Get commits for a repository
   * @param {string} repoName - Repository name
   * @param {number} days - Number of days to look back
   */
  static async findByRepo(repoName, days = 7) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = `
        SELECT * FROM commits 
        WHERE repo_name = ? 
        AND date >= date('now', '-${days} days')
        ORDER BY date ASC
      `;
      
      db.all(sql, [repoName], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Get commit statistics for a repository
   * @param {string} repoName - Repository name
   */
  static async getStats(repoName) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = `
        SELECT 
          SUM(commit_count) as total_commits,
          AVG(commit_count) as avg_commits_per_day,
          MAX(commit_count) as max_commits,
          COUNT(*) as active_days,
          date as most_active_day
        FROM commits 
        WHERE repo_name = ? 
        AND date >= date('now', '-7 days')
        ORDER BY commit_count DESC, date DESC
        LIMIT 1
      `;
      
      db.get(sql, [repoName], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Get commit trend (increasing/decreasing)
   * @param {string} repoName - Repository name
   */
  static async getTrend(repoName) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = `
        SELECT date, commit_count 
        FROM commits 
        WHERE repo_name = ? 
        AND date >= date('now', '-7 days')
        ORDER BY date ASC
      `;
      
      db.all(sql, [repoName], (err, rows) => {
        if (err) {
          reject(err);
        } else if (rows.length < 2) {
          resolve('insufficient_data');
        } else {
          // Calculate trend: compare first half vs second half
          const midPoint = Math.floor(rows.length / 2);
          const firstHalf = rows.slice(0, midPoint);
          const secondHalf = rows.slice(midPoint);
          
          const firstAvg = firstHalf.reduce((sum, row) => sum + row.commit_count, 0) / firstHalf.length;
          const secondAvg = secondHalf.reduce((sum, row) => sum + row.commit_count, 0) / secondHalf.length;
          
          let trend;
          if (secondAvg > firstAvg * 1.2) {
            trend = 'increasing';
          } else if (secondAvg < firstAvg * 0.8) {
            trend = 'decreasing';
          } else {
            trend = 'stable';
          }
          
          resolve(trend);
        }
      });
    });
  }

  /**
   * Delete old commits (older than 30 days)
   */
  static async deleteOld() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const sql = 'DELETE FROM commits WHERE date < date("now", "-30 days")';
      
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

module.exports = Commit;
