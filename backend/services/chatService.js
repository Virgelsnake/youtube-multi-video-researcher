import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

/**
 * Answer user questions about the research results
 * Uses transcripts and previous insights to provide contextual answers
 */
export async function answerQuestion(question, transcripts, videos, chatHistory = [], insights = {}) {
  if (!openai) {
    throw new Error('OpenAI API key not configured');
  }

  // Build context from transcripts and insights
  const context = buildContext(transcripts, videos, insights);
  
  // Create system prompt
  const systemPrompt = `You are an expert research assistant analyzing YouTube videos about a specific topic.

You have access to:
- Full transcripts from ${videos.length} videos
- Extracted insights (strategic themes, quantitative data, contradictions)
- Video metadata (titles, channels, timestamps)

Your role:
1. Answer questions based ONLY on the video content provided
2. Always cite which video(s) your answer comes from
3. Include specific quotes or evidence when relevant
4. **IMPORTANT: Include timestamps when referencing specific moments** (format: [HH:MM:SS])
5. If videos disagree, mention both viewpoints
6. If the answer isn't in the videos, say so clearly

Format your responses with:
- Clear, concise answers
- Citations: [Video X at HH:MM:SS] or [Video X: Title]
- Timestamps for specific claims or instructions
- Quotes when helpful
- Acknowledgment of disagreements or nuances

Example: "According to Video 1 at [00:03:45], they recommend risking only 1% per trade."`;

  // Build messages array
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Context about the videos:\n\n${context}` }
  ];

  // Add chat history (last 6 messages to keep context manageable)
  if (chatHistory && chatHistory.length > 0) {
    const recentHistory = chatHistory.slice(-6);
    messages.push(...recentHistory);
  }

  // Add current question
  messages.push({ role: 'user', content: question });

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });

    const answer = response.choices[0].message.content;

    // Extract video citations from the answer
    const citations = extractCitations(answer, videos);

    return {
      answer: answer,
      citations: citations,
      tokensUsed: response.usage.total_tokens
    };
  } catch (error) {
    console.error('Chat error:', error);
    throw error;
  }
}

/**
 * Build context from transcripts and insights
 * Intelligently selects relevant sections based on available data
 */
function buildContext(transcripts, videos, insights) {
  let context = '';

  // Add video summaries
  context += '=== VIDEO SUMMARIES ===\n\n';
  videos.forEach((video, index) => {
    context += `Video ${index + 1}: "${video.title}"\n`;
    context += `Channel: ${video.channel}\n`;
    context += `Views: ${video.views.toLocaleString()}, Duration: ${Math.floor(video.duration_sec / 60)}:${String(video.duration_sec % 60).padStart(2, '0')}\n`;
    context += `Score: ${video.score.toFixed(1)}/100\n\n`;
  });

  // Add strategic themes if available
  if (insights.themes && insights.themes.length > 0) {
    context += '\n=== KEY THEMES ===\n\n';
    insights.themes.forEach((theme, index) => {
      context += `${index + 1}. ${theme.strategic_principle} (${theme.support_count}/${videos.length} videos)\n`;
      if (theme.tactical_implementations && theme.tactical_implementations.length > 0) {
        context += '   Tactics:\n';
        theme.tactical_implementations.slice(0, 3).forEach(tactic => {
          context += `   - ${tactic.action}\n`;
        });
      }
    });
  }

  // Add quantitative data if available
  if (insights.quantitative_consensus && insights.quantitative_consensus.length > 0) {
    context += '\n=== KEY METRICS ===\n\n';
    insights.quantitative_consensus.forEach(metric => {
      context += `${metric.metric}: ${metric.consensus} (${metric.support_count}/${videos.length} videos)\n`;
    });
  }

  // Add contradictions if available
  if (insights.contradictions && insights.contradictions.length > 0) {
    context += '\n=== POINTS OF DEBATE ===\n\n';
    insights.contradictions.forEach((debate, index) => {
      context += `${index + 1}. ${debate.topic}\n`;
      debate.viewpoints.forEach((viewpoint, vIdx) => {
        context += `   Viewpoint ${String.fromCharCode(65 + vIdx)}: ${viewpoint.position}\n`;
      });
    });
  }

  // Add transcript excerpts with timestamps (first 10 segments from each video)
  context += '\n=== TRANSCRIPT EXCERPTS (with timestamps) ===\n\n';
  transcripts.forEach((transcript, index) => {
    if (transcript.segments && transcript.segments.length > 0) {
      context += `Video ${index + 1} (timestamped):\n`;
      const firstSegments = transcript.segments.slice(0, 10);
      firstSegments.forEach(seg => {
        if (seg.text && seg.start) {
          context += `[${seg.start}] ${seg.text}\n`;
        }
      });
      context += '\n';
    } else if (transcript.text) {
      // Fallback to plain text if segments not available
      const excerpt = transcript.text.substring(0, 500);
      context += `Video ${index + 1} excerpt:\n${excerpt}...\n\n`;
    }
  });

  // Limit total context size
  if (context.length > 8000) {
    context = context.substring(0, 8000) + '\n\n[Context truncated for length]';
  }

  return context;
}

/**
 * Extract video citations from the answer
 */
function extractCitations(answer, videos) {
  const citations = [];
  const videoPattern = /Video (\d+)/gi;
  let match;

  while ((match = videoPattern.exec(answer)) !== null) {
    const videoIndex = parseInt(match[1]) - 1;
    if (videoIndex >= 0 && videoIndex < videos.length) {
      const video = videos[videoIndex];
      if (!citations.find(c => c.index === videoIndex)) {
        citations.push({
          index: videoIndex,
          title: video.title,
          url: video.url,
          channel: video.channel
        });
      }
    }
  }

  return citations;
}

/**
 * Generate suggested questions based on the research topic and insights
 */
export function generateSuggestedQuestions(query, insights, videos) {
  const suggestions = [
    `What are the main strategies mentioned for ${query}?`,
    'What specific numbers or metrics are recommended?',
    'Where do the experts disagree?',
    'What are the common mistakes to avoid?',
    'What tools or resources are recommended?'
  ];

  // Add dynamic suggestions based on insights
  if (insights.themes && insights.themes.length > 0) {
    const topTheme = insights.themes[0];
    suggestions.push(`Tell me more about ${topTheme.strategic_principle.toLowerCase()}`);
  }

  if (insights.contradictions && insights.contradictions.length > 0) {
    const debate = insights.contradictions[0];
    suggestions.push(`Explain the different viewpoints on ${debate.topic.toLowerCase()}`);
  }

  return suggestions.slice(0, 6);
}
