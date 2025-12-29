import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reminders = await prisma.reminder.findMany({
      where: { userId: session.user.id },
      orderBy: [{ enabled: "desc" }, { time: "asc" }],
    });

    // Get program names for reminders with programId
    const programIds = reminders
      .filter((r) => r.programId)
      .map((r) => r.programId as string);

    const programs = await prisma.program.findMany({
      where: { id: { in: programIds } },
      select: { id: true, name: true },
    });

    const programMap = new Map(programs.map((p) => [p.id, p.name]));

    const remindersWithPrograms = reminders.map((r) => ({
      ...r,
      programName: r.programId ? programMap.get(r.programId) || null : null,
    }));

    return Response.json({ reminders: remindersWithPrograms });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    return Response.json(
      { error: "Failed to fetch reminders" },
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
    const { title, time, days, programId, notifyBefore } = body;

    if (!title || !time || !days || days.length === 0) {
      return Response.json(
        { error: "Missing required fields: title, time, days" },
        { status: 400 }
      );
    }

    // Validate time format
    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      return Response.json(
        { error: "Invalid time format. Use HH:MM" },
        { status: 400 }
      );
    }

    // Validate days
    const validDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
    if (!days.every((d: string) => validDays.includes(d))) {
      return Response.json({ error: "Invalid days" }, { status: 400 });
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: session.user.id,
        title,
        time,
        days,
        programId: programId || null,
        notifyBefore: notifyBefore || 15,
      },
    });

    return Response.json({ reminder }, { status: 201 });
  } catch (error) {
    console.error("Error creating reminder:", error);
    return Response.json(
      { error: "Failed to create reminder" },
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
    const { id, title, time, days, programId, enabled, notifyBefore } = body;

    if (!id) {
      return Response.json({ error: "Reminder ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existingReminder = await prisma.reminder.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingReminder) {
      return Response.json({ error: "Reminder not found" }, { status: 404 });
    }

    const updateData: {
      title?: string;
      time?: string;
      days?: string[];
      programId?: string | null;
      enabled?: boolean;
      notifyBefore?: number;
    } = {};

    if (title !== undefined) updateData.title = title;
    if (time !== undefined) {
      if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
        return Response.json(
          { error: "Invalid time format. Use HH:MM" },
          { status: 400 }
        );
      }
      updateData.time = time;
    }
    if (days !== undefined) updateData.days = days;
    if (programId !== undefined) updateData.programId = programId || null;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (notifyBefore !== undefined) updateData.notifyBefore = notifyBefore;

    const reminder = await prisma.reminder.update({
      where: { id },
      data: updateData,
    });

    return Response.json({ reminder });
  } catch (error) {
    console.error("Error updating reminder:", error);
    return Response.json(
      { error: "Failed to update reminder" },
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
      return Response.json({ error: "Reminder ID is required" }, { status: 400 });
    }

    // Verify ownership
    const existingReminder = await prisma.reminder.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existingReminder) {
      return Response.json({ error: "Reminder not found" }, { status: 404 });
    }

    await prisma.reminder.delete({ where: { id } });

    return Response.json({ message: "Reminder deleted successfully" });
  } catch (error) {
    console.error("Error deleting reminder:", error);
    return Response.json(
      { error: "Failed to delete reminder" },
      { status: 500 }
    );
  }
}
