"use client";

import { Plus, Check, Clock, Info, AlertOctagon, AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Asana, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types";
import { useProgram } from "@/context/ProgramContext";
import { useState } from "react";
import FavoriteButton from "@/components/favorites/FavoriteButton";

interface HealthWarningInfo {
  isContraindicated: boolean;
  hasCaution: boolean;
}

interface AsanaCardProps {
  asana: Asana;
  showAddButton?: boolean;
  healthWarning?: HealthWarningInfo;
  isFavorited?: boolean;
}

export default function AsanaCard({ asana, showAddButton = true, healthWarning, isFavorited = false }: AsanaCardProps) {
  const { addAsana, isInProgram } = useProgram();
  const [imageError, setImageError] = useState(false);
  const inProgram = isInProgram(asana.id);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inProgram) {
      addAsana(asana);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      return `${mins} min`;
    }
    return `${seconds}s`;
  };

  const getDifficultyDots = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`w-2 h-2 rounded-full ${
          i < difficulty
            ? difficulty <= 2
              ? "bg-green-400"
              : difficulty <= 3
              ? "bg-yellow-400"
              : "bg-red-400"
            : "bg-gray-200"
        }`}
      />
    ));
  };

  return (
    <Link href={`/asana/${asana.id}`}>
      <div className="asana-card bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer group border border-sage-100 hover:-translate-y-1 hover:shadow-xl transition-all duration-200">
        {/* Image Container */}
        <div className="relative h-48 bg-linear-to-br from-sage-50 to-yoga-50 flex items-center justify-center overflow-hidden">
          <Image
            src={imageError ? "/asanas/default.svg" : asana.svgPath}
            alt={asana.nameEnglish}
            width={120}
            height={150}
            className="object-contain transition-transform duration-300 group-hover:scale-110"
            onError={() => setImageError(true)}
          />

          {/* Category Badge */}
          <span
            className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
              CATEGORY_COLORS[asana.category]
            }`}
          >
            {CATEGORY_LABELS[asana.category]}
          </span>

          {/* Health Warning Badge */}
          {healthWarning?.isContraindicated && (
            <span
              className="absolute bottom-3 left-3 p-1.5 rounded-full bg-red-100 text-red-600"
              title="Not recommended for your conditions"
            >
              <AlertOctagon className="w-4 h-4" />
            </span>
          )}
          {healthWarning?.hasCaution && !healthWarning?.isContraindicated && (
            <span
              className="absolute bottom-3 left-3 p-1.5 rounded-full bg-amber-100 text-amber-600"
              title="Practice with caution"
            >
              <AlertTriangle className="w-4 h-4" />
            </span>
          )}

          {/* Top Right Actions */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/80 text-sage-700 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(asana.durationSeconds)}
            </span>
            <FavoriteButton
              asanaId={asana.id}
              initialFavorited={isFavorited}
              size="sm"
              className="bg-white/80 hover:bg-white"
            />
          </div>

          {/* Add Button */}
          {showAddButton && (
            <button
              className={`absolute bottom-3 right-3 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 ${
                inProgram
                  ? "bg-sage-500 text-white"
                  : "bg-white text-sage-600 hover:bg-sage-100"
              }`}
              onClick={handleAdd}
              disabled={inProgram}
            >
              {inProgram ? (
                <Check className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800 mb-1 truncate">
            {asana.nameEnglish}
          </h3>
          <p className="text-sm text-sage-600 italic mb-3">{asana.nameSanskrit}</p>

          {/* Difficulty */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {getDifficultyDots(asana.difficulty)}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Info className="w-3 h-3" />
              <span>{asana.benefits.length} benefits</span>
            </div>
          </div>

          {/* Target Body Parts */}
          <div className="mt-3 flex flex-wrap gap-1">
            {asana.targetBodyParts.slice(0, 3).map((part) => (
              <span
                key={part}
                className="px-2 py-0.5 bg-sage-50 text-sage-600 rounded-sm text-xs"
              >
                {part}
              </span>
            ))}
            {asana.targetBodyParts.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded-sm text-xs">
                +{asana.targetBodyParts.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
