/**
 * Free Pass Database Operations
 * Handles all database operations related to Free Pass requests
 */

import { prisma } from '@/lib/db';
import { FreePassStatus, Prisma } from '@prisma/client';

interface CreateFreePassRequestData {
  email: string;
  companyName?: string;
  companyDomain?: string;
  jobTitle?: string;
  useCase?: string;
  termsVersion?: string;
  ndaVersion?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}

/**
 * Create a new Free Pass request
 */
export async function createFreePassRequest(data: CreateFreePassRequestData) {
  // Check if there's already a pending or approved request for this email
  const existingRequest = await prisma.freePassRequest.findFirst({
    where: {
      email: data.email.toLowerCase(),
      status: {
        in: [FreePassStatus.PENDING, FreePassStatus.APPROVED],
      },
    },
  });

  if (existingRequest) {
    if (existingRequest.status === FreePassStatus.PENDING) {
      throw new Error('A Free Pass request for this email is already pending review.');
    }
    if (existingRequest.status === FreePassStatus.APPROVED) {
      // Check if it's still valid
      if (existingRequest.accessExpiresAt && existingRequest.accessExpiresAt > new Date()) {
        throw new Error('You already have an active Free Pass. Check your email for login instructions.');
      }
    }
  }

  // Extract domain from email if not provided
  const emailDomain = data.companyDomain || data.email.split('@')[1]?.toLowerCase();

  return prisma.freePassRequest.create({
    data: {
      email: data.email.toLowerCase(),
      companyName: data.companyName,
      companyDomain: emailDomain,
      jobTitle: data.jobTitle,
      useCase: data.useCase,
      termsAcceptedAt: new Date(),
      ndaAcceptedAt: new Date(),
      termsVersion: data.termsVersion || '1.0',
      ndaVersion: data.ndaVersion || '1.0',
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      referrer: data.referrer,
      status: FreePassStatus.PENDING,
    },
  });
}

/**
 * Get a Free Pass request by ID
 */
export async function getFreePassRequest(id: string) {
  return prisma.freePassRequest.findUnique({
    where: { id },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      feedback: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Get all Free Pass requests with optional filtering
 */
export async function getFreePassRequests(options?: {
  status?: FreePassStatus;
  page?: number;
  limit?: number;
}) {
  const { status, page = 1, limit = 20 } = options || {};

  const where = status ? { status } : {};

  const [requests, total] = await Promise.all([
    prisma.freePassRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            activities: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.freePassRequest.count({ where }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

/**
 * Approve a Free Pass request
 */
export async function approveFreePassRequest(
  id: string,
  adminUserId: string,
  adminNotes?: string
) {
  const request = await prisma.freePassRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new Error('Free Pass request not found');
  }

  if (request.status !== FreePassStatus.PENDING) {
    throw new Error('This request has already been processed');
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  return prisma.freePassRequest.update({
    where: { id },
    data: {
      status: FreePassStatus.APPROVED,
      reviewedBy: adminUserId,
      reviewedAt: now,
      adminNotes,
      accessStartedAt: now,
      accessExpiresAt: expiresAt,
    },
  });
}

/**
 * Reject a Free Pass request
 */
export async function rejectFreePassRequest(
  id: string,
  adminUserId: string,
  rejectionReason?: string,
  adminNotes?: string
) {
  const request = await prisma.freePassRequest.findUnique({
    where: { id },
  });

  if (!request) {
    throw new Error('Free Pass request not found');
  }

  if (request.status !== FreePassStatus.PENDING) {
    throw new Error('This request has already been processed');
  }

  return prisma.freePassRequest.update({
    where: { id },
    data: {
      status: FreePassStatus.REJECTED,
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
      rejectionReason,
      adminNotes,
    },
  });
}

/**
 * Log an activity for a Free Pass session
 */
export async function logFreePassActivity(
  requestId: string,
  action: string,
  details?: Record<string, unknown>,
  path?: string,
  duration?: number
) {
  return prisma.freePassActivity.create({
    data: {
      requestId,
      action,
      details: details ? (details as Prisma.InputJsonValue) : Prisma.JsonNull,
      path,
      duration,
    },
  });
}

/**
 * Save feedback from a Free Pass user
 */
export async function saveFreePassFeedback(
  requestId: string,
  feedback: {
    overallScore?: number;
    easeOfUseRating?: number;
    contentQualityRating?: number;
    featureRating?: number;
    wouldRecommend?: boolean;
    mostUsefulFeature?: string;
    missingFeatures?: string;
    generalFeedback?: string;
    interestedInPaid?: boolean;
    preferredPlan?: string;
  }
) {
  // First check if feedback already exists
  const existing = await prisma.freePassFeedback.findUnique({
    where: { requestId },
  });

  if (existing) {
    return prisma.freePassFeedback.update({
      where: { requestId },
      data: feedback,
    });
  }

  return prisma.freePassFeedback.create({
    data: {
      requestId,
      ...feedback,
    },
  });
}

/**
 * Check if a Free Pass is valid and active
 */
export async function isValidFreePass(email: string): Promise<boolean> {
  const request = await prisma.freePassRequest.findFirst({
    where: {
      email: email.toLowerCase(),
      status: FreePassStatus.APPROVED,
      accessExpiresAt: {
        gt: new Date(),
      },
    },
  });

  return !!request;
}

/**
 * Get Free Pass request by email
 */
export async function getFreePassByEmail(email: string) {
  return prisma.freePassRequest.findFirst({
    where: {
      email: email.toLowerCase(),
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Get expired Free Passes that need feedback collection
 */
export async function getExpiredFreePassesNeedingFeedback() {
  return prisma.freePassRequest.findMany({
    where: {
      status: FreePassStatus.APPROVED,
      accessExpiresAt: {
        lt: new Date(),
      },
      feedback: null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

/**
 * Mark a Free Pass as completed (expired with feedback collected)
 */
export async function completeFreePass(id: string) {
  return prisma.freePassRequest.update({
    where: { id },
    data: {
      status: FreePassStatus.COMPLETED,
    },
  });
}

/**
 * Get Free Pass analytics for admin dashboard
 */
export async function getFreePassAnalytics() {
  const [
    totalRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    completedRequests,
    feedbackCount,
    avgRating,
    recentRequests,
  ] = await Promise.all([
    prisma.freePassRequest.count(),
    prisma.freePassRequest.count({ where: { status: FreePassStatus.PENDING } }),
    prisma.freePassRequest.count({ where: { status: FreePassStatus.APPROVED } }),
    prisma.freePassRequest.count({ where: { status: FreePassStatus.REJECTED } }),
    prisma.freePassRequest.count({ where: { status: FreePassStatus.COMPLETED } }),
    prisma.freePassFeedback.count(),
    prisma.freePassFeedback.aggregate({
      _avg: {
        overallScore: true,
      },
    }),
    prisma.freePassRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        _count: {
          select: {
            activities: true,
          },
        },
      },
    }),
  ]);

  return {
    totalRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    completedRequests,
    feedbackCount,
    averageRating: avgRating._avg.overallScore,
    recentRequests,
    conversionRate: completedRequests > 0
      ? ((feedbackCount / completedRequests) * 100).toFixed(1)
      : 0,
  };
}
