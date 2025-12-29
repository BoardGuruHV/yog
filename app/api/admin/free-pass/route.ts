/**
 * Admin Free Pass API
 * GET /api/admin/free-pass - List all Free Pass requests with filtering
 * POST /api/admin/free-pass - Admin actions (approve, reject)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { FreePassStatus, UserRole } from '@prisma/client';
import {
  getFreePassRequests,
  getFreePassRequest,
  approveFreePassRequest,
  rejectFreePassRequest,
  getFreePassAnalytics,
} from '@/lib/db/free-pass';

/**
 * Check if user is admin
 */
async function isAdmin(request: NextRequest): Promise<{ isAuthorized: boolean; userId?: string }> {
  // Demo mode for development - bypass auth
  if (process.env.NODE_ENV === 'development') {
    const { searchParams } = new URL(request.url);
    if (searchParams.get('demo') === 'true') {
      return { isAuthorized: true, userId: 'demo-admin' };
    }
  }

  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { isAuthorized: false };
    }

    // Check if user has admin role
    // In production, verify against database
    const userRole = (session.user as { role?: UserRole }).role;
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
      return { isAuthorized: false };
    }

    return { isAuthorized: true, userId: session.user.id };
  } catch {
    return { isAuthorized: false };
  }
}

/**
 * GET /api/admin/free-pass
 * List Free Pass requests with optional filtering
 */
export async function GET(request: NextRequest) {
  const { isAuthorized } = await isAdmin(request);

  if (!isAuthorized) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as FreePassStatus | null;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const includeAnalytics = searchParams.get('analytics') === 'true';

    const data = await getFreePassRequests({
      status: status || undefined,
      page,
      limit,
    });

    let analytics = null;
    if (includeAnalytics) {
      analytics = await getFreePassAnalytics();
    }

    return NextResponse.json({
      ...data,
      analytics,
    });
  } catch (error) {
    console.error('Error fetching Free Pass requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Free Pass requests' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/free-pass
 * Admin actions: approve or reject requests
 */
export async function POST(request: NextRequest) {
  const { isAuthorized, userId } = await isAdmin(request);

  if (!isAuthorized || !userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action, requestId, rejectionReason, adminNotes } = body;

    if (!action || !requestId) {
      return NextResponse.json(
        { error: 'Action and requestId are required' },
        { status: 400 }
      );
    }

    // Get the request first
    const freePassRequest = await getFreePassRequest(requestId);
    if (!freePassRequest) {
      return NextResponse.json(
        { error: 'Free Pass request not found' },
        { status: 404 }
      );
    }

    if (freePassRequest.status !== FreePassStatus.PENDING) {
      return NextResponse.json(
        { error: 'This request has already been processed' },
        { status: 400 }
      );
    }

    let result;
    switch (action) {
      case 'approve':
        result = await approveFreePassRequest(requestId, userId, adminNotes);

        // TODO: Send approval email to user with login instructions
        console.log('Free Pass approved:', {
          id: result.id,
          email: result.email,
          expiresAt: result.accessExpiresAt,
        });

        return NextResponse.json({
          success: true,
          message: 'Free Pass approved successfully',
          request: result,
        });

      case 'reject':
        result = await rejectFreePassRequest(requestId, userId, rejectionReason, adminNotes);

        // TODO: Send rejection email to user
        console.log('Free Pass rejected:', {
          id: result.id,
          email: result.email,
          reason: rejectionReason,
        });

        return NextResponse.json({
          success: true,
          message: 'Free Pass rejected',
          request: result,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Must be "approve" or "reject"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing Free Pass action:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
