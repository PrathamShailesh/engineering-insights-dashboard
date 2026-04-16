const express = require('express');
const cors = require('cors');
const repoRoutes = require('./routes/repo');
const enhancedRoutes = require('./routes/enhancedRoutes');
const database = require('./config/database');

const app = express();
const PORT = process.env.NODE_ENV === 'test' ? 3002 : (process.env.PORT || 3001);

// CORS configuration
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://your-frontend-domain.vercel.app',
      'https://your-frontend-domain.netlify.app',
      'http://localhost:3000'
    ]
  : ['http://localhost:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', repoRoutes);
app.use('/api', enhancedRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Engineering Insights Backend is running',
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
async function startServer() {
  try {
    await database.init();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Engineering Insights Backend running on port ${PORT}`);
      console.log('Enhanced features enabled: Database storage, AI insights, Repository comparison');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  database.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  database.close();
  process.exit(0);
});

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Export app for testing
module.exports = app;
