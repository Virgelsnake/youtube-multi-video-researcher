# YouTube Multi-Video Researcher

A powerful web application that finds the top YouTube videos on any topic, fetches their transcripts, and uses AI to generate consensus insights across multiple sources.

## Features

- 🔍 **Smart YouTube Search**: Crawls YouTube search results with configurable criteria
- 📊 **Intelligent Scoring**: Ranks videos based on relevance, popularity, freshness, and quality
- 📝 **Automatic Transcripts**: Fetches transcripts from selected videos
- 🤖 **AI Analysis**: Uses OpenAI to extract key points and synthesize consensus insights
- 📥 **Export Options**: Download results as Markdown reports or CSV matrices
- 🎨 **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## Architecture

```
┌─────────────────┐
│   React SPA     │  (Frontend - Vite + React + Tailwind)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Express API    │  (Backend - Node.js)
└────────┬────────┘
         │
         ├──► Playwright MCP (YouTube Crawling)
         ├──► Transcript Service (Flask - Port 8082)
         └──► OpenAI API (Analysis & Synthesis)
```

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+ and pip
- **OpenAI API Key**
- **yt-dlp** (for transcript fetching)

## Installation

### 1. Clone and Install Dependencies

```bash
# Install Node.js dependencies
npm install

# Install Python dependencies for transcript service
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
TRANSCRIPT_API_URL=http://localhost:8082/get-transcript
CRAWL_PAGES_DEFAULT=2
REQUIRE_TRANSCRIPT=true
EXCLUDE_SHORTS=true
```

## Running the Application

### Option 1: Run All Services Together

```bash
# Terminal 1: Start transcript service
python transcript_server.py

# Terminal 2: Start backend and frontend
npm run dev
```

### Option 2: Run Services Separately

```bash
# Terminal 1: Transcript service
python transcript_server.py

# Terminal 2: Backend API
npm run server

# Terminal 3: Frontend dev server
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Transcript Service**: http://localhost:8082

## Usage

1. **Enter a Topic**: Type your research topic (e.g., "covered calls for beginners")
2. **Configure Options** (optional): Set duration range, recency, and other filters
3. **Start Research**: Click "Start Research" and wait for results
4. **Review Insights**: See consensus points and per-video highlights
5. **Download**: Export results as Markdown or CSV

## Project Structure

```
youtube_researcher/
├── backend/
│   ├── server.js                 # Express server
│   ├── services/
│   │   ├── researchService.js    # Main orchestration
│   │   ├── crawlerService.js     # YouTube crawling
│   │   ├── scoringService.js     # Video scoring algorithm
│   │   ├── transcriptService.js  # Transcript fetching
│   │   ├── analysisService.js    # OpenAI integration
│   │   └── playwrightCrawler.js  # Playwright MCP integration
│   └── utils/
│       └── parsers.js            # Data parsing utilities
├── src/
│   ├── components/
│   │   ├── SearchForm.jsx        # Search input form
│   │   ├── ResultsView.jsx       # Results container
│   │   ├── ConsensusSection.jsx  # Consensus insights
│   │   └── VideoCard.jsx         # Video display card
│   ├── services/
│   │   └── api.js                # API client
│   ├── utils/
│   │   └── downloads.js          # Export utilities
│   ├── App.jsx                   # Main app component
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── transcript_server.py          # Flask transcript service
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## API Endpoints

### `POST /api/research`

Main research endpoint that orchestrates the entire workflow.

**Request:**
```json
{
  "query": "covered calls for beginners",
  "criteria": {
    "language": "en",
    "min_duration_sec": 360,
    "max_duration_sec": 2400,
    "recency_years": 3,
    "exclude_shorts": true,
    "require_transcript": true,
    "pages_to_crawl": 2
  }
}
```

**Response:**
```json
{
  "query": "covered calls for beginners",
  "criteria": { ... },
  "candidates": [ ... ],
  "top5": [ ... ],
  "transcripts": [ ... ],
  "analysis": {
    "consensus_points": [ ... ],
    "per_video": [ ... ]
  }
}
```

### `GET /api/health`

Health check endpoint.

## Scoring Algorithm

Videos are scored on a 0-100 scale based on:

- **Relevance (40%)**: Keyword matches in title and description
- **Popularity (20%)**: View count (logarithmic scale)
- **Freshness (15%)**: Publication date
- **Duration Fit (15%)**: Match with user's duration preferences
- **Quality (10%)**: Likes-to-views ratio

**Penalties** are applied for:
- YouTube Shorts (-20)
- Live/Upcoming videos (-20)
- Missing transcripts (-20)
- Very short videos (-10)

## Playwright MCP Integration

The application is designed to integrate with the Playwright MCP server for YouTube crawling. The integration points are in:

- `backend/services/playwrightCrawler.js` - MCP integration logic
- `backend/services/crawlerService.js` - Crawler service

To enable Playwright crawling, you'll need to:
1. Ensure the Playwright MCP server is running
2. Update the crawler service to use the MCP client
3. Implement the actual navigation and HTML extraction

## Netlify Deployment

### Build Configuration

The project is configured for Netlify deployment:

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Deploy Steps

1. **Connect to Netlify**:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login
   netlify login
   
   # Initialize
   netlify init
   ```

2. **Set Environment Variables** in Netlify dashboard:
   - `OPENAI_API_KEY`
   - `TRANSCRIPT_API_URL` (if using external service)

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

**Note**: The transcript service (Python) will need to be deployed separately or converted to a serverless function.

## Development

### Adding New Features

1. **Backend**: Add new services in `backend/services/`
2. **Frontend**: Add new components in `src/components/`
3. **Utilities**: Add helpers in `backend/utils/` or `src/utils/`

### Testing

```bash
# Run tests (when implemented)
npm test
```

### Code Style

- **Backend**: ES6 modules, async/await
- **Frontend**: React hooks, functional components
- **Styling**: Tailwind CSS utility classes

## Troubleshooting

### Transcript Service Issues

If transcripts fail to fetch:
1. Ensure `yt-dlp` is installed: `pip install yt-dlp`
2. Check the transcript service is running on port 8082
3. Verify the video has captions/subtitles available

### OpenAI API Errors

If AI analysis fails:
1. Verify your OpenAI API key is correct
2. Check you have sufficient API credits
3. Ensure you're using a compatible model (gpt-4o-mini)

### Playwright Crawling

The Playwright integration is currently a placeholder. To implement:
1. Set up the Playwright MCP server
2. Update `crawlerService.js` to use the MCP client
3. Test with actual YouTube search pages

## Future Enhancements

- [ ] Implement full Playwright MCP integration
- [ ] Add video thumbnail previews
- [ ] Support for multiple languages
- [ ] Caching of results
- [ ] User authentication and saved searches
- [ ] Advanced filtering options
- [ ] Video comparison mode
- [ ] Export to PDF

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please open an issue on GitHub.
