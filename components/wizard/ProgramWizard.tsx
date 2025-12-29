"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from "lucide-react";
import StepGoals from "./StepGoals";
import StepDuration from "./StepDuration";
import StepConditions from "./StepConditions";
import StepPreview from "./StepPreview";
import { useProgram } from "@/context/ProgramContext";

interface Condition {
  id: string;
  name: string;
  description: string | null;
}

interface GeneratedProgram {
  name: string;
  description: string;
  asanaSequence: {
    asanaId: string;
    duration: number;
    notes?: string;
    asana: {
      id: string;
      englishName: string;
      sanskritName: string;
      category: string;
      difficulty: number;
      imagePath: string | null;
    } | null;
  }[];
  totalDuration: number;
  warmupIncluded: boolean;
  cooldownIncluded: boolean;
}

const STEPS = ["Goals", "Duration", "Conditions", "Preview"];

export default function ProgramWizard() {
  const router = useRouter();
  const { loadProgram } = useProgram();
  const [currentStep, setCurrentStep] = useState(0);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedProgram, setGeneratedProgram] = useState<GeneratedProgram | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    goals: [] as string[],
    duration: 30,
    difficulty: 2,
    experienceLevel: "beginner",
    conditions: [] as string[],
    focusAreas: [] as string[],
  });

  // Fetch conditions on mount
  useEffect(() => {
    async function fetchConditions() {
      try {
        const response = await fetch("/api/conditions");
        if (response.ok) {
          const data = await response.json();
          setConditions(data);
        }
      } catch (err) {
        console.error("Failed to fetch conditions:", err);
      }
    }
    fetchConditions();
  }, []);

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.goals.length > 0;
      case 1:
        return formData.duration >= 5;
      case 2:
        return true; // Conditions are optional
      case 3:
        return generatedProgram !== null;
      default:
        return false;
    }
  };

  const generateProgram = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ai/generate-program", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate program");
      }

      const program = await response.json();
      setGeneratedProgram(program);
    } catch (err: any) {
      setError(err.message || "Failed to generate program");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentStep === 2) {
      // Moving to preview - generate program
      await generateProgram();
      setCurrentStep(3);
    } else if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      if (currentStep === 3) {
        setGeneratedProgram(null);
      }
    }
  };

  const handleSave = async () => {
    if (!generatedProgram) return;

    setIsSaving(true);

    try {
      // Create the program via API
      const response = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: generatedProgram.name,
          description: generatedProgram.description,
          asanas: generatedProgram.asanaSequence
            .filter((item) => item.asana)
            .map((item, index) => ({
              asanaId: item.asanaId,
              order: index,
              duration: item.duration,
              notes: item.notes,
            })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save program");
      }

      const savedProgram = await response.json();

      // Load into context
      loadProgram({
        id: savedProgram.id,
        name: savedProgram.name,
        description: savedProgram.description || "",
        asanas: savedProgram.asanas.map((pa: any) => ({
          id: pa.id,
          programId: savedProgram.id,
          asanaId: pa.asanaId,
          asana: pa.asana,
          duration: pa.duration,
          notes: pa.notes,
          order: pa.order,
        })),
        totalDuration: savedProgram.totalDuration || 0,
      });

      // Navigate to program page
      router.push("/program");
    } catch (err: any) {
      setError(err.message || "Failed to save program");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((step, index) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-medium transition-colors ${
                index < currentStep
                  ? "bg-sage-600 text-white"
                  : index === currentStep
                  ? "bg-sage-100 text-sage-700 border-2 border-sage-600"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 rounded ${
                  index < currentStep ? "bg-sage-600" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Names */}
      <div className="flex justify-between mb-8 px-4">
        {STEPS.map((step, index) => (
          <div
            key={step}
            className={`text-sm font-medium ${
              index === currentStep ? "text-sage-700" : "text-gray-400"
            }`}
          >
            {step}
          </div>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Loading State for Generation */}
      {isLoading && currentStep === 3 && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-sage-200 rounded-full animate-pulse" />
            <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-sage-600 animate-pulse" />
          </div>
          <h3 className="mt-6 text-xl font-medium text-gray-700">
            Creating your personalized program...
          </h3>
          <p className="mt-2 text-gray-500">
            Our AI is crafting the perfect sequence for you
          </p>
        </div>
      )}

      {/* Step Content */}
      {!isLoading && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {currentStep === 0 && (
            <StepGoals
              selectedGoals={formData.goals}
              onChange={(goals) => setFormData({ ...formData, goals })}
            />
          )}

          {currentStep === 1 && (
            <StepDuration
              duration={formData.duration}
              difficulty={formData.difficulty}
              experienceLevel={formData.experienceLevel}
              onDurationChange={(duration) =>
                setFormData({ ...formData, duration })
              }
              onDifficultyChange={(difficulty) =>
                setFormData({ ...formData, difficulty })
              }
              onExperienceChange={(experienceLevel) =>
                setFormData({ ...formData, experienceLevel })
              }
            />
          )}

          {currentStep === 2 && (
            <StepConditions
              conditions={conditions}
              selectedConditions={formData.conditions}
              focusAreas={formData.focusAreas}
              onConditionsChange={(conditions) =>
                setFormData({ ...formData, conditions })
              }
              onFocusAreasChange={(focusAreas) =>
                setFormData({ ...formData, focusAreas })
              }
            />
          )}

          {currentStep === 3 && generatedProgram && (
            <StepPreview
              program={generatedProgram}
              onRegenerate={generateProgram}
              onSave={handleSave}
              isLoading={isLoading}
              isSaving={isSaving}
            />
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      {!isLoading && currentStep !== 3 && (
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-8 py-3 bg-sage-600 text-white rounded-xl hover:bg-sage-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {currentStep === 2 ? (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Program
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
