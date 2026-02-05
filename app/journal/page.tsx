"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Plus,
  Loader2,
  Calendar,
  Clock,
  TrendingUp,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import JournalEntry, { PracticeLog } from "@/components/journal/JournalEntry";
import PracticeLogger from "@/components/journal/PracticeLogger";

interface Stats {
  totalSessions: number;
  totalMinutes: number;
  avgMood: number | null;
  avgEnergy: number | null;
}

export default function JournalPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [logs, setLogs] = useState<PracticeLog[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogger, setShowLogger] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/journal");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchLogs();
    }
  }, [session, selectedMonth]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/journal?month=${selectedMonth}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this practice log?")) return;

    try {
      const res = await fetch(`/api/journal?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setLogs((prev) => prev.filter((log) => log.id !== id));
      }
    } catch (error) {
      console.error("Error deleting log:", error);
    }
  };

  const changeMonth = (delta: number) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    setSelectedMonth(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const formatMonthDisplay = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    return new Date(year, month - 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const isCurrentMonth = () => {
    const now = new Date();
    const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return selectedMonth === current;
  };

  const formatTotalTime = (minutes: number) => {
    if (minutes >= 60) {
      const hrs = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hrs}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  // Group logs by date
  const groupedLogs = logs.reduce((groups, log) => {
    const date = new Date(log.createdAt).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, PracticeLog[]>);

  if (status === "loading") {
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
    <div className="min-h-screen bg-linear-to-b from-sage-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-linear-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                Practice Journal
              </h1>
              <p className="text-indigo-200 mt-2">
                Track your yoga journey and reflect on your practice
              </p>
            </div>
            <button
              onClick={() => setShowLogger(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Log Practice</span>
            </button>
          </div>

          {/* Stats Row */}
          {stats && stats.totalSessions > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 text-indigo-200 text-sm">
                  <Calendar className="w-4 h-4" />
                  Total Sessions
                </div>
                <p className="text-2xl font-bold mt-1">{stats.totalSessions}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 text-indigo-200 text-sm">
                  <Clock className="w-4 h-4" />
                  Total Time
                </div>
                <p className="text-2xl font-bold mt-1">
                  {formatTotalTime(stats.totalMinutes)}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 text-indigo-200 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  Avg Mood
                </div>
                <p className="text-2xl font-bold mt-1">
                  {stats.avgMood ? `${stats.avgMood}/5` : "—"}
                </p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center gap-2 text-indigo-200 text-sm">
                  <Zap className="w-4 h-4" />
                  Avg Energy
                </div>
                <p className="text-2xl font-bold mt-1">
                  {stats.avgEnergy ? `${stats.avgEnergy}/5` : "—"}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Month Navigation */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {formatMonthDisplay()}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            disabled={isCurrentMonth()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-10 h-10 text-indigo-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Practice Logs Yet
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start logging your practice sessions to track your progress and
              reflect on your yoga journey.
            </p>
            <button
              onClick={() => setShowLogger(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Log Your First Practice
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedLogs).map(([date, dateLogs]) => (
              <div key={date}>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  {new Date(date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </h3>
                <div className="space-y-3">
                  {dateLogs.map((log) => (
                    <JournalEntry
                      key={log.id}
                      log={log}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Practice Logger Modal */}
      <PracticeLogger
        isOpen={showLogger}
        onClose={() => setShowLogger(false)}
        onSave={fetchLogs}
      />
    </div>
  );
}
