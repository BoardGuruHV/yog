"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useSession } from "next-auth/react";

interface FavoriteButtonProps {
  asanaId: string;
  initialFavorited?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
  onToggle?: (isFavorited: boolean) => void;
}

export default function FavoriteButton({
  asanaId,
  initialFavorited = false,
  size = "md",
  showLabel = false,
  className = "",
  onToggle,
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited]);

  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      // Could redirect to login or show a message
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    const newState = !isFavorited;

    // Optimistic update
    setIsFavorited(newState);

    try {
      if (newState) {
        // Add to favorites
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asanaId }),
        });

        if (!res.ok) {
          throw new Error("Failed to add favorite");
        }
      } else {
        // Remove from favorites
        const res = await fetch(`/api/favorites?asanaId=${asanaId}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Failed to remove favorite");
        }
      }

      onToggle?.(newState);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert on error
      setIsFavorited(!newState);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return null; // Don't show button if not logged in
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
        ${sizeClasses[size]}
        rounded-full transition-all duration-200
        ${
          isFavorited
            ? "bg-red-50 text-red-500 hover:bg-red-100"
            : "bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-500"
        }
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
        ${showLabel ? "flex items-center gap-2 px-3" : ""}
        ${className}
      `}
      title={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        className={`${iconSizes[size]} transition-transform ${
          isFavorited ? "fill-current scale-110" : ""
        } ${isLoading ? "animate-pulse" : ""}`}
      />
      {showLabel && (
        <span className="text-sm font-medium">
          {isFavorited ? "Favorited" : "Favorite"}
        </span>
      )}
    </button>
  );
}
