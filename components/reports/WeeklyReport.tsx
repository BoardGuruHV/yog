"use client";

import {
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Flame,
  Target,
  Smile,
  Zap,
  Award,
} from "lucide-react";
import ReportChart from "./ReportChart";
import Insights from "./Insights";

interface PracticeStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  longestSession: number;
  daysActive: number;
  consistencyScore: number;
}

interface MoodStats {
  averageMoodBefore: number | null;
  averageMoodAfter: number | null;
  moodImprovement: number | null;
  averageEnergy: number | null;
}

interface PoseStats {
  poseId: string;
  poseName: string;
  practiceCount: number;
  totalMinutes: number;
  masteryLevel: number | null;
}

interface BodyPartStats {
  bodyPart: string;
  practiceCount: number;
  percentage: number;
}

interface CategoryStats {
  category: string;
  practiceCount: number;
  percentage: number;
}

interface GoalProgress {
  goalId: string;
  title: string;
  type: string;
  target: number;
  current: number;
  progress: number;
  completed: boolean;
}

interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalPractices: number;
  streakChange: number;
}

interface Insight {
  type: "achievement" | "suggestion" | "warning" | "milestone";
  title: string;
  description: string;
  icon: string;
}

interface Report {
  period: string;
  startDate: string;
  endDate: string;
  generatedAt: string;
  practice: PracticeStats;
  mood: MoodStats;
  topPoses: PoseStats[];
  bodyParts: BodyPartStats[];
  categories: CategoryStats[];
  goals: GoalProgress[];
  streak: StreakStats;
  insights: Insight[];
  comparison: {
    sessionsChange: number;
    minutesChange: number;
    consistencyChange: number;
  };
}

interface WeeklyReportProps {
  report: Report;
}

export default function WeeklyReport({ report }: WeeklyReportProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-500";
  };

  const periodLabel =
    report.period === "week"
      ? "Weekly"
      : report.period === "month"
      ? "Monthly"
      : report.period === "quarter"
      ? "Quarterly"
      : "Yearly";

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-sage-500 to-green-500 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">{periodLabel} Report</h2>
            <p className="text-white/80">
              {formatDate(report.startDate)} - {formatDate(report.endDate)}
            </p>
          </div>
          <div className="text-right text-sm text-white/70">
            Generated {formatDate(report.generatedAt)}
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-sm text-white/80">Sessions</span>
            </div>
            <div className="text-2xl font-bold">{report.practice.totalSessions}</div>
            <div className={`flex items-center gap-1 text-sm ${report.comparison.sessionsChange >= 0 ? "text-green-200" : "text-red-200"}`}>
              {getChangeIcon(report.comparison.sessionsChange)}
              <span>{Math.abs(report.comparison.sessionsChange)}% vs last</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm text-white/80">Practice Time</span>
            </div>
            <div className="text-2xl font-bold">
              {formatDuration(report.practice.totalMinutes)}
            </div>
            <div className={`flex items-center gap-1 text-sm ${report.comparison.minutesChange >= 0 ? "text-green-200" : "text-red-200"}`}>
              {getChangeIcon(report.comparison.minutesChange)}
              <span>{Math.abs(report.comparison.minutesChange)}% vs last</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm text-white/80">Consistency</span>
            </div>
            <div className="text-2xl font-bold">{report.practice.consistencyScore}%</div>
            <div className={`flex items-center gap-1 text-sm ${report.comparison.consistencyChange >= 0 ? "text-green-200" : "text-red-200"}`}>
              {getChangeIcon(report.comparison.consistencyChange)}
              <span>{Math.abs(report.comparison.consistencyChange)}pts</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-4 h-4" />
              <span className="text-sm text-white/80">Current Streak</span>
            </div>
            <div className="text-2xl font-bold">{report.streak.currentStreak} days</div>
            <div className="text-sm text-white/70">
              Best: {report.streak.longestStreak} days
            </div>
          </div>
        </div>
      </div>

      {/* Insights */}
      <Insights insights={report.insights} />

      {/* Practice Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Practice Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Practice Details</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Days Active</span>
              <span className="font-medium text-gray-900">
                {report.practice.daysActive} days
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Session Length</span>
              <span className="font-medium text-gray-900">
                {formatDuration(report.practice.averageSessionLength)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Longest Session</span>
              <span className="font-medium text-gray-900">
                {formatDuration(report.practice.longestSession)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Practices</span>
              <span className="font-medium text-gray-900">
                {report.streak.totalPractices}
              </span>
            </div>
          </div>
        </div>

        {/* Mood & Energy */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Mood & Energy</h3>
          {report.mood.averageMoodBefore !== null || report.mood.averageEnergy !== null ? (
            <div className="space-y-4">
              {report.mood.averageMoodBefore !== null && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Smile className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Avg Mood Before</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {report.mood.averageMoodBefore}/5
                  </span>
                </div>
              )}
              {report.mood.averageMoodAfter !== null && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Smile className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Avg Mood After</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {report.mood.averageMoodAfter}/5
                  </span>
                </div>
              )}
              {report.mood.moodImprovement !== null && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Mood Improvement</span>
                  <span
                    className={`font-medium ${
                      report.mood.moodImprovement > 0
                        ? "text-green-600"
                        : report.mood.moodImprovement < 0
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {report.mood.moodImprovement > 0 ? "+" : ""}
                    {report.mood.moodImprovement}
                  </span>
                </div>
              )}
              {report.mood.averageEnergy !== null && (
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-600">Avg Energy</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {report.mood.averageEnergy}/5
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Smile className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                Track your mood in practice logs to see insights
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Poses */}
        <ReportChart
          type="bar"
          title="Top Poses Practiced"
          data={report.topPoses.map((pose) => ({
            name: pose.poseName.length > 15
              ? pose.poseName.substring(0, 15) + "..."
              : pose.poseName,
            value: pose.practiceCount,
          }))}
          valueLabel="Practices"
        />

        {/* Category Distribution */}
        <ReportChart
          type="pie"
          title="Practice by Category"
          data={report.categories.map((cat) => ({
            name: cat.category,
            value: cat.practiceCount,
            percentage: cat.percentage,
          }))}
        />
      </div>

      {/* Body Parts & Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Body Parts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Body Parts Worked</h3>
          {report.bodyParts.length > 0 ? (
            <div className="space-y-3">
              {report.bodyParts.map((part) => (
                <div key={part.bodyPart}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">
                      {part.bodyPart.replace("_", " ")}
                    </span>
                    <span className="text-gray-900">{part.percentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sage-500 rounded-full transition-all"
                      style={{ width: `${part.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">No body part data available</p>
            </div>
          )}
        </div>

        {/* Goals Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Goals Progress</h3>
          {report.goals.length > 0 ? (
            <div className="space-y-4">
              {report.goals.map((goal) => (
                <div key={goal.goalId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {goal.completed && (
                        <Award className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-gray-700 text-sm">{goal.title}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {goal.current}/{goal.target}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        goal.completed ? "bg-green-500" : "bg-sage-500"
                      }`}
                      style={{ width: `${Math.min(100, goal.progress)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Target className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Set goals to track your progress</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
