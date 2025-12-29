import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        profile: true,
        _count: {
          select: {
            programs: true,
          },
        },
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      profile: user.profile,
      programCount: user._count.programs,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return Response.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, profile } = body;

    // Update user name if provided
    if (name !== undefined) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name },
      });
    }

    // Update or create profile
    if (profile) {
      await prisma.userProfile.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          age: profile.age,
          experienceLevel: profile.experienceLevel,
          goals: profile.goals || [],
          conditions: profile.conditions || [],
          preferredDuration: profile.preferredDuration,
        },
        update: {
          age: profile.age,
          experienceLevel: profile.experienceLevel,
          goals: profile.goals || [],
          conditions: profile.conditions || [],
          preferredDuration: profile.preferredDuration,
        },
      });
    }

    // Fetch updated user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    });

    return Response.json({
      message: "Profile updated successfully",
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        profile: user?.profile,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return Response.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
