"use client";

import { useState } from "react";
import { ChevronDown, X, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Category, CATEGORY_LABELS, BODY_PARTS, FilterState } from "@/types";

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const categories: Category[] = [
  "STANDING",
  "SEATED",
  "PRONE",
  "SUPINE",
  "INVERSION",
  "BALANCE",
  "TWIST",
  "FORWARD_BEND",
  "BACK_BEND",
];

const difficulties = [
  { value: 1, label: "Beginner", color: "bg-green-100 text-green-700" },
  { value: 2, label: "Easy", color: "bg-green-100 text-green-700" },
  { value: 3, label: "Moderate", color: "bg-yellow-100 text-yellow-700" },
  { value: 4, label: "Challenging", color: "bg-orange-100 text-orange-700" },
  { value: 5, label: "Advanced", color: "bg-red-100 text-red-700" },
];

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [showCategories, setShowCategories] = useState(false);
  const [showDifficulty, setShowDifficulty] = useState(false);
  const [showBodyParts, setShowBodyParts] = useState(false);

  const toggleCategory = (category: Category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ ...filters, categories: newCategories });
  };

  const toggleDifficulty = (diff: number) => {
    const newDifficulty = filters.difficulty.includes(diff)
      ? filters.difficulty.filter((d) => d !== diff)
      : [...filters.difficulty, diff];
    onFilterChange({ ...filters, difficulty: newDifficulty });
  };

  const toggleBodyPart = (part: string) => {
    const newBodyParts = filters.bodyParts.includes(part)
      ? filters.bodyParts.filter((p) => p !== part)
      : [...filters.bodyParts, part];
    onFilterChange({ ...filters, bodyParts: newBodyParts });
  };

  const clearFilters = () => {
    onFilterChange({
      categories: [],
      difficulty: [],
      bodyParts: [],
      search: filters.search,
    });
  };

  const activeFilterCount =
    filters.categories.length +
    filters.difficulty.length +
    filters.bodyParts.length;

  return (
    <div className="space-y-4">
      {/* Filter Buttons Row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sage-600">
          <Filter className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowCategories(!showCategories);
              setShowDifficulty(false);
              setShowBodyParts(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              filters.categories.length > 0
                ? "bg-sage-100 border-sage-300 text-sage-700"
                : "bg-white border-sage-200 text-gray-600 hover:border-sage-300"
            }`}
          >
            <span>Category</span>
            {filters.categories.length > 0 && (
              <span className="bg-sage-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {filters.categories.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showCategories && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 mt-2 w-56 bg-white rounded-xl shadow-lg border border-sage-100 p-3"
              >
                <div className="grid grid-cols-1 gap-1">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.categories.includes(category)
                          ? "bg-sage-100 text-sage-700"
                          : "hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {CATEGORY_LABELS[category]}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Difficulty Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowDifficulty(!showDifficulty);
              setShowCategories(false);
              setShowBodyParts(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              filters.difficulty.length > 0
                ? "bg-sage-100 border-sage-300 text-sage-700"
                : "bg-white border-sage-200 text-gray-600 hover:border-sage-300"
            }`}
          >
            <span>Difficulty</span>
            {filters.difficulty.length > 0 && (
              <span className="bg-sage-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {filters.difficulty.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showDifficulty && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 mt-2 w-48 bg-white rounded-xl shadow-lg border border-sage-100 p-3"
              >
                <div className="space-y-1">
                  {difficulties.map((diff) => (
                    <button
                      key={diff.value}
                      onClick={() => toggleDifficulty(diff.value)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        filters.difficulty.includes(diff.value)
                          ? diff.color
                          : "hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {diff.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Body Parts Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowBodyParts(!showBodyParts);
              setShowCategories(false);
              setShowDifficulty(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              filters.bodyParts.length > 0
                ? "bg-sage-100 border-sage-300 text-sage-700"
                : "bg-white border-sage-200 text-gray-600 hover:border-sage-300"
            }`}
          >
            <span>Body Part</span>
            {filters.bodyParts.length > 0 && (
              <span className="bg-sage-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {filters.bodyParts.length}
              </span>
            )}
            <ChevronDown className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showBodyParts && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-20 mt-2 w-48 bg-white rounded-xl shadow-lg border border-sage-100 p-3 max-h-64 overflow-y-auto"
              >
                <div className="space-y-1">
                  {BODY_PARTS.map((part) => (
                    <button
                      key={part}
                      onClick={() => toggleBodyPart(part)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors ${
                        filters.bodyParts.includes(part)
                          ? "bg-sage-100 text-sage-700"
                          : "hover:bg-gray-50 text-gray-600"
                      }`}
                    >
                      {part}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
            Clear all
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.categories.map((cat) => (
            <span
              key={cat}
              className="inline-flex items-center gap-1 px-3 py-1 bg-sage-100 text-sage-700 rounded-full text-sm"
            >
              {CATEGORY_LABELS[cat]}
              <button onClick={() => toggleCategory(cat)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.difficulty.map((diff) => (
            <span
              key={diff}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                difficulties.find((d) => d.value === diff)?.color
              }`}
            >
              {difficulties.find((d) => d.value === diff)?.label}
              <button onClick={() => toggleDifficulty(diff)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {filters.bodyParts.map((part) => (
            <span
              key={part}
              className="inline-flex items-center gap-1 px-3 py-1 bg-yoga-100 text-yoga-700 rounded-full text-sm capitalize"
            >
              {part}
              <button onClick={() => toggleBodyPart(part)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
