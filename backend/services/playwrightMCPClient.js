/**
 * Playwright MCP Client for YouTube Crawling
 * This module provides functions to crawl YouTube using Playwright
 */

import { parseViews, parseDuration } from '../utils/parsers.js';

/**
 * Crawl YouTube search results using Playwright
 * Note: This requires Playwright to be installed and browsers downloaded
 */
export async function crawlYouTubeWithPlaywright(query, config) {
  const { chromium } = await import('playwright');
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  
  let browser;
  let videos = [];
  
  try {
    console.log('   🎭 Launching Playwright browser...');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    
    console.log(`   📍 Navigating to: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('   ⏳ Waiting for content to load...');
    await page.waitForTimeout(3000);
    
    console.log('   📊 Extracting video data...');
    const extractedVideos = await page.evaluate(() => {
      const videos = [];
      const videoRenderers = document.querySelectorAll('ytd-video-renderer');
      
      videoRenderers.forEach((renderer) => {
        try {
          const titleElement = renderer.querySelector('#video-title');
          const channelElement = renderer.querySelector('#channel-name a, ytd-channel-name a');
          const metaElements = renderer.querySelectorAll('#metadata-line span');
          const durationElement = renderer.querySelector('ytd-thumbnail-overlay-time-status-renderer span');
          
          const url = titleElement?.getAttribute('href');
          const title = titleElement?.getAttribute('title') || titleElement?.textContent?.trim();
          const channel = channelElement?.textContent?.trim();
          
          let viewsText = '';
          let publishedText = '';
          
          if (metaElements.length >= 2) {
            viewsText = metaElements[0]?.textContent || '';
            publishedText = metaElements[1]?.textContent || '';
          }
          
          const duration = durationElement?.textContent?.trim() || '';
          
          // Check if it's a Short
          const isShorts = url?.includes('/shorts/');
          
          if (url && title) {
            videos.push({
              url: 'https://www.youtube.com' + url,
              title: title,
              channel: channel || 'Unknown',
              viewsText: viewsText,
              published_at_text: publishedText,
              durationText: duration,
              is_shorts: isShorts
            });
          }
        } catch (e) {
          // Skip videos that fail to parse
        }
      });
      
      return videos;
    });
    
    console.log(`   ✅ Extracted ${extractedVideos.length} videos`);
    
    // Process and normalize the data
    videos = extractedVideos.map(video => ({
      url: video.url,
      title: video.title,
      channel: video.channel,
      views: parseViews(video.viewsText),
      published_at_text: video.published_at_text,
      duration_sec: parseDuration(video.durationText),
      is_shorts: video.is_shorts,
      like_count: 0,
      score: 0
    }));
    
    // Filter based on config
    videos = videos.filter(video => {
      if (config.exclude_shorts && video.is_shorts) return false;
      if (video.duration_sec < config.min_duration_sec) return false;
      if (video.duration_sec > config.max_duration_sec) return false;
      return true;
    });
    
    console.log(`   ✅ After filtering: ${videos.length} videos`);
    
  } catch (error) {
    console.error('   ❌ Playwright crawling error:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('   🔒 Browser closed');
    }
  }
  
  return videos;
}
