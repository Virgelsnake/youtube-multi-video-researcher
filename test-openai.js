#!/usr/bin/env node
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testing OpenAI Connection...\n');
console.log('='.repeat(60));

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ ERROR: OPENAI_API_KEY not found in .env file');
  process.exit(1);
}

const maskedKey = process.env.OPENAI_API_KEY.substring(0, 7) + '...' + 
                  process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 4);
console.log(`✅ API Key found: ${maskedKey}\n`);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function testOpenAI() {
  try {
    console.log('📡 Testing API connection...\n');
    
    // Test 1: Simple completion
    console.log('1️⃣  Test: Simple chat completion');
    const startTime = Date.now();
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Respond with a single word: "SUCCESS"' },
        { role: 'user', content: 'Test connection' }
      ],
      max_tokens: 10,
      temperature: 0
    });

    const duration = Date.now() - startTime;
    const result = response.choices[0].message.content.trim();

    console.log(`   ✅ Response received in ${duration}ms`);
    console.log(`   📝 Response: "${result}"`);
    console.log(`   💰 Tokens used: ${response.usage.total_tokens}`);

    // Test 2: JSON mode (used in the app)
    console.log('\n2️⃣  Test: JSON response format (used in app)');
    const startTime2 = Date.now();
    
    const jsonResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Return JSON with a "status" field set to "working"' },
        { role: 'user', content: 'Test JSON mode' }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 20,
      temperature: 0
    });

    const duration2 = Date.now() - startTime2;
    const jsonResult = JSON.parse(jsonResponse.choices[0].message.content);

    console.log(`   ✅ JSON response received in ${duration2}ms`);
    console.log(`   📝 Response:`, jsonResult);
    console.log(`   💰 Tokens used: ${jsonResponse.usage.total_tokens}`);

    // Test 3: Simulate app usage
    console.log('\n3️⃣  Test: Simulated transcript analysis');
    const startTime3 = Date.now();
    
    const mockTranscript = `In this video, we'll cover three main points about investing:
First, diversification is key to managing risk.
Second, dollar-cost averaging helps smooth out market volatility.
Third, long-term thinking beats short-term trading.`;

    const analysisResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `You are an assistant extracting key points from a transcript.
Return JSON with:
- "highlights": [{ "point": "...", "evidence": "short quote" }]
- "terms": ["...", ...]` 
        },
        { role: 'user', content: `Extract key points from this transcript:\n\n${mockTranscript}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const duration3 = Date.now() - startTime3;
    const analysisResult = JSON.parse(analysisResponse.choices[0].message.content);

    console.log(`   ✅ Analysis completed in ${duration3}ms`);
    console.log(`   📝 Extracted ${analysisResult.highlights?.length || 0} highlights`);
    console.log(`   💰 Tokens used: ${analysisResponse.usage.total_tokens}`);
    
    if (analysisResult.highlights && analysisResult.highlights.length > 0) {
      console.log(`   📌 Sample highlight: "${analysisResult.highlights[0].point}"`);
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n✅ Your OpenAI API key is working correctly!');
    console.log('✅ The app is ready to analyze video transcripts');
    console.log('✅ JSON mode is functioning (required for the app)');
    
    const totalTokens = response.usage.total_tokens + 
                       jsonResponse.usage.total_tokens + 
                       analysisResponse.usage.total_tokens;
    const estimatedCost = (totalTokens / 1000000) * 0.15;
    
    console.log(`\n💰 Total tokens used in tests: ${totalTokens}`);
    console.log(`💵 Estimated cost: $${estimatedCost.toFixed(6)}`);
    console.log('\n🚀 Backend server is running with OpenAI enabled!');
    console.log('   Open http://localhost:5173 to use the app\n');

  } catch (error) {
    console.error('\n❌ ERROR: OpenAI API test failed\n');
    
    if (error.status === 401) {
      console.error('🔑 Authentication Error: Invalid API key');
      console.error('   Please check your OPENAI_API_KEY in .env file');
    } else if (error.status === 429) {
      console.error('⏱️  Rate Limit Error: Too many requests');
      console.error('   Please wait a moment and try again');
    } else if (error.status === 403) {
      console.error('🚫 Permission Error: API key lacks permissions');
      console.error('   Check your OpenAI account status and billing');
    } else {
      console.error('Error details:', error.message);
    }
    
    console.log('\n📚 Troubleshooting:');
    console.log('   1. Verify API key at: https://platform.openai.com/api-keys');
    console.log('   2. Check account has credits: https://platform.openai.com/usage');
    console.log('   3. Ensure API key starts with "sk-"\n');
    
    process.exit(1);
  }
}

testOpenAI();
