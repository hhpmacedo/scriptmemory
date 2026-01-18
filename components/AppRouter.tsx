"use client";

import { useState } from "react";
import { useHasScripts, useAllLines } from "@/lib/hooks/useReview";
import EmptyState from "./EmptyState";
import ReviewSession from "./ReviewSession";
import HomeScreen from "./HomeScreen";

export default function AppRouter() {
  const hasScripts = useHasScripts();
  const allLines = useAllLines();
  const [isReviewing, setIsReviewing] = useState(false);

  // Loading state - database not ready yet
  if (hasScripts === undefined) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  // No scripts loaded - show empty state
  if (!hasScripts) {
    return <EmptyState />;
  }

  // Show home screen or review session based on state
  if (!isReviewing) {
    return (
      <HomeScreen
        lineCount={allLines.length}
        onStartReview={() => setIsReviewing(true)}
      />
    );
  }

  return <ReviewSession onExit={() => setIsReviewing(false)} />;
}
