import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile for weekly goal
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: { preferredDuration: true },
    });

    // Weekly goal: preferredDuration * 7 or default 150 min/week
    const weeklyGoal = profile?.preferredDuration
      ? profile.preferredDuration * 5 // 5 days per week goal
      : 150;

    // Get this week's data
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    // Get user's programs created/updated this week
    const programs = await prisma.program.findMany({
      where: {
        userId: session.user.id,
        updatedAt: { gte: startOfWeek },
      },
      select: {
        totalDuration: true,
        updatedAt: true,
      },
    });

    // Calculate daily minutes for the week
    const weeklyMinutes: number[] = [0, 0, 0, 0, 0, 0, 0]; // Mon-Sun

    programs.forEach((program) => {
      const dayOfWeek = program.updatedAt.getDay();
      // Convert Sunday (0) to index 6, Monday (1) to index 0, etc.
      const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weeklyMinutes[index] += Math.round(program.totalDuration / 60);
    });

    const totalMinutesThisWeek = weeklyMinutes.reduce((a, b) => a + b, 0);
    const totalSessionsThisWeek = programs.length;
    const percentComplete = Math.round((totalMinutesThisWeek / weeklyGoal) * 100);

    // Get last week's data for comparison
    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    const lastWeekPrograms = await prisma.program.findMany({
      where: {
        userId: session.user.id,
        updatedAt: {
          gte: startOfLastWeek,
          lt: startOfWeek,
        },
      },
      select: { totalDuration: true },
    });

    const lastWeekMinutes = lastWeekPrograms.reduce(
      (sum, p) => sum + Math.round(p.totalDuration / 60),
      0
    );

    let trend: "up" | "down" | "same" = "same";
    let comparisonText = "";

    if (totalMinutesThisWeek > lastWeekMinutes) {
      trend = "up";
      const increase = totalMinutesThisWeek - lastWeekMinutes;
      comparisonText = `${increase} more minutes than last week`;
    } else if (totalMinutesThisWeek < lastWeekMinutes) {
      trend = "down";
      const decrease = lastWeekMinutes - totalMinutesThisWeek;
      comparisonText = `${decrease} fewer minutes than last week`;
    } else if (totalMinutesThisWeek === 0) {
      comparisonText = "Start practicing to see your progress!";
    } else {
      comparisonText = "Same as last week";
    }

    return Response.json({
      weeklyMinutes,
      totalMinutesThisWeek,
      totalSessionsThisWeek,
      weeklyGoal,
      percentComplete,
      trend,
      comparisonText,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return Response.json(
      { error: "Failed to fetch progress data" },
      { status: 500 }
    );
  }
}
