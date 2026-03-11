# Engineering Insights Dashboard

A full-stack web application that analyzes GitHub repositories and displays engineering metrics in a clean, interactive dashboard.

This dashboard can be used by engineering managers to monitor repository activity, contributor engagement, and development velocity.

## Tech Stack

### Frontend
- **React** (Vite setup)
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Axios** for API requests

### Backend
- **Node.js**
- **Express.js**
- **Axios** for GitHub API calls
- **CORS** for cross-origin requests

## Features

- 📊 **Repository Metrics**: Stars, open issues, pull requests, and contributor count
- 👥 **Top Contributors**: Display top 5 contributors with avatars and contribution counts
- 📈 **Commit Activity**: 7-day commit activity chart with daily breakdown
- 🔍 **URL Parsing**: Automatically extract owner and repo from GitHub URLs
- ⚡ **Real-time Data**: Fetch live data from GitHub API
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🎨 **Modern UI**: Clean, professional interface with smooth interactions

## Project Structure

```
engineering-insights-dashboard/
├── backend/
│   ├── server.js                 # Express server setup
│   ├── package.json              # Backend dependencies
│   ├── routes/
│   │   └── repo.js              # API routes
│   └── controllers/
│       └── repoController.js    # GitHub API integration
└── frontend/
    ├── package.json             # Frontend dependencies
    ├── vite.config.js           # Vite configuration
    ├── tailwind.config.js       # Tailwind configuration
    ├── index.html               # HTML template
    ├── src/
    │   ├── main.jsx             # React entry point
    │   ├── App.jsx              # Main application component
    │   ├── api.js               # API integration
    │   ├── index.css            # Global styles
    │   └── components/
    │       ├── RepoInput.jsx    # Repository URL input
    │       ├── MetricsCards.jsx # Metrics display cards
    │       ├── ContributorsList.jsx # Contributors list
    │       └── CommitsChart.jsx # Commit activity chart
    └── public/
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd engineering-insights-dashboard/backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd engineering-insights-dashboard/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage

1. **Start both servers** (backend on port 3001, frontend on port 3000)
2. **Open your browser** and navigate to `http://localhost:3000`
3. **Enter a GitHub repository URL** (e.g., `https://github.com/facebook/react`)
4. **Click "Analyze Repository"** to view the engineering metrics
5. **Explore the dashboard** with metrics cards, contributor lists, and commit charts

## API Endpoints

### Backend API

- `GET /api/repo/:owner/:repo` - Fetch repository metrics
- `GET /health` - Health check endpoint

### Response Format

```json
{
  "repoName": "facebook/react",
  "stars": 218000,
  "openIssues": 1200,
  "pullRequests": 450,
  "contributorsCount": 1500,
  "topContributors": [
    {
      "username": "gaearon",
      "avatar": "https://avatars.githubusercontent.com/u/810438?v=4",
      "contributions": 1200
    }
  ],
  "commitsLast7Days": [
    {
      "date": "2023-12-04",
      "commits": 15
    }
  ]
}
```

## Development

### Running in Development Mode

For development with hot reload:

**Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

**Frontend:**
```bash
cd frontend
npm run dev  # Uses Vite dev server
```

### Environment Variables

The application uses GitHub's public API. For higher rate limits, you can add a GitHub token:

Create a `.env` file in the backend directory:
```
GITHUB_TOKEN=your_github_token_here
```

Then modify the backend to use this token when making API calls.

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend is running and CORS is properly configured
2. **GitHub API Rate Limits**: The public API has rate limits. Add a GitHub token for higher limits
3. **Port Conflicts**: Make sure ports 3000 and 3001 are available
4. **Network Issues**: Check your internet connection for GitHub API access

### Error Messages

- **"Repository not found"**: Check if the repository URL is correct and the repository is public
- **"API rate limit exceeded"**: Wait a few minutes or add a GitHub token
- **"Network error"**: Check your internet connection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## 🚀 Deployment

### Option 1: Vercel (Frontend) + Railway (Backend) - Recommended

#### Backend Deployment (Railway)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub account
   - Click "New Project" → "Deploy from GitHub repo"
   - Select the repository
   - Railway will automatically detect it's a Node.js project
   - Set environment variables:
     ```
     NODE_ENV=production
     CORS_ORIGINS=https://your-frontend-domain.vercel.app
     ```
   - Deploy and copy the backend URL

#### Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

3. **Set Environment Variables**
   - In Vercel dashboard, go to your project
   - Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.railway.app`

4. **Redeploy**
   ```bash
   vercel --prod
   ```

### Option 2: Netlify (Frontend) + Render (Backend)

#### Backend Deployment (Render)

1. **Create `render.yaml`** (already included)
2. **Push to GitHub**
3. **Go to [render.com](https://render.com)**
4. **New** → **Web Service** → **Build and deploy from Git**
5. **Connect GitHub** and select repository
6. **Render will detect Node.js automatically**
7. **Set environment variables**:
   ```
   NODE_ENV=production
   CORS_ORIGINS=https://your-frontend-domain.netlify.app
   ```
8. **Deploy** and copy the backend URL

#### Frontend Deployment (Netlify)

1. **Install Netlify CLI**
   ```bash
   npm i -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   cd frontend
   netlify deploy --prod --dir=dist
   ```

3. **Set Environment Variables**
   - In Netlify dashboard: Site settings → Build & deploy → Environment
   - Add: `VITE_API_URL` = `https://your-backend-url.onrender.com`

### Option 3: Docker Deployment

1. **Build Docker images**
   ```bash
   # Backend
   cd backend
   docker build -t engineering-insights-api .
   
   # Frontend
   cd ../frontend
   docker build -t engineering-insights-frontend .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Environment Variables

#### Backend (.env)
```bash
NODE_ENV=production
PORT=3001
CORS_ORIGINS=https://your-frontend-domain.vercel.app,https://your-frontend-domain.netlify.app
GITHUB_TOKEN=your_github_token_here  # Optional for higher rate limits
```

#### Frontend (.env)
```bash
VITE_API_URL=https://your-backend-domain.railway.app
```

### Production Checklist

- [ ] Update CORS origins in backend
- [ ] Set production API URL in frontend
- [ ] Add GitHub token for higher API limits
- [ ] Test both frontend and backend URLs
- [ ] Verify health endpoint: `https://your-backend-url/health`
- [ ] Test API endpoint: `https://your-backend-url/api/repo/facebook/react`

## Future Enhancements

- [ ] GitHub authentication for private repositories
- [ ] Historical data analysis
- [ ] Comparison between multiple repositories
- [ ] Export metrics to CSV/PDF
- [ ] Dark mode support
- [ ] More detailed commit analysis
- [ ] Issue and PR trends over time
