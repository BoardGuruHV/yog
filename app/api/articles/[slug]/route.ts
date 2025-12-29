import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    const article = await prisma.article.findUnique({
      where: { slug },
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    if (!article.published) {
      return NextResponse.json(
        { error: "Article not published" },
        { status: 404 }
      );
    }

    // Get related articles (same category, different article)
    const relatedArticles = await prisma.article.findMany({
      where: {
        published: true,
        category: article.category,
        id: { not: article.id },
      },
      take: 3,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        readTime: true,
      },
    });

    return NextResponse.json({
      article,
      relatedArticles,
    });
  } catch (error) {
    console.error("Error fetching article:", error);
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    );
  }
}
