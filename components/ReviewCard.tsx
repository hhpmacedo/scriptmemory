"use client";

import { useState, useEffect, useCallback } from "react";
import type { Line } from "@/lib/types";
import { gradeLine } from "@/lib/scheduler";
import { db } from "@/lib/db";

interface ReviewCardProps {
  line: Line;
  onComplete: () => void;
  chunkMastery: { mastered: boolean; current: boolean }[];
  streak: number;
}

export default function ReviewCard({
  line,
  onComplete,
  chunkMastery,
  streak,
}: ReviewCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [grading, setGrading] = useState(false);

  // Reset when line changes
  useEffect(() => {
    setRevealed(false);
    setGrading(false);
  }, [line.id]);

  const handleGrade = useCallback(
    async (correct: boolean) => {
      if (grading) return;
      setGrading(true);

      try {
        const updated = gradeLine(line, correct);
        await db.lines.update(line.id, {
          interval: updated.interval,
          repetition: updated.repetition,
          efactor: updated.efactor,
          dueDate: updated.dueDate,
          consecutiveCorrect: updated.consecutiveCorrect,
        });
        // DB change triggers useLiveQuery, which re-renders parent
        onComplete();
      } catch (error) {
        console.error("Failed to grade:", error);
        setGrading(false);
      }
    },
    [line, grading, onComplete]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!revealed) setRevealed(true);
      } else if (revealed && !grading) {
        if (e.key === "ArrowRight" || e.key === "l") {
          e.preventDefault();
          handleGrade(true);
        } else if (e.key === "ArrowLeft" || e.key === "h") {
          e.preventDefault();
          handleGrade(false);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [revealed, grading, handleGrade]);

  return (
    <div className="flex flex-col h-full">
      {/* Progress indicators - theatrical marquee style */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          {/* Chunk progress: dots with glow for current */}
          <div className="flex gap-2">
            {chunkMastery.map((item, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  item.mastered
                    ? ""
                    : item.current
                    ? "scale-125"
                    : ""
                }`}
                style={{
                  background: item.mastered
                    ? "var(--accent)"
                    : item.current
                    ? "var(--accent)"
                    : "var(--border-strong)",
                  boxShadow: item.current
                    ? "0 0 12px var(--accent)"
                    : "none",
                }}
              />
            ))}
          </div>

          <span
            className="w-px h-4"
            style={{ background: "var(--border-strong)" }}
          />

          {/* Streak progress: elegant bars */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-4 h-1.5 rounded-full transition-all duration-300"
                style={{
                  background:
                    i < streak ? "var(--success)" : "var(--border-strong)",
                  boxShadow:
                    i < streak ? "0 0 8px rgba(34, 197, 94, 0.5)" : "none",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Card content */}
      <div className="flex-1 flex flex-col p-5 pt-2 overflow-auto">
        {/* Cue - the other character's line */}
        <div className="mb-6 animate-fade-in">
          {line.cueCharacter && (
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--foreground-subtle)" }}
            >
              {line.cueCharacter}
            </div>
          )}
          <div
            className="text-lg leading-relaxed"
            style={{ color: "var(--foreground-muted)" }}
          >
            {line.cue}
          </div>
        </div>

        {/* Elegant divider */}
        <div
          className="h-px my-4"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--border-strong), transparent)",
          }}
        />

        {/* Response - your line */}
        {revealed ? (
          <div className="mb-6 animate-scale-in">
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "var(--accent)" }}
            >
              {line.responseCharacter}
            </div>
            <div className="text-xl font-medium leading-relaxed">
              {line.response}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setRevealed(true)}
              className="w-full max-w-xs min-h-14 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: "var(--background-elevated)",
                border: "1px solid var(--border)",
                color: "var(--foreground-muted)",
              }}
            >
              Reveal Your Line
            </button>
          </div>
        )}
      </div>

      {/* Grade buttons - dramatic contrast */}
      {revealed && (
        <div
          className="p-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="flex gap-3">
            <button
              onClick={() => handleGrade(false)}
              disabled={grading}
              className="flex-1 min-h-14 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              style={{
                background: "var(--error-subtle)",
                color: "var(--error)",
              }}
            >
              Missed It
            </button>
            <button
              onClick={() => handleGrade(true)}
              disabled={grading}
              className="flex-1 min-h-14 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              style={{
                background: "var(--success-subtle)",
                color: "var(--success)",
              }}
            >
              Got It
            </button>
          </div>
          <div
            className="text-xs text-center mt-3"
            style={{ color: "var(--foreground-subtle)" }}
          >
            <span style={{ opacity: 0.7 }}>Keyboard:</span>{" "}
            <span
              className="px-1.5 py-0.5 rounded text-[10px]"
              style={{ background: "var(--background-elevated)" }}
            >
              &#8592;
            </span>{" "}
            missed{" "}
            <span className="mx-2" style={{ color: "var(--border-strong)" }}>
              |
            </span>{" "}
            <span
              className="px-1.5 py-0.5 rounded text-[10px]"
              style={{ background: "var(--background-elevated)" }}
            >
              &#8594;
            </span>{" "}
            got it
          </div>
        </div>
      )}
    </div>
  );
}
