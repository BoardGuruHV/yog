"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import InstructorProfile from "@/components/instructors/InstructorProfile";

interface PreviewAsana {
  id: string;
  name: string;
  svgPath: string;
  category: string;
}

interface Program {
  id: string;
  name: string;
  description: string | null;
  totalDuration: number;
  poseCount: number;
  shareCode?: string;
  views: number;
  copies: number;
  previewAsanas: PreviewAsana[];
}

interface InstructorData {
  id: string;
  name: string;
  slug: string;
  bio: string;
  longBio: string | null;
  photoUrl: string | null;
  coverUrl: string | null;
  credentials: string[];
  specialties: string[];
  experience: number | null;
  location: string | null;
  socialLinks: Record<string, string>;
  featured: boolean;
  verified: boolean;
  programs: Program[];
}

export default function InstructorDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [instructor, setInstructor] = useState<InstructorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchInstructor();
    }
  }, [slug]);

  const fetchInstructor = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/instructors/${slug}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Instructor not found");
        }
        throw new Error("Failed to load instructor");
      }

      const data = await response.json();
      setInstructor(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/instructors"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <p className="text-sm text-gray-500">Instructor Profile</p>
              <h1 className="text-lg font-semibold text-gray-900">
                {instructor?.name || "Loading..."}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin mb-4" />
              <p className="text-gray-500">Loading instructor profile...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {error}
            </h2>
            <p className="text-gray-500 mb-6">
              The instructor you're looking for might not exist or has been
              removed.
            </p>
            <Link
              href="/instructors"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Browse All Instructors
            </Link>
          </div>
        )}

        {/* Instructor profile */}
        {instructor && !loading && !error && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <InstructorProfile
              name={instructor.name}
              bio={instructor.bio}
              longBio={instructor.longBio}
              photoUrl={instructor.photoUrl}
              coverUrl={instructor.coverUrl}
              credentials={instructor.credentials}
              specialties={instructor.specialties}
              experience={instructor.experience}
              location={instructor.location}
              socialLinks={instructor.socialLinks}
              verified={instructor.verified}
              programs={instructor.programs}
            />
          </div>
        )}
      </main>
    </div>
  );
}
