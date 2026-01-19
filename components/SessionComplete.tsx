"use client";

import Link from "next/link";

export default function SessionComplete() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-center">
      <div className="text-4xl mb-4">&#10003;</div>
      <h1 className="text-xl font-semibold mb-2">Chunk complete!</h1>
      <p className="text-gray-600 mb-6">
        You&apos;ve mastered all the lines in this session.
      </p>
      <Link
        href="/"
        className="text-blue-600 hover:text-blue-700 font-medium"
      >
        Back to home
      </Link>
    </div>
  );
}
