import { ageToBucket } from '../utils/parsers.js';

// Scoring weights (0-100 scale)
const WEIGHTS = {
  RELEVANCE: 40,
  POPULARITY: 20,
  FRESHNESS: 15,
  FIT: 15,
  QUALITY: 10
};

const PENALTIES = {
  SHORTS: -20,
  LIVE: -20,
  NO_TRANSCRIPT: -20,
  TOO_SHORT: -10
};

export function scoreVideos(candidates, query, criteria) {
  return candidates.map(video => {
    const score = calculateScore(video, query, criteria);
    return { ...video, score };
  });
}

function calculateScore(video, query, criteria) {
  let score = 0;

  // 1. Relevance (0-40 points)
  const relevance = calculateRelevance(video.title, video.description || '', query);
  score += relevance * WEIGHTS.RELEVANCE;

  // 2. Popularity (0-20 points)
  const popularity = calculatePopularity(video.views);
  score += popularity * WEIGHTS.POPULARITY;

  // 3. Freshness (0-15 points)
  const freshness = calculateFreshness(video.published_at_text, criteria.recency_years);
  score += freshness * WEIGHTS.FRESHNESS;

  // 4. Duration Fit (0-15 points)
  const fit = calculateDurationFit(video.duration_sec, criteria.min_duration_sec, criteria.max_duration_sec);
  score += fit * WEIGHTS.FIT;

  // 5. Quality Proxy (0-10 points)
  const quality = calculateQuality(video.like_count, video.views);
  score += quality * WEIGHTS.QUALITY;

  // Apply penalties
  if (video.is_shorts) {
    score += PENALTIES.SHORTS;
  }

  if (video.is_live || video.is_upcoming) {
    score += PENALTIES.LIVE;
  }

  if (video.duration_sec < 60) {
    score += PENALTIES.TOO_SHORT;
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

function calculateRelevance(title, description, query) {
  const queryLower = query.toLowerCase();
  const titleLower = (title || '').toLowerCase();
  const descLower = (description || '').toLowerCase();

  let relevance = 0;

  // Exact phrase match in title = 1.0
  if (titleLower.includes(queryLower)) {
    relevance = 1.0;
  } else {
    // Partial word matches
    const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
    const titleWords = titleLower.split(/\s+/);
    
    let matchCount = 0;
    for (const qWord of queryWords) {
      if (titleWords.some(tWord => tWord.includes(qWord) || qWord.includes(tWord))) {
        matchCount++;
      }
    }
    
    relevance = queryWords.length > 0 ? matchCount / queryWords.length : 0;
  }

  // Description adds up to +0.3
  if (descLower.includes(queryLower)) {
    relevance = Math.min(1.0, relevance + 0.3);
  }

  return relevance;
}

function calculatePopularity(views) {
  // log10(views+1)/6 ≈ 1.0 around 1M views
  if (!views || views <= 0) return 0;
  return Math.min(1.0, Math.log10(views + 1) / 6);
}

function calculateFreshness(publishedText, recencyYears) {
  const bucket = ageToBucket(publishedText);
  const maxAge = recencyYears;

  // Convert bucket to approximate years
  let ageYears = 0;
  if (publishedText.includes('month')) {
    const months = parseInt(publishedText) || 0;
    ageYears = months / 12;
  } else if (publishedText.includes('year')) {
    ageYears = parseInt(publishedText) || 0;
  } else if (publishedText.includes('day') || publishedText.includes('hour')) {
    ageYears = 0;
  }

  // Freshness scoring
  if (ageYears <= 1) return 1.0;
  if (ageYears <= 3) return 0.7;
  if (ageYears <= 5) return 0.4;
  return 0.2;
}

function calculateDurationFit(durationSec, minDuration, maxDuration) {
  if (!durationSec) return 0;

  // Perfect fit
  if (durationSec >= minDuration && durationSec <= maxDuration) {
    return 1.0;
  }

  // Within ±20%
  const minRange = minDuration * 0.8;
  const maxRange = maxDuration * 1.2;

  if (durationSec >= minRange && durationSec <= maxRange) {
    return 0.5;
  }

  return 0;
}

function calculateQuality(likeCount, views) {
  if (!likeCount || !views || views === 0) return 0;

  // Likes per 1000 views
  const likesPerK = (likeCount / views) * 1000;

  // Typical good ratio is 20-50 likes per 1000 views
  // Scale to 0-1
  return Math.min(1.0, likesPerK / 50);
}
