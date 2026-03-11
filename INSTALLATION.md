# Quick Installation Guide

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn

## Step 1: Backend Setup

```bash
# Navigate to backend directory
cd engineering-insights-dashboard/backend

# Install dependencies
npm install

# Start the backend server
npm start
```

The backend will run on `http://localhost:3001`

## Step 2: Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd engineering-insights-dashboard/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Step 3: Access the Application

Open your browser and navigate to `http://localhost:3000`

## Test with Sample Repository

Try analyzing this repository:
- URL: `https://github.com/facebook/react`
- Or any other public GitHub repository

## Expected Features

✅ Repository URL input with validation
✅ Metrics cards (Stars, Issues, PRs, Contributors)
✅ Top 5 contributors list with avatars
✅ 7-day commit activity chart
✅ Responsive design
✅ Error handling
✅ Loading states

## Troubleshooting

### Backend Issues
- **Port 3001 in use**: Change port in `backend/server.js`
- **GitHub API errors**: Check internet connection and repository URL

### Frontend Issues
- **Port 3000 in use**: Change port in `frontend/vite.config.js`
- **CORS errors**: Ensure backend is running on port 3001

### Common Commands

```bash
# Backend development with auto-restart
cd backend && npm run dev

# Frontend development
cd frontend && npm run dev

# Build for production
cd frontend && npm run build
```

## Project Structure Summary

```
engineering-insights-dashboard/
├── backend/                 # Node.js/Express API
│   ├── server.js           # Main server file
│   ├── routes/repo.js      # API routes
│   └── controllers/repoController.js # GitHub API logic
└── frontend/               # React/Vite app
    ├── src/
    │   ├── components/     # React components
    │   ├── App.jsx         # Main app
    │   └── api.js          # API integration
    └── public/             # Static files
```

## Next Steps

1. Test with different repositories
2. Explore the metrics dashboard
3. Check the responsive design on mobile
4. Review the code structure
