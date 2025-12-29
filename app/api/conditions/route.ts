import prisma from "@/lib/db";

export async function GET() {
  try {
    const conditions = await prisma.condition.findMany({
      orderBy: { name: "asc" },
    });

    return Response.json(conditions);
  } catch (error) {
    console.error("Error fetching conditions:", error);
    return Response.json(
      { error: "Failed to fetch conditions" },
      { status: 500 }
    );
  }
}
