// app/api/ai/route.ts
// Server-side only - Groq API key is NEVER exposed to the client

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import groq from "@/lib/groq";
import {
  flashcardsPrompt,
  quizShortPrompt,
  quizLongPrompt,
  insightsPrompt,
} from "@/lib/prompts";

const MAX_TEXT_LENGTH = 15000;

const requestSchema = z.object({
  text: z
    .string()
    .min(50, "Document text is too short.")
    .max(MAX_TEXT_LENGTH, `Text must be under ${MAX_TEXT_LENGTH} characters.`),
  mode: z.enum(["flashcards", "quiz-short", "quiz-long", "insights"]),
  quizResults: z.array(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON." },
        { status: 400 }
      );
    }

    // Validate with Zod
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Invalid request.";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { text, mode, quizResults } = parsed.data;

    // Select prompt based on mode
    let prompt: string;
    switch (mode) {
      case "flashcards":
        prompt = flashcardsPrompt(text);
        break;
      case "quiz-short":
        prompt = quizShortPrompt(text);
        break;
      case "quiz-long":
        prompt = quizLongPrompt(text);
        break;
      case "insights":
        prompt = insightsPrompt(text, quizResults);
        break;
      default:
        return NextResponse.json({ error: "Invalid mode." }, { status: 400 });
    }

    // Call Groq API
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 4096,
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (!rawContent) {
      return NextResponse.json(
        { error: "AI returned an empty response. Please try again." },
        { status: 500 }
      );
    }

    // Parse JSON response
    let parsedResult: unknown;
    try {
      // Strip any accidental code fences the model may add despite instructions
      const cleaned = rawContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();
      parsedResult = JSON.parse(cleaned);
    } catch {
      return NextResponse.json(
        { error: "AI returned malformed data. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: parsedResult }, { status: 200 });
  } catch (error) {
    // Never expose raw errors or stack traces
    console.error("AI route error:", error);
    return NextResponse.json(
      {
        error:
          "Something went wrong while processing your request. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
