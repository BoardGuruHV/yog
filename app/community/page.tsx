"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import ProgramFilters from "@/components/community/ProgramFilters";
import ProgramCard from "@/components/community/ProgramCard";

interface PreviewAsana {
  id: string;
  name: string;
  svgPath: string;
  category: string;
}

interface Creator {
  id: string;
  name: string;
  image: string | null;
}

interface Program {
  id: string;
  name: string;
  description: string | null;
  totalDuration: number;
  poseCount: number;
  creator: Creator | null;
  previewAsanas: PreviewAsana[];
}

interface SharedProgram {
  id: string;
  shareCode: string;
  views: number;
  copies: number;
  program: Program;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export default function CommunityPage() {
  const [programs, setPrograms] = useState<SharedProgram[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("popular");
  const [minDuration, setMinDuration] = useState("");
  const [maxDuration, setMaxDuration] = useState("");

  const fetchPrograms = useCallback(
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
          sort,
        });

        if (search) params.set("search", search);
        if (minDuration) params.set("minDuration", minDuration);
        if (maxDuration) params.set("maxDuration", maxDuration);

        const response = await fetch(`/api/community?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch programs");
        }

        const data = await response.json();

        if (append) {
          setPrograms((prev) => [...prev, ...data.programs]);
        } else {
          setPrograms(data.programs);
        }
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [search, sort, minDuration, maxDuration]
  );

  // Fetch on mount and when filters change
  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchPrograms(1, false);
    }, 300);

    return () => clearTimeout(debounce);
  }, [fetchPrograms]);

  const loadMore = () => {
    if (pagination && pagination.hasMore && !loadingMore) {
      fetchPrograms(pagination.page + 1, true);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSort("popular");
    setMinDuration("");
    setMaxDuration("");
  };

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
              <div className="w-10 h-10 bg-linear-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Community Programs
                </h1>
                <p className="text-sm text-gray-500">
                  Discover and copy programs shared by others
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="mb-6">
          <ProgramFilters
            search={search}
            onSearchChange={setSearch}
            sort={sort}
            onSortChange={setSort}
            minDuration={minDuration}
            onMinDurationChange={setMinDuration}
            maxDuration={maxDuration}
            onMaxDurationChange={setMaxDuration}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Results count */}
        {!loading && pagination && (
          <p className="text-sm text-gray-500 mb-4">
            {pagination.total === 0
              ? "No programs found"
              : `Showing ${programs.length} of ${pagination.total} programs`}
          </p>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-4" />
            <p className="text-gray-500">Loading community programs...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => fetchPrograms(1, false)}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && programs.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Programs Found
            </h2>
            <p className="text-gray-500 mb-6">
              {search || minDuration || maxDuration
                ? "Try adjusting your filters to find more programs."
                : "Be the first to share a program with the community!"}
            </p>
            {(search || minDuration || maxDuration) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Program grid */}
        {!loading && !error && programs.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {programs.map((item) => (
                <ProgramCard
                  key={item.id}
                  id={item.id}
                  shareCode={item.shareCode}
                  views={item.views}
                  copies={item.copies}
                  program={item.program}
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
                    <>Load More Programs</>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* Info section */}
        <div className="mt-12 bg-linear-to-r from-green-50 to-teal-50 rounded-xl border border-green-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Share Your Own Programs
          </h3>
          <p className="text-gray-600 mb-4">
            Created a great yoga program? Share it with the community! Go to any
            of your programs and click the share button to make it public.
          </p>
          <Link
            href="/program"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Create a Program
          </Link>
        </div>
      </main>
    </div>
  );
}
