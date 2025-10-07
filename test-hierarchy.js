#!/usr/bin/env node

/**
 * Test Hierarchical Analysis
 * Verifies the new multi-tier hierarchy structure
 */

import dotenv from 'dotenv';
import { analyzeVideos } from './backend/services/analysisService.js';

dotenv.config();

console.log('🧪 Testing Hierarchical Analysis Structure\n');
console.log('='.repeat(60));

// Mock transcripts with clear strategic/tactical/pitfall content
const mockTranscripts = [
  {
    url: 'https://youtube.com/watch?v=1',
    video_id: '1',
    word_count: 1500,
    text: `Risk management is the foundation of successful trading. You must protect your capital above all else.

Here's how I implement risk management: I never risk more than 1% of my account on any single trade. For a $10,000 account, that's $100 maximum risk. I calculate my position size based on my stop loss distance.

Always use stop losses. Place them below support for longs, above resistance for shorts. I typically use 10-15 cents for stocks.

The biggest mistake I see beginners make is not using stop losses. They hope the trade will come back, but it rarely does. This leads to catastrophic losses.

Another common pitfall is risking too much per trade. If you risk 5-10% per trade, a few losses will devastate your account. Stick to 1-2% maximum.

Position sizing is critical. Use the formula: (Account Size × Risk %) / Stop Loss Distance = Position Size. This ensures consistent risk across all trades.`
  },
  {
    url: 'https://youtube.com/watch?v=2',
    video_id: '2',
    word_count: 1400,
    text: `The key to scalping is identifying high-probability setups. You need a systematic approach.

My strategy uses two indicators: the 9 EMA and VWAP. When price is above both, I look for long entries. When below both, I look for shorts.

For entries, I wait for a pullback to the 9 EMA. I want to see price bounce off the EMA with increasing volume. That's my signal to enter.

Risk management is non-negotiable. I risk exactly 1% per trade, no exceptions. My stop loss goes 5 cents below the EMA.

A mistake traders make is entering too early. Wait for confirmation. Don't try to catch the exact bottom.

Another pitfall is trading without volume confirmation. Low volume breakouts often fail. I need to see volume spike on my entry.

The 9 EMA acts as dynamic support and resistance. It's the most important indicator for intraday trading.`
  },
  {
    url: 'https://youtube.com/watch?v=3',
    video_id: '3',
    word_count: 1600,
    text: `Discipline separates profitable traders from losers. You must follow your rules without exception.

My trading rules are simple: Only trade the first hour. Risk 1% per trade. Take profits at 2:1 risk-reward minimum.

For execution, I use limit orders at key levels. I mark support and resistance from the previous day. When price approaches these levels, I prepare my orders.

The biggest mistake is emotional trading. After a loss, traders want to make it back immediately. This leads to revenge trading and bigger losses.

Another common error is not having a trading plan. You must know your entry, stop loss, and target before you enter. No guessing.

Overtrading is a killer. Quality over quantity. I take 3-5 trades per day maximum. Each trade gets my full attention and follows my rules exactly.

Risk management is everything. Without it, you will blow up your account. I've seen it happen countless times.`
  }
];

const mockVideos = [
  { title: 'Risk Management Masterclass', channel: 'Trading Pro', url: mockTranscripts[0].url },
  { title: 'Scalping Strategy Guide', channel: 'Day Trader', url: mockTranscripts[1].url },
  { title: 'Trading Discipline', channel: 'Market Master', url: mockTranscripts[2].url }
];

async function testHierarchy() {
  try {
    console.log('\n📊 Analyzing 3 mock videos...\n');
    
    const startTime = Date.now();
    const analysis = await analyzeVideos(mockTranscripts, mockVideos);
    const duration = Date.now() - startTime;
    
    console.log('='.repeat(60));
    console.log('✅ ANALYSIS COMPLETE');
    console.log('='.repeat(60));
    
    console.log(`\n⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log(`📊 Themes: ${analysis.themes?.length || 0}`);
    console.log(`📝 Legacy consensus points: ${analysis.consensus_points?.length || 0}`);
    
    // Display hierarchical themes
    if (analysis.themes && analysis.themes.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('🎯 HIERARCHICAL THEMES');
      console.log('='.repeat(60));
      
      analysis.themes.forEach((theme, index) => {
        console.log(`\n${index + 1}. 🎯 STRATEGIC: ${theme.strategic_principle}`);
        console.log(`   📊 Support: ${theme.support_count}/3 videos`);
        console.log(`   ⭐ Importance: ${theme.importance}`);
        
        if (theme.tactical_implementations && theme.tactical_implementations.length > 0) {
          console.log(`\n   ├─ TACTICAL IMPLEMENTATIONS:`);
          theme.tactical_implementations.forEach((tactical, i) => {
            console.log(`   │  ${i + 1}. ${tactical.action}`);
            console.log(`   │     Support: ${tactical.support_count}/3 videos`);
            if (tactical.specifics) {
              console.log(`   │     Specifics: ${tactical.specifics}`);
            }
          });
        }
        
        if (theme.common_pitfalls && theme.common_pitfalls.length > 0) {
          console.log(`\n   └─ ⚠️  COMMON PITFALLS:`);
          theme.common_pitfalls.forEach((pitfall, i) => {
            console.log(`      ${i + 1}. ${pitfall.warning}`);
            console.log(`         Support: ${pitfall.support_count}/3 videos`);
            if (pitfall.consequence) {
              console.log(`         Consequence: ${pitfall.consequence}`);
            }
          });
        }
        
        console.log('');
      });
    } else {
      console.log('\n⚠️  No themes generated');
    }
    
    // Display per-video breakdown
    console.log('='.repeat(60));
    console.log('💡 PER-VIDEO INSIGHTS');
    console.log('='.repeat(60));
    
    analysis.per_video.forEach((video, index) => {
      console.log(`\nVideo ${index + 1}: ${mockVideos[index].title}`);
      console.log(`  Strategic: ${video.strategic?.length || 0} principles`);
      console.log(`  Tactical: ${video.tactical?.length || 0} actions`);
      console.log(`  Pitfalls: ${video.pitfalls?.length || 0} warnings`);
      
      if (video.strategic && video.strategic.length > 0) {
        console.log(`\n  Sample Strategic:`);
        video.strategic.slice(0, 2).forEach(s => {
          console.log(`    • ${s.principle}`);
        });
      }
      
      if (video.tactical && video.tactical.length > 0) {
        console.log(`\n  Sample Tactical:`);
        video.tactical.slice(0, 2).forEach(t => {
          console.log(`    • ${t.action}`);
          if (t.specifics) console.log(`      (${t.specifics})`);
        });
      }
      
      if (video.pitfalls && video.pitfalls.length > 0) {
        console.log(`\n  Sample Pitfalls:`);
        video.pitfalls.slice(0, 2).forEach(p => {
          console.log(`    ⚠️  ${p.warning}`);
        });
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 HIERARCHY TEST COMPLETE!');
    console.log('='.repeat(60));
    
    console.log('\n✅ What to verify:');
    console.log('   1. Themes have strategic principles');
    console.log('   2. Each theme has tactical implementations');
    console.log('   3. Each theme has common pitfalls');
    console.log('   4. Support counts are tracked');
    console.log('   5. Specifics are extracted (numbers, parameters)');
    console.log('\n🚀 If this looks good, the hierarchy is working!\n');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }
}

testHierarchy();
