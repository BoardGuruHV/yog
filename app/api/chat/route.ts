import { NextRequest } from "next/server";
import OpenAI from "openai";
import prisma from "@/lib/db";
import { getSystemPrompt } from "@/lib/ai/prompts";

function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:3001",
      "X-Title": "Yog - Yoga App",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, sessionId } = body;

    if (!message) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    // Get or create chat session
    let session;
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          title: message.slice(0, 50),
        },
        include: { messages: true },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "user",
        content: message,
      },
    });

    // Fetch asanas and conditions for context
    const [asanas, conditions] = await Promise.all([
      prisma.asana.findMany({
        include: {
          contraindications: { include: { condition: true } },
          modifications: { include: { condition: true } },
        },
      }),
      prisma.condition.findMany(),
    ]);

    // Build conversation history
    const conversationHistory = session.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Add the new user message
    conversationHistory.push({ role: "user", content: message });

    // Get system prompt with yoga knowledge
    const systemPrompt = getSystemPrompt(asanas as any, conditions as any);

    // Create streaming response
    const openai = getOpenRouterClient();
    const stream = await openai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...conversationHistory,
      ],
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    });

    // Create a TransformStream for streaming
    const encoder = new TextEncoder();
    let fullResponse = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              fullResponse += content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content, sessionId: session.id })}\n\n`)
              );
            }
          }

          // Save assistant message after streaming completes
          await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              role: "assistant",
              content: fullResponse,
            },
          });

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ done: true, sessionId: session.id })}\n\n`)
          );
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return Response.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

// Get chat history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
      });

      if (!session) {
        return Response.json({ error: "Session not found" }, { status: 404 });
      }

      return Response.json(session);
    }

    // Return all sessions (for session list)
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return Response.json(sessions);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return Response.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
