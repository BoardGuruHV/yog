"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface QuestionViewProps {
  question: {
    id: string;
    type: string;
    question: string;
    imageUrl?: string | null;
    options: string[];
    points: number;
  };
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onAnswer: (answer: string) => void;
  showResult?: boolean;
  correctAnswer?: string;
  explanation?: string;
  disabled?: boolean;
}

export default function QuestionView({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  showResult = false,
  correctAnswer,
  explanation,
  disabled = false,
}: QuestionViewProps) {
  const isCorrect = showResult && selectedAnswer === correctAnswer;
  const isIncorrect = showResult && selectedAnswer !== correctAnswer;

  const getOptionStyle = (option: string, index: number) => {
    const optionValue = index.toString();
    const isSelected = selectedAnswer === optionValue;

    if (showResult) {
      if (optionValue === correctAnswer) {
        return "border-green-500 bg-green-50 ring-2 ring-green-500";
      }
      if (isSelected && optionValue !== correctAnswer) {
        return "border-red-500 bg-red-50 ring-2 ring-red-500";
      }
      return "border-gray-200 bg-gray-50 opacity-60";
    }

    if (isSelected) {
      return "border-sage-500 bg-sage-50 ring-2 ring-sage-500";
    }

    return "border-gray-200 hover:border-sage-300 hover:bg-sage-50";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-gray-100">
        <div
          className="h-full bg-sage-500 transition-all duration-300"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-500">
            Question {questionNumber} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-500">
            {question.points} point{question.points !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Question */}
        <h2 className="text-xl font-semibold text-gray-900">
          {question.question}
        </h2>

        {/* Question image */}
        {question.imageUrl && (
          <div className="mt-4 rounded-xl overflow-hidden bg-gray-100">
            <img
              src={question.imageUrl}
              alt="Question image"
              className="w-full max-h-64 object-contain"
            />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="p-6 space-y-3">
        {question.options.map((option, index) => {
          const optionValue = index.toString();
          const isSelected = selectedAnswer === optionValue;

          return (
            <button
              key={index}
              onClick={() => !disabled && onAnswer(optionValue)}
              disabled={disabled}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${getOptionStyle(
                option,
                index
              )} ${disabled ? "cursor-default" : "cursor-pointer"}`}
            >
              {/* Option letter */}
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                  showResult && optionValue === correctAnswer
                    ? "bg-green-500 text-white"
                    : showResult && isSelected && optionValue !== correctAnswer
                    ? "bg-red-500 text-white"
                    : isSelected
                    ? "bg-sage-500 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>

              {/* Option text */}
              <span className="flex-1 text-gray-700">{option}</span>

              {/* Result icon */}
              {showResult && optionValue === correctAnswer && (
                <CheckCircle className="w-6 h-6 text-green-500 shrink-0" />
              )}
              {showResult && isSelected && optionValue !== correctAnswer && (
                <XCircle className="w-6 h-6 text-red-500 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation (shown after answering) */}
      {showResult && explanation && (
        <div className="px-6 pb-6">
          <div className={`p-4 rounded-xl ${isCorrect ? "bg-green-50" : "bg-amber-50"}`}>
            <div className="flex items-start gap-3">
              <HelpCircle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  isCorrect ? "text-green-600" : "text-amber-600"
                }`}
              />
              <div>
                <p className={`font-medium ${isCorrect ? "text-green-800" : "text-amber-800"}`}>
                  {isCorrect ? "Correct!" : "Explanation"}
                </p>
                <p className={`text-sm mt-1 ${isCorrect ? "text-green-700" : "text-amber-700"}`}>
                  {explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// True/False question variant
export function TrueFalseQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswer,
  showResult = false,
  correctAnswer,
  explanation,
  disabled = false,
}: Omit<QuestionViewProps, "question"> & {
  question: Omit<QuestionViewProps["question"], "options"> & { options?: string[] };
}) {
  const options = ["True", "False"];

  return (
    <QuestionView
      question={{ ...question, options }}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      selectedAnswer={selectedAnswer}
      onAnswer={onAnswer}
      showResult={showResult}
      correctAnswer={correctAnswer}
      explanation={explanation}
      disabled={disabled}
    />
  );
}
