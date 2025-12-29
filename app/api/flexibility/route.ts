import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// GET - Retrieve flexibility logs for user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const asanaId = searchParams.get("asanaId");
    const bodyPart = searchParams.get("bodyPart");
    const limit = searchParams.get("limit");

    // Build where clause
    const where: {
      userId: string;
      asanaId?: string;
      bodyPart?: string;
    } = { userId };

    if (asanaId) {
      where.asanaId = asanaId;
    }

    if (bodyPart) {
      where.bodyPart = bodyPart;
    }

    // Get flexibility logs
    const logs = await prisma.flexibilityLog.findMany({
      where,
      include: {
        asana: {
          select: {
            id: true,
            nameEnglish: true,
            nameSanskrit: true,
            category: true,
            svgPath: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit, 10) : undefined,
    });

    // Calculate progress stats for each asana
    const asanaStats: Record<string, {
      asanaId: string;
      asanaName: string;
      totalEntries: number;
      latestMeasurement: number | null;
      firstMeasurement: number | null;
      improvement: number | null;
      measurementType: string;
      bodyPart: string | null;
    }> = {};

    // Group logs by asana
    const logsByAsana = logs.reduce((acc, log) => {
      if (!acc[log.asanaId]) {
        acc[log.asanaId] = [];
      }
      acc[log.asanaId].push(log);
      return acc;
    }, {} as Record<string, typeof logs>);

    // Calculate stats for each asana
    for (const [id, asanaLogs] of Object.entries(logsByAsana)) {
      const logsWithMeasurements = asanaLogs.filter(l => l.measurement !== null);
      if (logsWithMeasurements.length > 0) {
        const sortedLogs = logsWithMeasurements.sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const first = sortedLogs[0];
        const latest = sortedLogs[sortedLogs.length - 1];

        asanaStats[id] = {
          asanaId: id,
          asanaName: asanaLogs[0].asana.nameEnglish,
          totalEntries: asanaLogs.length,
          latestMeasurement: latest.measurement,
          firstMeasurement: first.measurement,
          improvement: latest.measurement && first.measurement
            ? latest.measurement - first.measurement
            : null,
          measurementType: latest.measurementType,
          bodyPart: latest.bodyPart,
        };
      }
    }

    // Get unique body parts for filtering
    const bodyParts = Array.from(
      new Set(logs.map(l => l.bodyPart).filter(Boolean))
    ) as string[];

    // Get unique asanas practiced
    const practicedAsanas = Array.from(
      new Set(logs.map(l => l.asanaId))
    );

    return NextResponse.json({
      logs,
      stats: Object.values(asanaStats),
      bodyParts,
      practicedAsanas,
      totalEntries: logs.length,
    });
  } catch (error) {
    console.error("Error fetching flexibility logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch flexibility logs" },
      { status: 500 }
    );
  }
}

// POST - Create a new flexibility log entry
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { asanaId, measurement, measurementType, photoPath, notes, bodyPart } = body;

    if (!asanaId) {
      return NextResponse.json(
        { error: "asanaId is required" },
        { status: 400 }
      );
    }

    // Check if asana exists
    const asana = await prisma.asana.findUnique({
      where: { id: asanaId },
    });

    if (!asana) {
      return NextResponse.json({ error: "Asana not found" }, { status: 404 });
    }

    // Create flexibility log
    const log = await prisma.flexibilityLog.create({
      data: {
        userId,
        asanaId,
        measurement: measurement ? parseFloat(measurement) : null,
        measurementType: measurementType || "reach",
        photoPath,
        notes,
        bodyPart,
      },
      include: {
        asana: {
          select: {
            id: true,
            nameEnglish: true,
            nameSanskrit: true,
            category: true,
            svgPath: true,
          },
        },
      },
    });

    // Get previous entries to calculate improvement
    const previousLogs = await prisma.flexibilityLog.findMany({
      where: {
        userId,
        asanaId,
        measurement: { not: null },
        id: { not: log.id },
      },
      orderBy: { createdAt: "asc" },
      take: 1,
    });

    const improvement = previousLogs.length > 0 && log.measurement && previousLogs[0].measurement
      ? log.measurement - previousLogs[0].measurement
      : null;

    return NextResponse.json({
      success: true,
      log,
      improvement,
      isFirstEntry: previousLogs.length === 0,
    });
  } catch (error) {
    console.error("Error creating flexibility log:", error);
    return NextResponse.json(
      { error: "Failed to create flexibility log" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a flexibility log entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const logId = searchParams.get("id");

    if (!logId) {
      return NextResponse.json({ error: "Log ID is required" }, { status: 400 });
    }

    // Check if log exists and belongs to user
    const existingLog = await prisma.flexibilityLog.findUnique({
      where: { id: logId },
    });

    if (!existingLog) {
      return NextResponse.json({ error: "Log not found" }, { status: 404 });
    }

    if (existingLog.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the log
    await prisma.flexibilityLog.delete({
      where: { id: logId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting flexibility log:", error);
    return NextResponse.json(
      { error: "Failed to delete flexibility log" },
      { status: 500 }
    );
  }
}
