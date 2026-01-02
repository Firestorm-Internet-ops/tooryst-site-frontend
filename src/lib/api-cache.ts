/**
 * API Response Caching Utility
 * Implements in-memory caching for API responses with TTL
 *
 * Features:
 * - In-memory cache with automatic expiration
 * - Cache invalidation by key or pattern
 * - Performance monitoring
 * - Stale-while-revalidate pattern
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  staleWhileRevalidate?: boolean; // Return stale data while fetching fresh data
}

class APICache {
  private cache: Map<string, CacheEntry<any>>;
  private revalidating: Set<string>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
    this.revalidating = new Set();

    // Clean up expired entries every minute
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60 * 1000);
    }
  }

  /**
   * Get cached data or fetch if not available/expired
   */
  async get<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { ttl = this.DEFAULT_TTL, staleWhileRevalidate = true } = options;
    const now = Date.now();
    const cached = this.cache.get(key);

    // Cache hit and not expired
    if (cached && cached.expiresAt > now) {
      return cached.data as T;
    }

    // Stale cache exists but expired
    if (cached && staleWhileRevalidate && !this.revalidating.has(key)) {
      // Return stale data immediately
      this.revalidateInBackground(key, fetchFn, ttl);
      return cached.data as T;
    }

    // Cache miss or expired without stale-while-revalidate
    return this.fetchAndCache(key, fetchFn, ttl);
  }

  /**
   * Fetch and cache data
   */
  private async fetchAndCache<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number
  ): Promise<T> {
    try {
      const data = await fetchFn();
      const now = Date.now();

      this.cache.set(key, {
        data,
        timestamp: now,
        expiresAt: now + ttl,
      });

      return data;
    } catch (error) {
      // If fetch fails and we have stale data, return it
      const cached = this.cache.get(key);
      if (cached) {
        console.warn(`Fetch failed for ${key}, returning stale data`);
        return cached.data as T;
      }
      throw error;
    }
  }

  /**
   * Revalidate in background
   */
  private async revalidateInBackground<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number
  ): Promise<void> {
    if (this.revalidating.has(key)) {
      return; // Already revalidating
    }

    this.revalidating.add(key);

    try {
      await this.fetchAndCache(key, fetchFn, ttl);
    } catch (error) {
      console.warn(`Background revalidation failed for ${key}:`, error);
    } finally {
      this.revalidating.delete(key);
    }
  }

  /**
   * Set data in cache directly
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const now = Date.now();
    return cached.expiresAt > now;
  }

  /**
   * Invalidate specific key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate keys matching pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === 'string'
      ? new RegExp(pattern)
      : pattern;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.revalidating.clear();
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < now) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.debug(`Cleaned up ${cleaned} expired cache entries`);
    }
  }

  /**
   * Get cache statistics
   */
  stats(): {
    size: number;
    keys: string[];
    revalidating: string[];
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      revalidating: Array.from(this.revalidating),
    };
  }

  /**
   * Get specific cache entry with metadata
   */
  getEntry(key: string): CacheEntry<any> | undefined {
    return this.cache.get(key);
  }
}

// Global cache instance
const apiCache = new APICache();

/**
 * Helper function for caching fetch requests
 */
export async function cachedFetch<T>(
  url: string,
  options: RequestInit & { cacheTTL?: number; staleWhileRevalidate?: boolean } = {}
): Promise<T> {
  const { cacheTTL, staleWhileRevalidate, ...fetchOptions } = options;
  const cacheKey = `${url}-${JSON.stringify(fetchOptions)}`;

  return apiCache.get(
    cacheKey,
    async () => {
      const response = await fetch(url, fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    { ttl: cacheTTL, staleWhileRevalidate }
  );
}

/**
 * Helper for caching API calls with automatic key generation
 */
export async function cachedApiCall<T>(
  endpoint: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  return apiCache.get(endpoint, fetchFn, options);
}

/**
 * Export the cache instance for direct access
 */
export { apiCache };

/**
 * Export cache utilities
 */
export const cacheUtils = {
  invalidate: (key: string) => apiCache.invalidate(key),
  invalidatePattern: (pattern: string | RegExp) => apiCache.invalidatePattern(pattern),
  clear: () => apiCache.clear(),
  stats: () => apiCache.stats(),
  has: (key: string) => apiCache.has(key),
  set: <T>(key: string, data: T, ttl?: number) => apiCache.set(key, data, ttl),
};
