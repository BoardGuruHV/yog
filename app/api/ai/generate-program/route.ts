import { NextRequest } from 'next/server'
import OpenAI from 'openai'
import prisma from '@/lib/db'
import {
  ProgramRequest,
  buildProgramGeneratorPrompt,
  parseGeneratedProgram,
} from '@/lib/ai/program-generator'
import { rateLimit, RATE_LIMITS } from '@/lib/rate-limit'
import { successResponse, errorResponse, ErrorCodes } from '@/lib/api-utils'

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
  // Rate limiting - strict for expensive AI operations
  const rateLimitResponse = rateLimit(request, RATE_LIMITS.generateProgram, 'ai-generate')
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body: ProgramRequest = await request.json()

    // Validate required fields
    if (!body.goals || body.goals.length === 0) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'At least one goal is required',
        400
      )
    }

    if (!body.duration || body.duration < 5 || body.duration > 120) {
      return errorResponse(
        ErrorCodes.VALIDATION_ERROR,
        'Duration must be between 5 and 120 minutes',
        400
      )
    }

    // Fetch asanas with contraindications
    const [asanas, conditions] = await Promise.all([
      prisma.asana.findMany({
        include: {
          contraindications: { include: { condition: true } },
        },
      }),
      prisma.condition.findMany(),
    ])

    // Build the prompt
    const prompt = buildProgramGeneratorPrompt(body, asanas as any, conditions)

    // Call OpenRouter
    const openai = getOpenRouterClient()
    const completion = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a professional yoga instructor. Always respond with valid JSON only, no markdown formatting.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    const responseContent = completion.choices[0]?.message?.content
    if (!responseContent) {
      return errorResponse(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to generate program - empty response',
        500
      )
    }

    // Parse the generated program
    const generatedProgram = parseGeneratedProgram(responseContent)
    if (!generatedProgram) {
      console.error('Failed to parse response:', responseContent)
      return errorResponse(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Failed to parse generated program',
        500
      )
    }

    // Validate that all asana IDs exist
    const asanaIds = new Set(asanas.map((a) => a.id))
    const validSequence = generatedProgram.asanaSequence.filter((item) =>
      asanaIds.has(item.asanaId)
    )

    if (validSequence.length === 0) {
      return errorResponse(
        ErrorCodes.EXTERNAL_SERVICE_ERROR,
        'Generated program contains no valid asanas',
        500
      )
    }

    // Get full asana details for the response
    const sequenceWithDetails = validSequence.map((item) => {
      const asana = asanas.find((a) => a.id === item.asanaId)
      return {
        ...item,
        asana: asana
          ? {
              id: asana.id,
              englishName: asana.nameEnglish,
              sanskritName: asana.nameSanskrit,
              category: asana.category,
              difficulty: asana.difficulty,
              imagePath: asana.svgPath,
            }
          : null,
      }
    })

    return successResponse({
      ...generatedProgram,
      asanaSequence: sequenceWithDetails,
    })
  } catch (error) {
    console.error('Program generation error:', error)
    return errorResponse(
      ErrorCodes.INTERNAL_ERROR,
      'Failed to generate program',
      500
    )
  }
}
