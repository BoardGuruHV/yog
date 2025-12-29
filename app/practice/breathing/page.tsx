"use client";

import { useState } from "react";
import { Wind, Info, ChevronDown, Star } from "lucide-react";
import dynamic from "next/dynamic";
import { BREATHING_PATTERNS, BreathingPattern } from "@/lib/audio/breath-detector";

// Dynamic import for client-only components
const BreathGuide = dynamic(
  () => import("@/components/breathing/BreathGuide"),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-sage-500 border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export default function BreathingPracticePage() {
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern>(
    BREATHING_PATTERNS[0]
  );
  const [showTips, setShowTips] = useState(false);

  const getDifficultyColor = (difficulty: BreathingPattern["difficulty"]) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-700";
      case "intermediate":
        return "bg-amber-100 text-amber-700";
      case "advanced":
        return "bg-red-100 text-red-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
            <Wind className="w-4 h-4" />
            <span className="text-sm font-medium">Pranayama Practice</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Breathing Exercises
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Master your breath with guided pranayama techniques. Improve focus,
            reduce stress, and enhance your yoga practice.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Pattern Selector */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-gray-800 mb-4">
              Choose a Technique
            </h3>
            <div className="space-y-3">
              {BREATHING_PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setSelectedPattern(pattern)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedPattern.id === pattern.id
                      ? "border-sage-500 bg-sage-50 shadow-md"
                      : "border-gray-200 hover:border-sage-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <h4 className="font-medium text-gray-800">{pattern.name}</h4>
                      <p className="text-sm text-gray-500">{pattern.sanskritName}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(
                        pattern.difficulty
                      )}`}
                    >
                      {pattern.difficulty}
                    </span>
                  </div>

                  {/* Phase preview */}
                  <div className="flex items-center gap-1 mt-3">
                    {pattern.phases.map((phase, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 text-xs text-gray-500"
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            phase.type === "inhale"
                              ? "bg-green-500"
                              : phase.type === "exhale"
                              ? "bg-blue-500"
                              : "bg-amber-500"
                          }`}
                        />
                        <span>{phase.duration}s</span>
                        {idx < pattern.phases.length - 1 && (
                          <span className="mx-1">→</span>
                        )}
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Practice Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              {/* Pattern Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedPattern.name}
                </h2>
                <p className="text-sage-600">{selectedPattern.sanskritName}</p>
                <p className="text-gray-600 mt-2 max-w-md mx-auto">
                  {selectedPattern.description}
                </p>
              </div>

              {/* Breath Guide */}
              <BreathGuide
                pattern={selectedPattern}
                onComplete={(cycles) => {
                  console.log(`Completed ${cycles} cycles`);
                }}
              />

              {/* Benefits */}
              <div className="mt-8 pt-6 border-t">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  Benefits
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedPattern.benefits.map((benefit, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-sage-50 text-sage-700 rounded-full text-sm"
                    >
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-6">
              <button
                onClick={() => setShowTips(!showTips)}
                className="flex items-center gap-2 text-gray-700 font-medium"
              >
                <Info className="w-5 h-5" />
                Breathing Tips
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showTips ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showTips && (
                <div className="mt-4 bg-blue-50 rounded-xl p-6 space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm font-medium">1</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Sit comfortably
                        </p>
                        <p className="text-sm text-gray-600">
                          Keep your spine straight and shoulders relaxed
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm font-medium">2</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Breathe through your nose
                        </p>
                        <p className="text-sm text-gray-600">
                          Unless the technique specifies otherwise
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm font-medium">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Don&apos;t force it
                        </p>
                        <p className="text-sm text-gray-600">
                          If you feel dizzy, return to normal breathing
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 text-sm font-medium">4</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          Practice regularly
                        </p>
                        <p className="text-sm text-gray-600">
                          Even 5 minutes daily builds the habit
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-blue-100">
                    <p className="text-sm text-blue-700">
                      <strong>Note:</strong> If you have high blood pressure,
                      heart conditions, or are pregnant, consult a healthcare
                      provider before practicing advanced breathing techniques.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
