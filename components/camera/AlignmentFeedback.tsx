"use client";

import { PoseFeedback, getScoreColor, getStatusEmoji } from "@/lib/pose/feedback";
import { CheckCircle, AlertCircle, XCircle, Target } from "lucide-react";

interface AlignmentFeedbackProps {
  feedback: PoseFeedback | null;
  isLoading?: boolean;
}

export default function AlignmentFeedback({
  feedback,
  isLoading,
}: AlignmentFeedbackProps) {
  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 animate-pulse" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded-sm animate-pulse w-32 mb-2" />
            <div className="h-3 bg-gray-100 rounded-sm animate-pulse w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3 text-gray-500">
          <Target className="w-8 h-8" />
          <div>
            <p className="font-medium">Position yourself in frame</p>
            <p className="text-sm">Stand back so your full body is visible</p>
          </div>
        </div>
      </div>
    );
  }

  const scoreColor = getScoreColor(feedback.overallScore);
  const emoji = getStatusEmoji(feedback.status);

  const StatusIcon = () => {
    switch (feedback.status) {
      case "excellent":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "good":
        return <CheckCircle className="w-6 h-6 text-lime-500" />;
      case "needs_work":
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case "poor":
        return <XCircle className="w-6 h-6 text-red-500" />;
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg space-y-4">
      {/* Score and Status */}
      <div className="flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: scoreColor }}
        >
          {feedback.overallScore}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <StatusIcon />
            <span className="font-semibold text-gray-800 capitalize">
              {feedback.status.replace("_", " ")} {emoji}
            </span>
          </div>
          <p className="text-gray-600 mt-1">{feedback.primaryMessage}</p>
        </div>
      </div>

      {/* Corrections */}
      {feedback.corrections.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Adjustments:</p>
          <ul className="space-y-1">
            {feedback.corrections.map((correction, index) => (
              <li
                key={index}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    correction.priority === 1 ? "bg-red-400" : "bg-yellow-400"
                  }`}
                />
                {correction.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Encouragement */}
      <div className="bg-sage-50 rounded-lg p-3">
        <p className="text-sm text-sage-700">{feedback.encouragement}</p>
      </div>
    </div>
  );
}
