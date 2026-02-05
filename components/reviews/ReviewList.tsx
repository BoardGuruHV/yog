"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  User,
  ThumbsUp,
  CheckCircle,
  Loader2,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";

interface Review {
  id: string;
  rating: number;
  title: string | null;
  review: string | null;
  helpful: number;
  verified: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface ReviewListProps {
  asanaId: string;
  currentUserId?: string;
}

export default function ReviewList({ asanaId, currentUserId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState("recent");
  const [showForm, setShowForm] = useState(false);
  const [votedReviews, setVotedReviews] = useState<Set<string>>(new Set());

  const fetchReviews = useCallback(
    async (page: number = 1, append: boolean = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({
          asanaId,
          page: page.toString(),
          limit: "10",
          sort,
        });

        const response = await fetch(`/api/reviews?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();

        if (append) {
          setReviews((prev) => [...prev, ...data.reviews]);
        } else {
          setReviews(data.reviews);
        }
        setStats(data.stats);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [asanaId, sort]
  );

  useEffect(() => {
    fetchReviews(1, false);
  }, [fetchReviews]);

  const handleVoteHelpful = async (reviewId: string) => {
    if (votedReviews.has(reviewId)) return;

    try {
      const response = await fetch("/api/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });

      if (response.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
          )
        );
        setVotedReviews((prev) => new Set(Array.from(prev).concat(reviewId)));
      }
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleReviewSuccess = () => {
    setShowForm(false);
    fetchReviews(1, false);
  };

  const loadMore = () => {
    if (pagination && pagination.hasMore && !loadingMore) {
      fetchReviews(pagination.page + 1, true);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const userReview = currentUserId
    ? reviews.find((r) => r.user.id === currentUserId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reviews & Ratings
          </h3>
          {stats && stats.totalReviews > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={stats.averageRating} size="sm" showValue />
              <span className="text-sm text-gray-500">
                ({stats.totalReviews} review
                {stats.totalReviews !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Sort dropdown */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-green-500"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating_high">Highest Rated</option>
            <option value="rating_low">Lowest Rated</option>
          </select>

          {/* Write review button */}
          {!showForm && !userReview && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Write a Review
            </button>
          )}
        </div>
      </div>

      {/* Rating distribution */}
      {stats && stats.totalReviews > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star] || 0;
              const percentage =
                stats.totalReviews > 0
                  ? (count / stats.totalReviews) * 100
                  : 0;

              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-16">
                    {star} star{star !== 1 && "s"}
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8 text-right">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Write Your Review</h4>
          <ReviewForm
            asanaId={asanaId}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* User's existing review */}
      {userReview && !showForm && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700">
              Your Review
            </span>
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-green-600 hover:text-green-700"
            >
              Edit
            </button>
          </div>
          <StarRating rating={userReview.rating} size="sm" />
          {userReview.title && (
            <p className="font-medium text-gray-900 mt-2">{userReview.title}</p>
          )}
          {userReview.review && (
            <p className="text-gray-600 text-sm mt-1">{userReview.review}</p>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-green-500 animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => fetchReviews(1, false)}
            className="mt-2 text-sm text-red-700 hover:underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && reviews.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No reviews yet. Be the first to share your experience!</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-green-600 hover:text-green-700 font-medium"
            >
              Write a Review
            </button>
          )}
        </div>
      )}

      {/* Reviews list */}
      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews
            .filter((r) => r.user.id !== currentUserId)
            .map((review) => (
              <div
                key={review.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {review.user.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {review.user.name}
                        </span>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  <StarRating rating={review.rating} size="sm" />
                </div>

                {/* Content */}
                <div className="mt-3">
                  {review.title && (
                    <p className="font-medium text-gray-900">{review.title}</p>
                  )}
                  {review.review && (
                    <p className="text-gray-600 mt-1">{review.review}</p>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => handleVoteHelpful(review.id)}
                    disabled={
                      votedReviews.has(review.id) ||
                      review.user.id === currentUserId
                    }
                    className={`flex items-center gap-1 text-sm transition-colors ${
                      votedReviews.has(review.id)
                        ? "text-green-600"
                        : "text-gray-500 hover:text-green-600"
                    } disabled:cursor-not-allowed`}
                  >
                    <ThumbsUp
                      className={`w-4 h-4 ${
                        votedReviews.has(review.id) ? "fill-current" : ""
                      }`}
                    />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Load more button */}
      {pagination && pagination.hasMore && (
        <div className="flex justify-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Load More Reviews
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
