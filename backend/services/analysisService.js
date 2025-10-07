import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null;

const PER_VIDEO_SYSTEM_PROMPT = `You are an assistant extracting hierarchical insights from a YouTube transcript.

Extract insights in THREE tiers:
1. STRATEGIC principles (high-level concepts, "why" something matters)
2. TACTICAL implementations (specific "how-to" steps, concrete actions)
3. PITFALLS/WARNINGS (common mistakes, things to avoid)

ALSO extract QUANTITATIVE DATA - any specific numbers, metrics, or parameters mentioned:
- Percentages (e.g., "risk 1-2%", "65% win rate")
- Dollar amounts (e.g., "$100 per trade", "$10,000 account")
- Time periods (e.g., "first hour", "2-3 minutes", "30 days")
- Ratios (e.g., "2:1 risk-reward", "1:3 ratio")
- Counts (e.g., "3-5 trades per day", "top 10 stocks")
- Ranges (e.g., "10-15 cents", "5-10 minutes")

Return JSON with:
{
  "strategic": [{ "principle": "...", "evidence": "short quote", "importance": "high/medium" }],
  "tactical": [{ "action": "...", "specifics": "exact parameters/steps", "evidence": "short quote" }],
  "pitfalls": [{ "warning": "...", "consequence": "what happens if ignored", "evidence": "short quote" }],
  "quantitative": [{ "metric": "what is being measured", "value": "the number/range", "context": "what it applies to", "quote": "exact quote" }],
  "terms": ["..."]  // key terms/definitions
}

Extract 3-5 items per tier. Focus on concrete, teachable statements with specific details and exact numbers.`;

const CROSS_VIDEO_SYSTEM_PROMPT = `You are synthesizing insights from multiple videos into a hierarchical structure.

Input: Per-video insights organized as strategic/tactical/pitfalls/quantitative.

Task:
1) Group semantically equivalent points across videos
2) Organize into hierarchical themes with sub-points
3) Track support_count (how many videos mention each point)
4) Identify patterns: what strategies lead to what tactics
5) Aggregate quantitative data: find consensus numbers, ranges, and common metrics

Return JSON:
{
  "themes": [
    {
      "strategic_principle": "High-level concept (e.g., 'Risk Management is Critical')",
      "support_count": 5,
      "importance": "critical/high/medium",
      "tactical_implementations": [
        {
          "action": "Specific how-to",
          "support_count": 4,
          "specifics": "Exact parameters mentioned",
          "supporting_videos": [0, 1, 3]
        }
      ],
      "common_pitfalls": [
        {
          "warning": "What to avoid",
          "support_count": 3,
          "consequence": "What happens if ignored",
          "supporting_videos": [0, 2, 4]
        }
      ]
    }
  ],
  "quantitative_consensus": [
    {
      "metric": "What is being measured (e.g., 'Risk per trade')",
      "values": ["1%", "2%", "1-2%"],
      "consensus": "Most common value or range",
      "support_count": 4,
      "context": "What this applies to",
      "supporting_videos": [0, 1, 2, 3]
    }
  ]
}

Create 3-5 major themes. Extract 5-10 quantitative consensus points. Prioritize metrics mentioned in 3+ videos.`;

export async function analyzeVideos(transcripts, videos) {
  const validTranscripts = transcripts.filter(t => t && t.text);

  if (validTranscripts.length === 0) {
    return {
      consensus_points: [],
      per_video: [],
      error: 'No valid transcripts to analyze'
    };
  }

  if (!openai) {
    console.warn('   ⚠️  OpenAI API key not configured - skipping AI analysis');
    return {
      consensus_points: [],
      per_video: validTranscripts.map(t => ({
        url: t.url,
        highlights: [],
        terms: [],
        error: 'OpenAI API key not configured'
      })),
      error: 'OpenAI API key not configured'
    };
  }

  // Step 1: Extract hierarchical insights from each video
  console.log('   Extracting hierarchical insights from each video...');
  const perVideoAnalysis = [];

  for (let i = 0; i < validTranscripts.length; i++) {
    const transcript = validTranscripts[i];
    try {
      const analysis = await extractVideoHighlights(transcript.text);
      perVideoAnalysis.push({
        url: transcript.url,
        strategic: analysis.strategic || [],
        tactical: analysis.tactical || [],
        pitfalls: analysis.pitfalls || [],
        quantitative: analysis.quantitative || [],
        terms: analysis.terms || [],
        // Keep legacy highlights for backward compatibility
        highlights: [
          ...(analysis.strategic || []).map(s => ({ point: s.principle, evidence: s.evidence })),
          ...(analysis.tactical || []).map(t => ({ point: t.action, evidence: t.evidence }))
        ]
      });
      const totalInsights = (analysis.strategic?.length || 0) + (analysis.tactical?.length || 0) + (analysis.pitfalls?.length || 0);
      const quantCount = analysis.quantitative?.length || 0;
      console.log(`   ✅ Extracted ${totalInsights} insights from video ${i + 1} (${analysis.strategic?.length || 0} strategic, ${analysis.tactical?.length || 0} tactical, ${analysis.pitfalls?.length || 0} pitfalls, ${quantCount} metrics)`);
    } catch (error) {
      console.error(`   ❌ Error analyzing video ${i + 1}:`, error.message);
      perVideoAnalysis.push({
        url: transcript.url,
        strategic: [],
        tactical: [],
        pitfalls: [],
        highlights: [],
        terms: [],
        error: error.message
      });
    }
  }

  // Step 2: Synthesize hierarchical consensus across videos
  console.log('   Synthesizing hierarchical consensus across videos...');
  let themes = [];
  let quantitativeConsensus = [];
  let legacyConsensusPoints = [];

  try {
    const consensus = await synthesizeConsensus(perVideoAnalysis, videos);
    themes = consensus.themes || [];
    quantitativeConsensus = consensus.quantitative_consensus || [];
    
    // Create legacy consensus_points for backward compatibility
    legacyConsensusPoints = themes.flatMap(theme => {
      const points = [{
        summary: theme.strategic_principle,
        support_count: theme.support_count,
        weight: theme.importance === 'critical' ? 5 : theme.importance === 'high' ? 4 : 3,
        type: 'strategic'
      }];
      
      // Add tactical points
      if (theme.tactical_implementations) {
        theme.tactical_implementations.forEach(tactical => {
          points.push({
            summary: tactical.action,
            support_count: tactical.support_count,
            weight: 3,
            type: 'tactical',
            parent: theme.strategic_principle
          });
        });
      }
      
      return points;
    });
    
    console.log(`   ✅ Generated ${themes.length} hierarchical themes with ${legacyConsensusPoints.length} total insights`);
    console.log(`   ✅ Extracted ${quantitativeConsensus.length} quantitative consensus metrics`);
  } catch (error) {
    console.error('   ❌ Error synthesizing consensus:', error.message);
  }

  return {
    themes: themes,  // New hierarchical structure
    quantitative_consensus: quantitativeConsensus,  // Quantitative data aggregation
    consensus_points: legacyConsensusPoints,  // Legacy flat structure for backward compatibility
    per_video: perVideoAnalysis
  };
}

async function extractVideoHighlights(transcriptText) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: PER_VIDEO_SYSTEM_PROMPT },
        { role: 'user', content: `Extract key points from this transcript:\n\n${transcriptText.slice(0, 15000)}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI extraction error:', error);
    throw error;
  }
}

async function synthesizeConsensus(perVideoAnalysis, videos) {
  try {
    const highlightsData = perVideoAnalysis.map((analysis, index) => ({
      video_index: index,
      video_title: videos[index]?.title || 'Unknown',
      highlights: analysis.highlights
    }));

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CROSS_VIDEO_SYSTEM_PROMPT },
        { role: 'user', content: `Synthesize consensus from these video highlights:\n\n${JSON.stringify(highlightsData, null, 2)}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI synthesis error:', error);
    throw error;
  }
}
