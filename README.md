# Script Memory

> **Experimental Project** - This is an experimental project by Hugo H. Macedo. Features may change or break.

A web app for memorizing theatrical scripts using spaced repetition. Paste your script, select your character, and practice your lines with intelligent scheduling that adapts to your performance.

## Features

- **Chunked Learning**: Learn in manageable chunks (default 5 lines). Master one chunk before moving to the next.
- **Spaced Repetition**: SM-2 algorithm schedules reviews at optimal intervals for long-term retention.
- **Flexible Script Format**: Supports markdown dialogue in multiple formats (`**Name**: text`, `ALL CAPS: text`, `Title Case: text`).
- **Offline-First**: All data stored locally in your browser using IndexedDB. No account required.
- **Keyboard Shortcuts**: Space/Enter to reveal, arrow keys to grade.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Add a script**: Paste your script in markdown format
2. **Select your character**: Choose which role you're memorizing
3. **Practice**: You'll see the cue (other character's line) and recall your response
4. **Grade yourself**: "Got it" or "Missed it" - the app adjusts scheduling accordingly
5. **Master chunks**: Get 3 correct in a row to master a line; master all lines in a chunk to advance

## Script Format

The parser recognizes dialogue in these formats:

```markdown
# Script Title

## Scene 1

**ROMEO**: But, soft! What light through yonder window breaks?
**JULIET**: O Romeo, Romeo! Wherefore art thou Romeo?
```

Scene notes in italics (`*stage direction*`) or brackets (`[action]`) are automatically skipped.

## Tech Stack

- Next.js 16 + React 19
- Dexie (IndexedDB wrapper)
- Tailwind CSS
- Vitest (unit tests) + Playwright (e2e tests)

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Unit tests
npm run test:e2e     # End-to-end tests
```
