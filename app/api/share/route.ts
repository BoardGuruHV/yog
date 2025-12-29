import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { nanoid } from "nanoid";

// Generate a short unique share code
function generateShareCode(): string {
  return nanoid(8); // 8-character unique code
}

// POST /api/share - Create or get share link for a program
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { programId } = body;

    if (!programId) {
      return NextResponse.json(
        { error: "programId is required" },
        { status: 400 }
      );
    }

    // Verify user owns this program
    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        userId: session.user.id,
      },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found or not owned by user" },
        { status: 404 }
      );
    }

    // Check if share already exists
    let sharedProgram = await prisma.sharedProgram.findUnique({
      where: { programId },
    });

    if (!sharedProgram) {
      // Create new share
      sharedProgram = await prisma.sharedProgram.create({
        data: {
          programId,
          shareCode: generateShareCode(),
        },
      });
    }

    return NextResponse.json({
      shareCode: sharedProgram.shareCode,
      isPublic: sharedProgram.isPublic,
      views: sharedProgram.views,
      copies: sharedProgram.copies,
      createdAt: sharedProgram.createdAt,
    });
  } catch (error) {
    console.error("Error creating share:", error);
    return NextResponse.json(
      { error: "Failed to create share link" },
      { status: 500 }
    );
  }
}

// PATCH /api/share - Update share settings
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { programId, isPublic } = body;

    if (!programId) {
      return NextResponse.json(
        { error: "programId is required" },
        { status: 400 }
      );
    }

    // Verify user owns this program
    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        userId: session.user.id,
      },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found or not owned by user" },
        { status: 404 }
      );
    }

    // Update share settings
    const sharedProgram = await prisma.sharedProgram.update({
      where: { programId },
      data: { isPublic },
    });

    return NextResponse.json({
      shareCode: sharedProgram.shareCode,
      isPublic: sharedProgram.isPublic,
    });
  } catch (error) {
    console.error("Error updating share:", error);
    return NextResponse.json(
      { error: "Failed to update share settings" },
      { status: 500 }
    );
  }
}

// DELETE /api/share - Remove share link
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const programId = searchParams.get("programId");

    if (!programId) {
      return NextResponse.json(
        { error: "programId is required" },
        { status: 400 }
      );
    }

    // Verify user owns this program
    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        userId: session.user.id,
      },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found or not owned by user" },
        { status: 404 }
      );
    }

    // Delete share
    await prisma.sharedProgram.delete({
      where: { programId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting share:", error);
    return NextResponse.json(
      { error: "Failed to delete share link" },
      { status: 500 }
    );
  }
}
