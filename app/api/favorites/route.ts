import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: {
        asana: {
          select: {
            id: true,
            nameEnglish: true,
            nameSanskrit: true,
            category: true,
            difficulty: true,
            svgPath: true,
            benefits: true,
            targetBodyParts: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({
      favorites: favorites.map((f) => ({
        id: f.id,
        asanaId: f.asanaId,
        createdAt: f.createdAt,
        asana: f.asana,
      })),
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return Response.json(
      { error: "Failed to fetch favorites" },
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
    const { asanaId } = body;

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

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_asanaId: {
          userId: session.user.id,
          asanaId,
        },
      },
    });

    if (existing) {
      return Response.json(
        { error: "Already in favorites", favorite: existing },
        { status: 200 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        asanaId,
      },
    });

    return Response.json({ favorite }, { status: 201 });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return Response.json(
      { error: "Failed to add favorite" },
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
    const asanaId = searchParams.get("asanaId");

    if (!asanaId) {
      return Response.json(
        { error: "Asana ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the favorite
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_asanaId: {
          userId: session.user.id,
          asanaId,
        },
      },
    });

    if (!favorite) {
      return Response.json({ error: "Favorite not found" }, { status: 404 });
    }

    await prisma.favorite.delete({
      where: { id: favorite.id },
    });

    return Response.json({ message: "Favorite removed successfully" });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return Response.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
