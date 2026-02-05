"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, CameraOff, RefreshCw, Loader2 } from "lucide-react";
import { detectPose, initializePoseDetector, disposeDetector, Pose } from "@/lib/pose/detector";
import { analyzePose, PoseAnalysis, REFERENCE_POSES, ReferencePose } from "@/lib/pose/analyzer";
import { generateFeedback, PoseFeedback } from "@/lib/pose/feedback";
import PoseOverlay from "./PoseOverlay";
import AlignmentFeedback from "./AlignmentFeedback";

interface PoseCameraProps {
  selectedPose?: string | null;
  onPoseDetected?: (pose: Pose | null) => void;
  onAnalysisUpdate?: (analysis: PoseAnalysis | null) => void;
}

export default function PoseCamera({
  selectedPose,
  onPoseDetected,
  onAnalysisUpdate,
}: PoseCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);

  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [currentPose, setCurrentPose] = useState<Pose | null>(null);
  const [analysis, setAnalysis] = useState<PoseAnalysis | null>(null);
  const [feedback, setFeedback] = useState<PoseFeedback | null>(null);
  const [dimensions, setDimensions] = useState({ width: 640, height: 480 });
  const [highlightedJoints, setHighlightedJoints] = useState<string[]>([]);

  // Get reference pose if selected
  const referencePose: ReferencePose | null = selectedPose
    ? REFERENCE_POSES[selectedPose] || null
    : null;

  // Initialize pose detector
  useEffect(() => {
    async function init() {
      try {
        await initializePoseDetector();
        setIsModelLoading(false);
      } catch (error) {
        console.error("Failed to load pose detector:", error);
        setCameraError("Failed to load AI model. Please refresh the page.");
        setIsModelLoading(false);
      }
    }
    init();

    return () => {
      disposeDetector();
    };
  }, []);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Update dimensions based on actual video size
      const { videoWidth, videoHeight } = videoRef.current;
      setDimensions({ width: videoWidth, height: videoHeight });
      setIsCameraActive(true);
    } catch (error: any) {
      console.error("Camera error:", error);
      if (error.name === "NotAllowedError") {
        setCameraError("Camera access denied. Please allow camera access.");
      } else if (error.name === "NotFoundError") {
        setCameraError("No camera found. Please connect a camera.");
      } else {
        setCameraError("Failed to access camera. Please try again.");
      }
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setCurrentPose(null);
    setAnalysis(null);
    setFeedback(null);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Detection loop
  useEffect(() => {
    if (!isCameraActive || isModelLoading) return;

    let lastTime = 0;
    const frameInterval = 100; // ~10 FPS for performance

    const detect = async (timestamp: number) => {
      if (timestamp - lastTime >= frameInterval) {
        lastTime = timestamp;

        if (videoRef.current && videoRef.current.readyState >= 2) {
          const pose = await detectPose(videoRef.current);
          setCurrentPose(pose);
          onPoseDetected?.(pose);

          if (pose) {
            const poseAnalysis = analyzePose(pose);
            setAnalysis(poseAnalysis);
            onAnalysisUpdate?.(poseAnalysis);

            const poseFeedback = generateFeedback(poseAnalysis, referencePose);
            setFeedback(poseFeedback);

            // Highlight joints that need correction
            const jointsToHighlight = poseFeedback.corrections.map(
              (c) => c.bodyPart
            );
            setHighlightedJoints(jointsToHighlight);
          }
        }
      }

      animationRef.current = requestAnimationFrame(detect);
    };

    animationRef.current = requestAnimationFrame(detect);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isCameraActive, isModelLoading, referencePose, onPoseDetected, onAnalysisUpdate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="space-y-4">
      {/* Camera Container */}
      <div
        ref={containerRef}
        className="relative bg-gray-900 rounded-2xl overflow-hidden aspect-video"
      >
        {/* Video Feed */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          style={{ transform: "scaleX(-1)" }} // Mirror mode
          playsInline
          muted
        />

        {/* Pose Overlay */}
        {isCameraActive && currentPose && (
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{ transform: "scaleX(-1)" }}
          >
            <PoseOverlay
              pose={currentPose}
              width={dimensions.width}
              height={dimensions.height}
              highlightJoints={highlightedJoints}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {isModelLoading && (
          <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-3" />
              <p className="font-medium">Loading AI Model...</p>
              <p className="text-sm text-gray-400">This may take a moment</p>
            </div>
          </div>
        )}

        {/* Camera Off State */}
        {!isCameraActive && !isModelLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <CameraOff className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Camera is off</p>
              <p className="text-sm text-gray-400 mb-4">
                Click below to start pose detection
              </p>
              <button
                onClick={startCamera}
                className="px-6 py-3 bg-sage-600 hover:bg-sage-700 rounded-xl font-medium transition-colors inline-flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Start Camera
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {cameraError && (
          <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center">
            <div className="text-center text-white p-6">
              <CameraOff className="w-12 h-12 mx-auto mb-3" />
              <p className="font-medium mb-2">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-white text-red-600 rounded-lg font-medium inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Camera Controls */}
        {isCameraActive && (
          <div className="absolute bottom-4 right-4">
            <button
              onClick={stopCamera}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
              title="Stop camera"
            >
              <CameraOff className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Selected Pose Badge */}
        {referencePose && isCameraActive && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
            <p className="text-sm font-medium text-gray-700">
              Checking: {referencePose.name}
            </p>
          </div>
        )}
      </div>

      {/* Feedback Panel */}
      {isCameraActive && (
        <AlignmentFeedback feedback={feedback} isLoading={isModelLoading} />
      )}
    </div>
  );
}
