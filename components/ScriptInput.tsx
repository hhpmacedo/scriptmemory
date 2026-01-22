"use client";

import { useState } from "react";
import { parseMarkdown, createScriptWithLines } from "@/lib/parser";
import { db } from "@/lib/db";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ScriptInput() {
  const router = useRouter();
  const [markdown, setMarkdown] = useState("");
  const [characters, setCharacters] = useState<string[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null
  );
  const [chunkSize, setChunkSize] = useState(5);
  const [lineCount, setLineCount] = useState(0);
  const [step, setStep] = useState<"paste" | "select" | "chunk">("paste");
  const [saving, setSaving] = useState(false);

  const handleParse = () => {
    if (!markdown.trim()) return;
    const parsed = parseMarkdown(markdown);
    if (parsed.characters.length === 0) {
      alert(
        "No characters found.\n\nSupported formats:\n\u2022 **Character**: text\n\u2022 CHARACTER: text\n\u2022 Character: text"
      );
      return;
    }
    setCharacters(parsed.characters);
    setStep("select");
  };

  const handleSelectCharacter = () => {
    if (!selectedCharacter) return;
    // Count how many lines will be created for this character
    const parsed = parseMarkdown(markdown);
    let count = 0;
    for (const scene of parsed.scenes) {
      for (const dialogue of scene.dialogues) {
        if (dialogue.character === selectedCharacter) {
          count++;
        }
      }
    }
    setLineCount(count);
    setStep("chunk");
  };

  const handleSave = async () => {
    if (!selectedCharacter) return;
    setSaving(true);

    try {
      const { script, scenes, lines } = createScriptWithLines(
        markdown,
        selectedCharacter,
        chunkSize
      );

      await db.transaction("rw", db.scripts, db.scenes, db.lines, async () => {
        // Clear existing data before adding new script
        await db.lines.clear();
        await db.scenes.clear();
        await db.scripts.clear();
        // Add new script
        await db.scripts.add(script);
        await db.scenes.bulkAdd(scenes);
        await db.lines.bulkAdd(lines);
      });

      router.push("/");
    } catch (error) {
      console.error("Failed to save script:", error);
      alert("Failed to save script. Please try again.");
      setSaving(false);
    }
  };

  // Step indicator component
  const StepIndicator = ({ currentStep }: { currentStep: number }) => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
              s === currentStep ? "scale-110" : ""
            }`}
            style={{
              background:
                s < currentStep
                  ? "var(--accent)"
                  : s === currentStep
                  ? "var(--accent)"
                  : "var(--background-elevated)",
              color:
                s <= currentStep ? "#0c0a09" : "var(--foreground-subtle)",
              boxShadow:
                s === currentStep ? "0 0 16px rgba(245, 158, 11, 0.4)" : "none",
            }}
          >
            {s < currentStep ? "\u2713" : s}
          </span>
          {s < 3 && (
            <span
              className="w-8 h-0.5 rounded-full"
              style={{
                background:
                  s < currentStep ? "var(--accent)" : "var(--border-strong)",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );

  if (step === "paste") {
    return (
      <div className="flex flex-col h-full p-5 gap-4">
        <Link
          href="/"
          className="text-sm font-medium self-start mb-2"
          style={{ color: "var(--accent)" }}
        >
          &larr; Back
        </Link>

        <StepIndicator currentStep={1} />

        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Add Your Script
        </h1>

        <p style={{ color: "var(--foreground-muted)" }} className="text-sm">
          Paste your script below. We&apos;ll detect the characters
          automatically.
        </p>

        {/* Format examples in a collapsible */}
        <details className="text-sm">
          <summary
            className="cursor-pointer font-medium"
            style={{ color: "var(--accent)" }}
          >
            View supported formats
          </summary>
          <div
            className="mt-3 p-4 rounded-lg text-xs space-y-2"
            style={{
              background: "var(--background-elevated)",
              color: "var(--foreground-muted)",
            }}
          >
            <div>
              <code>**Character A**: First line</code>
            </div>
            <div>
              <code>CHARACTER A: First line</code>
            </div>
            <div>
              <code>Character A: First line</code>
            </div>
            <div
              className="pt-2 mt-2"
              style={{
                borderTop: "1px solid var(--border)",
                color: "var(--foreground-subtle)",
              }}
            >
              Stage directions in *italics*, (parentheses), or [brackets] are
              skipped.
            </div>
          </div>
        </details>

        <textarea
          className="flex-1 rounded-xl p-4 text-base resize-none transition-all duration-200"
          style={{
            background: "var(--background-elevated)",
            border: "1px solid var(--border)",
            color: "var(--foreground)",
          }}
          placeholder="Paste your script here..."
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          autoFocus
        />

        <button
          onClick={handleParse}
          disabled={!markdown.trim()}
          className="min-h-14 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: markdown.trim()
              ? "linear-gradient(135deg, var(--accent) 0%, var(--accent-muted) 100%)"
              : "var(--background-elevated)",
            color: markdown.trim() ? "#0c0a09" : "var(--foreground-subtle)",
            boxShadow: markdown.trim()
              ? "0 4px 20px rgba(245, 158, 11, 0.25)"
              : "none",
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  if (step === "select") {
    return (
      <div className="flex flex-col h-full p-5 gap-4">
        <button
          onClick={() => setStep("paste")}
          className="text-sm font-medium self-start mb-2"
          style={{ color: "var(--accent)" }}
        >
          &larr; Back
        </button>

        <StepIndicator currentStep={2} />

        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Choose Your Role
        </h1>

        <p style={{ color: "var(--foreground-muted)" }} className="text-sm">
          Which character&apos;s lines do you want to memorize?
        </p>

        <div className="flex flex-col gap-2 mt-2">
          {characters.map((char, index) => (
            <button
              key={char}
              onClick={() => setSelectedCharacter(char)}
              className={`min-h-14 px-5 rounded-xl text-left font-medium transition-all duration-200 animate-fade-in-up opacity-0`}
              style={{
                background:
                  selectedCharacter === char
                    ? "var(--accent-subtle)"
                    : "var(--background-elevated)",
                border: `1px solid ${
                  selectedCharacter === char
                    ? "var(--accent)"
                    : "var(--border)"
                }`,
                color:
                  selectedCharacter === char
                    ? "var(--accent)"
                    : "var(--foreground)",
                animationDelay: `${index * 0.05}s`,
                animationFillMode: "forwards",
              }}
            >
              {char}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <button
          onClick={handleSelectCharacter}
          disabled={!selectedCharacter}
          className="min-h-14 rounded-xl font-semibold transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{
            background: selectedCharacter
              ? "linear-gradient(135deg, var(--accent) 0%, var(--accent-muted) 100%)"
              : "var(--background-elevated)",
            color: selectedCharacter ? "#0c0a09" : "var(--foreground-subtle)",
            boxShadow: selectedCharacter
              ? "0 4px 20px rgba(245, 158, 11, 0.25)"
              : "none",
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  // Step 3: Chunk size selection
  return (
    <div className="flex flex-col h-full p-5 gap-4">
      <button
        onClick={() => setStep("select")}
        className="text-sm font-medium self-start mb-2"
        style={{ color: "var(--accent)" }}
      >
        &larr; Back
      </button>

      <StepIndicator currentStep={3} />

      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Set Your Pace
      </h1>

      <p style={{ color: "var(--foreground-muted)" }} className="text-sm">
        You have{" "}
        <strong style={{ color: "var(--foreground)" }}>{lineCount} lines</strong>{" "}
        to memorize as{" "}
        <strong style={{ color: "var(--accent)" }}>{selectedCharacter}</strong>.
      </p>

      <p style={{ color: "var(--foreground-muted)" }} className="text-sm">
        How many lines do you want to learn at a time?
      </p>

      <div className="flex flex-col gap-2 mt-2">
        {[3, 5, 7, 10].map((size, index) => (
          <button
            key={size}
            onClick={() => setChunkSize(size)}
            className="min-h-14 px-5 rounded-xl text-left font-medium transition-all duration-200 animate-fade-in-up opacity-0 flex items-center justify-between"
            style={{
              background:
                chunkSize === size
                  ? "var(--accent-subtle)"
                  : "var(--background-elevated)",
              border: `1px solid ${
                chunkSize === size ? "var(--accent)" : "var(--border)"
              }`,
              color:
                chunkSize === size ? "var(--accent)" : "var(--foreground)",
              animationDelay: `${index * 0.05}s`,
              animationFillMode: "forwards",
            }}
          >
            <span>{size} lines at a time</span>
            {size === 5 && (
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background:
                    chunkSize === size
                      ? "var(--accent)"
                      : "var(--background-card)",
                  color:
                    chunkSize === size
                      ? "#0c0a09"
                      : "var(--foreground-subtle)",
                }}
              >
                Recommended
              </span>
            )}
          </button>
        ))}
      </div>

      <p className="text-xs" style={{ color: "var(--foreground-subtle)" }}>
        You&apos;ll master each chunk (3 correct in a row per line) before
        moving on.
      </p>

      <div className="flex-1" />

      <button
        onClick={handleSave}
        disabled={saving}
        className="group relative min-h-14 rounded-xl font-semibold overflow-hidden transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background:
            "linear-gradient(135deg, var(--accent) 0%, var(--accent-muted) 100%)",
          color: "#0c0a09",
          boxShadow: "0 4px 20px rgba(245, 158, 11, 0.25)",
        }}
      >
        <span className="relative z-10">
          {saving ? "Preparing your script..." : "Start Learning"}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
      </button>
    </div>
  );
}
