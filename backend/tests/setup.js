// Test setup file for Jest
const { initDatabase } = require('../config/database');

// Initialize test database before all tests
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  
  // Initialize in-memory database for testing
  await initDatabase();
});

// Clean up after all tests
afterAll(async () => {
  // Clean up test database
  // Note: For SQLite, you might want to close the connection
});
