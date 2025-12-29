"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Settings, Heart } from "lucide-react";
import StreakWidget from "@/components/dashboard/StreakWidget";
import ProgressWidget from "@/components/dashboard/ProgressWidget";
import QuickStartWidget from "@/components/dashboard/QuickStartWidget";
import RecommendationWidget from "@/components/dashboard/RecommendationWidget";
import RecentActivityWidget from "@/components/dashboard/RecentActivityWidget";
import HealthSummaryWidget from "@/components/dashboard/HealthSummaryWidget";
import GoalsWidget from "@/components/dashboard/GoalsWidget";
import RemindersWidget from "@/components/dashboard/RemindersWidget";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const firstName = session.user?.name?.split(" ")[0] || "Yogi";

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sage-600 to-sage-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Namaste, {firstName}!
              </h1>
              <p className="text-sage-200 mt-2">
                Welcome to your personal yoga dashboard
              </p>
            </div>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Row 1: Streak, Quick Start, Health Summary */}
          <div className="lg:col-span-1">
            <StreakWidget />
          </div>
          <div className="lg:col-span-1">
            <QuickStartWidget />
          </div>
          <div className="lg:col-span-1">
            <HealthSummaryWidget />
          </div>

          {/* Row 2: Progress Chart (spans 2 columns on large screens) */}
          <div className="md:col-span-2">
            <ProgressWidget />
          </div>

          {/* Row 2: Goals */}
          <div className="lg:col-span-1">
            <GoalsWidget />
          </div>

          {/* Row 3: Reminders */}
          <div className="lg:col-span-1">
            <RemindersWidget />
          </div>

          {/* Row 3: Recommendations */}
          <div className="lg:col-span-1">
            <RecommendationWidget />
          </div>

          {/* Row 3: Recent Activity */}
          <div className="md:col-span-2">
            <RecentActivityWidget />
          </div>
        </div>
      </main>
    </div>
  );
}
