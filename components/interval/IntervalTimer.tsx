"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Pause,
  Play,
  SkipForward,
  X,
  Volume2,
  VolumeX,
  Zap,
  Coffee,
} from "lucide-react";
import RoundIndicator from "./RoundIndicator";
import { IntervalConfig } from "./IntervalSettings";
import { Asana } from "@/types";

interface IntervalTimerProps {
  config: IntervalConfig;
  poses: Asana[];
  onComplete: () => void;
  onExit: () => void;
}

type Phase = "work" | "rest" | "countdown" | "complete";

const restPoseImages: Record<string, string> = {
  childs: "/asanas/balasana.svg",
  mountain: "/asanas/tadasana.svg",
  corpse: "/asanas/savasana.svg",
  easy: "/asanas/sukhasana.svg",
};

const restPoseNames: Record<string, string> = {
  childs: "Child's Pose",
  mountain: "Mountain Pose",
  corpse: "Corpse Pose",
  easy: "Easy Pose",
};

export default function IntervalTimer({
  config,
  poses,
  onComplete,
  onExit,
}: IntervalTimerProps) {
  const [phase, setPhase] = useState<Phase>("countdown");
  const [timeLeft, setTimeLeft] = useState(3); // 3 second countdown
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Get current pose for work phase
  const currentPose = poses[currentPoseIndex % poses.length];

  // Play beep sound
  const playBeep = useCallback((frequency: number = 440, duration: number = 150) => {
    if (isMuted) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
      console.log("Audio not available");
    }
  }, [isMuted]);

  // Play transition sound
  const playTransition = useCallback((isWork: boolean) => {
    if (isWork) {
      // Three rising beeps for work
      playBeep(440, 100);
      setTimeout(() => playBeep(554, 100), 150);
      setTimeout(() => playBeep(659, 200), 300);
    } else {
      // Descending tone for rest
      playBeep(659, 100);
      setTimeout(() => playBeep(554, 100), 150);
      setTimeout(() => playBeep(440, 200), 300);
    }
  }, [playBeep]);

  // Timer logic
  useEffect(() => {
    if (isPaused || phase === "complete") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up for current phase
          if (phase === "countdown") {
            setPhase("work");
            playTransition(true);
            return config.workDuration;
          } else if (phase === "work") {
            setPhase("rest");
            playTransition(false);
            return config.restDuration;
          } else if (phase === "rest") {
            if (currentRound >= config.rounds) {
              setPhase("complete");
              return 0;
            } else {
              setCurrentRound((r) => r + 1);
              setCurrentPoseIndex((i) => (i + 1) % poses.length);
              setPhase("work");
              playTransition(true);
              return config.workDuration;
            }
          }
        }

        // Warning beeps at 3, 2, 1 seconds
        if (prev <= 4 && prev > 1) {
          playBeep(880, 80);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, isPaused, currentRound, config, poses.length, playBeep, playTransition]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Skip to next phase
  const handleSkip = () => {
    if (phase === "work") {
      setPhase("rest");
      setTimeLeft(config.restDuration);
      playTransition(false);
    } else if (phase === "rest") {
      if (currentRound >= config.rounds) {
        setPhase("complete");
      } else {
        setCurrentRound((r) => r + 1);
        setCurrentPoseIndex((i) => (i + 1) % poses.length);
        setPhase("work");
        setTimeLeft(config.workDuration);
        playTransition(true);
      }
    }
  };

  // Get background gradient based on phase
  const getBackground = () => {
    switch (phase) {
      case "countdown":
        return "from-gray-800 to-gray-900";
      case "work":
        return "from-orange-600 to-red-600";
      case "rest":
        return "from-blue-600 to-indigo-600";
      case "complete":
        return "from-green-600 to-emerald-600";
      default:
        return "from-gray-800 to-gray-900";
    }
  };

  // Complete screen
  if (phase === "complete") {
    return (
      <div className="fixed inset-0 bg-linear-to-b from-green-600 to-emerald-700 flex flex-col items-center justify-center text-white p-8">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold mb-4">Great Work!</h1>
        <p className="text-xl text-green-100 mb-8 text-center">
          You completed {config.rounds} rounds of interval training
        </p>
        <div className="bg-white/10 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold">{config.rounds}</p>
              <p className="text-sm text-green-200">Rounds</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {Math.floor((config.workDuration * config.rounds) / 60)}m
              </p>
              <p className="text-sm text-green-200">Work Time</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{poses.length}</p>
              <p className="text-sm text-green-200">Poses</p>
            </div>
          </div>
        </div>
        <button
          onClick={onComplete}
          className="px-8 py-4 bg-white text-green-700 rounded-xl font-semibold text-lg hover:bg-green-50 transition-colors"
        >
          Finish
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-linear-to-b ${getBackground()} flex flex-col text-white transition-colors duration-500`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onExit}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Countdown Screen */}
        {phase === "countdown" && (
          <div className="text-center">
            <p className="text-2xl text-white/70 mb-4">Get Ready!</p>
            <div className="text-[12rem] font-bold leading-none">{timeLeft}</div>
          </div>
        )}

        {/* Work/Rest Screen */}
        {(phase === "work" || phase === "rest") && (
          <>
            {/* Phase Indicator */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
                phase === "work" ? "bg-orange-500/30" : "bg-blue-500/30"
              }`}
            >
              {phase === "work" ? (
                <>
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold uppercase tracking-wider">
                    Work
                  </span>
                </>
              ) : (
                <>
                  <Coffee className="w-5 h-5" />
                  <span className="font-semibold uppercase tracking-wider">
                    Rest
                  </span>
                </>
              )}
            </div>

            {/* Timer */}
            <div className="text-[8rem] md:text-[10rem] font-bold leading-none mb-4">
              {formatTime(timeLeft)}
            </div>

            {/* Pose Display */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-32 h-32 bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Image
                  src={
                    phase === "work"
                      ? currentPose.svgPath
                      : restPoseImages[config.restPose]
                  }
                  alt={
                    phase === "work"
                      ? currentPose.nameEnglish
                      : restPoseNames[config.restPose]
                  }
                  width={96}
                  height={96}
                  className="opacity-90"
                />
              </div>
              <p className="text-xl font-semibold">
                {phase === "work"
                  ? currentPose.nameEnglish
                  : restPoseNames[config.restPose]}
              </p>
              <p className="text-white/60">
                {phase === "work"
                  ? currentPose.nameSanskrit
                  : config.restPose === "childs"
                  ? "Balasana"
                  : config.restPose === "mountain"
                  ? "Tadasana"
                  : config.restPose === "corpse"
                  ? "Savasana"
                  : "Sukhasana"}
              </p>
            </div>

            {/* Round Indicator */}
            <RoundIndicator
              currentRound={currentRound}
              totalRounds={config.rounds}
              isResting={phase === "rest"}
            />
          </>
        )}
      </div>

      {/* Controls */}
      <div className="p-8 flex items-center justify-center gap-4">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
        >
          {isPaused ? (
            <Play className="w-8 h-8 ml-1" />
          ) : (
            <Pause className="w-8 h-8" />
          )}
        </button>
        <button
          onClick={handleSkip}
          className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center">
            <Pause className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-2xl font-semibold">Paused</p>
            <p className="text-white/60 mt-2">Tap play to continue</p>
          </div>
        </div>
      )}
    </div>
  );
}
