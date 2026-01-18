"use client";

import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="text-4xl mb-4">&#128221;</div>
      <h1 className="text-xl font-semibold mb-2">No scripts yet</h1>
      <p className="text-gray-600 mb-6">
        Add a script to start memorizing your lines.
      </p>
      <Link
        href="/scripts/new"
        className="min-h-12 px-6 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center"
      >
        Add Script
      </Link>
    </div>
  );
}
