// lib/groq.ts
// Server-side only - never import this in client components

import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY environment variable is not set.");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default groq;
