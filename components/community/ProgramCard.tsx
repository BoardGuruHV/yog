"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Clock, Eye, Copy, Check, User } from "lucide-react";

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

interface ProgramCardProps {
  id: string;
  shareCode: string;
  views: number;
  copies: number;
  program: Program;
}

export default function ProgramCard({
  shareCode,
  views,
  copies,
  program,
}: ProgramCardProps) {
  const router = useRouter();
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours}h`;
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopying(true);

    try {
      const response = await fetch(`/api/share/${shareCode}`, {
        method: "POST",
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push(`/login?redirect=/community`);
          return;
        }
        throw new Error("Failed to copy");
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error copying program:", err);
    } finally {
      setCopying(false);
    }
  };

  const handleClick = () => {
    router.push(`/shared/${shareCode}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
    >
      {/* Preview Images */}
      <div className="relative h-32 bg-linear-to-br from-green-50 to-teal-50 p-3">
        <div className="flex justify-center items-center h-full gap-2">
          {program.previewAsanas.slice(0, 4).map((asana, index) => (
            <div
              key={asana.id}
              className="w-14 h-14 bg-white rounded-lg shadow-xs flex items-center justify-center overflow-hidden"
              style={{
                transform: `rotate(${(index - 1.5) * 3}deg)`,
              }}
            >
              {asana.svgPath ? (
                <Image
                  src={asana.svgPath}
                  alt={asana.name}
                  width={48}
                  height={48}
                  className="object-contain"
                />
              ) : (
                <span className="text-2xl">🧘</span>
              )}
            </div>
          ))}
          {program.poseCount > 4 && (
            <div className="w-14 h-14 bg-white/80 rounded-lg shadow-xs flex items-center justify-center text-sm font-medium text-gray-500">
              +{program.poseCount - 4}
            </div>
          )}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          disabled={copying || copied}
          className={`absolute top-2 right-2 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 ${
            copied
              ? "bg-green-100 text-green-600"
              : "bg-white/90 text-gray-600 hover:bg-white hover:text-green-600"
          } shadow-xs`}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : copying ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-green-600 transition-colors">
          {program.name}
        </h3>

        {/* Description */}
        {program.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
            {program.description}
          </p>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(program.totalDuration)}
            </span>
            <span>{program.poseCount} poses</span>
          </div>

          <div className="flex items-center gap-2 text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {views}
            </span>
            <span className="flex items-center gap-1">
              <Copy className="w-3.5 h-3.5" />
              {copies}
            </span>
          </div>
        </div>

        {/* Creator */}
        {program.creator && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            {program.creator.image ? (
              <Image
                src={program.creator.image}
                alt={program.creator.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-gray-400" />
              </div>
            )}
            <span className="text-xs text-gray-500">
              by {program.creator.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
