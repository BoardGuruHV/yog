"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  LayoutGrid,
  Loader2,
  Sunrise,
  Moon,
  Monitor,
  Dumbbell,
  Heart,
  Sparkles,
  Star,
} from "lucide-react";
import TemplateCard from "@/components/templates/TemplateCard";
import TemplateDetail from "@/components/templates/TemplateDetail";
import { Template } from "@/types/template";

const categories = [
  { id: "all", label: "All Templates", icon: LayoutGrid },
  { id: "morning", label: "Morning", icon: Sunrise },
  { id: "evening", label: "Evening", icon: Moon },
  { id: "office", label: "Office", icon: Monitor },
  { id: "athletic", label: "Athletic", icon: Dumbbell },
  { id: "relaxation", label: "Relaxation", icon: Heart },
  { id: "strength", label: "Strength", icon: Dumbbell },
  { id: "flexibility", label: "Flexibility", icon: Sparkles },
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCategory !== "all") {
          params.set("category", selectedCategory);
        }
        if (showFeaturedOnly) {
          params.set("featured", "true");
        }

        const response = await fetch(`/api/templates?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          setTemplates(data);
        }
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [selectedCategory, showFeaturedOnly]);

  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      template.goals.some((goal) => goal.toLowerCase().includes(query))
    );
  });

  const featuredTemplates = filteredTemplates.filter((t) => t.featured);
  const regularTemplates = filteredTemplates.filter((t) => !t.featured);

  return (
    <div className="min-h-screen bg-linear-to-b from-yoga-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-sage-600 to-sage-700 text-white">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sage-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Program Templates</h1>
              <p className="text-sage-200 mt-2">
                Ready-made yoga sequences for every goal and time of day
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sage-200">
                {filteredTemplates.length} templates
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sage-500"
            />
          </div>

          {/* Featured Toggle */}
          <button
            onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
              showFeaturedOnly
                ? "bg-amber-50 border-amber-300 text-amber-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Star className={`w-4 h-4 ${showFeaturedOnly ? "fill-amber-400" : ""}`} />
            Featured
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-sage-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No templates found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <>
            {/* Featured Templates */}
            {featuredTemplates.length > 0 && !showFeaturedOnly && (
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Featured Templates
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={setSelectedTemplate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Templates */}
            {(showFeaturedOnly ? featuredTemplates : regularTemplates).length > 0 && (
              <div>
                {!showFeaturedOnly && featuredTemplates.length > 0 && (
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    All Templates
                  </h2>
                )}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(showFeaturedOnly ? featuredTemplates : regularTemplates).map(
                    (template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={setSelectedTemplate}
                      />
                    )
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <TemplateDetail
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}
