import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import ThemeToggle from "@/components/ThemeToggle";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "FlashStudy AI",
  description: "Turn any document into flashcards, quizzes, and study insights instantly.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧠</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${syne.variable} ${dmSans.variable} font-body antialiased bg-[#F9FAFB] dark:bg-[#0F0F1A] transition-colors duration-200`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          {/* Navbar */}
          <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-[#2D2D44] bg-white/80 dark:bg-[#0F0F1A]/80 backdrop-blur-md">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🧠</span>
                <span className="font-display font-bold text-slate-900 dark:text-white tracking-tight">
                  FlashStudy <span className="text-indigo-500 dark:text-indigo-400">AI</span>
                </span>
              </div>
              <ThemeToggle />
            </div>
          </header>

          <main className="max-w-5xl mx-auto">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
