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
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");
    const month = searchParams.get("month"); // Format: "2024-01"

    const where: { userId: string; createdAt?: { gte: Date; lt: Date } } = {
      userId: session.user.id,
    };

    // Filter by month if provided
    if (month) {
      const [year, monthNum] = month.split("-").map(Number);
      const startDate = new Date(year, monthNum - 1, 1);
      const endDate = new Date(year, monthNum, 1);
      where.createdAt = { gte: startDate, lt: endDate };
    }

    const [logs, total] = await Promise.all([
      prisma.practiceLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.practiceLog.count({ where }),
    ]);

    // Get stats for the current user
    const stats = await prisma.practiceLog.aggregate({
      where: { userId: session.user.id },
      _count: true,
      _sum: { duration: true },
      _avg: { moodAfter: true, energyLevel: true },
    });

    return Response.json({
      logs,
      total,
      stats: {
        totalSessions: stats._count,
        totalMinutes: stats._sum.duration || 0,
        avgMood: stats._avg.moodAfter ? Math.round(stats._avg.moodAfter * 10) / 10 : null,
        avgEnergy: stats._avg.energyLevel ? Math.round(stats._avg.energyLevel * 10) / 10 : null,
      },
    });
  } catch (error) {
    console.error("Error fetching practice logs:", error);
    return Response.json(
      { error: "Failed to fetch practice logs" },
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
    const {
      programId,
      programName,
      duration,
      moodBefore,
      moodAfter,
      energyLevel,
      notes,
      poses,
      tags,
    } = body;

    if (!duration || duration < 1) {
      return Response.json(
        { error: "Duration is required and must be at least 1 minute" },
        { status: 400 }
      );
    }

    // Validate mood/energy values if provided
    const validateScale = (value: number | undefined) => {
      if (value === undefined) return true;
      return value >= 1 && value <= 5;
    };

    if (!validateScale(moodBefore) || !validateScale(moodAfter) || !validateScale(energyLevel)) {
      return Response.json(
        { error: "Mood and energy values must be between 1 and 5" },
        { status: 400 }
      );
    }

    const log = await prisma.practiceLog.create({
      data: {
        userId: session.user.id,
        programId: programId || null,
        programName: programName || null,
        duration,
        moodBefore: moodBefore || null,
        moodAfter: moodAfter || null,
        energyLevel: energyLevel || null,
        notes: notes?.trim() || null,
        poses: poses || null,
        tags: tags || [],
      },
    });

    return Response.json({ log }, { status: 201 });
  } catch (error) {
    console.error("Error creating practice log:", error);
    return Response.json(
      { error: "Failed to create practice log" },
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
    const { id, moodBefore, moodAfter, energyLevel, notes, tags } = body;

    if (!id) {
      return Response.json({ error: "Log ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.practiceLog.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return Response.json({ error: "Practice log not found" }, { status: 404 });
    }

    const updateData: {
      moodBefore?: number | null;
      moodAfter?: number | null;
      energyLevel?: number | null;
      notes?: string | null;
      tags?: string[];
    } = {};

    if (moodBefore !== undefined) updateData.moodBefore = moodBefore || null;
    if (moodAfter !== undefined) updateData.moodAfter = moodAfter || null;
    if (energyLevel !== undefined) updateData.energyLevel = energyLevel || null;
    if (notes !== undefined) updateData.notes = notes?.trim() || null;
    if (tags !== undefined) updateData.tags = tags;

    const log = await prisma.practiceLog.update({
      where: { id },
      data: updateData,
    });

    return Response.json({ log });
  } catch (error) {
    console.error("Error updating practice log:", error);
    return Response.json(
      { error: "Failed to update practice log" },
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
      return Response.json({ error: "Log ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.practiceLog.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return Response.json({ error: "Practice log not found" }, { status: 404 });
    }

    await prisma.practiceLog.delete({ where: { id } });

    return Response.json({ message: "Practice log deleted successfully" });
  } catch (error) {
    console.error("Error deleting practice log:", error);
    return Response.json(
      { error: "Failed to delete practice log" },
      { status: 500 }
    );
  }
}
