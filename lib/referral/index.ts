/**
 * Referral System
 * Track referrals and reward users for bringing new members
 */

import { prisma } from '@/lib/db'
import { nanoid } from 'nanoid'

/**
 * Referral reward configuration
 */
export const REFERRAL_REWARDS = {
  // Days of premium access for referrer when referred user signs up
  SIGNUP_REWARD_DAYS: 7,
  // Days of premium access for referrer when referred user subscribes
  SUBSCRIPTION_REWARD_DAYS: 30,
  // Days of premium access for new user (referred)
  NEW_USER_REWARD_DAYS: 14,
  // Maximum referrals that can be rewarded
  MAX_REWARDED_REFERRALS: 50,
}

/**
 * Generate a unique referral code for a user
 */
export async function generateReferralCode(userId: string): Promise<string> {
  // Check if user already has a referral code
  const existingReferral = await prisma.referral.findFirst({
    where: { referrerId: userId },
    select: { code: true },
  })

  if (existingReferral?.code) {
    return existingReferral.code
  }

  // Generate a new unique code
  let code = nanoid(8).toUpperCase()
  let attempts = 0

  while (attempts < 10) {
    const existing = await prisma.referral.findUnique({
      where: { code },
    })

    if (!existing) {
      break
    }

    code = nanoid(8).toUpperCase()
    attempts++
  }

  // Create referral record with the new code
  await prisma.referral.create({
    data: {
      referrerId: userId,
      code,
      referrerRewardDays: 0,
      referredRewardDays: 0,
    },
  })

  return code
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: string) {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
  })

  const stats = {
    totalReferrals: referrals.length,
    signedUp: referrals.filter((r) => r.signedUp).length,
    subscribed: referrals.filter((r) => r.subscribed).length,
    pendingRewards: referrals.filter((r) => !r.rewardsApplied && r.referrerRewardDays > 0).length,
    totalRewardDays: referrals.reduce((acc, r) => acc + (r.referrerRewardDays || 0), 0),
  }

  return {
    stats,
    referrals: referrals.map((r) => ({
      id: r.id,
      code: r.code,
      signedUp: r.signedUp,
      subscribed: r.subscribed,
      rewardDays: r.referrerRewardDays,
      rewardsApplied: r.rewardsApplied,
      createdAt: r.createdAt,
      signedUpAt: r.signedUpAt,
      subscribedAt: r.subscribedAt,
    })),
  }
}

/**
 * Process a referral when a new user signs up
 */
export async function processReferralSignup(
  referralCode: string,
  newUserId: string
): Promise<{ success: boolean; message: string }> {
  // Find the referral record
  const referral = await prisma.referral.findUnique({
    where: { code: referralCode },
  })

  if (!referral) {
    return { success: false, message: 'Invalid referral code' }
  }

  // Prevent self-referral
  if (referral.referrerId === newUserId) {
    return { success: false, message: 'Cannot refer yourself' }
  }

  // Check if already signed up
  if (referral.signedUp) {
    return { success: false, message: 'Referral code already used' }
  }

  // Check if referrer has reached max referrals
  const referrerReferralCount = await prisma.referral.count({
    where: { referrerId: referral.referrerId, signedUp: true },
  })

  if (referrerReferralCount >= REFERRAL_REWARDS.MAX_REWARDED_REFERRALS) {
    return { success: false, message: 'Referrer has reached maximum referrals' }
  }

  // Update the referral record
  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      referredId: newUserId,
      signedUp: true,
      signedUpAt: new Date(),
      referrerRewardDays: REFERRAL_REWARDS.SIGNUP_REWARD_DAYS,
      referredRewardDays: REFERRAL_REWARDS.NEW_USER_REWARD_DAYS,
    },
  })

  return {
    success: true,
    message: `Referral recorded! ${REFERRAL_REWARDS.SIGNUP_REWARD_DAYS} days of premium access pending.`,
  }
}

/**
 * Process referral reward when referred user subscribes
 */
export async function processReferralSubscription(
  userId: string
): Promise<void> {
  // Find the referral for this user
  const referral = await prisma.referral.findFirst({
    where: {
      referredId: userId,
      signedUp: true,
      subscribed: false,
    },
  })

  if (!referral) {
    return
  }

  // Update referral with subscription bonus
  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      subscribed: true,
      subscribedAt: new Date(),
      referrerRewardDays: REFERRAL_REWARDS.SUBSCRIPTION_REWARD_DAYS,
    },
  })
}

/**
 * Claim pending referral rewards
 */
export async function claimReferralRewards(userId: string): Promise<{
  success: boolean
  message: string
  daysAdded?: number
}> {
  // Get all unclaimed referral rewards
  const referrals = await prisma.referral.findMany({
    where: {
      referrerId: userId,
      rewardsApplied: false,
      referrerRewardDays: { gt: 0 },
    },
  })

  if (referrals.length === 0) {
    return { success: false, message: 'No rewards to claim' }
  }

  const totalDays = referrals.reduce((acc, r) => acc + (r.referrerRewardDays || 0), 0)

  // Mark rewards as claimed
  await prisma.referral.updateMany({
    where: {
      id: { in: referrals.map((r) => r.id) },
    },
    data: {
      rewardsApplied: true,
    },
  })

  // Extend user's subscription
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  const now = new Date()
  const currentEnd = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd)
    : now
  const baseDate = currentEnd > now ? currentEnd : now
  const newEnd = new Date(baseDate.getTime() + totalDays * 24 * 60 * 60 * 1000)

  if (subscription) {
    await prisma.subscription.update({
      where: { userId },
      data: {
        tier: subscription.tier === 'FREE' ? 'PREMIUM' : subscription.tier,
        status: 'ACTIVE',
        currentPeriodEnd: newEnd,
      },
    })
  } else {
    await prisma.subscription.create({
      data: {
        userId,
        tier: 'PREMIUM',
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: newEnd,
      },
    })
  }

  return {
    success: true,
    message: `Successfully claimed ${totalDays} days of premium access!`,
    daysAdded: totalDays,
  }
}

/**
 * Get referral link for a user
 */
export function getReferralLink(referralCode: string, baseUrl: string): string {
  return `${baseUrl}/signup?ref=${referralCode}`
}

/**
 * Track referral click
 */
export async function trackReferralClick(code: string): Promise<void> {
  await prisma.referral.update({
    where: { code },
    data: {
      clickCount: { increment: 1 },
    },
  }).catch(() => {
    // Ignore if referral not found
  })
}
