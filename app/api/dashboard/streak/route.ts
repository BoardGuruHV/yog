import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's programs and calculate practice data
    // For now, we'll use program creation dates as practice indicators
    // In a full implementation, you'd have a PracticeSession model

    const programs = await prisma.program.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    // Calculate streak based on program activity
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const practiceDates = new Set<string>();
    programs.forEach((p) => {
      const date = new Date(p.createdAt);
      date.setHours(0, 0, 0, 0);
      practiceDates.add(date.toISOString());
    });

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);

    // Check if practiced today
    const practiceToday = practiceDates.has(today.toISOString());

    // Start from yesterday if not practiced today
    if (!practiceToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (practiceDates.has(checkDate.toISOString())) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // If practiced today, add today to streak
    if (practiceToday) {
      currentStreak++;
    }

    // Calculate longest streak
    let longestStreak = currentStreak;
    let tempStreak = 0;
    const sortedDates = Array.from(practiceDates).sort();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Get last 7 days of practice
    const weeklyPractices: boolean[] = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      day.setHours(0, 0, 0, 0);
      weeklyPractices.push(practiceDates.has(day.toISOString()));
    }

    // Get last practice date
    const lastPractice = programs.length > 0
      ? programs[0].createdAt.toISOString()
      : null;

    return Response.json({
      currentStreak,
      longestStreak,
      lastPractice,
      practiceToday,
      weeklyPractices,
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return Response.json(
      { error: "Failed to fetch streak data" },
      { status: 500 }
    );
  }
}
