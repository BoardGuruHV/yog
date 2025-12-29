"use client";

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  X,
} from "lucide-react";

interface TimerControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  canSkipBack: boolean;
  canSkipForward: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  onPlay: () => void;
  onPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onReset: () => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onExit: () => void;
}

export default function TimerControls({
  isPlaying,
  isPaused,
  isCompleted,
  canSkipBack,
  canSkipForward,
  isMuted,
  isFullscreen,
  onPlay,
  onPause,
  onSkipBack,
  onSkipForward,
  onReset,
  onToggleMute,
  onToggleFullscreen,
  onExit,
}: TimerControlsProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Main controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Skip back */}
        <button
          onClick={onSkipBack}
          disabled={!canSkipBack}
          className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Previous pose"
        >
          <SkipBack className="w-6 h-6" />
        </button>

        {/* Play/Pause */}
        {isCompleted ? (
          <button
            onClick={onReset}
            className="p-5 rounded-full bg-white text-sage-700 hover:bg-gray-100 transition-colors shadow-lg"
            title="Restart"
          >
            <RotateCcw className="w-8 h-8" />
          </button>
        ) : isPlaying ? (
          <button
            onClick={onPause}
            className="p-5 rounded-full bg-white text-sage-700 hover:bg-gray-100 transition-colors shadow-lg"
            title="Pause"
          >
            <Pause className="w-8 h-8" />
          </button>
        ) : (
          <button
            onClick={onPlay}
            className="p-5 rounded-full bg-white text-sage-700 hover:bg-gray-100 transition-colors shadow-lg"
            title="Play"
          >
            <Play className="w-8 h-8 ml-1" />
          </button>
        )}

        {/* Skip forward */}
        <button
          onClick={onSkipForward}
          disabled={!canSkipForward || isCompleted}
          className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Next pose"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      {/* Secondary controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Mute toggle */}
        <button
          onClick={onToggleMute}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>

        {/* Fullscreen toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Exit */}
        <button
          onClick={onExit}
          className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          title="Exit practice"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
