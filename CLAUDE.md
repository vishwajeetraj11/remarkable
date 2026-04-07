# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # run eslint
```

No test suite is configured yet.

## Stack

- **Next.js 16** (App Router) with **React 19**
- **Tailwind CSS v4** — config is in `postcss.config.mjs`; no `tailwind.config.*` file
- **shadcn/ui** components (sourced from `@base-ui/react` + `class-variance-authority`) in `src/components/ui/`
- **jspdf** for client-side PDF export
- **lucide-react** for icons

## Architecture

### Routing

All routes use the App Router under `src/app/`:

| Route | Purpose |
|---|---|
| `/games/*` | Procedural puzzle games (sudoku, crossword, maze, word-search, word-scramble, nonogram) |
| `/templates/*` | Printable page templates (lined, dot-grid, cornell, planner) |
| `/kids/*` | Kid-focused activities (coloring, math, connect-dots, tracing) |

Each game/template/activity lives in its own `page.tsx` under the relevant route segment.

### Generators

Puzzle logic is in `src/lib/generators/`. Each file exports a pure generator function (no React). These are called client-side and fed into jspdf or rendered to canvas/SVG.

### Shared components

- `src/components/shared/header.tsx` and `footer.tsx` — rendered in the root layout
- `src/lib/utils.ts` — exports `cn()` (clsx + tailwind-merge)

### Key conventions

- Use `proxy.ts` instead of `middleware.ts` (Next.js 16 change)
- Server Components by default; add `'use client'` only where browser APIs or interactivity are required
- PDF export is always client-side (jspdf requires browser DOM)
