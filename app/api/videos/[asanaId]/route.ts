import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ asanaId: string }> }
) {
  try {
    const { asanaId } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const where: {
      asanaId: string;
      type?: string;
    } = { asanaId };

    if (type) {
      where.type = type;
    }

    const videos = await prisma.asanaVideo.findMany({
      where,
      orderBy: [
        { featured: "desc" },
        { order: "asc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}
