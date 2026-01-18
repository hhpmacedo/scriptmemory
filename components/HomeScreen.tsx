"use client";

import Link from "next/link";

interface HomeScreenProps {
  lineCount: number;
  onStartReview: () => void;
}

export default function HomeScreen({
  lineCount,
  onStartReview,
}: HomeScreenProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-2xl font-semibold mb-2">Script Memory</h1>
      <p className="text-gray-600 mb-8">{lineCount} lines loaded</p>

      <button
        onClick={onStartReview}
        className="w-full max-w-xs min-h-14 bg-blue-600 text-white rounded-xl font-medium mb-4"
      >
        Start Practice
      </button>

      <Link
        href="/scripts/new"
        className="text-blue-600 text-sm font-medium"
      >
        Add another script
      </Link>
    </div>
  );
}
