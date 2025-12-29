"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Clock,
  Plus,
  Check,
  AlertTriangle,
  Info,
  Target,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Asana, CATEGORY_LABELS, CATEGORY_COLORS } from "@/types";
import { useProgram } from "@/context/ProgramContext";
import { HealthWarningCard, type HealthWarning } from "@/components/health/HealthWarningBadge";
import PersonalNote from "@/components/notes/PersonalNote";
import { PronunciationCard } from "@/components/pronunciation";
import { AnatomyViewer } from "@/components/anatomy";
import VideoGallery from "@/components/video/VideoGallery";

// Dynamic import for 3D viewer to avoid SSR issues
const PoseViewer3D = dynamic(() => import("@/components/3d/PoseViewer3D"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-sage-200 border-t-sage-600" />
      </div>
    </div>
  ),
});

export default function AsanaDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data: session } = useSession();
  const [asana, setAsana] = useState<Asana | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [healthWarnings, setHealthWarnings] = useState<HealthWarning[]>([]);
  const [dismissedWarning, setDismissedWarning] = useState(false);
  const { addAsana, isInProgram } = useProgram();

  useEffect(() => {
    async function fetchAsana() {
      try {
        const response = await fetch(`/api/asanas/${id}`);
        if (response.ok) {
          const data = await response.json();
          setAsana(data);
        }
      } catch (error) {
        console.error("Error fetching asana:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAsana();
  }, [id]);

  // Fetch health warnings if user is logged in
  useEffect(() => {
    async function fetchHealthWarnings() {
      if (!session?.user || !id) return;

      try {
        const response = await fetch(`/api/asanas/health?asanaId=${id}`);
        if (response.ok) {
          const data = await response.json();
          setHealthWarnings(data.warnings || []);
        }
      } catch (error) {
        console.error("Error fetching health warnings:", error);
      }
    }
    fetchHealthWarnings();
  }, [session, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yoga-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sage-200 border-t-sage-600" />
      </div>
    );
  }

  if (!asana) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yoga-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🧘</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Asana not found
          </h1>
          <Link
            href="/"
            className="text-sage-600 hover:text-sage-700 underline"
          >
            Return to library
          </Link>
        </div>
      </div>
    );
  }

  const inProgram = isInProgram(asana.id);

  const formatDuration = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins} min ${secs}s` : `${mins} min`;
    }
    return `${seconds} seconds`;
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = ["", "Beginner", "Easy", "Moderate", "Challenging", "Advanced"];
    return labels[difficulty] || "Unknown";
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "text-green-600 bg-green-100";
    if (difficulty <= 3) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yoga-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sage-600 to-sage-700 text-white">
        <div className="max-w-5xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sage-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Quick Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-sage-100 sticky top-24">
              {/* Image */}
              <div className="h-64 bg-gradient-to-br from-sage-50 to-yoga-50 flex items-center justify-center">
                <Image
                  src={imageError ? "/asanas/default.svg" : asana.svgPath}
                  alt={asana.nameEnglish}
                  width={160}
                  height={200}
                  className="object-contain"
                  onError={() => setImageError(true)}
                />
              </div>

              {/* Quick Info */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      CATEGORY_COLORS[asana.category]
                    }`}
                  >
                    {CATEGORY_LABELS[asana.category]}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(
                      asana.difficulty
                    )}`}
                  >
                    {getDifficultyLabel(asana.difficulty)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5 text-sage-500" />
                  <span>{formatDuration(asana.durationSeconds)}</span>
                </div>

                <button
                  onClick={() => !inProgram && addAsana(asana)}
                  disabled={inProgram}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                    inProgram
                      ? "bg-sage-100 text-sage-600"
                      : "bg-sage-600 text-white hover:bg-sage-700"
                  }`}
                >
                  {inProgram ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added to Program
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Add to Program
                    </>
                  )}
                </button>

                <Link
                  href={`/learn/${asana.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
                >
                  <BookOpen className="w-5 h-5" />
                  Learn This Pose
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {asana.nameEnglish}
              </h1>
              <p className="text-xl text-sage-600 italic mt-1">
                {asana.nameSanskrit}
              </p>
            </div>

            {/* Personalized Health Warning */}
            {healthWarnings.length > 0 && !dismissedWarning && (
              <HealthWarningCard
                warnings={healthWarnings}
                onDismiss={() => setDismissedWarning(true)}
              />
            )}

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
              <p className="text-gray-700 leading-relaxed">{asana.description}</p>
            </div>

            {/* Sanskrit Pronunciation */}
            <PronunciationCard
              asanaId={asana.id}
              nameSanskrit={asana.nameSanskrit}
            />

            {/* Muscle Anatomy */}
            <AnatomyViewer
              asanaId={asana.id}
              asanaName={asana.nameEnglish}
            />

            {/* Video Tutorials */}
            <VideoGallery
              asanaId={asana.id}
              asanaName={asana.nameEnglish}
            />

            {/* 3D Pose Viewer */}
            <PoseViewer3D
              asanaId={asana.id}
              asanaName={asana.nameEnglish}
            />

            {/* Benefits */}
            <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Sparkles className="w-5 h-5 text-yoga-500" />
                Benefits
              </h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {asana.benefits.map((benefit, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-2 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* Target Body Parts */}
            <div className="bg-white rounded-xl shadow-sm border border-sage-100 p-6">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
                <Target className="w-5 h-5 text-yoga-500" />
                Target Areas
              </h2>
              <div className="flex flex-wrap gap-2">
                {asana.targetBodyParts.map((part) => (
                  <span
                    key={part}
                    className="px-4 py-2 bg-sage-50 text-sage-700 rounded-lg capitalize"
                  >
                    {part}
                  </span>
                ))}
              </div>
            </div>

            {/* Personal Notes */}
            <PersonalNote asanaId={asana.id} asanaName={asana.nameEnglish} />

            {/* Contraindications */}
            {asana.contraindications && asana.contraindications.length > 0 && (
              <div className="bg-red-50 rounded-xl border border-red-100 p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-red-800 mb-4">
                  <AlertTriangle className="w-5 h-5" />
                  Contraindications
                </h2>
                <ul className="space-y-3">
                  {asana.contraindications.map((ci) => (
                    <li key={ci.id} className="flex items-start gap-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          ci.severity === "avoid"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {ci.severity}
                      </span>
                      <div>
                        <span className="font-medium text-gray-800">
                          {ci.condition?.name}
                        </span>
                        {ci.notes && (
                          <p className="text-sm text-gray-600 mt-0.5">
                            {ci.notes}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modifications */}
            {asana.modifications && asana.modifications.length > 0 && (
              <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-blue-800 mb-4">
                  <Info className="w-5 h-5" />
                  Modifications
                </h2>
                <ul className="space-y-3">
                  {asana.modifications.map((mod) => (
                    <li key={mod.id} className="flex items-start gap-3">
                      {(mod.forAge || mod.condition) && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-200 text-blue-800">
                          {mod.forAge || mod.condition?.name}
                        </span>
                      )}
                      <p className="text-gray-700">{mod.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
