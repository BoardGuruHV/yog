"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Sparkles, X, Loader2, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useProgram } from "@/context/ProgramContext";

interface SearchResult {
  asana: {
    id: string;
    nameEnglish: string;
    nameSanskrit: string;
    category: string;
    difficulty: number;
    targetBodyParts: string[];
    benefits: string[];
    svgPath: string;
    description: string;
  };
  score: number;
  matchedTerms: string[];
  searchMethod: "semantic" | "keyword";
}

interface SearchResponse {
  query: string;
  intent: string;
  filters: Record<string, string>;
  searchMethod: "semantic" | "keyword";
  resultCount: number;
  results: SearchResult[];
}

interface SmartSearchProps {
  onSelectAsana?: (asana: SearchResult["asana"]) => void;
  showAddToProgram?: boolean;
  placeholder?: string;
  className?: string;
}

export default function SmartSearch({
  onSelectAsana,
  showAddToProgram = true,
  placeholder = "Search poses naturally... e.g. 'gentle hip openers for beginners'",
  className = "",
}: SmartSearchProps) {
  const { addAsana } = useProgram();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [intent, setIntent] = useState<string>("");
  const [searchMethod, setSearchMethod] = useState<"semantic" | "keyword">("keyword");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setIntent("");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/search/semantic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, limit: 8 }),
      });

      if (response.ok) {
        const data: SearchResponse = await response.json();
        setResults(data.results);
        setIntent(data.intent);
        setSearchMethod(data.searchMethod);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [query, performSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectResult(results[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    if (onSelectAsana) {
      onSelectAsana(result.asana);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleAddToProgram = (result: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation();
    addAsana({
      id: result.asana.id,
      nameEnglish: result.asana.nameEnglish,
      nameSanskrit: result.asana.nameSanskrit,
      category: result.asana.category as any,
      difficulty: result.asana.difficulty,
      targetBodyParts: result.asana.targetBodyParts,
      svgPath: result.asana.svgPath,
      durationSeconds: 30,
      description: result.asana.description,
      benefits: result.asana.benefits,
    });
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setIntent("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return { label: "Beginner", color: "bg-green-100 text-green-700" };
      case 2:
        return { label: "Easy", color: "bg-green-100 text-green-700" };
      case 3:
        return { label: "Moderate", color: "bg-amber-100 text-amber-700" };
      case 4:
        return { label: "Challenging", color: "bg-orange-100 text-orange-700" };
      case 5:
        return { label: "Advanced", color: "bg-red-100 text-red-700" };
      default:
        return { label: "Unknown", color: "bg-gray-100 text-gray-700" };
    }
  };

  const formatCategory = (category: string) => {
    return category
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-sage-500 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-sage-500" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 bg-white border border-sage-200 rounded-xl shadow-xs focus:border-sage-400 focus:ring-2 focus:ring-sage-100 outline-hidden transition-all text-gray-800 placeholder-gray-400"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-sage-200 overflow-hidden">
          {/* Intent Interpretation */}
          {intent && (
            <div className="px-4 py-2 bg-sage-50 border-b border-sage-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sage-600" />
              <span className="text-sm text-sage-700">{intent}</span>
              {searchMethod === "semantic" && (
                <span className="ml-auto text-xs text-sage-500 bg-sage-100 px-2 py-0.5 rounded-full">
                  AI Search
                </span>
              )}
            </div>
          )}

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={result.asana.id}
                onClick={() => handleSelectResult(result)}
                className={`flex items-center gap-4 p-4 cursor-pointer transition-colors ${
                  index === selectedIndex
                    ? "bg-sage-100"
                    : "hover:bg-gray-50"
                } ${index > 0 ? "border-t border-gray-100" : ""}`}
              >
                {/* Pose Image */}
                <div className="w-14 h-14 bg-gray-100 rounded-lg p-1 shrink-0">
                  <Image
                    src={result.asana.svgPath}
                    alt={result.asana.nameEnglish}
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Pose Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/asana/${result.asana.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-gray-800 hover:text-sage-600"
                    >
                      {result.asana.nameEnglish}
                    </Link>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        getDifficultyLabel(result.asana.difficulty).color
                      }`}
                    >
                      {getDifficultyLabel(result.asana.difficulty).label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {result.asana.nameSanskrit} · {formatCategory(result.asana.category)}
                  </p>

                  {/* Matched Terms */}
                  {result.matchedTerms.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.matchedTerms.map((term, idx) => (
                        <span
                          key={idx}
                          className="text-xs px-2 py-0.5 bg-sage-50 text-sage-600 rounded-full"
                        >
                          {term}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Match Score */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">
                    {Math.round(result.score * 100)}%
                  </span>

                  {/* Add to Program Button */}
                  {showAddToProgram && (
                    <button
                      onClick={(e) => handleAddToProgram(result, e)}
                      className="p-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
                      title="Add to program"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
            <span className="text-xs text-gray-500">
              {results.length} result{results.length !== 1 ? "s" : ""} · Press ↑↓ to navigate, Enter to select
            </span>
          </div>
        </div>
      )}

      {/* No Results */}
      {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-sage-200 p-6 text-center">
          <p className="text-gray-500">No poses found matching &quot;{query}&quot;</p>
          <p className="text-sm text-gray-400 mt-1">
            Try different keywords like &quot;relaxing&quot;, &quot;hip opener&quot;, or &quot;beginner&quot;
          </p>
        </div>
      )}

      {/* Example Queries */}
      {!isOpen && !query && (
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Try:</span>
          {[
            "gentle hip openers",
            "morning energy",
            "back pain relief",
            "advanced balance poses",
          ].map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="text-sm px-3 py-1 bg-sage-50 text-sage-700 rounded-full hover:bg-sage-100 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
