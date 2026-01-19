"use client";

import { useState } from "react";
import { parseMarkdown, createScriptWithLines } from "@/lib/parser";
import { db } from "@/lib/db";
import { useRouter } from "next/navigation";

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
        "No characters found. Make sure your script uses the format:\n**Character**: Dialogue"
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

  if (step === "paste") {
    return (
      <div className="flex flex-col h-full p-4 gap-4">
        <h1 className="text-xl font-semibold">Add Script</h1>
        <p className="text-gray-600 text-sm">
          Paste your script using this format:
        </p>
        <pre className="text-xs bg-gray-100 p-3 rounded text-gray-700">
          {`# Script Title

## Scene Name

**Character A**: First line
**Character B**: Response line`}
        </pre>
        <textarea
          className="flex-1 border rounded-lg p-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste your script here..."
          value={markdown}
          onChange={(e) => setMarkdown(e.target.value)}
          autoFocus
        />
        <button
          onClick={handleParse}
          disabled={!markdown.trim()}
          className="min-h-12 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    );
  }

  if (step === "select") {
    return (
      <div className="flex flex-col h-full p-4 gap-4">
        <button
          onClick={() => setStep("paste")}
          className="text-blue-600 text-left text-sm"
        >
          &larr; Back
        </button>
        <h1 className="text-xl font-semibold">Select Your Character</h1>
        <p className="text-gray-600 text-sm">
          Which character&apos;s lines do you want to memorize?
        </p>
        <div className="flex flex-col gap-2">
          {characters.map((char) => (
            <button
              key={char}
              onClick={() => setSelectedCharacter(char)}
              className={`min-h-12 px-4 rounded-lg border text-left font-medium transition-colors ${
                selectedCharacter === char
                  ? "border-blue-600 bg-blue-50 text-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {char}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={handleSelectCharacter}
          disabled={!selectedCharacter}
          className="min-h-12 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    );
  }

  // Step 3: Chunk size selection
  return (
    <div className="flex flex-col h-full p-4 gap-4">
      <button
        onClick={() => setStep("select")}
        className="text-blue-600 text-left text-sm"
      >
        &larr; Back
      </button>
      <h1 className="text-xl font-semibold">Set Learning Pace</h1>
      <p className="text-gray-600 text-sm">
        You have <strong>{lineCount} lines</strong> to memorize as{" "}
        <strong>{selectedCharacter}</strong>.
      </p>
      <p className="text-gray-600 text-sm">
        How many lines do you want to learn at a time?
      </p>
      <div className="flex flex-col gap-2">
        {[3, 5, 7, 10].map((size) => (
          <button
            key={size}
            onClick={() => setChunkSize(size)}
            className={`min-h-12 px-4 rounded-lg border text-left font-medium transition-colors ${
              chunkSize === size
                ? "border-blue-600 bg-blue-50 text-blue-600"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {size} lines at a time
            {size === 5 && (
              <span className="text-gray-500 font-normal ml-2">(recommended)</span>
            )}
          </button>
        ))}
      </div>
      <p className="text-gray-500 text-xs">
        You&apos;ll master each chunk (3 correct in a row per line) before moving on.
      </p>
      <div className="flex-1" />
      <button
        onClick={handleSave}
        disabled={saving}
        className="min-h-12 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : "Start Learning"}
      </button>
    </div>
  );
}
