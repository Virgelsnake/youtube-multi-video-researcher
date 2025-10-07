import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { researchVideos } from './services/researchService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main research endpoint
app.post('/api/research', async (req, res) => {
  try {
    const { query, criteria } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    console.log(`\n🔍 Starting research for: "${query}"`);
    console.log('Criteria:', JSON.stringify(criteria, null, 2));

    const result = await researchVideos(query, criteria);

    console.log(`✅ Research complete. Found ${result.top5.length} videos.`);
    res.json(result);
  } catch (error) {
    console.error('❌ Research error:', error);
    res.status(500).json({
      error: 'Research failed',
      message: error.message,
      details: error.stack
    });
  }
});

app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('🚀 YouTube Multi-Video Researcher API');
  console.log('='.repeat(60));
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`\n📊 Endpoints:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/research`);
  console.log('\n⏹️  Press CTRL+C to stop the server\n');
  console.log('='.repeat(60));
});
