# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Experimental Project** - This is an experimental project by Hugo H. Macedo.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Run unit tests (vitest)
npm run test:watch   # Unit tests in watch mode
npm run test:e2e     # Playwright e2e tests (starts dev server automatically)
npm run test:e2e:ui  # Playwright with UI
```

## Architecture

ScriptMemory is a Next.js app for memorizing theatrical scripts using spaced repetition. It runs entirely client-side with IndexedDB storage (Dexie).

### Data Model ([lib/types.ts](lib/types.ts))

- **Script**: Contains raw markdown, selected character, chunk size
- **Scene**: Groups lines within a script
- **Line**: A cue-response pair with SM-2 scheduling fields (`interval`, `repetition`, `efactor`, `dueDate`) and chunked learning tracking (`consecutiveCorrect`)

### Core Learning Systems

**Chunked Learning** ([lib/chunkedLearning.ts](lib/chunkedLearning.ts)): Lines are divided into chunks (default 5 lines). User masters one chunk before moving to the next. A line is "mastered" after 3 consecutive correct answers (`MASTERY_THRESHOLD`). Chunk mastery = all lines in chunk mastered.

**SM-2 Scheduling** ([lib/scheduler.ts](lib/scheduler.ts)): Uses `supermemo` library. `gradeLine()` maps binary correct/incorrect to SM-2 grades (4 for correct, 1 for incorrect) and computes new scheduling parameters.

**Script Parsing** ([lib/parser.ts](lib/parser.ts)): Parses markdown with character dialogue patterns (supports `**Name**: text`, `ALL CAPS: text`, `Title Case: text`). Creates cue-response pairs where cue = previous character's line, response = user's character line.

### Client-Side State

All database access uses Dexie with reactive queries via `dexie-react-hooks`. Key hooks in [lib/hooks/useReview.ts](lib/hooks/useReview.ts):
- `useAllLines(scriptId)` - all lines sorted by order
- `useDueLines(scriptId)` - lines where dueDate <= now
- `useFirstScript()` - single-script mode (app currently supports one script)

### Review Flow

[components/ReviewSession.tsx](components/ReviewSession.tsx) drives the review:
1. Gets first incomplete chunk (via `isChunkMastered`)
2. Cycles through unmastered lines in round-robin
3. [ReviewCard.tsx](components/ReviewCard.tsx) handles reveal/grade interaction
4. Grading updates DB, triggers `useLiveQuery` re-render
5. When chunk complete, moves to next; when all complete, shows SessionComplete

### App Structure

- [app/page.tsx](app/page.tsx) loads `AppRouter` with SSR disabled (IndexedDB is browser-only)
- All components are client components (`"use client"`)
- Styling uses Tailwind with CSS custom properties for theming (`--accent`, `--foreground-*`, etc.)
