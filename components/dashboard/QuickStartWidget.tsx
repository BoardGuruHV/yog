"use client";

import Link from "next/link";
import {
  Play,
  Sparkles,
  Wind,
  Camera,
  BookOpen,
  Plus,
} from "lucide-react";

const quickActions = [
  {
    icon: Play,
    label: "Continue Program",
    description: "Resume your last session",
    href: "/program",
    color: "bg-sage-500 hover:bg-sage-600",
  },
  {
    icon: Sparkles,
    label: "AI Generate",
    description: "Create a new program",
    href: "/generate",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    icon: Wind,
    label: "Breathing",
    description: "Start pranayama practice",
    href: "/practice/breathing",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    icon: Camera,
    label: "Pose Check",
    description: "Check your alignment",
    href: "/practice/camera",
    color: "bg-orange-500 hover:bg-orange-600",
  },
];

export default function QuickStartWidget() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Quick Start</h3>
        <Link
          href="/"
          className="text-sm text-sage-600 hover:text-sage-700 flex items-center gap-1"
        >
          <BookOpen className="w-4 h-4" />
          Browse
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              href={action.href}
              className={`${action.color} text-white rounded-xl p-4 transition-all hover:scale-[1.02] hover:shadow-md`}
            >
              <Icon className="w-6 h-6 mb-2" />
              <p className="font-medium text-sm">{action.label}</p>
              <p className="text-xs opacity-80 mt-0.5">{action.description}</p>
            </Link>
          );
        })}
      </div>

      {/* Create new program button */}
      <Link
        href="/program"
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-sage-200 rounded-xl text-sage-600 hover:border-sage-400 hover:bg-sage-50 transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Build Custom Program</span>
      </Link>
    </div>
  );
}
