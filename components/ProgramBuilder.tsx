"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useProgram } from "@/context/ProgramContext";
import SortableAsanaItem from "./SortableAsanaItem";
import { Save, Trash2, Clock, Pencil } from "lucide-react";
import Link from "next/link";

interface ProgramBuilderProps {
  onSaved?: () => void;
}

export default function ProgramBuilder({ onSaved }: ProgramBuilderProps) {
  const {
    state,
    reorderAsanas,
    updateName,
    updateDescription,
    clearProgram,
  } = useProgram();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = state.asanas.findIndex((a) => a.id === active.id);
      const newIndex = state.asanas.findIndex((a) => a.id === over.id);
      const newOrder = arrayMove(state.asanas, oldIndex, newIndex);
      reorderAsanas(newOrder);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    if (secs === 0) return `${mins} min`;
    return `${mins} min ${secs}s`;
  };

  const handleSave = async () => {
    if (state.asanas.length === 0) return;

    setSaving(true);
    try {
      const isEditing = state.id !== null;
      const url = isEditing ? `/api/programs/${state.id}` : "/api/programs";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name || "Untitled Program",
          description: state.description,
          asanas: state.asanas.map((a) => ({
            asanaId: a.asanaId,
            duration: a.duration,
            notes: a.notes,
          })),
        }),
      });

      if (response.ok) {
        setSaved(true);
        clearProgram();
        setTimeout(() => {
          setSaved(false);
          if (onSaved) onSaved();
        }, 1500);
      }
    } catch (error) {
      console.error("Error saving program:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Program Header */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-sage-100">
        {/* Edit Mode Indicator */}
        {state.id && (
          <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            <Pencil className="w-4 h-4" />
            <span>Editing existing program — changes will update the original</span>
          </div>
        )}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1 space-y-4">
            <input
              type="text"
              value={state.name}
              onChange={(e) => updateName(e.target.value)}
              placeholder="Program Name"
              className="text-2xl font-bold text-gray-800 bg-transparent border-none outline-none w-full placeholder-gray-300"
            />
            <textarea
              value={state.description}
              onChange={(e) => updateDescription(e.target.value)}
              placeholder="Add a description for your program..."
              rows={2}
              className="w-full text-gray-600 bg-transparent border-none outline-none resize-none placeholder-gray-300"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-2 text-sage-600">
                <Clock className="w-5 h-5" />
                <span className="text-lg font-semibold">
                  {formatDuration(state.totalDuration)}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {state.asanas.length} pose{state.asanas.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Asana List */}
      {state.asanas.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-dashed border-sage-200">
          <div className="text-6xl mb-4">🧘‍♀️</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Your program is empty
          </h3>
          <p className="text-gray-500 mb-6">
            Go to the Asana Library and click the + button on poses to add them
            to your program.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-sage-600 text-white px-6 py-3 rounded-lg hover:bg-sage-700 transition-colors"
          >
            Browse Asanas
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={state.asanas.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {state.asanas.map((programAsana, index) => (
                <SortableAsanaItem
                  key={programAsana.id}
                  programAsana={programAsana}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Action Buttons */}
      {state.asanas.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors disabled:opacity-50 ${
              saved
                ? "bg-green-600 text-white"
                : "bg-sage-600 text-white hover:bg-sage-700"
            }`}
          >
            <Save className="w-5 h-5" />
            {saving
              ? "Saving..."
              : saved
              ? "Saved!"
              : state.id
              ? "Update Program"
              : "Save Program"}
          </button>
          <button
            onClick={clearProgram}
            className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
