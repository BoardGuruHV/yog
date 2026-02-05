"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import SearchBar from "@/components/SearchBar";
import SmartSearch from "@/components/SmartSearch";
import FilterBar from "@/components/FilterBar";
import AsanaGrid from "@/components/AsanaGrid";
import { Asana, FilterState } from "@/types";
import { useProgram } from "@/context/ProgramContext";
import { useHealth } from "@/context/HealthContext";
import { ShoppingBag, ArrowRight, Sparkles, Search, Heart } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [asanas, setAsanas] = useState<Asana[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [searchMode, setSearchMode] = useState<"basic" | "smart">("smart");
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    difficulty: [],
    bodyParts: [],
    search: "",
  });
  const { state } = useProgram();
  const { warningsMap, hasConditions, conditionCount } = useHealth();

  const fetchAsanas = useCallback(async () => {
    if (!initialLoad) setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.search) params.set("search", filters.search);
      if (filters.categories.length > 0) {
        params.set("categories", filters.categories.join(","));
      }
      if (filters.difficulty.length > 0) {
        params.set("difficulty", filters.difficulty.join(","));
      }
      if (filters.bodyParts.length > 0) {
        params.set("bodyParts", filters.bodyParts.join(","));
      }

      const response = await fetch(`/api/asanas?${params.toString()}`);
      const data = await response.json();
      setAsanas(data);
    } catch (error) {
      console.error("Error fetching asanas:", error);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [filters, initialLoad]);

  useEffect(() => {
    fetchAsanas();
  }, [fetchAsanas]);

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-yoga-50 to-white">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-sage-600 to-sage-700 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Yoga Asana Library
            </h1>
            <p className="text-xl text-sage-100 max-w-2xl mb-6">
              Explore our comprehensive collection of yoga poses. Filter by category,
              difficulty, or target body part to find the perfect asanas for your practice.
            </p>

            {/* Search Mode Toggle */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setSearchMode("smart")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  searchMode === "smart"
                    ? "bg-white text-sage-700"
                    : "bg-sage-500/30 text-white hover:bg-sage-500/50"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Smart Search
              </button>
              <button
                onClick={() => setSearchMode("basic")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  searchMode === "basic"
                    ? "bg-white text-sage-700"
                    : "bg-sage-500/30 text-white hover:bg-sage-500/50"
                }`}
              >
                <Search className="w-4 h-4" />
                Basic Search
              </button>
            </div>

            {/* Search Input */}
            <div className="max-w-2xl">
              {searchMode === "smart" ? (
                <SmartSearch
                  showAddToProgram={true}
                  placeholder="Search naturally... e.g. 'gentle hip openers for beginners'"
                  className="w-full"
                />
              ) : (
                <SearchBar onSearch={handleSearch} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Program Bar - Fixed at bottom when items added */}
      {state.asanas.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white border-t border-sage-200 shadow-lg z-40"
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-sage-100 p-2 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-sage-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {state.asanas.length} asana{state.asanas.length !== 1 ? "s" : ""} in your program
                </p>
                <p className="text-sm text-gray-500">
                  {Math.floor(state.totalDuration / 60)} min total
                </p>
              </div>
            </div>
            <Link
              href="/program"
              className="flex items-center gap-2 bg-sage-600 text-white px-5 py-2.5 rounded-lg hover:bg-sage-700 transition-colors"
            >
              View Program
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-8">
          <FilterBar filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* Results Count & Health Filter Indicator */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? (
              "Loading..."
            ) : (
              <>
                Showing <span className="font-semibold">{asanas.length}</span>{" "}
                asana{asanas.length !== 1 ? "s" : ""}
              </>
            )}
          </p>

          {/* Health Conditions Indicator */}
          {hasConditions && (
            <Link
              href="/onboarding/health"
              className="flex items-center gap-2 px-3 py-1.5 bg-sage-50 border border-sage-200 rounded-lg text-sage-700 hover:bg-sage-100 transition-colors text-sm"
            >
              <Heart className="w-4 h-4" />
              <span>{conditionCount} health condition{conditionCount !== 1 ? "s" : ""} active</span>
            </Link>
          )}
        </div>

        {/* Asana Grid */}
        <AsanaGrid asanas={asanas} loading={loading} />

        {/* Bottom padding for fixed bar */}
        {state.asanas.length > 0 && <div className="h-24" />}
      </main>
    </div>
  );
}
