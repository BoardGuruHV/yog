"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Clock, ChevronRight, BellOff, Plus } from "lucide-react";

interface Reminder {
  id: string;
  title: string;
  time: string;
  days: string[];
  enabled: boolean;
  programName: string | null;
}

const DAY_LABELS: Record<string, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};

export default function RemindersWidget() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const res = await fetch("/api/reminders");
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTodayReminders = () => {
    const today = new Date()
      .toLocaleDateString("en-US", { weekday: "short" })
      .toLowerCase()
      .slice(0, 3);
    return reminders.filter((r) => r.enabled && r.days.includes(today));
  };

  const getUpcomingReminder = () => {
    const todayReminders = getTodayReminders();
    if (todayReminders.length === 0) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const upcoming = todayReminders.find((r) => {
      const [hours, minutes] = r.time.split(":");
      const reminderMinutes = parseInt(hours) * 60 + parseInt(minutes);
      return reminderMinutes > currentMinutes;
    });

    return upcoming || null;
  };

  const enabledCount = reminders.filter((r) => r.enabled).length;
  const todayReminders = getTodayReminders();
  const upcomingReminder = getUpcomingReminder();

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-20 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Bell className="w-5 h-5 text-sage-600" />
          Reminders
        </h2>
        <Link
          href="/reminders"
          className="text-sage-600 hover:text-sage-700 text-sm flex items-center gap-1"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {reminders.length === 0 ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BellOff className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-500 text-sm mb-3">No reminders set</p>
          <Link
            href="/reminders"
            className="inline-flex items-center gap-1 text-sm text-sage-600 hover:text-sage-700"
          >
            <Plus className="w-4 h-4" />
            Add a reminder
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Today's Summary */}
          <div className="p-3 bg-sage-50 rounded-lg">
            <p className="text-sm text-sage-700">
              <span className="font-medium">{todayReminders.length}</span>{" "}
              reminder{todayReminders.length !== 1 ? "s" : ""} scheduled for
              today
            </p>
          </div>

          {/* Next Upcoming */}
          {upcomingReminder ? (
            <div className="p-3 bg-white border border-sage-200 rounded-lg">
              <p className="text-xs text-sage-600 font-medium mb-1">
                Next Up
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">
                    {upcomingReminder.title}
                  </p>
                  {upcomingReminder.programName && (
                    <p className="text-xs text-gray-500">
                      {upcomingReminder.programName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sage-600">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">
                    {formatTime(upcomingReminder.time)}
                  </span>
                </div>
              </div>
            </div>
          ) : todayReminders.length > 0 ? (
            <div className="p-3 bg-green-50 border border-green-100 rounded-lg">
              <p className="text-sm text-green-700">
                All reminders for today completed!
              </p>
            </div>
          ) : null}

          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <span className="text-sm text-gray-500">Active reminders</span>
            <span className="text-sm font-medium text-gray-700">
              {enabledCount} of {reminders.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
