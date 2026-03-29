"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuizQuestion, QuizResult } from "@/types";
import Loader from "./Loader";

interface QuizProps {
  documentText: string;
  onFinished: (results: QuizResult[]) => void;
}

type QuizState = "mode-select" | "loading" | "question" | "results";

export default function Quiz({ documentText, onFinished }: QuizProps) {
  const [state, setState] = useState<QuizState>("mode-select");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadQuiz = async (mode: "quiz-short" | "quiz-long") => {
    setState("loading");
    setError(null);
    setResults([]);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setIsAnswered(false);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: documentText, mode }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load quiz.");
      setQuestions(data.result);
      setState("question");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("mode-select");
    }
  };

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);

    const current = questions[currentIndex];
    const isCorrect = option === current.answer;
    const newResult: QuizResult = {
      questionId: current.id,
      question: current.question,
      selectedAnswer: option,
      correctAnswer: current.answer,
      isCorrect,
      topic: current.topic,
    };
    setResults((prev) => [...prev, newResult]);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setState("results");
    }
  };

  const current = questions[currentIndex];
  const score = results.filter((r) => r.isCorrect).length;
  const total = results.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  // Group results by topic
  const topicBreakdown = results.reduce<Record<string, { correct: number; total: number }>>(
    (acc, r) => {
      if (!acc[r.topic]) acc[r.topic] = { correct: 0, total: 0 };
      acc[r.topic].total++;
      if (r.isCorrect) acc[r.topic].correct++;
      return acc;
    },
    {}
  );

  // --- Mode select screen ---
  if (state === "mode-select") {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Choose Quiz Length</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
          Questions are generated fresh from your document each time.
        </p>
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => loadQuiz("quiz-short")}
            className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-[#1A1A2E] text-left transition-all group"
          >
            <div className="text-3xl mb-3">⚡</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              Short Quiz
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">8–10 questions</div>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => loadQuiz("quiz-long")}
            className="p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 bg-white dark:bg-[#1A1A2E] text-left transition-all group"
          >
            <div className="text-3xl mb-3">📚</div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              Long Quiz
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">20–25 questions</div>
          </motion.button>
        </div>
      </div>
    );
  }

  // --- Loading ---
  if (state === "loading") {
    return <Loader fullScreen />;
  }

  // --- Results screen ---
  if (state === "results") {
    const scoreColor =
      percentage >= 80
        ? "text-emerald-500 dark:text-emerald-400"
        : percentage >= 60
        ? "text-amber-500 dark:text-amber-400"
        : "text-red-500 dark:text-red-400";

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto px-4 py-8"
      >
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">
            {percentage >= 80 ? "🎉" : percentage >= 60 ? "👍" : "📖"}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Quiz Complete</h2>
          <p className={`text-5xl font-bold mt-3 ${scoreColor}`}>{percentage}%</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {score} correct out of {total} questions
          </p>
        </div>

        {/* Topic breakdown */}
        <div className="space-y-2 mb-8">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Score by topic</h3>
          {Object.entries(topicBreakdown).map(([topic, { correct, total: t }]) => (
            <div key={topic} className="flex items-center gap-3">
              <span className="text-xs text-slate-600 dark:text-slate-400 w-32 truncate">{topic}</span>
              <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    correct / t >= 0.7
                      ? "bg-emerald-400 dark:bg-emerald-500"
                      : "bg-red-400 dark:bg-red-500"
                  }`}
                  style={{ width: `${(correct / t) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-500 tabular-nums w-10 text-right">
                {correct}/{t}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setState("mode-select")}
            className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Retake Quiz
          </button>
          <button
            onClick={() => onFinished(results)}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Get Insights →
          </button>
        </div>
      </motion.div>
    );
  }

  // --- Question screen ---
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span className="text-xs font-mono text-slate-400 dark:text-slate-500 tabular-nums">
          {currentIndex + 1}/{questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          {/* Topic tag */}
          <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 mb-4">
            {current.topic}
          </span>

          {/* Question */}
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white mb-6 leading-relaxed">
            {current.question}
          </h3>

          {/* Options */}
          <div className="space-y-3 mb-6">
            {current.options.map((option) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = option === current.answer;
              let optionStyle = "bg-white dark:bg-[#1A1A2E] border-slate-200 dark:border-[#2D2D44] text-slate-700 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-indigo-600";

              if (isAnswered) {
                if (isCorrect) {
                  optionStyle = "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300";
                } else if (isSelected && !isCorrect) {
                  optionStyle = "bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300";
                } else {
                  optionStyle = "bg-white dark:bg-[#1A1A2E] border-slate-200 dark:border-[#2D2D44] text-slate-400 dark:text-slate-600 opacity-60";
                }
              }

              return (
                <motion.button
                  key={option}
                  whileHover={!isAnswered ? { scale: 1.01 } : {}}
                  whileTap={!isAnswered ? { scale: 0.99 } : {}}
                  onClick={() => handleAnswer(option)}
                  disabled={isAnswered}
                  className={`w-full text-left px-5 py-4 rounded-xl border-2 text-sm font-medium transition-all ${optionStyle} ${isAnswered ? "cursor-default" : "cursor-pointer"}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs opacity-60">{option.slice(0, 2)}</span>
                    <span>{option.slice(3)}</span>
                    {isAnswered && isCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-emerald-500 dark:text-emerald-400"
                      >
                        ✓
                      </motion.span>
                    )}
                    {isAnswered && isSelected && !isCorrect && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto text-red-500 dark:text-red-400"
                      >
                        ✗
                      </motion.span>
                    )}
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 leading-relaxed"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  {selectedAnswer === current.answer ? "✓ Correct!" : "✗ Incorrect."}
                </span>
                {current.explanation}
              </motion.div>
            )}
          </AnimatePresence>

          {isAnswered && (
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {currentIndex < questions.length - 1 ? "Next Question →" : "See Results →"}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
