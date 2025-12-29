import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ favorites: [] });
    }

    const { searchParams } = new URL(request.url);
    const asanaIds = searchParams.get("asanaIds")?.split(",") || [];

    if (asanaIds.length === 0) {
      return Response.json({ favorites: [] });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
        asanaId: { in: asanaIds },
      },
      select: { asanaId: true },
    });

    return Response.json({
      favorites: favorites.map((f) => f.asanaId),
    });
  } catch (error) {
    console.error("Error checking favorites:", error);
    return Response.json({ favorites: [] });
  }
}
