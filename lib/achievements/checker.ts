import prisma from "@/lib/db";

// Achievement requirement types
export interface AchievementRequirement {
  type: "streak" | "practice_count" | "pose_count" | "category_count" | "mastery_level" | "time_of_day" | "duration" | "special";
  value: number;
  category?: string;
  asanaId?: string;
  timeRange?: string; // "morning" (5-9), "evening" (18-22)
}

// Achievement check result
export interface CheckResult {
  achieved: boolean;
  progress: number;
  target: number;
}

// Check a specific achievement requirement for a user
export async function checkRequirement(
  userId: string,
  requirement: AchievementRequirement
): Promise<CheckResult> {
  switch (requirement.type) {
    case "streak":
      return checkStreakRequirement(userId, requirement.value);
    case "practice_count":
      return checkPracticeCountRequirement(userId, requirement.value);
    case "pose_count":
      return checkPoseCountRequirement(userId, requirement.value);
    case "category_count":
      return checkCategoryCountRequirement(userId, requirement.value, requirement.category);
    case "mastery_level":
      return checkMasteryLevelRequirement(userId, requirement.value, requirement.asanaId);
    case "time_of_day":
      return checkTimeOfDayRequirement(userId, requirement.value, requirement.timeRange);
    case "duration":
      return checkDurationRequirement(userId, requirement.value);
    default:
      return { achieved: false, progress: 0, target: requirement.value };
  }
}

async function checkStreakRequirement(userId: string, targetStreak: number): Promise<CheckResult> {
  const streak = await prisma.streak.findUnique({
    where: { userId },
  });

  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const maxStreak = Math.max(currentStreak, longestStreak);

  return {
    achieved: maxStreak >= targetStreak,
    progress: Math.min(maxStreak, targetStreak),
    target: targetStreak,
  };
}

async function checkPracticeCountRequirement(userId: string, targetCount: number): Promise<CheckResult> {
  const count = await prisma.practiceLog.count({
    where: { userId },
  });

  return {
    achieved: count >= targetCount,
    progress: Math.min(count, targetCount),
    target: targetCount,
  };
}

async function checkPoseCountRequirement(userId: string, targetCount: number): Promise<CheckResult> {
  const masteries = await prisma.poseMastery.count({
    where: {
      userId,
      practiceCount: { gte: 1 },
    },
  });

  return {
    achieved: masteries >= targetCount,
    progress: Math.min(masteries, targetCount),
    target: targetCount,
  };
}

async function checkCategoryCountRequirement(
  userId: string,
  targetCount: number,
  category?: string
): Promise<CheckResult> {
  if (category) {
    // Check specific category
    const masteries = await prisma.poseMastery.count({
      where: {
        userId,
        practiceCount: { gte: 1 },
        asana: {
          category: category as "STANDING" | "SEATED" | "PRONE" | "SUPINE" | "INVERSION" | "BALANCE" | "TWIST" | "FORWARD_BEND" | "BACK_BEND",
        },
      },
    });

    return {
      achieved: masteries >= targetCount,
      progress: Math.min(masteries, targetCount),
      target: targetCount,
    };
  } else {
    // Check all categories practiced
    const categories = await prisma.poseMastery.findMany({
      where: {
        userId,
        practiceCount: { gte: 1 },
      },
      include: {
        asana: {
          select: { category: true },
        },
      },
    });

    const uniqueCategories = new Set(categories.map((m) => m.asana.category));
    const count = uniqueCategories.size;

    return {
      achieved: count >= targetCount,
      progress: Math.min(count, targetCount),
      target: targetCount,
    };
  }
}

async function checkMasteryLevelRequirement(
  userId: string,
  targetLevel: number,
  asanaId?: string
): Promise<CheckResult> {
  if (asanaId) {
    // Check specific asana mastery level
    const mastery = await prisma.poseMastery.findUnique({
      where: {
        userId_asanaId: { userId, asanaId },
      },
    });

    const level = mastery?.level || 0;

    return {
      achieved: level >= targetLevel,
      progress: Math.min(level, targetLevel),
      target: targetLevel,
    };
  } else {
    // Check any asana at target level
    const count = await prisma.poseMastery.count({
      where: {
        userId,
        level: { gte: targetLevel },
      },
    });

    return {
      achieved: count >= 1,
      progress: count >= 1 ? targetLevel : 0,
      target: targetLevel,
    };
  }
}

async function checkTimeOfDayRequirement(
  userId: string,
  targetCount: number,
  timeRange?: string
): Promise<CheckResult> {
  const logs = await prisma.practiceLog.findMany({
    where: { userId },
    select: { createdAt: true },
  });

  let count = 0;
  for (const log of logs) {
    const hour = log.createdAt.getHours();
    if (timeRange === "morning" && hour >= 5 && hour < 9) {
      count++;
    } else if (timeRange === "evening" && hour >= 18 && hour < 22) {
      count++;
    }
  }

  return {
    achieved: count >= targetCount,
    progress: Math.min(count, targetCount),
    target: targetCount,
  };
}

async function checkDurationRequirement(userId: string, targetMinutes: number): Promise<CheckResult> {
  const result = await prisma.practiceLog.aggregate({
    where: { userId },
    _sum: { duration: true },
  });

  const totalMinutes = result._sum.duration || 0;

  return {
    achieved: totalMinutes >= targetMinutes,
    progress: Math.min(totalMinutes, targetMinutes),
    target: targetMinutes,
  };
}

// Check all achievements for a user and update progress
export async function checkAllAchievements(userId: string): Promise<{
  newlyUnlocked: string[];
  updated: string[];
}> {
  const achievements = await prisma.achievement.findMany();
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
  });

  const userAchievementMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua])
  );

  const newlyUnlocked: string[] = [];
  const updated: string[] = [];

  for (const achievement of achievements) {
    const requirement = achievement.requirement as unknown as AchievementRequirement;
    const result = await checkRequirement(userId, requirement);
    const existing = userAchievementMap.get(achievement.id);

    if (existing) {
      // Already tracking this achievement
      if (existing.unlockedAt) {
        // Already unlocked, skip
        continue;
      }

      if (result.achieved) {
        // Just unlocked!
        await prisma.userAchievement.update({
          where: { id: existing.id },
          data: {
            progress: result.progress,
            unlockedAt: new Date(),
          },
        });
        newlyUnlocked.push(achievement.id);
      } else if (result.progress !== existing.progress) {
        // Update progress
        await prisma.userAchievement.update({
          where: { id: existing.id },
          data: { progress: result.progress },
        });
        updated.push(achievement.id);
      }
    } else {
      // Not tracking yet, create record
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
          progress: result.progress,
          unlockedAt: result.achieved ? new Date() : null,
        },
      });

      if (result.achieved) {
        newlyUnlocked.push(achievement.id);
      }
    }
  }

  return { newlyUnlocked, updated };
}

// Get user's achievement summary
export async function getAchievementSummary(userId: string) {
  const achievements = await prisma.achievement.findMany({
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
  });

  const userAchievementMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua])
  );

  const totalPoints = userAchievements
    .filter((ua) => ua.unlockedAt)
    .reduce((sum, ua) => {
      const achievement = achievements.find((a) => a.id === ua.achievementId);
      return sum + (achievement?.points || 0);
    }, 0);

  const unlockedCount = userAchievements.filter((ua) => ua.unlockedAt).length;
  const totalCount = achievements.length;

  const categorizedAchievements = achievements.map((achievement) => {
    const userAchievement = userAchievementMap.get(achievement.id);
    const requirement = achievement.requirement as unknown as AchievementRequirement;

    return {
      ...achievement,
      progress: userAchievement?.progress || 0,
      target: requirement.value,
      unlockedAt: userAchievement?.unlockedAt || null,
      isUnlocked: !!userAchievement?.unlockedAt,
    };
  });

  // Group by category
  const byCategory: Record<string, typeof categorizedAchievements> = {};
  for (const achievement of categorizedAchievements) {
    if (!byCategory[achievement.category]) {
      byCategory[achievement.category] = [];
    }
    byCategory[achievement.category].push(achievement);
  }

  return {
    totalPoints,
    unlockedCount,
    totalCount,
    completionPercentage: Math.round((unlockedCount / totalCount) * 100),
    byCategory,
    recentUnlocks: categorizedAchievements
      .filter((a) => a.isUnlocked)
      .sort((a, b) => {
        if (!a.unlockedAt || !b.unlockedAt) return 0;
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      })
      .slice(0, 5),
  };
}

// Mark achievement notification as seen
export async function markAchievementNotified(userId: string, achievementId: string) {
  await prisma.userAchievement.updateMany({
    where: {
      userId,
      achievementId,
    },
    data: {
      notified: true,
    },
  });
}

// Get unnotified achievements
export async function getUnnotifiedAchievements(userId: string) {
  return prisma.userAchievement.findMany({
    where: {
      userId,
      unlockedAt: { not: null },
      notified: false,
    },
    include: {
      achievement: true,
    },
  });
}
