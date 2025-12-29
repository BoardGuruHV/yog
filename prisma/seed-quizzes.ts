import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const quizzes = [
  {
    title: "Yoga Pose Identification",
    description: "Test your ability to identify common yoga poses by their images and descriptions.",
    category: "poses",
    difficulty: "beginner",
    timeLimit: 300, // 5 minutes
    passingScore: 70,
    featured: true,
    questions: [
      {
        type: "multiple_choice",
        question: "Which pose involves standing on one leg while placing the sole of the other foot on the inner thigh?",
        options: ["Tree Pose (Vrksasana)", "Eagle Pose (Garudasana)", "Warrior III (Virabhadrasana III)", "Half Moon (Ardha Chandrasana)"],
        correctAnswer: "0",
        explanation: "Tree Pose (Vrksasana) is the classic one-legged balance where the foot rests on the inner thigh of the standing leg.",
        points: 1,
        order: 1,
      },
      {
        type: "multiple_choice",
        question: "What is the Sanskrit name for Downward Facing Dog?",
        options: ["Uttanasana", "Adho Mukha Svanasana", "Bhujangasana", "Balasana"],
        correctAnswer: "1",
        explanation: "Adho Mukha Svanasana translates to 'Downward Facing Dog' - adho (downward), mukha (face), svana (dog).",
        points: 1,
        order: 2,
      },
      {
        type: "multiple_choice",
        question: "Which pose is typically used for final relaxation at the end of a yoga class?",
        options: ["Child's Pose", "Corpse Pose (Savasana)", "Easy Pose (Sukhasana)", "Mountain Pose (Tadasana)"],
        correctAnswer: "1",
        explanation: "Savasana (Corpse Pose) is the traditional final relaxation pose, allowing the body to integrate the benefits of practice.",
        points: 1,
        order: 3,
      },
      {
        type: "multiple_choice",
        question: "In Warrior II, which direction should your front knee point?",
        options: ["Straight ahead", "Over the front ankle, toward the toes", "Inward toward the center", "It doesn't matter"],
        correctAnswer: "1",
        explanation: "In Warrior II, the front knee should track over the ankle, pointing in the same direction as the toes to protect the joint.",
        points: 1,
        order: 4,
      },
      {
        type: "multiple_choice",
        question: "Which category does Cobra Pose (Bhujangasana) belong to?",
        options: ["Forward Bend", "Backbend", "Twist", "Inversion"],
        correctAnswer: "1",
        explanation: "Cobra Pose is a prone backbend that strengthens the back and opens the chest.",
        points: 1,
        order: 5,
      },
    ],
  },
  {
    title: "Sanskrit Yoga Terms",
    description: "How well do you know the ancient language of yoga? Test your Sanskrit vocabulary.",
    category: "sanskrit",
    difficulty: "intermediate",
    timeLimit: 240,
    passingScore: 70,
    featured: true,
    questions: [
      {
        type: "multiple_choice",
        question: "What does 'Asana' mean in Sanskrit?",
        options: ["Breath", "Seat or posture", "Meditation", "Energy"],
        correctAnswer: "1",
        explanation: "Asana means 'seat' or 'posture.' Originally, it referred to the seated position for meditation.",
        points: 1,
        order: 1,
      },
      {
        type: "multiple_choice",
        question: "What does 'Prana' refer to in yoga?",
        options: ["Physical strength", "Life force or vital energy", "Flexibility", "Balance"],
        correctAnswer: "1",
        explanation: "Prana is the life force or vital energy that flows through all living things. Pranayama is the practice of controlling this energy through breath.",
        points: 1,
        order: 2,
      },
      {
        type: "multiple_choice",
        question: "What does 'Namaste' mean?",
        options: ["Hello and goodbye", "The divine in me honors the divine in you", "Thank you", "I am grateful"],
        correctAnswer: "1",
        explanation: "Namaste is a greeting meaning 'the divine in me honors the divine in you' or 'I bow to the divine in you.'",
        points: 1,
        order: 3,
      },
      {
        type: "multiple_choice",
        question: "What does 'Om' or 'Aum' represent?",
        options: ["The sun god", "The universal sound/vibration of creation", "Peace", "Strength"],
        correctAnswer: "1",
        explanation: "Om is considered the primordial sound of the universe, representing the vibration of creation and consciousness.",
        points: 1,
        order: 4,
      },
      {
        type: "multiple_choice",
        question: "What does 'Chakra' mean?",
        options: ["Light", "Wheel or circle", "Power", "Spirit"],
        correctAnswer: "1",
        explanation: "Chakra means 'wheel' or 'circle' in Sanskrit. The chakras are spinning energy centers in the body.",
        points: 1,
        order: 5,
      },
      {
        type: "multiple_choice",
        question: "What is 'Savasana' literally translated as?",
        options: ["Rest pose", "Corpse pose", "Sleep pose", "Final pose"],
        correctAnswer: "1",
        explanation: "Savasana comes from 'sava' (corpse) and 'asana' (pose), literally meaning 'corpse pose.'",
        points: 1,
        order: 6,
      },
    ],
  },
  {
    title: "Benefits of Yoga Poses",
    description: "Match yoga poses with their primary benefits and therapeutic effects.",
    category: "benefits",
    difficulty: "beginner",
    timeLimit: 300,
    passingScore: 70,
    featured: false,
    questions: [
      {
        type: "multiple_choice",
        question: "Which pose is best known for calming the nervous system and reducing stress?",
        options: ["Headstand", "Child's Pose", "Boat Pose", "Crow Pose"],
        correctAnswer: "1",
        explanation: "Child's Pose (Balasana) is a restorative pose that calms the nervous system, relieves stress, and gently stretches the back.",
        points: 1,
        order: 1,
      },
      {
        type: "multiple_choice",
        question: "Which pose is excellent for strengthening the core?",
        options: ["Savasana", "Boat Pose (Navasana)", "Pigeon Pose", "Butterfly Pose"],
        correctAnswer: "1",
        explanation: "Boat Pose (Navasana) is one of the most effective poses for building core strength and stability.",
        points: 1,
        order: 2,
      },
      {
        type: "multiple_choice",
        question: "Which type of pose is best for improving digestion?",
        options: ["Backbends", "Forward folds", "Twists", "Inversions"],
        correctAnswer: "2",
        explanation: "Twisting poses massage the internal organs and are particularly beneficial for digestion and detoxification.",
        points: 1,
        order: 3,
      },
      {
        type: "multiple_choice",
        question: "Which pose helps open tight hip flexors from sitting all day?",
        options: ["Plank Pose", "Low Lunge (Anjaneyasana)", "Mountain Pose", "Eagle Pose"],
        correctAnswer: "1",
        explanation: "Low Lunge deeply stretches the hip flexors, which become tight from prolonged sitting.",
        points: 1,
        order: 4,
      },
      {
        type: "multiple_choice",
        question: "Which pose is known to help with anxiety and mild depression?",
        options: ["Legs Up the Wall (Viparita Karani)", "Warrior I", "Chair Pose", "Crow Pose"],
        correctAnswer: "0",
        explanation: "Legs Up the Wall is a restorative inversion that calms the mind, reduces anxiety, and helps with insomnia.",
        points: 1,
        order: 5,
      },
    ],
  },
  {
    title: "Eight Limbs of Yoga",
    description: "Test your knowledge of Patanjali's classical yoga philosophy.",
    category: "philosophy",
    difficulty: "intermediate",
    timeLimit: 360,
    passingScore: 70,
    featured: true,
    questions: [
      {
        type: "multiple_choice",
        question: "How many limbs are there in Patanjali's yoga system?",
        options: ["Four", "Six", "Eight", "Ten"],
        correctAnswer: "2",
        explanation: "Patanjali outlined eight limbs (Ashtanga) of yoga in the Yoga Sutras.",
        points: 1,
        order: 1,
      },
      {
        type: "multiple_choice",
        question: "Which limb focuses on ethical restraints like non-violence (ahimsa)?",
        options: ["Niyama", "Yama", "Dharana", "Pratyahara"],
        correctAnswer: "1",
        explanation: "Yama consists of five ethical restraints: ahimsa (non-violence), satya (truthfulness), asteya (non-stealing), brahmacharya (moderation), and aparigraha (non-attachment).",
        points: 1,
        order: 2,
      },
      {
        type: "multiple_choice",
        question: "What is the third limb of yoga?",
        options: ["Pranayama", "Asana", "Dharana", "Dhyana"],
        correctAnswer: "1",
        explanation: "Asana (physical postures) is the third limb, coming after Yama and Niyama.",
        points: 1,
        order: 3,
      },
      {
        type: "multiple_choice",
        question: "What does 'Pratyahara' mean?",
        options: ["Breath control", "Withdrawal of the senses", "Meditation", "Concentration"],
        correctAnswer: "1",
        explanation: "Pratyahara is the fifth limb, meaning 'withdrawal of the senses' - turning attention inward.",
        points: 1,
        order: 4,
      },
      {
        type: "multiple_choice",
        question: "What is the final limb of yoga?",
        options: ["Dhyana", "Dharana", "Samadhi", "Pratyahara"],
        correctAnswer: "2",
        explanation: "Samadhi (enlightenment/union) is the eighth and final limb, representing complete absorption and liberation.",
        points: 1,
        order: 5,
      },
      {
        type: "multiple_choice",
        question: "Which Niyama refers to self-study and reflection?",
        options: ["Saucha", "Santosha", "Svadhyaya", "Tapas"],
        correctAnswer: "2",
        explanation: "Svadhyaya means self-study, including the study of sacred texts and self-reflection.",
        points: 1,
        order: 6,
      },
    ],
  },
  {
    title: "Yoga Anatomy Basics",
    description: "Understand how yoga poses affect different parts of the body.",
    category: "anatomy",
    difficulty: "intermediate",
    timeLimit: 300,
    passingScore: 70,
    featured: false,
    questions: [
      {
        type: "multiple_choice",
        question: "Which muscles are primarily stretched in a forward fold?",
        options: ["Quadriceps", "Hamstrings", "Biceps", "Chest muscles"],
        correctAnswer: "1",
        explanation: "Forward folds primarily stretch the hamstrings along the back of the thighs.",
        points: 1,
        order: 1,
      },
      {
        type: "multiple_choice",
        question: "What muscle group does Chaturanga Dandasana primarily strengthen?",
        options: ["Legs", "Core and arms", "Back", "Neck"],
        correctAnswer: "1",
        explanation: "Chaturanga (Four-Limbed Staff Pose) is excellent for strengthening the arms, shoulders, and core.",
        points: 1,
        order: 2,
      },
      {
        type: "multiple_choice",
        question: "Which area of the spine has the most natural mobility for twisting?",
        options: ["Cervical (neck)", "Thoracic (mid-back)", "Lumbar (lower back)", "Sacrum"],
        correctAnswer: "1",
        explanation: "The thoracic spine has the most natural mobility for rotation due to how the vertebrae are structured.",
        points: 1,
        order: 3,
      },
      {
        type: "multiple_choice",
        question: "What happens to the psoas muscle when we sit for long periods?",
        options: ["It lengthens", "It shortens and tightens", "It strengthens", "Nothing"],
        correctAnswer: "1",
        explanation: "The psoas (hip flexor) shortens and tightens when we sit for extended periods, which can lead to lower back pain.",
        points: 1,
        order: 4,
      },
      {
        type: "multiple_choice",
        question: "Which breathing technique activates the parasympathetic nervous system?",
        options: ["Rapid breathing", "Breath holding", "Extended exhales", "Breath of Fire"],
        correctAnswer: "2",
        explanation: "Extending the exhale longer than the inhale activates the parasympathetic (rest and digest) nervous system.",
        points: 1,
        order: 5,
      },
    ],
  },
  {
    title: "History of Yoga",
    description: "Explore the rich 5,000-year history of yoga from ancient India to modern times.",
    category: "history",
    difficulty: "advanced",
    timeLimit: 360,
    passingScore: 70,
    featured: false,
    questions: [
      {
        type: "multiple_choice",
        question: "Approximately how old is the practice of yoga?",
        options: ["500 years", "1,000 years", "3,000 years", "5,000+ years"],
        correctAnswer: "3",
        explanation: "Evidence of yoga practices dates back over 5,000 years to the Indus Valley Civilization.",
        points: 1,
        order: 1,
      },
      {
        type: "multiple_choice",
        question: "In which text was the word 'yoga' first mentioned?",
        options: ["Bhagavad Gita", "Yoga Sutras", "Rig Veda", "Hatha Yoga Pradipika"],
        correctAnswer: "2",
        explanation: "The word 'yoga' first appears in the Rig Veda, one of the oldest sacred texts (1500-1200 BCE).",
        points: 1,
        order: 2,
      },
      {
        type: "multiple_choice",
        question: "Who is credited with compiling the Yoga Sutras?",
        options: ["Krishna", "Patanjali", "Shiva", "Swami Vivekananda"],
        correctAnswer: "1",
        explanation: "The sage Patanjali compiled the Yoga Sutras around 200 CE, systematizing yoga philosophy.",
        points: 1,
        order: 3,
      },
      {
        type: "multiple_choice",
        question: "Who is often called the 'father of modern yoga'?",
        options: ["B.K.S. Iyengar", "T. Krishnamacharya", "Pattabhi Jois", "Swami Sivananda"],
        correctAnswer: "1",
        explanation: "T. Krishnamacharya (1888-1989) is considered the father of modern yoga. He taught Iyengar, Jois, and Desikachar.",
        points: 1,
        order: 4,
      },
      {
        type: "multiple_choice",
        question: "When was yoga first introduced to the Western world on a large scale?",
        options: ["1793", "1893", "1953", "1993"],
        correctAnswer: "1",
        explanation: "Swami Vivekananda introduced yoga to America at the Parliament of World Religions in Chicago in 1893.",
        points: 1,
        order: 5,
      },
      {
        type: "multiple_choice",
        question: "Which text is the primary source for Hatha Yoga practices?",
        options: ["Yoga Sutras", "Bhagavad Gita", "Hatha Yoga Pradipika", "Upanishads"],
        correctAnswer: "2",
        explanation: "The Hatha Yoga Pradipika (15th century) is the foundational text for Hatha Yoga, describing asanas, pranayama, and cleansing practices.",
        points: 1,
        order: 6,
      },
    ],
  },
];

async function main() {
  console.log("Seeding quizzes...\n");

  for (const quizData of quizzes) {
    const { questions, ...quiz } = quizData;

    // Check if quiz exists
    const existing = await prisma.quiz.findFirst({
      where: { title: quiz.title },
    });

    if (existing) {
      console.log(`Quiz "${quiz.title}" already exists, updating...`);
      await prisma.quiz.update({
        where: { id: existing.id },
        data: quiz,
      });

      // Delete existing questions and recreate
      await prisma.quizQuestion.deleteMany({
        where: { quizId: existing.id },
      });

      for (const q of questions) {
        await prisma.quizQuestion.create({
          data: {
            ...q,
            quizId: existing.id,
            options: q.options,
          },
        });
      }
    } else {
      const created = await prisma.quiz.create({
        data: {
          ...quiz,
          questions: {
            create: questions.map((q) => ({
              ...q,
              options: q.options,
            })),
          },
        },
      });
      console.log(`Created quiz: ${quiz.title} (${questions.length} questions)`);
    }
  }

  const count = await prisma.quiz.count();
  const questionCount = await prisma.quizQuestion.count();
  console.log(`\nSeeded ${count} quizzes with ${questionCount} total questions!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
