# 🧪 Testing Phase 1: Multi-Tier Hierarchy

## Quick Test Commands

### Test 1: Hierarchy Test Script (Recommended First Test)
```bash
node test-hierarchy.js
```

**What this does:**
- Uses 3 mock transcripts with clear strategic/tactical/pitfall content
- Tests the new hierarchical extraction
- Shows the nested structure
- Takes ~30-60 seconds

**Expected output:**
```
🎯 HIERARCHICAL THEMES

1. 🎯 STRATEGIC: Risk Management is Critical
   📊 Support: 3/3 videos
   ⭐ Importance: critical

   ├─ TACTICAL IMPLEMENTATIONS:
   │  1. Risk only 1% per trade
   │     Support: 3/3 videos
   │     Specifics: For $10K account, risk $100 maximum
   
   └─ ⚠️  COMMON PITFALLS:
      1. Not using stop losses
         Support: 2/3 videos
         Consequence: Leads to catastrophic losses
```

---

### Test 2: Real Data Test (After Test 1 Passes)
```bash
curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"query":"react hooks tutorial","criteria":{"min_duration_sec":300,"max_duration_sec":1200,"recency_years":3,"exclude_shorts":true,"require_transcript":true}}' \
  > /tmp/hierarchy-test.json

# Then view the results
node -e "const fs=require('fs'); const d=JSON.parse(fs.readFileSync('/tmp/hierarchy-test.json')); console.log('Themes generated:', d.analysis.themes?.length || 0); d.analysis.themes?.forEach((t,i)=>console.log(\`\n\${i+1}. \${t.strategic_principle}\n   Tactical: \${t.tactical_implementations?.length || 0}\n   Pitfalls: \${t.common_pitfalls?.length || 0}\`));"
```

---

### Test 3: Browser Test
1. Open http://localhost:5173
2. Enter: "scalping day trading strategies"
3. Click "Start Research"
4. Wait for results
5. Open browser console (F12)
6. Type: `console.log(JSON.stringify(window.lastResults.analysis.themes, null, 2))`
7. Verify hierarchical structure

---

## 🎯 What to Verify

### ✅ Structure Checklist
- [ ] Themes array exists in response
- [ ] Each theme has `strategic_principle`
- [ ] Each theme has `tactical_implementations` array
- [ ] Each theme has `common_pitfalls` array
- [ ] Support counts are present
- [ ] Specifics contain numbers/parameters

### ✅ Content Quality Checklist
- [ ] Strategic principles are high-level concepts
- [ ] Tactical actions are specific and actionable
- [ ] Pitfalls describe what to avoid
- [ ] Consequences explain why pitfalls matter
- [ ] Specifics include exact numbers (e.g., "1%", "10 cents")

### ✅ Comparison to Old Output
- [ ] Output feels richer (more depth)
- [ ] Information is better organized
- [ ] Actionable details are clearer
- [ ] Relationships between concepts are visible

---

## 📊 Sample Expected Output

### OLD FORMAT (Flat List):
```
Consensus Points:
1. Use stop losses (5/5 videos)
2. Risk 1-2% per trade (4/5 videos)
3. Don't revenge trade (3/5 videos)
4. Use 9 EMA for trend (4/5 videos)
5. Wait for confirmation (3/5 videos)
```

### NEW FORMAT (Hierarchical):
```
THEME 1: Risk Management is Critical (5/5 videos)
├─ TACTICAL: Always use stop losses (5/5 videos)
│   └─ Specifics: Place 10-15 cents below support
├─ TACTICAL: Risk only 1-2% per trade (4/5 videos)
│   └─ Specifics: For $10K account = $100-200 max
└─ PITFALL: Don't revenge trade (3/5 videos)
    └─ Consequence: Leads to emotional decisions

THEME 2: Identify High-Probability Setups (4/5 videos)
├─ TACTICAL: Use 9 EMA for trend direction (4/5 videos)
│   └─ Specifics: Long above, short below
├─ TACTICAL: Wait for confirmation (3/5 videos)
│   └─ Specifics: Volume spike + reversal candle
└─ PITFALL: Entering too early (3/5 videos)
    └─ Consequence: Low probability trades
```

**Notice the difference:**
- ✅ Principles are grouped logically
- ✅ Tactics are connected to their principles
- ✅ Specifics provide exact parameters
- ✅ Pitfalls show what to avoid
- ✅ Consequences explain the "why"

---

## 🐛 Troubleshooting

### If no themes are generated:
1. Check OpenAI API key is loaded: `node -e "require('dotenv').config(); console.log('Key:', process.env.OPENAI_API_KEY ? 'Set' : 'NOT SET')"`
2. Restart backend server: `pkill -f "node backend/server.js" && node backend/server.js &`
3. Check backend logs for errors

### If structure looks wrong:
1. Verify you're looking at `analysis.themes` not `analysis.consensus_points`
2. Check the response format matches the expected JSON structure
3. Review backend logs for OpenAI errors

### If test script fails:
1. Ensure all dependencies are installed: `npm install`
2. Check OpenAI API key in `.env`
3. Run with verbose logging: `NODE_DEBUG=* node test-hierarchy.js`

---

## ✅ Success Criteria

**Phase 1 is COMPLETE when:**
1. ✅ `node test-hierarchy.js` runs successfully
2. ✅ Themes are generated with 3-tier structure
3. ✅ Support counts are accurate
4. ✅ Specifics contain numbers/parameters
5. ✅ Output is noticeably richer than before

**Once verified, proceed to Phase 2: Quantitative Data Extraction**

---

## 📞 Quick Reference

**Backend file modified:** `backend/services/analysisService.js`
**Test script:** `test-hierarchy.js`
**API endpoint:** `POST /api/research`
**Response field:** `analysis.themes`

**To restart backend:**
```bash
pkill -f "node backend/server.js"
node backend/server.js &
```

**To test quickly:**
```bash
node test-hierarchy.js
```
