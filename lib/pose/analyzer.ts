import { Keypoint, Pose, getKeypointByName, isKeypointVisible } from "./detector";

export interface JointAngle {
  name: string;
  angle: number;
  joint: string;
}

export interface PoseAnalysis {
  angles: JointAngle[];
  bodyAlignment: {
    shouldersLevel: boolean;
    hipsLevel: boolean;
    spineAlignment: number; // -1 to 1, 0 is straight
  };
  balance: {
    centerOfMass: { x: number; y: number };
    isBalanced: boolean;
  };
  confidence: number;
}

// Calculate angle between three points (in degrees)
export function calculateAngle(
  point1: { x: number; y: number },
  point2: { x: number; y: number }, // vertex
  point3: { x: number; y: number }
): number {
  const vector1 = { x: point1.x - point2.x, y: point1.y - point2.y };
  const vector2 = { x: point3.x - point2.x, y: point3.y - point2.y };

  const dot = vector1.x * vector2.x + vector1.y * vector2.y;
  const cross = vector1.x * vector2.y - vector1.y * vector2.x;

  const angle = Math.atan2(Math.abs(cross), dot);
  return (angle * 180) / Math.PI;
}

// Calculate the angle of a line relative to horizontal
export function calculateLineAngle(
  point1: { x: number; y: number },
  point2: { x: number; y: number }
): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

export function analyzePose(pose: Pose): PoseAnalysis | null {
  const leftShoulder = getKeypointByName(pose, "left_shoulder");
  const rightShoulder = getKeypointByName(pose, "right_shoulder");
  const leftElbow = getKeypointByName(pose, "left_elbow");
  const rightElbow = getKeypointByName(pose, "right_elbow");
  const leftWrist = getKeypointByName(pose, "left_wrist");
  const rightWrist = getKeypointByName(pose, "right_wrist");
  const leftHip = getKeypointByName(pose, "left_hip");
  const rightHip = getKeypointByName(pose, "right_hip");
  const leftKnee = getKeypointByName(pose, "left_knee");
  const rightKnee = getKeypointByName(pose, "right_knee");
  const leftAnkle = getKeypointByName(pose, "left_ankle");
  const rightAnkle = getKeypointByName(pose, "right_ankle");
  const nose = getKeypointByName(pose, "nose");

  const angles: JointAngle[] = [];

  // Left elbow angle
  if (
    isKeypointVisible(leftShoulder) &&
    isKeypointVisible(leftElbow) &&
    isKeypointVisible(leftWrist)
  ) {
    angles.push({
      name: "Left Elbow",
      angle: calculateAngle(leftShoulder!, leftElbow!, leftWrist!),
      joint: "left_elbow",
    });
  }

  // Right elbow angle
  if (
    isKeypointVisible(rightShoulder) &&
    isKeypointVisible(rightElbow) &&
    isKeypointVisible(rightWrist)
  ) {
    angles.push({
      name: "Right Elbow",
      angle: calculateAngle(rightShoulder!, rightElbow!, rightWrist!),
      joint: "right_elbow",
    });
  }

  // Left shoulder angle
  if (
    isKeypointVisible(leftHip) &&
    isKeypointVisible(leftShoulder) &&
    isKeypointVisible(leftElbow)
  ) {
    angles.push({
      name: "Left Shoulder",
      angle: calculateAngle(leftHip!, leftShoulder!, leftElbow!),
      joint: "left_shoulder",
    });
  }

  // Right shoulder angle
  if (
    isKeypointVisible(rightHip) &&
    isKeypointVisible(rightShoulder) &&
    isKeypointVisible(rightElbow)
  ) {
    angles.push({
      name: "Right Shoulder",
      angle: calculateAngle(rightHip!, rightShoulder!, rightElbow!),
      joint: "right_shoulder",
    });
  }

  // Left hip angle
  if (
    isKeypointVisible(leftShoulder) &&
    isKeypointVisible(leftHip) &&
    isKeypointVisible(leftKnee)
  ) {
    angles.push({
      name: "Left Hip",
      angle: calculateAngle(leftShoulder!, leftHip!, leftKnee!),
      joint: "left_hip",
    });
  }

  // Right hip angle
  if (
    isKeypointVisible(rightShoulder) &&
    isKeypointVisible(rightHip) &&
    isKeypointVisible(rightKnee)
  ) {
    angles.push({
      name: "Right Hip",
      angle: calculateAngle(rightShoulder!, rightHip!, rightKnee!),
      joint: "right_hip",
    });
  }

  // Left knee angle
  if (
    isKeypointVisible(leftHip) &&
    isKeypointVisible(leftKnee) &&
    isKeypointVisible(leftAnkle)
  ) {
    angles.push({
      name: "Left Knee",
      angle: calculateAngle(leftHip!, leftKnee!, leftAnkle!),
      joint: "left_knee",
    });
  }

  // Right knee angle
  if (
    isKeypointVisible(rightHip) &&
    isKeypointVisible(rightKnee) &&
    isKeypointVisible(rightAnkle)
  ) {
    angles.push({
      name: "Right Knee",
      angle: calculateAngle(rightHip!, rightKnee!, rightAnkle!),
      joint: "right_knee",
    });
  }

  // Body alignment analysis
  let shouldersLevel = false;
  let hipsLevel = false;
  let spineAlignment = 0;

  if (isKeypointVisible(leftShoulder) && isKeypointVisible(rightShoulder)) {
    const shoulderAngle = Math.abs(
      calculateLineAngle(leftShoulder!, rightShoulder!)
    );
    shouldersLevel = shoulderAngle < 10;
  }

  if (isKeypointVisible(leftHip) && isKeypointVisible(rightHip)) {
    const hipAngle = Math.abs(calculateLineAngle(leftHip!, rightHip!));
    hipsLevel = hipAngle < 10;
  }

  if (
    isKeypointVisible(nose) &&
    isKeypointVisible(leftHip) &&
    isKeypointVisible(rightHip)
  ) {
    const midHip = {
      x: (leftHip!.x + rightHip!.x) / 2,
      y: (leftHip!.y + rightHip!.y) / 2,
    };
    spineAlignment = (nose!.x - midHip.x) / 100; // Normalized offset
    spineAlignment = Math.max(-1, Math.min(1, spineAlignment));
  }

  // Balance analysis
  const visibleKeypoints = pose.keypoints.filter((kp) => isKeypointVisible(kp));
  const centerOfMass = {
    x:
      visibleKeypoints.reduce((sum, kp) => sum + kp.x, 0) /
      visibleKeypoints.length,
    y:
      visibleKeypoints.reduce((sum, kp) => sum + kp.y, 0) /
      visibleKeypoints.length,
  };

  // Check if balanced (center of mass is between feet)
  let isBalanced = true;
  if (isKeypointVisible(leftAnkle) && isKeypointVisible(rightAnkle)) {
    const minX = Math.min(leftAnkle!.x, rightAnkle!.x);
    const maxX = Math.max(leftAnkle!.x, rightAnkle!.x);
    isBalanced = centerOfMass.x >= minX - 50 && centerOfMass.x <= maxX + 50;
  }

  // Calculate overall confidence
  const confidence =
    visibleKeypoints.reduce((sum, kp) => sum + (kp.score ?? 0), 0) /
    pose.keypoints.length;

  return {
    angles,
    bodyAlignment: {
      shouldersLevel,
      hipsLevel,
      spineAlignment,
    },
    balance: {
      centerOfMass,
      isBalanced,
    },
    confidence,
  };
}

// Reference poses for common yoga asanas
export interface ReferencePose {
  name: string;
  angles: {
    joint: string;
    min: number;
    max: number;
    ideal: number;
  }[];
  requirements: {
    shouldersLevel?: boolean;
    hipsLevel?: boolean;
    armsRaised?: boolean;
    kneesBent?: boolean;
  };
}

export const REFERENCE_POSES: Record<string, ReferencePose> = {
  mountain: {
    name: "Mountain Pose (Tadasana)",
    angles: [
      { joint: "left_knee", min: 165, max: 180, ideal: 180 },
      { joint: "right_knee", min: 165, max: 180, ideal: 180 },
      { joint: "left_hip", min: 165, max: 180, ideal: 180 },
      { joint: "right_hip", min: 165, max: 180, ideal: 180 },
    ],
    requirements: {
      shouldersLevel: true,
      hipsLevel: true,
    },
  },
  warrior1: {
    name: "Warrior I (Virabhadrasana I)",
    angles: [
      { joint: "left_knee", min: 80, max: 110, ideal: 90 },
      { joint: "right_knee", min: 160, max: 180, ideal: 175 },
      { joint: "left_shoulder", min: 160, max: 180, ideal: 180 },
      { joint: "right_shoulder", min: 160, max: 180, ideal: 180 },
    ],
    requirements: {
      armsRaised: true,
    },
  },
  warrior2: {
    name: "Warrior II (Virabhadrasana II)",
    angles: [
      { joint: "left_knee", min: 80, max: 110, ideal: 90 },
      { joint: "right_knee", min: 160, max: 180, ideal: 175 },
      { joint: "left_shoulder", min: 80, max: 100, ideal: 90 },
      { joint: "right_shoulder", min: 80, max: 100, ideal: 90 },
    ],
    requirements: {
      shouldersLevel: true,
    },
  },
  tree: {
    name: "Tree Pose (Vrksasana)",
    angles: [
      { joint: "left_knee", min: 165, max: 180, ideal: 180 },
      { joint: "right_knee", min: 30, max: 90, ideal: 60 },
    ],
    requirements: {
      shouldersLevel: true,
      hipsLevel: true,
    },
  },
  chair: {
    name: "Chair Pose (Utkatasana)",
    angles: [
      { joint: "left_knee", min: 90, max: 130, ideal: 110 },
      { joint: "right_knee", min: 90, max: 130, ideal: 110 },
      { joint: "left_hip", min: 90, max: 130, ideal: 110 },
      { joint: "right_hip", min: 90, max: 130, ideal: 110 },
    ],
    requirements: {
      shouldersLevel: true,
      hipsLevel: true,
      armsRaised: true,
      kneesBent: true,
    },
  },
  downdog: {
    name: "Downward Dog (Adho Mukha Svanasana)",
    angles: [
      { joint: "left_shoulder", min: 160, max: 180, ideal: 175 },
      { joint: "right_shoulder", min: 160, max: 180, ideal: 175 },
      { joint: "left_knee", min: 160, max: 180, ideal: 175 },
      { joint: "right_knee", min: 160, max: 180, ideal: 175 },
    ],
    requirements: {},
  },
};

export function comparePoseToReference(
  analysis: PoseAnalysis,
  referencePose: ReferencePose
): {
  score: number;
  corrections: { joint: string; message: string; severity: "minor" | "major" }[];
} {
  const corrections: {
    joint: string;
    message: string;
    severity: "minor" | "major";
  }[] = [];
  let totalScore = 0;
  let totalChecks = 0;

  // Check angles
  for (const refAngle of referencePose.angles) {
    const actualAngle = analysis.angles.find((a) => a.joint === refAngle.joint);
    if (!actualAngle) continue;

    totalChecks++;
    const diff = Math.abs(actualAngle.angle - refAngle.ideal);

    if (actualAngle.angle < refAngle.min) {
      const severity = actualAngle.angle < refAngle.min - 20 ? "major" : "minor";
      corrections.push({
        joint: refAngle.joint,
        message: `Extend your ${actualAngle.name.toLowerCase()} more`,
        severity,
      });
      totalScore += severity === "major" ? 0.3 : 0.6;
    } else if (actualAngle.angle > refAngle.max) {
      const severity = actualAngle.angle > refAngle.max + 20 ? "major" : "minor";
      corrections.push({
        joint: refAngle.joint,
        message: `Bend your ${actualAngle.name.toLowerCase()} more`,
        severity,
      });
      totalScore += severity === "major" ? 0.3 : 0.6;
    } else {
      // Within range, score based on closeness to ideal
      totalScore += 1 - diff / 30;
    }
  }

  // Check body alignment requirements
  if (referencePose.requirements.shouldersLevel !== undefined) {
    totalChecks++;
    if (
      referencePose.requirements.shouldersLevel &&
      !analysis.bodyAlignment.shouldersLevel
    ) {
      corrections.push({
        joint: "shoulders",
        message: "Level your shoulders",
        severity: "minor",
      });
      totalScore += 0.5;
    } else {
      totalScore += 1;
    }
  }

  if (referencePose.requirements.hipsLevel !== undefined) {
    totalChecks++;
    if (
      referencePose.requirements.hipsLevel &&
      !analysis.bodyAlignment.hipsLevel
    ) {
      corrections.push({
        joint: "hips",
        message: "Level your hips",
        severity: "minor",
      });
      totalScore += 0.5;
    } else {
      totalScore += 1;
    }
  }

  const finalScore = totalChecks > 0 ? (totalScore / totalChecks) * 100 : 0;

  return {
    score: Math.round(Math.min(100, Math.max(0, finalScore))),
    corrections,
  };
}
