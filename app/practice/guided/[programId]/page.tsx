"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Play, Clock, ListMusic } from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with Web Speech API
const GuidedSession = dynamic(
  () => import("@/components/practice/GuidedSession"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    ),
  }
);

interface ProgramAsana {
  id: string;
  asanaId: string;
  duration: number;
  order: number;
  asana: {
    id: string;
    nameEnglish: string;
    nameSanskrit: string;
    category: string;
    svgPath: string;
  };
}

interface Program {
  id: string;
  name: string;
  description: string | null;
  totalDuration: number;
  asanas: ProgramAsana[];
}

export default function GuidedPracticePage({
  params,
}: {
  params: Promise<{ programId: string }>;
}) {
  const { programId } = use(params);
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);

  useEffect(() => {
    async function fetchProgram() {
      try {
        const response = await fetch(`/api/programs/${programId}`);
        if (!response.ok) {
          throw new Error("Program not found");
        }
        const data = await response.json();
        setProgram(data);
      } catch (err: any) {
        setError(err.message || "Failed to load program");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProgram();
  }, [programId]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) {
      return `${mins} min`;
    }
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Program not found"}</p>
          <button
            onClick={() => router.push("/program")}
            className="px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700"
          >
            Go to Programs
          </button>
        </div>
      </div>
    );
  }

  if (isSessionActive) {
    return (
      <GuidedSession
        programName={program.name}
        asanas={program.asanas}
        onClose={() => setIsSessionActive(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Program Header */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-sage-600 to-sage-700 text-white p-8">
            <div className="flex items-center gap-2 text-sage-200 text-sm mb-2">
              <ListMusic className="w-4 h-4" />
              Guided Practice
            </div>
            <h1 className="text-3xl font-bold mb-2">{program.name}</h1>
            {program.description && (
              <p className="text-sage-100">{program.description}</p>
            )}

            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-sage-200" />
                <span>{formatDuration(program.totalDuration)}</span>
              </div>
              <div>
                <span>{program.asanas.length} poses</span>
              </div>
            </div>
          </div>

          {/* Pose List */}
          <div className="p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Session Overview</h3>
            <div className="space-y-3 mb-6">
              {program.asanas.map((pa, index) => (
                <div
                  key={pa.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl"
                >
                  <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center text-sage-700 font-medium text-sm">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center">
                    <Image
                      src={pa.asana.svgPath}
                      alt={pa.asana.nameEnglish}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {pa.asana.nameEnglish}
                    </p>
                    <p className="text-sm text-gray-500">
                      {pa.asana.nameSanskrit}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {Math.floor(pa.duration / 60)}:{(pa.duration % 60)
                      .toString()
                      .padStart(2, "0")}
                  </div>
                </div>
              ))}
            </div>

            {/* Start Button */}
            <button
              onClick={() => setIsSessionActive(true)}
              className="w-full py-4 bg-sage-600 hover:bg-sage-700 text-white rounded-xl font-semibold text-lg transition-colors inline-flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6" />
              Start Guided Practice
            </button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Make sure your volume is on for voice guidance
            </p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-800 mb-3">Tips for Practice</h3>
          <ul className="space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2" />
              Find a quiet space where you won&apos;t be disturbed
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2" />
              Have a yoga mat ready and wear comfortable clothing
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2" />
              Listen to your body and modify poses as needed
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2" />
              Use the settings icon to adjust voice speed and pitch
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
