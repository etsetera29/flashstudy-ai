"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { parseFile } from "@/lib/parseFile";
import { Flashcard } from "@/types";
import Loader from "./Loader";

interface UploadScreenProps {
  onComplete: (flashcards: Flashcard[], documentText: string) => void;
}

export default function UploadScreen({ onComplete }: UploadScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((f: File) => {
    setError(null);
    const ext = f.name.toLowerCase().slice(f.name.lastIndexOf("."));
    if (ext !== ".pdf" && ext !== ".docx") {
      setError("Only PDF and DOCX files are supported.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError(`File too large (${(f.size / 1024 / 1024).toFixed(1)}MB). Maximum is 5MB.`);
      return;
    }
    setFile(f);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const handleAnalyze = async () => {
    if (!file) return;
    setError(null);
    setIsLoading(true);

    try {
      const text = await parseFile(file);

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, mode: "flashcards" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards.");
      }

      onComplete(data.result, text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12">
      {/* Hero text */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
          Turn any document into
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
            a study session
          </span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto">
          Upload a PDF or DOCX and get AI-generated flashcards, quizzes, and study insights instantly.
        </p>
      </motion.div>

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-lg"
      >
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !file && fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
            transition-all duration-200 select-none
            ${isDragging
              ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 scale-[1.02]"
              : file
              ? "border-indigo-300 dark:border-indigo-700 bg-indigo-50/50 dark:bg-indigo-950/20 cursor-default"
              : "border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 bg-white dark:bg-[#1A1A2E]"
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div
                key="file-selected"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="space-y-3"
              >
                {/* File icon */}
                <div className="mx-auto w-14 h-14 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <svg className="w-7 h-7 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate max-w-xs mx-auto">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); setError(null); }}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline"
                >
                  Remove file
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <div className="mx-auto w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <svg className="w-7 h-7 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-700 dark:text-slate-300">
                    Drop your file here
                  </p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
                    or <span className="text-indigo-500 dark:text-indigo-400 font-medium">browse</span> to choose
                  </p>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-600">
                  PDF or DOCX · Max 5MB
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analyze button */}
        <motion.button
          onClick={handleAnalyze}
          disabled={!file || isLoading}
          whileHover={file ? { scale: 1.02 } : {}}
          whileTap={file ? { scale: 0.98 } : {}}
          className={`
            mt-4 w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200
            ${file
              ? "bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30"
              : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
            }
          `}
        >
          Analyze Document
        </motion.button>
      </motion.div>

      {/* Feature pills */}
      <motion.div
        className="flex flex-wrap justify-center gap-2 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {["🃏 Flashcards", "📝 Quizzes", "💡 Insights"].map((label) => (
          <span
            key={label}
            className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            {label}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
