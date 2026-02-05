"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import TutorialPlayer from "@/components/tutorial/TutorialPlayer";
import { TutorialStep } from "@/components/tutorial/StepCard";

interface Asana {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  durationSeconds: number;
  svgPath: string;
  description: string;
}

interface Tutorial {
  id: string;
  asanaId: string;
  tips: string[];
  commonErrors: string[];
  steps: TutorialStep[];
  asana: Asana;
}

export default function LearnAsanaPage({
  params,
}: {
  params: Promise<{ asanaId: string }>;
}) {
  const { asanaId } = use(params);
  const router = useRouter();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [asana, setAsana] = useState<Asana | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchTutorial();
  }, [asanaId]);

  const fetchTutorial = async () => {
    try {
      const res = await fetch(`/api/tutorials/${asanaId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.tutorial) {
          setTutorial(data.tutorial);
          setAsana(data.tutorial.asana);
        } else if (data.asana) {
          setAsana(data.asana);
        } else {
          setNotFound(true);
        }
      } else if (res.status === 404) {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Error fetching tutorial:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    // Could trigger confetti, achievement, etc.
    console.log("Tutorial completed!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-sage-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-linear-to-b from-sage-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
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

  return (
    <div className="min-h-screen bg-linear-to-b from-sage-50 to-white">
      {/* Header */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/asana/${asanaId}`}
            className="inline-flex items-center gap-2 text-indigo-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Asana
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Learn: {asana?.nameEnglish}
              </h1>
              <p className="text-indigo-200 italic">{asana?.nameSanskrit}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tutorial ? (
          <TutorialPlayer
            steps={tutorial.steps}
            tips={tutorial.tips}
            commonErrors={tutorial.commonErrors}
            asanaName={tutorial.asana.nameEnglish}
            asanaImage={tutorial.asana.svgPath}
            onComplete={handleComplete}
          />
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Tutorial Coming Soon
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              We&apos;re still working on the step-by-step tutorial for{" "}
              <strong>{asana?.nameEnglish}</strong>. In the meantime, you can view
              the asana details.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                href={`/asana/${asanaId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
              >
                View Asana Details
                <ExternalLink className="w-4 h-4" />
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Browse Library
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
