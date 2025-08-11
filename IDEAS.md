# WoW Leaderboard Frontend - Feature Ideas & Implementation Roadmap

## 🎯 Overview

This document outlines realistic, implementable features for the WoW Leaderboard frontend, based on our available API endpoints and database structure. All features are designed to leverage existing data infrastructure and provide genuine value to users.

---

## 🤖 AI Integration Ideas & Roadmap

### 🎯 Goals
- **Differentiate** with explainable, actionable AI insights grounded in our data
- **Stay reliable** via strict JSON schemas, caching, and citations back to periods/runs
- **Be fast/cost‑aware** using trimmed inputs and per-scope caches

### 🚀 Quick Wins (1–2 weeks)
1. **Affix‑Aware Insights**
   - Endpoint: `POST /ai/affix-insights` with `{ seasonId, periodId }`
   - Output: winners/losers this week, dungeon‑specific swaps, callouts by role
   - UI: panel on `AIPredictionsPage`; tooltips in `GroupCompositionPage`
2. **Forecast Overlays**
   - Use `temporalData` to forecast next 2–4 weeks with confidence bands
   - UI: overlay in `MetaEvolutionPage/LineChart.tsx` + mini sparkline on prediction cards
3. **“What Changed This Week” Digest**
   - Summarize shifts in usage/success and composition diversity; flag anomalies
   - Cached per `(seasonId, periodId)` for social preview cards
4. **In‑Place Spec Swap Guidance**
   - Surface trade‑offs for top comp (`survivability`, `utility`, `damage profile`) and safest replacements by role
   - UI: expanders on the most popular comp card in `GroupCompositionPage`
5. **Micro‑Meta Slices**
   - Filtered AI reads: key‑level bands, region, last N periods
   - Endpoints accept filters; AI outputs concise deltas
6. **Grounded Q&A (read‑only)**
   - Endpoint: `POST /ai/qa` returning strict JSON with citations (period IDs, counts)
   - UI: “Ask the Meta” mini chat with preset prompts

### 🧭 Bigger Bets (3–6+ weeks)
1. **Composition Optimizer**
   - Endpoint: `POST /ai/optimizer` with constraints (player spec, dungeon, key level, affixes)
   - Output: ranked comps, rationale, role‑consistent alternatives
2. **Patch Impact Forecaster**
   - Endpoint: `POST /ai/patch-impact` to ingest patch notes and emit expected deltas by spec/role
   - UI: sliders to simulate buffs/nerfs and re‑run forecast
3. **Counter‑Comp Recommender**
   - Alternatives to counter dominant comps or cover common weaknesses per dungeon/affixes
4. **Talent/Build Hints per Dungeon**
   - Mine top runs for common talent/itemization patterns; AI explains the “why”
5. **Alerts/Watchlists**
   - Users follow specs/comps; get weekly AI summaries when thresholds are crossed (email/Discord)
6. **Meta Quality Score**
   - Single score blending diversity, dominance, and replacement flexibility; tracked weekly

### 🧩 Proposed Endpoints & Schemas
```ts
// Affix‑Aware Insights
POST /ai/affix-insights
Body: { seasonId: number, periodId?: number, dungeonId?: number }
Response: {
  summary: string,
  winners: Array<{ specId: number, reason: string, confidence: number }>,
  losers: Array<{ specId: number, reason: string, confidence: number }>,
  dungeonTips?: Array<{ dungeonId: number, tips: string[] }>,
  citations: { periodIds: number[] }
}

// Weekly Digest
POST /ai/weekly-digest
Body: { seasonId: number, periodId: number }
Response: {
  highlights: string[],
  shifts: Array<{ specId: number, deltaUsage: number, deltaSuccess: number }>,
  compositionDiversity: 'High'|'Medium'|'Low',
  anomalies?: string[],
  citations: { periodIds: number[] }
}

// Grounded Q&A
POST /ai/qa
Body: { seasonId: number, question: string, filters?: { region?: string, keyBand?: string, dungeonId?: number } }
Response: {
  answer: string,
  bullets: string[],
  citations: { periodIds: number[], counts?: Record<string, number> }
}

// Composition Optimizer (MVP)
POST /ai/optimizer
Body: { seasonId: number, dungeonId?: number, keyLevel?: number, affixes?: string[], locked?: number[] }
Response: {
  recommended: Array<{ specs: number[], rationale: string, confidence: number }>,
  alternatives: Array<{ replaceSpecId: number, withSpecId: number, rationale: string }>,
  assumptions: string[]
}
```

### 🧠 Prompting & Guardrails
- Strict JSON response with schemas and validation (reuse existing validators)
- Include citations: period IDs and count summaries used in reasoning
- Enforce unique `specId` occurrences and role‑consistent replacements

### 🗄️ Caching & Cost Controls
- Reuse `ai_analysis` with `analysis_type` in: `affix_insights`, `weekly_digest`, `qa`, `optimizer`, `patch_impact`
- Cache keys: `(seasonId, periodId, affixSet, filtersHash)` for 24h; invalidate on new periods
- Trim inputs: cap periods (e.g., last 18), keep top N specs by `totalRuns`, strip unused fields

### 🖥️ Frontend Touchpoints
- `AIPredictionsPage`
  - Affix panel; forecast overlays; cache badges (reusing `_cache`)
- `GroupCompositionPage`
  - “Optimize my comp” modal; in‑place swap guidance with role‑safe suggestions
- `MetaEvolutionPage`
  - Forecast confidence bands; weekly change markers
- Global
  - “Ask the Meta” mini chat; shareable Weekly Digest cards

### 📦 Rollout Order
1) Affix insights + forecast overlays
2) Swap guidance + Weekly Digest
3) Grounded Q&A (MVP)
4) Composition Optimizer (MVP)
5) Patch Impact Forecaster

---

## 📊 Data-Driven Features (High Priority)

### 1. **Advanced Group Composition Analysis**
**Status**: Ready to implement
**Data Sources**: `/meta/top-keys`, `/meta/season-data/`
**Implementation**: 
- Analyze group compositions from existing member data
- Calculate class/spec combinations frequency
- Show success rates by composition type
- Filter by keystone level ranges (15-20, 21-25, 26+)

**API Endpoints Needed**:
```typescript
// New endpoint for composition analysis
GET /meta/composition-analysis?season_id=14&period_id=1001&dungeon_id=247&limit=1000
// Returns: { compositions: [{ classes: [1,2,5], specs: [71,65,258], frequency: 150, avg_score: 245.5 }] }
```

### 2. **Dungeon-Specific Meta Analysis**
**Status**: Ready to implement
**Data Sources**: `/meta/top-keys` with dungeon_id filter
**Implementation**:
- Show which specs perform best in each dungeon
- Analyze dungeon-specific group compositions
- Track dungeon difficulty trends over time
- Compare dungeon meta across different keystone levels

**Current Endpoints**: Already available
```typescript
GET /meta/top-keys?season_id=14&dungeon_id=247&limit=1000
```

### 3. **Keystone Level Performance Analysis**
**Status**: Ready to implement
**Data Sources**: `/meta/top-keys`, database raw queries
**Implementation**:
- Show which specs excel at different keystone levels
- Analyze success rates by level ranges
- Track progression patterns (which specs players use as they push higher)
- Identify "meta breakpoints" where certain specs become viable

**New Endpoint Needed**:
```typescript
GET /meta/keystone-analysis?season_id=14&dungeon_id=247
// Returns: { level_ranges: [{ min: 15, max: 20, specs: [{ spec_id: 71, frequency: 150, avg_score: 245 }] }] }
```

### 4. **Regional Meta Comparison**
**Status**: Ready to implement
**Data Sources**: `/meta/top-keys` with region filtering
**Implementation**:
- Compare meta differences between US, EU, KR, TW
- Show regional preferences and trends
- Identify region-specific meta strategies
- Track how meta spreads across regions

**Current Endpoints**: Available via region parameter
```typescript
GET /meta/top-keys?season_id=14&region=us&limit=1000
GET /meta/top-keys?season_id=14&region=eu&limit=1000
```

### 5. **Temporal Meta Evolution**
**Status**: Ready to implement
**Data Sources**: `/meta/spec-evolution/`, `/meta/season-data/`
**Implementation**:
- Interactive timeline showing meta changes over periods
- Highlight major meta shifts and their causes
- Show gradual vs. sudden meta changes
- Predict future meta trends based on current patterns

**Current Endpoints**: Already available
```typescript
GET /meta/spec-evolution/14
GET /meta/season-data/14
```

---

## 🔍 Advanced Analytics Features (Medium Priority)

### 6. **Spec Synergy Analysis**
**Status**: Requires new endpoint
**Data Sources**: Database raw queries on run_group_member
**Implementation**:
- Analyze which specs work best together
- Show win rates for different spec combinations
- Identify "meta cores" (e.g., "Prot Paladin + Resto Druid" core)
- Calculate synergy scores between specs

**New Endpoint Needed**:
```typescript
GET /meta/spec-synergy?season_id=14&spec_id=71
// Returns: { synergies: [{ partner_spec: 258, frequency: 150, avg_score: 245, synergy_score: 0.85 }] }
```

### 7. **Performance vs. Popularity Analysis**
**Status**: Ready to implement
**Data Sources**: `/meta/top-keys`, `/meta/spec-evolution/`
**Implementation**:
- Compare spec popularity vs. actual performance
- Identify "sleeper" specs (high performance, low popularity)
- Show overrated specs (high popularity, low performance)
- Calculate performance-to-popularity ratios

**Current Endpoints**: Available
```typescript
// Combine data from existing endpoints
GET /meta/top-keys?season_id=14&limit=1000
GET /meta/spec-evolution/14
```

### 8. **Meta Diversity Metrics**
**Status**: Ready to implement
**Data Sources**: `/meta/spec-evolution/`
**Implementation**:
- Calculate meta diversity scores over time
- Show when meta becomes more/less diverse
- Track class representation balance
- Identify periods of meta stagnation vs. innovation

**Current Endpoints**: Already available
```typescript
GET /meta/spec-evolution/14
```

### 9. **Player Progression Analysis**
**Status**: Requires new endpoint
**Data Sources**: Database raw queries on leaderboard_run
**Implementation**:
- Track how players progress through keystone levels
- Show which specs help players push higher
- Analyze progression patterns and bottlenecks
- Identify "gatekeeper" levels where meta changes significantly

**New Endpoint Needed**:
```typescript
GET /meta/progression-analysis?season_id=14&dungeon_id=247
// Returns: { progression_data: [{ level: 20, specs: [{ spec_id: 71, frequency: 150, success_rate: 0.75 }] }] }
```

---

## 🎮 Interactive Features (Medium Priority)

### 10. **Meta Simulator**
**Status**: Ready to implement
**Data Sources**: `/meta/top-keys`, `/meta/spec-evolution/`
**Implementation**:
- Let users simulate "what if" scenarios
- Show how meta would change if certain specs were buffed/nerfed
- Predict impact of balance changes
- Interactive sliders for spec popularity adjustments

**Current Endpoints**: Available
```typescript
GET /meta/spec-evolution/14
GET /meta/top-keys?season_id=14&limit=1000
```

### 11. **Composition Builder**
**Status**: Ready to implement
**Data Sources**: `/meta/top-keys`
**Implementation**:
- Drag-and-drop composition builder
- Show how common user-built compositions are
- Calculate expected performance for custom compositions
- Compare user compositions to meta compositions

**Current Endpoints**: Available
```typescript
GET /meta/top-keys?season_id=14&limit=1000
```

### 12. **Advanced Filtering System**
**Status**: Ready to implement
**Data Sources**: All existing endpoints
**Implementation**:
- Multi-dimensional filtering (region, dungeon, keystone level, period)
- Saved filter presets
- Filter combinations (e.g., "US + High Keys + Recent Periods")
- Export filtered data

**Current Endpoints**: All available
```typescript
GET /meta/top-keys?season_id=14&period_id=1001&dungeon_id=247&region=us&limit=1000
```

---

## 📈 Data Export & Integration Features (Low Priority)

### 13. **Data Export System**
**Status**: Ready to implement
**Data Sources**: All existing endpoints
**Implementation**:
- Export filtered data as CSV/JSON
- Generate meta reports as PDF
- Shareable links for specific analyses
- API access for developers

**Current Endpoints**: All available
```typescript
// Add export parameters to existing endpoints
GET /meta/top-keys?season_id=14&format=csv
GET /meta/spec-evolution/14?format=json
```

### 14. **Meta Report Generator**
**Status**: Ready to implement
**Data Sources**: `/meta/spec-evolution/`, `/meta/season-data/`
**Implementation**:
- Generate comprehensive meta reports
- Include charts, statistics, and predictions
- PDF export with professional formatting
- Scheduled report generation

**Current Endpoints**: Already available
```typescript
GET /meta/spec-evolution/14
GET /meta/season-data/14
```

### 15. **API Documentation & Developer Tools**
**Status**: Ready to implement
**Data Sources**: All existing endpoints
**Implementation**:
- Interactive API documentation
- Query builder for complex requests
- Rate limit monitoring
- Usage analytics for API consumers

**Current Endpoints**: All available
```typescript
// Add documentation endpoints
GET /api/docs
GET /api/rate-limits
GET /api/usage-stats
```

---

## 🎨 User Experience Enhancements (Low Priority)

### 16. **Advanced Visualizations**
**Status**: Ready to implement
**Data Sources**: All existing endpoints
**Implementation**:
- Interactive charts and graphs
- Heatmaps for spec popularity
- Timeline visualizations for meta evolution
- 3D visualizations for complex data relationships

**Current Endpoints**: All available
```typescript
// Use existing endpoints with enhanced frontend visualization
GET /meta/spec-evolution/14
GET /meta/top-keys?season_id=14&limit=1000
```

### 17. **Mobile Optimization**
**Status**: Ready to implement
**Data Sources**: All existing endpoints
**Implementation**:
- Responsive design improvements
- Touch-friendly interactions
- Mobile-specific data views
- Offline data caching

**Current Endpoints**: All available
```typescript
// Optimize existing endpoints for mobile
GET /meta/top-keys?season_id=14&limit=50 // Smaller datasets for mobile
```

### 18. **Theme System**
**Status**: Ready to implement
**Data Sources**: N/A (Frontend only)
**Implementation**:
- Dark/light theme toggle
- Custom color schemes
- Accessibility improvements
- User preference persistence

**Current Endpoints**: N/A

---

## 🚀 Implementation Priority Matrix

### High Priority (Immediate Impact)
1. **Advanced Group Composition Analysis** - Uses existing data, high user value
2. **Dungeon-Specific Meta Analysis** - Ready to implement, clear use case
3. **Temporal Meta Evolution** - Uses existing endpoints, great visualization potential
4. **Regional Meta Comparison** - Easy to implement, interesting insights

### Medium Priority (Significant Value)
5. **Spec Synergy Analysis** - Requires new endpoint but high value
6. **Performance vs. Popularity Analysis** - Uses existing data, unique insights
7. **Meta Simulator** - Interactive, engaging feature
8. **Advanced Filtering System** - Improves existing functionality

### Low Priority (Nice to Have)
9. **Data Export System** - Useful for power users
10. **Advanced Visualizations** - Enhances user experience
11. **Mobile Optimization** - Improves accessibility
12. **Theme System** - Quality of life improvement

---

## 📋 Technical Implementation Notes

### Database Queries Needed
```sql
-- For composition analysis
SELECT 
  array_agg(DISTINCT spec_id ORDER BY spec_id) as composition,
  COUNT(*) as frequency,
  AVG(score) as avg_score
FROM run_group_member rgm
JOIN leaderboard_run lr ON rgm.run_guid = lr.run_guid
WHERE lr.season_id = $1 AND lr.period_id = $2
GROUP BY composition
ORDER BY frequency DESC;

-- For spec synergy analysis
SELECT 
  spec1.spec_id as spec1_id,
  spec2.spec_id as spec2_id,
  COUNT(*) as co_occurrence,
  AVG(lr.score) as avg_score
FROM run_group_member spec1
JOIN run_group_member spec2 ON spec1.run_guid = spec2.run_guid AND spec1.spec_id < spec2.spec_id
JOIN leaderboard_run lr ON spec1.run_guid = lr.run_guid
WHERE lr.season_id = $1
GROUP BY spec1.spec_id, spec2.spec_id
ORDER BY co_occurrence DESC;
```

### New API Endpoints to Create
1. `/meta/composition-analysis` - Group composition statistics
2. `/meta/spec-synergy` - Spec combination analysis
3. `/meta/keystone-analysis` - Level-specific performance data
4. `/meta/progression-analysis` - Player progression patterns

### Frontend Technologies
- **Charts**: Chart.js or D3.js for advanced visualizations
- **State Management**: React Query for efficient data fetching
- **UI Components**: Material-UI or Ant Design for consistent design
- **Data Processing**: Lodash for efficient data manipulation

---

## 🎯 Success Metrics

### User Engagement
- Time spent on analysis pages
- Number of filter combinations used
- Export/download frequency
- Return user rate

### Technical Performance
- API response times under 500ms
- Page load times under 2 seconds
- 99.9% uptime for API endpoints
- Mobile performance scores > 90

### Data Quality
- Cross-validation accuracy > 85%
- Prediction accuracy > 80%
- Data freshness (updated within 24 hours)
- API rate limit compliance

---

## 📝 Notes

- All features are designed to work with existing data infrastructure
- New endpoints can be implemented incrementally
- Frontend features can be built in parallel with backend development
- Priority is based on user value and implementation complexity
- All features include proper error handling and loading states 