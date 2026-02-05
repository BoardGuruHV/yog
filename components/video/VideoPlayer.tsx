"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";

interface VideoPlayerProps {
  platform: "youtube" | "vimeo" | "self-hosted";
  videoId: string;
  title?: string;
  thumbnail?: string;
  autoplay?: boolean;
  onClose?: () => void;
  className?: string;
}

export default function VideoPlayer({
  platform,
  videoId,
  title,
  thumbnail,
  autoplay = false,
  onClose,
  className = "",
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [showOverlay, setShowOverlay] = useState(!autoplay);

  const handlePlay = () => {
    setShowOverlay(false);
    setIsPlaying(true);
  };

  // Generate embed URL based on platform
  const getEmbedUrl = () => {
    switch (platform) {
      case "youtube":
        const ytParams = new URLSearchParams({
          autoplay: isPlaying ? "1" : "0",
          rel: "0",
          modestbranding: "1",
          enablejsapi: "1",
        });
        return `https://www.youtube.com/embed/${videoId}?${ytParams}`;

      case "vimeo":
        const vimeoParams = new URLSearchParams({
          autoplay: isPlaying ? "1" : "0",
          title: "0",
          byline: "0",
          portrait: "0",
        });
        return `https://player.vimeo.com/video/${videoId}?${vimeoParams}`;

      case "self-hosted":
        return videoId; // For self-hosted, videoId is the full URL

      default:
        return "";
    }
  };

  // Generate thumbnail URL
  const getThumbnailUrl = () => {
    if (thumbnail) return thumbnail;

    switch (platform) {
      case "youtube":
        return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      case "vimeo":
        // Vimeo thumbnails require API call, using placeholder
        return null;
      default:
        return null;
    }
  };

  const thumbnailUrl = getThumbnailUrl();

  if (platform === "self-hosted") {
    return (
      <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        <video
          src={videoId}
          controls
          autoPlay={autoplay}
          className="w-full aspect-video"
          poster={thumbnail}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-xl overflow-hidden ${className}`}>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {showOverlay && thumbnailUrl ? (
        <div
          className="relative aspect-video cursor-pointer group"
          onClick={handlePlay}
        >
          <img
            src={thumbnailUrl}
            alt={title || "Video thumbnail"}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
              <Play className="w-10 h-10 text-sage-700 ml-1" fill="currentColor" />
            </div>
          </div>
          {title && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent">
              <p className="text-white font-medium">{title}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video">
          <iframe
            src={getEmbedUrl()}
            title={title || "Video player"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      )}
    </div>
  );
}

// Modal wrapper for fullscreen video playback
interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: "youtube" | "vimeo" | "self-hosted";
  videoId: string;
  title?: string;
}

export function VideoModal({ isOpen, onClose, platform, videoId, title }: VideoModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-5xl"
        onClick={(e) => e.stopPropagation()}
      >
        <VideoPlayer
          platform={platform}
          videoId={videoId}
          title={title}
          autoplay
          onClose={onClose}
        />
      </div>
    </div>
  );
}
