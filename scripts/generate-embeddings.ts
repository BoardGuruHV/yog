import { PrismaClient } from "@prisma/client";
import {
  generateAsanaText,
  generateEmbedding,
  hashText,
} from "../lib/search/embeddings";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting embedding generation...\n");

  // Fetch all asanas
  const asanas = await prisma.asana.findMany({
    include: {
      embedding: true,
    },
  });

  console.log(`Found ${asanas.length} asanas\n`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const asana of asanas) {
    process.stdout.write(`Processing: ${asana.nameEnglish}... `);

    // Generate text representation
    const text = generateAsanaText({
      nameEnglish: asana.nameEnglish,
      nameSanskrit: asana.nameSanskrit,
      description: asana.description,
      category: asana.category,
      difficulty: asana.difficulty,
      benefits: asana.benefits,
      targetBodyParts: asana.targetBodyParts,
    });

    const textHash = hashText(text);

    // Check if embedding exists and is up to date
    if (asana.embedding && asana.embedding.textHash === textHash) {
      console.log("skipped (up to date)");
      skipped++;
      continue;
    }

    try {
      // Generate embedding
      const embedding = await generateEmbedding(text);

      if (!embedding) {
        console.log("skipped (OpenAI not available)");
        skipped++;
        continue;
      }

      // Upsert embedding
      await prisma.asanaEmbedding.upsert({
        where: { asanaId: asana.id },
        create: {
          asanaId: asana.id,
          embedding: embedding,
          textHash: textHash,
        },
        update: {
          embedding: embedding,
          textHash: textHash,
        },
      });

      if (asana.embedding) {
        console.log("updated");
        updated++;
      } else {
        console.log("created");
        created++;
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`error: ${error}`);
    }
  }

  console.log("\n--- Summary ---");
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Skipped: ${skipped}`);
  console.log(`Total: ${asanas.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
