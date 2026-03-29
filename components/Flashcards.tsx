"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flashcard } from "@/types";

const TOPIC_COLORS = [
  "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
];

function getTopicColor(topic: string, allTopics: string[]): string {
  const index = allTopics.indexOf(topic) % TOPIC_COLORS.length;
  return TOPIC_COLORS[index >= 0 ? index : 0];
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface FlashcardsProps {
  cards: Flashcard[];
  onGoToQuiz: () => void;
}

export default function Flashcards({ cards, onGoToQuiz }: FlashcardsProps) {
  const [deck, setDeck] = useState<Flashcard[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const allTopics = [...new Set(cards.map((c) => c.topic))];
  const current = deck[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < deck.length - 1) {
      setDirection(1);
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((i) => i + 1), 150);
    }
  }, [currentIndex, deck.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex((i) => i - 1), 150);
    }
  }, [currentIndex]);

  const handleShuffle = () => {
    setDeck(shuffleArray(deck));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleReset = () => {
    setDeck([...cards]);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === " ") { e.preventDefault(); setIsFlipped((f) => !f); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Flashcards</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Card {currentIndex + 1} of {deck.length}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Shuffle
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Reset
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
          animate={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: direction * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -40 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="cursor-pointer"
            onClick={() => setIsFlipped((f) => !f)}
            style={{ perspective: "1000px" }}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 25 }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative w-full"
            >
              {/* Front */}
              <div
                className="w-full min-h-[280px] rounded-2xl bg-white dark:bg-[#1A1A2E] border border-slate-200 dark:border-[#2D2D44] shadow-lg p-8 flex flex-col justify-between"
                style={{ backfaceVisibility: "hidden" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getTopicColor(current.topic, allTopics)}`}>
                    {current.topic}
                  </span>
                  <span className="text-xs text-slate-300 dark:text-slate-600 italic">tap to flip</span>
                </div>
                <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 text-center leading-relaxed">
                  {current.question}
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-0.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                </div>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 w-full min-h-[280px] rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-200 dark:border-indigo-800 shadow-lg p-8 flex flex-col justify-between"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getTopicColor(current.topic, allTopics)}`}>
                    {current.topic}
                  </span>
                  <span className="text-xs text-indigo-300 dark:text-indigo-600 italic">answer</span>
                </div>
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-200 text-center leading-relaxed">
                  {current.answer}
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-0.5 bg-indigo-200 dark:bg-indigo-800 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-slate-400 dark:text-slate-600 mt-3">
        ← → arrow keys to navigate · space to flip
      </p>

      {/* Navigation */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={goPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-medium text-sm bg-white dark:bg-[#1A1A2E] border border-slate-200 dark:border-[#2D2D44] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>
        <span className="text-sm font-mono text-slate-400 dark:text-slate-500 tabular-nums">
          {currentIndex + 1} / {deck.length}
        </span>
        <button
          onClick={goNext}
          disabled={currentIndex === deck.length - 1}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-medium text-sm bg-white dark:bg-[#1A1A2E] border border-slate-200 dark:border-[#2D2D44] text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* CTA to quiz */}
      <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
          Ready to test your knowledge?
        </p>
        <button
          onClick={onGoToQuiz}
          className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Take a Quiz →
        </button>
      </div>
    </div>
  );
}
