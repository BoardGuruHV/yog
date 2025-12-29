import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import {
  generateEmbedding,
  cosineSimilarity,
  keywordSearchScore,
  interpretQuery,
  isEmbeddingsAvailable,
} from "@/lib/search/embeddings";

interface SearchResult {
  asana: {
    id: string;
    nameEnglish: string;
    nameSanskrit: string;
    category: string;
    difficulty: number;
    targetBodyParts: string[];
    benefits: string[];
    svgPath: string;
    description: string;
  };
  score: number;
  matchedTerms: string[];
  searchMethod: "semantic" | "keyword";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 10 } = body;

    if (!query || typeof query !== "string" || query.trim().length < 2) {
      return Response.json(
        { error: "Query must be at least 2 characters" },
        { status: 400 }
      );
    }

    // Interpret the query
    const { intent, filters } = interpretQuery(query);

    // Fetch all asanas
    const asanas = await prisma.asana.findMany({
      include: {
        embedding: true,
      },
    });

    let results: SearchResult[] = [];
    let searchMethod: "semantic" | "keyword" = "keyword";

    // Try semantic search if embeddings are available
    if (isEmbeddingsAvailable()) {
      const queryEmbedding = await generateEmbedding(query);

      if (queryEmbedding) {
        // Check if we have embeddings in the database
        const asanasWithEmbeddings = asanas.filter(
          (a) => a.embedding && Array.isArray(a.embedding.embedding)
        );

        if (asanasWithEmbeddings.length > 0) {
          searchMethod = "semantic";

          results = asanasWithEmbeddings.map((asana) => {
            const embeddingData = asana.embedding!.embedding as number[];
            const similarity = cosineSimilarity(queryEmbedding, embeddingData);

            // Get keyword matches for context
            const keywordResult = keywordSearchScore(query, {
              nameEnglish: asana.nameEnglish,
              nameSanskrit: asana.nameSanskrit,
              description: asana.description,
              category: asana.category,
              difficulty: asana.difficulty,
              benefits: asana.benefits,
              targetBodyParts: asana.targetBodyParts,
            });

            return {
              asana: {
                id: asana.id,
                nameEnglish: asana.nameEnglish,
                nameSanskrit: asana.nameSanskrit,
                category: asana.category,
                difficulty: asana.difficulty,
                targetBodyParts: asana.targetBodyParts,
                benefits: asana.benefits,
                svgPath: asana.svgPath,
                description: asana.description,
              },
              score: similarity,
              matchedTerms: keywordResult.matchedTerms,
              searchMethod: "semantic" as const,
            };
          });
        }
      }
    }

    // Fall back to keyword search
    if (results.length === 0) {
      searchMethod = "keyword";

      results = asanas.map((asana) => {
        const keywordResult = keywordSearchScore(query, {
          nameEnglish: asana.nameEnglish,
          nameSanskrit: asana.nameSanskrit,
          description: asana.description,
          category: asana.category,
          difficulty: asana.difficulty,
          benefits: asana.benefits,
          targetBodyParts: asana.targetBodyParts,
        });

        // Normalize score to 0-1 range (max possible ~25)
        const normalizedScore = Math.min(keywordResult.score / 15, 1);

        return {
          asana: {
            id: asana.id,
            nameEnglish: asana.nameEnglish,
            nameSanskrit: asana.nameSanskrit,
            category: asana.category,
            difficulty: asana.difficulty,
            targetBodyParts: asana.targetBodyParts,
            benefits: asana.benefits,
            svgPath: asana.svgPath,
            description: asana.description,
          },
          score: normalizedScore,
          matchedTerms: keywordResult.matchedTerms,
          searchMethod: "keyword" as const,
        };
      });
    }

    // Apply filters
    if (filters.difficulty) {
      results = results.filter((r) => {
        if (filters.difficulty === "easy") return r.asana.difficulty <= 2;
        if (filters.difficulty === "moderate")
          return r.asana.difficulty >= 2 && r.asana.difficulty <= 3;
        if (filters.difficulty === "hard") return r.asana.difficulty >= 4;
        return true;
      });
    }

    if (filters.bodyPart) {
      results = results.filter((r) =>
        r.asana.targetBodyParts.some(
          (p) => p.toLowerCase() === filters.bodyPart!.toLowerCase()
        )
      );
    }

    // Sort by score and limit results
    results = results
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return Response.json({
      query,
      intent,
      filters,
      searchMethod,
      resultCount: results.length,
      results,
    });
  } catch (error) {
    console.error("Semantic search error:", error);
    return Response.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
