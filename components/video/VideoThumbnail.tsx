"use client";

import { Play, Clock, Star, User } from "lucide-react";

interface VideoThumbnailProps {
  platform: "youtube" | "vimeo" | "self-hosted";
  videoId: string;
  title: string;
  duration: number;
  thumbnail?: string;
  type?: string;
  instructor?: string;
  featured?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  full: { label: "Full Tutorial", color: "bg-purple-100 text-purple-700" },
  quick: { label: "Quick Guide", color: "bg-blue-100 text-blue-700" },
  modification: { label: "Modification", color: "bg-amber-100 text-amber-700" },
  tutorial: { label: "Step by Step", color: "bg-emerald-100 text-emerald-700" },
};

export default function VideoThumbnail({
  platform,
  videoId,
  title,
  duration,
  thumbnail,
  type,
  instructor,
  featured,
  onClick,
  compact = false,
}: VideoThumbnailProps) {
  // Generate thumbnail URL
  const getThumbnailUrl = () => {
    if (thumbnail) return thumbnail;

    switch (platform) {
      case "youtube":
        return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
      case "vimeo":
        return null; // Would need API call for Vimeo
      default:
        return null;
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const thumbnailUrl = getThumbnailUrl();
  const typeInfo = type ? TYPE_LABELS[type] : null;

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-sage-200 hover:shadow-md transition-all text-left group w-full"
      >
        <div className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center">
              <Play className="w-6 h-6 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
              <Play className="w-4 h-4 text-sage-700 ml-0.5" fill="currentColor" />
            </div>
          </div>
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/75 rounded text-xs text-white">
            {formatDuration(duration)}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-sage-700 transition-colors">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            {typeInfo && (
              <span className={`text-xs px-2 py-0.5 rounded ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            )}
            {instructor && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                {instructor}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="block bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-sage-200 hover:shadow-lg transition-all text-left group w-full"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-gray-100">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center">
            <Play className="w-16 h-16 text-white/80" />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
            <Play className="w-8 h-8 text-sage-700 ml-1" fill="currentColor" />
          </div>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/75 rounded text-sm text-white font-medium">
          {formatDuration(duration)}
        </div>

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-medium">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        {/* Type badge */}
        {typeInfo && (
          <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
            {typeInfo.label}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 group-hover:text-sage-700 transition-colors line-clamp-2">
          {title}
        </h3>
        {instructor && (
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <User className="w-4 h-4" />
            {instructor}
          </p>
        )}
      </div>
    </button>
  );
}
