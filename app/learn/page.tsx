"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  Filter,
  Loader2,
  Sparkles,
  Clock,
  ArrowRight,
} from "lucide-react";
import ArticleCard from "@/components/learn/ArticleCard";

interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  excerpt: string | null;
  coverImage: string | null;
  readTime: number;
  tags: string[];
  featured: boolean;
  publishedAt: string;
}

const CATEGORY_INFO: Record<string, { label: string; description: string; icon: string }> = {
  philosophy: {
    label: "Philosophy",
    description: "Explore the spiritual foundations and mental aspects of yoga",
    icon: "🕉️",
  },
  history: {
    label: "History",
    description: "Journey through yoga's rich 5,000-year heritage",
    icon: "📜",
  },
  anatomy: {
    label: "Anatomy",
    description: "Understand how yoga affects your body",
    icon: "🫀",
  },
  lifestyle: {
    label: "Lifestyle",
    description: "Integrate yogic principles into daily life",
    icon: "🌿",
  },
  practice: {
    label: "Practice",
    description: "Deepen your understanding of asanas and sequences",
    icon: "🧘",
  },
};

export default function LearnPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchArticles();
  }, [selectedCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) {
        params.set("category", selectedCategory);
      }

      const res = await fetch(`/api/articles?${params}`);
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles);
        setAvailableCategories(data.filters.categories);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter((article) =>
    searchQuery
      ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const featuredArticles = filteredArticles.filter((a) => a.featured);
  const regularArticles = filteredArticles.filter((a) => !a.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Header */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/10 rounded-xl">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Learn Yoga
              </h1>
              <p className="text-purple-200 mt-1">
                Deepen your practice with articles on philosophy, history, and technique
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
                placeholder="Search articles..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(CATEGORY_INFO).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
              className={`p-4 rounded-xl text-left transition-all ${
                selectedCategory === key
                  ? "bg-white shadow-lg ring-2 ring-purple-500"
                  : "bg-white shadow-sm hover:shadow-md"
              }`}
            >
              <span className="text-2xl mb-2 block">{info.icon}</span>
              <h3 className="font-semibold text-gray-900 text-sm">{info.label}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 hidden md:block">
                {info.description}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No articles found
            </h2>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? `No articles match "${searchQuery}"`
                : "Articles are being added. Check back soon!"}
            </p>
            {(searchQuery || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(null);
                }}
                className="text-sage-600 hover:text-sage-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured Articles */}
            {featuredArticles.length > 0 && !selectedCategory && !searchQuery && (
              <section className="mb-12">
                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-6">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Featured Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredArticles.map((article) => (
                    <ArticleCard key={article.id} {...article} />
                  ))}
                </div>
              </section>
            )}

            {/* All Articles */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedCategory
                    ? `${CATEGORY_INFO[selectedCategory]?.label || selectedCategory} Articles`
                    : "All Articles"}
                </h2>
                <span className="text-sm text-gray-500">
                  {regularArticles.length} article{regularArticles.length !== 1 ? "s" : ""}
                </span>
              </div>

              {regularArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {regularArticles.map((article) => (
                    <ArticleCard key={article.id} {...article} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No articles in this category yet.
                </p>
              )}
            </section>
          </>
        )}

        {/* Quick Links to Pose Tutorials */}
        <section className="mt-16 bg-gradient-to-r from-sage-50 to-yoga-50 rounded-2xl p-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Looking for Pose Tutorials?
              </h2>
              <p className="text-gray-600">
                Learn step-by-step how to practice individual asanas with our interactive tutorials.
              </p>
            </div>
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors whitespace-nowrap"
            >
              Browse Asanas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
