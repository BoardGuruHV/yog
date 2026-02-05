"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, ArrowLeftRight } from "lucide-react";
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/types";

interface AsanaDetail {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  durationSeconds: number;
  svgPath: string;
  description: string;
}

interface ComparisonViewProps {
  pose1: AsanaDetail;
  pose2: AsanaDetail;
  onSwap: () => void;
}

export default function ComparisonView({
  pose1,
  pose2,
  onSwap,
}: ComparisonViewProps) {
  const getDifficultyLabel = (difficulty: number) => {
    const labels = ["", "Beginner", "Easy", "Moderate", "Challenging", "Advanced"];
    return labels[difficulty] || "";
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "text-green-600 bg-green-100";
    if (difficulty <= 3) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const renderPoseCard = (pose: AsanaDetail, side: "left" | "right") => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      {/* Image */}
      <div className="h-48 bg-linear-to-br from-sage-50 to-yoga-50 flex items-center justify-center relative">
        <Image
          src={pose.svgPath}
          alt={pose.nameEnglish}
          width={140}
          height={140}
          className="object-contain"
        />
        <Link
          href={`/asana/${pose.id}`}
          className="absolute top-3 right-3 p-2 bg-white/80 rounded-lg hover:bg-white transition-colors shadow-xs"
          title="View details"
        >
          <ExternalLink className="w-4 h-4 text-gray-600" />
        </Link>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {pose.nameEnglish}
            </h3>
            <p className="text-sage-600 italic text-sm">
              {pose.nameSanskrit}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              CATEGORY_COLORS[pose.category as keyof typeof CATEGORY_COLORS] || "bg-gray-100 text-gray-600"
            }`}
          >
            {CATEGORY_LABELS[pose.category as keyof typeof CATEGORY_LABELS] || pose.category}
          </span>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
              pose.difficulty
            )}`}
          >
            {getDifficultyLabel(pose.difficulty)}
          </span>
        </div>

        <p className="text-gray-600 text-sm mt-4 line-clamp-3">
          {pose.description}
        </p>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderPoseCard(pose1, "left")}
        {renderPoseCard(pose2, "right")}
      </div>

      {/* Swap Button */}
      <button
        onClick={onSwap}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-sage-50 hover:border-sage-300 transition-all group hidden md:flex"
        title="Swap poses"
      >
        <ArrowLeftRight className="w-5 h-5 text-gray-500 group-hover:text-sage-600" />
      </button>

      {/* Mobile swap button */}
      <div className="flex justify-center mt-4 md:hidden">
        <button
          onClick={onSwap}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-sage-50 hover:border-sage-300 transition-all"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="text-sm font-medium">Swap Poses</span>
        </button>
      </div>
    </div>
  );
}
