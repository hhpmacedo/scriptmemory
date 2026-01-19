import type { Line } from "./types";

const MASTERY_THRESHOLD = 3; // Correct in a row to master a line

export interface LearningState {
  phase: "chunk" | "consolidation" | "complete";
  currentChunkIndex: number;
  consolidationUpToChunk: number; // For consolidation: review chunks 0 to N
  linesToReview: Line[];
  totalChunks: number;
  // Progress info
  chunkProgress: { lineId: string; consecutiveCorrect: number }[];
}

/**
 * Split lines into chunks of specified size
 */
export function getChunks(lines: Line[], chunkSize: number): Line[][] {
  const sorted = [...lines].sort((a, b) => a.order - b.order);
  const chunks: Line[][] = [];

  for (let i = 0; i < sorted.length; i += chunkSize) {
    chunks.push(sorted.slice(i, i + chunkSize));
  }

  return chunks;
}

/**
 * Check if a single line is mastered (3 correct in a row)
 */
export function isLineMastered(line: Line): boolean {
  return line.consecutiveCorrect >= MASTERY_THRESHOLD;
}

/**
 * Check if all lines in a chunk are mastered
 */
export function isChunkMastered(chunk: Line[]): boolean {
  return chunk.every(isLineMastered);
}

/**
 * Get the current learning state based on line progress
 */
export function getLearningState(lines: Line[], chunkSize: number): LearningState {
  if (lines.length === 0) {
    return {
      phase: "complete",
      currentChunkIndex: 0,
      consolidationUpToChunk: 0,
      linesToReview: [],
      totalChunks: 0,
      chunkProgress: [],
    };
  }

  const chunks = getChunks(lines, chunkSize);
  const totalChunks = chunks.length;

  // Find the first incomplete chunk
  let firstIncompleteChunk = -1;
  for (let i = 0; i < chunks.length; i++) {
    if (!isChunkMastered(chunks[i])) {
      firstIncompleteChunk = i;
      break;
    }
  }

  // All chunks mastered
  if (firstIncompleteChunk === -1) {
    return {
      phase: "complete",
      currentChunkIndex: totalChunks - 1,
      consolidationUpToChunk: totalChunks - 1,
      linesToReview: [],
      totalChunks,
      chunkProgress: [],
    };
  }

  // Determine if we need consolidation
  // After completing chunk N (where N > 0), we do consolidation of chunks 0-N
  // We're in consolidation if:
  // - The first incomplete chunk is > 0
  // - AND the previous chunks that WERE mastered need consolidation review

  // Simple approach: if chunk N is incomplete and N > 0,
  // check if chunks 0 to N-1 are all mastered. If so, just work on chunk N.
  // Consolidation happens automatically when you fail a line (consecutiveCorrect resets).

  // For now, let's use a simpler model:
  // - Work on chunk N until all lines mastered
  // - After chunk N is mastered, if there's a next chunk, move to N+1
  // - Consolidation is baked in: if user fails a previously mastered line, they have to re-master it

  const currentChunk = chunks[firstIncompleteChunk];
  const chunkProgress = currentChunk.map((line) => ({
    lineId: line.id,
    consecutiveCorrect: line.consecutiveCorrect,
  }));

  return {
    phase: "chunk",
    currentChunkIndex: firstIncompleteChunk,
    consolidationUpToChunk: firstIncompleteChunk,
    linesToReview: currentChunk,
    totalChunks,
    chunkProgress,
  };
}

/**
 * Get lines that still need work in the current review set
 * (not yet mastered)
 */
export function getUnmasteredLines(lines: Line[]): Line[] {
  return lines.filter((line) => !isLineMastered(line));
}

/**
 * Get a summary of chunk progress
 */
export function getChunkSummary(
  chunkIndex: number,
  totalChunks: number,
  chunkSize: number,
  totalLines: number
): { label: string; lineRange: string } {
  const startLine = chunkIndex * chunkSize + 1;
  const endLine = Math.min((chunkIndex + 1) * chunkSize, totalLines);

  return {
    label: `Chunk ${chunkIndex + 1} of ${totalChunks}`,
    lineRange: `Lines ${startLine}-${endLine}`,
  };
}
