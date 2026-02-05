"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Brain,
  Loader2,
  Play,
  AlertCircle,
} from "lucide-react";
import QuestionView from "@/components/quiz/QuestionView";
import ResultsView from "@/components/quiz/ResultsView";

interface Question {
  id: string;
  type: string;
  question: string;
  imageUrl: string | null;
  options: string[];
  points: number;
  order: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  imageUrl: string | null;
  timeLimit: number | null;
  passingScore: number;
  questions: Question[];
}

interface QuizResult {
  questionId: string;
  question: string;
  userAnswer: string | null;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string | null;
  points: number;
}

type QuizState = "loading" | "ready" | "playing" | "submitting" | "results" | "error";

export default function QuizPlayPage() {
  const params = useParams();
  const router = useRouter();
  const quizId = params.id as string;

  const [state, setState] = useState<QuizState>("loading");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [results, setResults] = useState<{
    score: number;
    maxScore: number;
    percentage: number;
    passed: boolean;
    passingScore: number;
    results: QuizResult[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch quiz data
  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    setState("loading");
    try {
      const res = await fetch(`/api/quizzes/${quizId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Quiz not found");
        } else {
          setError("Failed to load quiz");
        }
        setState("error");
        return;
      }
      const data = await res.json();
      setQuiz(data.quiz);
      setState("ready");
    } catch (err) {
      setError("Failed to load quiz");
      setState("error");
    }
  };

  // Timer
  useEffect(() => {
    if (state !== "playing" || !quiz?.timeLimit || !startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = quiz.timeLimit! - elapsed;

      if (remaining <= 0) {
        setTimeRemaining(0);
        handleSubmit();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state, quiz?.timeLimit, startTime]);

  const startQuiz = () => {
    setStartTime(Date.now());
    setTimeRemaining(quiz?.timeLimit || null);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setState("playing");
  };

  const handleAnswer = (answer: string) => {
    if (!quiz) return;
    const question = quiz.questions[currentQuestionIndex];
    setAnswers((prev) => ({ ...prev, [question.id]: answer }));
  };

  const goToNextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const goToPrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !startTime) return;

    setState("submitting");
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    try {
      const res = await fetch(`/api/quizzes/${quizId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeSpent }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit");
      }

      const data = await res.json();
      setResults({
        ...data,
        timeSpent,
      });
      setState("results");
    } catch (err) {
      setError("Failed to submit quiz");
      setState("error");
    }
  };

  const handleRetry = () => {
    setResults(null);
    setAnswers({});
    setState("ready");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {error || "Something went wrong"}
        </h1>
        <Link
          href="/quiz"
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Quizzes
        </Link>
      </div>
    );
  }

  // Results state
  if (state === "results" && results && quiz) {
    return (
      <div className="min-h-screen bg-linear-to-b from-indigo-50 to-white py-12 px-4">
        <ResultsView
          quizTitle={quiz.title}
          score={results.score}
          maxScore={results.maxScore}
          percentage={results.percentage}
          passed={results.passed}
          passingScore={results.passingScore}
          results={results.results}
          timeSpent={startTime ? Math.floor((Date.now() - startTime) / 1000) : undefined}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  // Ready state (before starting)
  if (state === "ready" && quiz) {
    return (
      <div className="min-h-screen bg-linear-to-b from-indigo-50 to-white">
        <div className="max-w-2xl mx-auto px-4 py-12">
          {/* Back link */}
          <Link
            href="/quiz"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            All Quizzes
          </Link>

          {/* Quiz info card */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="relative h-40 bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-16 h-16 text-white/30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white text-center px-4">
                  {quiz.title}
                </h1>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {quiz.description && (
                <p className="text-gray-600 mb-6">{quiz.description}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">
                    {quiz.questions.length}
                  </p>
                  <p className="text-sm text-gray-500">Questions</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">
                    {quiz.timeLimit ? formatTime(quiz.timeLimit) : "∞"}
                  </p>
                  <p className="text-sm text-gray-500">Time Limit</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-2xl font-bold text-gray-900">
                    {quiz.passingScore}%
                  </p>
                  <p className="text-sm text-gray-500">To Pass</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-6">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium capitalize">
                  {quiz.category}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
                  {quiz.difficulty}
                </span>
              </div>

              {/* Start button */}
              <button
                onClick={startQuiz}
                className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold text-lg"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                Start Quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing state (also show during submitting)
  if ((state === "playing" || state === "submitting") && quiz) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    const hasAnswered = !!answers[currentQuestion.id];

    return (
      <div className="min-h-screen bg-linear-to-b from-indigo-50 to-white">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link
              href="/quiz"
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <h1 className="font-semibold text-gray-900 truncate max-w-[200px]">
              {quiz.title}
            </h1>

            {timeRemaining !== null && (
              <div
                className={`flex items-center gap-1 font-mono text-sm ${
                  timeRemaining < 60 ? "text-red-600" : "text-gray-600"
                }`}
              >
                <Clock className="w-4 h-4" />
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-3xl mx-auto px-4 py-8">
          <QuestionView
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quiz.questions.length}
            selectedAnswer={answers[currentQuestion.id] || null}
            onAnswer={handleAnswer}
          />

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={goToPrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex gap-1">
              {quiz.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentQuestionIndex
                      ? "bg-indigo-600"
                      : answers[quiz.questions[index].id]
                      ? "bg-indigo-300"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={state === "submitting"}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
              >
                {state === "submitting" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Submit"
                )}
              </button>
            ) : (
              <button
                onClick={goToNextQuestion}
                className="flex items-center gap-2 px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress info */}
          <div className="mt-8 text-center text-sm text-gray-500">
            {answeredCount} of {quiz.questions.length} questions answered
          </div>
        </main>
      </div>
    );
  }

  return null;
}
