"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Mail,
  Calendar,
  Target,
  Clock,
  Heart,
  Save,
  Loader2,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface UserProfile {
  age?: number;
  experienceLevel?: string;
  goals: string[];
  conditions: string[];
  preferredDuration?: number;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  image?: string;
  createdAt: string;
  profile?: UserProfile;
  programCount: number;
}

const EXPERIENCE_LEVELS = [
  { value: "beginner", label: "Beginner", description: "New to yoga" },
  { value: "intermediate", label: "Intermediate", description: "1-3 years of practice" },
  { value: "advanced", label: "Advanced", description: "3+ years of regular practice" },
];

const GOALS = [
  "Flexibility",
  "Strength",
  "Relaxation",
  "Weight Loss",
  "Better Sleep",
  "Stress Relief",
  "Back Pain Relief",
  "Balance",
  "Energy",
  "Focus",
];

const DURATIONS = [
  { value: 15, label: "15 min" },
  { value: 30, label: "30 min" },
  { value: 45, label: "45 min" },
  { value: 60, label: "60 min" },
  { value: 90, label: "90 min" },
];

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [preferredDuration, setPreferredDuration] = useState<number | "">("");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/profile");
    }
  }, [status, router]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
          setName(data.name || "");
          setAge(data.profile?.age || "");
          setExperienceLevel(data.profile?.experienceLevel || "");
          setGoals(data.profile?.goals || []);
          setPreferredDuration(data.profile?.preferredDuration || "");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          profile: {
            age: age || null,
            experienceLevel: experienceLevel || null,
            goals,
            conditions: [],
            preferredDuration: preferredDuration || null,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      // Update session with new name
      await update({ name });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-sage-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-sage-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xs border border-sage-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-sage-200 flex items-center justify-center">
                <User className="w-10 h-10 text-sage-600" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {session.user?.name || "Your Profile"}
              </h1>
              <p className="text-gray-500 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {session.user?.email}
              </p>
              {profile && (
                <p className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4" />
                  Member since {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          {profile && (
            <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <p className="text-2xl font-bold text-sage-600">
                  {profile.programCount}
                </p>
                <p className="text-sm text-gray-500">Programs</p>
              </div>
            </div>
          )}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p>Profile saved successfully!</p>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-xs border border-sage-100 p-6 space-y-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Profile Settings
          </h2>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-hidden"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age (optional)
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) =>
                setAge(e.target.value ? parseInt(e.target.value) : "")
              }
              placeholder="Your age"
              min={1}
              max={120}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-hidden"
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Experience Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setExperienceLevel(level.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    experienceLevel === level.value
                      ? "border-sage-500 bg-sage-50"
                      : "border-gray-200 hover:border-sage-300"
                  }`}
                >
                  <p className="font-medium text-gray-800">{level.label}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {level.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Preferred Session Duration
            </label>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((duration) => (
                <button
                  key={duration.value}
                  type="button"
                  onClick={() => setPreferredDuration(duration.value)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all ${
                    preferredDuration === duration.value
                      ? "border-sage-500 bg-sage-50 text-sage-700"
                      : "border-gray-200 hover:border-sage-300 text-gray-700"
                  }`}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Heart className="w-4 h-4 inline mr-1" />
              Your Goals (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleGoal(goal)}
                  className={`px-4 py-2 rounded-full border-2 transition-all ${
                    goals.includes(goal)
                      ? "border-sage-500 bg-sage-50 text-sage-700"
                      : "border-gray-200 hover:border-sage-300 text-gray-700"
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 bg-sage-600 text-white py-3 px-4 rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50 font-medium"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
