"use client";

import { useState } from "react";
import {
  Clock,
  Timer,
  Repeat,
  Play,
  Zap,
  Coffee,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface IntervalConfig {
  workDuration: number; // seconds
  restDuration: number; // seconds
  rounds: number;
  restPose: "childs" | "mountain" | "corpse" | "easy";
}

interface IntervalSettingsProps {
  config: IntervalConfig;
  onChange: (config: IntervalConfig) => void;
  onStart: () => void;
}

const restPoseOptions = [
  { id: "childs", label: "Child's Pose", sanskrit: "Balasana" },
  { id: "mountain", label: "Mountain Pose", sanskrit: "Tadasana" },
  { id: "corpse", label: "Corpse Pose", sanskrit: "Savasana" },
  { id: "easy", label: "Easy Pose", sanskrit: "Sukhasana" },
];

const workDurationOptions = [
  { value: 30, label: "30 sec" },
  { value: 45, label: "45 sec" },
  { value: 60, label: "1 min" },
  { value: 90, label: "1.5 min" },
  { value: 120, label: "2 min" },
];

const restDurationOptions = [
  { value: 10, label: "10 sec" },
  { value: 15, label: "15 sec" },
  { value: 20, label: "20 sec" },
  { value: 30, label: "30 sec" },
  { value: 45, label: "45 sec" },
  { value: 60, label: "1 min" },
];

const roundOptions = [3, 4, 5, 6, 8, 10, 12];

export default function IntervalSettings({
  config,
  onChange,
  onStart,
}: IntervalSettingsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const totalDuration = (config.workDuration + config.restDuration) * config.rounds;
  const totalMinutes = Math.floor(totalDuration / 60);
  const totalSeconds = totalDuration % 60;

  const updateConfig = (updates: Partial<IntervalConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Interval Training</h2>
            <p className="text-orange-100 text-sm">
              High-intensity yoga intervals
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Work Duration */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Timer className="w-4 h-4 text-orange-500" />
            Work Duration
          </label>
          <div className="grid grid-cols-5 gap-2">
            {workDurationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateConfig({ workDuration: option.value })}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  config.workDuration === option.value
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rest Duration */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Coffee className="w-4 h-4 text-blue-500" />
            Rest Duration
          </label>
          <div className="grid grid-cols-6 gap-2">
            {restDurationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => updateConfig({ restDuration: option.value })}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  config.restDuration === option.value
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rounds */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
            <Repeat className="w-4 h-4 text-green-500" />
            Number of Rounds
          </label>
          <div className="grid grid-cols-7 gap-2">
            {roundOptions.map((rounds) => (
              <button
                key={rounds}
                onClick={() => updateConfig({ rounds })}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  config.rounds === rounds
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {rounds}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          Advanced Settings
        </button>

        {/* Advanced Settings */}
        {showAdvanced && (
          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rest Pose
            </label>
            <div className="grid grid-cols-2 gap-2">
              {restPoseOptions.map((pose) => (
                <button
                  key={pose.id}
                  onClick={() =>
                    updateConfig({ restPose: pose.id as IntervalConfig["restPose"] })
                  }
                  className={`py-3 px-4 rounded-lg text-left transition-colors ${
                    config.restPose === pose.id
                      ? "bg-sage-100 border-2 border-sage-500"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  }`}
                >
                  <p className="font-medium text-gray-900">{pose.label}</p>
                  <p className="text-xs text-gray-500">{pose.sanskrit}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Duration</span>
            <span className="text-lg font-bold text-gray-900">
              {totalMinutes > 0 && `${totalMinutes}m `}
              {totalSeconds > 0 && `${totalSeconds}s`}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              {config.rounds} rounds × ({config.workDuration}s work + {config.restDuration}s rest)
            </span>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Play className="w-5 h-5" />
          Start Interval Training
        </button>
      </div>
    </div>
  );
}
