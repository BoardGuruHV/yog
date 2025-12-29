"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { BreathingPattern, BreathPhase } from "@/lib/audio/breath-detector";
import { speak, stopSpeaking, VoiceSettings, DEFAULT_VOICE_SETTINGS } from "@/lib/voice/speech";
import BreathVisualizer from "./BreathVisualizer";

interface BreathGuideProps {
  pattern: BreathingPattern;
  onComplete?: (cycles: number) => void;
}

export default function BreathGuide({ pattern, onComplete }: BreathGuideProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [targetCycles, setTargetCycles] = useState(5);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const voiceSettings: VoiceSettings = { ...DEFAULT_VOICE_SETTINGS, rate: 0.85 };

  const currentPhase = pattern.phases[currentPhaseIndex];

  const speakInstruction = useCallback(
    async (text: string) => {
      if (isMuted) return;
      try {
        await speak(text, voiceSettings);
      } catch (error) {
        console.error("Speech error:", error);
      }
    },
    [isMuted]
  );

  // Phase timer
  useEffect(() => {
    if (!isPlaying || !currentPhase) return;

    const phaseDuration = currentPhase.duration * 1000;
    startTimeRef.current = Date.now();

    // Speak instruction at start of phase
    speakInstruction(currentPhase.instruction);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / phaseDuration, 1);
      setPhaseProgress(progress);
      setCountdown(Math.ceil((phaseDuration - elapsed) / 1000));

      if (progress >= 1) {
        // Move to next phase
        const nextIndex = currentPhaseIndex + 1;

        if (nextIndex >= pattern.phases.length) {
          // Cycle complete
          const newCycleCount = completedCycles + 1;
          setCompletedCycles(newCycleCount);

          if (newCycleCount >= targetCycles) {
            // Session complete
            setIsPlaying(false);
            speakInstruction("Well done. Your breathing practice is complete.");
            onComplete?.(newCycleCount);
          } else {
            // Start next cycle
            setCurrentPhaseIndex(0);
          }
        } else {
          setCurrentPhaseIndex(nextIndex);
        }
        setPhaseProgress(0);
      }
    }, 50);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [
    isPlaying,
    currentPhaseIndex,
    currentPhase,
    pattern.phases.length,
    completedCycles,
    targetCycles,
    speakInstruction,
    onComplete,
  ]);

  const handleStart = async () => {
    setIsPlaying(true);
    setCurrentPhaseIndex(0);
    setPhaseProgress(0);
    setCompletedCycles(0);

    await speakInstruction(
      `Starting ${pattern.name}. ${pattern.phases.length} phase cycle, ${targetCycles} rounds.`
    );
  };

  const handlePause = () => {
    setIsPlaying(false);
    stopSpeaking();
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleReset = () => {
    handlePause();
    setCurrentPhaseIndex(0);
    setPhaseProgress(0);
    setCompletedCycles(0);
    setCountdown(0);
  };

  const toggleMute = () => {
    if (!isMuted) {
      stopSpeaking();
    }
    setIsMuted(!isMuted);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Visualizer */}
      <div className="mb-8">
        <BreathVisualizer
          phase={isPlaying ? (currentPhase?.type || "idle") : "idle"}
          volume={isPlaying ? phaseProgress : 0}
          targetPhase={currentPhase?.type}
          progress={phaseProgress}
          size={280}
        />
      </div>

      {/* Current Instruction */}
      <div className="text-center mb-6 h-20">
        {isPlaying && currentPhase ? (
          <>
            <p className="text-2xl font-semibold text-gray-800">
              {currentPhase.instruction}
            </p>
            <p className="text-4xl font-bold text-sage-600 mt-2">{countdown}</p>
          </>
        ) : (
          <p className="text-xl text-gray-500">Press play to begin</p>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center gap-6 mb-8">
        <div className="text-center">
          <p className="text-sm text-gray-500">Cycle</p>
          <p className="text-2xl font-bold text-gray-800">
            {completedCycles + 1} / {targetCycles}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">Phase</p>
          <p className="text-2xl font-bold text-gray-800">
            {currentPhaseIndex + 1} / {pattern.phases.length}
          </p>
        </div>
      </div>

      {/* Cycle Selector */}
      {!isPlaying && (
        <div className="mb-6">
          <label className="text-sm text-gray-600 block mb-2 text-center">
            Number of cycles
          </label>
          <div className="flex items-center gap-2">
            {[3, 5, 10, 15].map((num) => (
              <button
                key={num}
                onClick={() => setTargetCycles(num)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  targetCycles === num
                    ? "bg-sage-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMute}
          className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6" />
          ) : (
            <Volume2 className="w-6 h-6" />
          )}
        </button>

        <button
          onClick={isPlaying ? handlePause : handleStart}
          className="p-5 bg-sage-600 hover:bg-sage-700 text-white rounded-full shadow-lg transition-colors"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>

        <button
          onClick={handleReset}
          className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
      </div>

      {/* Phase Legend */}
      <div className="mt-8 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600">Inhale</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-gray-600">Hold</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-600">Exhale</span>
        </div>
      </div>
    </div>
  );
}
