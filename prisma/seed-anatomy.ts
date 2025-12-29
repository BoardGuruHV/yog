import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AnatomyData {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  stretchedMuscles: string[];
  notes?: string;
}

async function seedAnatomy() {
  console.log("Seeding anatomy data...");

  // Anatomy data for yoga poses
  // Muscle IDs: pectorals, deltoids, biceps, triceps, forearms,
  //             rectusAbdominis, obliques, transverseAbdominis,
  //             trapezius, latissimusDorsi, rhomboids, erectorSpinae,
  //             quadriceps, hipFlexors, adductors, tibialis,
  //             gluteus, hamstrings, calves

  const anatomyData: Record<string, AnatomyData> = {
    // Standing Poses
    "Mountain Pose": {
      primaryMuscles: ["quadriceps", "transverseAbdominis", "erectorSpinae"],
      secondaryMuscles: ["gluteus", "rectusAbdominis", "calves"],
      stretchedMuscles: [],
      notes: "This foundational pose engages the core and legs to maintain proper alignment and posture.",
    },
    "Tree Pose": {
      primaryMuscles: ["quadriceps", "gluteus", "transverseAbdominis"],
      secondaryMuscles: ["obliques", "calves", "hipFlexors"],
      stretchedMuscles: ["adductors", "hipFlexors"],
      notes: "Balance pose that strengthens the standing leg while opening the hip of the raised leg.",
    },
    "Triangle Pose": {
      primaryMuscles: ["obliques", "quadriceps", "gluteus"],
      secondaryMuscles: ["erectorSpinae", "adductors", "deltoids"],
      stretchedMuscles: ["hamstrings", "adductors", "latissimusDorsi"],
      notes: "Deep lateral stretch that engages the core for stability while lengthening the side body.",
    },
    "Warrior I": {
      primaryMuscles: ["quadriceps", "gluteus", "deltoids"],
      secondaryMuscles: ["hipFlexors", "erectorSpinae", "trapezius"],
      stretchedMuscles: ["hipFlexors", "pectorals"],
      notes: "Powerful standing pose that strengthens legs and opens the chest and shoulders.",
    },
    "Warrior II": {
      primaryMuscles: ["quadriceps", "gluteus", "deltoids"],
      secondaryMuscles: ["adductors", "obliques", "trapezius"],
      stretchedMuscles: ["adductors", "hipFlexors"],
      notes: "Opens the hips while building strength in the legs and shoulders.",
    },
    "Warrior III": {
      primaryMuscles: ["gluteus", "hamstrings", "erectorSpinae"],
      secondaryMuscles: ["quadriceps", "transverseAbdominis", "deltoids"],
      stretchedMuscles: ["hamstrings"],
      notes: "Challenging balance pose that engages the entire posterior chain.",
    },
    "Chair Pose": {
      primaryMuscles: ["quadriceps", "gluteus", "erectorSpinae"],
      secondaryMuscles: ["deltoids", "transverseAbdominis", "calves"],
      stretchedMuscles: ["latissimusDorsi"],
      notes: "Intense leg strengthener that also works the core and back muscles.",
    },
    "Extended Side Angle": {
      primaryMuscles: ["obliques", "quadriceps", "gluteus"],
      secondaryMuscles: ["adductors", "deltoids", "latissimusDorsi"],
      stretchedMuscles: ["latissimusDorsi", "obliques", "adductors"],
      notes: "Deep lateral stretch that opens the chest while strengthening the legs.",
    },

    // Seated Poses
    "Easy Pose": {
      primaryMuscles: ["erectorSpinae", "transverseAbdominis"],
      secondaryMuscles: ["hipFlexors", "obliques"],
      stretchedMuscles: ["adductors", "hipFlexors"],
      notes: "Gentle seated position that encourages proper spinal alignment.",
    },
    "Lotus Pose": {
      primaryMuscles: ["erectorSpinae", "transverseAbdominis"],
      secondaryMuscles: ["obliques"],
      stretchedMuscles: ["adductors", "hipFlexors", "gluteus"],
      notes: "Advanced hip opener requiring significant flexibility in hips and knees.",
    },
    "Bound Angle Pose": {
      primaryMuscles: ["erectorSpinae"],
      secondaryMuscles: ["transverseAbdominis"],
      stretchedMuscles: ["adductors", "hipFlexors", "gluteus"],
      notes: "Excellent hip opener that targets the inner thighs and groin.",
    },
    "Seated Forward Bend": {
      primaryMuscles: ["rectusAbdominis"],
      secondaryMuscles: ["transverseAbdominis"],
      stretchedMuscles: ["hamstrings", "erectorSpinae", "calves"],
      notes: "Deep hamstring and back stretch that calms the nervous system.",
    },

    // Prone Poses
    "Downward Facing Dog": {
      primaryMuscles: ["deltoids", "latissimusDorsi", "triceps"],
      secondaryMuscles: ["transverseAbdominis", "quadriceps", "erectorSpinae"],
      stretchedMuscles: ["hamstrings", "calves", "latissimusDorsi"],
      notes: "Full body stretch that strengthens arms and shoulders while lengthening the spine.",
    },
    "Upward Facing Dog": {
      primaryMuscles: ["erectorSpinae", "gluteus", "triceps"],
      secondaryMuscles: ["deltoids", "quadriceps"],
      stretchedMuscles: ["rectusAbdominis", "pectorals", "hipFlexors"],
      notes: "Heart-opening backbend that strengthens the back and arms.",
    },
    "Cobra Pose": {
      primaryMuscles: ["erectorSpinae", "gluteus"],
      secondaryMuscles: ["trapezius", "rhomboids", "triceps"],
      stretchedMuscles: ["rectusAbdominis", "pectorals"],
      notes: "Gentle backbend that strengthens the spine and opens the chest.",
    },
    "Bow Pose": {
      primaryMuscles: ["erectorSpinae", "gluteus", "quadriceps"],
      secondaryMuscles: ["deltoids", "hamstrings", "rhomboids"],
      stretchedMuscles: ["rectusAbdominis", "pectorals", "hipFlexors", "quadriceps"],
      notes: "Deep backbend that opens the entire front body while strengthening the back.",
    },
    "Plank Pose": {
      primaryMuscles: ["rectusAbdominis", "transverseAbdominis", "deltoids"],
      secondaryMuscles: ["pectorals", "triceps", "quadriceps", "erectorSpinae"],
      stretchedMuscles: [],
      notes: "Full body strengthener focusing on core stability and arm strength.",
    },
    "Four-Limbed Staff Pose": {
      primaryMuscles: ["triceps", "pectorals", "rectusAbdominis"],
      secondaryMuscles: ["deltoids", "transverseAbdominis", "quadriceps"],
      stretchedMuscles: [],
      notes: "Challenging arm balance that builds significant upper body strength.",
    },

    // Supine Poses
    "Corpse Pose": {
      primaryMuscles: [],
      secondaryMuscles: [],
      stretchedMuscles: [],
      notes: "Complete relaxation pose with no active muscle engagement.",
    },
    "Bridge Pose": {
      primaryMuscles: ["gluteus", "hamstrings", "erectorSpinae"],
      secondaryMuscles: ["quadriceps", "transverseAbdominis"],
      stretchedMuscles: ["hipFlexors", "rectusAbdominis", "pectorals"],
      notes: "Strengthens the posterior chain while opening the hip flexors and chest.",
    },
    "Reclined Bound Angle Pose": {
      primaryMuscles: [],
      secondaryMuscles: [],
      stretchedMuscles: ["adductors", "hipFlexors", "pectorals"],
      notes: "Restorative pose that passively opens the hips and chest.",
    },
    "Happy Baby Pose": {
      primaryMuscles: [],
      secondaryMuscles: ["transverseAbdominis"],
      stretchedMuscles: ["adductors", "hamstrings", "hipFlexors", "erectorSpinae"],
      notes: "Gentle hip opener that releases tension in the lower back.",
    },

    // Inversions
    "Headstand": {
      primaryMuscles: ["deltoids", "trapezius", "transverseAbdominis"],
      secondaryMuscles: ["triceps", "erectorSpinae", "forearms"],
      stretchedMuscles: [],
      notes: "Advanced inversion requiring significant shoulder and core strength.",
    },
    "Shoulder Stand": {
      primaryMuscles: ["trapezius", "deltoids", "transverseAbdominis"],
      secondaryMuscles: ["erectorSpinae", "gluteus"],
      stretchedMuscles: ["trapezius"],
      notes: "Supported inversion that strengthens the upper back and core.",
    },
    "Plow Pose": {
      primaryMuscles: ["transverseAbdominis", "erectorSpinae"],
      secondaryMuscles: ["trapezius", "deltoids"],
      stretchedMuscles: ["hamstrings", "erectorSpinae", "trapezius"],
      notes: "Deep stretch for the spine and hamstrings.",
    },

    // Twists
    "Half Lord of the Fishes Pose": {
      primaryMuscles: ["obliques", "erectorSpinae"],
      secondaryMuscles: ["transverseAbdominis", "rhomboids"],
      stretchedMuscles: ["gluteus", "obliques", "pectorals"],
      notes: "Seated twist that improves spinal mobility and digestion.",
    },
    "Revolved Triangle Pose": {
      primaryMuscles: ["obliques", "transverseAbdominis", "quadriceps"],
      secondaryMuscles: ["gluteus", "erectorSpinae", "deltoids"],
      stretchedMuscles: ["hamstrings", "latissimusDorsi", "pectorals"],
      notes: "Challenging standing twist that builds core strength and balance.",
    },

    // Balance Poses
    "Eagle Pose": {
      primaryMuscles: ["quadriceps", "gluteus", "deltoids"],
      secondaryMuscles: ["transverseAbdominis", "calves"],
      stretchedMuscles: ["rhomboids", "deltoids", "gluteus"],
      notes: "Balance pose that stretches the upper back while strengthening the legs.",
    },
    "Dancer Pose": {
      primaryMuscles: ["quadriceps", "gluteus", "erectorSpinae"],
      secondaryMuscles: ["deltoids", "transverseAbdominis"],
      stretchedMuscles: ["quadriceps", "hipFlexors", "pectorals"],
      notes: "Elegant balance pose combining strength and flexibility.",
    },
    "Crow Pose": {
      primaryMuscles: ["deltoids", "pectorals", "transverseAbdominis"],
      secondaryMuscles: ["triceps", "biceps", "forearms"],
      stretchedMuscles: ["erectorSpinae"],
      notes: "Arm balance that builds upper body and core strength.",
    },
    "Side Plank Pose": {
      primaryMuscles: ["obliques", "deltoids", "transverseAbdominis"],
      secondaryMuscles: ["gluteus", "quadriceps", "latissimusDorsi"],
      stretchedMuscles: [],
      notes: "Unilateral core strengthener that also builds shoulder stability.",
    },

    // Cat-Cow
    "Cat-Cow Pose": {
      primaryMuscles: ["erectorSpinae", "rectusAbdominis"],
      secondaryMuscles: ["transverseAbdominis", "trapezius"],
      stretchedMuscles: ["erectorSpinae", "rectusAbdominis"],
      notes: "Gentle spinal warm-up that alternates between flexion and extension.",
    },
  };

  // Get all asanas
  const asanas = await prisma.asana.findMany({
    select: { id: true, nameEnglish: true },
  });

  console.log(`Found ${asanas.length} asanas in database`);

  let created = 0;
  let skipped = 0;

  for (const asana of asanas) {
    const data = anatomyData[asana.nameEnglish];

    if (data) {
      // Check if anatomy already exists
      const existing = await prisma.asanaAnatomy.findUnique({
        where: { asanaId: asana.id },
      });

      if (existing) {
        console.log(`Anatomy already exists for ${asana.nameEnglish}, skipping...`);
        skipped++;
        continue;
      }

      await prisma.asanaAnatomy.create({
        data: {
          asanaId: asana.id,
          primaryMuscles: data.primaryMuscles,
          secondaryMuscles: data.secondaryMuscles,
          stretchedMuscles: data.stretchedMuscles,
          notes: data.notes || null,
        },
      });

      console.log(`Created anatomy for ${asana.nameEnglish}`);
      created++;
    }
  }

  console.log(`\nAnatomy seeding complete!`);
  console.log(`Created: ${created}, Skipped: ${skipped}`);
}

seedAnatomy()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
