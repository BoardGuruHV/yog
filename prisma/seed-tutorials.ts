import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedTutorials() {
  console.log("Seeding tutorials...");

  // Get specific asanas that we have tutorial data for
  const tutorialPoses = ["Mountain Pose", "Downward Facing Dog", "Warrior I"];
  const asanas = await prisma.asana.findMany({
    where: {
      nameEnglish: {
        in: tutorialPoses,
      },
    },
  });

  if (asanas.length === 0) {
    console.log("No matching asanas found. Please seed asanas first.");
    return;
  }

  console.log(`Found ${asanas.length} matching asanas:`, asanas.map(a => a.nameEnglish));

  // Sample tutorial data for common poses
  const tutorialData: Record<string, {
    tips: string[];
    commonErrors: string[];
    steps: Array<{
      order: number;
      phase: string;
      title: string;
      instruction: string;
      breathCue?: string;
      duration?: number;
    }>;
  }> = {
    // Mountain Pose / Tadasana
    "Mountain Pose": {
      tips: [
        "Imagine a string pulling you up from the crown of your head",
        "Press all four corners of your feet firmly into the ground",
        "Keep your shoulders relaxed and away from your ears",
        "Engage your core gently to support your spine",
      ],
      commonErrors: [
        "Locking the knees instead of keeping them soft",
        "Letting the lower back over-arch",
        "Tensing the shoulders up towards the ears",
        "Distributing weight unevenly on the feet",
      ],
      steps: [
        {
          order: 1,
          phase: "preparation",
          title: "Find Your Foundation",
          instruction: "Stand with your feet hip-width apart or together, depending on your comfort. Spread your toes and feel all four corners of your feet pressing into the ground.",
          duration: 10,
        },
        {
          order: 2,
          phase: "entry",
          title: "Align Your Legs",
          instruction: "Engage your thigh muscles and lift your kneecaps slightly. Keep your knees soft, not locked. Feel your legs become strong and stable.",
          breathCue: "inhale",
          duration: 8,
        },
        {
          order: 3,
          phase: "entry",
          title: "Lengthen Your Spine",
          instruction: "Draw your tailbone slightly down and lift through the crown of your head. Feel your spine lengthening as if you're creating space between each vertebra.",
          breathCue: "exhale",
          duration: 8,
        },
        {
          order: 4,
          phase: "hold",
          title: "Position Your Arms",
          instruction: "Let your arms hang naturally at your sides with palms facing forward or toward your thighs. Roll your shoulders back and down, opening your chest.",
          breathCue: "inhale",
          duration: 10,
        },
        {
          order: 5,
          phase: "hold",
          title: "Find Your Gaze",
          instruction: "Soften your gaze and look straight ahead. Keep your chin parallel to the floor. Relax your jaw and facial muscles.",
          duration: 15,
        },
        {
          order: 6,
          phase: "hold",
          title: "Breathe and Hold",
          instruction: "Maintain this position while breathing deeply. Feel the stability and strength of the mountain. Stay present and grounded.",
          breathCue: "hold",
          duration: 30,
        },
        {
          order: 7,
          phase: "exit",
          title: "Release",
          instruction: "Gently release the pose by softening your muscles while maintaining your height. You can transition to the next pose or simply relax.",
          breathCue: "exhale",
          duration: 5,
        },
      ],
    },
    // Downward Dog
    "Downward Facing Dog": {
      tips: [
        "It's okay if your heels don't touch the ground",
        "Focus on lengthening your spine rather than straightening your legs",
        "Press through all fingers to protect your wrists",
        "Think of creating an inverted V shape with your body",
      ],
      commonErrors: [
        "Rounding the spine instead of keeping it straight",
        "Putting too much weight in the hands and wrists",
        "Holding breath instead of breathing steadily",
        "Locking the elbows or knees",
      ],
      steps: [
        {
          order: 1,
          phase: "preparation",
          title: "Start on All Fours",
          instruction: "Come to hands and knees (tabletop position). Align your wrists under shoulders and knees under hips. Spread your fingers wide.",
          duration: 8,
        },
        {
          order: 2,
          phase: "entry",
          title: "Tuck and Lift",
          instruction: "Tuck your toes under and on an exhale, lift your knees off the floor. Keep your knees slightly bent at first.",
          breathCue: "exhale",
          duration: 5,
        },
        {
          order: 3,
          phase: "entry",
          title: "Lengthen Your Spine",
          instruction: "Press your hands firmly into the mat and start to straighten your legs. Focus on lengthening your spine and lifting your sitting bones toward the ceiling.",
          breathCue: "inhale",
          duration: 8,
        },
        {
          order: 4,
          phase: "hold",
          title: "Find Your Position",
          instruction: "Create an inverted V shape. Keep your head between your upper arms, ears in line with biceps. Gaze toward your navel or between your legs.",
          duration: 10,
        },
        {
          order: 5,
          phase: "hold",
          title: "Engage and Ground",
          instruction: "Press your heels toward the floor (they don't need to touch). Rotate your upper arms outward. Feel the stretch through your back and hamstrings.",
          breathCue: "exhale",
          duration: 20,
        },
        {
          order: 6,
          phase: "hold",
          title: "Breathe and Hold",
          instruction: "Maintain the pose for several breaths. With each exhale, try to sink your heels a little lower and lift your sitting bones higher.",
          breathCue: "hold",
          duration: 30,
        },
        {
          order: 7,
          phase: "exit",
          title: "Release to Child's Pose",
          instruction: "On an exhale, bend your knees and lower them to the floor. Sit back onto your heels and rest in Child's Pose to recover.",
          breathCue: "exhale",
          duration: 10,
        },
      ],
    },
    // Warrior I
    "Warrior I": {
      tips: [
        "Square your hips toward the front of your mat",
        "Keep your front knee directly over your ankle",
        "Ground through the outer edge of your back foot",
        "Reach up through your fingertips while keeping shoulders relaxed",
      ],
      commonErrors: [
        "Front knee collapsing inward past the ankle",
        "Hips not squared to the front",
        "Over-arching the lower back",
        "Back heel lifting off the ground",
      ],
      steps: [
        {
          order: 1,
          phase: "preparation",
          title: "Start in Mountain Pose",
          instruction: "Begin standing at the front of your mat in Mountain Pose. Take a moment to center yourself and connect with your breath.",
          duration: 5,
        },
        {
          order: 2,
          phase: "entry",
          title: "Step Back",
          instruction: "Step your left foot back about 3-4 feet. Turn your left foot out about 45 degrees while keeping your right foot pointing forward.",
          breathCue: "exhale",
          duration: 8,
        },
        {
          order: 3,
          phase: "entry",
          title: "Square Your Hips",
          instruction: "Rotate your hips to face the front of your mat. Your hip bones should be as parallel to the front edge as possible.",
          duration: 8,
        },
        {
          order: 4,
          phase: "entry",
          title: "Bend Your Front Knee",
          instruction: "Bend your right knee to about 90 degrees, aligning it directly over your ankle. Keep your back leg straight and strong.",
          breathCue: "inhale",
          duration: 8,
        },
        {
          order: 5,
          phase: "hold",
          title: "Raise Your Arms",
          instruction: "On an inhale, sweep your arms overhead, palms facing each other or touching. Keep your shoulders down away from your ears.",
          breathCue: "inhale",
          duration: 8,
        },
        {
          order: 6,
          phase: "hold",
          title: "Find Your Warrior",
          instruction: "Gaze forward or slightly up. Feel the power and stability of the Warrior. Ground through both feet while reaching up through your fingertips.",
          breathCue: "hold",
          duration: 30,
        },
        {
          order: 7,
          phase: "exit",
          title: "Release and Switch",
          instruction: "Lower your arms and straighten your front leg. Step forward to Mountain Pose, then repeat on the other side.",
          breathCue: "exhale",
          duration: 10,
        },
      ],
    },
  };

  // Create tutorials for matching asanas
  for (const asana of asanas) {
    const tutorial = tutorialData[asana.nameEnglish];

    if (tutorial) {
      // Check if tutorial already exists
      const existing = await prisma.asanaTutorial.findUnique({
        where: { asanaId: asana.id },
      });

      if (existing) {
        console.log(`Tutorial already exists for ${asana.nameEnglish}, skipping...`);
        continue;
      }

      // Create the tutorial with steps
      await prisma.asanaTutorial.create({
        data: {
          asanaId: asana.id,
          tips: tutorial.tips,
          commonErrors: tutorial.commonErrors,
          steps: {
            create: tutorial.steps.map((step) => ({
              order: step.order,
              phase: step.phase,
              title: step.title,
              instruction: step.instruction,
              breathCue: step.breathCue || null,
              duration: step.duration || null,
            })),
          },
        },
      });

      console.log(`Created tutorial for ${asana.nameEnglish}`);
    }
  }

  console.log("Tutorial seeding complete!");
}

seedTutorials()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
