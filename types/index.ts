// types/index.ts

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  topic: string;
}

export interface QuizResult {
  questionId: string;
  question: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  topic: string;
}

export interface InsightData {
  strongAreas: string[];
  weakAreas: string[];
  studyPriorities: string[];
  summary: string;
}

export type AIMode = "flashcards" | "quiz-short" | "quiz-long" | "insights";

export type AppTab = "upload" | "flashcards" | "quiz" | "insights";

export interface AIRequestBody {
  text: string;
  mode: AIMode;
  quizResults?: QuizResult[];
}
