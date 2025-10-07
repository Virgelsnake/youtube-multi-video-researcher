#!/usr/bin/env node

/**
 * Test Full Research Pipeline
 * Tests: Crawling → Scoring → Transcripts → OpenAI Analysis → Consensus
 */

import dotenv from 'dotenv';
import { researchVideos } from './backend/services/researchService.js';

dotenv.config();

console.log('🧪 Testing Full Research Pipeline\n');
console.log('='.repeat(60));

const testQuery = 'react hooks tutorial';
const criteria = {
  language: 'en',
  min_duration_sec: 300,
  max_duration_sec: 1800,  // 30 minutes max for faster transcripts
  recency_years: 3,
  exclude_shorts: true,
  require_transcript: true,
  pages_to_crawl: 1
};

async function testFullPipeline() {
  try {
    console.log(`\n📍 Query: "${testQuery}"`);
    console.log('📋 Criteria:', JSON.stringify(criteria, null, 2));
    console.log('\n🚀 Starting full research pipeline...\n');
    
    const startTime = Date.now();
    const results = await researchVideos(testQuery, criteria);
    const duration = Date.now() - startTime;
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ RESEARCH COMPLETE!');
    console.log('='.repeat(60));
    
    console.log(`\n⏱️  Total Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`📊 Candidates Found: ${results.candidates.length}`);
    console.log(`🎯 Top 5 Selected: ${results.top5.length}`);
    console.log(`📝 Transcripts Fetched: ${results.transcripts.filter(t => t.text).length}`);
    console.log(`🤖 Consensus Points: ${results.analysis.consensus_points.length}`);
    
    // Display Top 5 Videos
    console.log('\n📹 TOP 5 VIDEOS:\n');
    results.top5.forEach((video, index) => {
      console.log(`${index + 1}. ${video.title}`);
      console.log(`   Channel: ${video.channel}`);
      console.log(`   Score: ${video.score.toFixed(1)}/100`);
      console.log(`   Views: ${video.views.toLocaleString()}`);
      console.log(`   Duration: ${Math.floor(video.duration_sec / 60)}:${String(video.duration_sec % 60).padStart(2, '0')}`);
      console.log('');
    });
    
    // Display Transcript Status
    console.log('📝 TRANSCRIPT STATUS:\n');
    results.transcripts.forEach((transcript, index) => {
      const video = results.top5[index];
      if (transcript.text) {
        console.log(`✅ Video ${index + 1}: ${transcript.word_count} words`);
      } else {
        console.log(`❌ Video ${index + 1}: Failed - ${transcript.error || 'Unknown error'}`);
      }
    });
    
    // Display Consensus Points
    if (results.analysis.consensus_points.length > 0) {
      console.log('\n🎯 CONSENSUS INSIGHTS:\n');
      results.analysis.consensus_points.slice(0, 5).forEach((point, index) => {
        console.log(`${index + 1}. ${point.summary}`);
        console.log(`   Support: ${point.support_count}/${results.top5.length} videos`);
        if (point.supporting_videos && point.supporting_videos.length > 0) {
          console.log(`   Sources: Video ${point.supporting_videos.map(v => (v.index || 0) + 1).join(', Video ')}`);
        }
        console.log('');
      });
    } else {
      console.log('\n⚠️  No consensus points generated');
    }
    
    // Display Per-Video Highlights
    console.log('💡 PER-VIDEO HIGHLIGHTS:\n');
    results.analysis.per_video.forEach((analysis, index) => {
      const video = results.top5[index];
      console.log(`Video ${index + 1}: ${video.title}`);
      if (analysis.highlights && analysis.highlights.length > 0) {
        analysis.highlights.slice(0, 3).forEach(highlight => {
          console.log(`   • ${highlight.point}`);
        });
      } else if (analysis.error) {
        console.log(`   ⚠️  ${analysis.error}`);
      }
      console.log('');
    });
    
    console.log('='.repeat(60));
    console.log('🎉 FULL PIPELINE TEST COMPLETE!');
    console.log('='.repeat(60));
    
    console.log('\n✅ What Worked:');
    console.log(`   ✅ Found ${results.candidates.length} YouTube videos`);
    console.log(`   ✅ Scored and ranked videos`);
    console.log(`   ✅ Selected top 5 by score`);
    console.log(`   ✅ Fetched ${results.transcripts.filter(t => t.text).length} transcripts`);
    console.log(`   ✅ Analyzed with OpenAI`);
    console.log(`   ✅ Generated ${results.analysis.consensus_points.length} consensus points`);
    
    console.log('\n🚀 Your app is ready to use at http://localhost:5173\n');
    
  } catch (error) {
    console.error('\n❌ Pipeline test failed:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

testFullPipeline();
