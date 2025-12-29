"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Clock,
  Play,
  Info,
} from "lucide-react";
import MeditationPicker from "@/components/meditation/MeditationPicker";
import MeditationTimer from "@/components/meditation/MeditationTimer";
import {
  MeditationStyle,
  MEDITATION_STYLES,
  DURATION_OPTIONS,
} from "@/types/meditation";

type Mode = "setup" | "active" | "complete";

export default function MeditationPage() {
  const [mode, setMode] = useState<Mode>("setup");
  const [selectedStyle, setSelectedStyle] = useState<MeditationStyle | null>(
    MEDITATION_STYLES[0]
  );
  const [duration, setDuration] = useState(10);

  const handleStart = () => {
    if (!selectedStyle) return;
    setMode("active");
  };

  const handleComplete = () => {
    setMode("complete");
  };

  const handleExit = () => {
    setMode("setup");
  };

  const handleNewSession = () => {
    setMode("setup");
  };

  // Active meditation
  if (mode === "active" && selectedStyle) {
    return (
      <MeditationTimer
        style={selectedStyle}
        duration={duration}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    );
  }

  // Completion screen
  if (mode === "complete" && selectedStyle) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-b ${selectedStyle.gradient} flex flex-col items-center justify-center text-white p-8`}
      >
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🧘</div>
          <h1 className="text-3xl font-bold mb-4">Session Complete</h1>
          <p className="text-xl text-white/80 mb-2">
            You meditated for {duration} minutes
          </p>
          <p className="text-white/60 mb-8">
            Regular practice builds lasting peace and clarity
          </p>

          <div className="space-y-3">
            <button
              onClick={handleNewSession}
              className="w-full px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
            >
              New Session
            </button>
            <Link
              href="/"
              className="block w-full px-6 py-3 bg-white text-gray-700 rounded-xl font-semibold hover:bg-white/90 transition-colors text-center"
            >
              Back to Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Setup screen
  return (
    <div className="min-h-screen bg-gradient-to-b from-yoga-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Meditation</h1>
              <p className="text-purple-200 mt-1">
                Find stillness and peace with guided meditation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Meditation Style Picker */}
        <MeditationPicker selected={selectedStyle} onSelect={setSelectedStyle} />

        {/* Duration Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Duration</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setDuration(option.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  duration === option.value
                    ? "bg-purple-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Style Details */}
        {selectedStyle && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div
              className={`bg-gradient-to-r ${selectedStyle.gradient} text-white p-6`}
            >
              <h3 className="text-xl font-bold mb-2">{selectedStyle.name}</h3>
              <p className="text-white/80">{selectedStyle.description}</p>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-2 mb-4">
                <Info className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    How to Practice
                  </h4>
                  <ol className="space-y-2">
                    {selectedStyle.instructions.map((instruction, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-sm text-gray-600"
                      >
                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 flex-shrink-0">
                          {index + 1}
                        </span>
                        {instruction}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStyle.benefits.map((benefit) => (
                    <span
                      key={benefit}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!selectedStyle}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedStyle
              ? `bg-gradient-to-r ${selectedStyle.gradient} text-white`
              : "bg-gray-300 text-gray-500"
          }`}
        >
          <Play className="w-5 h-5" />
          Begin {duration} Minute Meditation
        </button>

        {/* Tips */}
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-100">
          <h3 className="font-semibold text-gray-900 mb-3">
            Tips for a Great Session
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              Find a quiet, comfortable space where you won&apos;t be disturbed
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              Sit or lie in a position that allows you to relax fully
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              Start with shorter sessions and gradually increase duration
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500">•</span>
              Be patient with yourself - wandering thoughts are normal
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
