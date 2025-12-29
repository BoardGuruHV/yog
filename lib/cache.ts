/**
 * Server-side In-Memory Cache
 *
 * A simple but effective caching solution for server-side data.
 * For production with multiple instances, consider Redis.
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
  createdAt: number
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  keys: string[]
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private hits = 0
  private misses = 0
  private cleanupInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    // Run cleanup every minute
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => this.cleanup(), 60000)
    }
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined

    if (!entry) {
      this.misses++
      return null
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      this.misses++
      return null
    }

    this.hits++
    return entry.value
  }

  /**
   * Set a value in cache
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttlMs - Time to live in milliseconds (default: 5 minutes)
   */
  set<T>(key: string, value: T, ttlMs: number = 300000): void {
    const now = Date.now()
    this.cache.set(key, {
      value,
      expiresAt: now + ttlMs,
      createdAt: now,
    })
  }

  /**
   * Delete a specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Delete all keys matching a pattern
   */
  deletePattern(pattern: string): number {
    const regex = new RegExp(pattern)
    let deleted = 0

    const keys = Array.from(this.cache.keys())
    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.delete(key)
        deleted++
      }
    }

    return deleted
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
    this.hits = 0
    this.misses = 0
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return {
      hits: this.hits,
      misses: this.misses,
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    }
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }
    return true
  }

  /**
   * Get or set pattern - returns cached value or computes and caches it
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlMs: number = 300000
  ): Promise<T> {
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    const value = await factory()
    this.set(key, value, ttlMs)
    return value
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const keys = Array.from(this.cache.keys())

    for (const key of keys) {
      const entry = this.cache.get(key)
      if (entry && now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Destroy the cache and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.cache.clear()
  }
}

// Singleton instance
export const cache = new MemoryCache()

// ============================================
// Cache Key Builders
// ============================================

export const CacheKeys = {
  // Asana cache keys
  asanas: {
    all: () => 'asanas:all',
    list: (params: string) => `asanas:list:${params}`,
    byId: (id: string) => `asanas:${id}`,
    count: () => 'asanas:count',
  },

  // User cache keys
  user: {
    profile: (userId: string) => `user:${userId}:profile`,
    streak: (userId: string) => `user:${userId}:streak`,
    goals: (userId: string) => `user:${userId}:goals`,
    favorites: (userId: string) => `user:${userId}:favorites`,
  },

  // Program cache keys
  programs: {
    list: (params: string) => `programs:list:${params}`,
    byId: (id: string) => `programs:${id}`,
    templates: () => 'programs:templates',
  },

  // Stats cache keys
  stats: {
    global: () => 'stats:global',
    user: (userId: string) => `stats:user:${userId}`,
    dashboard: (userId: string) => `dashboard:${userId}`,
  },

  // Content cache keys
  content: {
    articles: () => 'content:articles',
    instructors: () => 'content:instructors',
    conditions: () => 'content:conditions',
  },
} as const

// ============================================
// Cache TTL Presets (in milliseconds)
// ============================================

export const CacheTTL = {
  SHORT: 60 * 1000,           // 1 minute
  MEDIUM: 5 * 60 * 1000,      // 5 minutes
  LONG: 30 * 60 * 1000,       // 30 minutes
  HOUR: 60 * 60 * 1000,       // 1 hour
  DAY: 24 * 60 * 60 * 1000,   // 24 hours

  // Specific cache durations
  ASANA_LIST: 30 * 60 * 1000,     // 30 minutes - asanas rarely change
  USER_STREAK: 5 * 60 * 1000,     // 5 minutes - accessed frequently
  DASHBOARD: 2 * 60 * 1000,       // 2 minutes - needs to be fresh
  TEMPLATES: 60 * 60 * 1000,      // 1 hour - templates rarely change
  CONDITIONS: 60 * 60 * 1000,     // 1 hour - conditions rarely change
} as const

// ============================================
// Cache Invalidation Helpers
// ============================================

/**
 * Invalidate all user-related cache entries
 */
export function invalidateUserCache(userId: string): void {
  cache.deletePattern(`user:${userId}:.*`)
  cache.deletePattern(`stats:user:${userId}`)
  cache.deletePattern(`dashboard:${userId}`)
}

/**
 * Invalidate all asana-related cache entries
 */
export function invalidateAsanaCache(): void {
  cache.deletePattern('asanas:.*')
}

/**
 * Invalidate all program-related cache entries
 */
export function invalidateProgramCache(): void {
  cache.deletePattern('programs:.*')
}

/**
 * Invalidate cache for a specific program
 */
export function invalidateProgramById(programId: string): void {
  cache.delete(CacheKeys.programs.byId(programId))
  cache.deletePattern('programs:list:.*')
}
