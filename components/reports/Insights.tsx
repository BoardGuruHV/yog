"use client";

import {
  TrendingUp,
  Bell,
  Award,
  Clock,
  Flame,
  Trophy,
  CheckCircle,
  Target,
  Star,
  Lightbulb,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface Insight {
  type: "achievement" | "suggestion" | "warning" | "milestone";
  title: string;
  description: string;
  icon: string;
}

interface InsightsProps {
  insights: Insight[];
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "trending-up": TrendingUp,
  bell: Bell,
  award: Award,
  clock: Clock,
  flame: Flame,
  trophy: Trophy,
  "check-circle": CheckCircle,
  target: Target,
  star: Star,
  lightbulb: Lightbulb,
  warning: AlertTriangle,
  sparkles: Sparkles,
};

const TYPE_STYLES = {
  achievement: {
    bg: "bg-green-50",
    border: "border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    titleColor: "text-green-800",
  },
  suggestion: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    titleColor: "text-blue-800",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    titleColor: "text-amber-800",
  },
  milestone: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    titleColor: "text-purple-800",
  },
};

export default function Insights({ insights }: InsightsProps) {
  if (insights.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Insights</h3>
        <div className="text-center py-8 text-gray-400">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Keep practicing to unlock personalized insights!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Insights & Achievements</h3>
      <div className="space-y-3">
        {insights.map((insight, index) => {
          const styles = TYPE_STYLES[insight.type];
          const IconComponent = ICON_MAP[insight.icon] || Sparkles;

          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-4 rounded-lg border ${styles.bg} ${styles.border}`}
            >
              <div className={`p-2 rounded-lg ${styles.iconBg}`}>
                <IconComponent className={`w-5 h-5 ${styles.iconColor}`} />
              </div>
              <div>
                <h4 className={`font-medium ${styles.titleColor}`}>
                  {insight.title}
                </h4>
                <p className="text-sm text-gray-600 mt-0.5">
                  {insight.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
