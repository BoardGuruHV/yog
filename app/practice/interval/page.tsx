"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Zap,
  Plus,
  X,
  Shuffle,
  Loader2,
} from "lucide-react";
import IntervalSettings, {
  IntervalConfig,
} from "@/components/interval/IntervalSettings";
import IntervalTimer from "@/components/interval/IntervalTimer";
import { Asana } from "@/types";

type Mode = "setup" | "active" | "complete";

// Categories that work well for interval training
const INTERVAL_CATEGORIES = [
  "STANDING",
  "BALANCE",
  "PRONE",
];

export default function IntervalPracticePage() {
  const [mode, setMode] = useState<Mode>("setup");
  const [allAsanas, setAllAsanas] = useState<Asana[]>([]);
  const [selectedPoses, setSelectedPoses] = useState<Asana[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<IntervalConfig>({
    workDuration: 45,
    restDuration: 15,
    rounds: 5,
    restPose: "childs",
  });

  // Fetch asanas suitable for interval training
  useEffect(() => {
    async function fetchAsanas() {
      try {
        const response = await fetch("/api/asanas");
        if (response.ok) {
          const data = await response.json();
          // Filter for poses that work well in intervals (moderate+ intensity)
          const intervalAsanas = data.filter(
            (a: Asana) =>
              INTERVAL_CATEGORIES.includes(a.category) && a.difficulty >= 2
          );
          setAllAsanas(intervalAsanas);

          // Auto-select some poses to start
          const initial = intervalAsanas.slice(0, 4);
          setSelectedPoses(initial);
        }
      } catch (error) {
        console.error("Error fetching asanas:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchAsanas();
  }, []);

  const handleAddPose = (asana: Asana) => {
    if (!selectedPoses.find((p) => p.id === asana.id)) {
      setSelectedPoses([...selectedPoses, asana]);
    }
  };

  const handleRemovePose = (asanaId: string) => {
    setSelectedPoses(selectedPoses.filter((p) => p.id !== asanaId));
  };

  const handleShuffle = () => {
    const shuffled = [...allAsanas].sort(() => Math.random() - 0.5);
    setSelectedPoses(shuffled.slice(0, Math.min(config.rounds, shuffled.length)));
  };

  const handleStart = () => {
    if (selectedPoses.length === 0) return;
    setMode("active");
  };

  const handleComplete = () => {
    setMode("complete");
  };

  const handleExit = () => {
    setMode("setup");
  };

  const handleReset = () => {
    setMode("setup");
  };

  // Active timer mode
  if (mode === "active") {
    return (
      <IntervalTimer
        config={config}
        poses={selectedPoses}
        onComplete={handleComplete}
        onExit={handleExit}
      />
    );
  }

  // Completion screen
  if (mode === "complete") {
    return (
      <div className="min-h-screen bg-linear-to-b from-green-600 to-emerald-700 flex flex-col items-center justify-center text-white p-8">
        <div className="text-8xl mb-6">🎉</div>
        <h1 className="text-4xl font-bold mb-4">Workout Complete!</h1>
        <p className="text-xl text-green-100 mb-8 text-center">
          You crushed {config.rounds} rounds of interval training
        </p>
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors"
          >
            New Workout
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-white text-green-700 rounded-xl font-semibold hover:bg-green-50 transition-colors"
          >
            Back to Library
          </Link>
        </div>
      </div>
    );
  }

  // Setup screen
  return (
    <div className="min-h-screen bg-linear-to-b from-yoga-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-100 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Interval Training
              </h1>
              <p className="text-orange-100 mt-1">
                High-intensity yoga with timed work and rest intervals
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Settings */}
          <IntervalSettings
            config={config}
            onChange={setConfig}
            onStart={handleStart}
          />

          {/* Pose Selection */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Selected Poses
                </h2>
                <button
                  onClick={handleShuffle}
                  className="flex items-center gap-1 text-sm text-sage-600 hover:text-sage-700"
                >
                  <Shuffle className="w-4 h-4" />
                  Shuffle
                </button>
              </div>
              <p className="text-sm text-gray-500">
                Choose poses for your work intervals. Poses will cycle through each round.
              </p>
            </div>

            {/* Selected Poses */}
            <div className="p-4 border-b border-gray-100 min-h-[120px]">
              {selectedPoses.length === 0 ? (
                <p className="text-center text-gray-400 py-4">
                  No poses selected. Add some below.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedPoses.map((pose) => (
                    <div
                      key={pose.id}
                      className="flex items-center gap-2 pl-2 pr-1 py-1 bg-orange-50 border border-orange-200 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center">
                        <Image
                          src={pose.svgPath}
                          alt={pose.nameEnglish}
                          width={24}
                          height={24}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {pose.nameEnglish}
                      </span>
                      <button
                        onClick={() => handleRemovePose(pose.id)}
                        className="p-1 hover:bg-orange-100 rounded-sm"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Available Poses */}
            <div className="p-4 max-h-[300px] overflow-y-auto">
              <p className="text-xs text-gray-500 mb-3 uppercase tracking-wider">
                Available Poses
              </p>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {allAsanas
                    .filter((a) => !selectedPoses.find((p) => p.id === a.id))
                    .map((asana) => (
                      <button
                        key={asana.id}
                        onClick={() => handleAddPose(asana)}
                        className="flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                      >
                        <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center shrink-0">
                          <Image
                            src={asana.svgPath}
                            alt={asana.nameEnglish}
                            width={24}
                            height={24}
                          />
                        </div>
                        <span className="text-sm text-gray-700 truncate">
                          {asana.nameEnglish}
                        </span>
                        <Plus className="w-4 h-4 text-gray-400 ml-auto shrink-0" />
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-linear-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-100">
          <h3 className="font-semibold text-gray-900 mb-2">
            How Interval Training Works
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-orange-500">•</span>
              <span>
                <strong>Work phase:</strong> Hold each pose with full engagement
                for the work duration
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              <span>
                <strong>Rest phase:</strong> Recover in your chosen rest pose
                before the next round
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">•</span>
              <span>
                <strong>Audio cues:</strong> Beeps signal phase transitions and
                countdown warnings
              </span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
