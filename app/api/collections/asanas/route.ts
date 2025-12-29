import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { collectionId, asanaId } = body;

    if (!collectionId || !asanaId) {
      return Response.json(
        { error: "Collection ID and Asana ID are required" },
        { status: 400 }
      );
    }

    // Verify collection ownership
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId: session.user.id },
    });

    if (!collection) {
      return Response.json({ error: "Collection not found" }, { status: 404 });
    }

    // Check if asana exists
    const asana = await prisma.asana.findUnique({
      where: { id: asanaId },
    });

    if (!asana) {
      return Response.json({ error: "Asana not found" }, { status: 404 });
    }

    // Check if already in collection
    const existing = await prisma.collectionAsana.findUnique({
      where: {
        collectionId_asanaId: {
          collectionId,
          asanaId,
        },
      },
    });

    if (existing) {
      return Response.json(
        { error: "Asana already in collection" },
        { status: 200 }
      );
    }

    // Get the next order number
    const lastAsana = await prisma.collectionAsana.findFirst({
      where: { collectionId },
      orderBy: { order: "desc" },
    });

    const order = (lastAsana?.order ?? -1) + 1;

    const collectionAsana = await prisma.collectionAsana.create({
      data: {
        collectionId,
        asanaId,
        order,
      },
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
    });

    // Update collection's updatedAt
    await prisma.collection.update({
      where: { id: collectionId },
      data: { updatedAt: new Date() },
    });

    return Response.json({ collectionAsana }, { status: 201 });
  } catch (error) {
    console.error("Error adding asana to collection:", error);
    return Response.json(
      { error: "Failed to add asana to collection" },
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
    const collectionId = searchParams.get("collectionId");
    const asanaId = searchParams.get("asanaId");

    if (!collectionId || !asanaId) {
      return Response.json(
        { error: "Collection ID and Asana ID are required" },
        { status: 400 }
      );
    }

    // Verify collection ownership
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId: session.user.id },
    });

    if (!collection) {
      return Response.json({ error: "Collection not found" }, { status: 404 });
    }

    // Find the collection asana
    const collectionAsana = await prisma.collectionAsana.findUnique({
      where: {
        collectionId_asanaId: {
          collectionId,
          asanaId,
        },
      },
    });

    if (!collectionAsana) {
      return Response.json(
        { error: "Asana not in collection" },
        { status: 404 }
      );
    }

    await prisma.collectionAsana.delete({
      where: { id: collectionAsana.id },
    });

    // Update collection's updatedAt
    await prisma.collection.update({
      where: { id: collectionId },
      data: { updatedAt: new Date() },
    });

    return Response.json({ message: "Asana removed from collection" });
  } catch (error) {
    console.error("Error removing asana from collection:", error);
    return Response.json(
      { error: "Failed to remove asana from collection" },
      { status: 500 }
    );
  }
}
