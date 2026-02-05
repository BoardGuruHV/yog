"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Snowflake } from "lucide-react";

interface PracticeDay {
  date: string;
  duration: number;
  sessions: number;
  wasFrozen: boolean;
}

interface StreakCalendarProps {
  practiceDays: PracticeDay[];
}

export default function StreakCalendar({ practiceDays }: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Create a map for quick lookup
  const practiceMap = new Map<string, PracticeDay>();
  practiceDays.forEach((pd) => {
    practiceMap.set(pd.date, pd);
  });

  // Get calendar data
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  // Check if we can go to next month (don't go beyond current month)
  const canGoNext = month < today.getMonth() || year < today.getFullYear();

  // Generate calendar days
  const calendarDays: (number | null)[] = [];

  // Add empty cells for days before the first of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get intensity class based on duration
  const getIntensityClass = (duration: number) => {
    if (duration >= 60) return "bg-green-600 text-white";
    if (duration >= 30) return "bg-green-500 text-white";
    if (duration >= 15) return "bg-green-400 text-white";
    if (duration > 0) return "bg-green-300 text-green-900";
    return "";
  };

  // Count stats for the month
  const monthStats = {
    totalDays: 0,
    totalMinutes: 0,
    frozenDays: 0,
  };

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const practice = practiceMap.get(dateStr);
    if (practice) {
      if (practice.wasFrozen) {
        monthStats.frozenDays++;
      } else {
        monthStats.totalDays++;
        monthStats.totalMinutes += practice.duration;
      }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Practice Calendar</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousMonth}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNextMonth}
            disabled={!canGoNext}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Month Title */}
      <div className="text-center mb-4">
        <h4 className="text-lg font-medium text-gray-900">
          {monthNames[month]} {year}
        </h4>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const practice = practiceMap.get(dateStr);
          const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();
          const isFuture = new Date(year, month, day) > today;

          return (
            <div
              key={`day-${day}`}
              className={`
                aspect-square rounded-lg flex flex-col items-center justify-center relative
                text-sm transition-colors
                ${isFuture ? "text-gray-300" : "text-gray-700"}
                ${isToday ? "ring-2 ring-purple-500 ring-offset-1" : ""}
                ${practice && !practice.wasFrozen ? getIntensityClass(practice.duration) : ""}
                ${practice?.wasFrozen ? "bg-blue-100" : ""}
                ${!practice && !isFuture ? "hover:bg-gray-50" : ""}
              `}
              title={
                practice
                  ? practice.wasFrozen
                    ? "Streak freeze used"
                    : `${practice.duration} min (${practice.sessions} session${practice.sessions > 1 ? "s" : ""})`
                  : undefined
              }
            >
              <span className={practice && !practice.wasFrozen ? "font-medium" : ""}>
                {day}
              </span>
              {practice?.wasFrozen && (
                <Snowflake className="w-3 h-3 text-blue-500 absolute bottom-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-300" />
          <span>&lt;15m</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-400" />
          <span>15-30m</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-500" />
          <span>30-60m</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-green-600" />
          <span>60m+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-blue-100" />
          <Snowflake className="w-3 h-3 text-blue-500" />
          <span>Frozen</span>
        </div>
      </div>

      {/* Month Stats */}
      <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xl font-bold text-gray-900">
            {monthStats.totalDays}
          </div>
          <div className="text-xs text-gray-500">Days Practiced</div>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900">
            {Math.round(monthStats.totalMinutes / 60 * 10) / 10}h
          </div>
          <div className="text-xs text-gray-500">Total Time</div>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900">
            {monthStats.frozenDays}
          </div>
          <div className="text-xs text-gray-500">Freezes Used</div>
        </div>
      </div>
    </div>
  );
}
