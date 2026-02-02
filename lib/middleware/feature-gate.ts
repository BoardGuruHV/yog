/**
 * Feature Gating Middleware
 * Provides utilities to restrict features based on subscription tier
 */

import { auth } from '@/lib/auth'
import { errorResponse, ErrorCodes } from '@/lib/api-utils'
import { hasFeatureAccess, checkAIChatUsage, checkProgramLimit, TIER_LIMITS, type Feature } from '@/lib/stripe'
import { prisma } from '@/lib/db'

/**
 * Feature requirements for different features
 */
export const FEATURE_REQUIREMENTS: Record<Feature, { minTier: string; description: string }> = {
  aiChatPerDay: {
    minTier: 'FREE',
    description: 'AI chat is available on all plans with usage limits',
  },
  programsTotal: {
    minTier: 'FREE',
    description: 'Program creation is available on all plans with limits',
  },
  aiProgramGeneration: {
    minTier: 'PREMIUM',
    description: 'AI-generated programs require Premium or higher',
  },
  poseDetection: {
    minTier: 'PREMIUM',
    description: 'Pose detection requires Premium or higher',
  },
  fullAnalytics: {
    minTier: 'PREMIUM',
    description: 'Full analytics require Premium or higher',
  },
  offlineAccess: {
    minTier: 'PREMIUM',
    description: 'Offline access requires Premium or higher',
  },
  prioritySupport: {
    minTier: 'PRO',
    description: 'Priority support is available for Pro subscribers',
  },
}

/**
 * Result of a feature gate check
 */
interface FeatureGateResult {
  allowed: boolean
  reason?: string
  remaining?: number
  limit?: number
  upgradeRequired?: boolean
}

/**
 * Check if user can access a feature
 * @param userId - The user ID to check
 * @param feature - The feature to check access for
 */
export async function checkFeatureAccess(
  userId: string,
  feature: Feature
): Promise<FeatureGateResult> {
  const hasAccess = await hasFeatureAccess(userId, feature)

  if (hasAccess) {
    return { allowed: true }
  }

  const requirement = FEATURE_REQUIREMENTS[feature]
  return {
    allowed: false,
    reason: requirement.description,
    upgradeRequired: true,
  }
}

/**
 * Check AI chat usage limits
 * @param userId - The user ID to check
 */
export async function checkAIChatLimit(userId: string): Promise<FeatureGateResult> {
  const result = await checkAIChatUsage(userId)

  if (result.allowed) {
    return {
      allowed: true,
      remaining: result.remaining,
    }
  }

  return {
    allowed: false,
    reason: 'Daily AI chat limit reached. Upgrade for more chats.',
    remaining: 0,
    upgradeRequired: true,
  }
}

/**
 * Check program creation limits
 * @param userId - The user ID to check
 */
export async function checkProgramCreationLimit(userId: string): Promise<FeatureGateResult> {
  const result = await checkProgramLimit(userId)

  if (result.allowed) {
    return {
      allowed: true,
      remaining: result.remaining,
    }
  }

  return {
    allowed: false,
    reason: 'Program limit reached. Upgrade for unlimited programs.',
    remaining: 0,
    upgradeRequired: true,
  }
}

/**
 * Higher-order function to require a specific feature
 * Returns an error response if the user doesn't have access
 */
export function requireFeature(feature: Feature) {
  return async function checkFeature() {
    const session = await auth()
    if (!session?.user?.id) {
      return {
        success: false as const,
        response: errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401),
      }
    }

    const result = await checkFeatureAccess(session.user.id, feature)

    if (!result.allowed) {
      return {
        success: false as const,
        response: errorResponse(
          ErrorCodes.FORBIDDEN,
          result.reason || 'Feature not available on your plan',
          403,
          { upgradeRequired: true, feature }
        ),
      }
    }

    return { success: true as const, userId: session.user.id }
  }
}

/**
 * Higher-order function to require AI chat access
 * Checks both feature access and usage limits
 */
export async function requireAIChatAccess() {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      success: false as const,
      response: errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401),
    }
  }

  const result = await checkAIChatLimit(session.user.id)

  if (!result.allowed) {
    return {
      success: false as const,
      response: errorResponse(
        ErrorCodes.FORBIDDEN,
        result.reason || 'AI chat limit reached',
        403,
        {
          upgradeRequired: result.upgradeRequired,
          remaining: result.remaining,
        }
      ),
    }
  }

  return {
    success: true as const,
    userId: session.user.id,
    remaining: result.remaining,
  }
}

/**
 * Higher-order function to require program creation access
 * Checks both feature access and creation limits
 */
export async function requireProgramCreationAccess() {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      success: false as const,
      response: errorResponse(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401),
    }
  }

  const result = await checkProgramCreationLimit(session.user.id)

  if (!result.allowed) {
    return {
      success: false as const,
      response: errorResponse(
        ErrorCodes.FORBIDDEN,
        result.reason || 'Program limit reached',
        403,
        {
          upgradeRequired: result.upgradeRequired,
          remaining: result.remaining,
        }
      ),
    }
  }

  return {
    success: true as const,
    userId: session.user.id,
    remaining: result.remaining,
  }
}

/**
 * Increment AI chat usage for a user
 * Call this after a successful AI chat interaction
 */
export async function incrementAIChatUsage(userId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    // Create subscription record for free tier
    await prisma.subscription.create({
      data: {
        userId,
        tier: 'FREE',
        status: 'ACTIVE',
        aiChatUsageToday: 1,
        aiChatUsageReset: new Date(),
      },
    })
    return
  }

  // Check if we need to reset daily usage
  const now = new Date()
  const resetDate = new Date(subscription.aiChatUsageReset)
  const isNewDay =
    now.getDate() !== resetDate.getDate() ||
    now.getMonth() !== resetDate.getMonth() ||
    now.getFullYear() !== resetDate.getFullYear()

  if (isNewDay) {
    await prisma.subscription.update({
      where: { userId },
      data: {
        aiChatUsageToday: 1,
        aiChatUsageReset: now,
      },
    })
  } else {
    await prisma.subscription.update({
      where: { userId },
      data: {
        aiChatUsageToday: { increment: 1 },
      },
    })
  }
}

/**
 * Increment program count for a user
 * Call this after successfully creating a program
 */
export async function incrementProgramCount(userId: string): Promise<void> {
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      tier: 'FREE',
      status: 'ACTIVE',
      programsCreated: 1,
    },
    update: {
      programsCreated: { increment: 1 },
    },
  })
}

/**
 * Decrement program count for a user
 * Call this after deleting a program
 */
export async function decrementProgramCount(userId: string): Promise<void> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (subscription && subscription.programsCreated > 0) {
    await prisma.subscription.update({
      where: { userId },
      data: {
        programsCreated: { decrement: 1 },
      },
    })
  }
}

/**
 * Get feature limits for a user's current tier
 */
export async function getUserFeatureLimits(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  const tier = subscription?.tier || 'FREE'
  const limits = TIER_LIMITS[tier]

  return {
    tier,
    limits,
    usage: subscription
      ? {
          aiChatToday: subscription.aiChatUsageToday,
          programsCreated: subscription.programsCreated,
        }
      : {
          aiChatToday: 0,
          programsCreated: 0,
        },
  }
}
