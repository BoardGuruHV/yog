"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface CategoryData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface TimeOfDayData {
  name: string;
  value: number;
  time: string;
  [key: string]: string | number;
}

interface BodyPartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

interface CategoryBreakdownProps {
  categories: CategoryData[];
  timeOfDay: TimeOfDayData[];
  bodyParts: BodyPartData[];
}

const CATEGORY_COLORS = [
  "#7c9a73", // sage
  "#60a5fa", // blue
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#ef4444", // red
  "#22c55e", // green
  "#f97316", // orange
];

const TIME_COLORS = {
  Morning: "#fbbf24",
  Afternoon: "#f97316",
  Evening: "#8b5cf6",
  Night: "#3b82f6",
};

export default function CategoryBreakdown({
  categories,
  timeOfDay,
  bodyParts,
}: CategoryBreakdownProps) {
  const hasCategories = categories.length > 0;
  const hasTimeData = timeOfDay.some((t) => t.value > 0);
  const hasBodyParts = bodyParts.length > 0;

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload?: { time?: string } }>
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value} {payload[0].value === 1 ? "practice" : "practices"}
          </p>
          {payload[0].payload?.time && (
            <p className="text-xs text-gray-400">{payload[0].payload.time}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Category Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Pose Categories</h3>
        {hasCategories ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categories.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => (
                    <span className="text-xs text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
            No category data yet
          </div>
        )}
      </div>

      {/* Time of Day */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Practice Time</h3>
        {hasTimeData ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={timeOfDay}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {timeOfDay.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={TIME_COLORS[entry.name as keyof typeof TIME_COLORS] || "#6b7280"}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value, entry) => (
                    <span className="text-xs text-gray-600">
                      {value}{" "}
                      <span className="text-gray-400">
                        ({(entry.payload as TimeOfDayData)?.time})
                      </span>
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
            No time data yet
          </div>
        )}
      </div>

      {/* Body Parts Focus */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Body Parts Focus</h3>
        {hasBodyParts ? (
          <div className="space-y-3">
            {bodyParts.slice(0, 8).map((part, index) => {
              const maxValue = Math.max(...bodyParts.map((p) => p.value));
              const percentage = (part.value / maxValue) * 100;

              return (
                <div key={part.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 capitalize">{part.name}</span>
                    <span className="text-gray-500">{part.value}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
            No body part data yet
          </div>
        )}
      </div>
    </div>
  );
}
