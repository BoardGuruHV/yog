"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, ExternalLink } from "lucide-react";
import { Asana } from "@/types";

interface RecoveryPosesProps {
  poses: Asana[];
  title?: string;
  description?: string;
}

export default function RecoveryPoses({
  poses,
  title = "Suggested Recovery Poses",
  description,
}: RecoveryPosesProps) {
  if (poses.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {poses.map((pose) => (
          <Link
            key={pose.id}
            href={`/asana/${pose.id}`}
            className="group bg-gray-50 rounded-lg p-3 hover:bg-sage-50 transition-colors"
          >
            {/* Pose image */}
            <div className="aspect-square bg-white rounded-lg mb-2 flex items-center justify-center overflow-hidden">
              {pose.svgPath ? (
                <Image
                  src={pose.svgPath}
                  alt={pose.nameEnglish}
                  width={80}
                  height={80}
                  className="group-hover:scale-105 transition-transform"
                />
              ) : (
                <div className="text-3xl text-gray-300">🧘</div>
              )}
            </div>

            {/* Pose info */}
            <div>
              <h4 className="font-medium text-sm text-gray-900 group-hover:text-sage-700 truncate">
                {pose.nameEnglish}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {pose.nameSanskrit}
              </p>
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                <span>{Math.floor(pose.durationSeconds / 60)} min</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* View all link */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link
          href="/?category=SUPINE"
          className="flex items-center justify-center gap-2 text-sm text-sage-600 hover:text-sage-700 font-medium"
        >
          View all restorative poses
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
