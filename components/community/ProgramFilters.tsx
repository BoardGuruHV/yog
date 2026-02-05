"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

interface ProgramFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  minDuration: string;
  onMinDurationChange: (value: string) => void;
  maxDuration: string;
  onMaxDurationChange: (value: string) => void;
  onClearFilters: () => void;
}

export default function ProgramFilters({
  search,
  onSearchChange,
  sort,
  onSortChange,
  minDuration,
  onMinDurationChange,
  maxDuration,
  onMaxDurationChange,
  onClearFilters,
}: ProgramFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: "popular", label: "Most Popular" },
    { value: "recent", label: "Most Recent" },
    { value: "views", label: "Most Viewed" },
    { value: "duration_asc", label: "Shortest First" },
    { value: "duration_desc", label: "Longest First" },
  ];

  const durationOptions = [
    { value: "", label: "Any" },
    { value: "5", label: "5 min" },
    { value: "10", label: "10 min" },
    { value: "15", label: "15 min" },
    { value: "20", label: "20 min" },
    { value: "30", label: "30 min" },
    { value: "45", label: "45 min" },
    { value: "60", label: "60 min" },
  ];

  const hasActiveFilters = minDuration || maxDuration || search;

  return (
    <div className="space-y-4">
      {/* Search and Sort Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search programs..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-sm"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? "border-green-500 bg-green-50 text-green-700"
              : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-green-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Duration Range */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration Range
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={minDuration}
                  onChange={(e) => onMinDurationChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500 bg-white text-sm"
                >
                  <option value="">Min</option>
                  {durationOptions.slice(1).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <span className="text-gray-400">to</span>
                <select
                  value={maxDuration}
                  onChange={(e) => onMaxDurationChange(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500 bg-white text-sm"
                >
                  <option value="">Max</option>
                  {durationOptions.slice(1).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
