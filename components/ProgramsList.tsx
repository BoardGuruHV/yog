"use client";

import { useState, useEffect } from "react";
import { Clock, Trash2, Pencil, Copy, Plus, Play } from "lucide-react";
import Link from "next/link";
import { Program } from "@/types";
import { useProgram } from "@/context/ProgramContext";

interface ProgramsListProps {
  onCreateNew: () => void;
}

export default function ProgramsList({ onCreateNew, onEdit }: ProgramsListProps & { onEdit: () => void }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const { loadProgram, duplicateProgram, state } = useProgram();

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/programs");
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this program?")) return;

    try {
      const response = await fetch(`/api/programs/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setPrograms(programs.filter((p) => p.id !== id));
      }
    } catch (error) {
      console.error("Error deleting program:", error);
    }
  };

  const handleEdit = (program: Program) => {
    loadProgram({
      id: program.id,
      name: program.name,
      description: program.description || "",
      asanas: program.asanas.map((pa) => ({
        ...pa,
        asana: pa.asana,
      })),
      totalDuration: program.totalDuration,
    });
    onEdit();
  };

  const handleDuplicate = (program: Program) => {
    duplicateProgram({
      id: program.id,
      name: program.name,
      description: program.description || "",
      asanas: program.asanas.map((pa) => ({
        ...pa,
        asana: pa.asana,
      })),
      totalDuration: program.totalDuration,
    });
    onEdit();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded-sm w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 rounded-sm w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Saved Programs</h2>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-sage-600 text-white px-4 py-2 rounded-lg hover:bg-sage-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Program
        </button>
      </div>

      {/* Programs List */}
      {programs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-dashed border-sage-200">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            No saved programs yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first yoga program by adding asanas from the library.
          </p>
          <button
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 bg-sage-600 text-white px-6 py-3 rounded-lg hover:bg-sage-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Program
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {programs.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-xl shadow-xs border border-sage-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {program.name}
                  </h3>
                  {program.description && (
                    <p className="text-gray-500 text-sm mt-1">
                      {program.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(program.totalDuration)}
                    </span>
                    <span>
                      {program.asanas.length} pose{program.asanas.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Asana thumbnails */}
                  <div className="flex items-center gap-2 mt-4">
                    {program.asanas.slice(0, 5).map((pa) => (
                      <div
                        key={pa.id}
                        className="w-10 h-10 bg-sage-50 rounded-lg flex items-center justify-center"
                        title={pa.asana?.nameEnglish}
                      >
                        <span className="text-xs text-sage-600 font-medium">
                          {pa.asana?.nameEnglish?.charAt(0)}
                        </span>
                      </div>
                    ))}
                    {program.asanas.length > 5 && (
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-500">
                          +{program.asanas.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/practice/timer/${program.id}`}
                    className="flex items-center gap-2 bg-sage-600 text-white px-3 py-2 rounded-lg hover:bg-sage-700 transition-colors"
                    title="Start timed practice"
                  >
                    <Play className="w-4 h-4" />
                    Practice
                  </Link>
                  <button
                    onClick={() => handleEdit(program)}
                    className="flex items-center gap-2 bg-sage-100 text-sage-700 px-3 py-2 rounded-lg hover:bg-sage-200 transition-colors"
                    title="Edit program"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDuplicate(program)}
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Create a copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(program.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete program"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current unsaved program indicator */}
      {state.asanas.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-yellow-800 text-sm">
            You have an unsaved program with {state.asanas.length} asana{state.asanas.length !== 1 ? "s" : ""}.
            Don't forget to save it!
          </p>
        </div>
      )}
    </div>
  );
}
