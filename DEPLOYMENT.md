# Deployment Guide

## Netlify Deployment

This guide covers deploying the YouTube Multi-Video Researcher to Netlify.

### Prerequisites

- Netlify account (free tier works)
- GitHub repository (optional but recommended)
- OpenAI API key
- Transcript service hosted separately (see below)

### Step 1: Prepare for Deployment

1. **Build the project locally to verify**:

```bash
npm run build
```

This creates a `dist/` folder with the production build.

2. **Test the production build**:

```bash
npm run preview
```

### Step 2: Deploy to Netlify

#### Option A: Deploy via Netlify CLI

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize the site
netlify init

# Follow the prompts:
# - Create & configure a new site
# - Choose your team
# - Site name: youtube-researcher (or your choice)
# - Build command: npm run build
# - Publish directory: dist

# Deploy to production
netlify deploy --prod
```

#### Option B: Deploy via GitHub

1. Push your code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/youtube-researcher.git
git push -u origin main
```

2. Go to [Netlify Dashboard](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Choose GitHub and select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

### Step 3: Configure Environment Variables

In the Netlify dashboard, go to **Site settings** → **Environment variables** and add:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
TRANSCRIPT_API_URL=https://your-transcript-service.com/get-transcript
```

**Important**: The transcript service (Python Flask app) needs to be deployed separately since Netlify primarily supports Node.js functions.

### Step 4: Deploy Transcript Service

The transcript service needs to be hosted separately. Options:

#### Option A: Deploy to Render.com

1. Create account at [Render.com](https://render.com)
2. Create new **Web Service**
3. Connect your repository
4. Configure:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python transcript_server.py`
   - **Port**: 8082 (or use environment variable)

5. Add environment variable:
   ```
   PORT=8082
   ```

6. Copy the service URL (e.g., `https://your-service.onrender.com`)
7. Update `TRANSCRIPT_API_URL` in Netlify to point to this URL

#### Option B: Deploy to Railway.app

1. Create account at [Railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Railway auto-detects Python and Flask
4. Set environment variables if needed
5. Copy the public URL
6. Update `TRANSCRIPT_API_URL` in Netlify

#### Option C: Deploy to Heroku

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create your-transcript-service

# Add Python buildpack
heroku buildpacks:set heroku/python

# Deploy
git push heroku main

# Get URL
heroku open
```

### Step 5: Update API Configuration

After deploying the transcript service, update your Netlify environment variables:

```
TRANSCRIPT_API_URL=https://your-transcript-service.onrender.com/get-transcript
```

Redeploy Netlify if needed:

```bash
netlify deploy --prod
```

### Step 6: Configure Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Add custom domain
3. Update DNS records as instructed
4. Enable HTTPS (automatic with Netlify)

### Step 7: Test Production Deployment

1. Visit your Netlify URL (e.g., `https://youtube-researcher.netlify.app`)
2. Try a search query
3. Verify all services are connected:
   - Frontend loads ✓
   - Backend API responds ✓
   - Transcript service accessible ✓
   - OpenAI analysis works ✓

## Netlify Functions

The backend API is deployed as Netlify Functions. The functions are in `netlify/functions/`:

- `research.js` - Main research endpoint
- `health.js` - Health check endpoint

These are automatically deployed and available at:
- `https://your-site.netlify.app/.netlify/functions/research`
- `https://your-site.netlify.app/.netlify/functions/health`

The frontend is configured to proxy `/api/*` to `/.netlify/functions/*`.

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `OPENAI_API_KEY` | OpenAI API key for analysis | Yes | `sk-...` |
| `TRANSCRIPT_API_URL` | Transcript service endpoint | Yes | `https://...` |
| `CRAWL_PAGES_DEFAULT` | Default pages to crawl | No | `2` |
| `REQUIRE_TRANSCRIPT` | Require transcript for videos | No | `true` |
| `EXCLUDE_SHORTS` | Exclude YouTube Shorts | No | `true` |

## Monitoring and Logs

### Netlify Logs

View function logs in Netlify dashboard:
1. Go to **Functions** tab
2. Click on a function
3. View **Function log**

### Transcript Service Logs

Depends on hosting provider:
- **Render**: View logs in dashboard
- **Railway**: View logs in project dashboard
- **Heroku**: `heroku logs --tail`

## Performance Optimization

### 1. Enable Caching

Add to `netlify.toml`:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### 2. Function Timeout

Increase timeout for research function in `netlify.toml`:

```toml
[functions]
  directory = "netlify/functions"
  
[functions.research]
  timeout = 300
```

### 3. Optimize Build

```toml
[build]
  command = "npm run build"
  publish = "dist"
  
[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--legacy-peer-deps"
```

## Troubleshooting

### Function Timeout

If research takes too long:
- Reduce `pages_to_crawl` default
- Implement caching for results
- Use background functions (Netlify Pro)

### CORS Issues

Ensure transcript service allows CORS:

```python
from flask_cors import CORS
CORS(app)
```

### Build Failures

Check:
- Node version compatibility
- All dependencies in `package.json`
- Build command is correct
- Environment variables are set

### API Key Issues

- Verify OpenAI API key is correct
- Check key has sufficient credits
- Ensure key is set in Netlify environment variables

## Cost Considerations

### Netlify (Free Tier)

- 100GB bandwidth/month
- 300 build minutes/month
- 125k function invocations/month
- 100 hours function runtime/month

### Transcript Service

- **Render**: Free tier available (spins down after inactivity)
- **Railway**: $5/month credit on free tier
- **Heroku**: Free tier discontinued, starts at $7/month

### OpenAI API

- GPT-4o-mini: ~$0.15 per 1M input tokens
- Typical research: ~5 videos × 3000 tokens = ~$0.002 per query

## Scaling Considerations

For high traffic:

1. **Upgrade Netlify Plan**: Pro plan for better limits
2. **Cache Results**: Store popular queries
3. **Rate Limiting**: Implement on backend
4. **CDN**: Already included with Netlify
5. **Database**: Add for persistent storage

## Security Best Practices

1. ✅ API keys in environment variables (not in code)
2. ✅ HTTPS enabled by default
3. ✅ CORS configured properly
4. ✅ No sensitive data in client-side code
5. ⚠️ Add rate limiting for production
6. ⚠️ Add authentication if needed

## Continuous Deployment

With GitHub integration:
- Push to `main` → Auto-deploy to production
- Push to other branches → Deploy previews
- Pull requests → Deploy previews with unique URLs

## Rollback

If deployment fails:

```bash
# Via CLI
netlify rollback

# Or in dashboard
# Go to Deploys → Click on previous deploy → Publish deploy
```

## Next Steps

1. ✅ Deploy to Netlify
2. ✅ Deploy transcript service
3. ✅ Configure environment variables
4. ✅ Test production deployment
5. 🔄 Set up monitoring
6. 🔄 Add custom domain
7. 🔄 Implement analytics
8. 🔄 Add error tracking (Sentry)

---

**Need Help?**
- Netlify Docs: https://docs.netlify.com
- Netlify Support: https://answers.netlify.com
- Project README: See README.md for more details
