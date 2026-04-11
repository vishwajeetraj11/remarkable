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
| `/games/*` | Procedural puzzle games (sudoku, crossword, maze, word-search, word-scramble, nonogram, cryptogram, kakuro, kenken, word-ladder, number-fill, logic-puzzle) |
| `/templates/*` | Printable page templates (lined, dot-grid, cornell, planner, monthly-calendar, habit-tracker, meal-planner, and 30+ more) |
| `/kids/*` | Kid-focused activities (coloring, math, connect-dots, tracing, sight-words, spelling, cursive, telling-time, patterns, vocabulary, money-counting) |
| `/guides/*` | SEO content pages (how-tos, workflow guides) |
| `/packs/*` | Bundled multi-template PDF packs; uses `[slug]` dynamic route |
| `/pricing` | Pricing page |

Each game/template/activity lives in its own `page.tsx` under the relevant route segment.

### Two PDF generation patterns

The codebase has **two distinct patterns** for PDF generation — know which one a page uses before editing:

1. **Games** (`/games/*`): Each page is a self-contained `'use client'` component that imports its generator from `src/lib/generators/`, builds the PDF inline with jsPDF, and triggers download. Page size options come from `src/lib/pdf-constants.ts` (`PAGE_SIZES`). Some games support language selection via `src/lib/languages/`.

2. **Templates** (`/templates/*`): Pages use the `TemplateShell` wrapper (`src/components/templates/template-shell.tsx`) which provides variant controls (device, orientation, handedness, week-start). PDF helpers live in `src/lib/templates/`:
   - `variants.ts` — `TemplateVariants` type, page dimensions per device, margin calculations (handedness-aware binding margin)
   - `pdf-utils.ts` — `createDoc()`, `addPage()`, `drawHeader()`, `drawPageNumber()` and other shared drawing utilities
   - `constants.ts` — device dimensions (reMarkable 2, Paper Pro, Supernote, BOOX, Kindle Scribe, A4, Letter), color palette, unit conversions

### Generators

Puzzle logic is in `src/lib/generators/`. Each file exports a pure generator function (no React) and its associated types. These are called client-side and fed into jspdf or rendered to canvas/SVG.

### Shared components

- `src/components/shared/header.tsx` and `footer.tsx` — rendered in the root layout
- `src/components/shared/email-capture.tsx` and `feedback-widget.tsx` — global overlays, also in root layout
- `src/components/games/bundle-generator.tsx` — multi-game PDF bundle builder (imports all generators)
- `src/lib/utils.ts` — exports `cn()` (clsx + tailwind-merge)
- `src/lib/download-tracker.ts` — localStorage-based download counting (triggers email capture)

### Key conventions

- Use `proxy.ts` instead of `middleware.ts` (Next.js 16 change)
- Server Components by default; add `'use client'` only where browser APIs or interactivity are required
- PDF export is always client-side (jspdf requires browser DOM)
- All coordinates in jsPDF are in **points** (pt); use `MM_TO_PT` from constants when converting from millimeters
- SEO metadata: each page exports its own `metadata` object; the root layout defines `metadataBase` and JSON-LD schema; `sitemap.ts` and `robots.ts` are at the app root
- Analytics: Microsoft Clarity is initialized via `src/components/shared/clarity.tsx`
