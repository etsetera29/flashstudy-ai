"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_MESSAGES = [
  "Reading your document...",
  "Identifying key concepts...",
  "Crafting study materials...",
  "Almost ready...",
];

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export default function Loader({ message, fullScreen = false }: LoaderProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (message) return; // Don't cycle if a fixed message is provided
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [message]);

  const displayMessage = message || LOADING_MESSAGES[messageIndex];

  const content = (
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-indigo-500 dark:border-t-indigo-400 animate-spin" />
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-violet-400 dark:border-t-violet-300 animate-spin [animation-duration:1.5s] [animation-direction:reverse]" />
      </div>

      {/* Animated message */}
      <AnimatePresence mode="wait">
        <motion.p
          key={displayMessage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center"
        >
          {displayMessage}
        </motion.p>
      </AnimatePresence>

      {/* Skeleton bars */}
      <div className="w-64 space-y-2 mt-2">
        {[100, 85, 92, 70].map((width, i) => (
          <motion.div
            key={i}
            className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-400 to-violet-400 dark:from-indigo-500 dark:to-violet-500 rounded-full"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                repeat: Infinity,
                duration: 1.5,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
              style={{ width: `${width}%` }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-[#0F0F1A]/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-20">{content}</div>
  );
}
