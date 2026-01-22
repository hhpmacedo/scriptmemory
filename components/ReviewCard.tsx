"use client";

import { useState, useEffect, useCallback } from "react";
import type { Line } from "@/lib/types";
import { gradeLine } from "@/lib/scheduler";
import { db } from "@/lib/db";

interface ChunkProgress {
  consecutiveCorrect: number;
  current: boolean;
  lineId: string;
}

interface ReviewCardProps {
  line: Line;
  onComplete: () => void;
  chunkMastery: ChunkProgress[];
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
  const [lastGradeResult, setLastGradeResult] = useState<"correct" | "incorrect" | null>(null);

  // Reset when line changes
  useEffect(() => {
    setRevealed(false);
    setGrading(false);
    setLastGradeResult(null);
  }, [line.id]);

  const handleGrade = useCallback(
    async (correct: boolean) => {
      if (grading) return;
      setGrading(true);
      setLastGradeResult(correct ? "correct" : "incorrect");

      try {
        const updated = gradeLine(line, correct);
        await db.lines.update(line.id, {
          interval: updated.interval,
          repetition: updated.repetition,
          efactor: updated.efactor,
          dueDate: updated.dueDate,
          consecutiveCorrect: updated.consecutiveCorrect,
        });
        // Brief delay to show flash animation before transitioning
        setTimeout(() => {
          onComplete();
        }, 400);
      } catch (error) {
        console.error("Failed to grade:", error);
        setGrading(false);
        setLastGradeResult(null);
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
          {/* Chunk progress: dots showing per-line progress (0-3) */}
          <div className="flex gap-2">
            {chunkMastery.map((item) => {
              const isMastered = item.consecutiveCorrect >= 3;
              const fillPercent = isMastered ? 100 : (item.consecutiveCorrect / 3) * 100;
              const isFlashing = item.current && lastGradeResult;
              const flashClass = isFlashing
                ? lastGradeResult === "correct"
                  ? "animate-flash-correct"
                  : "animate-flash-incorrect"
                : "";

              return (
                <span
                  key={item.lineId}
                  className={`relative w-3 h-3 rounded-full transition-all duration-300 ${flashClass} ${
                    item.current ? "scale-125" : ""
                  }`}
                  style={{
                    background: isMastered
                      ? "var(--accent)"
                      : fillPercent > 0
                      ? `conic-gradient(var(--accent) ${fillPercent}%, var(--border-strong) ${fillPercent}%)`
                      : "var(--border-strong)",
                    boxShadow: item.current
                      ? "0 0 12px var(--accent)"
                      : "none",
                  }}
                >
                  {/* Checkmark for mastered lines */}
                  {isMastered && (
                    <svg
                      className="absolute inset-0 w-full h-full p-0.5"
                      viewBox="0 0 12 12"
                    >
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="var(--background)"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              );
            })}
          </div>

          <span
            className="w-px h-4"
            style={{ background: "var(--border-strong)" }}
          />

          {/* Streak progress: elegant bars with flash feedback */}
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => {
              const isFilled = i < streak;
              const flashClass = lastGradeResult
                ? lastGradeResult === "correct"
                  ? "animate-flash-correct"
                  : "animate-flash-incorrect"
                : "";

              return (
                <span
                  key={i}
                  className={`w-4 h-1.5 rounded-full transition-all duration-300 ${flashClass}`}
                  style={{
                    background: isFilled ? "var(--success)" : "var(--border-strong)",
                    boxShadow: isFilled ? "0 0 8px rgba(34, 197, 94, 0.5)" : "none",
                  }}
                />
              );
            })}
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
