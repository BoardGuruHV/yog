"use client";

import {
  Moon,
  Sparkles,
  Leaf,
  Activity,
  AlertTriangle,
  Clock,
  Flame,
  Calendar,
} from "lucide-react";

interface RestDayCardProps {
  recommendation: {
    type: "rest" | "gentle" | "restorative" | "active_recovery";
    title: string;
    description: string;
    suggestedDuration: number;
    focusAreas: string[];
    avoidAreas: string[];
  };
  analysis: {
    totalSessions: number;
    totalMinutes: number;
    averageSessionLength: number;
    daysSinceLastPractice: number;
    intensityScore: number;
    needsRest: boolean;
    restReasons: string[];
  };
}

const TYPE_ICONS = {
  rest: Moon,
  gentle: Leaf,
  restorative: Sparkles,
  active_recovery: Activity,
};

const TYPE_COLORS = {
  rest: "from-indigo-500 to-purple-600",
  gentle: "from-green-500 to-teal-600",
  restorative: "from-amber-500 to-orange-600",
  active_recovery: "from-blue-500 to-cyan-600",
};

const TYPE_BG_COLORS = {
  rest: "bg-indigo-50",
  gentle: "bg-green-50",
  restorative: "bg-amber-50",
  active_recovery: "bg-blue-50",
};

export default function RestDayCard({
  recommendation,
  analysis,
}: RestDayCardProps) {
  const Icon = TYPE_ICONS[recommendation.type];
  const gradientClass = TYPE_COLORS[recommendation.type];
  const bgClass = TYPE_BG_COLORS[recommendation.type];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header with gradient */}
      <div className={`bg-gradient-to-br ${gradientClass} p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-6 h-6" />
              <span className="text-sm font-medium uppercase tracking-wider opacity-90">
                Today&apos;s Recommendation
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{recommendation.title}</h2>
            <p className="text-white/80">{recommendation.description}</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{recommendation.suggestedDuration}</div>
            <div className="text-sm opacity-80">minutes</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 border-b border-gray-100">
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-gray-900">
            {analysis.totalSessions}
          </div>
          <div className="text-xs text-gray-500">sessions</div>
        </div>
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-gray-900">
            {analysis.totalMinutes}
          </div>
          <div className="text-xs text-gray-500">minutes</div>
        </div>
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-gray-900">
            {analysis.intensityScore}%
          </div>
          <div className="text-xs text-gray-500">intensity</div>
        </div>
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-xl font-bold text-gray-900">
            {analysis.daysSinceLastPractice === 999
              ? "—"
              : analysis.daysSinceLastPractice}
          </div>
          <div className="text-xs text-gray-500">days rest</div>
        </div>
      </div>

      {/* Rest reasons */}
      {analysis.needsRest && analysis.restReasons.length > 0 && (
        <div className="p-4 bg-amber-50 border-b border-amber-100">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800 text-sm">
                Signs you need recovery
              </p>
              <ul className="text-sm text-amber-700 mt-1 space-y-0.5">
                {analysis.restReasons.map((reason, i) => (
                  <li key={i}>• {reason}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Focus and avoid areas */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {recommendation.avoidAreas.length > 0 && (
          <div className={`rounded-lg p-3 ${bgClass}`}>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
              Give Rest To
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recommendation.avoidAreas.map((area) => (
                <span
                  key={area}
                  className="px-2 py-0.5 bg-white rounded text-xs text-gray-700 capitalize"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}

        {recommendation.focusAreas.length > 0 && (
          <div className="rounded-lg p-3 bg-green-50">
            <p className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-2">
              Can Work On
            </p>
            <div className="flex flex-wrap gap-1.5">
              {recommendation.focusAreas.map((area) => (
                <span
                  key={area}
                  className="px-2 py-0.5 bg-white rounded text-xs text-gray-700 capitalize"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
