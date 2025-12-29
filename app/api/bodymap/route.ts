import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { analyzeBodyMap } from "@/lib/bodymap/analyzer";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30");

    const bodyMapData = await analyzeBodyMap(session.user.id, days);

    // Convert Date objects to strings for JSON serialization
    const serializedBodyParts: Record<string, {
      id: string;
      label: string;
      side: string;
      practiceCount: number;
      percentage: number;
      intensity: number;
      lastPracticed: string | null;
      topPoses: { id: string; name: string; count: number }[];
    }> = {};

    for (const [key, part] of Object.entries(bodyMapData.bodyParts)) {
      serializedBodyParts[key] = {
        ...part,
        lastPracticed: part.lastPracticed?.toISOString() || null,
      };
    }

    return NextResponse.json({
      ...bodyMapData,
      bodyParts: serializedBodyParts,
    });
  } catch (error) {
    console.error("Error fetching body map data:", error);
    return NextResponse.json(
      { error: "Failed to fetch body map data" },
      { status: 500 }
    );
  }
}
