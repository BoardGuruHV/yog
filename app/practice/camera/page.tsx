"use client";

import { useState } from "react";
import { Camera, Info, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
import { REFERENCE_POSES } from "@/lib/pose/analyzer";

// Dynamic import to avoid SSR issues with TensorFlow
const PoseCamera = dynamic(() => import("@/components/camera/PoseCamera"), {
  ssr: false,
  loading: () => (
    <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center">
      <div className="text-center text-white">
        <div className="w-12 h-12 border-4 border-sage-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p>Loading camera module...</p>
      </div>
    </div>
  ),
});

export default function CameraPracticePage() {
  const [selectedPose, setSelectedPose] = useState<string | null>(null);
  const [showTips, setShowTips] = useState(true);

  const poseOptions = Object.entries(REFERENCE_POSES).map(([key, pose]) => ({
    key,
    name: pose.name,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100 text-sage-700 rounded-full mb-4">
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">AI Pose Checker</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Check Your Alignment
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            Use your camera to get real-time feedback on your yoga poses.
            Our AI will help you perfect your form.
          </p>
        </div>

        {/* Pose Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select a pose to check (optional)
          </label>
          <div className="relative">
            <select
              value={selectedPose || ""}
              onChange={(e) => setSelectedPose(e.target.value || null)}
              className="w-full md:w-auto min-w-64 appearance-none bg-white border border-gray-300 rounded-xl px-4 py-3 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              <option value="">General posture check</option>
              {poseOptions.map((pose) => (
                <option key={pose.key} value={pose.key}>
                  {pose.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Camera Component */}
        <PoseCamera selectedPose={selectedPose} />

        {/* Tips Section */}
        <div className="mt-8">
          <button
            onClick={() => setShowTips(!showTips)}
            className="flex items-center gap-2 text-gray-700 font-medium mb-4"
          >
            <Info className="w-5 h-5" />
            Tips for best results
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showTips ? "rotate-180" : ""
              }`}
            />
          </button>

          {showTips && (
            <div className="bg-blue-50 rounded-xl p-6 space-y-3">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Good lighting</p>
                    <p className="text-sm text-gray-600">
                      Make sure you're well-lit from the front
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Full body visible</p>
                    <p className="text-sm text-gray-600">
                      Stand back so your entire body is in frame
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Contrasting clothes</p>
                    <p className="text-sm text-gray-600">
                      Wear clothes that contrast with your background
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 text-sm font-medium">4</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Clear space</p>
                    <p className="text-sm text-gray-600">
                      Remove clutter behind you for better detection
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-blue-100">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> All pose detection happens locally in
                  your browser. No video data is sent to any server.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Supported Poses */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Supported Poses
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {poseOptions.map((pose) => (
              <button
                key={pose.key}
                onClick={() => setSelectedPose(pose.key)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedPose === pose.key
                    ? "border-sage-500 bg-sage-50"
                    : "border-gray-200 hover:border-sage-300"
                }`}
              >
                <p className="font-medium text-gray-800">{pose.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
