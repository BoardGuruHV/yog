import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

// GET /api/reviews?asanaId=xxx - Get reviews for an asana
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const asanaId = searchParams.get("asanaId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "recent"; // recent, helpful, rating_high, rating_low

    if (!asanaId) {
      return NextResponse.json(
        { error: "asanaId is required" },
        { status: 400 }
      );
    }

    // Build orderBy based on sort
    type OrderByType =
      | { createdAt: "desc" }
      | { helpful: "desc" }
      | { rating: "desc" | "asc" };

    let orderBy: OrderByType;
    switch (sort) {
      case "helpful":
        orderBy = { helpful: "desc" };
        break;
      case "rating_high":
        orderBy = { rating: "desc" };
        break;
      case "rating_low":
        orderBy = { rating: "asc" };
        break;
      case "recent":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const skip = (page - 1) * limit;

    // Get reviews
    const [reviews, total, stats] = await Promise.all([
      prisma.asanaReview.findMany({
        where: { asanaId },
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.asanaReview.count({ where: { asanaId } }),
      // Get rating statistics
      prisma.asanaReview.aggregate({
        where: { asanaId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    // Get rating distribution
    const distribution = await prisma.asanaReview.groupBy({
      by: ["rating"],
      where: { asanaId },
      _count: { rating: true },
    });

    const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((d) => {
      ratingDistribution[d.rating] = d._count.rating;
    });

    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        review: r.review,
        helpful: r.helpful,
        verified: r.verified,
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          name: r.user.name || "Anonymous",
          image: r.user.image,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + reviews.length < total,
      },
      stats: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating,
        distribution: ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create or update a review
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { asanaId, rating, title, review } = body;

    if (!asanaId) {
      return NextResponse.json(
        { error: "asanaId is required" },
        { status: 400 }
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if asana exists
    const asana = await prisma.asana.findUnique({
      where: { id: asanaId },
    });

    if (!asana) {
      return NextResponse.json({ error: "Asana not found" }, { status: 404 });
    }

    // Check if user has practiced this pose (for verified badge)
    const hasPracticed = await prisma.poseMastery.findUnique({
      where: {
        userId_asanaId: {
          userId: session.user.id,
          asanaId,
        },
      },
    });

    // Upsert the review (create or update)
    const reviewData = await prisma.asanaReview.upsert({
      where: {
        userId_asanaId: {
          userId: session.user.id,
          asanaId,
        },
      },
      update: {
        rating,
        title: title || null,
        review: review || null,
        verified: hasPracticed !== null,
      },
      create: {
        userId: session.user.id,
        asanaId,
        rating,
        title: title || null,
        review: review || null,
        verified: hasPracticed !== null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: reviewData.id,
      rating: reviewData.rating,
      title: reviewData.title,
      review: reviewData.review,
      helpful: reviewData.helpful,
      verified: reviewData.verified,
      createdAt: reviewData.createdAt,
      user: {
        id: reviewData.user.id,
        name: reviewData.user.name || "Anonymous",
        image: reviewData.user.image,
      },
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

// PATCH /api/reviews - Mark a review as helpful
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reviewId } = body;

    if (!reviewId) {
      return NextResponse.json(
        { error: "reviewId is required" },
        { status: 400 }
      );
    }

    // Find the review
    const review = await prisma.asanaReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    // Prevent voting on own review
    if (review.userId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot vote on your own review" },
        { status: 400 }
      );
    }

    // Increment helpful count
    const updatedReview = await prisma.asanaReview.update({
      where: { id: reviewId },
      data: { helpful: { increment: 1 } },
    });

    return NextResponse.json({
      id: updatedReview.id,
      helpful: updatedReview.helpful,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// DELETE /api/reviews - Delete user's own review
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const asanaId = searchParams.get("asanaId");

    if (!asanaId) {
      return NextResponse.json(
        { error: "asanaId is required" },
        { status: 400 }
      );
    }

    // Delete user's review for this asana
    await prisma.asanaReview.delete({
      where: {
        userId_asanaId: {
          userId: session.user.id,
          asanaId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
