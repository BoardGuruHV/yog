"use client";

import { useState } from "react";
import {
  Box,
  Eye,
  X,
  Info,
} from "lucide-react";

interface PoseViewer3DProps {
  asanaId: string;
  asanaName: string;
  modelPath?: string;
}

// Placeholder component while 3D viewer is being developed
function Viewer3DPlaceholder({ asanaName }: { asanaName: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
        <Box className="w-12 h-12 text-indigo-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        3D Viewer Coming Soon
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-xs">
        Interactive 3D models for {asanaName} are being prepared. Check back soon!
      </p>
    </div>
  );
}

export default function PoseViewer3D({
  asanaId,
  asanaName,
  modelPath,
}: PoseViewer3DProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Expanded fullscreen view
  if (isExpanded) {
    return (
      <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white">
          <div>
            <h2 className="text-xl font-semibold">{asanaName}</h2>
            <p className="text-sm text-gray-400">3D Pose Viewer</p>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Placeholder */}
        <div className="flex-1">
          <Viewer3DPlaceholder asanaName={asanaName} />
        </div>

        {/* Instructions */}
        <div className="p-4 text-center text-gray-400 text-sm">
          3D models are being prepared for future release
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Box className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">3D Pose Viewer</h3>
            <p className="text-sm text-gray-500">Interactive 3D model</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Fullscreen"
        >
          <Eye className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Placeholder */}
      <div className="h-64">
        <Viewer3DPlaceholder asanaName={asanaName} />
      </div>

      {/* Info */}
      <div className="p-4 border-t border-gray-100 bg-blue-50">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-700">
            3D pose models are being developed. Soon you&apos;ll be able to rotate and explore poses from any angle.
          </p>
        </div>
      </div>
    </div>
  );
}

// Compact button to open 3D viewer in modal
export function PoseViewer3DButton({
  asanaId,
  asanaName,
}: {
  asanaId: string;
  asanaName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors group w-full text-left"
      >
        <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
          <Box className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm">View in 3D</p>
          <p className="text-xs text-gray-500">Coming soon</p>
        </div>
        <Eye className="w-5 h-5 text-indigo-400" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          <div className="flex items-center justify-between p-4 text-white">
            <div>
              <h2 className="text-xl font-semibold">{asanaName}</h2>
              <p className="text-sm text-gray-400">3D Pose Viewer</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1">
            <Viewer3DPlaceholder asanaName={asanaName} />
          </div>

          <div className="p-4 text-center text-gray-400 text-sm">
            3D models are being prepared for future release
          </div>
        </div>
      )}
    </>
  );
}
