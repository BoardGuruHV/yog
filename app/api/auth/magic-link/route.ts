/**
 * Magic Link API
 * POST /api/auth/magic-link
 * Sends a magic link to the user's email for passwordless login
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { nanoid } from 'nanoid';
import { sendMagicLinkEmail, isEmailConfigured } from '@/lib/email';
import { logger } from '@/lib/logger';

// Token expiration time (15 minutes)
const TOKEN_EXPIRY = 15 * 60 * 1000;

// Rate limiting - simple in-memory store
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3; // Max requests per window
const RATE_WINDOW = 5 * 60 * 1000; // 5 minutes

function isRateLimited(identifier: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limit by email
    if (isRateLimited(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a few minutes before trying again.' },
        { status: 429 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Always respond the same way to prevent email enumeration
    // Even if user doesn't exist, we pretend we sent the email
    if (!user) {
      // Log for debugging (remove in production or use proper logging)
      console.log('Magic link requested for non-existent user:', normalizedEmail);

      // Return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this email, you will receive a magic link shortly.',
      });
    }

    // Generate magic link token
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY);

    // Delete any existing tokens for this user
    await prisma.magicLinkToken.deleteMany({
      where: {
        identifier: normalizedEmail,
        tokenType: 'magic-link',
      },
    });

    // Create new token
    await prisma.magicLinkToken.create({
      data: {
        identifier: normalizedEmail,
        token,
        tokenType: 'magic-link',
        expiresAt,
      },
    });

    // Build magic link URL
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const magicLink = `${baseUrl}/api/auth/verify-magic-link?token=${token}`;

    // Send email with magic link
    if (isEmailConfigured()) {
      const emailResult = await sendMagicLinkEmail({
        to: normalizedEmail,
        magicLink,
        expiresInMinutes: 15,
      });

      if (!emailResult.success) {
        logger.error('Failed to send magic link email', { email: normalizedEmail, error: emailResult.error });
        // Don't expose email sending failure to prevent enumeration
      }
    } else {
      // In development without email configured, log the link
      logger.info('Magic link generated (email not configured)', {
        email: normalizedEmail,
        link: magicLink,
        expiresAt,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a magic link shortly.',
    });
  } catch (error) {
    console.error('Magic link error:', error);

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
