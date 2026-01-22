"use client";

import Link from "next/link";

interface HomeScreenProps {
  lineCount: number;
  onStartReview: () => void;
}

export default function HomeScreen({
  lineCount,
  onStartReview,
}: HomeScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Ambient glow effect */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, var(--accent) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 animate-fade-in-up">
        {/* Theatrical mask icon */}
        <div className="text-5xl mb-6 opacity-90">&#127917;</div>

        <h1 className="font-display text-4xl font-semibold tracking-tight mb-3">
          Script Memory
        </h1>

        <p
          className="text-lg mb-2"
          style={{ color: "var(--foreground-muted)" }}
        >
          {lineCount} lines ready to practice
        </p>

        <p
          className="text-sm mb-10 max-w-[280px]"
          style={{ color: "var(--foreground-subtle)" }}
        >
          Learn in focused chunks of 5, master each line with 3 consecutive
          correct recalls
        </p>

        <button
          onClick={onStartReview}
          className="group relative w-full max-w-xs min-h-14 rounded-xl font-semibold text-[#0c0a09] overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-muted) 100%)",
            boxShadow: "0 4px 24px rgba(245, 158, 11, 0.3)",
          }}
        >
          <span className="relative z-10">Begin Practice</span>
          {/* Shine effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>

        <Link
          href="/scripts/new"
          className="inline-block mt-6 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "var(--accent)" }}
        >
          Import a different script
        </Link>
      </div>

      {/* Footer */}
      <footer
        className="absolute bottom-0 left-0 right-0 py-4 text-center text-xs"
        style={{ color: "var(--foreground-subtle)" }}
      >
        <p>An experimental project by Hugo H. Macedo</p>
      </footer>
    </div>
  );
}
