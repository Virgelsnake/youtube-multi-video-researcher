/**
 * Parse view count from YouTube format (e.g., "128K views", "1.2M views")
 */
export function parseViews(viewsText) {
  if (!viewsText) return 0;

  const text = viewsText.toLowerCase().replace(/,/g, '');
  const match = text.match(/([\d.]+)\s*([km]?)/);

  if (!match) return 0;

  const number = parseFloat(match[1]);
  const suffix = match[2];

  if (suffix === 'k') return Math.floor(number * 1000);
  if (suffix === 'm') return Math.floor(number * 1000000);
  return Math.floor(number);
}

/**
 * Parse duration from YouTube format (e.g., "12:34", "1:23:45")
 */
export function parseDuration(durationText) {
  if (!durationText) return 0;

  const parts = durationText.split(':').map(p => parseInt(p) || 0);

  if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
}

/**
 * Parse age text and convert to freshness bucket
 */
export function parseAge(ageText) {
  if (!ageText) return null;

  const text = ageText.toLowerCase();

  if (text.includes('hour') || text.includes('minute') || text.includes('second')) {
    return { bucket: 'recent', years: 0 };
  }

  if (text.includes('day')) {
    const days = parseInt(text) || 0;
    return { bucket: 'recent', years: days / 365 };
  }

  if (text.includes('week')) {
    const weeks = parseInt(text) || 0;
    return { bucket: 'recent', years: weeks / 52 };
  }

  if (text.includes('month')) {
    const months = parseInt(text) || 0;
    const years = months / 12;
    if (years <= 1) return { bucket: 'fresh', years };
    if (years <= 3) return { bucket: 'moderate', years };
    if (years <= 5) return { bucket: 'old', years };
    return { bucket: 'very_old', years };
  }

  if (text.includes('year')) {
    const years = parseInt(text) || 0;
    if (years <= 1) return { bucket: 'fresh', years };
    if (years <= 3) return { bucket: 'moderate', years };
    if (years <= 5) return { bucket: 'old', years };
    return { bucket: 'very_old', years };
  }

  return { bucket: 'unknown', years: 0 };
}

/**
 * Convert age text to freshness score (0-1)
 */
export function ageToBucket(ageText) {
  const parsed = parseAge(ageText);
  if (!parsed) return 0.5;

  const { years } = parsed;

  if (years <= 1) return 1.0;
  if (years <= 3) return 0.7;
  if (years <= 5) return 0.4;
  return 0.2;
}

/**
 * Format seconds to HH:MM:SS or MM:SS
 */
export function formatDuration(seconds) {
  if (!seconds) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  return `${minutes}:${String(secs).padStart(2, '0')}`;
}
