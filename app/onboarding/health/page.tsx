"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Shield,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  SkipForward,
} from "lucide-react";
import ConditionSelector from "@/components/health/ConditionSelector";

interface UserCondition {
  conditionId: string;
  severity: string | null;
  notes: string | null;
  isActive: boolean;
}

export default function HealthOnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [conditions, setConditions] = useState<UserCondition[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/onboarding/health");
    }
  }, [status, router]);

  // Fetch existing conditions if any
  useEffect(() => {
    const fetchExistingConditions = async () => {
      if (status !== "authenticated") return;

      setIsLoading(true);
      try {
        const response = await fetch("/api/user/conditions");
        if (response.ok) {
          const data = await response.json();
          if (data.conditions && data.conditions.length > 0) {
            setConditions(
              data.conditions.map((c: { conditionId: string; severity: string | null; notes: string | null; isActive: boolean }) => ({
                conditionId: c.conditionId,
                severity: c.severity,
                notes: c.notes,
                isActive: c.isActive,
              }))
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch existing conditions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExistingConditions();
  }, [status]);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/user/conditions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conditions }),
      });

      if (!response.ok) {
        throw new Error("Failed to save conditions");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error) {
      setError("Failed to save your health information. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-sage-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-b from-sage-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Health Profile Saved!
          </h2>
          <p className="text-gray-600">
            Redirecting you to the asana library...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-sage-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Skip button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1"
          >
            Skip for now
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 w-16 rounded-full transition-colors ${
                s <= step ? "bg-sage-500" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Introduction */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xs border border-sage-100 p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-sage-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Your Health Profile
              </h1>
              <p className="text-gray-600">
                Help us personalize your yoga practice by sharing any health
                conditions or concerns.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3 p-4 bg-sage-50 rounded-lg">
                <Shield className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">
                    Safe Practice Recommendations
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    We&apos;ll flag poses that may not be suitable for your
                    conditions and suggest modifications.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-sage-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">
                    Visual Warnings
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Contraindicated poses will be clearly marked with warning
                    badges throughout the app.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-sage-50 rounded-lg">
                <Info className="w-5 h-5 text-sage-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-800">
                    Your Privacy Matters
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Your health information is private and never shared. You can
                    update or remove it at any time.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 bg-sage-600 text-white py-3 px-4 rounded-lg hover:bg-sage-700 transition-colors font-medium"
            >
              Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: Condition Selection */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xs border border-sage-100 p-8">
            <div className="mb-6">
              <button
                onClick={() => setStep(1)}
                className="text-sage-600 hover:text-sage-700 flex items-center gap-1 text-sm mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                Select Your Conditions
              </h1>
              <p className="text-gray-600">
                Choose any conditions that apply to you. You can update this
                later in your profile.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <ConditionSelector
              selectedConditions={conditions}
              onConditionsChange={setConditions}
              showSeverity={true}
              showNotes={true}
            />

            <div className="mt-8 flex gap-3">
              <button
                onClick={handleSkip}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
              >
                Skip
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 bg-sage-600 text-white py-3 px-4 rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 font-medium"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save & Continue
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Footer note */}
        <p className="text-center text-sm text-gray-500 mt-6">
          You can always update your health profile from your{" "}
          <Link href="/profile" className="text-sage-600 hover:text-sage-700">
            account settings
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
