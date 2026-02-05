import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET quiz with questions (for taking the quiz)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            type: true,
            question: true,
            imageUrl: true,
            options: true,
            points: true,
            order: true,
            // Don't include correctAnswer in GET - only reveal after submission
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    if (!quiz.published) {
      return NextResponse.json(
        { error: "Quiz not available" },
        { status: 404 }
      );
    }

    // Get user's previous attempts
    const session = await auth();
    let previousAttempts: { percentage: number; completedAt: Date }[] = [];

    if (session?.user?.id) {
      previousAttempts = await prisma.quizAttempt.findMany({
        where: {
          userId: session.user.id,
          quizId: id,
        },
        orderBy: { completedAt: "desc" },
        take: 5,
        select: {
          percentage: true,
          completedAt: true,
        },
      });
    }

    return NextResponse.json({
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        category: quiz.category,
        difficulty: quiz.difficulty,
        imageUrl: quiz.imageUrl,
        timeLimit: quiz.timeLimit,
        passingScore: quiz.passingScore,
        questions: quiz.questions,
      },
      previousAttempts,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// POST submit quiz answers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const body = await request.json();
    const { answers, timeSpent } = body;

    if (!answers || typeof answers !== "object") {
      return NextResponse.json(
        { error: "Invalid answers format" },
        { status: 400 }
      );
    }

    // Get quiz with correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Calculate score
    let score = 0;
    let maxScore = 0;
    const results = quiz.questions.map((question) => {
      const userAnswer = answers[question.id];
      const isCorrect = userAnswer === question.correctAnswer;

      maxScore += question.points;
      if (isCorrect) {
        score += question.points;
      }

      return {
        questionId: question.id,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        explanation: question.explanation,
        points: isCorrect ? question.points : 0,
      };
    });

    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    // Save attempt if user is logged in
    if (session?.user?.id) {
      await prisma.quizAttempt.create({
        data: {
          userId: session.user.id,
          quizId: id,
          score,
          maxScore,
          percentage,
          passed,
          answers,
          timeSpent,
        },
      });
    }

    return NextResponse.json({
      score,
      maxScore,
      percentage: Math.round(percentage * 10) / 10,
      passed,
      passingScore: quiz.passingScore,
      results,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
