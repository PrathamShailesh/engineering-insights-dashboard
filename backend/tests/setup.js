// Test setup file for Jest
const database = require('../config/database');

// Initialize test database before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Initialize in-memory database for testing
  // Use a different database file for testing
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const fs = require('fs');
  
  const testDbPath = path.join(__dirname, '..', 'data', 'test_insights.db');
  const dataDir = path.dirname(testDbPath);
  
  // Ensure data directory exists
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Initialize test database
  await new Promise((resolve, reject) => {
    const testDb = new sqlite3.Database(testDbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        // Create tables for testing
        testDb.serialize(() => {
          testDb.run(`CREATE TABLE IF NOT EXISTS repositories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            repo_name TEXT NOT NULL,
            owner TEXT NOT NULL,
            stars INTEGER DEFAULT 0,
            open_issues INTEGER DEFAULT 0,
            pull_requests INTEGER DEFAULT 0,
            contributors_count INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);
          
          testDb.run(`CREATE TABLE IF NOT EXISTS commits (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            repo_id INTEGER,
            commit_hash TEXT,
            author TEXT,
            date DATETIME,
            message TEXT,
            FOREIGN KEY (repo_id) REFERENCES repositories (id)
          )`);
          
          testDb.run(`CREATE TABLE IF NOT EXISTS contributors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            repo_id INTEGER,
            username TEXT,
            contributions INTEGER,
            avatar_url TEXT,
            FOREIGN KEY (repo_id) REFERENCES repositories (id)
          )`);
          
          testDb.run(`CREATE TABLE IF NOT EXISTS analytics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            repo_id INTEGER,
            health_score REAL,
            avg_commits_per_day REAL,
            commit_trend TEXT,
            insights TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (repo_id) REFERENCES repositories (id)
          )`, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      }
    });
  });
});

// Clean up after all tests
afterAll(async () => {
  // Close database connection
  database.close();
  
  // Note: Test database file cleanup is disabled to avoid lock issues
  // The file will be cleaned up manually if needed
});
