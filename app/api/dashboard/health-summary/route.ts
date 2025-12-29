import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's active conditions
    const userConditions = await prisma.userCondition.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      include: {
        condition: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (userConditions.length === 0) {
      return Response.json({
        conditionCount: 0,
        conditions: [],
        contraindicatedCount: 0,
        cautionCount: 0,
      });
    }

    const conditionIds = userConditions.map((uc) => uc.conditionId);

    // Count contraindicated poses
    const contraindicatedCount = await prisma.contraindication.count({
      where: {
        conditionId: { in: conditionIds },
        severity: "avoid",
      },
    });

    // Count caution poses
    const cautionCount = await prisma.contraindication.count({
      where: {
        conditionId: { in: conditionIds },
        severity: "caution",
      },
    });

    // Format conditions for response
    const conditions = userConditions.map((uc) => ({
      id: uc.condition.id,
      name: uc.condition.name,
      severity: uc.severity,
    }));

    return Response.json({
      conditionCount: userConditions.length,
      conditions,
      contraindicatedCount,
      cautionCount,
    });
  } catch (error) {
    console.error("Error fetching health summary:", error);
    return Response.json(
      { error: "Failed to fetch health summary" },
      { status: 500 }
    );
  }
}
