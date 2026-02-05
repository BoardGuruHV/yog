"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle, ArrowLeft, Play, Clock, Layers } from "lucide-react";
import PracticeTimer from "@/components/timer/PracticeTimer";
import { Program } from "@/types";
import { formatTime } from "@/lib/timer/engine";

type PageState = "loading" | "ready" | "practicing" | "error";

export default function PracticeTimerPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.programId as string;

  const [state, setState] = useState<PageState>("loading");
  const [program, setProgram] = useState<Program | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProgram();
  }, [programId]);

  const fetchProgram = async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/programs/${programId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Program not found");
        } else {
          setError("Failed to load program");
        }
        setState("error");
        return;
      }
      const data = await res.json();
      setProgram(data);
      setState("ready");
    } catch (err) {
      setError("Failed to load program");
      setState("error");
    }
  };

  const startPractice = () => {
    setState("practicing");
  };

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {error || "Something went wrong"}
        </h1>
        <Link
          href="/program"
          className="flex items-center gap-2 text-sage-600 hover:text-sage-700 font-medium mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Programs
        </Link>
      </div>
    );
  }

  // Practicing state - full screen timer
  if (state === "practicing" && program) {
    return (
      <PracticeTimer
        programId={program.id}
        programName={program.name}
        asanas={program.asanas}
      />
    );
  }

  // Ready state - show program info and start button
  if (state === "ready" && program) {
    const totalDuration = program.asanas.reduce((sum, a) => sum + a.duration, 0);

    return (
      <div className="min-h-screen bg-linear-to-b from-sage-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Back link */}
          <Link
            href="/program"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            All Programs
          </Link>

          {/* Program info card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
            {/* Header */}
            <div className="relative h-40 bg-linear-to-br from-sage-500 to-sage-700 flex items-center justify-center">
              <div className="text-center text-white px-4">
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  {program.name}
                </h1>
                {program.description && (
                  <p className="text-white/80 text-sm max-w-md mx-auto">
                    {program.description}
                  </p>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-sage-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-sage-700 mb-1">
                    <Layers className="w-5 h-5" />
                    <span className="text-2xl font-bold">
                      {program.asanas.length}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Poses</p>
                </div>
                <div className="text-center p-4 bg-sage-50 rounded-xl">
                  <div className="flex items-center justify-center gap-2 text-sage-700 mb-1">
                    <Clock className="w-5 h-5" />
                    <span className="text-2xl font-bold">
                      {formatTime(totalDuration)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Duration</p>
                </div>
              </div>

              {/* Pose list preview */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Sequence Preview
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {program.asanas.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="w-6 h-6 flex items-center justify-center text-sm font-medium text-gray-400">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">
                          {item.asana?.nameEnglish}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatTime(item.duration)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="mb-6 p-4 bg-amber-50 rounded-xl">
                <h4 className="font-medium text-amber-800 mb-2">
                  Practice Tips
                </h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• Find a quiet space where you won&apos;t be disturbed</li>
                  <li>• Use a yoga mat for comfort and stability</li>
                  <li>• Listen to your body and modify poses as needed</li>
                  <li>• Keep water nearby to stay hydrated</li>
                </ul>
              </div>

              {/* Start button */}
              <button
                onClick={startPractice}
                className="w-full flex items-center justify-center gap-2 py-4 bg-sage-600 text-white rounded-xl hover:bg-sage-700 transition-colors font-semibold text-lg"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Start Practice
              </button>

              {/* Keyboard shortcuts */}
              <p className="text-center text-gray-400 text-xs mt-4">
                Use keyboard shortcuts during practice: Space (play/pause), Arrow keys (skip), R (reset)
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
