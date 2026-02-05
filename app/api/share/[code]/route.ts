import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/share/[code] - Get shared program by code
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const sharedProgram = await prisma.sharedProgram.findUnique({
      where: { shareCode: code },
      include: {
        program: {
          include: {
            asanas: {
              include: {
                asana: {
                  select: {
                    id: true,
                    nameEnglish: true,
                    nameSanskrit: true,
                    category: true,
                    difficulty: true,
                    svgPath: true,
                  },
                },
              },
              orderBy: { order: "asc" },
            },
            user: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!sharedProgram) {
      return NextResponse.json(
        { error: "Shared program not found" },
        { status: 404 }
      );
    }

    if (!sharedProgram.isPublic) {
      return NextResponse.json(
        { error: "This program is private" },
        { status: 403 }
      );
    }

    // Increment view count
    await prisma.sharedProgram.update({
      where: { id: sharedProgram.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json({
      program: {
        id: sharedProgram.program.id,
        name: sharedProgram.program.name,
        description: sharedProgram.program.description,
        totalDuration: sharedProgram.program.totalDuration,
        creatorName: sharedProgram.program.user?.name || "Anonymous",
        asanas: sharedProgram.program.asanas.map((pa) => ({
          id: pa.id,
          order: pa.order,
          duration: pa.duration,
          notes: pa.notes,
          asana: pa.asana,
        })),
      },
      shareInfo: {
        views: sharedProgram.views + 1,
        copies: sharedProgram.copies,
        createdAt: sharedProgram.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching shared program:", error);
    return NextResponse.json(
      { error: "Failed to fetch shared program" },
      { status: 500 }
    );
  }
}

// POST /api/share/[code] - Copy shared program to user's library
export async function POST(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await params;

    const sharedProgram = await prisma.sharedProgram.findUnique({
      where: { shareCode: code },
      include: {
        program: {
          include: {
            asanas: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!sharedProgram) {
      return NextResponse.json(
        { error: "Shared program not found" },
        { status: 404 }
      );
    }

    if (!sharedProgram.isPublic) {
      return NextResponse.json(
        { error: "This program is private" },
        { status: 403 }
      );
    }

    // Create a copy of the program for the user
    const newProgram = await prisma.program.create({
      data: {
        name: `${sharedProgram.program.name} (Copy)`,
        description: sharedProgram.program.description,
        totalDuration: sharedProgram.program.totalDuration,
        userId: session.user.id,
        asanas: {
          create: sharedProgram.program.asanas.map((pa) => ({
            asanaId: pa.asanaId,
            order: pa.order,
            duration: pa.duration,
            notes: pa.notes,
          })),
        },
      },
    });

    // Increment copy count
    await prisma.sharedProgram.update({
      where: { id: sharedProgram.id },
      data: { copies: { increment: 1 } },
    });

    return NextResponse.json({
      success: true,
      programId: newProgram.id,
      message: "Program copied to your library",
    });
  } catch (error) {
    console.error("Error copying shared program:", error);
    return NextResponse.json(
      { error: "Failed to copy program" },
      { status: 500 }
    );
  }
}
