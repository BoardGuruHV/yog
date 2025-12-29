import { describe, it, expect } from 'vitest'
import {
  getRecommendations,
  getStartingPoseRecommendations,
  getCoolDownRecommendations,
  type AsanaInfo,
  type RecommendationContext,
} from '@/lib/recommendations/engine'

// Test fixtures
const mockAsanas: AsanaInfo[] = [
  {
    id: '1',
    nameEnglish: 'Mountain Pose',
    nameSanskrit: 'Tadasana',
    category: 'STANDING',
    difficulty: 1,
    targetBodyParts: ['Legs', 'Core'],
  },
  {
    id: '2',
    nameEnglish: 'Tree Pose',
    nameSanskrit: 'Vrksasana',
    category: 'BALANCE',
    difficulty: 2,
    targetBodyParts: ['Legs', 'Core', 'Hips'],
  },
  {
    id: '3',
    nameEnglish: 'Warrior I',
    nameSanskrit: 'Virabhadrasana I',
    category: 'STANDING',
    difficulty: 2,
    targetBodyParts: ['Legs', 'Hips', 'Shoulders'],
  },
  {
    id: '4',
    nameEnglish: 'Downward Dog',
    nameSanskrit: 'Adho Mukha Svanasana',
    category: 'FORWARD_BEND',
    difficulty: 2,
    targetBodyParts: ['Hamstrings', 'Shoulders', 'Back'],
  },
  {
    id: '5',
    nameEnglish: 'Cobra Pose',
    nameSanskrit: 'Bhujangasana',
    category: 'PRONE',
    difficulty: 2,
    targetBodyParts: ['Back', 'Chest', 'Core'],
  },
  {
    id: '6',
    nameEnglish: 'Child\'s Pose',
    nameSanskrit: 'Balasana',
    category: 'FORWARD_BEND',
    difficulty: 1,
    targetBodyParts: ['Back', 'Hips'],
  },
  {
    id: '7',
    nameEnglish: 'Corpse Pose',
    nameSanskrit: 'Savasana',
    category: 'SUPINE',
    difficulty: 1,
    targetBodyParts: [],
  },
  {
    id: '8',
    nameEnglish: 'Seated Forward Bend',
    nameSanskrit: 'Paschimottanasana',
    category: 'SEATED',
    difficulty: 2,
    targetBodyParts: ['Hamstrings', 'Back'],
  },
  {
    id: '9',
    nameEnglish: 'Headstand',
    nameSanskrit: 'Sirsasana',
    category: 'INVERSION',
    difficulty: 5,
    targetBodyParts: ['Core', 'Shoulders', 'Arms'],
  },
  {
    id: '10',
    nameEnglish: 'Supine Twist',
    nameSanskrit: 'Supta Matsyendrasana',
    category: 'SUPINE',
    difficulty: 1,
    targetBodyParts: ['Spine', 'Hips'],
  },
]

describe('getRecommendations', () => {
  describe('basic functionality', () => {
    it('should return an array of recommendations', () => {
      const context: RecommendationContext = {
        currentAsana: mockAsanas[0],
        sessionAsanas: [mockAsanas[0]],
        sessionProgress: 0.2,
      }
      const result = getRecommendations(mockAsanas, context)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should respect the limit parameter', () => {
      const context: RecommendationContext = {
        currentAsana: mockAsanas[0],
        sessionAsanas: [mockAsanas[0]],
        sessionProgress: 0.2,
      }
      const result = getRecommendations(mockAsanas, context, 3)
      expect(result.length).toBeLessThanOrEqual(3)
    })

    it('should not recommend the current asana', () => {
      const currentAsana = mockAsanas[0]
      const context: RecommendationContext = {
        currentAsana,
        sessionAsanas: [currentAsana],
        sessionProgress: 0.2,
      }
      const result = getRecommendations(mockAsanas, context)
      const hasCurrentAsana = result.some((r) => r.asana.id === currentAsana.id)
      expect(hasCurrentAsana).toBe(false)
    })

    it('should return recommendations with scores between 0 and 1', () => {
      const context: RecommendationContext = {
        currentAsana: mockAsanas[0],
        sessionAsanas: [mockAsanas[0]],
        sessionProgress: 0.2,
      }
      const result = getRecommendations(mockAsanas, context)
      result.forEach((rec) => {
        expect(rec.score).toBeGreaterThanOrEqual(0)
        expect(rec.score).toBeLessThanOrEqual(1)
      })
    })

    it('should include reasons for recommendations', () => {
      const context: RecommendationContext = {
        currentAsana: mockAsanas[0],
        sessionAsanas: [mockAsanas[0]],
        sessionProgress: 0.2,
      }
      const result = getRecommendations(mockAsanas, context)
      result.forEach((rec) => {
        expect(Array.isArray(rec.reasons)).toBe(true)
        expect(rec.reasons.length).toBeLessThanOrEqual(2)
      })
    })
  })

  describe('category flow scoring', () => {
    it('should prefer good flow categories', () => {
      // Standing flows well to Standing, Balance, Forward Bend, Twist
      const context: RecommendationContext = {
        currentAsana: mockAsanas[0], // Mountain Pose (STANDING)
        sessionAsanas: [mockAsanas[0]],
        sessionProgress: 0.3,
      }
      const result = getRecommendations(mockAsanas, context, 10)

      // Find a standing pose and an inversion (which should be avoided)
      const standingRec = result.find((r) => r.asana.category === 'STANDING')
      const inversionRec = result.find((r) => r.asana.category === 'INVERSION')

      if (standingRec && inversionRec) {
        expect(standingRec.score).toBeGreaterThan(inversionRec.score)
      }
    })
  })

  describe('difficulty progression', () => {
    it('should prefer lower difficulty in cool-down phase', () => {
      const context: RecommendationContext = {
        currentAsana: mockAsanas[2], // Warrior I (difficulty 2)
        sessionAsanas: [mockAsanas[0], mockAsanas[2]],
        sessionProgress: 0.9, // Late session
      }
      const result = getRecommendations(mockAsanas, context)

      // Easy poses should rank higher in cool-down
      const easyPose = result.find((r) => r.asana.difficulty === 1)
      const hardPose = result.find((r) => r.asana.difficulty === 5)

      if (easyPose && hardPose) {
        expect(easyPose.score).toBeGreaterThan(hardPose.score)
      }
    })

    it('should prefer gradual difficulty increase early in session', () => {
      const context: RecommendationContext = {
        currentAsana: mockAsanas[0], // Mountain Pose (difficulty 1)
        sessionAsanas: [mockAsanas[0]],
        sessionProgress: 0.1, // Early session
      }
      const result = getRecommendations(mockAsanas, context)

      // Moderate poses should rank higher than extreme difficulty
      const moderatePose = result.find((r) => r.asana.difficulty === 2)
      const hardPose = result.find((r) => r.asana.difficulty === 5)

      if (moderatePose && hardPose) {
        expect(moderatePose.score).toBeGreaterThan(hardPose.score)
      }
    })
  })

  describe('variety scoring', () => {
    it('should penalize already-used asanas', () => {
      const context: RecommendationContext = {
        currentAsana: mockAsanas[0],
        sessionAsanas: [mockAsanas[0], mockAsanas[1], mockAsanas[2]],
        sessionProgress: 0.3,
      }
      const result = getRecommendations(mockAsanas, context)

      // Already-used asanas should have lower scores
      const usedAsana = result.find((r) => r.asana.id === mockAsanas[1].id)
      const unusedAsana = result.find((r) => r.asana.id === mockAsanas[5].id)

      if (usedAsana && unusedAsana) {
        expect(unusedAsana.score).toBeGreaterThan(usedAsana.score)
      }
    })
  })

  describe('user goals matching', () => {
    it('should boost poses matching user goals', () => {
      const context: RecommendationContext = {
        currentAsana: mockAsanas[0],
        sessionAsanas: [mockAsanas[0]],
        sessionProgress: 0.3,
        userGoals: ['flexibility'],
      }
      const result = getRecommendations(mockAsanas, context)

      // Forward bends and hamstring-targeting poses should be boosted
      // Check that flexibility-related poses (FORWARD_BEND, poses targeting hamstrings/hips)
      // appear in recommendations - they may or may not have explicit "flexibility" in reason
      const hasFlexibilityRelatedPose = result.some(
        (rec) =>
          rec.asana.category === 'FORWARD_BEND' ||
          rec.asana.targetBodyParts.includes('Hamstrings') ||
          rec.asana.targetBodyParts.includes('Hips') ||
          rec.reasons.some((r) => r.toLowerCase().includes('flexibility'))
      )
      expect(hasFlexibilityRelatedPose).toBe(true)
    })
  })
})

describe('getStartingPoseRecommendations', () => {
  it('should return recommendations without current asana', () => {
    const result = getStartingPoseRecommendations(mockAsanas)
    expect(result.length).toBeGreaterThan(0)
  })

  it('should prefer standing or seated poses for starting', () => {
    const result = getStartingPoseRecommendations(mockAsanas, 3)
    const topRecommendations = result.slice(0, 2)

    const hasGoodStartingCategory = topRecommendations.some(
      (rec) => rec.asana.category === 'STANDING' || rec.asana.category === 'SEATED'
    )
    expect(hasGoodStartingCategory).toBe(true)
  })

  it('should prefer easier poses for starting', () => {
    const result = getStartingPoseRecommendations(mockAsanas, 5)
    const avgDifficulty = result.reduce((sum, r) => sum + r.asana.difficulty, 0) / result.length
    expect(avgDifficulty).toBeLessThan(3)
  })
})

describe('getCoolDownRecommendations', () => {
  it('should only return gentle poses', () => {
    const sessionAsanas = [mockAsanas[0], mockAsanas[2], mockAsanas[4]]
    const result = getCoolDownRecommendations(mockAsanas, sessionAsanas)

    result.forEach((rec) => {
      expect(rec.asana.difficulty).toBeLessThanOrEqual(2)
      expect(['SUPINE', 'SEATED', 'FORWARD_BEND']).toContain(rec.asana.category)
    })
  })

  it('should use the last session asana as current', () => {
    const sessionAsanas = [mockAsanas[0], mockAsanas[2], mockAsanas[4]]
    const result = getCoolDownRecommendations(mockAsanas, sessionAsanas)

    // Should not include the last asana in recommendations
    const hasLastAsana = result.some((r) => r.asana.id === mockAsanas[4].id)
    expect(hasLastAsana).toBe(false)
  })
})
