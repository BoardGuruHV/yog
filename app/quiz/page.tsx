"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  Search,
  Filter,
  Loader2,
  Trophy,
  Sparkles,
} from "lucide-react";
import QuizCard from "@/components/quiz/QuizCard";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  imageUrl: string | null;
  timeLimit: number | null;
  questionCount: number;
  featured: boolean;
  userProgress: {
    bestScore: number;
    attempts: number;
  } | null;
}

const CATEGORY_INFO: Record<string, { label: string; icon: string }> = {
  poses: { label: "Pose Identification", icon: "🧘" },
  sanskrit: { label: "Sanskrit Names", icon: "🕉️" },
  benefits: { label: "Benefits & Uses", icon: "💚" },
  philosophy: { label: "Philosophy", icon: "📚" },
  anatomy: { label: "Anatomy", icon: "🫀" },
  history: { label: "History", icon: "📜" },
};

const DIFFICULTY_OPTIONS = ["All", "beginner", "intermediate", "advanced"];

export default function QuizListingPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, [selectedCategory, selectedDifficulty]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.set("category", selectedCategory);
      }
      if (selectedDifficulty !== "All") {
        params.set("difficulty", selectedDifficulty);
      }

      const res = await fetch(`/api/quizzes?${params}`);
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.quizzes);
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz) =>
    searchQuery
      ? quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const featuredQuizzes = filteredQuizzes.filter((q) => q.featured);
  const regularQuizzes = filteredQuizzes.filter((q) => !q.featured);

  return (
    <div className="min-h-screen bg-linear-to-b from-indigo-50 to-white">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Yoga Knowledge Quizzes
              </h1>
              <p className="text-indigo-200 mt-1">
                Test your knowledge of yoga poses, philosophy, and history
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quizzes..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-white placeholder-white/60 focus:outline-hidden focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              !selectedCategory
                ? "bg-white shadow-lg ring-2 ring-indigo-500"
                : "bg-white shadow-xs hover:shadow-md"
            }`}
          >
            <span className="text-lg">🎯</span>
            <span className="font-medium text-gray-900 text-sm">All Quizzes</span>
          </button>
          {Object.entries(CATEGORY_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                selectedCategory === key
                  ? "bg-white shadow-lg ring-2 ring-indigo-500"
                  : "bg-white shadow-xs hover:shadow-md"
              }`}
            >
              <span className="text-lg">{info.icon}</span>
              <span className="font-medium text-gray-900 text-sm">{info.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Difficulty Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Filter className="w-4 h-4" />
            Difficulty:
          </span>
          <div className="flex gap-2">
            {DIFFICULTY_OPTIONS.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedDifficulty === difficulty
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {difficulty === "All" ? "All Levels" : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No quizzes found
            </h2>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? `No quizzes match "${searchQuery}"`
                : "Quizzes are being added. Check back soon!"}
            </p>
            {(searchQuery || selectedCategory || selectedDifficulty !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                  setSelectedDifficulty("All");
                }}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Quizzes */}
            {featuredQuizzes.length > 0 && !selectedCategory && !searchQuery && (
              <section className="mb-12">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-6">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Featured Quizzes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredQuizzes.map((quiz) => (
                    <QuizCard key={quiz.id} {...quiz} />
                  ))}
                </div>
              </section>
            )}

            {/* All Quizzes */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCategory
                    ? `${CATEGORY_INFO[selectedCategory]?.label || selectedCategory} Quizzes`
                    : "All Quizzes"}
                </h2>
                <span className="text-sm text-gray-500">
                  {regularQuizzes.length} quiz{regularQuizzes.length !== 1 ? "zes" : ""}
                </span>
              </div>

              {regularQuizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularQuizzes.map((quiz) => (
                    <QuizCard key={quiz.id} {...quiz} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No quizzes in this category yet.
                </p>
              )}
            </section>
          </>
        )}

        {/* Stats Banner */}
        <section className="mt-16 bg-linear-to-r from-indigo-50 to-purple-50 rounded-2xl p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Track Your Progress
              </h2>
              <p className="text-gray-600">
                Sign in to save your quiz scores and track your learning journey.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-indigo-600">
              <Trophy className="w-8 h-8" />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
