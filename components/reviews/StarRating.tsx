"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

export default function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const displayRating = hoverRating || rating;

  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index);
    }
  };

  const handleMouseEnter = (index: number) => {
    if (interactive) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= displayRating;
          const isHalfFilled =
            !isFilled &&
            starIndex - 0.5 <= displayRating &&
            displayRating < starIndex;

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleClick(starIndex)}
              onMouseEnter={() => handleMouseEnter(starIndex)}
              disabled={!interactive}
              className={`relative ${
                interactive
                  ? "cursor-pointer hover:scale-110 transition-transform"
                  : "cursor-default"
              } disabled:cursor-default`}
            >
              {/* Background (empty) star */}
              <Star
                className={`${sizeClasses[size]} text-gray-200 fill-gray-200`}
              />

              {/* Filled overlay */}
              {(isFilled || isHalfFilled) && (
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: isHalfFilled ? "50%" : "100%" }}
                >
                  <Star
                    className={`${sizeClasses[size]} text-yellow-400 fill-yellow-400`}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="ml-1 text-sm text-gray-600 font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
