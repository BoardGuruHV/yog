"use client";

import { BodyPartActivity } from "@/lib/recovery/analyzer";

interface BodyHeatmapProps {
  bodyPartActivity: BodyPartActivity[];
}

// Body part positions for the front and back views (relative positioning)
const BODY_PART_POSITIONS: Record<
  string,
  { front?: { x: number; y: number }; back?: { x: number; y: number } }
> = {
  neck: { front: { x: 50, y: 12 }, back: { x: 50, y: 12 } },
  shoulders: { front: { x: 50, y: 20 }, back: { x: 50, y: 20 } },
  chest: { front: { x: 50, y: 30 } },
  arms: { front: { x: 20, y: 35 }, back: { x: 20, y: 35 } },
  wrists: { front: { x: 15, y: 50 }, back: { x: 15, y: 50 } },
  core: { front: { x: 50, y: 42 } },
  back: { back: { x: 50, y: 35 } },
  spine: { back: { x: 50, y: 45 } },
  hips: { front: { x: 50, y: 55 }, back: { x: 50, y: 55 } },
  glutes: { back: { x: 50, y: 60 } },
  hamstrings: { back: { x: 50, y: 72 } },
  legs: { front: { x: 50, y: 75 } },
  ankles: { front: { x: 50, y: 92 }, back: { x: 50, y: 92 } },
};

function getIntensityColor(intensity: number): string {
  if (intensity >= 80) return "bg-red-500";
  if (intensity >= 60) return "bg-orange-500";
  if (intensity >= 40) return "bg-yellow-500";
  if (intensity >= 20) return "bg-green-500";
  return "bg-slate-300";
}

function getIntensityLabel(intensity: number): string {
  if (intensity >= 80) return "Overworked";
  if (intensity >= 60) return "Heavy";
  if (intensity >= 40) return "Moderate";
  if (intensity >= 20) return "Light";
  return "Minimal";
}

export default function BodyHeatmap({ bodyPartActivity }: BodyHeatmapProps) {
  const activityMap = bodyPartActivity.reduce(
    (acc, bp) => {
      acc[bp.bodyPart] = bp;
      return acc;
    },
    {} as Record<string, BodyPartActivity>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Body Activity Map</h3>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-6 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-gray-600">Overworked</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span className="text-gray-600">Heavy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-gray-600">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-600">Light</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-300" />
          <span className="text-gray-600">Minimal</span>
        </div>
      </div>

      {/* Body diagrams */}
      <div className="grid grid-cols-2 gap-4">
        {/* Front view */}
        <div>
          <p className="text-xs text-gray-500 text-center mb-2">Front</p>
          <div className="relative bg-gray-50 rounded-lg aspect-2/3">
            {/* Simple body silhouette using CSS */}
            <svg
              viewBox="0 0 100 150"
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            >
              {/* Head */}
              <circle cx="50" cy="10" r="8" className="fill-gray-200 stroke-gray-300" />
              {/* Neck */}
              <rect x="47" y="18" width="6" height="6" className="fill-gray-200 stroke-gray-300" />
              {/* Torso */}
              <path
                d="M35 24 L65 24 L68 70 L32 70 Z"
                className="fill-gray-200 stroke-gray-300"
              />
              {/* Arms */}
              <path
                d="M35 24 L25 26 L20 55 L25 55 L30 35 L35 35"
                className="fill-gray-200 stroke-gray-300"
              />
              <path
                d="M65 24 L75 26 L80 55 L75 55 L70 35 L65 35"
                className="fill-gray-200 stroke-gray-300"
              />
              {/* Legs */}
              <path
                d="M32 70 L35 110 L42 110 L50 75 L58 110 L65 110 L68 70"
                className="fill-gray-200 stroke-gray-300"
              />
              {/* Feet */}
              <ellipse cx="38" cy="115" rx="5" ry="3" className="fill-gray-200 stroke-gray-300" />
              <ellipse cx="62" cy="115" rx="5" ry="3" className="fill-gray-200 stroke-gray-300" />
            </svg>

            {/* Activity indicators */}
            {Object.entries(BODY_PART_POSITIONS).map(([part, pos]) => {
              if (!pos.front) return null;
              const activity = activityMap[part];
              if (!activity || activity.intensity === 0) return null;

              return (
                <div
                  key={`front-${part}`}
                  className={`absolute w-4 h-4 rounded-full ${getIntensityColor(
                    activity.intensity
                  )} opacity-80 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform`}
                  style={{
                    left: `${pos.front.x}%`,
                    top: `${pos.front.y}%`,
                  }}
                  title={`${part}: ${getIntensityLabel(activity.intensity)} (${activity.count} exercises)`}
                />
              );
            })}
          </div>
        </div>

        {/* Back view */}
        <div>
          <p className="text-xs text-gray-500 text-center mb-2">Back</p>
          <div className="relative bg-gray-50 rounded-lg aspect-2/3">
            {/* Simple body silhouette using CSS */}
            <svg
              viewBox="0 0 100 150"
              className="w-full h-full"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            >
              {/* Head */}
              <circle cx="50" cy="10" r="8" className="fill-gray-200 stroke-gray-300" />
              {/* Neck */}
              <rect x="47" y="18" width="6" height="6" className="fill-gray-200 stroke-gray-300" />
              {/* Torso */}
              <path
                d="M35 24 L65 24 L68 70 L32 70 Z"
                className="fill-gray-200 stroke-gray-300"
              />
              {/* Arms */}
              <path
                d="M35 24 L25 26 L20 55 L25 55 L30 35 L35 35"
                className="fill-gray-200 stroke-gray-300"
              />
              <path
                d="M65 24 L75 26 L80 55 L75 55 L70 35 L65 35"
                className="fill-gray-200 stroke-gray-300"
              />
              {/* Legs */}
              <path
                d="M32 70 L35 110 L42 110 L50 75 L58 110 L65 110 L68 70"
                className="fill-gray-200 stroke-gray-300"
              />
              {/* Feet */}
              <ellipse cx="38" cy="115" rx="5" ry="3" className="fill-gray-200 stroke-gray-300" />
              <ellipse cx="62" cy="115" rx="5" ry="3" className="fill-gray-200 stroke-gray-300" />
            </svg>

            {/* Activity indicators */}
            {Object.entries(BODY_PART_POSITIONS).map(([part, pos]) => {
              if (!pos.back) return null;
              const activity = activityMap[part];
              if (!activity || activity.intensity === 0) return null;

              return (
                <div
                  key={`back-${part}`}
                  className={`absolute w-4 h-4 rounded-full ${getIntensityColor(
                    activity.intensity
                  )} opacity-80 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:scale-125 transition-transform`}
                  style={{
                    left: `${pos.back.x}%`,
                    top: `${pos.back.y}%`,
                  }}
                  title={`${part}: ${getIntensityLabel(activity.intensity)} (${activity.count} exercises)`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Detailed list */}
      <div className="mt-6 space-y-2">
        <p className="text-sm font-medium text-gray-700 mb-3">Activity Details</p>
        {bodyPartActivity
          .filter((bp) => bp.count > 0)
          .slice(0, 6)
          .map((bp) => (
            <div key={bp.bodyPart} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 capitalize">{bp.bodyPart}</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getIntensityColor(bp.intensity)} transition-all`}
                    style={{ width: `${bp.intensity}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">
                  {bp.count} {bp.count === 1 ? "time" : "times"}
                </span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
