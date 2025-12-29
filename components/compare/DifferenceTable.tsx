"use client";

import {
  Clock,
  Gauge,
  Target,
  Sparkles,
  Activity,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { CATEGORY_LABELS } from "@/types";

interface AsanaDetail {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  durationSeconds: number;
  benefits: string[];
  targetBodyParts: string[];
  description: string;
}

interface AnatomyData {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  stretchedMuscles: string[];
}

interface DifferenceTableProps {
  pose1: AsanaDetail;
  pose2: AsanaDetail;
  anatomy1?: AnatomyData | null;
  anatomy2?: AnatomyData | null;
}

export default function DifferenceTable({
  pose1,
  pose2,
  anatomy1,
  anatomy2,
}: DifferenceTableProps) {
  const getDifficultyLabel = (difficulty: number) => {
    const labels = ["", "Beginner", "Easy", "Moderate", "Challenging", "Advanced"];
    return labels[difficulty] || "";
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "text-green-600 bg-green-100";
    if (difficulty <= 3) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const formatDuration = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      return `${mins} min`;
    }
    return `${seconds}s`;
  };

  // Find common and unique benefits
  const commonBenefits = pose1.benefits.filter((b) =>
    pose2.benefits.some((b2) => b2.toLowerCase() === b.toLowerCase())
  );
  const uniqueBenefits1 = pose1.benefits.filter(
    (b) => !pose2.benefits.some((b2) => b2.toLowerCase() === b.toLowerCase())
  );
  const uniqueBenefits2 = pose2.benefits.filter(
    (b) => !pose1.benefits.some((b2) => b2.toLowerCase() === b.toLowerCase())
  );

  // Find common and unique body parts
  const commonBodyParts = pose1.targetBodyParts.filter((p) =>
    pose2.targetBodyParts.includes(p)
  );
  const uniqueBodyParts1 = pose1.targetBodyParts.filter(
    (p) => !pose2.targetBodyParts.includes(p)
  );
  const uniqueBodyParts2 = pose2.targetBodyParts.filter(
    (p) => !pose1.targetBodyParts.includes(p)
  );

  // Find common and unique muscles
  const allMuscles1 = anatomy1
    ? [...anatomy1.primaryMuscles, ...anatomy1.secondaryMuscles, ...anatomy1.stretchedMuscles]
    : [];
  const allMuscles2 = anatomy2
    ? [...anatomy2.primaryMuscles, ...anatomy2.secondaryMuscles, ...anatomy2.stretchedMuscles]
    : [];
  const commonMuscles = allMuscles1.filter((m) => allMuscles2.includes(m));
  const uniqueMuscles1 = allMuscles1.filter((m) => !allMuscles2.includes(m));
  const uniqueMuscles2 = allMuscles2.filter((m) => !allMuscles1.includes(m));

  return (
    <div className="space-y-6">
      {/* Basic Attributes Comparison */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Basic Comparison</h3>
        </div>
        <div className="divide-y divide-gray-100">
          {/* Category */}
          <div className="grid grid-cols-3 gap-4 px-6 py-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Category</span>
            </div>
            <div className="text-center">
              <span className="px-3 py-1 rounded-full text-sm bg-sage-100 text-sage-700">
                {CATEGORY_LABELS[pose1.category as keyof typeof CATEGORY_LABELS] || pose1.category}
              </span>
            </div>
            <div className="text-center">
              <span className="px-3 py-1 rounded-full text-sm bg-sage-100 text-sage-700">
                {CATEGORY_LABELS[pose2.category as keyof typeof CATEGORY_LABELS] || pose2.category}
              </span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="grid grid-cols-3 gap-4 px-6 py-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Gauge className="w-4 h-4" />
              <span className="text-sm font-medium">Difficulty</span>
            </div>
            <div className="text-center">
              <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(pose1.difficulty)}`}>
                {getDifficultyLabel(pose1.difficulty)}
              </span>
            </div>
            <div className="text-center">
              <span className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(pose2.difficulty)}`}>
                {getDifficultyLabel(pose2.difficulty)}
              </span>
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-3 gap-4 px-6 py-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Hold Duration</span>
            </div>
            <div className="text-center text-gray-800">
              {formatDuration(pose1.durationSeconds)}
            </div>
            <div className="text-center text-gray-800">
              {formatDuration(pose2.durationSeconds)}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Comparison */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
          <h3 className="flex items-center gap-2 font-semibold text-gray-800">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Benefits Comparison
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {/* Common Benefits */}
          {commonBenefits.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Shared Benefits ({commonBenefits.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {commonBenefits.map((benefit, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unique to Pose 1 */}
          {uniqueBenefits1.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Unique to {pose1.nameEnglish}
              </h4>
              <div className="flex flex-wrap gap-2">
                {uniqueBenefits1.map((benefit, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Unique to Pose 2 */}
          {uniqueBenefits2.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                Unique to {pose2.nameEnglish}
              </h4>
              <div className="flex flex-wrap gap-2">
                {uniqueBenefits2.map((benefit, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Target Body Parts */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
          <h3 className="flex items-center gap-2 font-semibold text-gray-800">
            <Target className="w-4 h-4 text-indigo-500" />
            Target Body Parts
          </h3>
        </div>
        <div className="p-6 space-y-4">
          {commonBodyParts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Both Poses Target
              </h4>
              <div className="flex flex-wrap gap-2">
                {commonBodyParts.map((part, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm capitalize"
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {uniqueBodyParts1.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {pose1.nameEnglish} Only
                </h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueBodyParts1.map((part, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm capitalize"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {uniqueBodyParts2.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  {pose2.nameEnglish} Only
                </h4>
                <div className="flex flex-wrap gap-2">
                  {uniqueBodyParts2.map((part, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm capitalize"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Muscle Engagement */}
      {(anatomy1 || anatomy2) && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
            <h3 className="flex items-center gap-2 font-semibold text-gray-800">
              <Activity className="w-4 h-4 text-red-500" />
              Muscle Engagement
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {commonMuscles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Both Poses Engage
                </h4>
                <div className="flex flex-wrap gap-2">
                  {commonMuscles.map((muscle, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm"
                    >
                      {muscle}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {uniqueMuscles1.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    {pose1.nameEnglish} Only
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueMuscles1.map((muscle, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {uniqueMuscles2.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-600 mb-2">
                    {pose2.nameEnglish} Only
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueMuscles2.map((muscle, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm"
                      >
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
