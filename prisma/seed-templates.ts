import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Template definitions using Sanskrit names for asana lookup
const templateDefinitions = [
  {
    name: "Morning Energizer",
    description: "Wake up your body and mind with this energizing morning sequence. Perfect for starting your day with vitality and focus.",
    category: "morning",
    difficulty: 2,
    goals: ["energy", "flexibility", "focus"],
    icon: "Sunrise",
    featured: true,
    asanas: [
      { sanskrit: "Sukhasana", duration: 60, notes: "Center yourself with breath awareness" },
      { sanskrit: "Marjaryasana-Bitilasana", duration: 60, notes: "Warm up the spine" },
      { sanskrit: "Adho Mukha Svanasana", duration: 45, notes: "Lengthen and energize" },
      { sanskrit: "Tadasana", duration: 30, notes: "Ground and stand tall" },
      { sanskrit: "Virabhadrasana I", duration: 45, notes: "Build strength and focus (each side)" },
      { sanskrit: "Virabhadrasana II", duration: 45, notes: "Open the hips (each side)" },
      { sanskrit: "Trikonasana", duration: 45, notes: "Stretch and energize (each side)" },
      { sanskrit: "Utkatasana", duration: 30, notes: "Build heat" },
      { sanskrit: "Tadasana", duration: 30, notes: "Return to center" },
    ],
  },
  {
    name: "Evening Relaxation",
    description: "Wind down after a long day with this calming sequence designed to release tension and prepare your body for restful sleep.",
    category: "evening",
    difficulty: 1,
    goals: ["relaxation", "stress-relief", "sleep"],
    icon: "Moon",
    featured: true,
    asanas: [
      { sanskrit: "Sukhasana", duration: 90, notes: "Settle into stillness" },
      { sanskrit: "Marjaryasana-Bitilasana", duration: 60, notes: "Release spine tension" },
      { sanskrit: "Balasana", duration: 90, notes: "Rest and surrender" },
      { sanskrit: "Baddha Konasana", duration: 60, notes: "Open the hips gently" },
      { sanskrit: "Paschimottanasana", duration: 90, notes: "Calm the nervous system" },
      { sanskrit: "Supta Matsyendrasana", duration: 60, notes: "Release the spine (each side)" },
      { sanskrit: "Ananda Balasana", duration: 60, notes: "Playful hip release" },
      { sanskrit: "Savasana", duration: 300, notes: "Complete relaxation" },
    ],
  },
  {
    name: "Desk Worker Relief",
    description: "Combat the effects of sitting all day with stretches targeting the neck, shoulders, back, and hips. Can be done in a small space.",
    category: "office",
    difficulty: 1,
    goals: ["posture", "back-pain-relief", "stress-relief"],
    icon: "Monitor",
    featured: true,
    asanas: [
      { sanskrit: "Tadasana", duration: 30, notes: "Reset your posture" },
      { sanskrit: "Garudasana", duration: 30, notes: "Stretch shoulders (each side)" },
      { sanskrit: "Marjaryasana-Bitilasana", duration: 60, notes: "Release back tension" },
      { sanskrit: "Adho Mukha Svanasana", duration: 45, notes: "Decompress the spine" },
      { sanskrit: "Ardha Matsyendrasana", duration: 45, notes: "Twist to release (each side)" },
      { sanskrit: "Balasana", duration: 60, notes: "Rest the back" },
      { sanskrit: "Baddha Konasana", duration: 60, notes: "Open hip flexors" },
    ],
  },
  {
    name: "Core Strength Builder",
    description: "Develop a strong and stable core with this focused sequence. Builds functional strength for all yoga poses.",
    category: "strength",
    difficulty: 3,
    goals: ["strength", "core", "stability"],
    icon: "Dumbbell",
    featured: false,
    asanas: [
      { sanskrit: "Marjaryasana-Bitilasana", duration: 60, notes: "Warm up the spine" },
      { sanskrit: "Phalakasana", duration: 45, notes: "Hold strong and steady" },
      { sanskrit: "Chaturanga Dandasana", duration: 15, notes: "Lower with control" },
      { sanskrit: "Urdhva Mukha Svanasana", duration: 30, notes: "Open the chest" },
      { sanskrit: "Adho Mukha Svanasana", duration: 30, notes: "Reset" },
      { sanskrit: "Virabhadrasana III", duration: 30, notes: "Balance and core (each side)" },
      { sanskrit: "Bakasana", duration: 20, notes: "Arm balance focus" },
      { sanskrit: "Setu Bandhasana", duration: 45, notes: "Strengthen the back body" },
      { sanskrit: "Savasana", duration: 120, notes: "Rest and integrate" },
    ],
  },
  {
    name: "Pre-Run Warm-up",
    description: "Prepare your body for running with dynamic stretches that warm up the legs, hips, and core.",
    category: "athletic",
    difficulty: 2,
    goals: ["warm-up", "flexibility", "injury-prevention"],
    icon: "Footprints",
    featured: false,
    asanas: [
      { sanskrit: "Tadasana", duration: 30, notes: "Center yourself" },
      { sanskrit: "Utkatasana", duration: 30, notes: "Activate the legs" },
      { sanskrit: "Virabhadrasana I", duration: 30, notes: "Open hip flexors (each side)" },
      { sanskrit: "Virabhadrasana II", duration: 30, notes: "Activate legs (each side)" },
      { sanskrit: "Trikonasana", duration: 30, notes: "Stretch legs (each side)" },
      { sanskrit: "Adho Mukha Svanasana", duration: 45, notes: "Lengthen calves and hamstrings" },
      { sanskrit: "Balasana", duration: 30, notes: "Brief rest" },
    ],
  },
  {
    name: "Post-Workout Recovery",
    description: "Cool down and stretch after intense exercise. Targets common tight spots and promotes muscle recovery.",
    category: "athletic",
    difficulty: 2,
    goals: ["recovery", "flexibility", "relaxation"],
    icon: "Heart",
    featured: false,
    asanas: [
      { sanskrit: "Balasana", duration: 60, notes: "Begin to cool down" },
      { sanskrit: "Adho Mukha Svanasana", duration: 60, notes: "Stretch the back body" },
      { sanskrit: "Eka Pada Rajakapotasana", duration: 90, notes: "Deep hip release (each side)" },
      { sanskrit: "Paschimottanasana", duration: 60, notes: "Stretch hamstrings" },
      { sanskrit: "Supta Matsyendrasana", duration: 60, notes: "Release the spine (each side)" },
      { sanskrit: "Ananda Balasana", duration: 60, notes: "Open the hips" },
      { sanskrit: "Savasana", duration: 180, notes: "Complete rest" },
    ],
  },
  {
    name: "Stress Relief",
    description: "Release physical and mental tension with this calming sequence. Focus on breath and gentle movement.",
    category: "relaxation",
    difficulty: 1,
    goals: ["stress-relief", "relaxation", "mental-clarity"],
    icon: "CloudSun",
    featured: true,
    asanas: [
      { sanskrit: "Sukhasana", duration: 120, notes: "Breathe deeply and settle" },
      { sanskrit: "Marjaryasana-Bitilasana", duration: 90, notes: "Move with breath" },
      { sanskrit: "Balasana", duration: 90, notes: "Surrender and rest" },
      { sanskrit: "Baddha Konasana", duration: 60, notes: "Gentle hip opening" },
      { sanskrit: "Janu Sirsasana", duration: 60, notes: "Fold and release (each side)" },
      { sanskrit: "Supta Matsyendrasana", duration: 60, notes: "Twist away tension (each side)" },
      { sanskrit: "Savasana", duration: 300, notes: "Deep relaxation" },
    ],
  },
  {
    name: "Better Sleep",
    description: "Prepare your body and mind for deep, restorative sleep with this gentle bedtime routine.",
    category: "evening",
    difficulty: 1,
    goals: ["sleep", "relaxation", "stress-relief"],
    icon: "BedDouble",
    featured: false,
    asanas: [
      { sanskrit: "Sukhasana", duration: 120, notes: "Slow your breath" },
      { sanskrit: "Balasana", duration: 120, notes: "Rest forward" },
      { sanskrit: "Baddha Konasana", duration: 90, notes: "Reclined if possible" },
      { sanskrit: "Paschimottanasana", duration: 90, notes: "Calm the nervous system" },
      { sanskrit: "Supta Matsyendrasana", duration: 90, notes: "Release fully (each side)" },
      { sanskrit: "Ananda Balasana", duration: 60, notes: "Gentle hip release" },
      { sanskrit: "Savasana", duration: 300, notes: "Drift into stillness" },
    ],
  },
  {
    name: "Hip Opener Flow",
    description: "Release tight hips with this focused sequence. Great for runners, cyclists, and anyone who sits a lot.",
    category: "flexibility",
    difficulty: 2,
    goals: ["flexibility", "hip-opening", "mobility"],
    icon: "Activity",
    featured: false,
    asanas: [
      { sanskrit: "Marjaryasana-Bitilasana", duration: 60, notes: "Warm up the spine" },
      { sanskrit: "Adho Mukha Svanasana", duration: 45, notes: "Lengthen the body" },
      { sanskrit: "Virabhadrasana I", duration: 45, notes: "Open hip flexors (each side)" },
      { sanskrit: "Virabhadrasana II", duration: 45, notes: "External rotation (each side)" },
      { sanskrit: "Utthita Parsvakonasana", duration: 45, notes: "Deep side stretch (each side)" },
      { sanskrit: "Baddha Konasana", duration: 90, notes: "Seated hip opener" },
      { sanskrit: "Eka Pada Rajakapotasana", duration: 120, notes: "Deep release (each side)" },
      { sanskrit: "Ananda Balasana", duration: 60, notes: "Final hip stretch" },
      { sanskrit: "Savasana", duration: 120, notes: "Rest and integrate" },
    ],
  },
  {
    name: "Balance & Focus",
    description: "Improve your balance and concentration with this challenging sequence of standing and balancing poses.",
    category: "strength",
    difficulty: 3,
    goals: ["balance", "focus", "strength"],
    icon: "Scale",
    featured: false,
    asanas: [
      { sanskrit: "Tadasana", duration: 60, notes: "Find your center" },
      { sanskrit: "Vrikshasana", duration: 45, notes: "Tree pose (each side)" },
      { sanskrit: "Virabhadrasana III", duration: 30, notes: "Warrior III (each side)" },
      { sanskrit: "Garudasana", duration: 30, notes: "Eagle pose (each side)" },
      { sanskrit: "Ardha Chandrasana", duration: 30, notes: "Half moon (each side)" },
      { sanskrit: "Natarajasana", duration: 30, notes: "Dancer pose (each side)" },
      { sanskrit: "Vrikshasana", duration: 45, notes: "Return to tree (each side)" },
      { sanskrit: "Tadasana", duration: 30, notes: "Close with stillness" },
    ],
  },
  {
    name: "Gentle Back Care",
    description: "Soothe and strengthen a tired or achy back with these gentle, therapeutic poses.",
    category: "relaxation",
    difficulty: 1,
    goals: ["back-pain-relief", "flexibility", "relaxation"],
    icon: "Sparkles",
    featured: false,
    asanas: [
      { sanskrit: "Balasana", duration: 90, notes: "Start gently" },
      { sanskrit: "Marjaryasana-Bitilasana", duration: 90, notes: "Move slowly with breath" },
      { sanskrit: "Salamba Bhujangasana", duration: 60, notes: "Gentle spine extension" },
      { sanskrit: "Balasana", duration: 60, notes: "Counter stretch" },
      { sanskrit: "Supta Matsyendrasana", duration: 90, notes: "Gentle twist (each side)" },
      { sanskrit: "Ananda Balasana", duration: 60, notes: "Release lower back" },
      { sanskrit: "Setu Bandhasana", duration: 45, notes: "Strengthen gently" },
      { sanskrit: "Savasana", duration: 180, notes: "Complete rest" },
    ],
  },
  {
    name: "Full Body Stretch",
    description: "A comprehensive sequence that stretches every major muscle group. Perfect for improving overall flexibility.",
    category: "flexibility",
    difficulty: 2,
    goals: ["flexibility", "mobility", "recovery"],
    icon: "Expand",
    featured: true,
    asanas: [
      { sanskrit: "Marjaryasana-Bitilasana", duration: 60, notes: "Spine warm-up" },
      { sanskrit: "Adho Mukha Svanasana", duration: 60, notes: "Full body stretch" },
      { sanskrit: "Virabhadrasana I", duration: 45, notes: "Hip flexors (each side)" },
      { sanskrit: "Trikonasana", duration: 45, notes: "Side body (each side)" },
      { sanskrit: "Paschimottanasana", duration: 60, notes: "Hamstrings and back" },
      { sanskrit: "Baddha Konasana", duration: 60, notes: "Inner thighs" },
      { sanskrit: "Eka Pada Rajakapotasana", duration: 90, notes: "Hips (each side)" },
      { sanskrit: "Ardha Matsyendrasana", duration: 45, notes: "Spine twist (each side)" },
      { sanskrit: "Setu Bandhasana", duration: 45, notes: "Chest and shoulders" },
      { sanskrit: "Savasana", duration: 180, notes: "Integration" },
    ],
  },
];

async function main() {
  console.log("Seeding program templates...");

  // Get all asanas for reference
  const allAsanas = await prisma.asana.findMany();
  const asanaMap = new Map(allAsanas.map((a) => [a.nameSanskrit, a.id]));

  // Clear existing templates
  await prisma.programTemplate.deleteMany();

  // Create templates
  for (const template of templateDefinitions) {
    // Build asana sequence with IDs
    const asanaSequence = template.asanas
      .map((asana) => {
        const asanaId = asanaMap.get(asana.sanskrit);
        if (!asanaId) {
          console.warn(`  Warning: Asana "${asana.sanskrit}" not found, skipping`);
          return null;
        }
        return {
          asanaId,
          duration: asana.duration,
          notes: asana.notes,
        };
      })
      .filter(Boolean);

    // Calculate total duration
    const totalDuration = Math.round(
      asanaSequence.reduce((sum, a) => sum + (a?.duration || 0), 0) / 60
    );

    await prisma.programTemplate.create({
      data: {
        name: template.name,
        description: template.description,
        category: template.category,
        duration: totalDuration,
        difficulty: template.difficulty,
        goals: template.goals,
        asanas: asanaSequence,
        icon: template.icon,
        featured: template.featured,
        popularity: 0,
      },
    });

    console.log(`  Created template: ${template.name} (${totalDuration} min)`);
  }

  console.log(`\nSeeding completed! Created ${templateDefinitions.length} templates.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
