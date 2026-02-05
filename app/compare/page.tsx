"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, GitCompare, Loader2, Info } from "lucide-react";
import PoseSelector from "@/components/compare/PoseSelector";
import ComparisonView from "@/components/compare/ComparisonView";
import DifferenceTable from "@/components/compare/DifferenceTable";

// Simple type for selector
interface AsanaBasic {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  svgPath: string;
}

// Full type with all details
interface AsanaDetail extends AsanaBasic {
  durationSeconds: number;
  benefits: string[];
  targetBodyParts: string[];
  description: string;
}

interface AnatomyData {
  primaryMuscles: string[];
  secondaryMuscles: string[];
  stretchedMuscles: string[];
}

export default function ComparePage() {
  const [pose1, setPose1] = useState<AsanaBasic | null>(null);
  const [pose2, setPose2] = useState<AsanaBasic | null>(null);
  const [pose1Details, setPose1Details] = useState<AsanaDetail | null>(null);
  const [pose2Details, setPose2Details] = useState<AsanaDetail | null>(null);
  const [anatomy1, setAnatomy1] = useState<AnatomyData | null>(null);
  const [anatomy2, setAnatomy2] = useState<AnatomyData | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch full details when poses are selected
  useEffect(() => {
    if (pose1?.id) {
      fetchPoseDetails(pose1.id, "pose1");
    } else {
      setPose1Details(null);
      setAnatomy1(null);
    }
  }, [pose1?.id]);

  useEffect(() => {
    if (pose2?.id) {
      fetchPoseDetails(pose2.id, "pose2");
    } else {
      setPose2Details(null);
      setAnatomy2(null);
    }
  }, [pose2?.id]);

  const fetchPoseDetails = async (id: string, target: "pose1" | "pose2") => {
    setLoading(true);
    try {
      // Fetch asana details
      const asanaRes = await fetch(`/api/asanas/${id}`);
      if (asanaRes.ok) {
        const asanaData = await asanaRes.json();
        if (target === "pose1") {
          setPose1Details(asanaData);
        } else {
          setPose2Details(asanaData);
        }
      }

      // Fetch anatomy data
      const anatomyRes = await fetch(`/api/anatomy/${id}`);
      if (anatomyRes.ok) {
        const anatomyData = await anatomyRes.json();
        if (target === "pose1") {
          setAnatomy1(anatomyData.anatomy);
        } else {
          setAnatomy2(anatomyData.anatomy);
        }
      }
    } catch (error) {
      console.error("Error fetching pose details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwap = () => {
    const temp1 = pose1;
    const temp1Details = pose1Details;
    const tempAnatomy1 = anatomy1;

    setPose1(pose2);
    setPose1Details(pose2Details);
    setAnatomy1(anatomy2);

    setPose2(temp1);
    setPose2Details(temp1Details);
    setAnatomy2(tempAnatomy1);
  };

  const bothSelected = pose1Details && pose2Details;

  return (
    <div className="min-h-screen bg-linear-to-b from-sage-50 to-white">
      {/* Header */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Compare Poses
              </h1>
              <p className="text-indigo-200">
                Select two poses to compare side-by-side
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pose Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <PoseSelector
            label="First Pose"
            selectedAsana={pose1}
            onSelect={setPose1}
            excludeId={pose2?.id}
          />
          <PoseSelector
            label="Second Pose"
            selectedAsana={pose2}
            onSelect={setPose2}
            excludeId={pose1?.id}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
          </div>
        )}

        {/* Comparison Content */}
        {bothSelected && !loading && (
          <div className="space-y-8">
            {/* Visual Comparison */}
            <ComparisonView
              pose1={pose1Details}
              pose2={pose2Details}
              onSwap={handleSwap}
            />

            {/* Detailed Comparison */}
            <DifferenceTable
              pose1={pose1Details}
              pose2={pose2Details}
              anatomy1={anatomy1}
              anatomy2={anatomy2}
            />

            {/* Transition Tip */}
            <div className="bg-linear-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg shrink-0">
                  <Info className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">
                    Transitioning Between These Poses
                  </h3>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    When moving from <strong>{pose1Details.nameEnglish}</strong> to{" "}
                    <strong>{pose2Details.nameEnglish}</strong>, focus on maintaining
                    breath awareness. Move slowly and mindfully, using transition poses
                    if needed. Always honor your body's limits and modify as necessary.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!bothSelected && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <GitCompare className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Select Two Poses to Compare
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Choose two yoga poses from the selectors above to see a detailed
              comparison of their benefits, difficulty, target areas, and muscle
              engagement.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
