const sqlite3 = require('sqlite3').verbose();
const path = require('path');

/**
 * Database configuration and connection setup
 */
class Database {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize database connection and create tables
   */
  async init() {
    return new Promise((resolve, reject) => {
      // Create database file in the backend directory
      const dbPath = path.join(__dirname, '..', 'data', 'engineering_insights.db');
      
      // Ensure data directory exists
      const fs = require('fs');
      const dataDir = path.dirname(dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
          reject(err);
        } else {
          console.log('Connected to SQLite database');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  /**
   * Create database tables
   */
  async createTables() {
    return new Promise((resolve, reject) => {
      const createRepositoriesTable = `
        CREATE TABLE IF NOT EXISTS repositories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          repo_name TEXT NOT NULL,
          owner TEXT NOT NULL,
          stars INTEGER DEFAULT 0,
          open_issues INTEGER DEFAULT 0,
          pull_requests INTEGER DEFAULT 0,
          contributors_count INTEGER DEFAULT 0,
          fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(repo_name, owner)
        )
      `;

      const createCommitsTable = `
        CREATE TABLE IF NOT EXISTS commits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          repo_name TEXT NOT NULL,
          date TEXT NOT NULL,
          commit_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(repo_name, date)
        )
      `;

      const createContributorsTable = `
        CREATE TABLE IF NOT EXISTS contributors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          repo_name TEXT NOT NULL,
          username TEXT NOT NULL,
          avatar TEXT,
          contributions INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(repo_name, username)
        )
      `;

      const createAnalyticsTable = `
        CREATE TABLE IF NOT EXISTS analytics (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          repo_name TEXT NOT NULL,
          commits_per_contributor TEXT,
          most_active_day TEXT,
          average_commits_per_day REAL DEFAULT 0,
          top_contributor TEXT,
          commit_frequency_trend TEXT,
          repo_health_score REAL DEFAULT 0,
          ai_insights TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(repo_name)
        )
      `;

      this.db.serialize(() => {
        this.db.run(createRepositoriesTable);
        this.db.run(createCommitsTable);
        this.db.run(createContributorsTable);
        this.db.run(createAnalyticsTable, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database tables created successfully');
            resolve();
          }
        });
      });
    });
  }

  /**
   * Get database instance
   */
  getDb() {
    return this.db;
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err.message);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}

module.exports = new Database();
