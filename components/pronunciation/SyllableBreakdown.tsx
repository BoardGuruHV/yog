"use client";

import { useState, useEffect } from "react";

export interface Syllable {
  text: string;
  stress: boolean;
}

interface SyllableBreakdownProps {
  syllables: Syllable[];
  activeSyllableIndex?: number;
  onSyllableClick?: (index: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function SyllableBreakdown({
  syllables,
  activeSyllableIndex = -1,
  onSyllableClick,
  size = "md",
}: SyllableBreakdownProps) {
  const sizeClasses = {
    sm: "text-lg px-2 py-1",
    md: "text-2xl px-3 py-2",
    lg: "text-4xl px-4 py-3",
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {syllables.map((syllable, index) => (
        <button
          key={index}
          onClick={() => onSyllableClick?.(index)}
          className={`
            ${sizeClasses[size]}
            rounded-lg font-medium transition-all duration-200
            ${syllable.stress
              ? "bg-amber-100 text-amber-800 font-bold"
              : "bg-gray-100 text-gray-600"
            }
            ${activeSyllableIndex === index
              ? "ring-2 ring-amber-400 scale-110 shadow-md"
              : ""
            }
            ${onSyllableClick ? "hover:scale-105 cursor-pointer" : "cursor-default"}
          `}
          disabled={!onSyllableClick}
        >
          {syllable.text}
          {syllable.stress && (
            <span className="text-xs ml-0.5 text-amber-500">ˈ</span>
          )}
        </button>
      ))}
    </div>
  );
}

// Compact inline version for display in cards
export function SyllableInline({
  syllables,
  className = "",
}: {
  syllables: Syllable[];
  className?: string;
}) {
  return (
    <span className={`font-mono ${className}`}>
      {syllables.map((syllable, index) => (
        <span key={index}>
          <span
            className={syllable.stress ? "font-bold text-amber-700" : "text-gray-600"}
          >
            {syllable.text}
          </span>
          {index < syllables.length - 1 && (
            <span className="text-gray-300 mx-0.5">·</span>
          )}
        </span>
      ))}
    </span>
  );
}
