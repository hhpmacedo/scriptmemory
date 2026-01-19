"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";
import type { Line, Script } from "../types";

/**
 * Get all lines due for review (dueDate <= now)
 */
export function useDueLines(scriptId?: string): Line[] {
  return (
    useLiveQuery(async () => {
      const now = new Date();
      let lines = await db.lines.where("dueDate").belowOrEqual(now).toArray();

      if (scriptId) {
        lines = lines.filter((l) => l.scriptId === scriptId);
      }

      return lines.sort((a, b) => a.order - b.order);
    }, [scriptId]) ?? []
  );
}

/**
 * Get count of lines due for review
 */
export function useDueCount(scriptId?: string): number {
  return (
    useLiveQuery(async () => {
      const now = new Date();
      let lines = await db.lines.where("dueDate").belowOrEqual(now).toArray();

      if (scriptId) {
        lines = lines.filter((l) => l.scriptId === scriptId);
      }

      return lines.length;
    }, [scriptId]) ?? 0
  );
}

/**
 * Get all scripts
 */
export function useScripts(): Script[] {
  return useLiveQuery(() => db.scripts.toArray()) ?? [];
}

/**
 * Get a single script by ID
 */
export function useScript(scriptId: string): Script | undefined {
  return useLiveQuery(() => db.scripts.get(scriptId), [scriptId]);
}

/**
 * Get the first (most recent) script - for single-script use case
 */
export function useFirstScript(): Script | undefined {
  return useLiveQuery(async () => {
    const scripts = await db.scripts.orderBy("createdAt").reverse().toArray();
    return scripts[0];
  });
}

/**
 * Check if any scripts exist
 * Returns undefined while loading, true/false once loaded
 */
export function useHasScripts(): boolean | undefined {
  const count = useLiveQuery(() => db.scripts.count());
  if (count === undefined) return undefined;
  return count > 0;
}

/**
 * Get all lines for a script (for progress tracking)
 */
export function useAllLines(scriptId?: string): Line[] {
  return (
    useLiveQuery(async () => {
      if (scriptId) {
        return db.lines.where("scriptId").equals(scriptId).toArray();
      }
      return db.lines.toArray();
    }, [scriptId]) ?? []
  );
}

/**
 * Get time until next review when no lines are due
 */
export function useNextReviewTime(scriptId?: string): string | null {
  return (
    useLiveQuery(async () => {
      const now = new Date();
      let lines: Line[];

      if (scriptId) {
        lines = await db.lines.where("scriptId").equals(scriptId).toArray();
      } else {
        lines = await db.lines.toArray();
      }

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
    }, [scriptId]) ?? null
  );
}
