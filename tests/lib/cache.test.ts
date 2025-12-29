import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { cache, CacheKeys, CacheTTL, invalidateUserCache, invalidateAsanaCache } from '@/lib/cache'

describe('MemoryCache', () => {
  beforeEach(() => {
    cache.clear()
  })

  describe('basic operations', () => {
    it('should set and get a value', () => {
      cache.set('test-key', { foo: 'bar' })
      const result = cache.get<{ foo: string }>('test-key')
      expect(result).toEqual({ foo: 'bar' })
    })

    it('should return null for non-existent key', () => {
      const result = cache.get('non-existent')
      expect(result).toBeNull()
    })

    it('should delete a key', () => {
      cache.set('test-key', 'value')
      expect(cache.has('test-key')).toBe(true)

      cache.delete('test-key')
      expect(cache.has('test-key')).toBe(false)
    })

    it('should clear all entries', () => {
      cache.set('key1', 'value1')
      cache.set('key2', 'value2')

      cache.clear()

      expect(cache.get('key1')).toBeNull()
      expect(cache.get('key2')).toBeNull()
    })

    it('should check if key exists', () => {
      cache.set('existing', 'value')

      expect(cache.has('existing')).toBe(true)
      expect(cache.has('non-existing')).toBe(false)
    })
  })

  describe('TTL expiration', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return value before expiration', () => {
      cache.set('ttl-test', 'value', 5000) // 5 seconds

      vi.advanceTimersByTime(4000) // 4 seconds

      expect(cache.get('ttl-test')).toBe('value')
    })

    it('should return null after expiration', () => {
      cache.set('ttl-test', 'value', 5000) // 5 seconds

      vi.advanceTimersByTime(6000) // 6 seconds

      expect(cache.get('ttl-test')).toBeNull()
    })

    it('should remove expired key from has() check', () => {
      cache.set('ttl-test', 'value', 5000)

      vi.advanceTimersByTime(6000)

      expect(cache.has('ttl-test')).toBe(false)
    })
  })

  describe('getOrSet', () => {
    it('should return cached value if exists', async () => {
      cache.set('getorset-key', 'cached-value')

      const factory = vi.fn().mockResolvedValue('new-value')
      const result = await cache.getOrSet('getorset-key', factory)

      expect(result).toBe('cached-value')
      expect(factory).not.toHaveBeenCalled()
    })

    it('should call factory and cache result if not exists', async () => {
      const factory = vi.fn().mockResolvedValue('new-value')
      const result = await cache.getOrSet('new-key', factory)

      expect(result).toBe('new-value')
      expect(factory).toHaveBeenCalledTimes(1)
      expect(cache.get('new-key')).toBe('new-value')
    })

    it('should use custom TTL', async () => {
      vi.useFakeTimers()

      const factory = vi.fn().mockResolvedValue('value')
      await cache.getOrSet('custom-ttl', factory, 1000)

      vi.advanceTimersByTime(500)
      expect(cache.get('custom-ttl')).toBe('value')

      vi.advanceTimersByTime(600)
      expect(cache.get('custom-ttl')).toBeNull()

      vi.useRealTimers()
    })
  })

  describe('deletePattern', () => {
    it('should delete keys matching pattern', () => {
      cache.set('user:123:profile', 'profile')
      cache.set('user:123:settings', 'settings')
      cache.set('user:456:profile', 'profile2')
      cache.set('other:key', 'other')

      const deleted = cache.deletePattern('user:123:.*')

      expect(deleted).toBe(2)
      expect(cache.get('user:123:profile')).toBeNull()
      expect(cache.get('user:123:settings')).toBeNull()
      expect(cache.get('user:456:profile')).toBe('profile2')
      expect(cache.get('other:key')).toBe('other')
    })
  })

  describe('getStats', () => {
    it('should track hits and misses', () => {
      cache.clear() // Reset stats

      cache.set('key1', 'value1')

      cache.get('key1') // hit
      cache.get('key1') // hit
      cache.get('nonexistent') // miss

      const stats = cache.getStats()

      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.size).toBe(1)
      expect(stats.keys).toContain('key1')
    })
  })
})

describe('CacheKeys', () => {
  it('should generate correct asana keys', () => {
    expect(CacheKeys.asanas.all()).toBe('asanas:all')
    expect(CacheKeys.asanas.byId('123')).toBe('asanas:123')
    expect(CacheKeys.asanas.list('param')).toBe('asanas:list:param')
  })

  it('should generate correct user keys', () => {
    expect(CacheKeys.user.profile('user-123')).toBe('user:user-123:profile')
    expect(CacheKeys.user.streak('user-123')).toBe('user:user-123:streak')
  })

  it('should generate correct program keys', () => {
    expect(CacheKeys.programs.byId('prog-1')).toBe('programs:prog-1')
    expect(CacheKeys.programs.templates()).toBe('programs:templates')
  })
})

describe('CacheTTL', () => {
  it('should have reasonable values', () => {
    expect(CacheTTL.SHORT).toBe(60000) // 1 minute
    expect(CacheTTL.MEDIUM).toBe(300000) // 5 minutes
    expect(CacheTTL.LONG).toBe(1800000) // 30 minutes
    expect(CacheTTL.HOUR).toBe(3600000) // 1 hour
    expect(CacheTTL.DAY).toBe(86400000) // 24 hours
  })
})

describe('Cache Invalidation Helpers', () => {
  beforeEach(() => {
    cache.clear()
  })

  it('invalidateUserCache should clear user-related keys', () => {
    cache.set('user:123:profile', 'profile')
    cache.set('user:123:streak', 'streak')
    cache.set('stats:user:123', 'stats')
    cache.set('dashboard:123', 'dashboard')
    cache.set('user:456:profile', 'other-user')

    invalidateUserCache('123')

    expect(cache.get('user:123:profile')).toBeNull()
    expect(cache.get('user:123:streak')).toBeNull()
    expect(cache.get('stats:user:123')).toBeNull()
    expect(cache.get('dashboard:123')).toBeNull()
    expect(cache.get('user:456:profile')).toBe('other-user')
  })

  it('invalidateAsanaCache should clear asana-related keys', () => {
    cache.set('asanas:all', 'all')
    cache.set('asanas:list:params', 'list')
    cache.set('asanas:123', 'asana')
    cache.set('programs:1', 'program')

    invalidateAsanaCache()

    expect(cache.get('asanas:all')).toBeNull()
    expect(cache.get('asanas:list:params')).toBeNull()
    expect(cache.get('asanas:123')).toBeNull()
    expect(cache.get('programs:1')).toBe('program')
  })
})
