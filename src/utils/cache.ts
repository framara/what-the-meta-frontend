/**
 * LRU (Least Recently Used) Cache with TTL (Time To Live) support
 * 
 * This cache automatically evicts the oldest entry when the size limit is reached,
 * and removes entries that have expired based on their TTL.
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;
  private readonly ttl: number; // Time to live in milliseconds

  /**
   * Create a new LRU Cache instance
   * @param maxSize Maximum number of entries to store (default: 50)
   * @param ttl Time to live for each entry in milliseconds (default: 5 minutes)
   */
  constructor(maxSize = 50, ttl = 5 * 60 * 1000) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value, or null if not found or expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU update) - delete and re-add to move to end of Map
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param data Data to cache
   */
  set(key: string, data: T): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      // Get the first (oldest) key from the Map
      const firstKey = this.cache.keys().next().value as string | undefined;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    // Remove if exists (to ensure it goes to end)
    this.cache.delete(key);
    // Add to end
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Check if a key exists in the cache (and is not expired)
   * @param key Cache key
   * @returns True if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete a specific key from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the current size of the cache
   * @returns Number of entries in the cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics for debugging
   * @returns Object containing size and maxSize
   */
  getStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize
    };
  }
}
