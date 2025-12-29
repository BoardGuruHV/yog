import { describe, it, expect } from 'vitest'
import {
  registerSchema,
  loginSchema,
  createProgramSchema,
  updateProfileSchema,
  createGoalSchema,
  asanaFilterSchema,
  generateProgramSchema,
  chatMessageSchema,
  createReminderSchema,
  createPracticeLogSchema,
} from '@/lib/validation/schemas'

describe('registerSchema', () => {
  it('should validate correct registration data', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
      name: 'John Doe',
    }
    const result = registerSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('test@example.com')
    }
  })

  it('should normalize email to lowercase', () => {
    const data = {
      email: 'TEST@EXAMPLE.COM',
      password: 'password123',
    }
    const result = registerSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('test@example.com')
    }
  })

  it('should reject invalid email', () => {
    const data = {
      email: 'invalid-email',
      password: 'password123',
    }
    const result = registerSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject short password', () => {
    const data = {
      email: 'test@example.com',
      password: '1234567', // 7 characters
    }
    const result = registerSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should allow optional name', () => {
    const data = {
      email: 'test@example.com',
      password: 'password123',
    }
    const result = registerSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

describe('loginSchema', () => {
  it('should validate correct login data', () => {
    const data = {
      email: 'test@example.com',
      password: 'anypassword',
    }
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject empty password', () => {
    const data = {
      email: 'test@example.com',
      password: '',
    }
    const result = loginSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('createProgramSchema', () => {
  it('should validate correct program data', () => {
    const data = {
      name: 'Morning Yoga',
      description: 'A gentle morning routine',
      asanas: [
        { asanaId: 'asana-1', duration: 60 },
        { asanaId: 'asana-2', duration: 90, notes: 'Focus on breath' },
      ],
    }
    const result = createProgramSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject empty name', () => {
    const data = {
      name: '',
      asanas: [{ asanaId: 'asana-1', duration: 60 }],
    }
    const result = createProgramSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject empty asanas array', () => {
    const data = {
      name: 'Morning Yoga',
      asanas: [],
    }
    const result = createProgramSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject invalid duration', () => {
    const data = {
      name: 'Morning Yoga',
      asanas: [{ asanaId: 'asana-1', duration: -1 }],
    }
    const result = createProgramSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject duration over 1 hour', () => {
    const data = {
      name: 'Morning Yoga',
      asanas: [{ asanaId: 'asana-1', duration: 3601 }],
    }
    const result = createProgramSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should allow optional description', () => {
    const data = {
      name: 'Morning Yoga',
      asanas: [{ asanaId: 'asana-1', duration: 60 }],
    }
    const result = createProgramSchema.safeParse(data)
    expect(result.success).toBe(true)
  })
})

describe('updateProfileSchema', () => {
  it('should validate correct profile data', () => {
    const data = {
      name: 'Jane Doe',
      experienceLevel: 'intermediate',
      goals: ['flexibility', 'strength'],
      preferredDuration: 30,
    }
    const result = updateProfileSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid experience level', () => {
    const data = {
      experienceLevel: 'expert',
    }
    const result = updateProfileSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should allow partial updates', () => {
    const data = {
      name: 'Jane',
    }
    const result = updateProfileSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject too many goals', () => {
    const data = {
      goals: Array(11).fill('goal'),
    }
    const result = updateProfileSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('createGoalSchema', () => {
  it('should validate correct goal data', () => {
    const data = {
      title: 'Touch my toes',
      description: 'Improve hamstring flexibility',
      targetValue: 10,
      unit: 'cm',
    }
    const result = createGoalSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject empty title', () => {
    const data = {
      title: '',
    }
    const result = createGoalSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('asanaFilterSchema', () => {
  it('should validate correct filter data', () => {
    const data = {
      search: 'warrior',
      categories: ['STANDING', 'BALANCE'],
      difficulty: [1, 2, 3],
      page: 1,
      limit: 20,
    }
    const result = asanaFilterSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should coerce string numbers', () => {
    const data = {
      page: '2',
      limit: '10',
    }
    const result = asanaFilterSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(2)
      expect(result.data.limit).toBe(10)
    }
  })

  it('should use defaults for pagination', () => {
    const data = {}
    const result = asanaFilterSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.limit).toBe(20)
    }
  })

  it('should reject invalid category', () => {
    const data = {
      categories: ['INVALID_CATEGORY'],
    }
    const result = asanaFilterSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject limit over 100', () => {
    const data = {
      limit: 101,
    }
    const result = asanaFilterSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('generateProgramSchema', () => {
  it('should validate correct generation data', () => {
    const data = {
      goal: 'Improve flexibility',
      duration: 30,
      difficulty: 2,
      focus: ['hamstrings', 'hips'],
    }
    const result = generateProgramSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject short goal', () => {
    const data = {
      goal: 'Hi',
      duration: 30,
    }
    const result = generateProgramSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should use defaults', () => {
    const data = {
      goal: 'Improve flexibility for beginners',
    }
    const result = generateProgramSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.duration).toBe(30)
      expect(result.data.difficulty).toBe(2)
    }
  })

  it('should reject duration over 120 minutes', () => {
    const data = {
      goal: 'Long yoga session',
      duration: 121,
    }
    const result = generateProgramSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('chatMessageSchema', () => {
  it('should validate correct message data', () => {
    const data = {
      message: 'What poses help with back pain?',
      sessionId: 'session-123',
    }
    const result = chatMessageSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject empty message', () => {
    const data = {
      message: '',
    }
    const result = chatMessageSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject message over 2000 characters', () => {
    const data = {
      message: 'a'.repeat(2001),
    }
    const result = chatMessageSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('createReminderSchema', () => {
  it('should validate correct reminder data', () => {
    const data = {
      title: 'Morning Practice',
      time: '07:00',
      days: ['mon', 'wed', 'fri'],
      enabled: true,
    }
    const result = createReminderSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid time format', () => {
    const data = {
      title: 'Morning Practice',
      time: '7:00 AM',
      days: ['mon'],
    }
    const result = createReminderSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject empty days array', () => {
    const data = {
      title: 'Morning Practice',
      time: '07:00',
      days: [],
    }
    const result = createReminderSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject invalid day', () => {
    const data = {
      title: 'Morning Practice',
      time: '07:00',
      days: ['monday'],
    }
    const result = createReminderSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})

describe('createPracticeLogSchema', () => {
  it('should validate correct practice log data', () => {
    const data = {
      duration: 30,
      mood: 'good',
      energyLevel: 7,
      notes: 'Great session!',
    }
    const result = createPracticeLogSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it('should reject invalid mood', () => {
    const data = {
      duration: 30,
      mood: 'amazing',
    }
    const result = createPracticeLogSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject energy level out of range', () => {
    const data = {
      duration: 30,
      energyLevel: 11,
    }
    const result = createPracticeLogSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('should reject duration over 360 minutes', () => {
    const data = {
      duration: 361,
    }
    const result = createPracticeLogSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
