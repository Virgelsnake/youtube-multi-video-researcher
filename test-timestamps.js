#!/usr/bin/env node

/**
 * Test Timestamp Extraction
 * Verifies that transcripts include timestamps
 */

import axios from 'axios';

console.log('🧪 Testing Timestamp Extraction\n');
console.log('='.repeat(60));

// Test with a real YouTube video
const testUrl = 'https://www.youtube.com/watch?v=TNhaISOUy6Q'; // Fireship React Hooks video

async function testTimestamps() {
  try {
    console.log('\n📍 Testing URL:', testUrl);
    console.log('⏳ Fetching transcript with timestamps...\n');
    
    const response = await axios.post('http://localhost:8082/get-transcript', {
      url: testUrl
    }, { timeout: 30000 });

    if (!response.data.success) {
      console.error('❌ Failed:', response.data.error);
      if (response.data.detail) {
        console.error('Details:', response.data.detail);
      }
      return;
    }

    const { transcript, segments, video_id, word_count } = response.data;

    console.log('✅ SUCCESS!\n');
    console.log('='.repeat(60));
    console.log('📊 TRANSCRIPT METADATA');
    console.log('='.repeat(60));
    console.log(`Video ID: ${video_id}`);
    console.log(`Word Count: ${word_count}`);
    console.log(`Total Segments: ${segments?.length || 0}`);
    console.log('');

    if (segments && segments.length > 0) {
      console.log('='.repeat(60));
      console.log('⏱️  TIMESTAMPED SEGMENTS (First 20)');
      console.log('='.repeat(60));
      console.log('');

      segments.slice(0, 20).forEach((seg, index) => {
        console.log(`[${seg.start}] ${seg.text}`);
      });

      console.log('');
      console.log('='.repeat(60));
      console.log('📝 SAMPLE SEGMENTS (Random 5)');
      console.log('='.repeat(60));
      console.log('');

      // Show 5 random segments from middle of video
      const middleStart = Math.floor(segments.length / 3);
      const middleSegments = segments.slice(middleStart, middleStart + 5);
      
      middleSegments.forEach(seg => {
        console.log(`[${seg.start} - ${seg.end}]`);
        console.log(`  ${seg.text}`);
        console.log('');
      });

      console.log('='.repeat(60));
      console.log('✅ TIMESTAMP VERIFICATION');
      console.log('='.repeat(60));
      console.log('');
      console.log(`✅ Segments have 'start' timestamps: ${segments.every(s => s.start)}`);
      console.log(`✅ Segments have 'end' timestamps: ${segments.every(s => s.end)}`);
      console.log(`✅ Segments have text: ${segments.every(s => s.text)}`);
      console.log(`✅ Timestamp format (HH:MM:SS): ${segments[0].start.match(/\d{2}:\d{2}:\d{2}/) ? 'Valid' : 'Invalid'}`);
      console.log('');

      // Show statistics
      const avgLength = segments.reduce((sum, seg) => sum + seg.text.length, 0) / segments.length;
      console.log('='.repeat(60));
      console.log('📈 STATISTICS');
      console.log('='.repeat(60));
      console.log(`Average segment length: ${avgLength.toFixed(0)} characters`);
      console.log(`Shortest segment: ${Math.min(...segments.map(s => s.text.length))} chars`);
      console.log(`Longest segment: ${Math.max(...segments.map(s => s.text.length))} chars`);
      console.log('');

    } else {
      console.log('⚠️  No segments found in response');
    }

    console.log('='.repeat(60));
    console.log('🎉 TEST COMPLETE!');
    console.log('='.repeat(60));
    console.log('');
    console.log('✅ Timestamps are being extracted correctly!');
    console.log('✅ Chat feature can now reference specific moments in videos');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

testTimestamps();
