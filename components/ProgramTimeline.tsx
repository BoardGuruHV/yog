"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useProgram } from "@/context/ProgramContext";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export default function ProgramTimeline() {
  const { state } = useProgram();
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  if (state.asanas.length === 0) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-sage-100 overflow-x-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Program Flow
      </h3>

      <div className="flex items-center gap-2 min-w-max pb-2">
        {state.asanas.map((programAsana, index) => {
          const asana = programAsana.asana;
          if (!asana) return null;

          return (
            <motion.div
              key={programAsana.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center"
            >
              {/* Asana Card */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-sage-50 to-yoga-50 rounded-xl flex items-center justify-center shadow-sm border border-sage-100">
                  <Image
                    src={imageErrors[programAsana.id] ? "/asanas/default.svg" : asana.svgPath}
                    alt={asana.nameEnglish}
                    width={50}
                    height={60}
                    className="object-contain"
                    onError={() => handleImageError(programAsana.id)}
                  />
                </div>
                <p className="mt-2 text-xs font-medium text-gray-700 text-center max-w-[80px] truncate">
                  {asana.nameEnglish}
                </p>
                <p className="text-xs text-sage-500">
                  {formatTime(programAsana.duration)}
                </p>
              </div>

              {/* Arrow between cards */}
              {index < state.asanas.length - 1 && (
                <ArrowRight className="w-5 h-5 text-sage-300 mx-2 flex-shrink-0" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Timeline bar */}
      <div className="mt-4 pt-4 border-t border-sage-100">
        <div className="flex items-center gap-1">
          {state.asanas.map((programAsana, index) => {
            const widthPercent =
              (programAsana.duration / state.totalDuration) * 100;
            const colors = [
              "bg-sage-400",
              "bg-yoga-400",
              "bg-blue-400",
              "bg-purple-400",
              "bg-teal-400",
            ];
            return (
              <div
                key={programAsana.id}
                className={`h-2 rounded-full ${colors[index % colors.length]}`}
                style={{ width: `${Math.max(widthPercent, 2)}%` }}
                title={`${programAsana.asana?.nameEnglish}: ${Math.floor(
                  programAsana.duration / 60
                )}:${(programAsana.duration % 60).toString().padStart(2, "0")}`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>Start</span>
          <span>
            {Math.floor(state.totalDuration / 60)}:{(state.totalDuration % 60)
              .toString()
              .padStart(2, "0")}
          </span>
        </div>
      </div>
    </div>
  );
}
