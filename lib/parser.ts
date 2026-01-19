import { v4 as uuidv4 } from "uuid";
import type { Script, Scene, Line } from "./types";

interface DialogueLine {
  character: string;
  text: string;
}

interface ParsedScene {
  name: string;
  dialogues: DialogueLine[];
}

interface ParsedScript {
  title: string;
  scenes: ParsedScene[];
  characters: string[];
}

// Patterns for character lines (in order of preference):
// Character names are 1-3 words max, no lowercase-starting words
// 1. **Character Name**: Dialogue (markdown bold with colon)
// 2. **Character Name** - Dialogue (markdown bold with dash)
// 3. ALL CAPS NAME: dialogue (stage play format with colon)
// 4. ALL CAPS NAME - dialogue (stage play format with dash)
// 5. Title Case Name: Dialogue (plain colon)
// 6. Title Case Name - Dialogue (plain dash)
const LINE_PATTERNS = [
  /^\*\*([^*]+)\*\*:\s*(.+)$/,                          // **Name**: text
  /^\*\*([^*]+)\*\*\s*-\s*(.+)$/,                       // **Name** - text
  /^([A-Z][A-Z.']*(?:\s+[A-Z][A-Z.']*){0,2}):\s*(.+)$/,  // ALL CAPS: text (1-3 words)
  /^([A-Z][A-Z.']*(?:\s+[A-Z][A-Z.']*){0,2})\s+-\s+(.+)$/, // ALL CAPS - text (1-3 words)
  /^([A-Z][a-z.']*(?:\s+[A-Z][a-z.']*){0,2}):\s*(.+)$/,  // Title Case: text (1-3 words)
  /^([A-Z][a-z.']*(?:\s+[A-Z][a-z.']*){0,2})\s+-\s+(.+)$/, // Title Case - text (1-3 words)
];

// Patterns for scene notes to skip
const SCENE_NOTE_PATTERNS = [
  /^\*[^*]+\*$/,      // *italic text* (single asterisks, full line)
  /^_[^_]+_$/,        // _italic text_ (underscores, full line)
  /^\([^)]+\)$/,      // (parenthetical notes)
  /^\[[^\]]+\]$/,     // [bracketed notes]
];

function isSceneNote(line: string): boolean {
  return SCENE_NOTE_PATTERNS.some(pattern => pattern.test(line));
}

function parseCharacterLine(line: string): { character: string; text: string } | null {
  for (const pattern of LINE_PATTERNS) {
    const match = line.match(pattern);
    if (match) {
      const character = match[1].trim();
      const text = match[2].trim();

      // Validate: character name should be reasonable (not too long, not a sentence)
      if (character.length > 0 && character.length < 40 && !character.includes(',')) {
        return { character, text };
      }
    }
  }
  return null;
}

export function parseMarkdown(markdown: string): ParsedScript {
  const lines = markdown.split("\n");
  let title = "Untitled Script";
  const scenes: ParsedScene[] = [];
  let currentScene: ParsedScene | null = null;
  const characterSet = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Skip scene notes (italics or brackets)
    if (isSceneNote(trimmed)) {
      continue;
    }

    // Script title (first # header)
    if (trimmed.startsWith("# ") && title === "Untitled Script") {
      title = trimmed.slice(2).trim();
      continue;
    }

    // Scene header (## header)
    if (trimmed.startsWith("## ")) {
      if (currentScene) scenes.push(currentScene);
      currentScene = { name: trimmed.slice(3).trim(), dialogues: [] };
      continue;
    }

    // Character line
    const parsed = parseCharacterLine(trimmed);
    if (parsed) {
      characterSet.add(parsed.character);

      // Ensure we have a scene
      if (!currentScene) {
        currentScene = { name: "Scene 1", dialogues: [] };
      }

      currentScene.dialogues.push({
        character: parsed.character,
        text: parsed.text,
      });
    }
  }

  // Push final scene
  if (currentScene) scenes.push(currentScene);

  return {
    title,
    scenes,
    characters: Array.from(characterSet),
  };
}

export function createScriptWithLines(
  markdown: string,
  myCharacter: string,
  chunkSize: number = 5
): { script: Script; scenes: Scene[]; lines: Line[] } {
  const parsed = parseMarkdown(markdown);
  const now = new Date();

  const script: Script = {
    id: uuidv4(),
    title: parsed.title,
    rawMarkdown: markdown,
    myCharacter,
    chunkSize,
    createdAt: now,
    updatedAt: now,
  };

  const scenes: Scene[] = [];
  const lines: Line[] = [];
  let globalLineOrder = 0;

  for (let sceneIndex = 0; sceneIndex < parsed.scenes.length; sceneIndex++) {
    const parsedScene = parsed.scenes[sceneIndex];
    const scene: Scene = {
      id: uuidv4(),
      scriptId: script.id,
      name: parsedScene.name,
      order: sceneIndex,
    };
    scenes.push(scene);

    // Create cue-response pairs for the selected character
    const dialogues = parsedScene.dialogues;

    for (let i = 0; i < dialogues.length; i++) {
      const current = dialogues[i];

      // If this is the user's character, create a line
      if (current.character === myCharacter) {
        // Find the previous line as the cue (if exists)
        const previous = i > 0 ? dialogues[i - 1] : null;

        const line: Line = {
          id: uuidv4(),
          scriptId: script.id,
          sceneId: scene.id,
          cue: previous ? previous.text : "(Scene opens)",
          response: current.text,
          cueCharacter: previous ? previous.character : "",
          responseCharacter: current.character,
          order: globalLineOrder++,
          dueDate: now, // Due immediately
          interval: 0,
          repetition: 0,
          efactor: 2.5,
          consecutiveCorrect: 0,
        };
        lines.push(line);
      }
    }
  }

  return { script, scenes, lines };
}
