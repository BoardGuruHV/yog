"use client";

import { useState, useEffect } from "react";
import { Video, Loader2, Filter, Play } from "lucide-react";
import VideoThumbnail from "./VideoThumbnail";
import VideoPlayer, { VideoModal } from "./VideoPlayer";

interface AsanaVideo {
  id: string;
  asanaId: string;
  title: string;
  type: string;
  platform: "youtube" | "vimeo" | "self-hosted";
  videoId: string;
  duration: number;
  thumbnail: string | null;
  description: string | null;
  instructor: string | null;
  featured: boolean;
}

interface VideoGalleryProps {
  asanaId: string;
  asanaName?: string;
}

const VIDEO_TYPES = [
  { value: "all", label: "All Videos" },
  { value: "full", label: "Full Tutorial" },
  { value: "quick", label: "Quick Guide" },
  { value: "modification", label: "Modifications" },
  { value: "tutorial", label: "Step by Step" },
];

export default function VideoGallery({ asanaId, asanaName }: VideoGalleryProps) {
  const [videos, setVideos] = useState<AsanaVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<AsanaVideo | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [asanaId]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${asanaId}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVideos = videos.filter(
    (video) => selectedType === "all" || video.type === selectedType
  );

  const featuredVideo = filteredVideos.find((v) => v.featured);
  const otherVideos = filteredVideos.filter((v) => !v.featured || selectedType !== "all");

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Video className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Video Tutorials</h3>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-sage-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <Video className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Video Tutorials</h3>
        </div>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600">
            No videos available for this pose yet.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Check back later for video tutorials!
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Video className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Video Tutorials</h3>
              <p className="text-sm text-gray-500">
                {videos.length} video{videos.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>

          {/* Type Filter */}
          {videos.length > 1 && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-500"
              >
                {VIDEO_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Featured Video */}
        {featuredVideo && selectedType === "all" && (
          <div className="mb-6">
            <VideoThumbnail
              platform={featuredVideo.platform}
              videoId={featuredVideo.videoId}
              title={featuredVideo.title}
              duration={featuredVideo.duration}
              thumbnail={featuredVideo.thumbnail || undefined}
              type={featuredVideo.type}
              instructor={featuredVideo.instructor || undefined}
              featured
              onClick={() => setSelectedVideo(featuredVideo)}
            />
          </div>
        )}

        {/* Video Grid or List */}
        {otherVideos.length > 0 && (
          <div className={`${
            otherVideos.length === 1
              ? ""
              : otherVideos.length <= 3
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-3"
          }`}>
            {otherVideos.map((video) => (
              <VideoThumbnail
                key={video.id}
                platform={video.platform}
                videoId={video.videoId}
                title={video.title}
                duration={video.duration}
                thumbnail={video.thumbnail || undefined}
                type={video.type}
                instructor={video.instructor || undefined}
                featured={video.featured && selectedType !== "all"}
                onClick={() => setSelectedVideo(video)}
                compact={otherVideos.length > 3}
              />
            ))}
          </div>
        )}

        {filteredVideos.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            No videos found for this filter.
          </div>
        )}
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        platform={selectedVideo?.platform || "youtube"}
        videoId={selectedVideo?.videoId || ""}
        title={selectedVideo?.title}
      />
    </>
  );
}

// Compact version for sidebar or smaller spaces
export function VideoGalleryCompact({ asanaId }: { asanaId: string }) {
  const [videos, setVideos] = useState<AsanaVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<AsanaVideo | null>(null);

  useEffect(() => {
    fetchVideos();
  }, [asanaId]);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/videos/${asanaId}`);
      if (res.ok) {
        const data = await res.json();
        setVideos(data.videos);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || videos.length === 0) return null;

  const featuredVideo = videos.find((v) => v.featured) || videos[0];

  return (
    <>
      <button
        onClick={() => setSelectedVideo(featuredVideo)}
        className="flex items-center gap-3 p-3 bg-red-50 rounded-xl hover:bg-red-100 transition-colors group w-full text-left"
      >
        <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
          <Play className="w-5 h-5 text-red-600" fill="currentColor" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">Watch Video Tutorial</p>
          <p className="text-xs text-gray-500">
            {videos.length} video{videos.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </button>

      <VideoModal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        platform={selectedVideo?.platform || "youtube"}
        videoId={selectedVideo?.videoId || ""}
        title={selectedVideo?.title}
      />
    </>
  );
}
