/**
 * Performance-related constants for the WoW Leaderboard application
 * Tuning these values affects caching behavior, timeouts, and rendering performance
 */

export const PERFORMANCE = {
  // HomePage progressive loading
  // Optimal for First Contentful Paint across all device types
  INITIAL_PAGE_SIZE: 250,
  DEFAULT_PAGE_LIMIT: 1000,

  // API timeouts
  // 10 seconds matches backend max response time
  API_TIMEOUT_MS: 10000,

  // Cache settings
  // TTL for API response caching (prevents stale data during rapid navigation)
  API_CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes

  // Max entries per cache (prevents unbounded memory growth)
  SEASONS_CACHE_MAX_SIZE: 10,
  SEASON_INFO_CACHE_MAX_SIZE: 20,
  COMPOSITION_CACHE_MAX_SIZE: 30,
  SPEC_EVOLUTION_CACHE_MAX_SIZE: 30,

  // Worker progress throttling
  // Prevents excessive re-renders during worker updates
  WORKER_PROGRESS_THROTTLE_MS: 100, // ~10 updates/second
  WORKER_PROGRESS_MIN_INTERVAL_MS: 100,

  // Request deduplication window (in ms)
  // Merges identical requests made within this timeframe
  DEDUPE_WINDOW_MS: 50,
} as const;
