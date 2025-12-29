"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  Copy,
  Check,
  Eye,
  Download,
  User,
  Play,
} from "lucide-react";

interface Asana {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  svgPath: string;
}

interface ProgramAsana {
  id: string;
  order: number;
  duration: number;
  notes: string | null;
  asana: Asana;
}

interface SharedProgramData {
  program: {
    id: string;
    name: string;
    description: string | null;
    totalDuration: number;
    creatorName: string;
    asanas: ProgramAsana[];
  };
  shareInfo: {
    views: number;
    copies: number;
    createdAt: string;
  };
}

export default function SharedProgramPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [data, setData] = useState<SharedProgramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code) {
      fetchProgram();
    }
  }, [code]);

  const fetchProgram = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/share/${code}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("This shared program was not found");
        }
        if (response.status === 403) {
          throw new Error("This program is private");
        }
        throw new Error("Failed to load program");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToLibrary = async () => {
    setCopying(true);

    try {
      const response = await fetch(`/api/share/${code}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 401) {
          // Redirect to login
          router.push(`/login?redirect=/shared/${code}`);
          return;
        }
        throw new Error(errorData.error || "Failed to copy program");
      }

      const result = await response.json();
      setCopied(true);

      // Redirect to the new program after a short delay
      setTimeout(() => {
        router.push(`/program?id=${result.programId}`);
      }, 1500);
    } catch (err) {
      console.error("Error copying program:", err);
      alert(err instanceof Error ? err.message : "Failed to copy program");
    } finally {
      setCopying(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      STANDING: "bg-blue-100 text-blue-700",
      SEATED: "bg-green-100 text-green-700",
      PRONE: "bg-yellow-100 text-yellow-700",
      SUPINE: "bg-purple-100 text-purple-700",
      INVERSION: "bg-red-100 text-red-700",
      BALANCE: "bg-pink-100 text-pink-700",
      TWIST: "bg-orange-100 text-orange-700",
      FORWARD_BEND: "bg-teal-100 text-teal-700",
      BACK_BEND: "bg-indigo-100 text-indigo-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <p className="text-sm text-gray-500">Shared Program</p>
                <h1 className="text-lg font-semibold text-gray-900">
                  {data?.program.name || "Loading..."}
                </h1>
              </div>
            </div>

            {data && !loading && (
              <button
                onClick={copyToLibrary}
                disabled={copying || copied}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                } disabled:opacity-50`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : copying ? (
                  "Copying..."
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to My Library
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mb-4" />
              <p className="text-gray-500">Loading shared program...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">😔</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error}
            </h2>
            <p className="text-gray-500 mb-6">
              The program you're looking for might have been removed or made
              private.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Go to Home
            </Link>
          </div>
        )}

        {/* Program Content */}
        {data && !loading && !error && (
          <div className="space-y-6">
            {/* Program Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {data.program.name}
                  </h2>
                  {data.program.description && (
                    <p className="text-gray-600 mb-4">
                      {data.program.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>By {data.program.creatorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(data.program.totalDuration)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Play className="w-4 h-4" />
                      <span>{data.program.asanas.length} poses</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{data.shareInfo.views}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{data.shareInfo.copies}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Poses List */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">
                  Poses in this Program
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                {data.program.asanas.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    {/* Order number */}
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>

                    {/* Pose image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.asana.svgPath && (
                        <Image
                          src={item.asana.svgPath}
                          alt={item.asana.nameEnglish}
                          width={64}
                          height={64}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    {/* Pose info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">
                        {item.asana.nameEnglish}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {item.asana.nameSanskrit}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(
                            item.asana.category
                          )}`}
                        >
                          {item.asana.category.replace("_", " ")}
                        </span>
                        {item.notes && (
                          <span className="text-xs text-gray-400">
                            {item.notes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-gray-900">
                        {Math.floor(item.duration / 60)}:{String(item.duration % 60).padStart(2, "0")}
                      </p>
                      <p className="text-xs text-gray-500">min</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Copy CTA */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200 p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Like this program?
              </h3>
              <p className="text-gray-600 mb-4">
                Copy it to your library and start practicing!
              </p>
              <button
                onClick={copyToLibrary}
                disabled={copying || copied}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  copied
                    ? "bg-green-100 text-green-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                } disabled:opacity-50`}
              >
                {copied ? (
                  <>
                    <Check className="w-5 h-5" />
                    Copied to Your Library!
                  </>
                ) : copying ? (
                  "Copying..."
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy to My Library
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
