// Types ported from web app (types/index.ts)

export type Category =
  | 'STANDING'
  | 'SEATED'
  | 'PRONE'
  | 'SUPINE'
  | 'INVERSION'
  | 'BALANCE'
  | 'TWIST'
  | 'FORWARD_BEND'
  | 'BACK_BEND';

export interface Asana {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  description: string;
  category: Category;
  difficulty: number;
  durationSeconds: number;
  benefits: string[];
  targetBodyParts: string[];
  svgPath: string;
  contraindications?: Contraindication[];
  modifications?: Modification[];
}

export interface Condition {
  id: string;
  name: string;
  description?: string;
}

export interface Contraindication {
  id: string;
  asanaId: string;
  conditionId: string;
  condition?: Condition;
  severity: 'avoid' | 'caution' | 'modify';
  notes?: string;
}

export interface Modification {
  id: string;
  asanaId: string;
  conditionId?: string;
  condition?: Condition;
  forAge?: string;
  description: string;
  svgPath?: string;
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  totalDuration: number;
  asanas: ProgramAsana[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramAsana {
  id: string;
  programId: string;
  asanaId: string;
  asana?: Asana;
  order: number;
  duration: number;
  notes?: string;
}

export interface FilterState {
  categories: Category[];
  difficulty: number[];
  bodyParts: string[];
  search: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  STANDING: 'Standing',
  SEATED: 'Seated',
  PRONE: 'Prone',
  SUPINE: 'Supine',
  INVERSION: 'Inversion',
  BALANCE: 'Balance',
  TWIST: 'Twist',
  FORWARD_BEND: 'Forward Bend',
  BACK_BEND: 'Back Bend',
};

// React Native colors (converted from Tailwind)
export const CATEGORY_COLORS: Record<Category, { bg: string; text: string }> = {
  STANDING: { bg: '#dbeafe', text: '#1d4ed8' },
  SEATED: { bg: '#f3e8ff', text: '#7c3aed' },
  PRONE: { bg: '#fef3c7', text: '#b45309' },
  SUPINE: { bg: '#ccfbf1', text: '#0f766e' },
  INVERSION: { bg: '#fee2e2', text: '#b91c1c' },
  BALANCE: { bg: '#e0e7ff', text: '#4338ca' },
  TWIST: { bg: '#fce7f3', text: '#be185d' },
  FORWARD_BEND: { bg: '#d1fae5', text: '#047857' },
  BACK_BEND: { bg: '#ffedd5', text: '#c2410c' },
};

export const BODY_PARTS = [
  'back',
  'core',
  'hamstrings',
  'hips',
  'shoulders',
  'chest',
  'legs',
  'arms',
  'spine',
  'neck',
  'glutes',
  'ankles',
  'wrists',
] as const;

export type BodyPart = (typeof BODY_PARTS)[number];

// User & Auth types
export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Subscription types
export type SubscriptionTier = 'FREE' | 'PREMIUM' | 'PRO';
export type SubscriptionStatus =
  | 'ACTIVE'
  | 'PAST_DUE'
  | 'CANCELED'
  | 'TRIALING'
  | 'PAUSED';

export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

// Tier limits (ported from lib/stripe/index.ts)
export const TIER_LIMITS = {
  FREE: {
    aiChatPerDay: 10,
    programsTotal: 3,
    aiProgramGeneration: false,
    poseDetection: false,
    fullAnalytics: false,
    offlineAccess: false,
    prioritySupport: false,
  },
  PREMIUM: {
    aiChatPerDay: 50,
    programsTotal: Infinity,
    aiProgramGeneration: true,
    poseDetection: true,
    fullAnalytics: true,
    offlineAccess: true,
    prioritySupport: false,
  },
  PRO: {
    aiChatPerDay: Infinity,
    programsTotal: Infinity,
    aiProgramGeneration: true,
    poseDetection: true,
    fullAnalytics: true,
    offlineAccess: true,
    prioritySupport: true,
  },
} as const;

export type Feature = keyof (typeof TIER_LIMITS)['FREE'];

// Streak types
export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  totalPracticeDays: number;
}

// Goal types
export interface Goal {
  id: string;
  userId: string;
  type: 'practice_days' | 'duration_minutes' | 'poses_completed';
  target: number;
  current: number;
  startDate: string;
  endDate: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

// Favorite types
export interface Favorite {
  id: string;
  userId: string;
  asanaId: string;
  asana?: Asana;
  createdAt: string;
}

// Practice log types
export interface PracticeLog {
  id: string;
  userId: string;
  programId?: string;
  program?: Program;
  durationSeconds: number;
  completedAt: string;
  notes?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Timer types
export interface TimerState {
  status: 'idle' | 'playing' | 'paused' | 'completed';
  currentPoseIndex: number;
  poseTimeRemaining: number;
  totalTimeRemaining: number;
  totalTimeElapsed: number;
}

// Meditation types
export interface MeditationSession {
  durationMinutes: number;
  ambientSound: 'none' | 'rain' | 'ocean' | 'forest' | 'bells';
  intervalBells: number; // minutes between bells, 0 for no bells
}

// Interval training types
export interface IntervalConfig {
  workDuration: number; // seconds
  restDuration: number; // seconds
  rounds: number;
  exercises: Array<{
    name: string;
    asanaId?: string;
  }>;
}
