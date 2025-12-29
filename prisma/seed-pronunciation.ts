import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PronunciationData {
  phonetic: string;
  syllables: Array<{ text: string; stress: boolean }>;
  ipa?: string;
  meaning?: string;
}

async function seedPronunciation() {
  console.log("Seeding pronunciation data...");

  // Pronunciation data for Sanskrit pose names
  const pronunciationData: Record<string, PronunciationData> = {
    // Standing Poses
    Tadasana: {
      phonetic: "tah-DAHS-ah-nah",
      syllables: [
        { text: "tah", stress: false },
        { text: "DAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "tɑːˈdɑːsənə",
      meaning: "Tada = mountain; Asana = pose. The Mountain Pose represents stability and groundedness like a mountain.",
    },
    Vrikshasana: {
      phonetic: "vrik-SHAHS-ah-nah",
      syllables: [
        { text: "vrik", stress: false },
        { text: "SHAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "vɾɪkˈʃɑːsənə",
      meaning: "Vriksha = tree; Asana = pose. The Tree Pose represents the grace and stability of a tree.",
    },
    Trikonasana: {
      phonetic: "tree-koh-NAHS-ah-nah",
      syllables: [
        { text: "tree", stress: false },
        { text: "koh", stress: false },
        { text: "NAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "tɾɪkoːˈnɑːsənə",
      meaning: "Trikona = triangle; Asana = pose. Named for the triangular shape created by the body.",
    },
    "Virabhadrasana I": {
      phonetic: "veer-ah-bah-DRAHS-ah-nah",
      syllables: [
        { text: "veer", stress: false },
        { text: "ah", stress: false },
        { text: "bah", stress: false },
        { text: "DRAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "viːrəbɑːˈdrɑːsənə",
      meaning: "Virabhadra = a fierce warrior from Hindu mythology; Asana = pose. Named after Virabhadra, an incarnation of Shiva.",
    },
    "Virabhadrasana II": {
      phonetic: "veer-ah-bah-DRAHS-ah-nah",
      syllables: [
        { text: "veer", stress: false },
        { text: "ah", stress: false },
        { text: "bah", stress: false },
        { text: "DRAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "viːrəbɑːˈdrɑːsənə",
      meaning: "Virabhadra = a fierce warrior; Asana = pose. The second variation of the Warrior Pose.",
    },
    "Virabhadrasana III": {
      phonetic: "veer-ah-bah-DRAHS-ah-nah",
      syllables: [
        { text: "veer", stress: false },
        { text: "ah", stress: false },
        { text: "bah", stress: false },
        { text: "DRAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "viːrəbɑːˈdrɑːsənə",
      meaning: "The third and most challenging variation of the Warrior Pose, requiring balance and core strength.",
    },
    Utkatasana: {
      phonetic: "oot-kah-TAHS-ah-nah",
      syllables: [
        { text: "oot", stress: false },
        { text: "kah", stress: false },
        { text: "TAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "utˈkɑːtəsənə",
      meaning: "Utkata = powerful, fierce; Asana = pose. Also known as Chair Pose for its sitting-like position.",
    },

    // Seated Poses
    Sukhasana: {
      phonetic: "soo-KAHS-ah-nah",
      syllables: [
        { text: "soo", stress: false },
        { text: "KAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "suˈkʰɑːsənə",
      meaning: "Sukha = easy, comfortable, joy; Asana = pose. A simple cross-legged seated position.",
    },
    Padmasana: {
      phonetic: "pahd-MAHS-ah-nah",
      syllables: [
        { text: "pahd", stress: false },
        { text: "MAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "pɑdˈmɑːsənə",
      meaning: "Padma = lotus; Asana = pose. The Lotus Pose, named for the lotus flower shape of the crossed legs.",
    },
    "Baddha Konasana": {
      phonetic: "BAH-dah koh-NAHS-ah-nah",
      syllables: [
        { text: "BAH", stress: true },
        { text: "dah", stress: false },
        { text: "koh", stress: false },
        { text: "NAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "bɑdːə koːˈnɑːsənə",
      meaning: "Baddha = bound; Kona = angle; Asana = pose. Also known as Butterfly Pose.",
    },
    Paschimottanasana: {
      phonetic: "pash-chee-moh-tahn-AHS-ah-nah",
      syllables: [
        { text: "pash", stress: false },
        { text: "chee", stress: false },
        { text: "moh", stress: false },
        { text: "tahn", stress: false },
        { text: "AHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "pɑʃtʃɪmoːtˈtɑːnəsənə",
      meaning: "Paschima = west (back of body); Uttana = intense stretch; Asana = pose. Seated Forward Bend.",
    },

    // Prone Poses
    "Adho Mukha Svanasana": {
      phonetic: "AH-doh MOO-kah shvah-NAHS-ah-nah",
      syllables: [
        { text: "AH", stress: true },
        { text: "doh", stress: false },
        { text: "MOO", stress: true },
        { text: "kah", stress: false },
        { text: "shvah", stress: false },
        { text: "NAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "ɑdʰoː muːkʰə ʃvɑːˈnɑːsənə",
      meaning: "Adho = downward; Mukha = face; Svana = dog; Asana = pose. Downward Facing Dog.",
    },
    "Urdhva Mukha Svanasana": {
      phonetic: "OORD-vah MOO-kah shvah-NAHS-ah-nah",
      syllables: [
        { text: "OORD", stress: true },
        { text: "vah", stress: false },
        { text: "MOO", stress: true },
        { text: "kah", stress: false },
        { text: "shvah", stress: false },
        { text: "NAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "uːrdʰvə muːkʰə ʃvɑːˈnɑːsənə",
      meaning: "Urdhva = upward; Mukha = face; Svana = dog; Asana = pose. Upward Facing Dog.",
    },
    Bhujangasana: {
      phonetic: "boo-jahn-GAHS-ah-nah",
      syllables: [
        { text: "boo", stress: false },
        { text: "jahn", stress: false },
        { text: "GAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "bʰuˈdʒɑŋgɑːsənə",
      meaning: "Bhujanga = serpent, cobra; Asana = pose. Cobra Pose, named for the raised hood of a cobra.",
    },
    Dhanurasana: {
      phonetic: "dah-noor-AHS-ah-nah",
      syllables: [
        { text: "dah", stress: false },
        { text: "noor", stress: false },
        { text: "AHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "dʰənuˈrɑːsənə",
      meaning: "Dhanu = bow; Asana = pose. Bow Pose, as the body resembles an archer's bow.",
    },

    // Supine Poses
    Savasana: {
      phonetic: "shah-VAHS-ah-nah",
      syllables: [
        { text: "shah", stress: false },
        { text: "VAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "ʃəˈvɑːsənə",
      meaning: "Sava = corpse; Asana = pose. Corpse Pose, the final relaxation pose.",
    },
    "Setu Bandhasana": {
      phonetic: "SAY-too bahn-DAHS-ah-nah",
      syllables: [
        { text: "SAY", stress: true },
        { text: "too", stress: false },
        { text: "bahn", stress: false },
        { text: "DAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "seːtu bɑnˈdʰɑːsənə",
      meaning: "Setu = bridge; Bandha = lock, bind; Asana = pose. Bridge Pose.",
    },
    "Supta Baddha Konasana": {
      phonetic: "SOOP-tah BAH-dah koh-NAHS-ah-nah",
      syllables: [
        { text: "SOOP", stress: true },
        { text: "tah", stress: false },
        { text: "BAH", stress: true },
        { text: "dah", stress: false },
        { text: "koh", stress: false },
        { text: "NAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "suptə bɑdːə koːˈnɑːsənə",
      meaning: "Supta = reclining; Baddha = bound; Kona = angle; Asana = pose. Reclining Butterfly.",
    },

    // Inversions
    Sirsasana: {
      phonetic: "sheer-SHAHS-ah-nah",
      syllables: [
        { text: "sheer", stress: false },
        { text: "SHAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "ʃiːrˈʃɑːsənə",
      meaning: "Sirsa = head; Asana = pose. Headstand, the 'king' of yoga poses.",
    },
    Sarvangasana: {
      phonetic: "sar-vahn-GAHS-ah-nah",
      syllables: [
        { text: "sar", stress: false },
        { text: "vahn", stress: false },
        { text: "GAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "sɑrvɑŋˈgɑːsənə",
      meaning: "Sarva = all; Anga = limb; Asana = pose. Shoulder Stand, benefiting all parts of the body.",
    },
    Halasana: {
      phonetic: "hah-LAHS-ah-nah",
      syllables: [
        { text: "hah", stress: false },
        { text: "LAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "hɑˈlɑːsənə",
      meaning: "Hala = plow; Asana = pose. Plow Pose, resembling the shape of a plow.",
    },

    // Twists
    "Ardha Matsyendrasana": {
      phonetic: "ARE-dah maht-syen-DRAHS-ah-nah",
      syllables: [
        { text: "ARE", stress: true },
        { text: "dah", stress: false },
        { text: "maht", stress: false },
        { text: "syen", stress: false },
        { text: "DRAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "ɑrdʰə mɑtsjendˈrɑːsənə",
      meaning: "Ardha = half; Matsyendra = lord of the fishes (a sage); Asana = pose. Half Lord of the Fishes Pose.",
    },
    "Parivrtta Trikonasana": {
      phonetic: "par-ee-VRIT-tah tree-koh-NAHS-ah-nah",
      syllables: [
        { text: "par", stress: false },
        { text: "ee", stress: false },
        { text: "VRIT", stress: true },
        { text: "tah", stress: false },
        { text: "tree", stress: false },
        { text: "koh", stress: false },
        { text: "NAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "pɑriˈvɾttə tɾikoːˈnɑːsənə",
      meaning: "Parivrtta = revolved; Trikona = triangle; Asana = pose. Revolved Triangle Pose.",
    },

    // Balance Poses
    Garudasana: {
      phonetic: "gah-roo-DAHS-ah-nah",
      syllables: [
        { text: "gah", stress: false },
        { text: "roo", stress: false },
        { text: "DAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "gɑruˈɖɑːsənə",
      meaning: "Garuda = eagle (the king of birds in Hindu mythology); Asana = pose. Eagle Pose.",
    },
    Natarajasana: {
      phonetic: "nah-tah-rah-JAHS-ah-nah",
      syllables: [
        { text: "nah", stress: false },
        { text: "tah", stress: false },
        { text: "rah", stress: false },
        { text: "JAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "nɑtɑrɑːˈdʒɑːsənə",
      meaning: "Nata = dancer; Raja = king; Asana = pose. Lord of the Dance Pose, named after Shiva Nataraja.",
    },
    Bakasana: {
      phonetic: "bah-KAHS-ah-nah",
      syllables: [
        { text: "bah", stress: false },
        { text: "KAHS", stress: true },
        { text: "ah", stress: false },
        { text: "nah", stress: false },
      ],
      ipa: "bɑˈkɑːsənə",
      meaning: "Baka = crane; Asana = pose. Crane/Crow Pose, an arm balance.",
    },
  };

  // Get all asanas
  const asanas = await prisma.asana.findMany({
    select: { id: true, nameSanskrit: true },
  });

  console.log(`Found ${asanas.length} asanas in database`);

  let created = 0;
  let skipped = 0;

  for (const asana of asanas) {
    const data = pronunciationData[asana.nameSanskrit];

    if (data) {
      // Check if pronunciation already exists
      const existing = await prisma.pronunciation.findUnique({
        where: { asanaId: asana.id },
      });

      if (existing) {
        console.log(`Pronunciation already exists for ${asana.nameSanskrit}, skipping...`);
        skipped++;
        continue;
      }

      await prisma.pronunciation.create({
        data: {
          asanaId: asana.id,
          phonetic: data.phonetic,
          syllables: data.syllables,
          ipa: data.ipa || null,
          meaning: data.meaning || null,
        },
      });

      console.log(`Created pronunciation for ${asana.nameSanskrit}`);
      created++;
    }
  }

  console.log(`\nPronunciation seeding complete!`);
  console.log(`Created: ${created}, Skipped: ${skipped}`);
}

seedPronunciation()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
