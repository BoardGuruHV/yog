import {
  Sparkles,
  Heart,
  Brain,
  Clock,
  Target,
  Users,
  Trophy,
  Zap,
  Leaf,
  Sun,
  type LucideIcon
} from 'lucide-react';

export interface Feature {
  icon: LucideIcon;
  text: string;
}

export interface Testimonial {
  text: string;
  author: string;
}

export interface ValueProposition {
  id: string;
  theme: string;
  headline: string;
  headlineEmphasis: string;
  subheadline: string;
  features: Feature[];
  testimonial: Testimonial;
  accentColor: string;
}

export const valuePropositions: ValueProposition[] = [
  {
    id: 'personalized',
    theme: 'Personalized Practice',
    headline: 'Your Yoga Journey,',
    headlineEmphasis: 'Personalized',
    subheadline: 'AI-powered recommendations based on your goals, experience level, and available time.',
    features: [
      {
        icon: Brain,
        text: 'Smart program recommendations tailored to you',
      },
      {
        icon: Target,
        text: 'Track progress and master poses at your pace',
      },
      {
        icon: Clock,
        text: 'Sessions that fit your schedule - 5 to 60 minutes',
      },
    ],
    testimonial: {
      text: 'The personalized programs have completely transformed my practice. I feel stronger and more flexible than ever.',
      author: 'Sarah M., Practicing for 6 months',
    },
    accentColor: 'text-green-300',
  },
  {
    id: 'comprehensive',
    theme: 'Comprehensive Library',
    headline: 'Master Every Pose with',
    headlineEmphasis: 'Expert Guidance',
    subheadline: 'Detailed tutorials, Sanskrit pronunciation, and anatomy insights for 100+ asanas.',
    features: [
      {
        icon: Sparkles,
        text: 'Step-by-step tutorials with breathing cues',
      },
      {
        icon: Heart,
        text: 'Medical contraindications and modifications',
      },
      {
        icon: Leaf,
        text: 'Sanskrit names with audio pronunciation',
      },
    ],
    testimonial: {
      text: 'The anatomy viewer and modifications for my back issues have been invaluable. Finally, safe yoga practice!',
      author: 'Michael R., Yoga Teacher',
    },
    accentColor: 'text-purple-300',
  },
  {
    id: 'community',
    theme: 'Expert Community',
    headline: 'Learn from',
    headlineEmphasis: 'Certified Instructors',
    subheadline: 'Browse programs from verified yoga teachers and join community challenges.',
    features: [
      {
        icon: Users,
        text: 'Programs from certified yoga instructors',
      },
      {
        icon: Trophy,
        text: 'Achievements and streak tracking',
      },
      {
        icon: Zap,
        text: 'Share programs and practice with friends',
      },
    ],
    testimonial: {
      text: 'The instructor programs gave me variety I never had before. Love the community challenges!',
      author: 'Priya K., Daily Practitioner',
    },
    accentColor: 'text-yellow-300',
  },
  {
    id: 'wellness',
    theme: 'Holistic Wellness',
    headline: 'Beyond Asanas -',
    headlineEmphasis: 'Complete Wellness',
    subheadline: 'Meditation timers, breathing exercises, and recovery recommendations for whole-body health.',
    features: [
      {
        icon: Sun,
        text: 'Guided meditation and pranayama sessions',
      },
      {
        icon: Heart,
        text: 'Rest day and recovery recommendations',
      },
      {
        icon: Brain,
        text: 'Mood tracking and practice journal',
      },
    ],
    testimonial: {
      text: 'The breathing exercises have helped my anxiety so much. This app understands holistic wellness.',
      author: 'James L., Stress Management',
    },
    accentColor: 'text-blue-300',
  },
];
