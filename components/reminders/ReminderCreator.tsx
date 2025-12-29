"use client";

import { useState, useEffect } from "react";
import { X, Clock, Calendar, Bell, Play } from "lucide-react";
import type { Reminder } from "./ReminderCard";

interface Program {
  id: string;
  name: string;
  totalDuration: number;
}

interface ReminderCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Partial<Reminder>) => void;
  editingReminder?: Reminder | null;
  programs?: Program[];
}

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const QUICK_DAYS = [
  { label: "Every Day", days: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] },
  { label: "Weekdays", days: ["mon", "tue", "wed", "thu", "fri"] },
  { label: "Weekends", days: ["sat", "sun"] },
];

const NOTIFY_OPTIONS = [
  { value: 5, label: "5 minutes before" },
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
];

export default function ReminderCreator({
  isOpen,
  onClose,
  onSave,
  editingReminder,
  programs = [],
}: ReminderCreatorProps) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("07:00");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [programId, setProgramId] = useState<string>("");
  const [notifyBefore, setNotifyBefore] = useState(15);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingReminder) {
      setTitle(editingReminder.title);
      setTime(editingReminder.time);
      setSelectedDays(editingReminder.days);
      setProgramId(editingReminder.programId || "");
      setNotifyBefore(editingReminder.notifyBefore);
    } else {
      setTitle("");
      setTime("07:00");
      setSelectedDays(["mon", "tue", "wed", "thu", "fri"]);
      setProgramId("");
      setNotifyBefore(15);
    }
  }, [editingReminder, isOpen]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const setQuickDays = (days: string[]) => {
    setSelectedDays(days);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedDays.length === 0) return;

    setSaving(true);
    try {
      await onSave({
        id: editingReminder?.id,
        title: title.trim(),
        time,
        days: selectedDays,
        programId: programId || null,
        notifyBefore,
        enabled: editingReminder?.enabled ?? true,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {editingReminder ? "Edit Reminder" : "New Reminder"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Yoga Session"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              required
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              required
            />
          </div>

          {/* Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Repeat On
            </label>

            {/* Quick select */}
            <div className="flex gap-2 mb-3">
              {QUICK_DAYS.map((quick) => (
                <button
                  key={quick.label}
                  type="button"
                  onClick={() => setQuickDays(quick.days)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    JSON.stringify(selectedDays.sort()) ===
                    JSON.stringify(quick.days.sort())
                      ? "bg-sage-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {quick.label}
                </button>
              ))}
            </div>

            {/* Day buttons */}
            <div className="flex gap-2">
              {DAYS.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  onClick={() => toggleDay(day.key)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    selectedDays.includes(day.key)
                      ? "bg-sage-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
            {selectedDays.length === 0 && (
              <p className="text-red-500 text-xs mt-1">
                Please select at least one day
              </p>
            )}
          </div>

          {/* Linked Program */}
          {programs.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Play className="w-4 h-4 inline mr-1" />
                Link to Program (Optional)
              </label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
              >
                <option value="">No program linked</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name} ({Math.round(program.totalDuration / 60)} min)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notify Before */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Bell className="w-4 h-4 inline mr-1" />
              Notify Me
            </label>
            <select
              value={notifyBefore}
              onChange={(e) => setNotifyBefore(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              {NOTIFY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !title.trim() || selectedDays.length === 0}
              className="flex-1 px-4 py-2.5 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : editingReminder ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
