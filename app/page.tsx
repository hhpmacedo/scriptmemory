"use client";

import dynamic from "next/dynamic";

const AppRouter = dynamic(() => import("@/components/AppRouter"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-gray-500">
      Loading...
    </div>
  ),
});

export default function Home() {
  return (
    <main className="h-dvh">
      <AppRouter />
    </main>
  );
}
