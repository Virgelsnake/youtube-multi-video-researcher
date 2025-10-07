import axios from 'axios';

const TRANSCRIPT_API_URL = process.env.TRANSCRIPT_API_URL || 'http://localhost:8082/get-transcript';

export async function fetchTranscripts(videos, config) {
  const transcripts = [];

  for (const video of videos) {
    try {
      console.log(`   Fetching transcript for: ${video.title}`);
      const result = await fetchSingleTranscript(video.url);

      if (result.success) {
        transcripts.push({
          url: video.url,
          video_id: result.video_id,
          word_count: result.word_count,
          text: result.transcript,
          segments: result.segments || []  // NEW: Store timestamped segments
        });
        console.log(`   ✅ Got transcript (${result.word_count} words, ${result.segments?.length || 0} segments)`);
      } else {
        console.log(`   ❌ Failed: ${result.error}`);
        transcripts.push({
          url: video.url,
          video_id: null,
          word_count: 0,
          text: null,
          error: result.error
        });
      }
    } catch (error) {
      console.error(`   ❌ Error fetching transcript:`, error.message);
      transcripts.push({
        url: video.url,
        video_id: null,
        word_count: 0,
        text: null,
        error: error.message
      });
    }
  }

  return { transcripts };
}

async function fetchSingleTranscript(url) {
  try {
    const response = await axios.post(
      TRANSCRIPT_API_URL,
      { url },
      {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    throw error;
  }
}
