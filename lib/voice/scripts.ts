export interface PoseScript {
  enter: string;
  hold: string[];
  breathCues: string[];
  exit: string;
}

export interface SessionScript {
  welcome: string;
  poseScripts: {
    poseName: string;
    duration: number;
    script: PoseScript;
    transition?: string;
  }[];
  closing: string;
}

// Default breath cues
const BREATH_CUES = [
  "Breathe deeply.",
  "Inhale... and exhale slowly.",
  "Take a deep breath in... and release.",
  "Continue breathing steadily.",
  "Let your breath flow naturally.",
  "Inhale through your nose... exhale through your mouth.",
  "Feel your breath moving through your body.",
  "With each exhale, release any tension.",
];

// Hold instructions for different pose types
const HOLD_INSTRUCTIONS: Record<string, string[]> = {
  STANDING: [
    "Ground your feet firmly into the earth.",
    "Feel your legs strong and stable.",
    "Lengthen through your spine.",
    "Keep your shoulders relaxed and away from your ears.",
  ],
  SEATED: [
    "Sit tall, lengthening your spine.",
    "Relax your shoulders down and back.",
    "Feel grounded through your sitting bones.",
    "Soften your face and jaw.",
  ],
  BALANCE: [
    "Find a focal point to help with balance.",
    "Engage your core for stability.",
    "If you wobble, that's okay. Just come back to center.",
    "Feel steady and rooted.",
  ],
  FORWARD_BEND: [
    "Fold from your hips, not your waist.",
    "Let your head hang heavy.",
    "Feel the stretch along the back of your legs.",
    "Soften your knees if needed.",
  ],
  BACK_BEND: [
    "Open your heart toward the sky.",
    "Keep your neck long.",
    "Press your hips forward gently.",
    "Breathe into your chest.",
  ],
  TWIST: [
    "Lengthen your spine before you twist.",
    "Twist from your middle back, not just your neck.",
    "With each inhale, grow taller. With each exhale, twist deeper.",
    "Keep both hips grounded.",
  ],
  INVERSION: [
    "Stay calm and focused.",
    "Keep breathing steadily.",
    "Feel the blood flowing to your head, refreshing your mind.",
    "If you feel dizzy, come out slowly.",
  ],
  PRONE: [
    "Press your palms firmly into the floor.",
    "Keep your shoulders away from your ears.",
    "Lengthen from your tailbone through the crown of your head.",
  ],
  SUPINE: [
    "Let your body melt into the floor.",
    "Release all tension from your muscles.",
    "Feel completely supported by the ground beneath you.",
  ],
};

// Transition phrases
const TRANSITIONS = [
  "Now, let's move into the next pose.",
  "Gently transition to our next position.",
  "When you're ready, we'll move on.",
  "Take a breath, and let's continue.",
  "Slowly and mindfully, shift into the next pose.",
  "Beautiful. Now let's flow into the next position.",
];

// Generate script for a single pose
export function generatePoseScript(
  poseName: string,
  sanskritName: string,
  category: string,
  duration: number
): PoseScript {
  const holdInstructions = HOLD_INSTRUCTIONS[category] || HOLD_INSTRUCTIONS.STANDING;

  // Select random instructions and breath cues
  const shuffledHold = [...holdInstructions].sort(() => Math.random() - 0.5);
  const shuffledBreath = [...BREATH_CUES].sort(() => Math.random() - 0.5);

  // Number of hold instructions based on duration
  const numHoldCues = Math.min(Math.floor(duration / 15), 4);
  const numBreathCues = Math.min(Math.floor(duration / 20), 3);

  return {
    enter: `Now, let's move into ${poseName}. ${sanskritName ? `In Sanskrit, this is called ${sanskritName}.` : ""}`,
    hold: shuffledHold.slice(0, numHoldCues),
    breathCues: shuffledBreath.slice(0, numBreathCues),
    exit: `Slowly release the pose.`,
  };
}

// Generate full session script
export function generateSessionScript(
  programName: string,
  poses: {
    englishName: string;
    sanskritName: string;
    category: string;
    duration: number;
  }[]
): SessionScript {
  const totalDuration = poses.reduce((sum, p) => sum + p.duration, 0);
  const minutes = Math.round(totalDuration / 60);

  const welcome = `Welcome to your ${programName} practice. This session will take approximately ${minutes} minutes. Find a comfortable space, take a deep breath, and let's begin. Remember to listen to your body and modify any pose as needed.`;

  const poseScripts = poses.map((pose, index) => {
    const script = generatePoseScript(
      pose.englishName,
      pose.sanskritName,
      pose.category,
      pose.duration
    );

    const transition =
      index < poses.length - 1
        ? TRANSITIONS[Math.floor(Math.random() * TRANSITIONS.length)]
        : undefined;

    return {
      poseName: pose.englishName,
      duration: pose.duration,
      script,
      transition,
    };
  });

  const closing = `Wonderful practice. Take a moment in stillness. Notice how your body feels. Bring your hands to your heart center. Thank yourself for taking this time for your practice. Namaste.`;

  return {
    welcome,
    poseScripts,
    closing,
  };
}

// Format duration for speech
export function formatDurationForSpeech(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} seconds`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (remainingSeconds === 0) {
    return minutes === 1 ? "one minute" : `${minutes} minutes`;
  }
  return `${minutes} minute${minutes > 1 ? "s" : ""} and ${remainingSeconds} seconds`;
}

// Generate countdown announcement
export function getCountdownAnnouncement(secondsRemaining: number): string | null {
  if (secondsRemaining === 30) return "30 seconds remaining in this pose.";
  if (secondsRemaining === 10) return "10 seconds. Prepare to transition.";
  if (secondsRemaining === 5) return "5";
  if (secondsRemaining === 4) return "4";
  if (secondsRemaining === 3) return "3";
  if (secondsRemaining === 2) return "2";
  if (secondsRemaining === 1) return "1";
  return null;
}
