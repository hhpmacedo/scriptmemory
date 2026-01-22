"use client";

import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Ambient glow effect */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, var(--accent) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10">
        {/* Theatrical mask - animated entrance */}
        <div className="text-6xl mb-8 animate-fade-in-up opacity-0" style={{ animationFillMode: "forwards" }}>
          &#127917;
        </div>

        <h1 className="font-display text-4xl font-semibold tracking-tight mb-4 animate-fade-in-up opacity-0 stagger-1" style={{ animationFillMode: "forwards" }}>
          Script Memory
        </h1>

        <p
          className="text-lg mb-10 max-w-[300px] animate-fade-in-up opacity-0 stagger-2"
          style={{ color: "var(--foreground-muted)", animationFillMode: "forwards" }}
        >
          Memorize your lines using spaced repetition
        </p>

        {/* Feature highlights */}
        <div
          className="text-left text-sm space-y-3 mb-10 animate-fade-in-up opacity-0 stagger-3"
          style={{ color: "var(--foreground-subtle)", animationFillMode: "forwards" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
              }}
            >
              1
            </span>
            <span>Paste your script in common formats</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
              }}
            >
              2
            </span>
            <span>Select your character to practice</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
              }}
            >
              3
            </span>
            <span>Master 5 lines at a time</span>
          </div>
        </div>

        <Link
          href="/scripts/new"
          className="group relative inline-flex items-center justify-center min-h-14 px-8 rounded-xl font-semibold text-[#0c0a09] overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up opacity-0 stagger-4"
          style={{
            background:
              "linear-gradient(135deg, var(--accent) 0%, var(--accent-muted) 100%)",
            boxShadow: "0 4px 24px rgba(245, 158, 11, 0.3)",
            animationFillMode: "forwards",
          }}
        >
          <span className="relative z-10">Add Your First Script</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </Link>
      </div>
    </div>
  );
}
