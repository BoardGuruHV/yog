export type MeditationType =
  | "mindfulness"
  | "breath"
  | "body-scan"
  | "loving-kindness"
  | "mantra"
  | "visualization";

export interface MeditationStyle {
  id: MeditationType;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  defaultDuration: number; // minutes
  instructions: string[];
  benefits: string[];
}

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  // Audio will be generated using Web Audio API
}

export const MEDITATION_STYLES: MeditationStyle[] = [
  {
    id: "mindfulness",
    name: "Mindfulness",
    description: "Focus on the present moment with gentle awareness of thoughts and sensations.",
    icon: "Brain",
    color: "purple",
    gradient: "from-purple-500 to-indigo-600",
    defaultDuration: 10,
    instructions: [
      "Find a comfortable seated position",
      "Close your eyes gently",
      "Focus on your natural breath",
      "Notice thoughts without judgment",
      "Return attention to breath when distracted",
    ],
    benefits: ["Reduces stress", "Improves focus", "Emotional balance"],
  },
  {
    id: "breath",
    name: "Breath Focus",
    description: "Use specific breathing patterns to calm the mind and energize the body.",
    icon: "Wind",
    color: "cyan",
    gradient: "from-cyan-500 to-blue-600",
    defaultDuration: 5,
    instructions: [
      "Sit comfortably with spine straight",
      "Breathe in for 4 counts",
      "Hold for 4 counts",
      "Exhale for 4 counts",
      "Repeat the cycle",
    ],
    benefits: ["Calms nervous system", "Increases oxygen", "Reduces anxiety"],
  },
  {
    id: "body-scan",
    name: "Body Scan",
    description: "Systematically move awareness through the body to release tension.",
    icon: "Scan",
    color: "green",
    gradient: "from-green-500 to-emerald-600",
    defaultDuration: 15,
    instructions: [
      "Lie down or sit comfortably",
      "Start at the top of your head",
      "Move awareness slowly down the body",
      "Notice sensations without changing them",
      "Release tension as you exhale",
    ],
    benefits: ["Releases physical tension", "Improves body awareness", "Better sleep"],
  },
  {
    id: "loving-kindness",
    name: "Loving Kindness",
    description: "Cultivate compassion for yourself and others through gentle phrases.",
    icon: "Heart",
    color: "pink",
    gradient: "from-pink-500 to-rose-600",
    defaultDuration: 10,
    instructions: [
      "Sit comfortably and close your eyes",
      "Begin with self-compassion phrases",
      "Extend kindness to loved ones",
      "Include neutral people",
      "Embrace all beings with love",
    ],
    benefits: ["Increases empathy", "Reduces negative emotions", "Improves relationships"],
  },
  {
    id: "mantra",
    name: "Mantra",
    description: "Repeat a word or phrase to focus the mind and enter deep meditation.",
    icon: "Mic",
    color: "orange",
    gradient: "from-orange-500 to-amber-600",
    defaultDuration: 10,
    instructions: [
      "Choose a meaningful word or phrase",
      "Sit quietly and breathe naturally",
      "Silently repeat your mantra",
      "Let it become effortless",
      "Return to mantra when distracted",
    ],
    benefits: ["Deep relaxation", "Spiritual connection", "Mental clarity"],
  },
  {
    id: "visualization",
    name: "Visualization",
    description: "Create peaceful mental imagery to promote relaxation and healing.",
    icon: "Eye",
    color: "blue",
    gradient: "from-blue-500 to-violet-600",
    defaultDuration: 10,
    instructions: [
      "Close your eyes and relax",
      "Imagine a peaceful place",
      "Engage all your senses",
      "Explore the environment",
      "Feel the peace and calm",
    ],
    benefits: ["Reduces stress", "Enhances creativity", "Promotes healing"],
  },
];

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: "rain", name: "Rain", icon: "CloudRain" },
  { id: "ocean", name: "Ocean Waves", icon: "Waves" },
  { id: "forest", name: "Forest", icon: "TreePine" },
  { id: "fire", name: "Fireplace", icon: "Flame" },
  { id: "wind", name: "Wind", icon: "Wind" },
  { id: "birds", name: "Birds", icon: "Bird" },
  { id: "silence", name: "Silence", icon: "VolumeX" },
];

export const DURATION_OPTIONS = [
  { value: 3, label: "3 min" },
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
  { value: 20, label: "20 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "1 hour" },
];
