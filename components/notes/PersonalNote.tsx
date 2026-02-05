"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  FileText,
  Edit,
  Save,
  X,
  Loader2,
  Tag,
  Trash2,
} from "lucide-react";
import TagInput from "./TagInput";

interface UserNote {
  id: string;
  note: string | null;
  tags: string[];
  updatedAt: string;
}

interface PersonalNoteProps {
  asanaId: string;
  asanaName: string;
}

export default function PersonalNote({ asanaId, asanaName }: PersonalNoteProps) {
  const { data: session } = useSession();
  const [note, setNote] = useState<UserNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetchNote();
    } else {
      setLoading(false);
    }
  }, [session, asanaId]);

  const fetchNote = async () => {
    try {
      const res = await fetch(`/api/notes?asanaId=${asanaId}`);
      if (res.ok) {
        const data = await res.json();
        setNote(data.note);
        if (data.note) {
          setNoteText(data.note.note || "");
          setTags(data.note.tags || []);
        }
      }
    } catch (error) {
      console.error("Error fetching note:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asanaId,
          note: noteText.trim(),
          tags,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNote(data.note);
        setEditing(false);
      }
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your note for this asana?")) {
      return;
    }

    try {
      const res = await fetch(`/api/notes?asanaId=${asanaId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNote(null);
        setNoteText("");
        setTags([]);
        setEditing(false);
      }
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const handleCancel = () => {
    setNoteText(note?.note || "");
    setTags(note?.tags || []);
    setEditing(false);
  };

  const startEditing = () => {
    setNoteText(note?.note || "");
    setTags(note?.tags || []);
    setEditing(true);
  };

  if (!session?.user) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-6">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-sage-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <FileText className="w-4 h-4 text-sage-600" />
          My Notes
        </h3>
        {!editing && (
          <div className="flex items-center gap-2">
            {note && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete note"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={startEditing}
              className="p-1.5 text-gray-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors"
              title={note ? "Edit note" : "Add note"}
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {editing ? (
          <div className="space-y-4">
            {/* Note Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Notes
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={`Add your personal notes about ${asanaName}...`}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent resize-none text-sm"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <TagInput tags={tags} onChange={setTags} />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCancel}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
              >
                <X className="w-4 h-4 inline mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-3 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 text-sm"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 inline mr-1" />
                )}
                Save
              </button>
            </div>
          </div>
        ) : note ? (
          <div className="space-y-3">
            {/* Note Text */}
            {note.note && (
              <p className="text-gray-700 text-sm whitespace-pre-wrap">
                {note.note}
              </p>
            )}

            {/* Tags */}
            {note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-sage-50 text-sage-600 rounded-full text-xs"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Last Updated */}
            <p className="text-xs text-gray-400">
              Last updated{" "}
              {new Date(note.updatedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        ) : (
          <button
            onClick={startEditing}
            className="w-full py-6 text-center text-gray-400 hover:text-sage-600 hover:bg-sage-50 rounded-lg transition-colors"
          >
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Add personal notes and tags</p>
          </button>
        )}
      </div>
    </div>
  );
}
