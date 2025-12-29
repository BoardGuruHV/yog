import { z } from 'zod'

// ============================================
// Common Schemas
// ============================================

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .transform((email) => email.toLowerCase().trim())

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters')

export const idSchema = z.string().min(1, 'ID is required')

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// ============================================
// Auth Schemas
// ============================================

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1).max(100).optional(),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const magicLinkSchema = z.object({
  email: emailSchema,
})

export const freePassRequestSchema = z.object({
  email: emailSchema,
  reason: z.string().min(10, 'Please provide a reason (at least 10 characters)').max(500),
})

// ============================================
// Program Schemas
// ============================================

export const programAsanaSchema = z.object({
  asanaId: idSchema,
  duration: z.number().int().positive().max(3600, 'Duration cannot exceed 1 hour'),
  notes: z.string().max(500).optional(),
})

export const createProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(100),
  description: z.string().max(1000).optional(),
  asanas: z.array(programAsanaSchema).min(1, 'At least one asana is required').max(50),
})

export const updateProgramSchema = createProgramSchema.partial()

// ============================================
// Profile Schemas
// ============================================

export const experienceLevelSchema = z.enum(['beginner', 'intermediate', 'advanced'])

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  experienceLevel: experienceLevelSchema.optional(),
  goals: z.array(z.string()).max(10).optional(),
  preferredDuration: z.number().int().positive().max(180).optional(),
})

// ============================================
// Goals Schemas
// ============================================

export const createGoalSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  targetDate: z.string().datetime().optional(),
  targetValue: z.number().positive().optional(),
  unit: z.string().max(20).optional(),
})

export const updateGoalSchema = createGoalSchema.partial().extend({
  currentValue: z.number().optional(),
  completed: z.boolean().optional(),
})

// ============================================
// Journal Schemas
// ============================================

export const createJournalEntrySchema = z.object({
  content: z.string().min(1).max(5000),
  mood: z.enum(['great', 'good', 'neutral', 'bad', 'terrible']).optional(),
  energyLevel: z.number().int().min(1).max(10).optional(),
  practiceLogId: idSchema.optional(),
})

// ============================================
// Asana Filter Schemas
// ============================================

export const asanaCategorySchema = z.enum([
  'STANDING',
  'SEATED',
  'PRONE',
  'SUPINE',
  'INVERSION',
  'BALANCE',
  'TWIST',
  'FORWARD_BEND',
  'BACK_BEND',
])

export const asanaFilterSchema = z.object({
  search: z.string().max(100).optional(),
  categories: z.array(asanaCategorySchema).optional(),
  difficulty: z.array(z.coerce.number().int().min(1).max(5)).optional(),
  bodyParts: z.array(z.string()).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
})

// ============================================
// AI Generation Schemas
// ============================================

export const generateProgramSchema = z.object({
  goal: z.string().min(5, 'Goal is required').max(200),
  duration: z.number().int().min(5).max(120).default(30),
  difficulty: z.number().int().min(1).max(5).default(2),
  focus: z.array(z.string()).max(5).optional(),
  excludeAsanas: z.array(idSchema).optional(),
})

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  sessionId: idSchema.optional(),
})

// ============================================
// Collection Schemas
// ============================================

export const createCollectionSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const addToCollectionSchema = z.object({
  collectionId: idSchema,
  asanaIds: z.array(idSchema).min(1).max(50),
})

// ============================================
// Review Schemas
// ============================================

export const createReviewSchema = z.object({
  asanaId: idSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

// ============================================
// Reminder Schemas
// ============================================

export const createReminderSchema = z.object({
  title: z.string().min(1).max(100),
  time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  days: z.array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])).min(1),
  enabled: z.boolean().default(true),
})

// ============================================
// Practice Log Schemas
// ============================================

export const createPracticeLogSchema = z.object({
  programId: idSchema.optional(),
  duration: z.number().int().positive().max(360),
  completedAsanas: z.array(idSchema).optional(),
  mood: z.enum(['great', 'good', 'neutral', 'bad', 'terrible']).optional(),
  energyLevel: z.number().int().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
})

// ============================================
// Share Schemas
// ============================================

export const createShareSchema = z.object({
  programId: idSchema,
  expiresAt: z.string().datetime().optional(),
})

// ============================================
// Mastery Schemas
// ============================================

export const updateMasterySchema = z.object({
  asanaId: idSchema,
  level: z.number().int().min(1).max(5),
  notes: z.string().max(500).optional(),
})

// ============================================
// Flexibility Log Schemas
// ============================================

export const createFlexibilityLogSchema = z.object({
  asanaId: idSchema,
  measurement: z.number().positive(),
  unit: z.enum(['cm', 'inches', 'degrees']),
  notes: z.string().max(500).optional(),
})

// ============================================
// Type Exports
// ============================================

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type CreateProgramInput = z.infer<typeof createProgramSchema>
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type AsanaFilterInput = z.infer<typeof asanaFilterSchema>
export type GenerateProgramInput = z.infer<typeof generateProgramSchema>
export type ChatMessageInput = z.infer<typeof chatMessageSchema>
export type CreateCollectionInput = z.infer<typeof createCollectionSchema>
export type CreateReviewInput = z.infer<typeof createReviewSchema>
export type CreateReminderInput = z.infer<typeof createReminderSchema>
export type CreatePracticeLogInput = z.infer<typeof createPracticeLogSchema>
