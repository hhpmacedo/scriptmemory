"use client";

import { useState, useMemo, useCallback } from "react";
import { useAllLines, useFirstScript } from "@/lib/hooks/useReview";
import { getChunks, isLineMastered, isChunkMastered } from "@/lib/chunkedLearning";
import ReviewCard from "./ReviewCard";
import Link from "next/link";
import SessionComplete from "./SessionComplete";

interface ReviewSessionProps {
  onExit?: () => void;
}

export default function ReviewSession({ onExit }: ReviewSessionProps) {
  const allLines = useAllLines();
  const script = useFirstScript();
  const chunkSize = script?.chunkSize ?? 5;
  const [cycleIndex, setCycleIndex] = useState(0);

  // Get current chunk and its unmastered lines
  const { currentChunk, unmasteredLines, chunkIndex, totalChunks, isComplete } = useMemo(() => {
    if (allLines.length === 0) {
      return { currentChunk: [], unmasteredLines: [], chunkIndex: 0, totalChunks: 0, isComplete: true };
    }

    const chunks = getChunks(allLines, chunkSize);
    const incompleteChunkIndex = chunks.findIndex(chunk => !isChunkMastered(chunk));

    if (incompleteChunkIndex === -1) {
      return { currentChunk: [], unmasteredLines: [], chunkIndex: chunks.length - 1, totalChunks: chunks.length, isComplete: true };
    }

    const chunk = chunks[incompleteChunkIndex];
    const unmastered = chunk.filter(line => !isLineMastered(line));

    return {
      currentChunk: chunk,
      unmasteredLines: unmastered,
      chunkIndex: incompleteChunkIndex,
      totalChunks: chunks.length,
      isComplete: false,
    };
  }, [allLines, chunkSize]);

  // Current line cycles through unmastered lines
  const currentLine = unmasteredLines.length > 0
    ? unmasteredLines[cycleIndex % unmasteredLines.length]
    : null;

  // Move to next unmastered line
  const handleComplete = useCallback(() => {
    setCycleIndex(prev => prev + 1);
  }, []);

  // Loading state
  if (allLines.length === 0 || !script) {
    return (
      <div
        className="h-full flex items-center justify-center"
        style={{ color: "var(--foreground-subtle)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-6 h-6 rounded-full border-2 animate-spin"
            style={{
              borderColor: "var(--border-strong)",
              borderTopColor: "var(--accent)",
            }}
          />
          <span>Loading your script...</span>
        </div>
      </div>
    );
  }

  // All chunks mastered
  if (isComplete || !currentLine) {
    return <SessionComplete />;
  }

  // Build progress arrays for display - include consecutiveCorrect for gradual fill
  const chunkMastery = currentChunk.map((line) => ({
    consecutiveCorrect: line.consecutiveCorrect,
    current: line.id === currentLine.id,
    lineId: line.id,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Header - theatrical styling */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        {onExit ? (
          <button
            onClick={onExit}
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--accent)" }}
          >
            Exit
          </button>
        ) : (
          <Link
            href="/"
            className="text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "var(--accent)" }}
          >
            Exit
          </Link>
        )}

        {/* Chunk indicator with theatrical styling */}
        <div
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{
            background: "var(--background-elevated)",
            color: "var(--foreground-muted)",
          }}
        >
          <span style={{ color: "var(--accent)" }}>{chunkIndex + 1}</span>
          <span style={{ color: "var(--foreground-subtle)" }}> / {totalChunks}</span>
        </div>

        {/* Empty spacer for balance */}
        <div className="w-10" />
      </div>

      {/* Review card */}
      <div className="flex-1 flex flex-col">
        <ReviewCard
          key={`${currentLine.id}-${cycleIndex}`}
          line={currentLine}
          onComplete={handleComplete}
          chunkMastery={chunkMastery}
          streak={currentLine.consecutiveCorrect}
        />
      </div>
    </div>
  );
}
