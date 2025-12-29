import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Video data with YouTube video IDs from popular yoga channels
// Note: These are example videos - in production, ensure you have rights to embed
const videoData: {
  asanaName: string;
  videos: {
    title: string;
    type: string;
    platform: "youtube" | "vimeo" | "self-hosted";
    videoId: string;
    duration: number;
    description?: string;
    instructor?: string;
    featured?: boolean;
    order?: number;
  }[];
}[] = [
  {
    asanaName: "Mountain Pose",
    videos: [
      {
        title: "Mountain Pose (Tadasana) Tutorial for Beginners",
        type: "full",
        platform: "youtube",
        videoId: "2HTvZp5rPrg", // Yoga With Adriene
        duration: 285,
        description: "Learn the foundation of all standing poses with proper alignment.",
        instructor: "Adriene Mishler",
        featured: true,
        order: 1,
      },
      {
        title: "Quick Mountain Pose Guide",
        type: "quick",
        platform: "youtube",
        videoId: "o7SbNvnQevM",
        duration: 120,
        description: "A quick overview of Mountain Pose alignment.",
        order: 2,
      },
    ],
  },
  {
    asanaName: "Downward-Facing Dog",
    videos: [
      {
        title: "Downward Dog for Beginners - Complete Tutorial",
        type: "full",
        platform: "youtube",
        videoId: "EC7RGJ975iM", // Yoga With Adriene
        duration: 480,
        description: "Master one of yoga's most common poses with detailed alignment cues.",
        instructor: "Adriene Mishler",
        featured: true,
        order: 1,
      },
      {
        title: "Downward Dog Modifications",
        type: "modification",
        platform: "youtube",
        videoId: "4VVHP8AZ8WY",
        duration: 180,
        description: "Modifications for tight hamstrings, wrists, and shoulders.",
        order: 2,
      },
    ],
  },
  {
    asanaName: "Warrior I",
    videos: [
      {
        title: "Warrior 1 Pose Tutorial - Virabhadrasana I",
        type: "full",
        platform: "youtube",
        videoId: "5RYb4kPwxlk",
        duration: 360,
        description: "Build strength and confidence with this powerful standing pose.",
        instructor: "Yoga With Tim",
        featured: true,
        order: 1,
      },
      {
        title: "Warrior I Step by Step",
        type: "tutorial",
        platform: "youtube",
        videoId: "QDEyFR7wLJI",
        duration: 240,
        description: "Step-by-step breakdown of Warrior I alignment.",
        order: 2,
      },
    ],
  },
  {
    asanaName: "Warrior II",
    videos: [
      {
        title: "Warrior 2 Yoga Pose Tutorial",
        type: "full",
        platform: "youtube",
        videoId: "QxnZ5q4FXME",
        duration: 420,
        description: "Learn to stand strong in Warrior II with proper form.",
        instructor: "Yoga With Adriene",
        featured: true,
        order: 1,
      },
    ],
  },
  {
    asanaName: "Tree Pose",
    videos: [
      {
        title: "Tree Pose Tutorial - Vrksasana",
        type: "full",
        platform: "youtube",
        videoId: "wdIn3WCZQ1k",
        duration: 390,
        description: "Find your balance with Tree Pose - includes modifications.",
        instructor: "Adriene Mishler",
        featured: true,
        order: 1,
      },
      {
        title: "Tree Pose for Beginners",
        type: "modification",
        platform: "youtube",
        videoId: "8pDBLsjP_aw",
        duration: 180,
        description: "Beginner-friendly modifications for balance challenges.",
        order: 2,
      },
    ],
  },
  {
    asanaName: "Triangle Pose",
    videos: [
      {
        title: "Triangle Pose Tutorial - Trikonasana",
        type: "full",
        platform: "youtube",
        videoId: "S6gB0QHbWFE",
        duration: 450,
        description: "Open your hips and stretch your side body in Triangle Pose.",
        instructor: "Yoga With Tim",
        featured: true,
        order: 1,
      },
    ],
  },
  {
    asanaName: "Chair Pose",
    videos: [
      {
        title: "Chair Pose - Utkatasana Tutorial",
        type: "full",
        platform: "youtube",
        videoId: "CiXixOD3B90",
        duration: 330,
        description: "Build leg strength and heat with Chair Pose.",
        instructor: "Adriene Mishler",
        featured: true,
        order: 1,
      },
    ],
  },
  {
    asanaName: "Cobra Pose",
    videos: [
      {
        title: "Cobra Pose Tutorial - Bhujangasana",
        type: "full",
        platform: "youtube",
        videoId: "fOdrW7nf9gw",
        duration: 360,
        description: "Strengthen your back and open your heart in Cobra.",
        instructor: "Yoga With Adriene",
        featured: true,
        order: 1,
      },
      {
        title: "Baby Cobra vs Full Cobra",
        type: "modification",
        platform: "youtube",
        videoId: "JDcdhTuycOI",
        duration: 240,
        description: "Understanding the difference between Baby Cobra and full expression.",
        order: 2,
      },
    ],
  },
  {
    asanaName: "Child's Pose",
    videos: [
      {
        title: "Child's Pose - Balasana Tutorial",
        type: "full",
        platform: "youtube",
        videoId: "2MJGg-dUKh0",
        duration: 300,
        description: "Find rest and restoration in Child's Pose.",
        instructor: "Adriene Mishler",
        featured: true,
        order: 1,
      },
    ],
  },
  {
    asanaName: "Bridge Pose",
    videos: [
      {
        title: "Bridge Pose Tutorial - Setu Bandha Sarvangasana",
        type: "full",
        platform: "youtube",
        videoId: "RULh3W8gL2o",
        duration: 420,
        description: "Open your chest and strengthen your glutes in Bridge Pose.",
        instructor: "Yoga With Tim",
        featured: true,
        order: 1,
      },
      {
        title: "Bridge Pose Variations",
        type: "modification",
        platform: "youtube",
        videoId: "jtO1N4cCLSk",
        duration: 300,
        description: "Multiple variations from gentle to challenging.",
        order: 2,
      },
    ],
  },
  {
    asanaName: "Seated Forward Bend",
    videos: [
      {
        title: "Seated Forward Fold - Paschimottanasana",
        type: "full",
        platform: "youtube",
        videoId: "mTXVQEuPQyk",
        duration: 360,
        description: "Stretch your entire back body with proper technique.",
        instructor: "Adriene Mishler",
        featured: true,
        order: 1,
      },
    ],
  },
  {
    asanaName: "Bound Angle Pose",
    videos: [
      {
        title: "Bound Angle Pose Tutorial - Baddha Konasana",
        type: "full",
        platform: "youtube",
        videoId: "4a8-FNWeFp8",
        duration: 330,
        description: "Open your hips gently in this seated pose.",
        featured: true,
        order: 1,
      },
    ],
  },
  {
    asanaName: "Corpse Pose",
    videos: [
      {
        title: "Savasana Tutorial - The Art of Relaxation",
        type: "full",
        platform: "youtube",
        videoId: "1VYlOKUdylM",
        duration: 600,
        description: "Learn to truly relax in Corpse Pose - the most challenging pose.",
        instructor: "Adriene Mishler",
        featured: true,
        order: 1,
      },
    ],
  },
  {
    asanaName: "Cat-Cow Pose",
    videos: [
      {
        title: "Cat-Cow Pose Tutorial",
        type: "full",
        platform: "youtube",
        videoId: "kqnua4rHVVA",
        duration: 270,
        description: "Warm up your spine with this flowing movement.",
        featured: true,
        order: 1,
      },
    ],
  },
  {
    asanaName: "Plank Pose",
    videos: [
      {
        title: "Plank Pose Tutorial - How to Do It Right",
        type: "full",
        platform: "youtube",
        videoId: "ASdvN_XEl_c",
        duration: 360,
        description: "Build core strength with proper Plank alignment.",
        instructor: "Yoga With Adriene",
        featured: true,
        order: 1,
      },
      {
        title: "Plank Modifications for Beginners",
        type: "modification",
        platform: "youtube",
        videoId: "9jlQNLFckCI",
        duration: 240,
        description: "Knee plank and other modifications for building strength.",
        order: 2,
      },
    ],
  },
];

async function main() {
  console.log("Seeding video data...\n");

  let totalVideos = 0;
  let skipped = 0;

  for (const item of videoData) {
    // Find the asana by name
    const asana = await prisma.asana.findFirst({
      where: {
        OR: [
          { nameEnglish: item.asanaName },
          { nameEnglish: { contains: item.asanaName.split(" ")[0] } },
        ],
      },
    });

    if (!asana) {
      console.log(`Asana not found: ${item.asanaName}, skipping...`);
      skipped += item.videos.length;
      continue;
    }

    console.log(`Adding videos for: ${asana.nameEnglish}`);

    for (const video of item.videos) {
      // Check if video already exists
      const existing = await prisma.asanaVideo.findFirst({
        where: {
          asanaId: asana.id,
          videoId: video.videoId,
        },
      });

      if (existing) {
        console.log(`  - Video "${video.title}" already exists, updating...`);
        await prisma.asanaVideo.update({
          where: { id: existing.id },
          data: {
            title: video.title,
            type: video.type,
            platform: video.platform,
            duration: video.duration,
            description: video.description,
            instructor: video.instructor,
            featured: video.featured || false,
            order: video.order || 0,
          },
        });
      } else {
        await prisma.asanaVideo.create({
          data: {
            asanaId: asana.id,
            title: video.title,
            type: video.type,
            platform: video.platform,
            videoId: video.videoId,
            duration: video.duration,
            description: video.description,
            instructor: video.instructor,
            featured: video.featured || false,
            order: video.order || 0,
          },
        });
        console.log(`  - Added: ${video.title}`);
      }
      totalVideos++;
    }
  }

  console.log(`\nSeeded ${totalVideos} videos!`);
  if (skipped > 0) {
    console.log(`Skipped ${skipped} videos (asanas not found)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
