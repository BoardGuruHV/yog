import prisma from "@/lib/db";

export type ReportPeriod = "week" | "month" | "quarter" | "year";

export interface PracticeStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  longestSession: number;
  daysActive: number;
  consistencyScore: number;
}

export interface MoodStats {
  averageMoodBefore: number | null;
  averageMoodAfter: number | null;
  moodImprovement: number | null;
  averageEnergy: number | null;
}

export interface PoseStats {
  poseId: string;
  poseName: string;
  practiceCount: number;
  totalMinutes: number;
  masteryLevel: number | null;
}

export interface BodyPartStats {
  bodyPart: string;
  practiceCount: number;
  percentage: number;
}

export interface CategoryStats {
  category: string;
  practiceCount: number;
  percentage: number;
}

export interface GoalProgress {
  goalId: string;
  title: string;
  type: string;
  target: number;
  current: number;
  progress: number;
  completed: boolean;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalPractices: number;
  streakChange: number;
}

export interface Insight {
  type: "achievement" | "suggestion" | "warning" | "milestone";
  title: string;
  description: string;
  icon: string;
}

export interface Report {
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  practice: PracticeStats;
  mood: MoodStats;
  topPoses: PoseStats[];
  bodyParts: BodyPartStats[];
  categories: CategoryStats[];
  goals: GoalProgress[];
  streak: StreakStats;
  insights: Insight[];
  comparison: {
    sessionsChange: number;
    minutesChange: number;
    consistencyChange: number;
  };
}

function getDateRange(period: ReportPeriod): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start.setMonth(start.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(start.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end };
}

function getPreviousDateRange(period: ReportPeriod, currentStart: Date): { start: Date; end: Date } {
  const end = new Date(currentStart);
  end.setMilliseconds(-1);

  const start = new Date(end);
  start.setHours(0, 0, 0, 0);

  switch (period) {
    case "week":
      start.setDate(start.getDate() - 7);
      break;
    case "month":
      start.setMonth(start.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(start.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(start.getFullYear() - 1);
      break;
  }

  return { start, end };
}

export async function generateReport(
  userId: string,
  period: ReportPeriod
): Promise<Report> {
  const { start, end } = getDateRange(period);
  const previousRange = getPreviousDateRange(period, start);

  // Fetch practice logs for current period
  const practiceLogs = await prisma.practiceLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch practice logs for previous period (for comparison)
  const previousLogs = await prisma.practiceLog.findMany({
    where: {
      userId,
      createdAt: {
        gte: previousRange.start,
        lte: previousRange.end,
      },
    },
  });

  // Fetch mastery data
  const masteries = await prisma.poseMastery.findMany({
    where: { userId },
    include: {
      asana: {
        select: {
          id: true,
          nameEnglish: true,
          category: true,
          targetBodyParts: true,
        },
      },
    },
  });

  // Fetch user goals
  const goals = await prisma.goal.findMany({
    where: {
      userId,
      isActive: true,
    },
  });

  // Fetch streak data
  const streak = await prisma.streak.findUnique({
    where: { userId },
  });

  // Calculate practice stats
  const totalSessions = practiceLogs.length;
  const totalMinutes = practiceLogs.reduce((sum, log) => sum + log.duration, 0);
  const averageSessionLength = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
  const longestSession = practiceLogs.length > 0
    ? Math.max(...practiceLogs.map(log => log.duration))
    : 0;

  // Calculate days active
  const activeDays = new Set(
    practiceLogs.map(log => log.createdAt.toISOString().split("T")[0])
  ).size;

  // Calculate consistency score (percentage of days with practice)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const consistencyScore = totalDays > 0 ? Math.round((activeDays / totalDays) * 100) : 0;

  // Calculate mood stats
  const logsWithMood = practiceLogs.filter(
    log => log.moodBefore !== null || log.moodAfter !== null
  );
  const avgMoodBefore = logsWithMood.length > 0
    ? logsWithMood.reduce((sum, log) => sum + (log.moodBefore || 0), 0) /
      logsWithMood.filter(l => l.moodBefore !== null).length
    : null;
  const avgMoodAfter = logsWithMood.length > 0
    ? logsWithMood.reduce((sum, log) => sum + (log.moodAfter || 0), 0) /
      logsWithMood.filter(l => l.moodAfter !== null).length
    : null;
  const logsWithEnergy = practiceLogs.filter(log => log.energyLevel !== null);
  const avgEnergy = logsWithEnergy.length > 0
    ? logsWithEnergy.reduce((sum, log) => sum + (log.energyLevel || 0), 0) / logsWithEnergy.length
    : null;

  // Calculate top poses from mastery data
  const topPoses: PoseStats[] = masteries
    .filter(m => m.lastPracticed && m.lastPracticed >= start)
    .sort((a, b) => b.practiceCount - a.practiceCount)
    .slice(0, 5)
    .map(m => ({
      poseId: m.asanaId,
      poseName: m.asana.nameEnglish,
      practiceCount: m.practiceCount,
      totalMinutes: Math.round(m.totalDuration / 60),
      masteryLevel: m.level,
    }));

  // Calculate body part distribution
  const bodyPartCounts: Record<string, number> = {};
  masteries.forEach(m => {
    if (m.lastPracticed && m.lastPracticed >= start) {
      m.asana.targetBodyParts.forEach(part => {
        bodyPartCounts[part] = (bodyPartCounts[part] || 0) + m.practiceCount;
      });
    }
  });
  const totalBodyPartPractices = Object.values(bodyPartCounts).reduce((a, b) => a + b, 0);
  const bodyParts: BodyPartStats[] = Object.entries(bodyPartCounts)
    .map(([bodyPart, practiceCount]) => ({
      bodyPart,
      practiceCount,
      percentage: totalBodyPartPractices > 0
        ? Math.round((practiceCount / totalBodyPartPractices) * 100)
        : 0,
    }))
    .sort((a, b) => b.practiceCount - a.practiceCount)
    .slice(0, 6);

  // Calculate category distribution
  const categoryCounts: Record<string, number> = {};
  masteries.forEach(m => {
    if (m.lastPracticed && m.lastPracticed >= start) {
      const cat = m.asana.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + m.practiceCount;
    }
  });
  const totalCategoryPractices = Object.values(categoryCounts).reduce((a, b) => a + b, 0);
  const categories: CategoryStats[] = Object.entries(categoryCounts)
    .map(([category, practiceCount]) => ({
      category: category.replace("_", " "),
      practiceCount,
      percentage: totalCategoryPractices > 0
        ? Math.round((practiceCount / totalCategoryPractices) * 100)
        : 0,
    }))
    .sort((a, b) => b.practiceCount - a.practiceCount);

  // Calculate goal progress
  const goalProgress: GoalProgress[] = goals.map(goal => ({
    goalId: goal.id,
    title: goal.title,
    type: goal.type,
    target: goal.target,
    current: goal.current,
    progress: goal.target > 0 ? Math.round((goal.current / goal.target) * 100) : 0,
    completed: goal.completed,
  }));

  // Calculate streak stats
  const previousStreak = await prisma.streak.findFirst({
    where: { userId },
  });
  const streakStats: StreakStats = {
    currentStreak: streak?.currentStreak || 0,
    longestStreak: streak?.longestStreak || 0,
    totalPractices: streak?.totalPractices || 0,
    streakChange: 0, // Would need historical data to calculate
  };

  // Calculate comparison with previous period
  const prevTotalSessions = previousLogs.length;
  const prevTotalMinutes = previousLogs.reduce((sum, log) => sum + log.duration, 0);
  const prevActiveDays = new Set(
    previousLogs.map(log => log.createdAt.toISOString().split("T")[0])
  ).size;
  const prevConsistency = totalDays > 0 ? Math.round((prevActiveDays / totalDays) * 100) : 0;

  const comparison = {
    sessionsChange: prevTotalSessions > 0
      ? Math.round(((totalSessions - prevTotalSessions) / prevTotalSessions) * 100)
      : totalSessions > 0 ? 100 : 0,
    minutesChange: prevTotalMinutes > 0
      ? Math.round(((totalMinutes - prevTotalMinutes) / prevTotalMinutes) * 100)
      : totalMinutes > 0 ? 100 : 0,
    consistencyChange: prevConsistency > 0
      ? consistencyScore - prevConsistency
      : consistencyScore,
  };

  // Generate insights
  const insights: Insight[] = generateInsights({
    practice: {
      totalSessions,
      totalMinutes,
      averageSessionLength,
      longestSession,
      daysActive: activeDays,
      consistencyScore,
    },
    comparison,
    streak: streakStats,
    goals: goalProgress,
    topPoses,
  });

  return {
    period,
    startDate: start,
    endDate: end,
    generatedAt: new Date(),
    practice: {
      totalSessions,
      totalMinutes,
      averageSessionLength,
      longestSession,
      daysActive: activeDays,
      consistencyScore,
    },
    mood: {
      averageMoodBefore: avgMoodBefore ? Math.round(avgMoodBefore * 10) / 10 : null,
      averageMoodAfter: avgMoodAfter ? Math.round(avgMoodAfter * 10) / 10 : null,
      moodImprovement: avgMoodBefore && avgMoodAfter
        ? Math.round((avgMoodAfter - avgMoodBefore) * 10) / 10
        : null,
      averageEnergy: avgEnergy ? Math.round(avgEnergy * 10) / 10 : null,
    },
    topPoses,
    bodyParts,
    categories,
    goals: goalProgress,
    streak: streakStats,
    insights,
    comparison,
  };
}

function generateInsights(data: {
  practice: PracticeStats;
  comparison: { sessionsChange: number; minutesChange: number; consistencyChange: number };
  streak: StreakStats;
  goals: GoalProgress[];
  topPoses: PoseStats[];
}): Insight[] {
  const insights: Insight[] = [];

  // Session count insights
  if (data.comparison.sessionsChange > 20) {
    insights.push({
      type: "achievement",
      title: "Practice Increase",
      description: `You practiced ${data.comparison.sessionsChange}% more sessions than the previous period. Keep up the great work!`,
      icon: "trending-up",
    });
  } else if (data.comparison.sessionsChange < -20) {
    insights.push({
      type: "suggestion",
      title: "Practice Reminder",
      description: `Your practice sessions decreased by ${Math.abs(data.comparison.sessionsChange)}%. Try setting a reminder to get back on track.`,
      icon: "bell",
    });
  }

  // Consistency insights
  if (data.practice.consistencyScore >= 80) {
    insights.push({
      type: "achievement",
      title: "Excellent Consistency",
      description: `You maintained ${data.practice.consistencyScore}% consistency. You're building a strong habit!`,
      icon: "award",
    });
  } else if (data.practice.consistencyScore < 30) {
    insights.push({
      type: "suggestion",
      title: "Build Your Routine",
      description: "Try practicing at the same time each day to build a consistent habit.",
      icon: "clock",
    });
  }

  // Streak insights
  if (data.streak.currentStreak >= 7) {
    insights.push({
      type: "milestone",
      title: `${data.streak.currentStreak}-Day Streak!`,
      description: "You're on a roll! Keep the momentum going.",
      icon: "flame",
    });
  }

  if (data.streak.currentStreak === data.streak.longestStreak && data.streak.currentStreak > 0) {
    insights.push({
      type: "achievement",
      title: "Personal Best Streak",
      description: "This is your longest streak ever! Don't break the chain.",
      icon: "trophy",
    });
  }

  // Goal insights
  const completedGoals = data.goals.filter(g => g.completed);
  if (completedGoals.length > 0) {
    insights.push({
      type: "achievement",
      title: `${completedGoals.length} Goal${completedGoals.length > 1 ? "s" : ""} Completed`,
      description: `You achieved: ${completedGoals.map(g => g.title).join(", ")}`,
      icon: "check-circle",
    });
  }

  const almostComplete = data.goals.filter(g => !g.completed && g.progress >= 80);
  if (almostComplete.length > 0) {
    insights.push({
      type: "milestone",
      title: "Almost There",
      description: `You're close to completing: ${almostComplete.map(g => g.title).join(", ")}`,
      icon: "target",
    });
  }

  // Top pose insights
  if (data.topPoses.length > 0) {
    const topPose = data.topPoses[0];
    if (topPose.masteryLevel && topPose.masteryLevel >= 4) {
      insights.push({
        type: "achievement",
        title: "Pose Mastery",
        description: `You're becoming proficient in ${topPose.poseName}!`,
        icon: "star",
      });
    }
  }

  // Practice duration insights
  if (data.practice.totalMinutes >= 300) {
    insights.push({
      type: "milestone",
      title: "5+ Hours of Practice",
      description: `You've practiced for ${Math.round(data.practice.totalMinutes / 60)} hours. Your dedication is impressive!`,
      icon: "clock",
    });
  }

  // Limit to top 5 insights
  return insights.slice(0, 5);
}

export function formatPeriodLabel(period: ReportPeriod): string {
  switch (period) {
    case "week":
      return "Weekly";
    case "month":
      return "Monthly";
    case "quarter":
      return "Quarterly";
    case "year":
      return "Yearly";
  }
}
