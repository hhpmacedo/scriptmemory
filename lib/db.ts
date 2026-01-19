import Dexie, { type Table } from "dexie";
import type { Script, Scene, Line } from "./types";

class ScriptMemoryDB extends Dexie {
  scripts!: Table<Script>;
  scenes!: Table<Scene>;
  lines!: Table<Line>;

  constructor() {
    super("scriptmemory");
    this.version(1).stores({
      scripts: "id, title, createdAt",
      scenes: "id, scriptId, order",
      lines: "id, scriptId, sceneId, dueDate, order",
    });

    // Version 2: Add chunkSize to scripts, consecutiveCorrect to lines
    this.version(2)
      .stores({
        scripts: "id, title, createdAt",
        scenes: "id, scriptId, order",
        lines: "id, scriptId, sceneId, dueDate, order",
      })
      .upgrade((tx) => {
        // Migrate existing scripts to have default chunkSize
        tx.table("scripts")
          .toCollection()
          .modify((script) => {
            if (script.chunkSize === undefined) {
              script.chunkSize = 5;
            }
          });
        // Migrate existing lines to have consecutiveCorrect
        tx.table("lines")
          .toCollection()
          .modify((line) => {
            if (line.consecutiveCorrect === undefined) {
              line.consecutiveCorrect = 0;
            }
          });
      });
  }
}

export const db = new ScriptMemoryDB();
