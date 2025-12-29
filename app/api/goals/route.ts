import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includeCompleted = searchParams.get("completed") === "true";
    const type = searchParams.get("type");

    const where: {
      userId: string;
      isActive?: boolean;
      completed?: boolean;
      type?: string;
    } = {
      userId: session.user.id,
      isActive: true,
    };

    if (!includeCompleted) {
      where.completed = false;
    }

    if (type) {
      where.type = type;
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: [
        { completed: "asc" },
        { deadline: "asc" },
        { createdAt: "desc" },
      ],
    });

    // Calculate progress for each goal
    const goalsWithProgress = goals.map((goal) => ({
      ...goal,
      percentComplete: Math.min(
        Math.round((goal.current / goal.target) * 100),
        100
      ),
    }));

    return Response.json({ goals: goalsWithProgress });
  } catch (error) {
    console.error("Error fetching goals:", error);
    return Response.json(
      { error: "Failed to fetch goals" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, type, target, unit, period, asanaId, deadline } = body;

    if (!title || !type || !target || !unit) {
      return Response.json(
        { error: "Missing required fields: title, type, target, unit" },
        { status: 400 }
      );
    }

    const goal = await prisma.goal.create({
      data: {
        userId: session.user.id,
        title,
        description,
        type,
        target: parseInt(target),
        unit,
        period,
        asanaId,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return Response.json({ goal }, { status: 201 });
  } catch (error) {
    console.error("Error creating goal:", error);
    return Response.json(
      { error: "Failed to create goal" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, target, current, completed, isActive } = body;

    if (!id) {
      return Response.json({ error: "Goal ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingGoal) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }

    const updateData: {
      title?: string;
      description?: string;
      target?: number;
      current?: number;
      completed?: boolean;
      completedAt?: Date | null;
      isActive?: boolean;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (target !== undefined) updateData.target = parseInt(target);
    if (current !== undefined) updateData.current = parseInt(current);
    if (isActive !== undefined) updateData.isActive = isActive;

    // Handle completion
    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completedAt = completed ? new Date() : null;
    }

    // Auto-complete if current >= target
    if (
      updateData.current !== undefined &&
      updateData.current >= (updateData.target || existingGoal.target)
    ) {
      updateData.completed = true;
      updateData.completedAt = new Date();
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    return Response.json({
      goal: {
        ...goal,
        percentComplete: Math.min(
          Math.round((goal.current / goal.target) * 100),
          100
        ),
      },
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    return Response.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Goal ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingGoal) {
      return Response.json({ error: "Goal not found" }, { status: 404 });
    }

    await prisma.goal.delete({ where: { id } });

    return Response.json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return Response.json(
      { error: "Failed to delete goal" },
      { status: 500 }
    );
  }
}
