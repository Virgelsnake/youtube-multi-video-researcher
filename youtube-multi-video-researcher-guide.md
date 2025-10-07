# YouTube Multi-Video Researcher — Build Request & Guide

**Objective:**  
Build a small web app that, given a user topic, **finds the top 5 YouTube videos**, **fetches their transcripts** (using our existing transcript service), and **produces a consensus summary** of the main points that appear across multiple videos, so the user can learn quickly without watching everything.

> **Reference:** You already have the working transcript microservice (`transcript_server.py`) running on port **8082**. Treat it as an internal HTTP API and **do not modify it**. I’ll provide that code to you separately in a `youtube_transcript_downloader.md` file.

---

## 1) Scope & Deliverables

**In scope**
- A single-page web UI (SPA) with:
  - Topic input + criteria controls
  - Results list (top 5 videos with basic metadata)
  - Consensus summary and per-video highlights
  - Download of consolidated output (Markdown + CSV)
- A backend that:
  1. Crawls YouTube search results (Playwright MCP) for a given topic
  2. Scores and picks the **top 5** videos
  3. Calls our transcript service to fetch text
  4. Sends transcripts to OpenAI for per-video extraction and cross-video synthesis
  5. Returns a structured JSON payload to the UI

**Deliverables**
- Deployed web app + repo with `README`
- Playwright MCP crawler script(s)
- Backend service (API) with endpoints & tests
- Prompt templates for OpenAI (checked in)
- Example output fixtures for QA

---

## 2) User Journey (Happy Path)

1. **Search**  
   User enters a topic (e.g., “covered calls for beginners”), sets optional filters (language, duration, recency, exclude Shorts), and clicks **Research**.

2. **Discover & Rank**  
   Backend crawls YouTube results pages, collects candidates, applies scoring, and selects **top 5**.

3. **Transcripts**  
   For each selected video, backend calls our transcript endpoint to fetch text.

4. **Analyse**  
   Backend calls OpenAI:
   - **Per-video extraction**: key points (with timestamps/quotes)
   - **Cross-video synthesis**: clusters points, counts support across videos

5. **Present**  
   UI shows:
   - **Consensus Summary** with support (e.g., “Supported by 4/5 videos”)
   - Per-video highlights + links + metrics
   - Download: **Markdown report** and **CSV support matrix**

6. **Refine**  
   User tweaks criteria and re-runs.

---

## 3) Selection Criteria (Crawler-Friendly)

**Extract from Search Results page** (no APIs, DOM only):

- **Title**: `#video-title` (text/attr `title`)
- **Channel**: `ytd-channel-name a` (text)
- **Views**: `#metadata-line span` (contains “views”)
- **Age**: `#metadata-line span` (contains “ago”)
- **Duration**: `ytd-thumbnail-overlay-time-status-renderer span`
- **Shorts**: exclude `ytd-reel-video-renderer` or URLs with `/shorts/`
- **Live/Upcoming**: exclude items with badges indicating live/upcoming

**Optional refinement from Watch page** (for top ~30 before scoring):
- **Title** (confirm)
- **Views/Date** blocks near title
- **Likes** if visible
- **Description** (expand once if present; keep time-bounded)
- **Transcript availability** (probe with our transcript fetch; if fails, small penalty)

**Parsing helpers**
- Views: support “K/M” suffixes, e.g., `128K` → `128000`
- Duration: `H:MM:SS` / `MM:SS` to seconds
- Age → rough date bucket (now minus X)

---

## 4) Scoring Model (0–100)

```text
score =
  40 * Relevance(title+description)
+ 20 * Popularity(view_count_normalised)
+ 15 * Freshness(publish_date_bucket)
+ 15 * Fit(duration_range)
+ 10 * QualityProxy(likes_per_k_view if visible else 0)
- 20 * Penalties(Shorts/live/no_transcript/too short)
```

**Rules of thumb**
- **Relevance (0–1):** keyword phrase matches in title (1.0 if exact phrase, else partials add up; cap at 1.0). Description gives at most +0.3 towards the cap.
- **Popularity (0–1):** `log10(views+1)/6` (≈1.0 around 1M views).
- **Freshness (0–1):** 1.0 ≤12 months; 0.7 (1–3y); 0.4 (3–5y); 0.2 older.
- **Fit (0–1):** 1.0 inside user’s duration band; 0.5 within ±20%; 0 otherwise.
- **Penalties:** Shorts/live/upcoming = −1.0 (or hard-exclude). Transcript fetch fail = −0.3.

Select top 5 by score.

---

## 5) Data Flow & Architecture

```
UI (SPA)
  ⇅  /api/research (POST)
Backend (Node or Python)
  ├─ Playwright MCP → crawl search results (+ optional watch pages)
  ├─ Scoring & filter → pick top5
  ├─ Transcript service (existing Flask app) → /get-transcript
  ├─ OpenAI:
  │   ├─ Per-video key point extraction
  │   └─ Cross-video consensus (group & rank)
  └─ Response JSON → UI
```

**Existing service**
- Transcript endpoint: `POST http://localhost:8082/get-transcript`
  ```json
  { "url": "https://www.youtube.com/watch?v=XXXX" }
  ```
  Response (success):
  ```json
  {
    "success": true,
    "transcript": "plain text transcript ...",
    "video_id": "XXXX",
    "word_count": 1234
  }
  ```

---

## 6) Backend API (contract)

### `POST /api/research`
**Request**
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

**Response**
```json
{
  "query": "covered calls for beginners",
  "criteria": { ... },
  "candidates": [
    {
      "url": "https://www.youtube.com/watch?v=AAA",
      "title": "Covered Calls Explained",
      "channel": "Channel A",
      "views": 245000,
      "published_at_text": "1 year ago",
      "duration_sec": 780,
      "is_shorts": false,
      "like_count": 5300,
      "score": 82.4
    }
  ],
  "top5": [
    {
      "url": "https://www.youtube.com/watch?v=AAA",
      "title": "Covered Calls Explained",
      "channel": "Channel A",
      "views": 245000,
      "published_at_text": "1 year ago",
      "duration_sec": 780,
      "score": 82.4
    }
  ],
  "transcripts": [
    {
      "url": "https://www.youtube.com/watch?v=AAA",
      "video_id": "AAA",
      "word_count": 1234,
      "text": "..."
    }
  ],
  "analysis": {
    "consensus_points": [
      {
        "summary": "Define covered calls as ...",
        "support_count": 4,
        "supporting_videos": [
          {"url": "https://www.youtube.com/watch?v=AAA", "ts": ["00:03:42","00:06:15"]},
          {"url": "https://www.youtube.com/watch?v=BBB", "ts": ["00:02:10"]}
        ],
        "weight": 3.2
      }
    ],
    "per_video": [
      {
        "url": "https://www.youtube.com/watch?v=AAA",
        "highlights": [
          {"point": "Definition ...", "ts": "00:00:45"},
          {"point": "Risks ...", "ts": "00:08:12"}
        ]
      }
    ]
  }
}
```

---

## 7) Playwright (MCP) — Implementation Notes

**Queries**
- Use 1–3 variants:  
  `"{query}"`, `"{query} tutorial"`, `"{query} explained"`

**Selectors**
- Results: `ytd-video-renderer`
- Exclude: `ytd-reel-video-renderer` and any link with `/shorts/`
- Title: `#video-title`
- Channel: `ytd-channel-name a`
- Meta: `#metadata-line span` (expect two spans: views & age)
- Duration badge: `ytd-thumbnail-overlay-time-status-renderer span`

**Watch page (optional)**
- Title + views/date near `ytd-watch-metadata`
- Likes: `ytd-segmented-like-dislike-button-renderer`
- Description: `ytd-text-inline-expander` (click “more” once; limit content length)

**Throttling**
- Random small delays (200–600ms) between item scrapes
- Max pages (configurable) default 2

**Normalisers**
- `parseViews("128K") => 128000`
- `parseDuration("12:34") => 754s`
- `ageToBucket("2 years ago") => 0.7 freshness`

---

## 8) OpenAI — Prompts & Processing

**Per-video extraction prompt (system)**
```
You are an assistant extracting the 5–10 most important points from a single YouTube transcript.
Return JSON with:
- "highlights": [{ "point": "...", "evidence": "short quote", "timestamps": ["HH:MM:SS", ...] }]
- "terms": ["...", ...]  // key terms/definitions
Do not summarise generally; extract concrete, teachable statements.
```

**Cross-video synthesis prompt (system)**
```
You are comparing key points from multiple videos.
Input: arrays of highlights per video.
Task:
1) Group semantically equivalent points (normalise wording).
2) For each group, compute support_count = number of videos mentioning it.
3) Output top consensus points by support_count, then by summed weights (weights provided per video).
Return JSON:
{ "consensus": [
  {"summary": "...", "support_count": 4, "supporting_videos": [{"index": 0, "timestamps":["..."]}]}
]}
```

**Implementation tips**
- Use embeddings or simple normalisation (lowercase, remove stopwords) + fuzzy match for grouping. Start simple: hash on stemmed key phrase; if time allows, upgrade to embeddings.

---

## 9) Pseudocode (Backend)

```text
POST /api/research { query, criteria }
  candidates = crawlYouTube(query, criteria.pages_to_crawl, criteria.exclude_shorts)
  for each c in candidates:
    c.score = score(c, criteria)
  ranked = sorted(candidates by score desc)
  top5 = take first 5 that pass filters (duration, recency, etc.)

  transcripts = []
  for v in top5:
    t = fetchTranscript(v.url)  // POST to http://localhost:8082/get-transcript
    if !t.success and criteria.require_transcript: continue/replace
    transcripts.append({ url: v.url, video_id: t.video_id, word_count: t.word_count, text: t.transcript })

  perVideo = []
  for t in transcripts:
    perVideo.append(openai_extract_points(t.text))

  consensus = openai_cross_video(perVideo, top5.scores)

  return { query, criteria, candidates, top5, transcripts, analysis: { consensus_points: consensus, per_video: perVideo } }
```

---

## 10) Front-End (UI) Outline

- **Inputs**: topic, duration min/max, recency (years), exclude Shorts (toggle), language (“en”)
- **States**: loading (crawl), analysing, results
- **Outputs**:
  - **Consensus Summary**: list with “Supported by x/5” chips and source badges
  - **Video Cards**: title, channel, views, date, duration, score, link, highlights with timestamps
  - **Downloads**:
    - Markdown report (topic, criteria, consensus points, per-video highlights, links)
    - CSV matrix (`points × videos` with 1/0 support)

---

## 11) Configuration

Environment variables:
- `PORT` (backend): default `3000`
- `TRANSCRIPT_API_URL`: `http://localhost:8082/get-transcript`
- `OPENAI_API_KEY`
- `CRAWL_PAGES_DEFAULT`: e.g., `2`

Feature flags (JSON or `.env`):
- `REQUIRE_TRANSCRIPT=true`
- `EXCLUDE_SHORTS=true`

---

## 12) Error Handling & Edge Cases

- **Transcript fetch fails**: mark video as “No transcript”; if required, replace with next ranked candidate.
- **Rate limiting / page layout change**: back off, reduce pages crawled; log selector misses.
- **Empty consensus**: return per-video highlights with a message (“No strong overlap found”).
- **Age-gated/region-locked**: skip and replace.

---

## 13) Testing & Acceptance

**Unit**
- Parsers: views, duration, age buckets
- Scoring: deterministic outputs for fixtures
- Transcript fetch: mock transcript endpoint

**Integration**
- Crawl 1 page with recorded HTML fixtures
- Full pipeline with 5 short transcripts → stable consensus set

**Acceptance criteria**
- Enter topic → returns 5 cards + consensus list within a single run
- Each consensus point shows support count and links back to source videos/timestamps
- Downloads (MD + CSV) are generated and accurate

---

## 14) Security & Compliance

- No YouTube private APIs or auth; DOM scrape only
- Respect robots.txt semantics for browser automation (human-like pacing)
- Do not store transcripts longer than needed unless user downloads/saves project
- Keep API keys server-side only

---

## 15) Tech Choices (recommended)

- **Backend:** Node.js (Express or Fastify) **or** Python (FastAPI) — your call; keep code small
- **Crawler:** Playwright with MCP server entrypoint
- **Front-end:** React/Vite (simple SPA)
- **AI:** OpenAI Responses/Chat + optional Embeddings for grouping
- **Storage:** In-memory first; optional JSON file per run; no DB required initially

---

## 16) Ready-to-Use JSON Schemas (lightweight)

**Candidate (scraped)**
```json
{
  "url": "string",
  "title": "string",
  "channel": "string",
  "views": 0,
  "published_at_text": "string",
  "duration_sec": 0,
  "is_shorts": false,
  "like_count": 0,
  "score": 0
}
```

**Transcript record**
```json
{
  "url": "string",
  "video_id": "string",
  "word_count": 0,
  "text": "string"
}
```

**Consensus point**
```json
{
  "summary": "string",
  "support_count": 0,
  "supporting_videos": [
    {"url": "string", "ts": ["HH:MM:SS"]}
  ],
  "weight": 0
}
```

---

## 17) Implementation Order (single-shot build)

1. **Backend shell**: `POST /api/research` with stubbed data.
2. **Playwright crawl**: scrape 1 page; return candidates.
3. **Scoring**: implement functions; pick top 5.
4. **Transcript calls**: integrate our Flask endpoint; handle failure/replace.
5. **OpenAI**: per-video extraction → cross-video synthesis; wire prompts.
6. **UI**: form + results + downloads.
7. **Polish**: error states, loading, simple logs.
8. **QA**: run on 2–3 topics; verify consensus & citations.

---

### Notes
- Keep it **simple and deterministic**. Default to **2 pages** of results, **top 5** only.
- All constants (weights, penalties, duration bands) in one config block for easy tuning.
- I will supply the current transcript microservice code separately; just consume it via `TRANSCRIPT_API_URL`.
