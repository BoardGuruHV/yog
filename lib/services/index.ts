/**
 * Services Index
 *
 * Central export point for all service modules.
 */

// Re-export all services
export * from './asana.service'
export * from './program.service'
export * from './user.service'
export * from './streak.service'

// Export service instances for direct use
import * as AsanaService from './asana.service'
import * as ProgramService from './program.service'
import * as UserService from './user.service'
import * as StreakService from './streak.service'

export const services = {
  asana: AsanaService,
  program: ProgramService,
  user: UserService,
  streak: StreakService,
} as const
