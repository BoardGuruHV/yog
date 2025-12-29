import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs";

export type Keypoint = poseDetection.Keypoint;
export type Pose = poseDetection.Pose;

let detector: poseDetection.PoseDetector | null = null;
let isLoading = false;

export const KEYPOINT_NAMES = [
  "nose",
  "left_eye",
  "right_eye",
  "left_ear",
  "right_ear",
  "left_shoulder",
  "right_shoulder",
  "left_elbow",
  "right_elbow",
  "left_wrist",
  "right_wrist",
  "left_hip",
  "right_hip",
  "left_knee",
  "right_knee",
  "left_ankle",
  "right_ankle",
] as const;

export type KeypointName = (typeof KEYPOINT_NAMES)[number];

export async function initializePoseDetector(): Promise<poseDetection.PoseDetector> {
  if (detector) return detector;
  if (isLoading) {
    // Wait for existing initialization
    while (isLoading) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (detector) return detector;
  }

  isLoading = true;

  try {
    // Use MoveNet for better performance
    const model = poseDetection.SupportedModels.MoveNet;
    detector = await poseDetection.createDetector(model, {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
      enableSmoothing: true,
    });

    return detector;
  } finally {
    isLoading = false;
  }
}

export async function detectPose(
  video: HTMLVideoElement
): Promise<Pose | null> {
  if (!detector) {
    detector = await initializePoseDetector();
  }

  try {
    const poses = await detector.estimatePoses(video, {
      flipHorizontal: false,
    });

    return poses[0] || null;
  } catch (error) {
    console.error("Pose detection error:", error);
    return null;
  }
}

export function getKeypointByName(
  pose: Pose,
  name: KeypointName
): Keypoint | undefined {
  return pose.keypoints.find((kp) => kp.name === name);
}

export function isKeypointVisible(keypoint: Keypoint | undefined): boolean {
  return keypoint !== undefined && (keypoint.score ?? 0) > 0.3;
}

export function disposeDetector(): void {
  if (detector) {
    detector.dispose();
    detector = null;
  }
}
