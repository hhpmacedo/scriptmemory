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

// Regex for character lines: **Character Name**: Dialogue
const LINE_PATTERN = /^\*\*([^*]+)\*\*:\s*(.+)$/;

export function parseMarkdown(markdown: string): ParsedScript {
  const lines = markdown.split("\n");
  let title = "Untitled Script";
  const scenes: ParsedScene[] = [];
  let currentScene: ParsedScene | null = null;
  const characterSet = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

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
    const match = trimmed.match(LINE_PATTERN);
    if (match) {
      const [, character, dialogue] = match;
      const charName = character.trim();
      characterSet.add(charName);

      // Ensure we have a scene
      if (!currentScene) {
        currentScene = { name: "Scene 1", dialogues: [] };
      }

      currentScene.dialogues.push({
        character: charName,
        text: dialogue.trim(),
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
  myCharacter: string
): { script: Script; scenes: Scene[]; lines: Line[] } {
  const parsed = parseMarkdown(markdown);
  const now = new Date();

  const script: Script = {
    id: uuidv4(),
    title: parsed.title,
    rawMarkdown: markdown,
    myCharacter,
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
        };
        lines.push(line);
      }
    }
  }

  return { script, scenes, lines };
}
