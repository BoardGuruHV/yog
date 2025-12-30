/**
 * Free Pass Request API
 * POST /api/auth/free-pass/request
 * Creates a new Free Pass request and sends notification to admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { createFreePassRequest, getFreePassByEmail } from '@/lib/db/free-pass';
import { FreePassStatus } from '@prisma/client';
import {
  sendFreePassRequestConfirmationEmail,
  sendFreePassAdminNotificationEmail,
  isEmailConfigured,
} from '@/lib/email';
import { logger } from '@/lib/logger';

// Rate limiting - simple in-memory store (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5; // Max requests per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
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
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, companyName, jobTitle, useCase, termsAccepted, ndaAccepted } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!termsAccepted || !ndaAccepted) {
      return NextResponse.json(
        { error: 'You must accept both the Terms of Service and NDA' },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Extract domain from email
    const emailDomain = email.split('@')[1]?.toLowerCase();

    // Check for existing request
    const existingRequest = await getFreePassByEmail(email);
    if (existingRequest) {
      if (existingRequest.status === FreePassStatus.PENDING) {
        return NextResponse.json(
          { error: 'A Free Pass request for this email is already pending review. You will receive an email once approved.' },
          { status: 400 }
        );
      }
      if (existingRequest.status === FreePassStatus.APPROVED) {
        if (existingRequest.accessExpiresAt && existingRequest.accessExpiresAt > new Date()) {
          return NextResponse.json(
            { error: 'You already have an active Free Pass. Check your email for login instructions.' },
            { status: 400 }
          );
        }
      }
      if (existingRequest.status === FreePassStatus.REJECTED) {
        // Check if rejection was recent (within 7 days)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (existingRequest.reviewedAt && existingRequest.reviewedAt > sevenDaysAgo) {
          return NextResponse.json(
            { error: 'Your previous Free Pass request was declined. Please contact us for more information.' },
            { status: 400 }
          );
        }
      }
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;

    // Create the Free Pass request
    const freePassRequest = await createFreePassRequest({
      email,
      companyName,
      companyDomain: emailDomain,
      jobTitle,
      useCase,
      ipAddress: ip,
      userAgent,
      referrer,
    });

    // Send email notifications
    if (isEmailConfigured()) {
      // Send confirmation email to user
      const confirmationResult = await sendFreePassRequestConfirmationEmail({
        to: email,
        requestId: freePassRequest.id,
        companyName,
      });

      if (!confirmationResult.success) {
        logger.error('Failed to send Free Pass confirmation email', {
          email,
          requestId: freePassRequest.id,
          error: confirmationResult.error,
        });
      }

      // Send notification email to admin
      const adminResult = await sendFreePassAdminNotificationEmail({
        to: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
        requestId: freePassRequest.id,
        companyName,
      });

      if (!adminResult.success) {
        logger.error('Failed to send admin notification email', {
          requestId: freePassRequest.id,
          error: adminResult.error,
        });
      }
    } else {
      // Log for development
      logger.info('Free Pass request created (email not configured)', {
        id: freePassRequest.id,
        email: freePassRequest.email,
        companyName: freePassRequest.companyName,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Your Free Pass request has been submitted successfully. You will receive an email once approved.',
      requestId: freePassRequest.id,
    });
  } catch (error) {
    console.error('Free Pass request error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
