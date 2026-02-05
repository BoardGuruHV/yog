"use client";

import { useState } from "react";
import {
  Bell,
  Clock,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  Play,
  BellOff,
} from "lucide-react";
import Link from "next/link";

export interface Reminder {
  id: string;
  title: string;
  time: string;
  days: string[];
  programId: string | null;
  programName: string | null;
  enabled: boolean;
  notifyBefore: number;
}

interface ReminderCardProps {
  reminder: Reminder;
  onToggle?: (id: string, enabled: boolean) => void;
  onDelete?: (id: string) => void;
  onEdit?: (reminder: Reminder) => void;
}

const DAY_LABELS: Record<string, string> = {
  mon: "M",
  tue: "T",
  wed: "W",
  thu: "T",
  fri: "F",
  sat: "S",
  sun: "S",
};

const DAY_FULL_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const ALL_DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export default function ReminderCard({
  reminder,
  onToggle,
  onDelete,
  onEdit,
}: ReminderCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDaysDescription = () => {
    if (reminder.days.length === 7) return "Every day";
    if (
      reminder.days.length === 5 &&
      reminder.days.every((d) => ["mon", "tue", "wed", "thu", "fri"].includes(d))
    ) {
      return "Weekdays";
    }
    if (
      reminder.days.length === 2 &&
      reminder.days.every((d) => ["sat", "sun"].includes(d))
    ) {
      return "Weekends";
    }
    if (reminder.days.length === 1) {
      return `Every ${DAY_FULL_LABELS[reminder.days[0]]}`;
    }
    return reminder.days.map((d) => DAY_FULL_LABELS[d]).join(", ");
  };

  return (
    <div
      className={`bg-white rounded-xl border shadow-xs p-4 transition-all ${
        reminder.enabled ? "border-gray-100" : "border-gray-100 opacity-60"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {/* Toggle Button */}
          <button
            onClick={() => onToggle?.(reminder.id, !reminder.enabled)}
            className={`p-2 rounded-full transition-colors ${
              reminder.enabled
                ? "bg-sage-100 text-sage-600"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {reminder.enabled ? (
              <Bell className="w-5 h-5" />
            ) : (
              <BellOff className="w-5 h-5" />
            )}
          </button>

          <div>
            <h3 className="font-semibold text-gray-800">{reminder.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatTime(reminder.time)}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{getDaysDescription()}</p>

            {reminder.programName && (
              <Link
                href={`/practice/guided/${reminder.programId}`}
                className="inline-flex items-center gap-1 mt-2 text-sm text-sage-600 hover:text-sage-700"
              >
                <Play className="w-3 h-3" />
                {reminder.programName}
              </Link>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[120px]">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit?.(reminder);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete?.(reminder.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Days indicator */}
      <div className="flex gap-1 mt-4">
        {ALL_DAYS.map((day) => (
          <div
            key={day}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              reminder.days.includes(day)
                ? reminder.enabled
                  ? "bg-sage-500 text-white"
                  : "bg-gray-300 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {DAY_LABELS[day]}
          </div>
        ))}
      </div>
    </div>
  );
}
