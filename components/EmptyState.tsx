"use client";

import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="text-4xl mb-4">&#127917;</div>
      <h1 className="text-xl font-semibold mb-2">Script Memory</h1>
      <p className="text-gray-600 mb-6">
        Memorize your lines using spaced repetition
      </p>

      <div className="text-left text-sm text-gray-500 mb-8 space-y-2">
        <div>&#8226; Paste your script in common formats</div>
        <div>&#8226; Select your character to practice</div>
        <div>&#8226; Master 5 lines at a time</div>
      </div>

      <Link
        href="/scripts/new"
        className="min-h-12 px-6 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center"
      >
        Add Script
      </Link>
    </div>
  );
}
