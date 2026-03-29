"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { InsightData, QuizResult } from "@/types";
import Loader from "./Loader";

interface InsightsProps {
  documentText: string;
  quizResults?: QuizResult[];
  onRetakeQuiz: () => void;
}

export default function Insights({ documentText, quizResults, onRetakeQuiz }: InsightsProps) {
  const [insights, setInsights] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: documentText,
          mode: "insights",
          quizResults: quizResults || [],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load insights.");
      setInsights(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <Loader fullScreen />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">{error}</p>
        <button
          onClick={fetchInsights}
          className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-500 text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!insights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto px-4 py-8 space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Study Insights</h2>
        {quizResults && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Based on your quiz performance ({quizResults.filter((r) => r.isCorrect).length}/{quizResults.length} correct)
          </p>
        )}
      </div>

      {/* Summary */}
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1A1A2E] border border-slate-200 dark:border-[#2D2D44]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
          Overall Summary
        </h3>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {insights.summary}
        </p>
      </div>

      {/* Strong areas */}
      <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
          <span>✓</span> Strong Areas
        </h3>
        <div className="flex flex-wrap gap-2">
          {insights.strongAreas.map((area) => (
            <motion.span
              key={area}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
            >
              {area}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Weak areas */}
      <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-red-500 dark:text-red-400 mb-3 flex items-center gap-2">
          <span>⚠</span> Areas to Review
        </h3>
        <div className="flex flex-wrap gap-2">
          {insights.weakAreas.map((area) => (
            <motion.span
              key={area}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
            >
              {area}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Study priorities */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1A1A2E] border border-slate-200 dark:border-[#2D2D44]">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
          <span>📋</span> Study Priority List
        </h3>
        <ol className="space-y-3">
          {insights.studyPriorities.map((priority, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.07 }}
              className="flex gap-3 text-sm"
            >
              <span className="flex-none w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {priority}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onRetakeQuiz}
          className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Retake Quiz
        </button>
        <button
          onClick={fetchInsights}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-sm font-semibold shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
        >
          Refresh Insights
        </button>
      </div>
    </motion.div>
  );
}
