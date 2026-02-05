"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Loader2,
  Download,
  Share2,
  RefreshCw,
} from "lucide-react";
import WeeklyReport from "@/components/reports/WeeklyReport";

type ReportPeriod = "week" | "month" | "quarter" | "year";

interface Report {
  period: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  practice: {
    totalSessions: number;
    totalMinutes: number;
    averageSessionLength: number;
    longestSession: number;
    daysActive: number;
    consistencyScore: number;
  };
  mood: {
    averageMoodBefore: number | null;
    averageMoodAfter: number | null;
    moodImprovement: number | null;
    averageEnergy: number | null;
  };
  topPoses: Array<{
    poseId: string;
    poseName: string;
    practiceCount: number;
    totalMinutes: number;
    masteryLevel: number | null;
  }>;
  bodyParts: Array<{
    bodyPart: string;
    practiceCount: number;
    percentage: number;
  }>;
  categories: Array<{
    category: string;
    practiceCount: number;
    percentage: number;
  }>;
  goals: Array<{
    goalId: string;
    title: string;
    type: string;
    target: number;
    current: number;
    progress: number;
    completed: boolean;
  }>;
  streak: {
    currentStreak: number;
    longestStreak: number;
    totalPractices: number;
    streakChange: number;
  };
  insights: Array<{
    type: "achievement" | "suggestion" | "warning" | "milestone";
    title: string;
    description: string;
    icon: string;
  }>;
  comparison: {
    sessionsChange: number;
    minutesChange: number;
    consistencyChange: number;
  };
}

const PERIOD_OPTIONS: { value: ReportPeriod; label: string; description: string }[] = [
  { value: "week", label: "Weekly", description: "Last 7 days" },
  { value: "month", label: "Monthly", description: "Last 30 days" },
  { value: "quarter", label: "Quarterly", description: "Last 3 months" },
  { value: "year", label: "Yearly", description: "Last 12 months" },
];

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const [period, setPeriod] = useState<ReportPeriod>("week");
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchReport();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status, period]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/reports/generate?period=${period}`);
      if (!response.ok) {
        throw new Error("Failed to generate report");
      }
      const data = await response.json();
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!report) return;

    // Generate a simple text report for download
    const reportText = `
YOGA PRACTICE REPORT
${report.period.toUpperCase()} SUMMARY
Generated: ${new Date(report.generatedAt).toLocaleDateString()}
Period: ${new Date(report.startDate).toLocaleDateString()} - ${new Date(report.endDate).toLocaleDateString()}

PRACTICE OVERVIEW
-----------------
Total Sessions: ${report.practice.totalSessions}
Total Practice Time: ${Math.round(report.practice.totalMinutes / 60)}h ${report.practice.totalMinutes % 60}m
Average Session: ${report.practice.averageSessionLength} minutes
Days Active: ${report.practice.daysActive}
Consistency Score: ${report.practice.consistencyScore}%

STREAK
------
Current Streak: ${report.streak.currentStreak} days
Longest Streak: ${report.streak.longestStreak} days
Total Practices: ${report.streak.totalPractices}

TOP POSES
---------
${report.topPoses.map((pose, i) => `${i + 1}. ${pose.poseName} - ${pose.practiceCount} times`).join("\n")}

GOALS PROGRESS
--------------
${report.goals.map(goal => `${goal.completed ? "[COMPLETED]" : `[${goal.progress}%]`} ${goal.title}`).join("\n") || "No active goals"}

INSIGHTS
--------
${report.insights.map(insight => `- ${insight.title}: ${insight.description}`).join("\n") || "No insights available"}
    `.trim();

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yoga-report-${period}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (!report) return;

    const shareText = `My ${period}ly yoga practice: ${report.practice.totalSessions} sessions, ${Math.round(report.practice.totalMinutes / 60)}h ${report.practice.totalMinutes % 60}m of practice, ${report.practice.consistencyScore}% consistency! 🧘`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Yoga Practice Report",
          text: shareText,
        });
      } catch (err) {
        // User cancelled or error
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      alert("Report summary copied to clipboard!");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sage-500 mx-auto mb-4" />
          <p className="text-gray-500">Generating your report...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-sage-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Practice Reports
          </h1>
          <p className="text-gray-500 mb-6">
            Sign in to view detailed reports about your yoga practice.
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/stats"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Practice Reports</h1>
                <p className="text-gray-500">
                  Detailed summaries of your yoga journey
                </p>
              </div>
            </div>

            {report && (
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchReport}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                  title="Refresh report"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg hover:bg-sage-600 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>
            )}
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`
                  shrink-0 px-4 py-2 rounded-lg font-medium transition-colors
                  ${
                    period === option.value
                      ? "bg-sage-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{option.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-4">😕</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to Generate Report
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchReport}
              className="px-6 py-3 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : report ? (
          <WeeklyReport report={report} />
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Practice Data
            </h3>
            <p className="text-gray-500 mb-4">
              Start practicing to generate your first report!
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors"
            >
              Browse Poses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
