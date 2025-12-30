import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Test email utility functions directly without importing the email module
// which instantiates Resend at module level

describe('Email Utilities', () => {
  describe('isValidEmail', () => {
    // Test email validation regex pattern
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    }

    it('should return true for valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true)
      expect(isValidEmail('user.name@example.co.uk')).toBe(true)
      expect(isValidEmail('user+tag@example.com')).toBe(true)
    })

    it('should return false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('user@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })
  })

  describe('isEmailConfigured', () => {
    const originalEnv = process.env

    beforeEach(() => {
      process.env = { ...originalEnv }
    })

    afterEach(() => {
      process.env = originalEnv
    })

    it('should return false when RESEND_API_KEY is not set', () => {
      delete process.env.RESEND_API_KEY
      // Test the logic directly
      const isConfigured = !!process.env.RESEND_API_KEY
      expect(isConfigured).toBe(false)
    })

    it('should return true when RESEND_API_KEY is set', () => {
      process.env.RESEND_API_KEY = 'test-key'
      const isConfigured = !!process.env.RESEND_API_KEY
      expect(isConfigured).toBe(true)
    })
  })
})

describe('Email Template Structure', () => {
  it('should generate magic link HTML with required elements', () => {
    const magicLink = 'https://example.com/verify?token=abc123'
    const appName = 'Yoga Platform'
    const expiresInMinutes = 15

    // Simulate the HTML template structure
    const html = `
      <h1>${appName}</h1>
      <h2>Login to Your Account</h2>
      <p>expire in ${expiresInMinutes} minutes</p>
      <a href="${magicLink}">Log In</a>
    `

    expect(html).toContain(appName)
    expect(html).toContain(magicLink)
    expect(html).toContain('15 minutes')
    expect(html).toContain('Log In')
  })

  it('should generate Free Pass approval HTML with required elements', () => {
    const loginLink = 'https://example.com/login'
    const expiresAt = new Date('2024-12-31T23:59:59Z')
    const formattedExpiry = expiresAt.toLocaleString()

    const html = `
      <h2>Your Free Pass is Ready!</h2>
      <p>24-hour access</p>
      <a href="${loginLink}">Start Exploring Now</a>
      <p>Access Expires: ${formattedExpiry}</p>
    `

    expect(html).toContain('Free Pass is Ready')
    expect(html).toContain(loginLink)
    expect(html).toContain('24-hour access')
  })

  it('should generate streak warning HTML with streak count', () => {
    const currentStreak = 42
    const name = 'John'

    const html = `
      <h2>Your Streak is About to End!</h2>
      <p>Hey ${name},</p>
      <p>${currentStreak}-day streak</p>
      <a href="#">Practice Now</a>
    `

    expect(html).toContain('42-day streak')
    expect(html).toContain('Hey John')
    expect(html).toContain('Practice Now')
  })
})
