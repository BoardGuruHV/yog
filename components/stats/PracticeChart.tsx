"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface DailyData {
  date: string;
  minutes: number;
  sessions: number;
}

interface WeeklyData {
  week: string;
  minutes: number;
  sessions: number;
}

interface PracticeChartProps {
  dailyData: DailyData[];
  weeklyData: WeeklyData[];
}

type ViewType = "daily" | "weekly";
type MetricType = "minutes" | "sessions";

export default function PracticeChart({
  dailyData,
  weeklyData,
}: PracticeChartProps) {
  const [view, setView] = useState<ViewType>("daily");
  const [metric, setMetric] = useState<MetricType>("minutes");

  const data = view === "daily" ? dailyData : weeklyData;
  const dataKey = view === "daily" ? "date" : "week";

  // Format date for display
  const formatDate = (value: string) => {
    const date = new Date(value);
    if (view === "weekly") {
      return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Format tooltip
  const formatTooltipValue = (value: number) => {
    if (metric === "minutes") {
      if (value >= 60) {
        const hours = Math.floor(value / 60);
        const mins = value % 60;
        return `${hours}h ${mins}m`;
      }
      return `${value}m`;
    }
    return `${value} session${value !== 1 ? "s" : ""}`;
  };

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length && label) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-900">{formatDate(label)}</p>
          <p className="text-sm text-gray-600">
            {formatTooltipValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Practice Over Time</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No practice data yet. Start practicing to see your trends!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="font-semibold text-gray-900">Practice Over Time</h3>
        <div className="flex gap-2">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("daily")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                view === "daily"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setView("weekly")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                view === "weekly"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Weekly
            </button>
          </div>

          {/* Metric Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMetric("minutes")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                metric === "minutes"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Minutes
            </button>
            <button
              onClick={() => setMetric("sessions")}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                metric === "sessions"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Sessions
            </button>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {view === "daily" ? (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c9a73" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c9a73" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey={dataKey}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={metric}
                stroke="#7c9a73"
                strokeWidth={2}
                fill="url(#colorMetric)"
              />
            </AreaChart>
          ) : (
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey={dataKey}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={metric} fill="#7c9a73" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
