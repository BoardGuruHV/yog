import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conditions = await prisma.userCondition.findMany({
      where: { userId: session.user.id },
      include: {
        condition: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ conditions });
  } catch (error) {
    console.error("Error fetching user conditions:", error);
    return Response.json(
      { error: "Failed to fetch conditions" },
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

    const { conditions } = await request.json();

    if (!Array.isArray(conditions)) {
      return Response.json(
        { error: "Invalid conditions format" },
        { status: 400 }
      );
    }

    // Delete all existing conditions for user
    await prisma.userCondition.deleteMany({
      where: { userId: session.user.id },
    });

    // Create new conditions
    if (conditions.length > 0) {
      const validConditions = conditions.filter(
        (c: { conditionId: string; isActive: boolean }) => c.conditionId && c.isActive
      );

      if (validConditions.length > 0) {
        await prisma.userCondition.createMany({
          data: validConditions.map((c: {
            conditionId: string;
            severity: string | null;
            notes: string | null;
            startDate?: string;
            endDate?: string;
          }) => ({
            userId: session.user!.id!,
            conditionId: c.conditionId,
            severity: c.severity || null,
            notes: c.notes || null,
            startDate: c.startDate ? new Date(c.startDate) : null,
            endDate: c.endDate ? new Date(c.endDate) : null,
            isActive: true,
          })),
        });
      }
    }

    // Fetch updated conditions
    const updatedConditions = await prisma.userCondition.findMany({
      where: { userId: session.user.id },
      include: {
        condition: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return Response.json({
      message: "Conditions updated successfully",
      conditions: updatedConditions,
    });
  } catch (error) {
    console.error("Error updating user conditions:", error);
    return Response.json(
      { error: "Failed to update conditions" },
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
    const conditionId = searchParams.get("conditionId");

    if (conditionId) {
      // Delete specific condition
      await prisma.userCondition.deleteMany({
        where: {
          userId: session.user.id,
          conditionId,
        },
      });
    } else {
      // Delete all conditions
      await prisma.userCondition.deleteMany({
        where: { userId: session.user.id },
      });
    }

    return Response.json({ message: "Condition(s) deleted successfully" });
  } catch (error) {
    console.error("Error deleting user conditions:", error);
    return Response.json(
      { error: "Failed to delete conditions" },
      { status: 500 }
    );
  }
}
