"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flashcard, QuizResult } from "@/types";
import UploadScreen from "@/components/UploadScreen";
import Flashcards from "@/components/Flashcards";
import Quiz from "@/components/Quiz";
import Insights from "@/components/Insights";

type AppTab = "upload" | "flashcards" | "quiz" | "insights";

const TABS: { id: Exclude<AppTab, "upload">; label: string; icon: string }[] = [
  { id: "flashcards", label: "Flashcards", icon: "🃏" },
  { id: "quiz", label: "Quiz", icon: "📝" },
  { id: "insights", label: "Insights", icon: "💡" },
];

export default function Home() {
  const [tab, setTab] = useState<AppTab>("upload");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [documentText, setDocumentText] = useState<string>("");
  const [quizResults, setQuizResults] = useState<QuizResult[] | undefined>(undefined);

  const handleUploadComplete = (cards: Flashcard[], text: string) => {
    setFlashcards(cards);
    setDocumentText(text);
    setQuizResults(undefined);
    setTab("flashcards");
  };

  const handleQuizFinished = (results: QuizResult[]) => {
    setQuizResults(results);
    setTab("insights");
  };

  const handleRetakeQuiz = () => {
    setTab("quiz");
  };

  const handleNewDocument = () => {
    setFlashcards([]);
    setDocumentText("");
    setQuizResults(undefined);
    setTab("upload");
  };

  if (tab === "upload") {
    return <UploadScreen onComplete={handleUploadComplete} />;
  }

  return (
    <div className="px-4 py-6">
      {/* Tab bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center bg-white dark:bg-[#1A1A2E] border border-slate-200 dark:border-[#2D2D44] rounded-xl p-1 gap-1 shadow-sm">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                tab === t.id
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              {tab === t.id && (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-0 bg-slate-100 dark:bg-slate-700 rounded-lg"
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={handleNewDocument}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-[#1A1A2E] border border-slate-200 dark:border-[#2D2D44] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          New Document
        </button>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "flashcards" && (
            <Flashcards
              cards={flashcards}
              onGoToQuiz={() => setTab("quiz")}
            />
          )}
          {tab === "quiz" && (
            <Quiz
              documentText={documentText}
              onFinished={handleQuizFinished}
            />
          )}
          {tab === "insights" && (
            <Insights
              documentText={documentText}
              quizResults={quizResults}
              onRetakeQuiz={handleRetakeQuiz}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
