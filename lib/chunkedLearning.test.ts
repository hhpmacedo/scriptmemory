import { describe, it, expect } from "vitest";
import {
  getChunks,
  isLineMastered,
  isChunkMastered,
  getLearningState,
  getUnmasteredLines,
} from "./chunkedLearning";
import type { Line } from "./types";

// Helper to create a mock line
function createLine(
  id: string,
  order: number,
  consecutiveCorrect: number = 0
): Line {
  return {
    id,
    scriptId: "script-1",
    sceneId: "scene-1",
    order,
    cue: `Cue ${order}`,
    cueCharacter: "Other",
    response: `Response ${order}`,
    responseCharacter: "Me",
    interval: 0,
    repetition: 0,
    efactor: 2.5,
    dueDate: new Date(),
    consecutiveCorrect,
    createdAt: new Date(),
  };
}

describe("getChunks", () => {
  it("splits lines into chunks of specified size", () => {
    const lines = [
      createLine("1", 1),
      createLine("2", 2),
      createLine("3", 3),
      createLine("4", 4),
      createLine("5", 5),
      createLine("6", 6),
      createLine("7", 7),
    ];

    const chunks = getChunks(lines, 3);

    expect(chunks.length).toBe(3);
    expect(chunks[0].length).toBe(3);
    expect(chunks[1].length).toBe(3);
    expect(chunks[2].length).toBe(1);
  });

  it("sorts lines by order before chunking", () => {
    const lines = [
      createLine("3", 3),
      createLine("1", 1),
      createLine("2", 2),
    ];

    const chunks = getChunks(lines, 5);

    expect(chunks[0][0].order).toBe(1);
    expect(chunks[0][1].order).toBe(2);
    expect(chunks[0][2].order).toBe(3);
  });

  it("handles empty array", () => {
    const chunks = getChunks([], 5);
    expect(chunks.length).toBe(0);
  });
});

describe("isLineMastered", () => {
  it("returns true when consecutiveCorrect >= 3", () => {
    expect(isLineMastered(createLine("1", 1, 3))).toBe(true);
    expect(isLineMastered(createLine("1", 1, 4))).toBe(true);
    expect(isLineMastered(createLine("1", 1, 10))).toBe(true);
  });

  it("returns false when consecutiveCorrect < 3", () => {
    expect(isLineMastered(createLine("1", 1, 0))).toBe(false);
    expect(isLineMastered(createLine("1", 1, 1))).toBe(false);
    expect(isLineMastered(createLine("1", 1, 2))).toBe(false);
  });
});

describe("isChunkMastered", () => {
  it("returns true when all lines are mastered", () => {
    const chunk = [
      createLine("1", 1, 3),
      createLine("2", 2, 3),
      createLine("3", 3, 5),
    ];

    expect(isChunkMastered(chunk)).toBe(true);
  });

  it("returns false when any line is not mastered", () => {
    const chunk = [
      createLine("1", 1, 3),
      createLine("2", 2, 2), // Not mastered
      createLine("3", 3, 3),
    ];

    expect(isChunkMastered(chunk)).toBe(false);
  });

  it("returns true for empty chunk", () => {
    expect(isChunkMastered([])).toBe(true);
  });
});

describe("getLearningState", () => {
  it("returns complete phase for empty lines", () => {
    const state = getLearningState([], 5);

    expect(state.phase).toBe("complete");
    expect(state.linesToReview.length).toBe(0);
  });

  it("returns first chunk when starting fresh", () => {
    const lines = [
      createLine("1", 1, 0),
      createLine("2", 2, 0),
      createLine("3", 3, 0),
      createLine("4", 4, 0),
      createLine("5", 5, 0),
      createLine("6", 6, 0),
      createLine("7", 7, 0),
    ];

    const state = getLearningState(lines, 3);

    expect(state.phase).toBe("chunk");
    expect(state.currentChunkIndex).toBe(0);
    expect(state.linesToReview.length).toBe(3);
    expect(state.linesToReview[0].order).toBe(1);
    expect(state.linesToReview[1].order).toBe(2);
    expect(state.linesToReview[2].order).toBe(3);
  });

  it("advances to next chunk when first is mastered", () => {
    const lines = [
      createLine("1", 1, 3), // Mastered
      createLine("2", 2, 3), // Mastered
      createLine("3", 3, 3), // Mastered
      createLine("4", 4, 0), // Not mastered
      createLine("5", 5, 0), // Not mastered
    ];

    const state = getLearningState(lines, 3);

    expect(state.phase).toBe("chunk");
    expect(state.currentChunkIndex).toBe(1);
    expect(state.linesToReview.length).toBe(2);
    expect(state.linesToReview[0].order).toBe(4);
    expect(state.linesToReview[1].order).toBe(5);
  });

  it("returns complete when all lines mastered", () => {
    const lines = [
      createLine("1", 1, 3),
      createLine("2", 2, 3),
      createLine("3", 3, 3),
    ];

    const state = getLearningState(lines, 3);

    expect(state.phase).toBe("complete");
    expect(state.linesToReview.length).toBe(0);
  });

  it("stays on current chunk if partially mastered", () => {
    const lines = [
      createLine("1", 1, 3), // Mastered
      createLine("2", 2, 2), // Almost there
      createLine("3", 3, 0), // Not started
    ];

    const state = getLearningState(lines, 3);

    expect(state.phase).toBe("chunk");
    expect(state.currentChunkIndex).toBe(0);
    expect(state.linesToReview.length).toBe(3);
  });

  it("includes chunkProgress for current chunk", () => {
    const lines = [
      createLine("1", 1, 2),
      createLine("2", 2, 1),
      createLine("3", 3, 0),
    ];

    const state = getLearningState(lines, 5);

    expect(state.chunkProgress.length).toBe(3);
    expect(state.chunkProgress[0].consecutiveCorrect).toBe(2);
    expect(state.chunkProgress[1].consecutiveCorrect).toBe(1);
    expect(state.chunkProgress[2].consecutiveCorrect).toBe(0);
  });
});

describe("getUnmasteredLines", () => {
  it("filters out mastered lines", () => {
    const lines = [
      createLine("1", 1, 3), // Mastered
      createLine("2", 2, 2), // Not mastered
      createLine("3", 3, 3), // Mastered
      createLine("4", 4, 0), // Not mastered
    ];

    const unmastered = getUnmasteredLines(lines);

    expect(unmastered.length).toBe(2);
    expect(unmastered[0].id).toBe("2");
    expect(unmastered[1].id).toBe("4");
  });

  it("returns empty array when all mastered", () => {
    const lines = [
      createLine("1", 1, 3),
      createLine("2", 2, 5),
    ];

    expect(getUnmasteredLines(lines).length).toBe(0);
  });
});
