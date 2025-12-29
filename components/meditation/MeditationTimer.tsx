"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Pause,
  Play,
  X,
  RotateCcw,
  Bell,
  BellOff,
  Brain,
  Wind,
  Scan,
  Heart,
  Mic,
  Eye,
  LucideIcon,
} from "lucide-react";
import { MeditationStyle } from "@/types/meditation";
import AmbientSounds from "./AmbientSounds";

interface MeditationTimerProps {
  style: MeditationStyle;
  duration: number; // minutes
  onComplete: () => void;
  onExit: () => void;
}

const iconMap: Record<string, LucideIcon> = {
  Brain,
  Wind,
  Scan,
  Heart,
  Mic,
  Eye,
};

export default function MeditationTimer({
  style,
  duration,
  onComplete,
  onExit,
}: MeditationTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [isStarting, setIsStarting] = useState(true);
  const [bellEnabled, setBellEnabled] = useState(true);
  const [ambientSound, setAmbientSound] = useState("silence");
  const [ambientVolume, setAmbientVolume] = useState(0.5);
  const [currentInstruction, setCurrentInstruction] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);

  const Icon = iconMap[style.icon] || Brain;
  const totalSeconds = duration * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  // Play bell sound
  const playBell = useCallback(() => {
    if (!bellEnabled) return;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }

      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      osc.frequency.setValueAtTime(528, ctx.currentTime); // Solfeggio frequency
      osc.frequency.exponentialRampToValueAtTime(264, ctx.currentTime + 2);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 2);
    } catch (e) {
      console.log("Audio not available");
    }
  }, [bellEnabled]);

  // Starting countdown
  useEffect(() => {
    if (isStarting) {
      const timer = setTimeout(() => {
        setIsStarting(false);
        playBell();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isStarting, playBell]);

  // Main timer
  useEffect(() => {
    if (isStarting || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          playBell();
          setTimeout(onComplete, 2000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarting, isPaused, playBell, onComplete]);

  // Cycle through instructions
  useEffect(() => {
    if (isStarting || isPaused || style.instructions.length === 0) return;

    const instructionDuration = (duration * 60) / style.instructions.length;
    const timer = setInterval(() => {
      setCurrentInstruction((prev) => (prev + 1) % style.instructions.length);
    }, instructionDuration * 1000);

    return () => clearInterval(timer);
  }, [isStarting, isPaused, duration, style.instructions]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Reset timer
  const handleReset = () => {
    setTimeLeft(duration * 60);
    setIsPaused(true);
    setCurrentInstruction(0);
  };

  // Starting screen
  if (isStarting) {
    return (
      <div
        className={`fixed inset-0 bg-gradient-to-b ${style.gradient} flex flex-col items-center justify-center text-white`}
      >
        <div className="text-center animate-pulse">
          <Icon className="w-16 h-16 mx-auto mb-4 opacity-70" />
          <p className="text-2xl font-light mb-2">Preparing your meditation</p>
          <p className="text-white/60">Find a comfortable position...</p>
        </div>
      </div>
    );
  }

  // Timer completed
  if (timeLeft === 0) {
    return (
      <div
        className={`fixed inset-0 bg-gradient-to-b ${style.gradient} flex flex-col items-center justify-center text-white p-8`}
      >
        <div className="text-center">
          <div className="text-6xl mb-6">🙏</div>
          <h1 className="text-3xl font-bold mb-4">Namaste</h1>
          <p className="text-xl text-white/80 mb-2">
            You completed {duration} minutes of {style.name.toLowerCase()}
          </p>
          <p className="text-white/60 mb-8">
            Take a moment to appreciate this time you gave yourself
          </p>
          <button
            onClick={onComplete}
            className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
          >
            Finish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-gradient-to-b ${style.gradient} flex flex-col text-white`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={onExit}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBellEnabled(!bellEnabled)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {bellEnabled ? (
              <Bell className="w-5 h-5" />
            ) : (
              <BellOff className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8">
        {/* Style Icon */}
        <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-8">
          <Icon className="w-10 h-10" />
        </div>

        {/* Timer */}
        <div className="text-[6rem] md:text-[8rem] font-light leading-none mb-4 tabular-nums">
          {formatTime(timeLeft)}
        </div>

        {/* Style Name */}
        <p className="text-xl text-white/70 mb-8">{style.name}</p>

        {/* Progress Ring */}
        <div className="relative w-48 h-48 mb-8">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-white/60">
              {Math.round(progress)}% complete
            </p>
          </div>
        </div>

        {/* Current Instruction */}
        <div className="text-center max-w-md mx-auto mb-8 min-h-[60px]">
          <p className="text-lg text-white/80 italic">
            &ldquo;{style.instructions[currentInstruction]}&rdquo;
          </p>
        </div>
      </div>

      {/* Ambient Sound Control */}
      <div className="px-6 pb-4">
        <div className="bg-white/10 rounded-xl p-4">
          <AmbientSounds
            selected={ambientSound}
            onSelect={setAmbientSound}
            isPlaying={!isPaused}
            volume={ambientVolume}
            onVolumeChange={setAmbientVolume}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="p-8 flex items-center justify-center gap-4">
        <button
          onClick={handleReset}
          className="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
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
      </div>

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <Pause className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-xl font-light">Paused</p>
          </div>
        </div>
      )}
    </div>
  );
}
