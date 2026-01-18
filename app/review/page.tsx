"use client";

import dynamic from "next/dynamic";

const ReviewSession = dynamic(() => import("@/components/ReviewSession"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-gray-500">
      Loading...
    </div>
  ),
});

export default function ReviewPage() {
  return (
    <main className="h-dvh">
      <ReviewSession />
    </main>
  );
}
