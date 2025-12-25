import { PrismaClient, Category } from "@prisma/client";

const prisma = new PrismaClient();

const conditions = [
  { name: "Pregnancy", description: "Pregnant women should avoid certain poses" },
  { name: "High Blood Pressure", description: "Avoid inversions and strenuous poses" },
  { name: "Low Blood Pressure", description: "Move slowly between poses, avoid quick transitions" },
  { name: "Back Pain", description: "Modify poses to protect the spine" },
  { name: "Neck Injury", description: "Avoid poses that strain the neck" },
  { name: "Knee Issues", description: "Use props and modifications for knee protection" },
  { name: "Heart Condition", description: "Avoid strenuous poses and inversions" },
  { name: "Glaucoma", description: "Avoid inversions that increase eye pressure" },
  { name: "Vertigo", description: "Avoid inversions and balance poses" },
  { name: "Wrist Pain", description: "Use fists or forearms instead of flat palms" },
  { name: "Shoulder Injury", description: "Modify arm positions and avoid weight-bearing" },
  { name: "Sciatica", description: "Avoid deep forward folds and twists" },
];

const asanas = [
  // STANDING POSES
  {
    nameEnglish: "Mountain Pose",
    nameSanskrit: "Tadasana",
    description: "The foundation of all standing poses. Stand tall with feet together, grounding through all four corners of your feet while lengthening the spine.",
    category: "STANDING" as Category,
    difficulty: 1,
    durationSeconds: 30,
    benefits: ["Improves posture", "Strengthens thighs and ankles", "Increases awareness", "Firms abdomen"],
    targetBodyParts: ["legs", "core", "spine"],
    svgPath: "/asanas/tadasana.svg",
  },
  {
    nameEnglish: "Tree Pose",
    nameSanskrit: "Vrikshasana",
    description: "A balancing pose that strengthens the legs and opens the hips. Place one foot on the inner thigh or calf of the standing leg.",
    category: "BALANCE" as Category,
    difficulty: 2,
    durationSeconds: 45,
    benefits: ["Improves balance", "Strengthens legs", "Opens hips", "Builds focus and concentration"],
    targetBodyParts: ["legs", "hips", "core"],
    svgPath: "/asanas/vrikshasana.svg",
  },
  {
    nameEnglish: "Triangle Pose",
    nameSanskrit: "Trikonasana",
    description: "A standing pose that stretches the legs, hips, and spine while strengthening the legs and core.",
    category: "STANDING" as Category,
    difficulty: 2,
    durationSeconds: 45,
    benefits: ["Stretches legs and hips", "Opens chest and shoulders", "Strengthens core", "Improves digestion"],
    targetBodyParts: ["legs", "hips", "spine", "shoulders"],
    svgPath: "/asanas/trikonasana.svg",
  },
  {
    nameEnglish: "Warrior I",
    nameSanskrit: "Virabhadrasana I",
    description: "A powerful standing pose that builds strength in the legs and opens the chest and shoulders.",
    category: "STANDING" as Category,
    difficulty: 2,
    durationSeconds: 45,
    benefits: ["Strengthens legs", "Opens chest and lungs", "Stretches hip flexors", "Builds stamina"],
    targetBodyParts: ["legs", "hips", "chest", "arms"],
    svgPath: "/asanas/virabhadrasana1.svg",
  },
  {
    nameEnglish: "Warrior II",
    nameSanskrit: "Virabhadrasana II",
    description: "A grounding standing pose that builds strength and stamina while opening the hips and chest.",
    category: "STANDING" as Category,
    difficulty: 2,
    durationSeconds: 45,
    benefits: ["Strengthens legs and ankles", "Stretches groins and chest", "Builds endurance", "Improves balance"],
    targetBodyParts: ["legs", "hips", "arms", "core"],
    svgPath: "/asanas/virabhadrasana2.svg",
  },
  {
    nameEnglish: "Warrior III",
    nameSanskrit: "Virabhadrasana III",
    description: "An advanced balancing pose that challenges stability while strengthening the entire back body.",
    category: "BALANCE" as Category,
    difficulty: 4,
    durationSeconds: 30,
    benefits: ["Strengthens legs and core", "Improves balance", "Tones abdomen", "Improves posture"],
    targetBodyParts: ["legs", "core", "back", "glutes"],
    svgPath: "/asanas/virabhadrasana3.svg",
  },
  {
    nameEnglish: "Extended Side Angle",
    nameSanskrit: "Utthita Parsvakonasana",
    description: "A deep standing pose that stretches the entire side body while building strength in the legs.",
    category: "STANDING" as Category,
    difficulty: 3,
    durationSeconds: 45,
    benefits: ["Stretches side body", "Strengthens legs", "Opens chest", "Stimulates digestion"],
    targetBodyParts: ["legs", "hips", "spine", "shoulders"],
    svgPath: "/asanas/parsvakonasana.svg",
  },
  {
    nameEnglish: "Chair Pose",
    nameSanskrit: "Utkatasana",
    description: "A powerful pose that builds heat and strength in the legs and core.",
    category: "STANDING" as Category,
    difficulty: 3,
    durationSeconds: 30,
    benefits: ["Strengthens thighs", "Tones core", "Stimulates heart", "Stretches shoulders"],
    targetBodyParts: ["legs", "core", "shoulders"],
    svgPath: "/asanas/utkatasana.svg",
  },

  // SEATED POSES
  {
    nameEnglish: "Easy Pose",
    nameSanskrit: "Sukhasana",
    description: "A comfortable seated position for meditation and breathing exercises.",
    category: "SEATED" as Category,
    difficulty: 1,
    durationSeconds: 60,
    benefits: ["Calms the mind", "Opens hips", "Strengthens back", "Promotes inner peace"],
    targetBodyParts: ["hips", "spine"],
    svgPath: "/asanas/sukhasana.svg",
  },
  {
    nameEnglish: "Lotus Pose",
    nameSanskrit: "Padmasana",
    description: "The classic meditation pose with legs crossed and feet resting on opposite thighs.",
    category: "SEATED" as Category,
    difficulty: 4,
    durationSeconds: 60,
    benefits: ["Deepens meditation", "Opens hips", "Improves posture", "Calms the mind"],
    targetBodyParts: ["hips", "spine", "ankles"],
    svgPath: "/asanas/padmasana.svg",
  },
  {
    nameEnglish: "Seated Forward Bend",
    nameSanskrit: "Paschimottanasana",
    description: "A calming forward fold that stretches the entire back body.",
    category: "FORWARD_BEND" as Category,
    difficulty: 2,
    durationSeconds: 60,
    benefits: ["Stretches spine and hamstrings", "Calms nervous system", "Relieves stress", "Stimulates digestion"],
    targetBodyParts: ["back", "hamstrings", "spine"],
    svgPath: "/asanas/paschimottanasana.svg",
  },
  {
    nameEnglish: "Bound Angle Pose",
    nameSanskrit: "Baddha Konasana",
    description: "A hip-opening pose with soles of the feet together, knees dropped to the sides.",
    category: "SEATED" as Category,
    difficulty: 2,
    durationSeconds: 60,
    benefits: ["Opens hips and groins", "Improves circulation", "Stimulates organs", "Relieves fatigue"],
    targetBodyParts: ["hips", "groins", "spine"],
    svgPath: "/asanas/baddhakonasana.svg",
  },
  {
    nameEnglish: "Head to Knee Pose",
    nameSanskrit: "Janu Sirsasana",
    description: "An asymmetrical forward fold that stretches one leg at a time.",
    category: "FORWARD_BEND" as Category,
    difficulty: 2,
    durationSeconds: 45,
    benefits: ["Stretches hamstrings", "Calms the mind", "Relieves anxiety", "Improves digestion"],
    targetBodyParts: ["hamstrings", "spine", "hips"],
    svgPath: "/asanas/janusirsasana.svg",
  },

  // PRONE POSES
  {
    nameEnglish: "Cobra Pose",
    nameSanskrit: "Bhujangasana",
    description: "A gentle backbend that strengthens the spine and opens the chest.",
    category: "BACK_BEND" as Category,
    difficulty: 2,
    durationSeconds: 30,
    benefits: ["Strengthens spine", "Opens chest", "Stretches abdomen", "Elevates mood"],
    targetBodyParts: ["spine", "chest", "core"],
    svgPath: "/asanas/bhujangasana.svg",
  },
  {
    nameEnglish: "Locust Pose",
    nameSanskrit: "Salabhasana",
    description: "A prone backbend that strengthens the entire back body.",
    category: "PRONE" as Category,
    difficulty: 3,
    durationSeconds: 30,
    benefits: ["Strengthens back muscles", "Improves posture", "Stimulates organs", "Builds stamina"],
    targetBodyParts: ["back", "glutes", "legs"],
    svgPath: "/asanas/salabhasana.svg",
  },
  {
    nameEnglish: "Bow Pose",
    nameSanskrit: "Dhanurasana",
    description: "A deep backbend where the body forms the shape of a bow.",
    category: "BACK_BEND" as Category,
    difficulty: 4,
    durationSeconds: 30,
    benefits: ["Opens entire front body", "Strengthens back", "Improves posture", "Stimulates organs"],
    targetBodyParts: ["spine", "chest", "shoulders", "legs"],
    svgPath: "/asanas/dhanurasana.svg",
  },
  {
    nameEnglish: "Sphinx Pose",
    nameSanskrit: "Salamba Bhujangasana",
    description: "A gentle backbend on the forearms, suitable for beginners.",
    category: "PRONE" as Category,
    difficulty: 1,
    durationSeconds: 60,
    benefits: ["Strengthens spine", "Opens chest", "Relieves stress", "Soothes nervous system"],
    targetBodyParts: ["spine", "chest", "shoulders"],
    svgPath: "/asanas/sphinx.svg",
  },

  // SUPINE POSES
  {
    nameEnglish: "Corpse Pose",
    nameSanskrit: "Savasana",
    description: "The final relaxation pose, lying flat on the back with complete stillness.",
    category: "SUPINE" as Category,
    difficulty: 1,
    durationSeconds: 300,
    benefits: ["Deep relaxation", "Reduces stress", "Lowers blood pressure", "Integrates practice"],
    targetBodyParts: ["spine"],
    svgPath: "/asanas/savasana.svg",
  },
  {
    nameEnglish: "Bridge Pose",
    nameSanskrit: "Setu Bandhasana",
    description: "A supine backbend that strengthens the legs and opens the chest.",
    category: "BACK_BEND" as Category,
    difficulty: 2,
    durationSeconds: 45,
    benefits: ["Strengthens legs and glutes", "Opens chest", "Calms the brain", "Reduces anxiety"],
    targetBodyParts: ["legs", "glutes", "spine", "chest"],
    svgPath: "/asanas/setubandhasana.svg",
  },
  {
    nameEnglish: "Supine Twist",
    nameSanskrit: "Supta Matsyendrasana",
    description: "A gentle spinal twist lying on the back, excellent for releasing tension.",
    category: "TWIST" as Category,
    difficulty: 1,
    durationSeconds: 60,
    benefits: ["Releases spine tension", "Massages organs", "Improves digestion", "Relaxes back muscles"],
    targetBodyParts: ["spine", "hips", "shoulders"],
    svgPath: "/asanas/suptamatsyendrasana.svg",
  },
  {
    nameEnglish: "Happy Baby Pose",
    nameSanskrit: "Ananda Balasana",
    description: "A playful supine pose that opens the hips and releases the lower back.",
    category: "SUPINE" as Category,
    difficulty: 1,
    durationSeconds: 60,
    benefits: ["Opens hips", "Releases lower back", "Calms mind", "Stretches inner groins"],
    targetBodyParts: ["hips", "back", "groins"],
    svgPath: "/asanas/anandabalasana.svg",
  },

  // INVERSIONS
  {
    nameEnglish: "Headstand",
    nameSanskrit: "Sirsasana",
    description: "The king of asanas, a full inversion balancing on the head and forearms.",
    category: "INVERSION" as Category,
    difficulty: 5,
    durationSeconds: 60,
    benefits: ["Increases blood flow to brain", "Strengthens arms and core", "Improves focus", "Builds confidence"],
    targetBodyParts: ["arms", "core", "shoulders"],
    svgPath: "/asanas/sirsasana.svg",
  },
  {
    nameEnglish: "Shoulderstand",
    nameSanskrit: "Sarvangasana",
    description: "The queen of asanas, an inversion balancing on the shoulders.",
    category: "INVERSION" as Category,
    difficulty: 4,
    durationSeconds: 120,
    benefits: ["Stimulates thyroid", "Calms nervous system", "Improves circulation", "Reduces fatigue"],
    targetBodyParts: ["shoulders", "neck", "core"],
    svgPath: "/asanas/sarvangasana.svg",
  },
  {
    nameEnglish: "Plow Pose",
    nameSanskrit: "Halasana",
    description: "An inversion with legs overhead, touching the floor behind the head.",
    category: "INVERSION" as Category,
    difficulty: 4,
    durationSeconds: 60,
    benefits: ["Stretches spine", "Calms brain", "Stimulates organs", "Reduces stress"],
    targetBodyParts: ["spine", "shoulders", "hamstrings"],
    svgPath: "/asanas/halasana.svg",
  },
  {
    nameEnglish: "Downward Facing Dog",
    nameSanskrit: "Adho Mukha Svanasana",
    description: "A foundational pose forming an inverted V-shape, stretching the entire body.",
    category: "INVERSION" as Category,
    difficulty: 2,
    durationSeconds: 60,
    benefits: ["Stretches hamstrings and calves", "Strengthens arms", "Energizes body", "Calms brain"],
    targetBodyParts: ["arms", "legs", "spine", "shoulders"],
    svgPath: "/asanas/adhomukhasvanasana.svg",
  },

  // BALANCE POSES
  {
    nameEnglish: "Crow Pose",
    nameSanskrit: "Bakasana",
    description: "An arm balance with knees resting on the backs of the upper arms.",
    category: "BALANCE" as Category,
    difficulty: 4,
    durationSeconds: 20,
    benefits: ["Strengthens arms and wrists", "Tones abdominals", "Builds focus", "Develops confidence"],
    targetBodyParts: ["arms", "wrists", "core"],
    svgPath: "/asanas/bakasana.svg",
  },
  {
    nameEnglish: "Dancer Pose",
    nameSanskrit: "Natarajasana",
    description: "A graceful standing balance that opens the chest and stretches the thighs.",
    category: "BALANCE" as Category,
    difficulty: 4,
    durationSeconds: 30,
    benefits: ["Improves balance", "Opens chest and shoulders", "Strengthens legs", "Develops grace"],
    targetBodyParts: ["legs", "chest", "shoulders", "spine"],
    svgPath: "/asanas/natarajasana.svg",
  },
  {
    nameEnglish: "Eagle Pose",
    nameSanskrit: "Garudasana",
    description: "A balancing pose with wrapped arms and legs that stretches the shoulders and hips.",
    category: "BALANCE" as Category,
    difficulty: 3,
    durationSeconds: 30,
    benefits: ["Improves balance", "Stretches shoulders", "Strengthens legs", "Improves concentration"],
    targetBodyParts: ["legs", "shoulders", "hips"],
    svgPath: "/asanas/garudasana.svg",
  },
  {
    nameEnglish: "Half Moon Pose",
    nameSanskrit: "Ardha Chandrasana",
    description: "A standing balance with one leg lifted parallel to the ground.",
    category: "BALANCE" as Category,
    difficulty: 3,
    durationSeconds: 30,
    benefits: ["Strengthens legs", "Opens hips and chest", "Improves coordination", "Builds focus"],
    targetBodyParts: ["legs", "hips", "core"],
    svgPath: "/asanas/ardhachandrasana.svg",
  },

  // TWISTS
  {
    nameEnglish: "Seated Spinal Twist",
    nameSanskrit: "Ardha Matsyendrasana",
    description: "A seated twist that improves spinal mobility and massages internal organs.",
    category: "TWIST" as Category,
    difficulty: 2,
    durationSeconds: 45,
    benefits: ["Improves spinal mobility", "Massages organs", "Stimulates digestion", "Releases tension"],
    targetBodyParts: ["spine", "hips", "shoulders"],
    svgPath: "/asanas/ardhamatsyendrasana.svg",
  },
  {
    nameEnglish: "Revolved Triangle",
    nameSanskrit: "Parivrtta Trikonasana",
    description: "A standing twist that combines the benefits of triangle pose with spinal rotation.",
    category: "TWIST" as Category,
    difficulty: 4,
    durationSeconds: 45,
    benefits: ["Strengthens legs", "Improves balance", "Stretches hamstrings", "Stimulates organs"],
    targetBodyParts: ["legs", "spine", "hamstrings"],
    svgPath: "/asanas/parivrttatrikonasana.svg",
  },

  // MORE COMMON POSES
  {
    nameEnglish: "Child's Pose",
    nameSanskrit: "Balasana",
    description: "A restful pose that gently stretches the back and provides mental calm.",
    category: "FORWARD_BEND" as Category,
    difficulty: 1,
    durationSeconds: 60,
    benefits: ["Releases back tension", "Calms the mind", "Stretches hips", "Reduces stress"],
    targetBodyParts: ["back", "hips", "ankles"],
    svgPath: "/asanas/balasana.svg",
  },
  {
    nameEnglish: "Cat-Cow Pose",
    nameSanskrit: "Marjaryasana-Bitilasana",
    description: "A flowing sequence that warms up the spine and releases tension.",
    category: "PRONE" as Category,
    difficulty: 1,
    durationSeconds: 60,
    benefits: ["Warms spine", "Improves flexibility", "Massages organs", "Relieves stress"],
    targetBodyParts: ["spine", "core", "neck"],
    svgPath: "/asanas/catcow.svg",
  },
  {
    nameEnglish: "Plank Pose",
    nameSanskrit: "Phalakasana",
    description: "A foundational strength pose that builds core stability.",
    category: "PRONE" as Category,
    difficulty: 2,
    durationSeconds: 30,
    benefits: ["Strengthens core", "Tones arms", "Builds endurance", "Improves posture"],
    targetBodyParts: ["core", "arms", "shoulders"],
    svgPath: "/asanas/phalakasana.svg",
  },
  {
    nameEnglish: "Four-Limbed Staff Pose",
    nameSanskrit: "Chaturanga Dandasana",
    description: "A challenging pose that builds arm and core strength.",
    category: "PRONE" as Category,
    difficulty: 4,
    durationSeconds: 15,
    benefits: ["Strengthens arms", "Builds core strength", "Tones body", "Prepares for arm balances"],
    targetBodyParts: ["arms", "core", "wrists"],
    svgPath: "/asanas/chaturanga.svg",
  },
  {
    nameEnglish: "Upward Facing Dog",
    nameSanskrit: "Urdhva Mukha Svanasana",
    description: "A backbend that opens the chest and strengthens the arms and wrists.",
    category: "BACK_BEND" as Category,
    difficulty: 2,
    durationSeconds: 30,
    benefits: ["Opens chest", "Strengthens arms", "Improves posture", "Stimulates organs"],
    targetBodyParts: ["arms", "chest", "spine"],
    svgPath: "/asanas/urdhvamukhasvanasana.svg",
  },
  {
    nameEnglish: "Pigeon Pose",
    nameSanskrit: "Eka Pada Rajakapotasana",
    description: "A deep hip opener that releases stored tension in the hips.",
    category: "SEATED" as Category,
    difficulty: 3,
    durationSeconds: 90,
    benefits: ["Opens hips deeply", "Releases stored emotions", "Stretches thighs", "Improves posture"],
    targetBodyParts: ["hips", "glutes", "spine"],
    svgPath: "/asanas/ekapadarajakapotasana.svg",
  },
];

const contraindications = [
  { asana: "Sirsasana", condition: "High Blood Pressure", severity: "avoid", notes: "Inversions increase blood pressure" },
  { asana: "Sirsasana", condition: "Neck Injury", severity: "avoid", notes: "Too much pressure on neck" },
  { asana: "Sirsasana", condition: "Glaucoma", severity: "avoid", notes: "Increases eye pressure" },
  { asana: "Sirsasana", condition: "Heart Condition", severity: "avoid", notes: "Too strenuous" },
  { asana: "Sarvangasana", condition: "High Blood Pressure", severity: "caution", notes: "Use wall support" },
  { asana: "Sarvangasana", condition: "Neck Injury", severity: "avoid", notes: "Strain on neck" },
  { asana: "Halasana", condition: "Back Pain", severity: "caution", notes: "Can strain lower back" },
  { asana: "Halasana", condition: "Neck Injury", severity: "avoid", notes: "Pressure on cervical spine" },
  { asana: "Dhanurasana", condition: "Back Pain", severity: "caution", notes: "Modify by reducing depth" },
  { asana: "Dhanurasana", condition: "Pregnancy", severity: "avoid", notes: "Pressure on abdomen" },
  { asana: "Bhujangasana", condition: "Pregnancy", severity: "caution", notes: "Keep minimal pressure on abdomen" },
  { asana: "Padmasana", condition: "Knee Issues", severity: "avoid", notes: "Too much strain on knees" },
  { asana: "Bakasana", condition: "Wrist Pain", severity: "caution", notes: "Use blocks or skip" },
  { asana: "Bakasana", condition: "Pregnancy", severity: "avoid", notes: "Risk of falling" },
  { asana: "Adho Mukha Svanasana", condition: "High Blood Pressure", severity: "caution", notes: "Keep head above heart" },
  { asana: "Paschimottanasana", condition: "Sciatica", severity: "caution", notes: "Bend knees if needed" },
  { asana: "Paschimottanasana", condition: "Back Pain", severity: "caution", notes: "Keep spine long" },
  { asana: "Utkatasana", condition: "Knee Issues", severity: "caution", notes: "Don't bend too deep" },
  { asana: "Virabhadrasana III", condition: "Low Blood Pressure", severity: "caution", notes: "Move slowly" },
  { asana: "Virabhadrasana III", condition: "Vertigo", severity: "avoid", notes: "Balance may be affected" },
];

const modifications = [
  { asana: "Padmasana", forAge: "60+", description: "Use Easy Pose (Sukhasana) instead" },
  { asana: "Padmasana", condition: "Knee Issues", description: "Sit on a cushion, use Easy Pose" },
  { asana: "Sirsasana", forAge: "60+", description: "Practice supported headstand at wall" },
  { asana: "Paschimottanasana", forAge: "60+", description: "Use a strap around feet, bend knees" },
  { asana: "Paschimottanasana", condition: "Back Pain", description: "Keep knees bent, use blocks" },
  { asana: "Dhanurasana", forAge: "60+", description: "Hold ankles only, minimal lift" },
  { asana: "Bakasana", condition: "Wrist Pain", description: "Practice on forearms (Forearm Balance prep)" },
  { asana: "Adho Mukha Svanasana", forAge: "60+", description: "Use wall or chair for support" },
  { asana: "Virabhadrasana I", condition: "Knee Issues", description: "Shorter stance, don't lunge as deep" },
  { asana: "Utkatasana", condition: "Knee Issues", description: "Wall sit or use chair for support" },
  { asana: "Trikonasana", forAge: "60+", description: "Use block under lower hand" },
  { asana: "Bhujangasana", condition: "Back Pain", description: "Keep elbows bent, lower lift" },
];

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.programAsana.deleteMany();
  await prisma.program.deleteMany();
  await prisma.modification.deleteMany();
  await prisma.contraindication.deleteMany();
  await prisma.asana.deleteMany();
  await prisma.condition.deleteMany();

  // Seed conditions
  console.log("Creating conditions...");
  for (const condition of conditions) {
    await prisma.condition.create({ data: condition });
  }

  // Seed asanas
  console.log("Creating asanas...");
  for (const asana of asanas) {
    await prisma.asana.create({ data: asana });
  }

  // Seed contraindications
  console.log("Creating contraindications...");
  for (const ci of contraindications) {
    const asana = await prisma.asana.findFirst({
      where: { nameSanskrit: ci.asana },
    });
    const condition = await prisma.condition.findFirst({
      where: { name: ci.condition },
    });
    if (asana && condition) {
      await prisma.contraindication.create({
        data: {
          asanaId: asana.id,
          conditionId: condition.id,
          severity: ci.severity,
          notes: ci.notes,
        },
      });
    }
  }

  // Seed modifications
  console.log("Creating modifications...");
  for (const mod of modifications) {
    const asana = await prisma.asana.findFirst({
      where: { nameSanskrit: mod.asana },
    });
    let condition = null;
    if (mod.condition) {
      condition = await prisma.condition.findFirst({
        where: { name: mod.condition },
      });
    }
    if (asana) {
      await prisma.modification.create({
        data: {
          asanaId: asana.id,
          conditionId: condition?.id,
          forAge: mod.forAge,
          description: mod.description,
        },
      });
    }
  }

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
