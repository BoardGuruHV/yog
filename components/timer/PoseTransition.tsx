"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ProgramAsana } from "@/types";
import { ArrowRight } from "lucide-react";

interface PoseTransitionProps {
  currentPose: ProgramAsana;
  nextPose: ProgramAsana;
  transitionDuration: number;
  onTransitionComplete: () => void;
}

export default function PoseTransition({
  currentPose,
  nextPose,
  transitionDuration,
  onTransitionComplete,
}: PoseTransitionProps) {
  const [countdown, setCountdown] = useState(transitionDuration);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTransitionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onTransitionComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-sage-600 to-sage-800 flex items-center justify-center">
      <div className="text-center text-white max-w-4xl mx-auto px-4">
        <p className="text-lg uppercase tracking-wider opacity-80 mb-6">
          Get Ready for Next Pose
        </p>

        <div className="flex items-center justify-center gap-8 mb-8">
          {/* Current pose */}
          <div className="opacity-50">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-2xl flex items-center justify-center mb-3">
              {currentPose.asana?.svgPath && (
                <Image
                  src={currentPose.asana.svgPath}
                  alt={currentPose.asana.nameEnglish}
                  width={100}
                  height={100}
                  className="opacity-80"
                />
              )}
            </div>
            <p className="text-sm opacity-70">
              {currentPose.asana?.nameEnglish}
            </p>
          </div>

          {/* Arrow */}
          <ArrowRight className="w-8 h-8 opacity-60" />

          {/* Next pose */}
          <div>
            <div className="w-40 h-40 md:w-48 md:h-48 bg-white/20 rounded-2xl flex items-center justify-center mb-3 ring-4 ring-white/30">
              {nextPose.asana?.svgPath && (
                <Image
                  src={nextPose.asana.svgPath}
                  alt={nextPose.asana.nameEnglish}
                  width={140}
                  height={140}
                />
              )}
            </div>
            <p className="text-xl font-semibold">
              {nextPose.asana?.nameEnglish}
            </p>
            <p className="text-sm opacity-70 mt-1">
              {nextPose.asana?.nameSanskrit}
            </p>
          </div>
        </div>

        {/* Countdown */}
        <div className="relative inline-block">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(countdown / transitionDuration) * 282.7} 282.7`}
              style={{ transition: "stroke-dasharray 1s linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-bold">{countdown}</span>
          </div>
        </div>

        <p className="mt-6 text-sm opacity-70">
          Transition to {nextPose.asana?.nameEnglish}
        </p>
      </div>
    </div>
  );
}
