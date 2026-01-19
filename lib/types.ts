export interface Script {
  id: string;
  title: string;
  rawMarkdown: string;
  myCharacter: string; // Character the user is memorizing
  chunkSize: number; // Number of lines per learning chunk (default 5)
  createdAt: Date;
  updatedAt: Date;
}

export interface Scene {
  id: string;
  scriptId: string;
  name: string;
  order: number;
}

export interface Line {
  id: string;
  scriptId: string;
  sceneId: string;
  cue: string; // Other character's line (the prompt)
  response: string; // User's character's line (the answer)
  cueCharacter: string;
  responseCharacter: string;
  order: number;
  dueDate: Date;
  // SM-2 fields
  interval: number; // Days until next review
  repetition: number; // Successful recall count
  efactor: number; // Easiness factor
  // Chunked learning fields
  consecutiveCorrect: number; // 0-3, resets on wrong answer
}
