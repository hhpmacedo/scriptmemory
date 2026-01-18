"use client";

import dynamic from "next/dynamic";

const ScriptInput = dynamic(() => import("@/components/ScriptInput"), {
  ssr: false,
});

export default function NewScriptPage() {
  return (
    <main className="h-dvh">
      <ScriptInput />
    </main>
  );
}
