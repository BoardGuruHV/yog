import { PoseAnalysis, ReferencePose, comparePoseToReference } from "./analyzer";

export interface PoseFeedback {
  overallScore: number;
  status: "excellent" | "good" | "needs_work" | "poor";
  primaryMessage: string;
  corrections: {
    message: string;
    priority: number;
    bodyPart: string;
  }[];
  encouragement: string;
}

const ENCOURAGEMENTS = {
  excellent: [
    "Perfect form! You're doing great!",
    "Excellent alignment! Keep it up!",
    "Beautiful pose! You've mastered this!",
    "Impressive! Your form is spot on!",
  ],
  good: [
    "Great job! Just a few small adjustments.",
    "You're doing well! Minor tweaks will perfect it.",
    "Almost there! Keep focusing on your alignment.",
    "Good progress! You're getting stronger!",
  ],
  needs_work: [
    "Keep practicing! You're improving!",
    "Focus on the corrections and try again.",
    "Every practice makes you better!",
    "You've got this! Pay attention to form.",
  ],
  poor: [
    "Don't give up! Start with the basics.",
    "Try adjusting your position step by step.",
    "Focus on one correction at a time.",
    "Take it slow and build your foundation.",
  ],
};

export function generateFeedback(
  analysis: PoseAnalysis | null,
  referencePose: ReferencePose | null
): PoseFeedback {
  if (!analysis) {
    return {
      overallScore: 0,
      status: "poor",
      primaryMessage: "Unable to detect your pose. Please adjust your position.",
      corrections: [],
      encouragement: "Make sure your full body is visible to the camera.",
    };
  }

  if (analysis.confidence < 0.3) {
    return {
      overallScore: 0,
      status: "poor",
      primaryMessage: "Low detection confidence. Please adjust lighting or position.",
      corrections: [],
      encouragement: "Try standing in better lighting with more space around you.",
    };
  }

  if (!referencePose) {
    // General posture feedback without reference
    return generateGeneralFeedback(analysis);
  }

  const comparison = comparePoseToReference(analysis, referencePose);

  let status: PoseFeedback["status"];
  if (comparison.score >= 90) {
    status = "excellent";
  } else if (comparison.score >= 70) {
    status = "good";
  } else if (comparison.score >= 50) {
    status = "needs_work";
  } else {
    status = "poor";
  }

  const corrections = comparison.corrections
    .map((c, index) => ({
      message: c.message,
      priority: c.severity === "major" ? 1 : 2,
      bodyPart: c.joint,
    }))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3); // Top 3 corrections

  let primaryMessage: string;
  if (corrections.length === 0) {
    primaryMessage = `Great ${referencePose.name}!`;
  } else if (corrections.length === 1) {
    primaryMessage = corrections[0].message;
  } else {
    primaryMessage = `Focus on: ${corrections[0].message}`;
  }

  const encouragements = ENCOURAGEMENTS[status];
  const encouragement =
    encouragements[Math.floor(Math.random() * encouragements.length)];

  return {
    overallScore: comparison.score,
    status,
    primaryMessage,
    corrections,
    encouragement,
  };
}

function generateGeneralFeedback(analysis: PoseAnalysis): PoseFeedback {
  const corrections: PoseFeedback["corrections"] = [];

  if (!analysis.bodyAlignment.shouldersLevel) {
    corrections.push({
      message: "Try to level your shoulders",
      priority: 1,
      bodyPart: "shoulders",
    });
  }

  if (!analysis.bodyAlignment.hipsLevel) {
    corrections.push({
      message: "Keep your hips level",
      priority: 1,
      bodyPart: "hips",
    });
  }

  if (Math.abs(analysis.bodyAlignment.spineAlignment) > 0.3) {
    corrections.push({
      message:
        analysis.bodyAlignment.spineAlignment > 0
          ? "Center your body - leaning right"
          : "Center your body - leaning left",
      priority: 2,
      bodyPart: "spine",
    });
  }

  if (!analysis.balance.isBalanced) {
    corrections.push({
      message: "Adjust your weight distribution",
      priority: 2,
      bodyPart: "balance",
    });
  }

  const score = Math.round(
    100 -
      corrections.filter((c) => c.priority === 1).length * 20 -
      corrections.filter((c) => c.priority === 2).length * 10
  );

  let status: PoseFeedback["status"];
  if (score >= 90) {
    status = "excellent";
  } else if (score >= 70) {
    status = "good";
  } else if (score >= 50) {
    status = "needs_work";
  } else {
    status = "poor";
  }

  return {
    overallScore: Math.max(0, score),
    status,
    primaryMessage:
      corrections.length > 0
        ? corrections[0].message
        : "Good posture! Select a pose to check alignment.",
    corrections: corrections.slice(0, 3),
    encouragement:
      ENCOURAGEMENTS[status][
        Math.floor(Math.random() * ENCOURAGEMENTS[status].length)
      ],
  };
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "#22c55e"; // green-500
  if (score >= 70) return "#84cc16"; // lime-500
  if (score >= 50) return "#eab308"; // yellow-500
  return "#ef4444"; // red-500
}

export function getStatusEmoji(status: PoseFeedback["status"]): string {
  switch (status) {
    case "excellent":
      return "🌟";
    case "good":
      return "👍";
    case "needs_work":
      return "💪";
    case "poor":
      return "🎯";
  }
}
