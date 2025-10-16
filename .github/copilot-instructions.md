# Copilot Instructions - What the Meta Frontend

## Project Overview
React 19/TypeScript SPA for the What the Meta WoW Mythic+ leaderboard platform. Provides real-time leaderboards, group composition analysis, meta evolution tracking, and AI-powered insights.

**Live**: https://www.whatthemeta.io | **Deployed on**: Vercel

## Architecture

### Performance-First Design
- **Route-level code splitting**: All pages lazy-loaded via `React.lazy()` + `<Suspense>` (see `App.tsx`)
- **Progressive loading**: HomePage loads 250 rows initially, fetches more on scroll/demand
- **Web Workers**: Heavy processing (composition analysis, data aggregation) runs in background threads
- **Optimized images**: Social images auto-converted to AVIF via `scripts/optimize-social-images.mjs`

### Data Flow
1. **API calls** centralized in `src/services/api.ts` (never call backend directly from components)
2. **State management** via React Context (FilterContext) + local component state
3. **Web Workers** for CPU-intensive operations (see `public/composition-worker.js`)
4. **Type safety** enforced via `src/types/api.ts` for all backend responses

### Web Worker Pattern
```typescript
// GroupCompositionPage/index.tsx
const workerRef = useRef<Worker | null>(null);

// Create worker
workerRef.current = new Worker('/composition-worker.js');
workerRef.current.postMessage({ runs, filters });

// Handle response
workerRef.current.onmessage = (event) => {
  const { compositions, error } = event.data;
  setCompositions(compositions);
};

// CRITICAL: Always terminate in cleanup
useEffect(() => {
  return () => {
    if (workerRef.current) {
      workerRef.current.terminate();
    }
  };
}, []);
```

## Critical Developer Workflows

### Local Development
```bash
# Start Vite dev server
npm run dev  # http://localhost:5173

# Point to local backend (edit .env)
VITE_API_BASE_URL=http://localhost:3000

# Point to production backend
VITE_API_BASE_URL=https://what-the-meta-backend.onrender.com
```

### Production Build
```bash
# 1. Optimize images (runs automatically in prebuild)
npm run optimize:images

# 2. TypeScript check + Vite build
npm run build  # Outputs to dist/

# 3. Preview build locally
npm run preview  # http://localhost:4173
```

### Debugging Web Workers
```bash
# Enable debug features in .env
VITE_ENABLE_TESTING_FEATURES=true
VITE_DEBUG=true

# Check browser console for worker logs:
# ✅ [timestamp] Worker processing complete
# ❌ [timestamp] Worker error: ...
```

## Project-Specific Conventions

### API Call Pattern
```typescript
// ALWAYS use src/services/api.ts, NEVER fetch directly
import { fetchTopKeys, fetchSeasonInfo } from '../services/api';

// Handle loading/error states
const [data, setData] = useState<MythicKeystoneRun[] | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const result = await fetchTopKeys({ season_id: 14 });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

### Lazy Loading Pattern
```typescript
// App.tsx - ALL pages must be lazy-loaded
const MetaEvolutionPage = React.lazy(() => 
  import('./components/MetaEvolutionPage/index').then(m => ({ default: m.MetaEvolutionPage }))
);

// Use Suspense with loading fallback
<Suspense fallback={<LoadingScreen />}>
  <Routes>
    <Route path="/meta-evolution" element={<MetaEvolutionPage />} />
  </Routes>
</Suspense>
```

### Web Worker Usage Guidelines
**When to use Web Workers:**
- Operations taking >100ms (composition analysis, large data sorting)
- Heavy array manipulations (filtering 1000+ runs)
- Data aggregations (group by spec, calculate percentages)

**When NOT to use:**
- Simple state updates
- API calls (use async/await in main thread)
- DOM manipulation (workers have no DOM access)

### Tailwind CSS Patterns
```typescript
// ✅ GOOD: Use utility classes
<div className="flex items-center gap-4 p-6 bg-gray-800 rounded-lg">

// ⚠️ USE SPARINGLY: @apply in CSS files
// Only for complex, reusable component patterns
.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700;
}

// ❌ BAD: Inline styles (loses Tailwind benefits)
<div style={{ padding: '24px', backgroundColor: '#1f2937' }}>
```

### TypeScript Strict Mode
```typescript
// All API responses must be typed (see src/types/api.ts)
interface MythicKeystoneRun {
  completed_at: string;
  keystone_level: number;
  score: number;
  dungeon_name: string;
  // ... full type definition required
}

// Use type guards for runtime safety
function isMythicRun(data: unknown): data is MythicKeystoneRun {
  return typeof data === 'object' && data !== null && 'score' in data;
}
```

## Environment Variables

### Required
```bash
# Backend API endpoint
VITE_API_BASE_URL=https://what-the-meta-backend.onrender.com  # Production
VITE_API_BASE_URL=http://localhost:3000  # Development

# Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Google Analytics ID
```

### Optional
```bash
# Testing/debugging features
VITE_ENABLE_TESTING_FEATURES=true  # Enables force refresh buttons, debug logs
VITE_DEBUG=true  # Verbose console logging

# Charts implementation (experimental)
VITE_CHARTS_IMPL=recharts  # Options: recharts (default), rosen
```

## Deployment

### Vercel Setup
1. **Git push** to `develop` branch → auto-deploy to preview
2. **PR merge** to `release` branch → auto-deploy to production (whatthemeta.io)
3. **Environment variables**: Set in Vercel dashboard (Project Settings → Environment Variables)
4. **Build command**: `npm run build` (runs `prebuild` → `tsc -b` → `vite build`)
5. **Output directory**: `dist/`

### Pre-deployment Checklist
- [ ] Run `npm run build` locally to catch TypeScript errors
- [ ] Test with production API (`VITE_API_BASE_URL=https://what-the-meta-backend.onrender.com`)
- [ ] Check browser console for worker errors
- [ ] Verify social images optimized (run `npm run optimize:images` if needed)
- [ ] Set `VITE_ENABLE_TESTING_FEATURES=false` in Vercel production env

## Backend Integration

### API Endpoints Used
```typescript
// src/services/api.ts centralizes all backend calls
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Top keys (leaderboard)
GET ${API_BASE}/meta/top-keys?season_id=14&limit=1000

// Spec evolution (meta trends)
GET ${API_BASE}/meta/spec-evolution/14

// Group compositions
GET ${API_BASE}/meta/top-keys?season_id=14&period_id=1018

// AI predictions
GET ${API_BASE}/ai/predictions/14

// RaiderIO cutoffs
GET ${API_BASE}/raiderio/cutoffs/us
```

### Type Synchronization
- **No shared types** with backend—manually update `src/types/api.ts` when backend schema changes
- **Breaking changes**: Coordinate with backend developer before deploying incompatible changes
- **Versioning**: Not implemented—use feature flags if needed

## Common Gotchas

1. **Worker termination**: Always call `workerRef.current.terminate()` in cleanup or you'll leak memory
2. **TypeScript build**: `tsc -b` runs BEFORE Vite build—fix type errors first
3. **Lazy loading**: Heavy components (charts, tables) MUST be lazy-loaded or initial bundle size explodes
4. **API base URL**: Check `.env` file—wrong URL = all API calls fail silently in dev
5. **Progressive loading**: HomePage initial load = 250 rows. Fetch more via `loadMore()` function
6. **Image optimization**: Run `npm run prebuild` or `npm run optimize:images` before deployment

## Testing & Debugging

### Browser Console Checks
```javascript
// Check API base URL
console.log(import.meta.env.VITE_API_BASE_URL);

// Monitor worker messages
// Look for: ✅ [timestamp] Worker processing complete
// Or errors: ❌ [timestamp] Worker error: ...

// Check if testing features enabled
console.log(import.meta.env.VITE_ENABLE_TESTING_FEATURES);
```

### Performance Profiling
1. Open Chrome DevTools → Performance tab
2. Start recording, interact with app
3. Look for long tasks (>50ms) → candidates for Web Workers
4. Check bundle size: `npm run build` shows chunk sizes

### Common Errors
- **"Failed to fetch"**: Check `VITE_API_BASE_URL` in `.env`
- **"Worker error"**: Check browser console for stack trace (prefixed with ❌)
- **"Module not found"**: Verify import paths use `./` or `../` for relative imports
- **Type errors**: Run `tsc -b` to see detailed TypeScript errors

## Key Files

- **`src/App.tsx`**: Main routing, lazy-loaded page components
- **`src/services/api.ts`**: Centralized backend API calls
- **`src/types/api.ts`**: TypeScript interfaces for all API responses
- **`src/components/HomePage.tsx`**: Progressive loading pattern (representative)
- **`src/components/GroupCompositionPage/index.tsx`**: Web Worker usage pattern
- **`public/composition-worker.js`**: Heavy composition processing (background thread)
- **`scripts/optimize-social-images.mjs`**: Auto-converts images to AVIF
- **`vite.config.ts`**: Build configuration (chunk size limits)
- **`env.example`**: Environment variable template

## Documentation
- `README.md`: Feature overview, tech stack, deployment
- `IDEAS.md`: Future feature ideas and improvements

---

**When suggesting changes**: Preserve Web Worker patterns, maintain lazy loading for heavy components, and always use the centralized API client. Never fetch backend directly from components. Verify TypeScript types before building.
