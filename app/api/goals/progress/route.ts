import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// Increment goal progress
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { goalId, increment = 1 } = body;

    if (!goalId) {
      return Response.json({ error: "Goal ID is required" }, { status: 400 });
    }

    // Verify ownership
    const goal = await prisma.goal.findFirst({
      where: { id: goalId, userId: session.user.id },
    });

    if (!goal) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }

    if (goal.completed) {
      return Response.json({ error: "Goal is already completed" }, { status: 400 });
    }

    const newCurrent = goal.current + parseInt(increment);
    const isCompleted = newCurrent >= goal.target;

    const updatedGoal = await prisma.goal.update({
      where: { id: goalId },
      data: {
        current: newCurrent,
        completed: isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    return Response.json({
      goal: {
        ...updatedGoal,
        percentComplete: Math.min(
          Math.round((updatedGoal.current / updatedGoal.target) * 100),
          100
        ),
      },
      justCompleted: isCompleted,
    });
  } catch (error) {
    console.error("Error updating goal progress:", error);
    return Response.json(
      { error: "Failed to update goal progress" },
      { status: 500 }
    );
  }
}

// Recalculate all goals for the user (useful for streak/time goals)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all active, incomplete goals
    const goals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
        completed: false,
      },
    });

    const updates = [];

    for (const goal of goals) {
      let newCurrent = goal.current;

      switch (goal.type) {
        case "frequency":
          // Count sessions this period
          if (goal.period === "weekly") {
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
            startOfWeek.setHours(0, 0, 0, 0);

            const sessionsCount = await prisma.program.count({
              where: {
                userId: session.user.id,
                updatedAt: { gte: startOfWeek },
              },
            });
            newCurrent = sessionsCount;
          } else if (goal.period === "monthly") {
            const startOfMonth = new Date();
            startOfMonth.setDate(1);
            startOfMonth.setHours(0, 0, 0, 0);

            const sessionsCount = await prisma.program.count({
              where: {
                userId: session.user.id,
                updatedAt: { gte: startOfMonth },
              },
            });
            newCurrent = sessionsCount;
          }
          break;

        case "duration":
          // Calculate total practice time this period
          if (goal.period === "weekly") {
            const startOfWeek = new Date();
            startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
            startOfWeek.setHours(0, 0, 0, 0);

            const programs = await prisma.program.findMany({
              where: {
                userId: session.user.id,
                updatedAt: { gte: startOfWeek },
              },
              select: { totalDuration: true },
            });
            newCurrent = Math.round(
              programs.reduce((sum, p) => sum + p.totalDuration, 0) / 60
            );
          }
          break;

        case "streak":
          // Calculate current streak
          const programDates = await prisma.program.findMany({
            where: { userId: session.user.id },
            select: { createdAt: true },
            orderBy: { createdAt: "desc" },
          });

          const uniqueDates = new Set<string>();
          programDates.forEach((p) => {
            const date = new Date(p.createdAt);
            date.setHours(0, 0, 0, 0);
            uniqueDates.add(date.toISOString());
          });

          let streak = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          let checkDate = new Date(today);
          while (uniqueDates.has(checkDate.toISOString())) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          }

          // Check yesterday if today not practiced
          if (streak === 0) {
            checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - 1);
            while (uniqueDates.has(checkDate.toISOString())) {
              streak++;
              checkDate.setDate(checkDate.getDate() - 1);
            }
          }

          newCurrent = streak;
          break;
      }

      const isCompleted = newCurrent >= goal.target;

      if (newCurrent !== goal.current || isCompleted !== goal.completed) {
        updates.push(
          prisma.goal.update({
            where: { id: goal.id },
            data: {
              current: newCurrent,
              completed: isCompleted,
              completedAt: isCompleted && !goal.completed ? new Date() : goal.completedAt,
            },
          })
        );
      }
    }

    await Promise.all(updates);

    // Fetch updated goals
    const updatedGoals = await prisma.goal.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: [{ completed: "asc" }, { createdAt: "desc" }],
    });

    return Response.json({
      goals: updatedGoals.map((g) => ({
        ...g,
        percentComplete: Math.min(Math.round((g.current / g.target) * 100), 100),
      })),
      updated: updates.length,
    });
  } catch (error) {
    console.error("Error recalculating goals:", error);
    return Response.json(
      { error: "Failed to recalculate goals" },
      { status: 500 }
    );
  }
}
