import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { rateLimit, createRateLimiter, RATE_LIMITS } from '@/lib/rate-limit'

// Helper to create mock requests
function createMockRequest(ip: string = '127.0.0.1'): NextRequest {
  return {
    headers: new Headers({
      'x-forwarded-for': ip,
    }),
  } as unknown as NextRequest
}

describe('rateLimit', () => {
  beforeEach(() => {
    // Reset the rate limit store by waiting for the window to pass
    // In tests, we simulate this by creating new IP addresses
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow requests within the limit', () => {
    const request = createMockRequest('192.168.1.1')
    const config = { interval: 60000, maxRequests: 5 }

    for (let i = 0; i < 5; i++) {
      const result = rateLimit(request, config, 'test1')
      expect(result).toBeNull()
    }
  })

  it('should block requests exceeding the limit', () => {
    const request = createMockRequest('192.168.1.2')
    const config = { interval: 60000, maxRequests: 3 }

    // First 3 requests should pass
    for (let i = 0; i < 3; i++) {
      const result = rateLimit(request, config, 'test2')
      expect(result).toBeNull()
    }

    // 4th request should be blocked
    const result = rateLimit(request, config, 'test2')
    expect(result).not.toBeNull()
    expect(result?.status).toBe(429)
  })

  it('should return correct headers on rate limit', async () => {
    const request = createMockRequest('192.168.1.3')
    const config = { interval: 60000, maxRequests: 1 }

    // First request passes
    rateLimit(request, config, 'test3')

    // Second request is blocked
    const result = rateLimit(request, config, 'test3')
    expect(result).not.toBeNull()

    const body = await result?.json()
    expect(body.error).toBe('Too many requests')
    expect(body.retryAfter).toBeDefined()

    expect(result?.headers.get('Retry-After')).toBeDefined()
    expect(result?.headers.get('X-RateLimit-Limit')).toBe('1')
    expect(result?.headers.get('X-RateLimit-Remaining')).toBe('0')
  })

  it('should reset after the interval', () => {
    const request = createMockRequest('192.168.1.4')
    const config = { interval: 60000, maxRequests: 2 }

    // Use up the limit
    rateLimit(request, config, 'test4')
    rateLimit(request, config, 'test4')
    expect(rateLimit(request, config, 'test4')).not.toBeNull()

    // Advance time past the interval
    vi.advanceTimersByTime(61000)

    // Should be allowed again
    const result = rateLimit(request, config, 'test4')
    expect(result).toBeNull()
  })

  it('should track different IPs separately', () => {
    const request1 = createMockRequest('10.0.0.1')
    const request2 = createMockRequest('10.0.0.2')
    const config = { interval: 60000, maxRequests: 2 }

    // Use up limit for first IP
    rateLimit(request1, config, 'test5')
    rateLimit(request1, config, 'test5')
    expect(rateLimit(request1, config, 'test5')).not.toBeNull()

    // Second IP should still be allowed
    const result = rateLimit(request2, config, 'test5')
    expect(result).toBeNull()
  })

  it('should track different key prefixes separately', () => {
    const request = createMockRequest('10.0.0.3')
    const config = { interval: 60000, maxRequests: 1 }

    // Use up limit for 'api' prefix
    rateLimit(request, config, 'api')
    expect(rateLimit(request, config, 'api')).not.toBeNull()

    // 'auth' prefix should still be allowed
    const result = rateLimit(request, config, 'auth')
    expect(result).toBeNull()
  })
})

describe('createRateLimiter', () => {
  it('should create a reusable rate limiter function', () => {
    const limiter = createRateLimiter(
      { interval: 60000, maxRequests: 5 },
      'custom'
    )
    const request = createMockRequest('10.0.0.10')

    const result = limiter(request)
    expect(result).toBeNull()
  })
})

describe('RATE_LIMITS configuration', () => {
  it('should have auth limits stricter than standard limits', () => {
    expect(RATE_LIMITS.register.maxRequests).toBeLessThan(RATE_LIMITS.read.maxRequests)
    expect(RATE_LIMITS.login.maxRequests).toBeLessThan(RATE_LIMITS.read.maxRequests)
  })

  it('should have AI limits moderate', () => {
    expect(RATE_LIMITS.generateProgram.maxRequests).toBeLessThan(RATE_LIMITS.read.maxRequests)
    expect(RATE_LIMITS.chat.maxRequests).toBeLessThan(RATE_LIMITS.read.maxRequests)
  })

  it('should have proper intervals defined', () => {
    Object.values(RATE_LIMITS).forEach((limit) => {
      expect(limit.interval).toBeGreaterThan(0)
      expect(limit.maxRequests).toBeGreaterThan(0)
    })
  })
})
