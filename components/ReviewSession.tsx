"use client";

import { useMemo } from "react";
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

  // Derive everything from data - no manual index state needed
  const { currentChunk, currentLine, chunkIndex, totalChunks, isComplete } = useMemo(() => {
    if (allLines.length === 0) {
      return { currentChunk: [], currentLine: null, chunkIndex: 0, totalChunks: 0, isComplete: true };
    }

    const chunks = getChunks(allLines, chunkSize);

    // Find first incomplete chunk
    let incompleteChunkIndex = chunks.findIndex(chunk => !isChunkMastered(chunk));

    // All chunks mastered
    if (incompleteChunkIndex === -1) {
      return { currentChunk: [], currentLine: null, chunkIndex: chunks.length - 1, totalChunks: chunks.length, isComplete: true };
    }

    const chunk = chunks[incompleteChunkIndex];

    // Find first unmastered line in chunk (round-robin through unmastered)
    const unmasteredLines = chunk.filter(line => !isLineMastered(line));
    const lineToReview = unmasteredLines[0] || chunk[0];

    return {
      currentChunk: chunk,
      currentLine: lineToReview,
      chunkIndex: incompleteChunkIndex,
      totalChunks: chunks.length,
      isComplete: false,
    };
  }, [allLines, chunkSize]);

  // Loading state
  if (allLines.length === 0 || !script) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // All chunks mastered
  if (isComplete || !currentLine) {
    return <SessionComplete />;
  }

  // Build progress arrays for display
  const chunkMastery = currentChunk.map((line) => ({
    mastered: isLineMastered(line),
    current: line.id === currentLine.id,
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        {onExit ? (
          <button onClick={onExit} className="text-blue-600 text-sm font-medium">
            Exit
          </button>
        ) : (
          <Link href="/" className="text-blue-600 text-sm font-medium">
            Exit
          </Link>
        )}
        <div className="text-sm text-gray-500">
          Chunk {chunkIndex + 1} of {totalChunks}
        </div>
        <div className="w-10" />
      </div>

      {/* Review card */}
      <div className="flex-1 flex flex-col">
        <ReviewCard
          key={currentLine.id}
          line={currentLine}
          onComplete={() => {}} // No-op: data change will trigger re-render
          chunkMastery={chunkMastery}
          streak={currentLine.consecutiveCorrect}
        />
      </div>
    </div>
  );
}
