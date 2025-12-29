import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import prisma from '@/lib/db'
import { getSystemPrompt } from '@/lib/ai/prompts'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { validateBody, successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'
import { chatMessageSchema } from '@/lib/validation/schemas'

function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured')
  }
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'Yog - Yoga App',
    },
  })
}

export async function POST(request: NextRequest) {
  // Rate limiting for chat
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.chat, 'chat')
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Validate request body
    const validation = await validateBody(request, chatMessageSchema)
    if ('error' in validation) return validation.error

    const { message, sessionId } = validation.data

    // Get or create chat session
    let session
    if (sessionId) {
      session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      })
    }

    if (!session) {
      session = await prisma.chatSession.create({
        data: {
          title: message.slice(0, 50),
        },
        include: { messages: true },
      })
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: 'user',
        content: message,
      },
    })

    // Fetch asanas and conditions for context
    const [asanas, conditions] = await Promise.all([
      prisma.asana.findMany({
        include: {
          contraindications: { include: { condition: true } },
          modifications: { include: { condition: true } },
        },
      }),
      prisma.condition.findMany(),
    ])

    // Build conversation history
    const conversationHistory = session.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))

    // Add the new user message
    conversationHistory.push({ role: 'user', content: message })

    // Get system prompt with yoga knowledge
    const systemPrompt = getSystemPrompt(asanas as any, conditions as any)

    // Create streaming response
    const openai = getOpenRouterClient()
    const stream = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...conversationHistory],
      stream: true,
      max_tokens: 1000,
      temperature: 0.7,
    })

    // Create a TransformStream for streaming
    const encoder = new TextEncoder()
    let fullResponse = ''

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              fullResponse += content
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ content, sessionId: session.id })}\n\n`
                )
              )
            }
          }

          // Save assistant message after streaming completes
          await prisma.chatMessage.create({
            data: {
              sessionId: session.id,
              role: 'assistant',
              content: fullResponse,
            },
          })

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, sessionId: session.id })}\n\n`
            )
          )
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to process chat message', 500)
  }
}

// Get chat history
export async function GET(request: NextRequest) {
  // Rate limiting for read
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.read, 'chat-read')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (sessionId) {
      const session = await prisma.chatSession.findUnique({
        where: { id: sessionId },
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      })

      if (!session) {
        return errorResponse(ErrorCodes.NOT_FOUND, 'Session not found', 404)
      }

      return successResponse(session)
    }

    // Return all sessions (for session list)
    const sessions = await prisma.chatSession.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return successResponse(sessions)
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return errorResponse(ErrorCodes.INTERNAL_ERROR, 'Failed to fetch chat history', 500)
  }
}
