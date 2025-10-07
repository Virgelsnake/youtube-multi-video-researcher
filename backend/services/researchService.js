import { crawlYouTube } from './crawlerService.js';
import { scoreVideos } from './scoringService.js';
import { fetchTranscripts } from './transcriptService.js';
import { analyzeVideos } from './analysisService.js';

export async function researchVideos(query, criteria = {}) {
  // Set defaults
  const config = {
    language: criteria.language || 'en',
    min_duration_sec: criteria.min_duration_sec || 360,
    max_duration_sec: criteria.max_duration_sec || 2400,
    recency_years: criteria.recency_years || 3,
    exclude_shorts: criteria.exclude_shorts !== false,
    require_transcript: criteria.require_transcript !== false,
    pages_to_crawl: criteria.pages_to_crawl || parseInt(process.env.CRAWL_PAGES_DEFAULT || '2')
  };

  console.log('📡 Step 1: Crawling YouTube...');
  const candidates = await crawlYouTube(query, config);
  console.log(`   Found ${candidates.length} candidates`);

  console.log('📊 Step 2: Scoring videos...');
  const scored = scoreVideos(candidates, query, config);
  console.log(`   Scored ${scored.length} videos`);

  // Sort by score and take top 5
  const ranked = scored.sort((a, b) => b.score - a.score);
  let top5 = ranked.slice(0, 5);

  console.log('📝 Step 3: Fetching transcripts...');
  const transcriptResults = await fetchTranscripts(top5, config);
  
  // If require_transcript is true, replace failed ones with next candidates
  if (config.require_transcript) {
    let replacementIndex = 5;
    for (let i = 0; i < top5.length; i++) {
      if (!transcriptResults.transcripts[i] || !transcriptResults.transcripts[i].text) {
        // Try to replace with next candidate
        while (replacementIndex < ranked.length) {
          const replacement = ranked[replacementIndex];
          replacementIndex++;
          
          const replacementTranscript = await fetchTranscripts([replacement], config);
          if (replacementTranscript.transcripts[0] && replacementTranscript.transcripts[0].text) {
            top5[i] = replacement;
            transcriptResults.transcripts[i] = replacementTranscript.transcripts[0];
            console.log(`   ✅ Replaced video ${i + 1} with transcript-available alternative`);
            break;
          }
        }
      }
    }
  }

  console.log(`   Got ${transcriptResults.transcripts.filter(t => t && t.text).length} transcripts`);

  console.log('🤖 Step 4: Analyzing with OpenAI...');
  const analysis = await analyzeVideos(transcriptResults.transcripts, top5);
  console.log(`   Generated ${analysis.consensus_points.length} consensus points`);

  return {
    query,
    criteria: config,
    candidates: ranked.slice(0, 30), // Return top 30 for reference
    top5,
    transcripts: transcriptResults.transcripts,
    analysis
  };
}
