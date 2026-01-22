"use client";

import Link from "next/link";

export default function SessionComplete() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Celebratory glow effect */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full opacity-25 blur-3xl pointer-events-none animate-fade-in"
        style={{
          background:
            "radial-gradient(ellipse, var(--success) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
        {/* Success icon with glow */}
        <div
          className="text-6xl mb-6 animate-scale-in"
          style={{
            filter: "drop-shadow(0 0 20px rgba(34, 197, 94, 0.5))",
          }}
        >
          &#9733;
        </div>

        <h1
          className="font-display text-3xl font-semibold tracking-tight mb-3 animate-fade-in-up opacity-0 stagger-1"
          style={{ animationFillMode: "forwards" }}
        >
          Chunk Mastered!
        </h1>

        <p
          className="text-lg mb-8 max-w-[280px] animate-fade-in-up opacity-0 stagger-2"
          style={{ color: "var(--foreground-muted)", animationFillMode: "forwards" }}
        >
          You&apos;ve successfully memorized all the lines in this session.
        </p>

        {/* Motivational note */}
        <div
          className="px-5 py-4 rounded-xl mb-8 max-w-[300px] animate-fade-in-up opacity-0 stagger-3"
          style={{
            background: "var(--success-subtle)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            animationFillMode: "forwards",
          }}
        >
          <p className="text-sm" style={{ color: "var(--success)" }}>
            Come back tomorrow to reinforce what you&apos;ve learned. Spaced
            repetition makes memories stick.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70 animate-fade-in-up opacity-0 stagger-4"
          style={{ color: "var(--accent)", animationFillMode: "forwards" }}
        >
          <span>&larr;</span>
          <span>Back to home</span>
        </Link>
      </div>
    </div>
  );
}
