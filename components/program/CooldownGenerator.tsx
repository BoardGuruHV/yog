"use client";

import { useState } from "react";
import { Sunset, Clock, Loader2 } from "lucide-react";
import { useProgram } from "@/context/ProgramContext";
import SequencePreview from "./SequencePreview";
import { Asana } from "@/types";

interface SequenceAsana {
  asanaId: string;
  asana: {
    id: string;
    nameEnglish: string;
    nameSanskrit: string;
    category: string;
    difficulty: number;
    svgPath: string;
    targetBodyParts: string[];
  };
  duration: number;
  purpose: string;
  order: number;
}

interface CooldownGeneratorProps {
  compact?: boolean;
}

export default function CooldownGenerator({ compact = false }: CooldownGeneratorProps) {
  const { state, addSequenceToEnd } = useProgram();
  const [duration, setDuration] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSequence, setGeneratedSequence] = useState<SequenceAsana[] | null>(null);
  const [totalDuration, setTotalDuration] = useState(0);
  const [description, setDescription] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (state.asanas.length === 0) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate/cooldown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programAsanas: state.asanas.map((a) => ({
            asanaId: a.asanaId,
            duration: a.duration,
          })),
          duration,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedSequence(data.sequence);
        setTotalDuration(data.totalDuration);
        setDescription(data.description);
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Error generating cooldown:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToProgram = () => {
    if (!generatedSequence) return;

    const sequenceToAdd = generatedSequence.map((item) => ({
      asanaId: item.asanaId,
      asana: item.asana as unknown as Asana,
      duration: item.duration,
    }));

    addSequenceToEnd(sequenceToAdd);
    setShowPreview(false);
    setGeneratedSequence(null);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setGeneratedSequence(null);
  };

  if (state.asanas.length === 0) {
    return null;
  }

  if (showPreview && generatedSequence) {
    return (
      <SequencePreview
        title="Cool-down Sequence"
        description={description}
        sequence={generatedSequence}
        totalDuration={totalDuration}
        onAdd={handleAddToProgram}
        onClose={handleClosePreview}
        isLoading={isGenerating}
        position="end"
      />
    );
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Sunset className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Add Cool-down</h3>
            <p className="text-xs text-gray-500">Generate a cool-down sequence</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-gray-400" />
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-sage-500"
          >
            <option value={3}>3 minutes</option>
            <option value={5}>5 minutes</option>
            <option value={8}>8 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sunset className="w-4 h-4" />
              Generate Cool-down
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Sunset className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">Add Cool-down Sequence</h3>
          <p className="text-gray-600 text-sm mt-1">
            Generate a relaxing cool-down to complete your practice
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration
          </label>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={3}>3 minutes</option>
              <option value={5}>5 minutes</option>
              <option value={8}>8 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50 font-medium"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Cool-down...
            </>
          ) : (
            <>
              <Sunset className="w-5 h-5" />
              Generate Cool-down
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 text-center">
          The cool-down will be added to the end of your program
        </p>
      </div>
    </div>
  );
}
