"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import StepCard, { TutorialStep } from "./StepCard";
import { BreathAnimation } from "./BreathIndicator";

interface TutorialPlayerProps {
  steps: TutorialStep[];
  tips: string[];
  commonErrors: string[];
  asanaName: string;
  asanaImage: string;
  onComplete?: () => void;
}

export default function TutorialPlayer({
  steps,
  tips,
  commonErrors,
  asanaName,
  asanaImage,
  onComplete,
}: TutorialPlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  // Initialize timer when step changes
  useEffect(() => {
    if (currentStep?.duration) {
      setTimeRemaining(currentStep.duration);
    } else {
      setTimeRemaining(null);
    }
  }, [currentStep]);

  // Auto-advance timer
  useEffect(() => {
    if (!isPlaying || timeRemaining === null || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          // Auto-advance to next step
          if (!isLastStep) {
            handleNext();
          } else {
            setIsPlaying(false);
            onComplete?.();
          }
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, timeRemaining, isLastStep]);

  const handleNext = useCallback(() => {
    if (!isLastStep) {
      setCompletedSteps((prev) => new Set(prev).add(currentStepIndex));
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, isLastStep]);

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setCompletedSteps(new Set());
    setIsPlaying(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : `${secs}s`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Player */}
      <div className="lg:col-span-2 space-y-6">
        {/* Progress Bar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <span className="text-sm font-medium text-sage-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-sage-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Current Step Display */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          {/* Header with Image and Breath */}
          <div className="bg-linear-to-br from-sage-50 to-white p-6 flex items-center justify-center gap-8">
            <img
              src={asanaImage}
              alt={asanaName}
              className="w-32 h-32 object-contain"
            />
            {currentStep?.breathCue && (
              <BreathAnimation breathCue={currentStep.breathCue} />
            )}
          </div>

          {/* Step Content */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm font-medium capitalize">
                {currentStep?.phase}
              </span>
              {timeRemaining !== null && (
                <span className="text-2xl font-bold text-gray-800">
                  {formatTime(timeRemaining)}
                </span>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {currentStep?.title}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {currentStep?.instruction}
            </p>
          </div>

          {/* Controls */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleRestart}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Restart"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              <button
                onClick={handlePlayPause}
                className="p-4 bg-sage-600 text-white rounded-full hover:bg-sage-700 transition-colors shadow-lg"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </button>
              <button
                onClick={handleNext}
                disabled={isLastStep}
                className="p-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30"
              >
                <SkipForward className="w-6 h-6" />
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title={soundEnabled ? "Mute" : "Unmute"}
              >
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5" />
                ) : (
                  <VolumeX className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Tips & Common Errors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tips.length > 0 && (
            <div className="bg-green-50 rounded-xl border border-green-100 p-4">
              <h4 className="flex items-center gap-2 font-medium text-green-800 mb-3">
                <Lightbulb className="w-5 h-5" />
                Tips
              </h4>
              <ul className="space-y-2">
                {tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                    <span className="text-green-400 mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {commonErrors.length > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-100 p-4">
              <h4 className="flex items-center gap-2 font-medium text-amber-800 mb-3">
                <AlertCircle className="w-5 h-5" />
                Common Mistakes
              </h4>
              <ul className="space-y-2">
                {commonErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-amber-700">
                    <span className="text-amber-400 mt-1">•</span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Steps List Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4 sticky top-24">
          <h3 className="font-semibold text-gray-800 mb-4">All Steps</h3>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {steps.map((step, index) => (
              <StepCard
                key={step.id}
                step={step}
                isActive={index === currentStepIndex}
                isCompleted={completedSteps.has(index)}
                onClick={() => handleStepClick(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
