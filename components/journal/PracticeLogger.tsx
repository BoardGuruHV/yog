"use client";

import { useState } from "react";
import { X, Clock, Tag, FileText, Sparkles } from "lucide-react";
import MoodSelector from "./MoodSelector";

interface PracticeLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  programId?: string;
  programName?: string;
  suggestedDuration?: number;
}

const SUGGESTED_TAGS = [
  "morning",
  "evening",
  "energizing",
  "relaxing",
  "quick",
  "full-session",
  "restorative",
  "challenging",
];

export default function PracticeLogger({
  isOpen,
  onClose,
  onSave,
  programId,
  programName,
  suggestedDuration,
}: PracticeLoggerProps) {
  const [duration, setDuration] = useState(suggestedDuration || 30);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
      setCustomTag("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId,
          programName,
          duration,
          moodBefore,
          moodAfter,
          energyLevel,
          notes: notes.trim() || null,
          tags,
        }),
      });

      if (res.ok) {
        onSave();
        onClose();
        // Reset form
        setDuration(suggestedDuration || 30);
        setMoodBefore(null);
        setMoodAfter(null);
        setEnergyLevel(null);
        setNotes("");
        setTags([]);
      }
    } catch (error) {
      console.error("Error logging practice:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sage-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-sage-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Log Your Practice
              </h2>
              {programName && (
                <p className="text-sm text-gray-500">{programName}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Duration (minutes)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5"
                max="120"
                step="5"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-sage-600"
              />
              <input
                type="number"
                min="1"
                max="300"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center"
              />
            </div>
          </div>

          {/* Mood Before */}
          <MoodSelector
            label="How did you feel before?"
            value={moodBefore}
            onChange={setMoodBefore}
            type="mood"
          />

          {/* Mood After */}
          <MoodSelector
            label="How do you feel now?"
            value={moodAfter}
            onChange={setMoodAfter}
            type="mood"
          />

          {/* Energy Level */}
          <MoodSelector
            label="Energy level"
            value={energyLevel}
            onChange={setEnergyLevel}
            type="energy"
          />

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {SUGGESTED_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    tags.includes(tag)
                      ? "bg-sage-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                placeholder="Add custom tag..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
              <button
                type="button"
                onClick={addCustomTag}
                disabled={!customTag.trim()}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 disabled:opacity-50"
              >
                Add
              </button>
            </div>
            {tags.filter((t) => !SUGGESTED_TAGS.includes(t)).length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags
                  .filter((t) => !SUGGESTED_TAGS.includes(t))
                  .map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-sm rounded-full bg-sage-500 text-white flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className="hover:bg-sage-600 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Journal Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your practice? Any insights or observations..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none"
            />
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
              disabled={saving || duration < 1}
              className="flex-1 px-4 py-2.5 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Log Practice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
