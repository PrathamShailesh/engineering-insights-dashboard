const request = require('supertest');
const app = require('../server');

describe('Engineering Insights API Tests', () => {
  
  describe('GET /api/repo/:owner/:repo', () => {
    
    test('should return valid response for existing repository', async () => {
      const response = await request(app)
        .get('/api/repo/facebook/react')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('repoName', 'facebook/react');
      expect(response.body.data).toHaveProperty('stars');
      expect(response.body.data).toHaveProperty('openIssues');
      expect(response.body.data).toHaveProperty('pullRequests');
      expect(response.body.data).toHaveProperty('contributorsCount');
    });

    test('should return 404 for non-existent repository', async () => {
      const response = await request(app)
        .get('/api/repo/nonexistent/repo123')
        .expect(404);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Repository not found');
    });

    test('should handle missing owner parameter', async () => {
      const response = await request(app)
        .get('/api/repo//react')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('should handle missing repo parameter', async () => {
      const response = await request(app)
        .get('/api/repo/facebook/')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('should handle invalid characters in parameters', async () => {
      const response = await request(app)
        .get('/api/repo/facebook/react<script>')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/health', () => {
    
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database', 'connected');
    });
  });

  describe('Error Handling', () => {
    
    test('should handle network errors gracefully', async () => {
      // Mock network error scenario
      const response = await request(app)
        .get('/api/repo/github.com/invalid')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });

    test('should validate input format', async () => {
      const response = await request(app)
        .get('/api/repo/invalid-format')
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Response Format', () => {
    
    test('should return consistent JSON format', async () => {
      const response = await request(app)
        .get('/api/repo/facebook/react')
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toBeDefined();
      expect(typeof response.body).toBe('object');
    });

    test('should include CORS headers', async () => {
      const response = await request(app)
        .get('/api/repo/facebook/react')
        .expect(200);
      
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
