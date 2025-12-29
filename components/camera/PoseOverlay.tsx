"use client";

import { useEffect, useRef } from "react";
import { Pose, Keypoint, isKeypointVisible } from "@/lib/pose/detector";

interface PoseOverlayProps {
  pose: Pose | null;
  width: number;
  height: number;
  showSkeleton?: boolean;
  showKeypoints?: boolean;
  highlightJoints?: string[];
}

// Skeleton connections
const SKELETON_CONNECTIONS: [string, string][] = [
  ["nose", "left_eye"],
  ["nose", "right_eye"],
  ["left_eye", "left_ear"],
  ["right_eye", "right_ear"],
  ["left_shoulder", "right_shoulder"],
  ["left_shoulder", "left_elbow"],
  ["right_shoulder", "right_elbow"],
  ["left_elbow", "left_wrist"],
  ["right_elbow", "right_wrist"],
  ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"],
  ["left_hip", "right_hip"],
  ["left_hip", "left_knee"],
  ["right_hip", "right_knee"],
  ["left_knee", "left_ankle"],
  ["right_knee", "right_ankle"],
];

export default function PoseOverlay({
  pose,
  width,
  height,
  showSkeleton = true,
  showKeypoints = true,
  highlightJoints = [],
}: PoseOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!pose) return;

    const keypoints = new Map<string, Keypoint>();
    for (const kp of pose.keypoints) {
      if (kp.name) {
        keypoints.set(kp.name, kp);
      }
    }

    // Draw skeleton connections
    if (showSkeleton) {
      ctx.lineWidth = 3;

      for (const [start, end] of SKELETON_CONNECTIONS) {
        const startKp = keypoints.get(start);
        const endKp = keypoints.get(end);

        if (!isKeypointVisible(startKp) || !isKeypointVisible(endKp)) continue;

        const isHighlighted =
          highlightJoints.includes(start) || highlightJoints.includes(end);

        ctx.strokeStyle = isHighlighted ? "#ef4444" : "#22c55e";
        ctx.beginPath();
        ctx.moveTo(startKp!.x, startKp!.y);
        ctx.lineTo(endKp!.x, endKp!.y);
        ctx.stroke();
      }
    }

    // Draw keypoints
    if (showKeypoints) {
      for (const kp of pose.keypoints) {
        if (!isKeypointVisible(kp)) continue;

        const isHighlighted = kp.name && highlightJoints.includes(kp.name);
        const radius = isHighlighted ? 8 : 5;

        // Outer circle
        ctx.fillStyle = isHighlighted ? "#ef4444" : "#22c55e";
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Inner circle
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, radius - 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }, [pose, width, height, showSkeleton, showKeypoints, highlightJoints]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute top-0 left-0 pointer-events-none"
    />
  );
}
