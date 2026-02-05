"use client";

import { Clock, Check } from "lucide-react";
import BreathIndicator from "./BreathIndicator";

export interface TutorialStep {
  id: string;
  order: number;
  phase: string;
  title: string;
  instruction: string;
  breathCue: string | null;
  duration: number | null;
  imagePath: string | null;
}

interface StepCardProps {
  step: TutorialStep;
  isActive: boolean;
  isCompleted: boolean;
  onClick?: () => void;
}

const PHASE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  preparation: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
  },
  entry: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  hold: {
    bg: "bg-sage-50",
    text: "text-sage-600",
    border: "border-sage-200",
  },
  exit: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
  },
};

const PHASE_LABELS: Record<string, string> = {
  preparation: "Preparation",
  entry: "Entry",
  hold: "Hold",
  exit: "Exit",
};

export default function StepCard({
  step,
  isActive,
  isCompleted,
  onClick,
}: StepCardProps) {
  const phaseStyle = PHASE_COLORS[step.phase] || PHASE_COLORS.preparation;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-xl border-2 transition-all
        ${isActive
          ? `${phaseStyle.border} ${phaseStyle.bg} shadow-md`
          : isCompleted
          ? "border-gray-100 bg-gray-50 opacity-75"
          : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-xs"
        }
      `}
    >
      <div className="flex items-start gap-4">
        {/* Step Number / Check */}
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm
            ${isCompleted
              ? "bg-green-500 text-white"
              : isActive
              ? `${phaseStyle.bg} ${phaseStyle.text} ring-2 ring-offset-2 ${phaseStyle.border.replace("border", "ring-3")}`
              : "bg-gray-100 text-gray-500"
            }
          `}
        >
          {isCompleted ? <Check className="w-4 h-4" /> : step.order}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded-sm text-xs font-medium ${phaseStyle.bg} ${phaseStyle.text}`}
            >
              {PHASE_LABELS[step.phase] || step.phase}
            </span>
            {step.duration && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {step.duration}s
              </span>
            )}
          </div>
          <h4 className="font-medium text-gray-800 mb-1">{step.title}</h4>
          <p
            className={`text-sm ${
              isActive ? "text-gray-700" : "text-gray-500 line-clamp-2"
            }`}
          >
            {step.instruction}
          </p>
        </div>

        {/* Breath Cue */}
        {step.breathCue && (
          <div className="shrink-0">
            <BreathIndicator
              breathCue={step.breathCue as "inhale" | "exhale" | "hold"}
              isActive={isActive}
              size="sm"
            />
          </div>
        )}
      </div>
    </button>
  );
}

export function StepCardCompact({
  step,
  isActive,
  isCompleted,
}: Omit<StepCardProps, "onClick">) {
  const phaseStyle = PHASE_COLORS[step.phase] || PHASE_COLORS.preparation;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all
        ${isActive
          ? `${phaseStyle.bg} ${phaseStyle.border} border`
          : isCompleted
          ? "bg-green-50 border border-green-100"
          : "bg-gray-50"
        }
      `}
    >
      <div
        className={`
          w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
          ${isCompleted
            ? "bg-green-500 text-white"
            : isActive
            ? `${phaseStyle.text} bg-white`
            : "bg-gray-200 text-gray-500"
          }
        `}
      >
        {isCompleted ? <Check className="w-3 h-3" /> : step.order}
      </div>
      <span
        className={`text-sm ${
          isActive ? phaseStyle.text : isCompleted ? "text-green-700" : "text-gray-600"
        }`}
      >
        {step.title}
      </span>
    </div>
  );
}
