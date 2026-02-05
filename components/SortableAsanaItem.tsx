"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical, X, Clock, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { ProgramAsana, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types";
import { useProgram } from "@/context/ProgramContext";
import { useState } from "react";

interface SortableAsanaItemProps {
  programAsana: ProgramAsana;
  index: number;
}

export default function SortableAsanaItem({
  programAsana,
  index,
}: SortableAsanaItemProps) {
  const { removeAsana, updateDuration } = useProgram();
  const [imageError, setImageError] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: programAsana.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const asana = programAsana.asana;
  if (!asana) return null;

  const adjustDuration = (delta: number) => {
    const newDuration = Math.max(10, programAsana.duration + delta);
    updateDuration(programAsana.id, newDuration);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-xl shadow-xs border border-sage-100 overflow-hidden ${
        isDragging ? "shadow-lg ring-2 ring-sage-300 z-50" : ""
      }`}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Order Number */}
        <div className="w-8 h-8 rounded-full bg-sage-100 flex items-center justify-center text-sage-700 font-medium text-sm">
          {index + 1}
        </div>

        {/* Asana Image */}
        <div className="w-16 h-16 bg-linear-to-br from-sage-50 to-yoga-50 rounded-lg flex items-center justify-center shrink-0">
          <Image
            src={imageError ? "/asanas/default.svg" : asana.svgPath}
            alt={asana.nameEnglish}
            width={50}
            height={60}
            className="object-contain"
            onError={() => setImageError(true)}
          />
        </div>

        {/* Asana Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-800 truncate">
            {asana.nameEnglish}
          </h4>
          <p className="text-sm text-sage-600 italic truncate">
            {asana.nameSanskrit}
          </p>
          <span
            className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${
              CATEGORY_COLORS[asana.category]
            }`}
          >
            {CATEGORY_LABELS[asana.category]}
          </span>
        </div>

        {/* Duration Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustDuration(-10)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 min-w-[70px] justify-center">
            <Clock className="w-4 h-4 text-sage-500" />
            <span className="text-sm font-medium text-gray-700">
              {formatDuration(programAsana.duration)}
            </span>
          </div>
          <button
            onClick={() => adjustDuration(10)}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Remove Button */}
        <button
          onClick={() => removeAsana(programAsana.id)}
          className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
