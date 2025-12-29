"use client";

import Link from "next/link";
import {
  Clock,
  HelpCircle,
  Trophy,
  Star,
  CheckCircle,
  ArrowRight,
  Brain,
} from "lucide-react";

interface QuizCardProps {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  difficulty: string;
  imageUrl?: string | null;
  timeLimit?: number | null;
  questionCount: number;
  userProgress?: {
    bestScore: number;
    attempts: number;
  } | null;
  featured?: boolean;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  poses: { bg: "bg-purple-100", text: "text-purple-700", icon: "🧘" },
  sanskrit: { bg: "bg-amber-100", text: "text-amber-700", icon: "🕉️" },
  benefits: { bg: "bg-emerald-100", text: "text-emerald-700", icon: "💚" },
  philosophy: { bg: "bg-indigo-100", text: "text-indigo-700", icon: "📚" },
  anatomy: { bg: "bg-rose-100", text: "text-rose-700", icon: "🫀" },
  history: { bg: "bg-blue-100", text: "text-blue-700", icon: "📜" },
};

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string }> = {
  beginner: { bg: "bg-green-100", text: "text-green-700" },
  intermediate: { bg: "bg-yellow-100", text: "text-yellow-700" },
  advanced: { bg: "bg-red-100", text: "text-red-700" },
};

export default function QuizCard({
  id,
  title,
  description,
  category,
  difficulty,
  imageUrl,
  timeLimit,
  questionCount,
  userProgress,
  featured,
}: QuizCardProps) {
  const categoryStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.poses;
  const difficultyStyle = DIFFICULTY_STYLES[difficulty] || DIFFICULTY_STYLES.beginner;

  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      return `${mins} min`;
    }
    return `${seconds}s`;
  };

  return (
    <Link
      href={`/quiz/${id}`}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-sage-200 hover:shadow-lg transition-all group"
    >
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-br from-sage-400 to-sage-600 flex items-center justify-center">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-5xl">{categoryStyle.icon}</span>
        )}

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-medium">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        {/* Completed badge */}
        {userProgress && userProgress.bestScore >= 70 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Passed
          </div>
        )}

        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryStyle.bg} ${categoryStyle.text} capitalize`}>
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-sage-700 transition-colors line-clamp-2">
          {title}
        </h3>

        {description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {description}
          </p>
        )}

        {/* Meta info */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <HelpCircle className="w-4 h-4" />
            {questionCount} questions
          </span>
          {timeLimit && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(timeLimit)}
            </span>
          )}
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyStyle.bg} ${difficultyStyle.text} capitalize`}>
            {difficulty}
          </span>
        </div>

        {/* User progress */}
        {userProgress ? (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              <p className="text-sm text-gray-500">Best Score</p>
              <p className="font-semibold text-gray-900">
                {Math.round(userProgress.bestScore)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Attempts</p>
              <p className="font-semibold text-gray-900">
                {userProgress.attempts}
              </p>
            </div>
            <button className="flex items-center gap-1 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors text-sm font-medium">
              Retry
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Not attempted yet</span>
            <span className="flex items-center gap-1 text-sage-600 font-medium group-hover:gap-2 transition-all text-sm">
              Start Quiz
              <ArrowRight className="w-4 h-4" />
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

// Compact version for sidebars
export function QuizCardCompact({
  id,
  title,
  category,
  questionCount,
}: {
  id: string;
  title: string;
  category: string;
  questionCount: number;
}) {
  const categoryStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.poses;

  return (
    <Link
      href={`/quiz/${id}`}
      className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-sage-200 hover:shadow-md transition-all group"
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${categoryStyle.bg}`}>
        {categoryStyle.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm truncate group-hover:text-sage-700 transition-colors">
          {title}
        </h4>
        <p className="text-xs text-gray-500">
          {questionCount} questions
        </p>
      </div>
      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-sage-600 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}
