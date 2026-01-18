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
  const [step, setStep] = useState<"paste" | "select">("paste");
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

  const handleSave = async () => {
    if (!selectedCharacter) return;
    setSaving(true);

    try {
      const { script, scenes, lines } = createScriptWithLines(
        markdown,
        selectedCharacter
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
        onClick={handleSave}
        disabled={!selectedCharacter || saving}
        className="min-h-12 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : "Save Script"}
      </button>
    </div>
  );
}
