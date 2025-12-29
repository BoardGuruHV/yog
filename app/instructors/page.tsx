"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Search, X, Loader2 } from "lucide-react";
import InstructorCard from "@/components/instructors/InstructorCard";

interface Instructor {
  id: string;
  name: string;
  slug: string;
  bio: string;
  photoUrl: string | null;
  credentials: string[];
  specialties: string[];
  experience: number | null;
  location: string | null;
  featured: boolean;
  verified: boolean;
  programCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");

  const fetchInstructors = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "12",
        });

        if (search) params.set("search", search);
        if (selectedSpecialty) params.set("specialty", selectedSpecialty);

        const response = await fetch(`/api/instructors?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch instructors");
        }

        const data = await response.json();

        if (append) {
          setInstructors((prev) => [...prev, ...data.instructors]);
        } else {
          setInstructors(data.instructors);
          setSpecialties(data.specialties);
        }
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, selectedSpecialty]
  );

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchInstructors(1, false);
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchInstructors]);

  const loadMore = () => {
    if (pagination && pagination.hasMore && !loadingMore) {
      fetchInstructors(pagination.page + 1, true);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedSpecialty("");
  };

  const hasFilters = search || selectedSpecialty;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Instructors</h1>
                <p className="text-sm text-gray-500">
                  Learn from experienced yoga teachers
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search instructors..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Specialty filter */}
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">All Specialties</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        {!loading && pagination && (
          <p className="text-sm text-gray-500 mb-4">
            {pagination.total === 0
              ? "No instructors found"
              : `Showing ${instructors.length} of ${pagination.total} instructors`}
          </p>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading instructors...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchInstructors(1, false)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && instructors.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Instructors Found
            </h2>
            <p className="text-gray-500 mb-6">
              {hasFilters
                ? "Try adjusting your filters to find instructors."
                : "Check back later for featured instructors."}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Instructors grid */}
        {!loading && !error && instructors.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {instructors.map((instructor) => (
                <InstructorCard
                  key={instructor.id}
                  id={instructor.id}
                  name={instructor.name}
                  slug={instructor.slug}
                  bio={instructor.bio}
                  photoUrl={instructor.photoUrl}
                  credentials={instructor.credentials}
                  specialties={instructor.specialties}
                  experience={instructor.experience}
                  location={instructor.location}
                  featured={instructor.featured}
                  verified={instructor.verified}
                  programCount={instructor.programCount}
                />
              ))}
            </div>

            {/* Load more button */}
            {pagination && pagination.hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Instructors"
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Become an instructor CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Are you a yoga instructor?
          </h3>
          <p className="text-gray-600 mb-4">
            Share your expertise with our community. Create programs and help
            others on their yoga journey.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Apply to Become an Instructor
          </Link>
        </div>
      </main>
    </div>
  );
}
