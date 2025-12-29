"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, X } from "lucide-react";
import StarRating from "./StarRating";

interface ReviewFormProps {
  asanaId: string;
  existingReview?: {
    rating: number;
    title: string | null;
    review: string | null;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  asanaId,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [review, setReview] = useState(existingReview?.review || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditing = !!existingReview;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asanaId,
          rating,
          title: title.trim() || null,
          review: review.trim() || null,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/login?redirect=/asana/${asanaId}`);
          return;
        }
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      // Success
      if (onSuccess) {
        onSuccess();
      }

      // Reset form if not editing
      if (!isEditing) {
        setRating(0);
        setTitle("");
        setReview("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <StarRating
            rating={rating}
            size="lg"
            interactive
            onChange={setRating}
          />
          <span className="text-sm text-gray-500">
            {rating === 0 && "Click to rate"}
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </span>
        </div>
      </div>

      {/* Title (optional) */}
      <div>
        <label
          htmlFor="review-title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Review text (optional) */}
      <div>
        <label
          htmlFor="review-text"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Your Review <span className="text-gray-400">(optional)</span>
        </label>
        <textarea
          id="review-text"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience with this pose. What did you like? Any tips for others?"
          rows={4}
          maxLength={1000}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">
          {review.length}/1000 characters
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 inline mr-1" />
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {isEditing ? "Update Review" : "Submit Review"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
