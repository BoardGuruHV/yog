import { describe, it, expect } from 'vitest'
import {
  validateBusinessEmail,
  extractCompanyFromEmail,
  isBlockedDomain,
  getBlockedDomains,
} from '@/lib/validation/email'

describe('validateBusinessEmail', () => {
  describe('valid business emails', () => {
    it('should accept business domain emails', () => {
      const result = validateBusinessEmail('john@acmecorp.com')
      expect(result.valid).toBe(true)
      expect(result.isBusinessEmail).toBe(true)
      expect(result.domain).toBe('acmecorp.com')
      expect(result.error).toBeUndefined()
    })

    it('should normalize email to lowercase', () => {
      const result = validateBusinessEmail('JOHN@ACMECORP.COM')
      expect(result.valid).toBe(true)
      expect(result.email).toBe('john@acmecorp.com')
    })

    it('should trim whitespace', () => {
      const result = validateBusinessEmail('  john@acmecorp.com  ')
      expect(result.valid).toBe(true)
      expect(result.email).toBe('john@acmecorp.com')
    })
  })

  describe('blocked personal email domains', () => {
    const blockedDomains = [
      'gmail.com',
      'yahoo.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
      'protonmail.com',
      'mail.ru',
      'yandex.com',
    ]

    blockedDomains.forEach((domain) => {
      it(`should reject ${domain}`, () => {
        const result = validateBusinessEmail(`user@${domain}`)
        expect(result.valid).toBe(false)
        expect(result.isBusinessEmail).toBe(false)
        expect(result.error).toContain('business email')
      })
    })
  })

  describe('invalid email formats', () => {
    it('should reject emails without @', () => {
      const result = validateBusinessEmail('invalid-email')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('valid email')
    })

    it('should reject emails without domain', () => {
      const result = validateBusinessEmail('user@')
      expect(result.valid).toBe(false)
    })

    it('should reject emails with spaces', () => {
      const result = validateBusinessEmail('user @domain.com')
      expect(result.valid).toBe(false)
    })

    it('should reject emails without TLD', () => {
      const result = validateBusinessEmail('user@domain')
      expect(result.valid).toBe(false)
    })
  })

  describe('suspicious patterns', () => {
    it('should reject numeric-only local parts', () => {
      const result = validateBusinessEmail('12345@company.com')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('valid business email')
    })

    it('should reject test emails', () => {
      const result = validateBusinessEmail('test@company.com')
      expect(result.valid).toBe(false)
    })

    it('should reject test123 pattern', () => {
      const result = validateBusinessEmail('test123@company.com')
      expect(result.valid).toBe(false)
    })
  })
})

describe('extractCompanyFromEmail', () => {
  it('should extract company name from simple domain', () => {
    const result = extractCompanyFromEmail('john@acme.com')
    expect(result).toBe('Acme')
  })

  it('should handle hyphenated company names', () => {
    const result = extractCompanyFromEmail('john@acme-corp.com')
    expect(result).toBe('Acme Corp')
  })

  it('should handle underscored company names', () => {
    const result = extractCompanyFromEmail('john@acme_corp.com')
    expect(result).toBe('Acme Corp')
  })

  it('should handle co.uk domains', () => {
    const result = extractCompanyFromEmail('john@company.co.uk')
    expect(result).toBe('Company')
  })

  it('should return null for invalid emails', () => {
    const result = extractCompanyFromEmail('invalid')
    expect(result).toBeNull()
  })
})

describe('isBlockedDomain', () => {
  it('should return true for blocked domains', () => {
    expect(isBlockedDomain('gmail.com')).toBe(true)
    expect(isBlockedDomain('GMAIL.COM')).toBe(true)
    expect(isBlockedDomain('Yahoo.com')).toBe(true)
  })

  it('should return false for allowed domains', () => {
    expect(isBlockedDomain('acmecorp.com')).toBe(false)
    expect(isBlockedDomain('mycompany.io')).toBe(false)
  })
})

describe('getBlockedDomains', () => {
  it('should return an array of blocked domains', () => {
    const domains = getBlockedDomains()
    expect(Array.isArray(domains)).toBe(true)
    expect(domains.length).toBeGreaterThan(0)
    expect(domains).toContain('gmail.com')
  })

  it('should return a copy, not the original array', () => {
    const domains1 = getBlockedDomains()
    const domains2 = getBlockedDomains()
    expect(domains1).not.toBe(domains2)
  })
})
