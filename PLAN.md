# Chunked Learning Feature - Implementation Plan

## Goal
Replace "all lines at once" review with progressive chunk-based learning where users master small groups of lines before moving forward.

## Learning Flow

```
Chunk 1 (lines 1-5) → Master all (3 correct each) →
Chunk 2 (lines 6-10) → Master all →
Consolidation (1-10) → Master all →
Chunk 3 (lines 11-15) → Master all →
Consolidation (1-15) → ...continue
```

---

## Implementation Steps

### Step 1: Update Data Types (lib/types.ts)

Add to `Line`:
```typescript
consecutiveCorrect: number;  // 0-3, resets on wrong answer
```

Add to `Script`:
```typescript
chunkSize: number;  // default 5, set at import
```

### Step 2: Update Database Schema (lib/db.ts)

- Add default values for new fields
- Migration: existing lines get `consecutiveCorrect: 0`
- Migration: existing scripts get `chunkSize: 5`

### Step 3: Update Script Import Flow

**ScriptInput.tsx:**
- Add chunk size input (number field, default 5)
- Pass chunkSize when saving script

**lib/parser.ts / db save:**
- Store chunkSize on script record
- Initialize `consecutiveCorrect: 0` on all new lines

### Step 4: New Chunk Logic (lib/chunkedLearning.ts)

New module with functions:

```typescript
// Get chunk boundaries for a script
getChunks(lines: Line[], chunkSize: number): Line[][]

// Get current learning state
getLearningState(lines: Line[], chunkSize: number): {
  currentChunkIndex: number;
  isConsolidation: boolean;
  consolidationUpToChunk: number;
  linesToReview: Line[];
}

// Check if a chunk is mastered (all lines have consecutiveCorrect >= 3)
isChunkMastered(chunk: Line[]): boolean

// Check if consolidation round is complete
isConsolidationComplete(lines: Line[], upToChunk: number): boolean
```

**State machine logic:**
1. Start with chunk 0
2. If chunk N not mastered → review chunk N lines
3. If chunk N mastered and consolidation needed → review lines 0 to N
4. If consolidation complete → move to chunk N+1
5. If all chunks + final consolidation done → session complete

### Step 5: Update Scheduler (lib/scheduler.ts)

Modify `gradeLine()`:
```typescript
gradeLine(line: Line, correct: boolean) {
  if (correct) {
    line.consecutiveCorrect++;
  } else {
    line.consecutiveCorrect = 0;  // Reset streak
  }
  // Keep existing SM-2 logic for long-term scheduling
}
```

### Step 6: Update ReviewSession Component

**components/ReviewSession.tsx:**
- Import chunked learning logic
- Track current chunk state (not just currentIndex)
- Show only lines from current chunk/consolidation
- Update progress display

**New state:**
```typescript
const [learningState, setLearningState] = useState<LearningState>();
```

**Flow:**
1. On mount: calculate initial learning state
2. Show lines from `learningState.linesToReview`
3. On grade: update consecutiveCorrect, recalculate state
4. If chunk mastered: show "Chunk complete!" then move to consolidation/next
5. If all done: show SessionComplete

### Step 7: Update UI Components

**Progress indicator changes:**
- Current: "Line 3 of 27"
- New: "Chunk 2 (Lines 6-10) • Line 3 • 2/3 correct"

**Add chunk transition screen:**
- "Chunk 1 complete! ✓"
- "Starting consolidation: Lines 1-10"
- Brief pause then continue

**ReviewCard.tsx:**
- Add streak indicator (dots: ●●○ for 2/3)

---

## Files to Modify

1. `lib/types.ts` - Add new fields
2. `lib/db.ts` - Schema update
3. `lib/chunkedLearning.ts` - NEW FILE: chunk logic
4. `lib/scheduler.ts` - Update gradeLine
5. `components/ScriptInput.tsx` - Chunk size input
6. `components/ReviewSession.tsx` - Chunk-based flow
7. `components/ReviewCard.tsx` - Streak indicator

---

## Edge Cases

- Script with < chunkSize lines → single chunk, no consolidation
- Odd number of lines → last chunk is smaller
- User quits mid-chunk → consecutiveCorrect persists, resume where left off
- All lines mastered → show SessionComplete with next SM-2 review time
