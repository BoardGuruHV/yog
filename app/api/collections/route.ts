import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const collections = await prisma.collection.findMany({
      where: { userId: session.user.id },
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
        _count: {
          select: { asanas: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return Response.json({
      collections: collections.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        asanaCount: c._count.asanas,
        asanas: c.asanas.map((ca) => ({
          id: ca.id,
          order: ca.order,
          asana: ca.asana,
        })),
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
    return Response.json(
      { error: "Failed to fetch collections" },
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
    const { name, description } = body;

    if (!name?.trim()) {
      return Response.json(
        { error: "Collection name is required" },
        { status: 400 }
      );
    }

    const collection = await prisma.collection.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim() || null,
      },
    });

    return Response.json({ collection }, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return Response.json(
      { error: "Failed to create collection" },
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
    const { id, name, description } = body;

    if (!id) {
      return Response.json(
        { error: "Collection ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.collection.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return Response.json({ error: "Collection not found" }, { status: 404 });
    }

    const updateData: { name?: string; description?: string | null } = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined)
      updateData.description = description?.trim() || null;

    const collection = await prisma.collection.update({
      where: { id },
      data: updateData,
    });

    return Response.json({ collection });
  } catch (error) {
    console.error("Error updating collection:", error);
    return Response.json(
      { error: "Failed to update collection" },
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
      return Response.json(
        { error: "Collection ID is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existing = await prisma.collection.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return Response.json({ error: "Collection not found" }, { status: 404 });
    }

    await prisma.collection.delete({ where: { id } });

    return Response.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return Response.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
