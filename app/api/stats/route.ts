import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// Helper to get date range
function getDateRange(period: "week" | "month" | "year" | "all") {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    case "all":
      start.setFullYear(2020); // Far past date
      break;
  }

  return { start, end: now };
}

// GET - Retrieve practice statistics
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") || "month") as
      | "week"
      | "month"
      | "year"
      | "all";

    const { start, end } = getDateRange(period);

    // Get practice logs for the period
    const practiceLogs = await prisma.practiceLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Get practice days for calendar heatmap
    const practiceDays = await prisma.practiceDay.findMany({
      where: {
        userId,
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { date: "asc" },
    });

    // Get streak data
    const streak = await prisma.streak.findUnique({
      where: { userId },
    });

    // Calculate overview stats
    const totalMinutes = practiceLogs.reduce(
      (sum, log) => sum + log.duration,
      0
    );
    const totalSessions = practiceLogs.length;
    const avgSessionLength =
      totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // Calculate days practiced
    const uniqueDays = new Set(
      practiceLogs.map((log) => log.createdAt.toISOString().split("T")[0])
    );
    const daysPracticed = uniqueDays.size;

    // Calculate practice over time (daily totals)
    const dailyPractice: Record<string, { date: string; minutes: number; sessions: number }> = {};
    practiceLogs.forEach((log) => {
      const date = log.createdAt.toISOString().split("T")[0];
      if (!dailyPractice[date]) {
        dailyPractice[date] = { date, minutes: 0, sessions: 0 };
      }
      dailyPractice[date].minutes += log.duration;
      dailyPractice[date].sessions += 1;
    });

    // Calculate weekly totals for trend
    const weeklyPractice: Record<string, { week: string; minutes: number; sessions: number }> = {};
    practiceLogs.forEach((log) => {
      const date = new Date(log.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyPractice[weekKey]) {
        weeklyPractice[weekKey] = { week: weekKey, minutes: 0, sessions: 0 };
      }
      weeklyPractice[weekKey].minutes += log.duration;
      weeklyPractice[weekKey].sessions += 1;
    });

    // Calculate time of day distribution
    const timeOfDayDist = {
      morning: 0, // 5-12
      afternoon: 0, // 12-17
      evening: 0, // 17-21
      night: 0, // 21-5
    };
    practiceLogs.forEach((log) => {
      const hour = log.createdAt.getHours();
      if (hour >= 5 && hour < 12) timeOfDayDist.morning++;
      else if (hour >= 12 && hour < 17) timeOfDayDist.afternoon++;
      else if (hour >= 17 && hour < 21) timeOfDayDist.evening++;
      else timeOfDayDist.night++;
    });

    // Calculate mood improvement
    const moodLogs = practiceLogs.filter(
      (log) => log.moodBefore !== null && log.moodAfter !== null
    );
    const avgMoodImprovement =
      moodLogs.length > 0
        ? moodLogs.reduce(
            (sum, log) => sum + ((log.moodAfter || 0) - (log.moodBefore || 0)),
            0
          ) / moodLogs.length
        : 0;

    // Calculate category distribution from poses
    const categoryCount: Record<string, number> = {};
    for (const log of practiceLogs) {
      if (log.poses && Array.isArray(log.poses)) {
        for (const poseId of log.poses as string[]) {
          try {
            const asana = await prisma.asana.findUnique({
              where: { id: poseId },
              select: { category: true },
            });
            if (asana) {
              categoryCount[asana.category] =
                (categoryCount[asana.category] || 0) + 1;
            }
          } catch {
            // Skip invalid pose IDs
          }
        }
      }
    }

    // Calculate body parts focus
    const bodyPartCount: Record<string, number> = {};
    for (const log of practiceLogs) {
      if (log.poses && Array.isArray(log.poses)) {
        for (const poseId of log.poses as string[]) {
          try {
            const asana = await prisma.asana.findUnique({
              where: { id: poseId },
              select: { targetBodyParts: true },
            });
            if (asana) {
              for (const part of asana.targetBodyParts) {
                bodyPartCount[part] = (bodyPartCount[part] || 0) + 1;
              }
            }
          } catch {
            // Skip invalid pose IDs
          }
        }
      }
    }

    // Calculate consistency score (0-100)
    const daysInPeriod = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const consistencyScore = Math.min(
      100,
      Math.round((daysPracticed / Math.max(daysInPeriod, 1)) * 100)
    );

    // Build heatmap data
    const heatmapData = practiceDays.map((pd) => ({
      date: pd.date.toISOString().split("T")[0],
      value: pd.duration,
      sessions: pd.sessions,
    }));

    return NextResponse.json({
      overview: {
        totalMinutes,
        totalHours: Math.round((totalMinutes / 60) * 10) / 10,
        totalSessions,
        daysPracticed,
        avgSessionLength,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
        consistencyScore,
        avgMoodImprovement: Math.round(avgMoodImprovement * 10) / 10,
      },
      charts: {
        dailyPractice: Object.values(dailyPractice).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        ),
        weeklyPractice: Object.values(weeklyPractice).sort(
          (a, b) => new Date(a.week).getTime() - new Date(b.week).getTime()
        ),
        timeOfDay: [
          { name: "Morning", value: timeOfDayDist.morning, time: "5am-12pm" },
          { name: "Afternoon", value: timeOfDayDist.afternoon, time: "12pm-5pm" },
          { name: "Evening", value: timeOfDayDist.evening, time: "5pm-9pm" },
          { name: "Night", value: timeOfDayDist.night, time: "9pm-5am" },
        ],
        categories: Object.entries(categoryCount)
          .map(([name, value]) => ({ name: name.replace("_", " "), value }))
          .sort((a, b) => b.value - a.value),
        bodyParts: Object.entries(bodyPartCount)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 10),
        heatmap: heatmapData,
      },
      period,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
