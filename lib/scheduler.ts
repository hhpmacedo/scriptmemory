import { supermemo, SuperMemoGrade } from "supermemo";
import type { Line } from "./types";

/**
 * Grade a line after review.
 * @param line - The line being reviewed
 * @param correct - Whether the user got it correct
 * @returns Updated line with new SM-2 values and due date
 */
export function gradeLine(line: Line, correct: boolean): Line {
  // Map our binary correct/incorrect to SM-2 grades
  // Got it = grade 4 (correct after hesitation)
  // Missed it = grade 1 (incorrect but remembered)
  const grade: SuperMemoGrade = correct ? 4 : 1;

  const { interval, repetition, efactor } = supermemo(
    {
      interval: line.interval,
      repetition: line.repetition,
      efactor: line.efactor,
    },
    grade
  );

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  // Update consecutive correct streak for chunked learning
  const consecutiveCorrect = correct ? line.consecutiveCorrect + 1 : 0;

  return {
    ...line,
    interval,
    repetition,
    efactor,
    dueDate,
    consecutiveCorrect,
  };
}

/**
 * Get all lines due for review (dueDate <= now)
 */
export function getDueLines(lines: Line[]): Line[] {
  const now = new Date();
  return lines
    .filter((line) => line.dueDate <= now)
    .sort((a, b) => a.order - b.order);
}

/**
 * Get the next line due for review
 */
export function getNextDueLine(lines: Line[]): Line | null {
  const dueLines = getDueLines(lines);
  return dueLines[0] || null;
}

/**
 * Get time until next review (for display when no lines are due)
 */
export function getTimeUntilNextReview(lines: Line[]): string | null {
  if (lines.length === 0) return null;

  const now = new Date();
  const futureLines = lines.filter((line) => line.dueDate > now);
  if (futureLines.length === 0) return null;

  const nextDue = futureLines.reduce((earliest, line) =>
    line.dueDate < earliest.dueDate ? line : earliest
  );

  const diffMs = nextDue.dueDate.getTime() - now.getTime();
  const diffMins = Math.ceil(diffMs / (1000 * 60));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""}`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""}`;
  return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
}
