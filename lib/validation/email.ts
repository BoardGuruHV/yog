/**
 * Business Email Validation Utility
 * Validates that email addresses are from business domains (not personal email providers)
 */

// Common personal email providers to block
const BLOCKED_DOMAINS = [
  // Major providers
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.co.in',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.it',
  'yahoo.es',
  'yahoo.ca',
  'yahoo.com.br',
  'yahoo.com.au',
  'yahoo.co.jp',
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'hotmail.de',
  'hotmail.it',
  'hotmail.es',
  'outlook.com',
  'outlook.co.uk',
  'outlook.fr',
  'outlook.de',
  'live.com',
  'live.co.uk',
  'live.fr',
  'msn.com',
  'aol.com',
  'aol.co.uk',
  'icloud.com',
  'me.com',
  'mac.com',

  // Other free email providers
  'protonmail.com',
  'protonmail.ch',
  'proton.me',
  'tutanota.com',
  'tutanota.de',
  'tutamail.com',
  'mail.com',
  'email.com',
  'usa.com',
  'myself.com',
  'consultant.com',
  'europe.com',
  'asia.com',
  'africa.com',
  'post.com',
  'techie.com',
  'engineer.com',
  'writeme.com',
  'gmx.com',
  'gmx.de',
  'gmx.net',
  'gmx.at',
  'gmx.ch',
  'web.de',
  'freenet.de',
  't-online.de',
  'zoho.com',
  'zohomail.com',
  'yandex.com',
  'yandex.ru',
  'mail.ru',
  'inbox.ru',
  'list.ru',
  'bk.ru',
  'rambler.ru',
  'qq.com',
  '163.com',
  '126.com',
  'sina.com',
  'sina.cn',
  'sohu.com',
  'rediffmail.com',
  'rediff.com',

  // Temporary/disposable email domains
  'tempmail.com',
  'guerrillamail.com',
  'guerrillamail.org',
  'sharklasers.com',
  'mailinator.com',
  'dispostable.com',
  'throwaway.email',
  '10minutemail.com',
  'temp-mail.org',
  'fakeinbox.com',
  'getnada.com',
  'maildrop.cc',
  'yopmail.com',
  'yopmail.fr',
  'trashmail.com',
  'mailnesia.com',

  // Other common free services
  'fastmail.com',
  'fastmail.fm',
  'hushmail.com',
  'runbox.com',
  'mailfence.com',
  'startmail.com',
  'disroot.org',
  'riseup.net',
  'cock.li',
  'airmail.cc',
];

// Normalize domain by removing common subdomains
function normalizeDomain(domain: string): string {
  return domain.toLowerCase().trim();
}

// Extract domain from email
function extractDomain(email: string): string | null {
  const parts = email.toLowerCase().trim().split('@');
  if (parts.length !== 2) return null;
  return parts[1];
}

// Validate email format
function isValidEmailFormat(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export interface EmailValidationResult {
  valid: boolean;
  email: string;
  domain: string | null;
  error?: string;
  isBusinessEmail: boolean;
}

/**
 * Validates if an email is a valid business email
 * @param email - The email address to validate
 * @returns Validation result with details
 */
export function validateBusinessEmail(email: string): EmailValidationResult {
  const trimmedEmail = email.trim().toLowerCase();

  // Check email format
  if (!isValidEmailFormat(trimmedEmail)) {
    return {
      valid: false,
      email: trimmedEmail,
      domain: null,
      error: 'Please enter a valid email address',
      isBusinessEmail: false,
    };
  }

  // Extract domain
  const domain = extractDomain(trimmedEmail);
  if (!domain) {
    return {
      valid: false,
      email: trimmedEmail,
      domain: null,
      error: 'Could not extract domain from email',
      isBusinessEmail: false,
    };
  }

  // Check against blocked domains
  const normalizedDomain = normalizeDomain(domain);
  if (BLOCKED_DOMAINS.includes(normalizedDomain)) {
    return {
      valid: false,
      email: trimmedEmail,
      domain: normalizedDomain,
      error: 'Please use a business email address. Personal email providers like Gmail, Yahoo, and Outlook are not accepted.',
      isBusinessEmail: false,
    };
  }

  // Check for common patterns that indicate personal emails
  // e.g., numbers at the end of local part suggesting generated emails
  const localPart = trimmedEmail.split('@')[0];
  if (/^\d+$/.test(localPart) || /^test\d*$/i.test(localPart)) {
    return {
      valid: false,
      email: trimmedEmail,
      domain: normalizedDomain,
      error: 'Please use a valid business email address',
      isBusinessEmail: false,
    };
  }

  return {
    valid: true,
    email: trimmedEmail,
    domain: normalizedDomain,
    error: undefined,
    isBusinessEmail: true,
  };
}

/**
 * Extract company name from email domain
 * @param email - The email address
 * @returns Extracted company name or null
 */
export function extractCompanyFromEmail(email: string): string | null {
  const domain = extractDomain(email);
  if (!domain) return null;

  // Remove common TLDs and suffixes
  const parts = domain.split('.');
  if (parts.length < 2) return null;

  // Get the main part (usually company name)
  let companyPart = parts[0];

  // Handle co.uk, com.au style domains
  if (parts.length > 2 && ['co', 'com', 'org', 'net'].includes(parts[parts.length - 2])) {
    companyPart = parts[parts.length - 3];
  }

  // Capitalize first letter of each word
  return companyPart
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if domain is a known blocked domain
 * @param domain - The domain to check
 * @returns true if blocked
 */
export function isBlockedDomain(domain: string): boolean {
  return BLOCKED_DOMAINS.includes(normalizeDomain(domain));
}

/**
 * Get the list of blocked domains
 * @returns Array of blocked domain strings
 */
export function getBlockedDomains(): string[] {
  return [...BLOCKED_DOMAINS];
}
