"use client";

import { Clock, Gauge } from "lucide-react";

interface StepDurationProps {
  duration: number;
  difficulty: number;
  experienceLevel: string;
  onDurationChange: (duration: number) => void;
  onDifficultyChange: (difficulty: number) => void;
  onExperienceChange: (level: string) => void;
}

const DURATIONS = [
  { value: 10, label: "10 min", description: "Quick session" },
  { value: 20, label: "20 min", description: "Short practice" },
  { value: 30, label: "30 min", description: "Standard session" },
  { value: 45, label: "45 min", description: "Extended practice" },
  { value: 60, label: "60 min", description: "Full session" },
  { value: 90, label: "90 min", description: "Deep practice" },
];

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", description: "New to yoga" },
  { value: "intermediate", label: "Intermediate", description: "Regular practice" },
  { value: "advanced", label: "Advanced", description: "Experienced practitioner" },
];

const DIFFICULTY_LABELS = ["Gentle", "Easy", "Moderate", "Challenging", "Advanced"];

export default function StepDuration({
  duration,
  difficulty,
  experienceLevel,
  onDurationChange,
  onDifficultyChange,
  onExperienceChange,
}: StepDurationProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          Customize your practice
        </h2>
        <p className="text-gray-500 mt-1">Set duration and intensity</p>
      </div>

      {/* Duration Selection */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-sage-600" />
          <h3 className="font-medium text-gray-700">Duration</h3>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.value}
              onClick={() => onDurationChange(d.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                duration === d.value
                  ? "border-sage-500 bg-sage-50"
                  : "border-gray-200 hover:border-sage-300"
              }`}
            >
              <div className="font-semibold text-gray-800">{d.label}</div>
              <div className="text-xs text-gray-500">{d.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <h3 className="font-medium text-gray-700 mb-3">Experience Level</h3>
        <div className="grid grid-cols-3 gap-3">
          {EXPERIENCE_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => onExperienceChange(level.value)}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                experienceLevel === level.value
                  ? "border-sage-500 bg-sage-50"
                  : "border-gray-200 hover:border-sage-300"
              }`}
            >
              <div className="font-medium text-gray-800">{level.label}</div>
              <div className="text-sm text-gray-500">{level.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Slider */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Gauge className="w-5 h-5 text-sage-600" />
          <h3 className="font-medium text-gray-700">Intensity</h3>
          <span className="ml-auto text-sage-600 font-medium">
            {DIFFICULTY_LABELS[difficulty - 1]}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={difficulty}
          onChange={(e) => onDifficultyChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sage-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Gentle</span>
          <span>Advanced</span>
        </div>
      </div>
    </div>
  );
}
