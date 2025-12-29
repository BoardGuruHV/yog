import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// Get note for a specific asana or all user's notes
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const asanaId = searchParams.get("asanaId");
    const tag = searchParams.get("tag");

    if (asanaId) {
      // Get note for specific asana
      const note = await prisma.userAsanaNote.findUnique({
        where: {
          userId_asanaId: {
            userId: session.user.id,
            asanaId,
          },
        },
      });

      return Response.json({ note });
    }

    // Get all notes, optionally filtered by tag
    const where: { userId: string; tags?: { has: string } } = {
      userId: session.user.id,
    };

    if (tag) {
      where.tags = { has: tag };
    }

    const notes = await prisma.userAsanaNote.findMany({
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
      orderBy: { updatedAt: "desc" },
    });

    // Get all unique tags used by this user
    const allNotes = await prisma.userAsanaNote.findMany({
      where: { userId: session.user.id },
      select: { tags: true },
    });

    const allTags = Array.from(new Set(allNotes.flatMap((n) => n.tags))).sort();

    return Response.json({ notes, allTags });
  } catch (error) {
    console.error("Error fetching notes:", error);
    return Response.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

// Create or update note for an asana
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { asanaId, note, tags } = body;

    if (!asanaId) {
      return Response.json(
        { error: "Asana ID is required" },
        { status: 400 }
      );
    }

    // Check if asana exists
    const asana = await prisma.asana.findUnique({
      where: { id: asanaId },
    });

    if (!asana) {
      return Response.json({ error: "Asana not found" }, { status: 404 });
    }

    // Upsert the note
    const userNote = await prisma.userAsanaNote.upsert({
      where: {
        userId_asanaId: {
          userId: session.user.id,
          asanaId,
        },
      },
      create: {
        userId: session.user.id,
        asanaId,
        note: note?.trim() || null,
        tags: tags || [],
      },
      update: {
        note: note?.trim() || null,
        tags: tags || [],
      },
    });

    return Response.json({ note: userNote });
  } catch (error) {
    console.error("Error saving note:", error);
    return Response.json(
      { error: "Failed to save note" },
      { status: 500 }
    );
  }
}

// Delete note for an asana
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const asanaId = searchParams.get("asanaId");

    if (!asanaId) {
      return Response.json(
        { error: "Asana ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the note
    const note = await prisma.userAsanaNote.findUnique({
      where: {
        userId_asanaId: {
          userId: session.user.id,
          asanaId,
        },
      },
    });

    if (!note) {
      return Response.json({ error: "Note not found" }, { status: 404 });
    }

    await prisma.userAsanaNote.delete({
      where: { id: note.id },
    });

    return Response.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    return Response.json(
      { error: "Failed to delete note" },
      { status: 500 }
    );
  }
}
