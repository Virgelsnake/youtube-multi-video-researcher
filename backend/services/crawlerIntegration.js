/**
 * YouTube Crawler with Playwright MCP Integration
 * This module provides the actual implementation for crawling YouTube using Playwright MCP
 */

import { parseViews, parseDuration } from '../utils/parsers.js';
import { crawlYouTubeWithPlaywright } from './playwrightMCPClient.js';

/**
 * Main crawler function that will be called by researchService
 * This integrates with Playwright to scrape YouTube search results
 */
export async function crawlYouTubeVideos(query, config) {
  console.log(`   Starting YouTube crawl for: "${query}"`);
  
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  console.log(`   📍 Search URL: ${searchUrl}`);
  
  try {
    // Use real Playwright crawling
    const videos = await crawlYouTubeWithPlaywright(query, config);
    return videos;
  } catch (error) {
    console.error('   ❌ Crawler error:', error);
    console.log('   ⚠️  Falling back to mock data');
    // Fallback to mock data if Playwright fails
    return generateMockVideos(query);
  }
}

/**
 * Parse HTML content to extract video data
 * This would be used after getting HTML from Playwright
 */
export function parseYouTubeSearchHTML(html) {
  const videos = [];
  
  // This is where we would parse the HTML
  // Using regex or HTML parser to extract ytd-video-renderer elements
  
  // Example structure of what we're looking for:
  // <ytd-video-renderer>
  //   <a id="video-title" href="/watch?v=VIDEO_ID" title="Video Title">
  //   <ytd-channel-name><a>Channel Name</a></ytd-channel-name>
  //   <span id="metadata-line">
  //     <span>123K views</span>
  //     <span>2 months ago</span>
  //   </span>
  //   <ytd-thumbnail-overlay-time-status-renderer>
  //     <span>12:34</span>
  //   </ytd-thumbnail-overlay-time-status-renderer>
  // </ytd-video-renderer>
  
  return videos;
}

/**
 * Extract individual video data from a video element
 */
export function extractVideoFromElement(element) {
  try {
    // Extract URL and title
    const titleLink = element.querySelector('#video-title');
    const url = titleLink?.getAttribute('href');
    const title = titleLink?.getAttribute('title') || titleLink?.textContent?.trim();
    
    // Extract channel
    const channelLink = element.querySelector('ytd-channel-name a');
    const channel = channelLink?.textContent?.trim();
    
    // Extract metadata (views and publish date)
    const metaSpans = element.querySelectorAll('#metadata-line span');
    let views = 0;
    let publishedText = '';
    
    if (metaSpans.length >= 2) {
      views = parseViews(metaSpans[0]?.textContent || '');
      publishedText = metaSpans[1]?.textContent?.trim() || '';
    }
    
    // Extract duration
    const durationSpan = element.querySelector('ytd-thumbnail-overlay-time-status-renderer span');
    const durationSec = parseDuration(durationSpan?.textContent?.trim() || '');
    
    // Check if it's a Short
    const isShorts = element.tagName.toLowerCase() === 'ytd-reel-video-renderer' || 
                     url?.includes('/shorts/');
    
    return {
      url: url ? `https://www.youtube.com${url}` : null,
      title: title || 'Unknown Title',
      channel: channel || 'Unknown Channel',
      views,
      published_at_text: publishedText,
      duration_sec: durationSec,
      is_shorts: isShorts,
      like_count: 0,
      score: 0
    };
  } catch (error) {
    console.error('Error extracting video:', error);
    return null;
  }
}

/**
 * Generate mock videos for testing
 * Remove this once Playwright integration is complete
 */
function generateMockVideos(query) {
  const mockTitles = [
    `Complete Guide to ${query}`,
    `${query} - Everything You Need to Know`,
    `${query} Explained for Beginners`,
    `Advanced ${query} Strategies`,
    `${query} Tutorial 2024`,
    `How to Master ${query}`,
    `${query} Tips and Tricks`,
    `Understanding ${query} in 15 Minutes`,
    `${query} - Common Mistakes to Avoid`,
    `${query} Best Practices`
  ];
  
  const mockChannels = [
    'Finance Academy',
    'Investment Insights',
    'Trading Pro',
    'Money Masters',
    'Wealth Builder',
    'Market Analysis',
    'Smart Investor',
    'Financial Freedom',
    'Options Expert',
    'Stock Market Guide'
  ];
  
  return mockTitles.map((title, index) => ({
    url: `https://www.youtube.com/watch?v=MOCK${index}`,
    title,
    channel: mockChannels[index],
    views: Math.floor(Math.random() * 500000) + 10000,
    published_at_text: ['2 months ago', '6 months ago', '1 year ago', '3 months ago', '1 month ago'][index % 5],
    duration_sec: Math.floor(Math.random() * 1200) + 300,
    is_shorts: false,
    like_count: Math.floor(Math.random() * 5000) + 100,
    score: 0
  }));
}

