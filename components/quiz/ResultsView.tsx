"use client";

import Link from "next/link";
import {
  Trophy,
  Target,
  CheckCircle,
  XCircle,
  RotateCcw,
  ArrowRight,
  Share2,
  Home,
} from "lucide-react";

interface QuizResult {
  questionId: string;
  question: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string | null;
  points: number;
}

interface ResultsViewProps {
  quizTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  passingScore: number;
  results: QuizResult[];
  timeSpent?: number;
  onRetry: () => void;
}

export default function ResultsView({
  quizTitle,
  score,
  maxScore,
  percentage,
  passed,
  passingScore,
  results,
  timeSpent,
  onRetry,
}: ResultsViewProps) {
  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalQuestions = results.length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const getScoreColor = () => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = () => {
    if (percentage >= 80) return "from-green-500 to-emerald-600";
    if (percentage >= 60) return "from-yellow-500 to-amber-600";
    return "from-red-500 to-rose-600";
  };

  const handleShare = async () => {
    const text = `I scored ${Math.round(percentage)}% on "${quizTitle}" quiz! Can you beat my score?`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Quiz Results",
          text,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(text);
      alert("Results copied to clipboard!");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Score Card */}
      <div className={`bg-gradient-to-br ${getScoreBg()} rounded-3xl p-8 text-white text-center mb-8`}>
        <div className="mb-4">
          {passed ? (
            <Trophy className="w-16 h-16 mx-auto text-yellow-300" />
          ) : (
            <Target className="w-16 h-16 mx-auto text-white/80" />
          )}
        </div>

        <h2 className="text-3xl font-bold mb-2">
          {passed ? "Congratulations!" : "Keep Practicing!"}
        </h2>

        <p className="text-white/80 mb-6">
          {passed
            ? "You passed the quiz!"
            : `You need ${passingScore}% to pass.`}
        </p>

        <div className="text-7xl font-bold mb-2">
          {Math.round(percentage)}%
        </div>

        <p className="text-white/80">
          {score} / {maxScore} points
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-2xl font-bold text-gray-900">{correctCount}</span>
          </div>
          <p className="text-sm text-gray-500">Correct</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <XCircle className="w-5 h-5 text-red-500" />
            <span className="text-2xl font-bold text-gray-900">
              {totalQuestions - correctCount}
            </span>
          </div>
          <p className="text-sm text-gray-500">Incorrect</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {timeSpent ? formatTime(timeSpent) : "--"}
          </div>
          <p className="text-sm text-gray-500">Time</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={onRetry}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-sage-600 text-white rounded-xl hover:bg-sage-700 transition-colors font-medium"
        >
          <RotateCcw className="w-5 h-5" />
          Try Again
        </button>

        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-sage-300 transition-colors"
        >
          <Share2 className="w-5 h-5 text-gray-600" />
        </button>

        <Link
          href="/quiz"
          className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-gray-200 rounded-xl hover:border-sage-300 transition-colors"
        >
          <Home className="w-5 h-5 text-gray-600" />
        </Link>
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Review Answers</h3>
        </div>

        <div className="divide-y divide-gray-100">
          {results.map((result, index) => (
            <div key={result.questionId} className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                    result.isCorrect ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {result.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">Question {index + 1}</p>
                  <p className="font-medium text-gray-900 mb-2">{result.question}</p>

                  {!result.isCorrect && result.explanation && (
                    <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3 mt-2">
                      {result.explanation}
                    </p>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    result.isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {result.isCorrect ? `+${result.points}` : "0"} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* More Quizzes */}
      <div className="mt-8 text-center">
        <Link
          href="/quiz"
          className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-700 font-medium"
        >
          Explore More Quizzes
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
