// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const MAX_CONTENT_LENGTH = 1.5 * 1024 * 1024; // 1.5MB

// Lazily initialize rate limiter to avoid build-time errors
let ratelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Upstash Redis env vars not set - rate limiting disabled.");
    return null;
  }

  if (!ratelimit) {
    ratelimit = new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      }),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: false,
    });
  }

  return ratelimit;
}

export async function middleware(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  // --- Origin Check ---
  // Only enforce in production when NEXT_PUBLIC_APP_URL is set
  if (appUrl && process.env.NODE_ENV === "production") {
    const origin = request.headers.get("origin");
    if (origin && origin !== appUrl) {
      return new NextResponse(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // --- Request Size Cap ---
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > MAX_CONTENT_LENGTH) {
    return new NextResponse(
      JSON.stringify({ error: "Request too large. Maximum size is 1.5MB." }),
      {
        status: 413,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // --- Rate Limiting ---
  const limiter = getRatelimit();
  if (limiter) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const { success, limit, remaining, reset } = await limiter.limit(ip);

    if (!success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests. Please wait a moment before trying again.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
            "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }
  }

  // --- CORS Headers ---
  const response = NextResponse.next();
  const allowedOrigin = appUrl || "*";
  response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return response;
}

export const config = {
  matcher: ["/api/ai/:path*"],
};
