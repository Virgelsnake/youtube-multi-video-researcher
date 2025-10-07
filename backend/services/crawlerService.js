import { crawlYouTubeVideos } from './crawlerIntegration.js';

/**
 * Main crawler entry point
 * Delegates to the crawler integration which handles Playwright MCP
 */
export async function crawlYouTube(query, config) {
  return await crawlYouTubeVideos(query, config);
}

// Helper function to extract video data from YouTube DOM
export function extractVideoData(element) {
  try {
    // These selectors match YouTube's current structure
    const titleElement = element.querySelector('#video-title');
    const channelElement = element.querySelector('ytd-channel-name a');
    const metaElements = element.querySelectorAll('#metadata-line span');
    const durationElement = element.querySelector('ytd-thumbnail-overlay-time-status-renderer span');
    
    const url = titleElement?.getAttribute('href');
    const title = titleElement?.getAttribute('title') || titleElement?.textContent?.trim();
    const channel = channelElement?.textContent?.trim();
    
    let views = 0;
    let publishedText = '';
    
    if (metaElements.length >= 2) {
      const viewsText = metaElements[0]?.textContent || '';
      const ageText = metaElements[1]?.textContent || '';
      
      views = parseViews(viewsText);
      publishedText = ageText;
    }
    
    const durationText = durationElement?.textContent?.trim() || '';
    const durationSec = parseDuration(durationText);
    
    // Check if it's a Short
    const isShorts = element.tagName === 'YTD-REEL-VIDEO-RENDERER' || 
                     url?.includes('/shorts/');
    
    return {
      url: url ? `https://www.youtube.com${url}` : null,
      title,
      channel,
      views,
      published_at_text: publishedText,
      duration_sec: durationSec,
      is_shorts: isShorts,
      like_count: 0, // Would be fetched from watch page if needed
      score: 0 // Will be calculated by scoring service
    };
  } catch (error) {
    console.error('Error extracting video data:', error);
    return null;
  }
}

// Function to be called by Playwright MCP integration
export async function crawlYouTubeWithPlaywright(query, config) {
  // This function will be implemented to use Playwright MCP
  // It will:
  // 1. Navigate to YouTube search
  // 2. Extract video elements
  // 3. Parse data using extractVideoData
  // 4. Return candidates array
  
  const candidates = [];
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  
  console.log(`   Would navigate to: ${searchUrl}`);
  console.log(`   Would extract ytd-video-renderer elements`);
  console.log(`   Would exclude ytd-reel-video-renderer (Shorts)`);
  
  // Placeholder for Playwright integration
  // In actual implementation, this would use:
  // - mcp2_playwright_navigate
  // - mcp2_playwright_get_visible_html
  // - Parse and extract video data
  
  return candidates;
}
