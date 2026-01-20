"use client";

import { useState, useEffect, useCallback } from "react";
import type { Line } from "@/lib/types";
import { gradeLine } from "@/lib/scheduler";
import { db } from "@/lib/db";

interface ReviewCardProps {
  line: Line;
  onComplete: () => void;
  chunkMastery: { mastered: boolean; current: boolean }[];
  streak?: number; // consecutive correct count (0-3)
}

export default function ReviewCard({
  line,
  onComplete,
  chunkMastery,
  streak = 0,
}: ReviewCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [grading, setGrading] = useState(false);

  // Reset state when line changes
  useEffect(() => {
    setRevealed(false);
    setGrading(false);
  }, [line.id]);

  const handleGrade = useCallback(
    async (correct: boolean) => {
      if (grading) return;
      setGrading(true);

      try {
        const updatedLine = gradeLine(line, correct);
        await db.lines.update(line.id, {
          interval: updatedLine.interval,
          repetition: updatedLine.repetition,
          efactor: updatedLine.efactor,
          dueDate: updatedLine.dueDate,
          consecutiveCorrect: updatedLine.consecutiveCorrect,
        });
        onComplete();
      } catch (error) {
        console.error("Failed to grade line:", error);
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
        if (!revealed) {
          setRevealed(true);
        }
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
      {/* Progress indicator */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-center gap-3">
          {/* Chunk progress - blue dots */}
          <span className="flex gap-1">
            {chunkMastery.map((item, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  item.mastered
                    ? "bg-blue-500"
                    : item.current
                    ? "bg-blue-200 ring-2 ring-blue-400"
                    : "bg-gray-200"
                }`}
              />
            ))}
          </span>
          <span className="text-gray-300">|</span>
          {/* Streak progress - green dots */}
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < streak ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            ))}
          </span>
        </div>
      </div>

      {/* Card content */}
      <div className="flex-1 flex flex-col p-4 pt-0 overflow-auto">
        {/* Cue section */}
        <div className="mb-6">
          {line.cueCharacter && (
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
              {line.cueCharacter}
            </div>
          )}
          <div className="text-lg">{line.cue}</div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4" />

        {/* Response section */}
        {revealed ? (
          <div className="mb-6">
            <div className="text-sm font-medium text-blue-600 uppercase tracking-wide mb-1">
              {line.responseCharacter}
            </div>
            <div className="text-lg font-medium">{line.response}</div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setRevealed(true)}
              className="w-full max-w-xs min-h-14 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors"
            >
              Show Answer
            </button>
          </div>
        )}
      </div>

      {/* Grade buttons */}
      {revealed && (
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={() => handleGrade(false)}
              disabled={grading}
              className="flex-1 min-h-14 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Missed it
            </button>
            <button
              onClick={() => handleGrade(true)}
              disabled={grading}
              className="flex-1 min-h-14 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              Got it
            </button>
          </div>
          <div className="text-xs text-gray-400 text-center mt-2">
            Keyboard: &larr; missed &middot; &rarr; got it
          </div>
        </div>
      )}
    </div>
  );
}
