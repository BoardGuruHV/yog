import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const featured = searchParams.get("featured");
    const limit = searchParams.get("limit");

    const where: {
      published: boolean;
      category?: string;
      tags?: { has: string };
      featured?: boolean;
    } = {
      published: true,
    };

    if (category) {
      where.category = category;
    }

    if (tag) {
      where.tags = { has: tag };
    }

    if (featured === "true") {
      where.featured = true;
    }

    const articles = await prisma.article.findMany({
      where,
      orderBy: [
        { featured: "desc" },
        { publishedAt: "desc" },
      ],
      take: limit ? parseInt(limit) : undefined,
      select: {
        id: true,
        slug: true,
        title: true,
        subtitle: true,
        category: true,
        excerpt: true,
        coverImage: true,
        readTime: true,
        tags: true,
        featured: true,
        publishedAt: true,
      },
    });

    // Get all unique categories and tags for filtering
    const allArticles = await prisma.article.findMany({
      where: { published: true },
      select: {
        category: true,
        tags: true,
      },
    });

    const categories = Array.from(new Set(allArticles.map((a) => a.category)));
    const tags = Array.from(new Set(allArticles.flatMap((a) => a.tags)));

    return NextResponse.json({
      articles,
      filters: {
        categories,
        tags,
      },
    });
  } catch (error) {
    console.error("Error fetching articles:", error);
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    );
  }
}
