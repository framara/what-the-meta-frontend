# Frontend Improvement Plan

**Generated**: 2025-10-13  
**Last Updated**: 2025-10-16 (Priority 3 Complete)  
**Status**: Priority 1-3 Complete ✅ | Priority 4 Pending  
**Total Effort Completed**: ~14 hours (Priority 1-3)

---

## 📊 Completion Summary

### ✅ Completed (Priority 1, 2 & 3)

**Files Created**:
- `src/utils/logger.ts` - Environment-aware logging
- `src/utils/cache.ts` - Generic LRUCache with TTL support
- `src/utils/apiError.ts` - Consistent error handling
- `src/constants/performance.ts` - Performance tuning constants
- `src/constants/ui.ts` - UI layout constants
- `src/services/cacheService.ts` - Unified cache management

**Files Modified**:
- `src/components/HomePage.tsx` - AbortController + ToastModule types
- `src/components/GroupCompositionPage/index.tsx` - Worker cleanup + atomic IDs
- `src/services/api.ts` - CacheService integration + AbortSignal support
- `src/services/aiService.ts` - Logger integration
- `src/components/MetaEvolutionPage/components/CustomTooltip.tsx` - Proper type safety
- `src/components/RaceBarsPage/RaceBarsPage.tsx` - Removed unnecessary useMemo

**Build Status**: ✅ Zero TypeScript errors | Build time: 3.78s

**Key Achievements**:
- ✅ Eliminated memory leaks (worker cleanup)
- ✅ Fixed race conditions (AbortController, atomic IDs)
- ✅ Bounded cache memory (LRUCache with TTL + CacheService)
- ✅ Standardized error handling (ApiError class)
- ✅ Fixed console AbortError logging (ERR_CANCELED detection)
- ✅ Improved type safety (removed `any` types)
- ✅ Self-documenting constants (no more magic numbers)
- ✅ Cleaner code (removed unnecessary useMemo)
- ✅ DRY principle (unified CacheService)

### ⏳ Remaining Work

**Priority 4 (Technical Debt)**: ~2 hours
- Enable strict TypeScript checks (`noUnusedLocals`, `noUnusedParameters`)
- Add unit tests for critical utilities (optional)

---

## ✅ Priority 1: Critical Fixes (Day 1 - ~4 hours) - COMPLETE

### 1.1 Memory Leak: Worker Cleanup Missing
**File**: `src/components/GroupCompositionPage/index.tsx`  
**Line**: ~236  
**Issue**: Worker is terminated on filter change but never on component unmount, causing memory leaks.

**Current Code**:
```tsx
const startCompositionWorker = useCallback(() => {
  if (workerRef.current) {
    try { workerRef.current.terminate(); } catch { /* no-op */ }
  }
  workerRef.current = new Worker('/composition-worker.js');
  // ...
}, []);
```

**Fix**:
```tsx
// Add cleanup effect
useEffect(() => {
  return () => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  };
}, []);
```

**Impact**: Prevents memory leaks on navigation, especially important for users browsing multiple pages.

---

### 1.2 Race Condition: HomePage Progressive Loading
**File**: `src/components/HomePage.tsx`  
**Lines**: 50-113  
**Issue**: `cancelled` flag doesn't abort in-flight API requests. Rapid filter changes cause overlapping requests.

**Current Code**:
```tsx
useEffect(() => {
  let cancelled = false;
  
  (async () => {
    const firstBatchResponse = await fetchTopKeys({ ...baseParams, limit: initialLimit });
    if (cancelled) return; // Too late, request already completed
    // ...
  })();
  
  return () => { cancelled = true; };
}, [filter.season_id, ...]);
```

**Fix**:
```tsx
useEffect(() => {
  const abortController = new AbortController();
  
  (async () => {
    try {
      const firstBatchResponse = await fetchTopKeys(
        { ...baseParams, limit: initialLimit },
        { signal: abortController.signal } // Pass abort signal
      );
      setApiData(firstBatchResponse.data);
      // ...
    } catch (err: any) {
      if (err.name === 'AbortError') return; // Expected cancellation
      setApiError(err?.message || 'API error');
    }
  })();
  
  return () => abortController.abort();
}, [filter.season_id, ...]);
```

**Additional Changes Required**:
- Update `src/services/api.ts` `fetchTopKeys` to accept `options?: { signal?: AbortSignal }`
- Pass signal to axios: `axios.get(url, { signal: options?.signal })`

**Impact**: Prevents stale data from overwriting current results, reduces unnecessary API load.

---

### 1.3 Production Performance: Excessive Console Logging
**Files**: `src/services/api.ts`, `src/services/aiService.ts`  
**Issue**: 30+ `console.log` statements run in production, impacting performance and exposing internals.

**Step 1: Create Logger Utility**
```typescript
// src/utils/logger.ts
const isDev = import.meta.env.DEV;
const isDebug = import.meta.env.VITE_DEBUG === 'true';

export const logger = {
  log: (...args: any[]) => {
    if (isDev || isDebug) console.log(...args);
  },
  info: (...args: any[]) => {
    if (isDev || isDebug) console.info(...args);
  },
  warn: console.warn.bind(console), // Always log warnings
  error: console.error.bind(console), // Always log errors
};
```

**Step 2: Replace Imports**
```typescript
// In api.ts, aiService.ts
import { logger } from '../utils/logger';

// Replace:
console.log('API: fetchTopKeys executing request:', url);
// With:
logger.log('API: fetchTopKeys executing request:', url);
```

**Files to Update**:
- `src/services/api.ts` (~15 instances)
- `src/services/aiService.ts` (~15 instances)

**Impact**: Reduces bundle size, improves runtime performance, prevents information leakage in production.

---

## ✅ Priority 2: High-Impact Improvements (Day 2 - ~6 hours) - COMPLETE

### 2.1 Worker Race Condition: Request ID Collision
**File**: `src/components/GroupCompositionPage/index.tsx`  
**Lines**: 224-298  
**Issue**: `requestId` uses `Date.now()` + random, but if filters change during worker creation, IDs can collide.

**Current Code**:
```tsx
const startCompositionWorker = useCallback(() => {
  const requestId = `${filter.season_id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  lastRequestIdRef.current = requestId;
  
  workerRef.current.onmessage = (event: MessageEvent) => {
    if (data.requestId && data.requestId !== lastRequestIdRef.current) return;
    // ...
  };
}, []);
```

**Fix**:
```tsx
// At component level
const requestIdCounter = useRef(0);

const startCompositionWorker = useCallback(() => {
  const requestId = ++requestIdCounter.current; // Atomic increment
  
  if (workerRef.current) {
    workerRef.current.terminate();
  }
  workerRef.current = new Worker('/composition-worker.js');
  
  workerRef.current.onmessage = (event: MessageEvent) => {
    if (event.data.requestId !== requestId) return; // Compare with local requestId
    // ... process message
  };
  
  workerRef.current.postMessage({ requestId, ...data });
}, [filter.season_id, ...]);
```

**Impact**: Eliminates race conditions in worker communication, ensures messages from old workers are ignored.

---

### 2.2 API Cache: No Size Limit (Memory Leak)
**File**: `src/services/api.ts`  
**Lines**: 15-35  
**Issue**: Unbounded cache grows indefinitely, no LRU eviction.

**Step 1: Create LRU Cache**
```typescript
// src/utils/cache.ts
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;
  private readonly ttl: number;
  
  constructor(maxSize = 50, ttl = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Move to end (LRU update)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }
  
  set(key: string, data: T): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.delete(key); // Remove if exists
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
}
```

**Step 2: Replace Cache Implementation**
```typescript
// In api.ts
import { LRUCache } from '../utils/cache';

const seasonsCache = new LRUCache<Season[]>(10, 5 * 60 * 1000);
const seasonInfoCache = new LRUCache<SeasonInfo>(20, 5 * 60 * 1000);

export async function fetchSeasons(): Promise<Season[]> {
  const cached = seasonsCache.get('all');
  if (cached) {
    logger.log('API: fetchSeasons cache hit');
    return cached;
  }
  
  const url = `${API_BASE_URL}/meta/seasons`;
  const response = await axios.get(url);
  seasonsCache.set('all', response.data);
  return response.data;
}
```

**Impact**: Prevents unbounded memory growth, improves cache hit rate via LRU eviction.

---

### 2.3 Error Handling: Inconsistent Error Objects
**File**: `src/services/api.ts`  
**Lines**: 40-51  
**Issue**: Axios errors have different structures (network vs response errors), components receive inconsistent data.

**Step 1: Create Error Class**
```typescript
// src/utils/apiError.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
  
  static fromAxiosError(error: any): ApiError {
    if (axios.isAxiosError(error)) {
      return new ApiError(
        error.response?.data?.message || error.message,
        error.response?.status,
        error.code,
        error
      );
    }
    return new ApiError('Network error', undefined, 'NETWORK_ERROR', error);
  }
}
```

**Step 2: Update apiRequest**
```typescript
import { ApiError } from '../utils/apiError';

async function apiRequest<T>(url: string, method = 'GET', config = {}): Promise<T> {
  try {
    const response = await axios.request<T>({ url, method, ...config });
    return response.data;
  } catch (error) {
    throw ApiError.fromAxiosError(error);
  }
}
```

**Step 3: Update Error Handling in Components**
```typescript
// In HomePage.tsx, etc.
try {
  const data = await fetchTopKeys(params);
  setApiData(data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      setApiError('No data available for this season');
    } else if (error.status === 429) {
      setApiError('Rate limit exceeded, please try again later');
    } else {
      setApiError(error.message);
    }
  } else {
    setApiError('An unexpected error occurred');
  }
}
```

**Impact**: Consistent error handling across app, better user feedback, easier debugging.

---

### 2.4 AbortSignal Support in API Client
**File**: `src/services/api.ts`  
**Issue**: No way to cancel pending requests when component unmounts or filters change.

**Update All API Functions**:
```typescript
export async function fetchTopKeys(
  params: TopKeyParams,
  options?: { signal?: AbortSignal }
): Promise<TopKeysResponse> {
  const requestKey = `top-keys-${JSON.stringify(params)}`;
  
  return deduplicateRequest(requestKey, async () => {
    const searchParams = new URLSearchParams();
    searchParams.append('season_id', params.season_id.toString());
    // ... other params
    
    const url = `${API_BASE_URL}/meta/top-keys?${searchParams.toString()}`;
    
    const data = await apiRequest<TopKeysResponse>(url, 'GET', { 
      timeout: 10000,
      signal: options?.signal, // Pass abort signal
    });
    
    return data;
  });
}

// Repeat for: fetchSeasons, fetchSeasonInfo, fetchCompositionData, etc.
```

**Impact**: Prevents memory leaks, reduces unnecessary network traffic, improves UX during rapid navigation.

---

## 🎯 Priority 3: Code Quality (Day 3 - ~4 hours) - COMPLETE

### 3.1 Type Safety: Replace `any` Types
**Files**: Multiple (20+ instances)  
**Estimated Time**: 3 hours

**Key Areas**:

**A) react-hot-toast Dynamic Import** (`HomePage.tsx:73`)
```typescript
// Create type definition
interface ToastFn {
  (message: string, options?: { id?: string }): void;
  success?: (message: string, options?: { id?: string }) => void;
  dismiss?: (id?: string) => void;
}

interface ToastModule {
  default?: ToastFn;
  toast?: ToastFn;
}

// Usage
const m = await import('react-hot-toast') as ToastModule;
const toast: ToastFn = m.default || m.toast || (() => {});
if (toast.success) {
  toast.success(`Message`, { id: 'season-fallback' });
}
```

**B) Recharts Tooltip Props** (`MetaEvolutionPage/components/CustomTooltip.tsx:12`)
```typescript
import { TooltipProps } from 'recharts';

interface CustomTooltipProps extends TooltipProps<number, string> {
  percent?: boolean;
  hoveredSpecId?: number;
  showOnlyHovered?: boolean;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = (props) => {
  const { active, payload, label, percent, hoveredSpecId, showOnlyHovered } = props;
  // ... properly typed
};
```

**C) Racing Bars Instance** (`RaceBarsPage.tsx:21`)
```typescript
// Define racer type based on racing-bars library
import type { Racer } from 'racing-bars'; // If available

const [racerInstance, setRacerInstance] = useState<Racer | null>(null);
```

**Impact**: Better autocomplete, catches bugs at compile time, improved maintainability.

---

### 3.2 Extract Magic Numbers to Constants
**Files**: Multiple  
**Estimated Time**: 30 minutes

**Create Constants File**:
```typescript
// src/constants/performance.ts
export const PERFORMANCE = {
  // HomePage progressive loading
  INITIAL_PAGE_SIZE: 250, // Optimal for First Contentful Paint on all devices
  DEFAULT_PAGE_LIMIT: 1000,
  
  // API timeouts
  API_TIMEOUT_MS: 10000, // 10 seconds (backend max response time)
  
  // Cache settings
  API_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
  API_CACHE_MAX_SIZE: 50, // Max cached endpoints
  
  // Worker progress
  WORKER_PROGRESS_THROTTLE_MS: 100, // ~10 updates/second
  WORKER_PROGRESS_MIN_INTERVAL_MS: 100,
} as const;

// src/constants/ui.ts
export const UI = {
  MOBILE_BREAKPOINT: 768, // px
  SCROLL_THRESHOLD: 300, // px for scroll-to-top button
} as const;
```

**Replace Throughout Codebase**:
```typescript
// Before:
const maxInitial = 250;

// After:
import { PERFORMANCE } from '@/constants/performance';
const maxInitial = PERFORMANCE.INITIAL_PAGE_SIZE;
```

**Impact**: Self-documenting code, easier to tune performance, consistent values across app.

---

### 3.3 Remove Unnecessary `useMemo`
**File**: `src/components/RaceBarsPage/RaceBarsPage.tsx`  
**Lines**: 76-82  
**Estimated Time**: 15 minutes

**Remove These**:
```typescript
// ❌ Bad: useMemo for simple boolean
const shouldShowLoading = useMemo(() => raceBarsData.loading, [raceBarsData.loading]);
const hasError = useMemo(() => !!raceBarsData.error, [raceBarsData.error]);
const hasNoPeriods = useMemo(() => raceBarsData.periods.length === 0, [raceBarsData.periods.length]);

// ✅ Good: Direct access
const shouldShowLoading = raceBarsData.loading;
const hasError = !!raceBarsData.error;
const hasNoPeriods = raceBarsData.periods.length === 0;
```

**Keep These** (complex computations):
```typescript
// ✅ Good: useMemo for complex JSX/filtering
const pageHeaderContent = useMemo(() => (
  <div className="...">{/* complex JSX */}</div>
), [dependencies]);

const filteredData = useMemo(() => 
  data.filter(item => /* expensive filtering */), 
  [data, filters]
);
```

**Impact**: Slight performance improvement, cleaner code, less memory overhead.

---

### 3.4 Unified Cache Service
**Files**: `src/services/api.ts`  
**Estimated Time**: 2 hours

**Create Generic Cache Service**:
```typescript
// src/services/cacheService.ts
import { LRUCache } from '../utils/cache';

class CacheService {
  private caches = new Map<string, LRUCache<any>>();
  
  private getCache<T>(namespace: string): LRUCache<T> {
    if (!this.caches.has(namespace)) {
      this.caches.set(namespace, new LRUCache<T>(50, 5 * 60 * 1000));
    }
    return this.caches.get(namespace)!;
  }
  
  async getOrFetch<T>(
    namespace: string,
    key: string,
    fetchFn: () => Promise<T>,
    options: { ttl?: number; bypassCache?: boolean } = {}
  ): Promise<T> {
    const cache = this.getCache<T>(namespace);
    
    if (!options.bypassCache) {
      const cached = cache.get(key);
      if (cached !== null) {
        logger.log(`Cache hit: ${namespace}:${key}`);
        return cached;
      }
    }
    
    logger.log(`Cache miss: ${namespace}:${key}`);
    const data = await fetchFn();
    cache.set(key, data);
    return data;
  }
  
  invalidate(namespace: string, key?: string): void {
    const cache = this.getCache(namespace);
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }
}

export const cacheService = new CacheService();
```

**Refactor API Functions**:
```typescript
export async function fetchSeasons(): Promise<Season[]> {
  return cacheService.getOrFetch(
    'seasons',
    'all',
    async () => {
      const response = await axios.get(`${API_BASE_URL}/meta/seasons`);
      return response.data;
    }
  );
}

export async function fetchSeasonInfo(seasonId: number): Promise<SeasonInfo> {
  return cacheService.getOrFetch(
    'season-info',
    String(seasonId),
    async () => {
      const response = await axios.get(`${API_BASE_URL}/meta/season-info/${seasonId}`);
      return response.data;
    }
  );
}
```

**Impact**: DRY principle, consistent caching behavior, easier to debug cache issues.

---

## 🔧 Priority 4: Technical Debt (Day 4 - ~2 hours)

### 4.1 Enable TypeScript Strict Checks
**File**: `tsconfig.app.json`  
**Current**:
```jsonc
"noUnusedLocals": false,
"noUnusedParameters": false,
```

**Approach**: Gradual migration
```jsonc
{
  "compilerOptions": {
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    // For legacy code, use per-file overrides:
    // // @ts-expect-error TS6133: unused variable
  }
}
```

**Process**:
1. Enable in `tsconfig.app.json`
2. Run `npm run build` to find violations
3. Fix new files immediately
4. Add `// @ts-expect-error` comments to legacy violations
5. Schedule cleanup sprints

**Impact**: Catches dead code, improves code quality, reduces bundle size.

---

### 4.2 Add Unit Tests for Critical Paths
**Estimated Time**: 4 hours (out of scope for this plan)

**Key Test Targets**:
- `src/utils/cache.ts` (LRU Cache)
- `src/utils/apiError.ts` (Error normalization)
- `src/utils/logger.ts` (Logger conditionals)
- `src/services/api.ts` (Request deduplication)

**Setup**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Example Test**:
```typescript
// src/utils/cache.test.ts
import { describe, it, expect, vi } from 'vitest';
import { LRUCache } from './cache';

describe('LRUCache', () => {
  it('evicts oldest entry when at capacity', () => {
    const cache = new LRUCache<string>(2, 60000);
    cache.set('a', 'value-a');
    cache.set('b', 'value-b');
    cache.set('c', 'value-c'); // Should evict 'a'
    
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBe('value-b');
    expect(cache.get('c')).toBe('value-c');
  });
  
  it('respects TTL expiration', async () => {
    vi.useFakeTimers();
    const cache = new LRUCache<string>(10, 1000); // 1 second TTL
    cache.set('key', 'value');
    
    expect(cache.get('key')).toBe('value');
    
    vi.advanceTimersByTime(1001); // Advance past TTL
    expect(cache.get('key')).toBeNull();
    
    vi.useRealTimers();
  });
});
```

---

## 📋 Implementation Checklist

### Day 1: Critical Fixes ✅ COMPLETE
- [x] 1.1 Add worker cleanup effect in GroupCompositionPage
- [x] 1.2 Implement AbortController in HomePage
- [x] 1.2 Add AbortSignal support to `fetchTopKeys` in api.ts
- [x] 1.3 Create logger utility (`src/utils/logger.ts`)
- [x] 1.3 Replace console.log in api.ts (~20 instances) - **19 logger calls**
- [x] 1.3 Replace console.log in aiService.ts (~15 instances) - **18 logger calls**
- [x] Test: Navigate between pages rapidly, check for memory leaks in DevTools
- [x] Test: Change filters rapidly on HomePage, verify no stale data

### Day 2: High-Impact Improvements ✅ COMPLETE
- [x] 2.1 Fix worker request ID using atomic counter
- [x] 2.2 Create LRUCache class (`src/utils/cache.ts`)
- [x] 2.2 Replace cache implementations in api.ts
- [x] 2.3 Create ApiError class (`src/utils/apiError.ts`)
- [x] 2.3 Update apiRequest error handling
- [x] 2.3 Update error handling in HomePage, GroupCompositionPage
- [x] 2.4 Add AbortSignal support to remaining API functions
- [x] 2.4 Fix AbortError console logging detection for ERR_CANCELED code
- [x] Test: Check cache eviction with DevTools Memory profiler
- [x] Test: Verify consistent error messages across different error types
- [x] Build verification: Zero TypeScript errors

### Day 3: Code Quality ✅ COMPLETE
- [x] 3.1 Define ToastModule interface, update HomePage.tsx
- [x] 3.1 Define CustomTooltipProps, update CustomTooltip.tsx
- [x] 3.1 Define Racer type (using unknown, safer than any), RaceBarsPage.tsx
- [x] 3.2 Create constants files (performance.ts, ui.ts)
- [x] 3.2 Extract magic numbers: INITIAL_PAGE_SIZE, API_TIMEOUT_MS, cache TTLs, etc.
- [x] 3.3 Remove unnecessary useMemo in RaceBarsPage (3 simple booleans removed)
- [x] 3.4 Create CacheService (`src/services/cacheService.ts`)
- [x] 3.4 Refactor api.ts to use CacheService (fetchSeasons, fetchSeasonInfo, fetchCompositionData, fetchSpecEvolution)
- [x] Test: Run `npm run build`, verified zero type errors
- [x] Test: Verified cache behavior unchanged after refactor

### Day 4: Technical Debt ⏳ PENDING
- [ ] 4.1 Enable `noUnusedLocals` and `noUnusedParameters` in tsconfig
- [ ] 4.1 Run build, document violations
- [ ] 4.1 Add `@ts-expect-error` comments to legacy code
- [ ] 4.1 Fix violations in new/modified files
- [ ] (Optional) 4.2 Set up Vitest for unit testing
- [ ] (Optional) 4.2 Write tests for LRUCache, ApiError, logger

---

## 🧪 Testing Strategy

### Manual Testing
1. **Memory Leaks**: Chrome DevTools → Performance Monitor
   - Navigate between pages 10 times
   - Check JS Heap size (should stabilize)
   - Check DOM Nodes (should not grow unbounded)

2. **Race Conditions**: Network tab + Console
   - Change filters rapidly (5+ times in 2 seconds)
   - Verify only latest request's data is displayed
   - Check for "Aborted" requests in Network tab

3. **Error Handling**: Simulate errors
   - Disconnect network → verify error message
   - Set VITE_API_BASE_URL to invalid URL → verify fallback
   - Trigger 429 rate limit → verify appropriate message

### Automated Testing (Future)
- Unit tests for LRUCache eviction logic
- Integration tests for API error normalization
- E2E tests for critical user flows (homepage → composition page)

---

## 📊 Expected Outcomes

**Performance**:
- 15-20% reduction in memory usage (worker cleanup + cache limits)
- 30-40% reduction in console overhead in production (logger)
- Faster filter changes (AbortController cancels stale requests)

**Code Quality**:
- ~200 fewer type errors with proper interfaces
- More maintainable caching logic (unified service)
- Self-documenting constants instead of magic numbers

**User Experience**:
- No more stale data from rapid filter changes
- Consistent, helpful error messages
- Smoother navigation (no memory leaks)

---

## 🔗 Resources

- [MDN: AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [React: useEffect cleanup](https://react.dev/reference/react/useEffect#parameters)
- [TypeScript: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Chrome DevTools: Memory profiling](https://developer.chrome.com/docs/devtools/memory-problems/)

---

**Notes**:
- Create feature branch: `git checkout -b improvements/frontend-optimization`
- Commit after each priority section
- Test thoroughly before merging to develop
- Consider splitting into multiple PRs if too large

Good luck! 🚀
