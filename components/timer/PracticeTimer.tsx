"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProgramAsana } from "@/types";
import {
  PracticeTimerEngine,
  TimerState,
  playBellSound,
  formatTime,
} from "@/lib/timer/engine";
import TimerDisplay from "./TimerDisplay";
import TimerControls from "./TimerControls";
import PoseTransition from "./PoseTransition";
import { CheckCircle, Clock, Flame } from "lucide-react";

interface PracticeTimerProps {
  programId: string;
  programName: string;
  asanas: ProgramAsana[];
}

export default function PracticeTimer({
  programId,
  programName,
  asanas,
}: PracticeTimerProps) {
  const router = useRouter();
  const engineRef = useRef<PracticeTimerEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [timerState, setTimerState] = useState<TimerState>({
    status: "idle",
    currentPoseIndex: 0,
    poseTimeRemaining: asanas[0]?.duration || 0,
    totalTimeRemaining: asanas.reduce((sum, a) => sum + a.duration, 0),
    totalTimeElapsed: 0,
  });

  const [showTransition, setShowTransition] = useState(false);
  const [nextPoseIndex, setNextPoseIndex] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize timer engine
  useEffect(() => {
    engineRef.current = new PracticeTimerEngine(asanas, {
      onTick: (state) => setTimerState(state),
      onPoseChange: (index, isLast) => {
        setShowTransition(false);
        if (!isMuted) {
          playBellSound("transition");
        }
      },
      onComplete: () => {
        if (!isMuted) {
          playBellSound("complete");
        }
      },
      onTransitionStart: (index) => {
        setNextPoseIndex(index);
        setShowTransition(true);
        if (!isMuted) {
          playBellSound("transition");
        }
      },
    });

    return () => {
      engineRef.current?.destroy();
    };
  }, [asanas, isMuted]);

  // Keep screen awake
  useEffect(() => {
    let wakeLock: WakeLockSentinel | null = null;

    const requestWakeLock = async () => {
      if ("wakeLock" in navigator && timerState.status === "playing") {
        try {
          wakeLock = await navigator.wakeLock.request("screen");
        } catch (err) {
          console.log("Wake lock request failed:", err);
        }
      }
    };

    requestWakeLock();

    return () => {
      if (wakeLock) {
        wakeLock.release();
      }
    };
  }, [timerState.status]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Space") {
        e.preventDefault();
        engineRef.current?.toggle();
      } else if (e.key === "ArrowRight") {
        engineRef.current?.skipToNext();
      } else if (e.key === "ArrowLeft") {
        engineRef.current?.skipToPrevious();
      } else if (e.key === "r" || e.key === "R") {
        engineRef.current?.reset();
      } else if (e.key === "m" || e.key === "M") {
        setIsMuted((prev) => !prev);
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "Escape") {
        if (isFullscreen) {
          document.exitFullscreen();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handleTransitionComplete = useCallback(() => {
    setShowTransition(false);
    setNextPoseIndex(null);
  }, []);

  const handleExit = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    router.push("/program");
  };

  const currentPose = asanas[timerState.currentPoseIndex];
  const nextPose = asanas[timerState.currentPoseIndex + 1];
  const isPlaying = timerState.status === "playing";
  const isPaused = timerState.status === "paused";
  const isCompleted = timerState.status === "completed";

  // Transition screen
  if (showTransition && nextPoseIndex !== null) {
    return (
      <PoseTransition
        currentPose={currentPose}
        nextPose={asanas[nextPoseIndex]}
        transitionDuration={5}
        onTransitionComplete={handleTransitionComplete}
      />
    );
  }

  // Completion screen
  if (isCompleted) {
    const totalTime = asanas.reduce((sum, a) => sum + a.duration, 0);
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 z-40 bg-gradient-to-br from-sage-500 to-sage-700 flex items-center justify-center"
      >
        <div className="text-center text-white max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16" />
          </div>

          <h1 className="text-3xl font-bold mb-2">Practice Complete!</h1>
          <p className="text-white/80 mb-8">{programName}</p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="w-5 h-5" />
                <span className="text-2xl font-bold">
                  {formatTime(totalTime)}
                </span>
              </div>
              <p className="text-sm text-white/70">Total Time</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flame className="w-5 h-5" />
                <span className="text-2xl font-bold">{asanas.length}</span>
              </div>
              <p className="text-sm text-white/70">Poses Completed</p>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <button
              onClick={() => engineRef.current?.reset()}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
            >
              Practice Again
            </button>
            <button
              onClick={handleExit}
              className="px-6 py-3 bg-white text-sage-700 hover:bg-gray-100 rounded-xl font-medium transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 bg-gradient-to-br from-sage-600 to-sage-800"
    >
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between text-white/80">
        <div>
          <h2 className="font-semibold">{programName}</h2>
          <p className="text-sm">
            Pose {timerState.currentPoseIndex + 1} of {asanas.length}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm">Total Remaining</p>
          <p className="font-mono text-lg">
            {formatTime(timerState.totalTimeRemaining)}
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="h-full flex flex-col items-center justify-center px-4">
        {/* Current pose */}
        <div className="mb-6 text-center text-white">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-white/10 rounded-3xl flex items-center justify-center mb-4 mx-auto">
            {currentPose?.asana?.svgPath && (
              <Image
                src={currentPose.asana.svgPath}
                alt={currentPose.asana.nameEnglish}
                width={180}
                height={180}
                className="drop-shadow-lg"
              />
            )}
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-1">
            {currentPose?.asana?.nameEnglish}
          </h1>
          <p className="text-white/70">
            {currentPose?.asana?.nameSanskrit}
          </p>
        </div>

        {/* Timer */}
        <div className="mb-8">
          <div className="relative w-48 h-48 md:w-64 md:h-64">
            {/* Progress ring */}
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="3"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${
                  ((currentPose.duration - timerState.poseTimeRemaining) /
                    currentPose.duration) *
                  282.7
                } 282.7`}
                style={{ transition: "stroke-dasharray 0.5s ease-out" }}
              />
            </svg>

            {/* Time display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
              <span
                className={`font-mono text-5xl md:text-6xl font-bold tabular-nums ${
                  timerState.poseTimeRemaining <= 5 ? "text-red-300 animate-pulse" : ""
                }`}
              >
                {formatTime(timerState.poseTimeRemaining)}
              </span>
              <span className="text-sm text-white/60 mt-1">remaining</span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <TimerControls
          isPlaying={isPlaying}
          isPaused={isPaused}
          isCompleted={isCompleted}
          canSkipBack={timerState.currentPoseIndex > 0}
          canSkipForward={timerState.currentPoseIndex < asanas.length - 1}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          onPlay={() => engineRef.current?.start()}
          onPause={() => engineRef.current?.pause()}
          onSkipBack={() => engineRef.current?.skipToPrevious()}
          onSkipForward={() => engineRef.current?.skipToNext()}
          onReset={() => engineRef.current?.reset()}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleFullscreen={toggleFullscreen}
          onExit={handleExit}
        />

        {/* Keyboard shortcuts hint */}
        <p className="absolute bottom-4 text-white/40 text-xs hidden md:block">
          Space: Play/Pause | Arrow keys: Skip | R: Reset | M: Mute | F: Fullscreen
        </p>
      </main>

      {/* Pose navigation dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
        {asanas.map((_, index) => (
          <button
            key={index}
            onClick={() => engineRef.current?.goToPose(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === timerState.currentPoseIndex
                ? "bg-white scale-125"
                : index < timerState.currentPoseIndex
                ? "bg-white/60"
                : "bg-white/30"
            }`}
          />
        ))}
      </div>

      {/* Next pose preview */}
      {nextPose && (
        <div className="absolute bottom-4 right-4 bg-white/10 rounded-xl p-3 backdrop-blur-sm hidden md:block">
          <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
            Up Next
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
              {nextPose.asana?.svgPath && (
                <Image
                  src={nextPose.asana.svgPath}
                  alt={nextPose.asana.nameEnglish}
                  width={36}
                  height={36}
                />
              )}
            </div>
            <div className="text-white">
              <p className="font-medium text-sm">
                {nextPose.asana?.nameEnglish}
              </p>
              <p className="text-xs text-white/60">
                {formatTime(nextPose.duration)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
