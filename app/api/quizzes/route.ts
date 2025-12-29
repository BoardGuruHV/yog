import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const featured = searchParams.get("featured");

    const where: {
      published: boolean;
      category?: string;
      difficulty?: string;
      featured?: boolean;
    } = {
      published: true,
    };

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (featured === "true") {
      where.featured = true;
    }

    const quizzes = await prisma.quiz.findMany({
      where,
      orderBy: [
        { featured: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        difficulty: true,
        imageUrl: true,
        timeLimit: true,
        passingScore: true,
        featured: true,
        _count: {
          select: { questions: true },
        },
      },
    });

    // Get user's attempts if logged in
    const session = await auth();
    let userAttempts: Record<string, { bestScore: number; attempts: number }> = {};

    if (session?.user?.id) {
      const attempts = await prisma.quizAttempt.groupBy({
        by: ["quizId"],
        where: { userId: session.user.id },
        _max: { percentage: true },
        _count: true,
      });

      userAttempts = attempts.reduce((acc, attempt) => {
        acc[attempt.quizId] = {
          bestScore: attempt._max.percentage || 0,
          attempts: attempt._count,
        };
        return acc;
      }, {} as Record<string, { bestScore: number; attempts: number }>);
    }

    // Get all categories for filtering
    const categories = await prisma.quiz.findMany({
      where: { published: true },
      select: { category: true },
      distinct: ["category"],
    });

    return NextResponse.json({
      quizzes: quizzes.map((quiz) => ({
        ...quiz,
        questionCount: quiz._count.questions,
        userProgress: userAttempts[quiz.id] || null,
      })),
      categories: categories.map((c) => c.category),
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}
