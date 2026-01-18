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
  }
}

export const db = new ScriptMemoryDB();
