// lib/prompts.ts

import { QuizResult } from "@/types";

export function flashcardsPrompt(documentText: string): string {
  return `You are an expert study tool. Analyze the following document and generate 15 to 25 flashcards covering the most important concepts, definitions, and key ideas.

Document content:
${documentText}

Generate flashcards as a JSON array. Each flashcard must have:
- id: a unique string like "fc_1", "fc_2", etc.
- question: a clear, specific question about a concept in the document
- answer: a concise but complete answer (2-4 sentences)
- topic: the subject area or chapter this card belongs to (1-4 words)

Respond ONLY with a valid JSON array. No markdown. No explanation. No code fences. No preamble. Start your response with [.`;
}

export function quizShortPrompt(documentText: string): string {
  return `You are an expert quiz creator. Analyze the following document and generate exactly 8 to 10 multiple choice quiz questions covering the key concepts.

Document content:
${documentText}

Generate quiz questions as a JSON array. Each question must have:
- id: a unique string like "q_1", "q_2", etc.
- question: a clear question testing understanding (not just memorization)
- options: array of exactly 4 answer choices labeled A through D (e.g. ["A. ...", "B. ...", "C. ...", "D. ..."])
- answer: the full correct option string (e.g. "A. The correct answer")
- explanation: a 2-3 sentence explanation of why the answer is correct
- topic: the subject area this question covers (1-4 words)

Mix difficulty levels. Make distractors plausible.

Respond ONLY with a valid JSON array. No markdown. No explanation. No code fences. No preamble. Start your response with [.`;
}

export function quizLongPrompt(documentText: string): string {
  return `You are an expert quiz creator. Analyze the following document and generate exactly 20 to 25 multiple choice quiz questions covering all major topics with mixed difficulty levels.

Document content:
${documentText}

Generate quiz questions as a JSON array. Each question must have:
- id: a unique string like "q_1", "q_2", etc.
- question: a clear question testing deep understanding
- options: array of exactly 4 answer choices labeled A through D (e.g. ["A. ...", "B. ...", "C. ...", "D. ..."])
- answer: the full correct option string (e.g. "A. The correct answer")
- explanation: a 2-3 sentence explanation of why the answer is correct
- topic: the subject area this question covers (1-4 words)

Include easy, medium, and hard questions. Cover all major topics in the document. Make distractors plausible.

Respond ONLY with a valid JSON array. No markdown. No explanation. No code fences. No preamble. Start your response with [.`;
}

export function insightsPrompt(
  documentText: string,
  quizResults?: QuizResult[]
): string {
  const quizContext = quizResults
    ? `
Quiz Performance Data:
${JSON.stringify(quizResults, null, 2)}

Total Questions: ${quizResults.length}
Correct Answers: ${quizResults.filter((r) => r.isCorrect).length}
Score: ${Math.round((quizResults.filter((r) => r.isCorrect).length / quizResults.length) * 100)}%
`
    : "No quiz data available - analyze the document content alone.";

  return `You are an expert study coach. Analyze the document and ${quizResults ? "the student's quiz performance" : "the content"} to generate personalized study insights.

Document content:
${documentText}

${quizContext}

Generate a JSON object with these fields:
- strongAreas: array of 2-4 topic strings the student understands well (or appears well-covered in the document)
- weakAreas: array of 2-5 topic strings that need more study (or are complex in the document)
- studyPriorities: ordered array of 3-6 topic strings, most important first, with a brief note after each (e.g. "Topic Name - reason to prioritize")
- summary: a 3-4 sentence plain language paragraph summarizing overall understanding and key recommendations

Be specific and actionable. Reference actual topics from the document.

Respond ONLY with a valid JSON object. No markdown. No explanation. No code fences. No preamble. Start your response with {.`;
}
