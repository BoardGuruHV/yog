import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const achievements = [
  // Streak Achievements
  {
    key: "first_practice",
    name: "First Step",
    description: "Complete your first yoga practice",
    icon: "🌱",
    category: "practice",
    requirement: { type: "practice_count", value: 1 },
    points: 10,
    rarity: "common",
    order: 1,
  },
  {
    key: "streak_3",
    name: "Getting Started",
    description: "Maintain a 3-day practice streak",
    icon: "🔥",
    category: "streak",
    requirement: { type: "streak", value: 3 },
    points: 15,
    rarity: "common",
    order: 1,
  },
  {
    key: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day practice streak",
    icon: "🔥",
    category: "streak",
    requirement: { type: "streak", value: 7 },
    points: 30,
    rarity: "uncommon",
    order: 2,
  },
  {
    key: "streak_14",
    name: "Two Week Champion",
    description: "Maintain a 14-day practice streak",
    icon: "🔥",
    category: "streak",
    requirement: { type: "streak", value: 14 },
    points: 50,
    rarity: "uncommon",
    order: 3,
  },
  {
    key: "streak_30",
    name: "Monthly Master",
    description: "Maintain a 30-day practice streak",
    icon: "🏆",
    category: "streak",
    requirement: { type: "streak", value: 30 },
    points: 100,
    rarity: "rare",
    order: 4,
  },
  {
    key: "streak_100",
    name: "Century Yogi",
    description: "Maintain a 100-day practice streak",
    icon: "👑",
    category: "streak",
    requirement: { type: "streak", value: 100 },
    points: 500,
    rarity: "legendary",
    order: 5,
  },

  // Practice Count Achievements
  {
    key: "practice_10",
    name: "Dedicated Practitioner",
    description: "Complete 10 practice sessions",
    icon: "🧘",
    category: "practice",
    requirement: { type: "practice_count", value: 10 },
    points: 25,
    rarity: "common",
    order: 2,
  },
  {
    key: "practice_50",
    name: "Committed Yogi",
    description: "Complete 50 practice sessions",
    icon: "🧘",
    category: "practice",
    requirement: { type: "practice_count", value: 50 },
    points: 75,
    rarity: "uncommon",
    order: 3,
  },
  {
    key: "practice_100",
    name: "Century of Sessions",
    description: "Complete 100 practice sessions",
    icon: "💯",
    category: "practice",
    requirement: { type: "practice_count", value: 100 },
    points: 150,
    rarity: "rare",
    order: 4,
  },
  {
    key: "practice_365",
    name: "Year of Yoga",
    description: "Complete 365 practice sessions",
    icon: "🌟",
    category: "practice",
    requirement: { type: "practice_count", value: 365 },
    points: 500,
    rarity: "epic",
    order: 5,
  },

  // Pose Exploration Achievements
  {
    key: "poses_5",
    name: "Pose Explorer",
    description: "Practice 5 different poses",
    icon: "🗺️",
    category: "exploration",
    requirement: { type: "pose_count", value: 5 },
    points: 15,
    rarity: "common",
    order: 1,
  },
  {
    key: "poses_15",
    name: "Pose Adventurer",
    description: "Practice 15 different poses",
    icon: "🧭",
    category: "exploration",
    requirement: { type: "pose_count", value: 15 },
    points: 40,
    rarity: "uncommon",
    order: 2,
  },
  {
    key: "poses_30",
    name: "Pose Collector",
    description: "Practice 30 different poses",
    icon: "📚",
    category: "exploration",
    requirement: { type: "pose_count", value: 30 },
    points: 100,
    rarity: "rare",
    order: 3,
  },
  {
    key: "all_categories",
    name: "Well Rounded",
    description: "Practice poses from all 9 categories",
    icon: "🎯",
    category: "exploration",
    requirement: { type: "category_count", value: 9 },
    points: 75,
    rarity: "rare",
    order: 4,
  },

  // Mastery Achievements
  {
    key: "mastery_level_2",
    name: "Skill Builder",
    description: "Reach mastery level 2 on any pose",
    icon: "📈",
    category: "mastery",
    requirement: { type: "mastery_level", value: 2 },
    points: 20,
    rarity: "common",
    order: 1,
  },
  {
    key: "mastery_level_3",
    name: "Pose Proficient",
    description: "Reach mastery level 3 on any pose",
    icon: "📈",
    category: "mastery",
    requirement: { type: "mastery_level", value: 3 },
    points: 40,
    rarity: "uncommon",
    order: 2,
  },
  {
    key: "mastery_level_4",
    name: "Pose Expert",
    description: "Reach mastery level 4 on any pose",
    icon: "🌟",
    category: "mastery",
    requirement: { type: "mastery_level", value: 4 },
    points: 75,
    rarity: "rare",
    order: 3,
  },
  {
    key: "mastery_level_5",
    name: "Pose Master",
    description: "Reach mastery level 5 on any pose",
    icon: "👑",
    category: "mastery",
    requirement: { type: "mastery_level", value: 5 },
    points: 150,
    rarity: "epic",
    order: 4,
  },

  // Time of Day Achievements
  {
    key: "early_bird_10",
    name: "Early Bird",
    description: "Complete 10 morning practices (5-9 AM)",
    icon: "🌅",
    category: "special",
    requirement: { type: "time_of_day", value: 10, timeRange: "morning" },
    points: 50,
    rarity: "uncommon",
    order: 1,
  },
  {
    key: "night_owl_10",
    name: "Night Owl",
    description: "Complete 10 evening practices (6-10 PM)",
    icon: "🌙",
    category: "special",
    requirement: { type: "time_of_day", value: 10, timeRange: "evening" },
    points: 50,
    rarity: "uncommon",
    order: 2,
  },

  // Duration Achievements
  {
    key: "duration_60",
    name: "First Hour",
    description: "Accumulate 60 minutes of practice time",
    icon: "⏱️",
    category: "practice",
    requirement: { type: "duration", value: 60 },
    points: 20,
    rarity: "common",
    order: 6,
  },
  {
    key: "duration_300",
    name: "Five Hours Strong",
    description: "Accumulate 5 hours of practice time",
    icon: "⏱️",
    category: "practice",
    requirement: { type: "duration", value: 300 },
    points: 50,
    rarity: "uncommon",
    order: 7,
  },
  {
    key: "duration_1000",
    name: "Thousand Minute Club",
    description: "Accumulate 1,000 minutes of practice time",
    icon: "⏱️",
    category: "practice",
    requirement: { type: "duration", value: 1000 },
    points: 100,
    rarity: "rare",
    order: 8,
  },

  // Category-specific Achievements
  {
    key: "standing_master",
    name: "Standing Strong",
    description: "Practice 10 different standing poses",
    icon: "🧍",
    category: "exploration",
    requirement: { type: "category_count", value: 10, category: "STANDING" },
    points: 40,
    rarity: "uncommon",
    order: 5,
  },
  {
    key: "balance_master",
    name: "Balance Artist",
    description: "Practice 5 different balance poses",
    icon: "⚖️",
    category: "exploration",
    requirement: { type: "category_count", value: 5, category: "BALANCE" },
    points: 50,
    rarity: "uncommon",
    order: 6,
  },
  {
    key: "inversion_brave",
    name: "Inversion Brave",
    description: "Practice 3 different inversion poses",
    icon: "🙃",
    category: "exploration",
    requirement: { type: "category_count", value: 3, category: "INVERSION" },
    points: 60,
    rarity: "rare",
    order: 7,
  },
];

async function main() {
  console.log("Seeding achievements...");

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        requirement: achievement.requirement,
        points: achievement.points,
        rarity: achievement.rarity,
        order: achievement.order,
      },
      create: {
        key: achievement.key,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        category: achievement.category,
        requirement: achievement.requirement,
        points: achievement.points,
        rarity: achievement.rarity,
        order: achievement.order,
      },
    });
    console.log(`  ✓ ${achievement.name}`);
  }

  console.log(`\nSeeded ${achievements.length} achievements!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
