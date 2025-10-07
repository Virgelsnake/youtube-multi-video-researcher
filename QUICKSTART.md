# Quick Start Guide

## Current Status

✅ **All services are running!**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Transcript Service**: http://localhost:8082

## What's Working

1. ✅ Project structure created
2. ✅ Backend API with Express
3. ✅ React frontend with Tailwind CSS
4. ✅ Transcript service (Flask + yt-dlp)
5. ✅ Scoring algorithm implemented
6. ✅ OpenAI integration ready (needs API key)
7. ✅ Netlify deployment configured

## Next Steps

### 1. Add OpenAI API Key

To enable AI analysis, add your OpenAI API key to `.env`:

```bash
# Edit .env file
OPENAI_API_KEY=sk-your-actual-api-key-here
```

Then restart the backend server:

```bash
# Stop the current backend (Ctrl+C in terminal)
# Restart it
npm run server
```

### 2. ✅ Playwright Integration Complete!

**Real YouTube crawling is now enabled!**

The app now uses Playwright to:
- Navigate to YouTube search pages
- Extract real video metadata (title, channel, views, duration)
- Filter out YouTube Shorts
- Apply duration and recency filters
- Return actual search results

**Test it:**
```bash
node test-playwright-integration.js
```

**Fallback:** If Playwright fails, the app automatically falls back to mock data.

### 3. Test the Application

1. Open http://localhost:5173 in your browser
2. Enter a topic (e.g., "covered calls for beginners")
3. Click "Start Research"
4. View results with **real YouTube data**!

### 4. Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Set environment variables in Netlify dashboard:
# - OPENAI_API_KEY
# - TRANSCRIPT_API_URL (if using external service)

# Deploy
netlify deploy --prod
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│              (Vite + React + Tailwind)                   │
│                  Port: 5173                              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│                  Express Backend                         │
│              (Node.js + OpenAI)                          │
│                  Port: 3000                              │
└──────┬──────────────┬──────────────┬───────────────────┘
       │              │              │
       ▼              ▼              ▼
┌──────────┐  ┌──────────────┐  ┌──────────┐
│Playwright│  │  Transcript  │  │  OpenAI  │
│   MCP    │  │   Service    │  │   API    │
│          │  │  (Flask)     │  │          │
│          │  │  Port: 8082  │  │          │
└──────────┘  └──────────────┘  └──────────┘
```

## Key Features Implemented

### Backend Services

- ✅ **Research Service**: Orchestrates the entire workflow
- ✅ **Crawler Service**: YouTube search crawling (mock data ready)
- ✅ **Scoring Service**: Ranks videos by relevance, popularity, freshness
- ✅ **Transcript Service**: Fetches video transcripts via yt-dlp
- ✅ **Analysis Service**: OpenAI integration for consensus extraction

### Frontend Components

- ✅ **SearchForm**: Topic input with advanced criteria
- ✅ **ResultsView**: Display research results
- ✅ **ConsensusSection**: Show consensus insights
- ✅ **VideoCard**: Individual video display with highlights
- ✅ **Download Utilities**: Export to Markdown and CSV

### Scoring Algorithm

Videos scored 0-100 based on:
- **Relevance (40%)**: Keyword matches
- **Popularity (20%)**: View count
- **Freshness (15%)**: Publication date
- **Duration Fit (15%)**: User preferences
- **Quality (10%)**: Engagement metrics

## Testing Without OpenAI

The app will work without an OpenAI API key, but AI analysis will be skipped. You'll still see:
- Video discovery and ranking
- Transcript fetching
- Basic metadata and scoring

## Troubleshooting

### Port Already in Use

If you see "port already in use" errors:

```bash
# Find and kill the process
lsof -i :3000  # or :5173 or :8082
kill -9 <PID>
```

### Transcript Service Issues

```bash
# Ensure yt-dlp is installed
pip3 install yt-dlp

# Test the transcript service
curl -X POST http://localhost:8082/get-transcript \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}'
```

### OpenAI API Errors

- Verify API key is correct
- Check you have credits available
- Ensure model access (gpt-4o-mini)

## Development Commands

```bash
# Install dependencies
npm install
pip3 install -r requirements.txt

# Run all services (separate terminals)
python3 transcript_server.py  # Terminal 1
npm run server                # Terminal 2
npm run client                # Terminal 3

# Or use concurrently (after transcript service is running)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## File Structure

```
youtube_researcher/
├── backend/
│   ├── server.js              # Express server
│   ├── services/              # Business logic
│   └── utils/                 # Utilities
├── src/
│   ├── components/            # React components
│   ├── services/              # API client
│   └── utils/                 # Frontend utilities
├── netlify/
│   └── functions/             # Serverless functions
├── transcript_server.py       # Flask transcript service
├── package.json
├── vite.config.js
└── README.md
```

## What's Next?

1. **Add your OpenAI API key** to enable AI analysis
2. **Integrate Playwright MCP** for real YouTube crawling
3. **Test with real queries** and verify results
4. **Deploy to Netlify** for production use
5. **Add more features** (see README.md for ideas)

## Support

- Check `README.md` for detailed documentation
- Review code comments for implementation details
- Test with mock data first before integrating external services

---

**Status**: All core functionality implemented and ready for integration! 🚀
