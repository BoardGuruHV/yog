"use client";

import { useState } from "react";
import { Snowflake, AlertTriangle, Check } from "lucide-react";

interface StreakFreezeButtonProps {
  freezesLeft: number;
  currentStreak: number;
  onFreezeUsed: () => void;
}

export default function StreakFreezeButton({
  freezesLeft,
  currentStreak,
  onFreezeUsed,
}: StreakFreezeButtonProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFreeze = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/streak/freeze", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to use freeze");
      }

      setSuccess(true);
      setIsConfirming(false);
      onFreezeUsed();

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsConfirming(false);
    setError(null);
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Check className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="font-medium text-green-900">Freeze Used!</div>
            <div className="text-sm text-green-700">
              Your {currentStreak}-day streak is protected
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStreak === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
          <Snowflake className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="font-medium text-blue-900">Streak Freeze</div>
          <div className="text-sm text-blue-700 mb-3">
            Missed yesterday? Use a freeze to protect your {currentStreak}-day
            streak.
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 mb-3 p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          {isConfirming ? (
            <div className="space-y-2">
              <div className="text-sm text-blue-800 bg-blue-100 p-2 rounded-lg">
                Are you sure? This will use 1 of your {freezesLeft} remaining
                freezes.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleFreeze}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Using..." : "Confirm Freeze"}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleFreeze}
              disabled={freezesLeft === 0}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {freezesLeft === 0
                ? "No Freezes Left"
                : `Use Freeze (${freezesLeft} left)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
