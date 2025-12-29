import OpenAI from "openai";
import crypto from "crypto";

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes("your_") || apiKey.length < 20) {
    return null;
  }
  return new OpenAI({ apiKey });
}

export function isEmbeddingsAvailable(): boolean {
  return getOpenAIClient() !== null;
}

// Generate a rich text representation of an asana for embedding
export function generateAsanaText(asana: {
  nameEnglish: string;
  nameSanskrit: string;
  description: string;
  category: string;
  difficulty: number;
  benefits: string[];
  targetBodyParts: string[];
}): string {
  const difficultyLabel = getDifficultyLabel(asana.difficulty);
  const categoryLabel = formatCategory(asana.category);

  const parts = [
    `${asana.nameEnglish} (${asana.nameSanskrit})`,
    asana.description,
    `Category: ${categoryLabel}`,
    `Difficulty: ${difficultyLabel}`,
    `Benefits: ${asana.benefits.join(", ")}`,
    `Target body parts: ${asana.targetBodyParts.join(", ")}`,
  ];

  // Add semantic keywords based on properties
  const keywords: string[] = [];

  // Difficulty-based keywords
  if (asana.difficulty <= 2) {
    keywords.push("beginner", "gentle", "easy", "simple", "relaxing");
  } else if (asana.difficulty <= 3) {
    keywords.push("intermediate", "moderate");
  } else {
    keywords.push("advanced", "challenging", "intense", "difficult");
  }

  // Category-based keywords
  const categoryKeywords: Record<string, string[]> = {
    STANDING: ["standing", "grounding", "stability", "legs", "balance"],
    SEATED: ["seated", "sitting", "hip opener", "meditation", "calm"],
    PRONE: ["lying down", "face down", "back strength", "core"],
    SUPINE: ["lying on back", "relaxation", "restorative", "rest"],
    INVERSION: ["upside down", "blood flow", "energizing", "headstand"],
    BALANCE: ["balance", "focus", "concentration", "stability", "core"],
    TWIST: ["twist", "spinal", "detox", "digestion", "rotation"],
    FORWARD_BEND: ["forward bend", "stretch", "hamstrings", "calming", "flexibility"],
    BACK_BEND: ["backbend", "heart opener", "chest", "energy", "spine"],
  };

  if (categoryKeywords[asana.category]) {
    keywords.push(...categoryKeywords[asana.category]);
  }

  // Body part keywords
  const bodyPartKeywords: Record<string, string[]> = {
    Back: ["back pain relief", "spine", "posture"],
    Core: ["abs", "core strength", "stability"],
    Hamstrings: ["leg stretch", "flexibility", "runners"],
    Hips: ["hip opener", "hip flexibility", "sitting relief"],
    Shoulders: ["shoulder stretch", "upper body", "desk work"],
    Chest: ["chest opener", "breathing", "heart"],
    Spine: ["spinal health", "flexibility", "mobility"],
    Legs: ["leg strength", "lower body"],
    Arms: ["arm strength", "upper body"],
    Neck: ["neck relief", "tension release"],
  };

  for (const part of asana.targetBodyParts) {
    if (bodyPartKeywords[part]) {
      keywords.push(...bodyPartKeywords[part]);
    }
  }

  // Time of day associations
  if (asana.category === "SUPINE" || asana.category === "FORWARD_BEND") {
    keywords.push("evening", "before bed", "wind down");
  }
  if (asana.category === "STANDING" || asana.category === "BACK_BEND") {
    keywords.push("morning", "energizing", "wake up");
  }

  parts.push(`Keywords: ${Array.from(new Set(keywords)).join(", ")}`);

  return parts.join(". ");
}

// Generate embedding using OpenAI
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const openai = getOpenAIClient();
  if (!openai) {
    return null;
  }

  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
    encoding_format: "float",
  });

  return response.data[0].embedding;
}

// Calculate cosine similarity between two vectors
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate a hash of the text for cache invalidation
export function hashText(text: string): string {
  return crypto.createHash("md5").update(text).digest("hex");
}

// Helper functions
function getDifficultyLabel(difficulty: number): string {
  switch (difficulty) {
    case 1:
      return "Very Easy";
    case 2:
      return "Easy";
    case 3:
      return "Moderate";
    case 4:
      return "Challenging";
    case 5:
      return "Advanced";
    default:
      return "Unknown";
  }
}

function formatCategory(category: string): string {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Keyword-based search scoring (fallback when embeddings unavailable)
export function keywordSearchScore(
  query: string,
  asana: {
    nameEnglish: string;
    nameSanskrit: string;
    description: string;
    category: string;
    difficulty: number;
    benefits: string[];
    targetBodyParts: string[];
  }
): { score: number; matchedTerms: string[] } {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);

  let score = 0;
  const matchedTerms: string[] = [];

  // Direct name match (highest priority)
  if (asana.nameEnglish.toLowerCase().includes(queryLower)) {
    score += 10;
    matchedTerms.push(asana.nameEnglish);
  } else if (asana.nameSanskrit.toLowerCase().includes(queryLower)) {
    score += 10;
    matchedTerms.push(asana.nameSanskrit);
  }

  // Check each query word
  for (const word of queryWords) {
    // Name partial match
    if (asana.nameEnglish.toLowerCase().includes(word)) {
      score += 3;
      if (!matchedTerms.includes("name match")) matchedTerms.push("name match");
    }

    // Description match
    if (asana.description.toLowerCase().includes(word)) {
      score += 1;
    }

    // Benefits match
    for (const benefit of asana.benefits) {
      if (benefit.toLowerCase().includes(word)) {
        score += 2;
        if (!matchedTerms.includes(benefit)) matchedTerms.push(benefit);
        break;
      }
    }

    // Body parts match
    for (const part of asana.targetBodyParts) {
      if (part.toLowerCase().includes(word) || word.includes(part.toLowerCase())) {
        score += 3;
        if (!matchedTerms.includes(`targets ${part}`)) {
          matchedTerms.push(`targets ${part}`);
        }
        break;
      }
    }
  }

  // Category keywords
  const categoryMatches: Record<string, string[]> = {
    STANDING: ["standing", "stand", "ground"],
    SEATED: ["seated", "sitting", "sit", "meditation"],
    PRONE: ["prone", "lying", "face down", "belly"],
    SUPINE: ["supine", "back", "lying down", "rest"],
    INVERSION: ["inversion", "upside", "headstand", "handstand"],
    BALANCE: ["balance", "balancing", "stability"],
    TWIST: ["twist", "twisting", "spinal", "rotate"],
    FORWARD_BEND: ["forward", "bend", "fold", "stretch"],
    BACK_BEND: ["backbend", "back bend", "heart opener", "chest"],
  };

  for (const [category, keywords] of Object.entries(categoryMatches)) {
    if (asana.category === category) {
      for (const keyword of keywords) {
        if (queryLower.includes(keyword)) {
          score += 2;
          if (!matchedTerms.includes(formatCategory(category))) {
            matchedTerms.push(formatCategory(category));
          }
          break;
        }
      }
    }
  }

  // Difficulty keywords
  const easyWords = ["easy", "beginner", "gentle", "simple", "basic", "relaxing"];
  const hardWords = ["hard", "advanced", "challenging", "difficult", "intense"];

  for (const word of easyWords) {
    if (queryLower.includes(word) && asana.difficulty <= 2) {
      score += 2;
      if (!matchedTerms.includes("beginner-friendly")) {
        matchedTerms.push("beginner-friendly");
      }
      break;
    }
  }

  for (const word of hardWords) {
    if (queryLower.includes(word) && asana.difficulty >= 4) {
      score += 2;
      if (!matchedTerms.includes("advanced pose")) {
        matchedTerms.push("advanced pose");
      }
      break;
    }
  }

  // Goal-based keywords
  const goalKeywords: Record<string, { keywords: string[]; benefits: string[] }> = {
    flexibility: {
      keywords: ["flexible", "flexibility", "stretch", "stretching"],
      benefits: ["flexibility", "stretch"],
    },
    strength: {
      keywords: ["strength", "strong", "strengthen", "power"],
      benefits: ["strength", "muscle", "tone"],
    },
    relaxation: {
      keywords: ["relax", "relaxation", "calm", "stress", "peace", "peaceful"],
      benefits: ["relax", "calm", "stress", "peace"],
    },
    energy: {
      keywords: ["energy", "energize", "energizing", "invigorate"],
      benefits: ["energy", "invigorate"],
    },
  };

  for (const [goal, config] of Object.entries(goalKeywords)) {
    const hasKeyword = config.keywords.some((k) => queryLower.includes(k));
    if (hasKeyword) {
      const hasBenefit = asana.benefits.some((b) =>
        config.benefits.some((gb) => b.toLowerCase().includes(gb))
      );
      if (hasBenefit) {
        score += 3;
        if (!matchedTerms.includes(`good for ${goal}`)) {
          matchedTerms.push(`good for ${goal}`);
        }
      }
    }
  }

  // Time of day
  if (/morning|wake|energi/.test(queryLower)) {
    if (["STANDING", "BACK_BEND", "BALANCE"].includes(asana.category)) {
      score += 1;
      if (!matchedTerms.includes("morning pose")) matchedTerms.push("morning pose");
    }
  }
  if (/evening|night|bed|wind.*down/.test(queryLower)) {
    if (["SUPINE", "FORWARD_BEND", "SEATED"].includes(asana.category)) {
      score += 1;
      if (!matchedTerms.includes("evening pose")) matchedTerms.push("evening pose");
    }
  }

  return { score, matchedTerms: matchedTerms.slice(0, 3) };
}

// Interpret user query intent
export function interpretQuery(query: string): {
  intent: string;
  filters: {
    difficulty?: "easy" | "moderate" | "hard";
    category?: string;
    bodyPart?: string;
    timeOfDay?: "morning" | "evening";
    goal?: string;
  };
} {
  const queryLower = query.toLowerCase();

  const filters: {
    difficulty?: "easy" | "moderate" | "hard";
    category?: string;
    bodyPart?: string;
    timeOfDay?: "morning" | "evening";
    goal?: string;
  } = {};

  // Detect difficulty
  if (/beginner|easy|gentle|simple|basic/.test(queryLower)) {
    filters.difficulty = "easy";
  } else if (/advanced|challenging|hard|difficult|intense/.test(queryLower)) {
    filters.difficulty = "hard";
  } else if (/intermediate|moderate/.test(queryLower)) {
    filters.difficulty = "moderate";
  }

  // Detect time of day
  if (/morning|wake|energi|start.*(day|routine)/.test(queryLower)) {
    filters.timeOfDay = "morning";
  } else if (/evening|night|bed|wind.*down|relax/.test(queryLower)) {
    filters.timeOfDay = "evening";
  }

  // Detect body parts
  const bodyParts = [
    "back",
    "core",
    "hamstring",
    "hip",
    "shoulder",
    "chest",
    "spine",
    "leg",
    "arm",
    "neck",
  ];
  for (const part of bodyParts) {
    if (queryLower.includes(part)) {
      filters.bodyPart = part.charAt(0).toUpperCase() + part.slice(1);
      if (filters.bodyPart === "Hamstring") filters.bodyPart = "Hamstrings";
      if (filters.bodyPart === "Hip") filters.bodyPart = "Hips";
      break;
    }
  }

  // Detect goals
  if (/flexib|stretch/.test(queryLower)) {
    filters.goal = "flexibility";
  } else if (/strength|strong/.test(queryLower)) {
    filters.goal = "strength";
  } else if (/balance/.test(queryLower)) {
    filters.goal = "balance";
  } else if (/relax|calm|stress|peace/.test(queryLower)) {
    filters.goal = "relaxation";
  } else if (/energy|energiz/.test(queryLower)) {
    filters.goal = "energy";
  }

  // Generate intent description
  const intentParts: string[] = [];
  if (filters.difficulty) intentParts.push(`${filters.difficulty} difficulty`);
  if (filters.timeOfDay) intentParts.push(`${filters.timeOfDay} practice`);
  if (filters.bodyPart) intentParts.push(`targets ${filters.bodyPart.toLowerCase()}`);
  if (filters.goal) intentParts.push(`for ${filters.goal}`);

  const intent =
    intentParts.length > 0
      ? `Looking for ${intentParts.join(", ")}`
      : "Searching for matching poses";

  return { intent, filters };
}
