import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { gradeLine, getDueLines, getNextDueLine } from "./scheduler";
import type { Line } from "./types";

// Helper to create a mock line
function createLine(overrides: Partial<Line> = {}): Line {
  return {
    id: "line-1",
    scriptId: "script-1",
    sceneId: "scene-1",
    order: 1,
    cue: "Test cue",
    cueCharacter: "Other",
    response: "Test response",
    responseCharacter: "Me",
    interval: 0,
    repetition: 0,
    efactor: 2.5,
    dueDate: new Date(),
    consecutiveCorrect: 0,
    createdAt: new Date(),
    ...overrides,
  };
}

describe("gradeLine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("increments consecutiveCorrect when correct", () => {
    const line = createLine({ consecutiveCorrect: 0 });
    const result = gradeLine(line, true);
    expect(result.consecutiveCorrect).toBe(1);
  });

  it("keeps incrementing consecutiveCorrect on repeated correct answers", () => {
    let line = createLine({ consecutiveCorrect: 0 });

    line = gradeLine(line, true);
    expect(line.consecutiveCorrect).toBe(1);

    line = gradeLine(line, true);
    expect(line.consecutiveCorrect).toBe(2);

    line = gradeLine(line, true);
    expect(line.consecutiveCorrect).toBe(3);

    // Should reach mastery at 3
    line = gradeLine(line, true);
    expect(line.consecutiveCorrect).toBe(4);
  });

  it("resets consecutiveCorrect to 0 when incorrect", () => {
    const line = createLine({ consecutiveCorrect: 2 });
    const result = gradeLine(line, false);
    expect(result.consecutiveCorrect).toBe(0);
  });

  it("resets consecutiveCorrect even from high values", () => {
    const line = createLine({ consecutiveCorrect: 5 });
    const result = gradeLine(line, false);
    expect(result.consecutiveCorrect).toBe(0);
  });

  it("updates SM-2 interval on correct answer", () => {
    const line = createLine({
      interval: 0,
      repetition: 0,
      efactor: 2.5,
    });
    const result = gradeLine(line, true);

    // First correct answer should set interval to 1 day
    expect(result.interval).toBeGreaterThan(0);
    expect(result.repetition).toBe(1);
  });

  it("sets dueDate based on interval", () => {
    const line = createLine({
      interval: 0,
      repetition: 0,
      efactor: 2.5,
    });
    const result = gradeLine(line, true);

    // Due date should be in the future
    const now = new Date("2024-01-15T12:00:00Z");
    expect(result.dueDate.getTime()).toBeGreaterThan(now.getTime());
  });

  it("preserves other line properties", () => {
    const line = createLine({
      id: "my-id",
      cue: "My cue",
      response: "My response",
    });
    const result = gradeLine(line, true);

    expect(result.id).toBe("my-id");
    expect(result.cue).toBe("My cue");
    expect(result.response).toBe("My response");
  });
});

describe("getDueLines", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns lines with dueDate in the past", () => {
    const lines = [
      createLine({ id: "1", order: 1, dueDate: new Date("2024-01-14T12:00:00Z") }),
      createLine({ id: "2", order: 2, dueDate: new Date("2024-01-16T12:00:00Z") }),
    ];

    const dueLines = getDueLines(lines);

    expect(dueLines.length).toBe(1);
    expect(dueLines[0].id).toBe("1");
  });

  it("includes lines with dueDate equal to now", () => {
    const lines = [
      createLine({ id: "1", order: 1, dueDate: new Date("2024-01-15T12:00:00Z") }),
    ];

    const dueLines = getDueLines(lines);

    expect(dueLines.length).toBe(1);
  });

  it("sorts by order", () => {
    const lines = [
      createLine({ id: "3", order: 3, dueDate: new Date("2024-01-14T12:00:00Z") }),
      createLine({ id: "1", order: 1, dueDate: new Date("2024-01-14T12:00:00Z") }),
      createLine({ id: "2", order: 2, dueDate: new Date("2024-01-14T12:00:00Z") }),
    ];

    const dueLines = getDueLines(lines);

    expect(dueLines[0].id).toBe("1");
    expect(dueLines[1].id).toBe("2");
    expect(dueLines[2].id).toBe("3");
  });
});

describe("getNextDueLine", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the first due line by order", () => {
    const lines = [
      createLine({ id: "3", order: 3, dueDate: new Date("2024-01-14T12:00:00Z") }),
      createLine({ id: "1", order: 1, dueDate: new Date("2024-01-14T12:00:00Z") }),
    ];

    const nextLine = getNextDueLine(lines);

    expect(nextLine?.id).toBe("1");
  });

  it("returns null when no lines are due", () => {
    const lines = [
      createLine({ id: "1", order: 1, dueDate: new Date("2024-01-16T12:00:00Z") }),
    ];

    const nextLine = getNextDueLine(lines);

    expect(nextLine).toBeNull();
  });
});
