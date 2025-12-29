import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Maximum requests per interval
}

interface RateLimitStore {
  count: number
  resetTime: number
}

// In-memory store (consider Redis for production with multiple instances)
const rateLimitStore = new Map<string, RateLimitStore>()

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60000 // 1 minute
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  const entries = Array.from(rateLimitStore.entries())
  for (const [key, value] of entries) {
    if (value.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
  lastCleanup = now
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header (for proxied requests) or falls back to a default
 */
function getClientIdentifier(request: NextRequest): string {
  // Check for forwarded IP (when behind a proxy/load balancer)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // Check for real IP header (Cloudflare, etc.)
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback - in development or when no IP is available
  return 'anonymous'
}

/**
 * Rate limiter function
 * @param request - The incoming request
 * @param config - Rate limit configuration
 * @param keyPrefix - Optional prefix to differentiate between routes
 * @returns null if allowed, NextResponse if rate limited
 */
export function rateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  keyPrefix: string = 'global'
): NextResponse | null {
  cleanup()

  const clientId = getClientIdentifier(request)
  const key = `${keyPrefix}:${clientId}`
  const now = Date.now()

  const existing = rateLimitStore.get(key)

  if (!existing || existing.resetTime < now) {
    // Start new window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.interval,
    })
    return null
  }

  if (existing.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((existing.resetTime - now) / 1000)

    return NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(existing.resetTime / 1000)),
        },
      }
    )
  }

  // Increment counter
  existing.count++
  rateLimitStore.set(key, existing)

  return null
}

/**
 * Create a rate limiter with preset configuration
 */
export function createRateLimiter(config: RateLimitConfig, keyPrefix: string) {
  return (request: NextRequest) => rateLimit(request, config, keyPrefix)
}

// ============================================
// Preset Rate Limiters
// ============================================

/**
 * Standard API rate limiter: 100 requests per minute
 */
export const standardRateLimit = createRateLimiter(
  { interval: 60000, maxRequests: 100 },
  'api'
)

/**
 * Auth rate limiter: 10 requests per minute (stricter for security)
 */
export const authRateLimit = createRateLimiter(
  { interval: 60000, maxRequests: 10 },
  'auth'
)

/**
 * AI/expensive operations rate limiter: 20 requests per minute
 */
export const aiRateLimit = createRateLimiter(
  { interval: 60000, maxRequests: 20 },
  'ai'
)

/**
 * Very strict rate limiter: 5 requests per hour (for sensitive operations)
 */
export const strictRateLimit = createRateLimiter(
  { interval: 3600000, maxRequests: 5 },
  'strict'
)

/**
 * Search rate limiter: 30 requests per minute
 */
export const searchRateLimit = createRateLimiter(
  { interval: 60000, maxRequests: 30 },
  'search'
)

// ============================================
// Rate Limit Configurations (for reference)
// ============================================

export const RATE_LIMITS = {
  // Authentication endpoints
  register: { interval: 3600000, maxRequests: 5 }, // 5 per hour
  login: { interval: 60000, maxRequests: 10 }, // 10 per minute
  magicLink: { interval: 60000, maxRequests: 3 }, // 3 per minute
  freePassRequest: { interval: 3600000, maxRequests: 5 }, // 5 per hour

  // AI endpoints (expensive)
  generateProgram: { interval: 60000, maxRequests: 10 }, // 10 per minute
  chat: { interval: 60000, maxRequests: 30 }, // 30 per minute
  semanticSearch: { interval: 60000, maxRequests: 20 }, // 20 per minute

  // Standard CRUD
  read: { interval: 60000, maxRequests: 100 }, // 100 per minute
  write: { interval: 60000, maxRequests: 50 }, // 50 per minute

  // Public endpoints
  public: { interval: 60000, maxRequests: 200 }, // 200 per minute
} as const
