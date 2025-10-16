import { LRUCache } from '../utils/cache';
import { logger } from '../utils/logger';

/**
 * Unified cache service for managing API responses
 * Provides a consistent interface for caching with namespace-based organization
 */
class CacheService {
  private caches = new Map<string, LRUCache<any>>();

  /**
   * Get or create a cache for the given namespace
   */
  private getCache<T>(namespace: string, maxSize = 50, ttl = 5 * 60 * 1000): LRUCache<T> {
    if (!this.caches.has(namespace)) {
      this.caches.set(namespace, new LRUCache<T>(maxSize, ttl));
    }
    return this.caches.get(namespace)!;
  }

  /**
   * Get cached value or fetch it using the provided function
   * @param namespace - Cache namespace (e.g., 'seasons', 'season-info')
   * @param key - Cache key within the namespace
   * @param fetchFn - Async function to fetch the value if not cached
   * @param options - Cache options (ttl override, bypass cache)
   * @returns Cached or freshly fetched value
   */
  async getOrFetch<T>(
    namespace: string,
    key: string,
    fetchFn: () => Promise<T>,
    options: {
      maxSize?: number;
      ttl?: number;
      bypassCache?: boolean;
    } = {}
  ): Promise<T> {
    const cache = this.getCache<T>(namespace, options.maxSize, options.ttl);

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

  /**
   * Invalidate a specific cache entry or entire namespace
   * @param namespace - Cache namespace
   * @param key - Optional cache key; if omitted, clears entire namespace
   */
  invalidate(namespace: string, key?: string): void {
    const cache = this.caches.get(namespace);
    if (!cache) return;

    if (key) {
      cache.delete(key);
      logger.log(`Cache invalidated: ${namespace}:${key}`);
    } else {
      cache.clear();
      logger.log(`Cache cleared: ${namespace}`);
    }
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.caches.forEach((cache) => cache.clear());
    logger.log('All caches cleared');
  }

  /**
   * Get cache statistics for debugging
   */
  getStats(namespace: string) {
    const cache = this.caches.get(namespace);
    if (!cache) return null;

    return {
      namespace,
      size: cache.size,
      stats: cache.getStats?.(),
    };
  }
}

export const cacheService = new CacheService();
