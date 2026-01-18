"use client";

import { useState, useCallback } from "react";
import { useAllLines } from "@/lib/hooks/useReview";
import ReviewCard from "./ReviewCard";
import Link from "next/link";

interface ReviewSessionProps {
  onExit?: () => void;
}

export default function ReviewSession({ onExit }: ReviewSessionProps) {
  const allLines = useAllLines();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);

  const handleComplete = useCallback(() => {
    setReviewedCount((prev) => prev + 1);
    // Move to next line, wrapping back to start
    setCurrentIndex((prev) => (prev + 1) % allLines.length);
  }, [allLines.length]);

  // Loading state
  if (allLines.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // Sort lines by order for consistent cycling
  const sortedLines = [...allLines].sort((a, b) => a.order - b.order);
  const currentLine = sortedLines[currentIndex % sortedLines.length];

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
        <div className="text-sm text-gray-500">{reviewedCount} reviewed</div>
        <div className="w-8" /> {/* Spacer for centering */}
      </div>

      {/* Review card takes remaining space */}
      <div className="flex-1 flex flex-col">
        <ReviewCard
          line={currentLine}
          onComplete={handleComplete}
          progress={{
            current: (currentIndex % sortedLines.length) + 1,
            total: sortedLines.length,
          }}
        />
      </div>
    </div>
  );
}
