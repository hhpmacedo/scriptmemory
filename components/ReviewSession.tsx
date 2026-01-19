"use client";

import { useState, useCallback, useMemo } from "react";
import { useAllLines, useFirstScript } from "@/lib/hooks/useReview";
import { getLearningState, getChunkSummary, isLineMastered } from "@/lib/chunkedLearning";
import ReviewCard from "./ReviewCard";
import Link from "next/link";
import SessionComplete from "./SessionComplete";

interface ReviewSessionProps {
  onExit?: () => void;
}

export default function ReviewSession({ onExit }: ReviewSessionProps) {
  const allLines = useAllLines();
  const script = useFirstScript();
  const [currentIndex, setCurrentIndex] = useState(0);

  const chunkSize = script?.chunkSize ?? 5;

  // Calculate learning state based on current line progress
  const learningState = useMemo(
    () => getLearningState(allLines, chunkSize),
    [allLines, chunkSize]
  );

  // Get chunk summary for display
  const chunkSummary = useMemo(() => {
    if (learningState.phase === "complete") return null;
    return getChunkSummary(
      learningState.currentChunkIndex,
      learningState.totalChunks,
      chunkSize,
      allLines.length
    );
  }, [learningState, chunkSize, allLines.length]);

  const handleComplete = useCallback(() => {
    // Move to next line in the chunk, wrapping within the chunk
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      if (nextIndex >= learningState.linesToReview.length) {
        return 0; // Wrap back to start of chunk
      }
      return nextIndex;
    });
  }, [learningState.linesToReview.length]);

  // Loading state
  if (allLines.length === 0 || !script) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // All chunks mastered - session complete
  if (learningState.phase === "complete") {
    return <SessionComplete />;
  }

  // Ensure currentIndex is valid for current chunk
  const safeIndex = currentIndex % learningState.linesToReview.length;
  const currentLine = learningState.linesToReview[safeIndex];

  // Calculate mastered count in current chunk
  const masteredInChunk = learningState.linesToReview.filter(isLineMastered).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header with exit button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        {onExit ? (
          <button
            onClick={onExit}
            className="text-blue-600 text-sm font-medium"
          >
            Exit
          </button>
        ) : (
          <Link href="/" className="text-blue-600 text-sm font-medium">
            Exit
          </Link>
        )}
        {chunkSummary && (
          <div className="text-sm text-gray-500">
            {chunkSummary.label}
          </div>
        )}
        <div className="text-sm text-gray-500">
          {masteredInChunk}/{learningState.linesToReview.length} mastered
        </div>
      </div>

      {/* Review card takes remaining space */}
      <div className="flex-1 flex flex-col">
        <ReviewCard
          line={currentLine}
          onComplete={handleComplete}
          progress={{
            current: safeIndex + 1,
            total: learningState.linesToReview.length,
          }}
          streak={currentLine.consecutiveCorrect}
        />
      </div>
    </div>
  );
}
