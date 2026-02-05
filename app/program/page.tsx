"use client";

import { useState } from "react";
import ProgramBuilder from "@/components/ProgramBuilder";
import ProgramTimeline from "@/components/ProgramTimeline";
import ProgramsList from "@/components/ProgramsList";
import SafetyAlert from "@/components/SafetyAlert";
import { ArrowLeft, List, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useProgram } from "@/context/ProgramContext";

type View = "list" | "builder";

export default function ProgramPage() {
  const [view, setView] = useState<View>("list");
  const { state, clearProgram } = useProgram();

  const handleCreateNew = () => {
    clearProgram();
    setView("builder");
  };

  const handleBackToList = () => {
    setView("list");
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-yoga-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-sage-600 to-sage-700 text-white">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sage-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                {view === "list"
                  ? "My Programs"
                  : state.id
                  ? `Edit: ${state.name}`
                  : state.name || "New Program"}
              </h1>
              <p className="text-sage-200 mt-2">
                {view === "list"
                  ? "Manage your saved yoga programs"
                  : state.id
                  ? "Editing existing program. Changes will update the original."
                  : "Drag and drop to reorder poses. Adjust duration for each asana."}
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  view === "list"
                    ? "bg-white text-sage-700"
                    : "bg-sage-500 text-white hover:bg-sage-400"
                }`}
              >
                <List className="w-4 h-4" />
                Programs
              </button>
              <button
                onClick={() => setView("builder")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  view === "builder"
                    ? "bg-white text-sage-700"
                    : "bg-sage-500 text-white hover:bg-sage-400"
                }`}
              >
                <PlusCircle className="w-4 h-4" />
                Builder
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {view === "list" ? (
          <ProgramsList onCreateNew={handleCreateNew} onEdit={() => setView("builder")} />
        ) : (
          <>
            {/* Back to list button */}
            <button
              onClick={handleBackToList}
              className="text-sage-600 hover:text-sage-700 flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Programs List
            </button>

            {/* Timeline View */}
            <ProgramTimeline />

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Program Builder */}
              <div className="lg:col-span-2">
                <ProgramBuilder onSaved={handleBackToList} />
              </div>

              {/* Safety Analysis Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24">
                  <SafetyAlert />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
