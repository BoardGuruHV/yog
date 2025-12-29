"use client";

import { useMemo } from "react";

interface HeatmapData {
  date: string;
  value: number;
  sessions: number;
}

interface ActivityHeatmapProps {
  data: HeatmapData[];
}

export default function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Create a map for quick lookup
  const dataMap = useMemo(() => {
    const map = new Map<string, HeatmapData>();
    data.forEach((d) => map.set(d.date, d));
    return map;
  }, [data]);

  // Generate last 365 days
  const days = useMemo(() => {
    const result: { date: Date; dateStr: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      result.push({
        date,
        dateStr: date.toISOString().split("T")[0],
      });
    }
    return result;
  }, []);

  // Group by weeks
  const weeks = useMemo(() => {
    const result: { date: Date; dateStr: string }[][] = [];
    let currentWeek: { date: Date; dateStr: string }[] = [];

    // Find the first Sunday (or pad the start)
    const firstDay = days[0].date.getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push({ date: new Date(0), dateStr: "" });
    }

    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });

    // Pad the last week if needed
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ date: new Date(0), dateStr: "" });
      }
      result.push(currentWeek);
    }

    return result;
  }, [days]);

  // Get intensity color
  const getColor = (minutes: number) => {
    if (minutes === 0) return "bg-gray-100";
    if (minutes < 10) return "bg-green-200";
    if (minutes < 20) return "bg-green-300";
    if (minutes < 30) return "bg-green-400";
    if (minutes < 45) return "bg-green-500";
    return "bg-green-600";
  };

  // Month labels
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find((d) => d.dateStr);
      if (firstValidDay) {
        const month = firstValidDay.date.getMonth();
        if (month !== lastMonth) {
          labels.push({
            month: firstValidDay.date.toLocaleDateString("en-US", {
              month: "short",
            }),
            weekIndex,
          });
          lastMonth = month;
        }
      }
    });

    return labels;
  }, [weeks]);

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Calculate stats
  const stats = useMemo(() => {
    const totalMinutes = data.reduce((sum, d) => sum + d.value, 0);
    const totalDays = data.filter((d) => d.value > 0).length;
    const totalSessions = data.reduce((sum, d) => sum + d.sessions, 0);
    return { totalMinutes, totalDays, totalSessions };
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Activity Calendar</h3>
        <div className="text-sm text-gray-500">
          {stats.totalDays} days, {Math.round(stats.totalMinutes / 60)}h total
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1 ml-8">
            {monthLabels.map((label, i) => (
              <div
                key={i}
                className="text-xs text-gray-400"
                style={{
                  marginLeft: i === 0 ? `${label.weekIndex * 12}px` : undefined,
                  width:
                    i < monthLabels.length - 1
                      ? `${(monthLabels[i + 1].weekIndex - label.weekIndex) * 12}px`
                      : undefined,
                }}
              >
                {label.month}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-2 text-xs text-gray-400">
              {dayLabels.map((day, i) => (
                <div key={day} className="h-[10px] flex items-center">
                  {i % 2 === 1 ? day : ""}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-0.5">
                  {week.map((day, dayIndex) => {
                    const dayData = day.dateStr
                      ? dataMap.get(day.dateStr)
                      : null;
                    const minutes = dayData?.value || 0;
                    const sessions = dayData?.sessions || 0;
                    const isToday =
                      day.dateStr ===
                      new Date().toISOString().split("T")[0];

                    if (!day.dateStr) {
                      return (
                        <div
                          key={dayIndex}
                          className="w-[10px] h-[10px]"
                        />
                      );
                    }

                    return (
                      <div
                        key={dayIndex}
                        className={`w-[10px] h-[10px] rounded-sm ${getColor(
                          minutes
                        )} ${isToday ? "ring-1 ring-gray-400" : ""} cursor-pointer transition-colors hover:ring-1 hover:ring-gray-300`}
                        title={`${day.date.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}: ${minutes}m (${sessions} session${sessions !== 1 ? "s" : ""})`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
            <span>Less</span>
            <div className="flex gap-0.5">
              <div className="w-[10px] h-[10px] rounded-sm bg-gray-100" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-200" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-300" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-400" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-500" />
              <div className="w-[10px] h-[10px] rounded-sm bg-green-600" />
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
