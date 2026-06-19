# Remarkable Skills — Autonomous Build Plan (loop worklist)

This file is the **single source of truth** for the `/loop` agent. Each iteration:
1. Read this file top-to-bottom.
2. Pick the **first** task whose checkbox is `[ ]` (skip `[x]` done and `[~]` in-progress).
3. Implement it (delegate the coding to an Opus 4.8 subagent — see LOOP.md).
4. Run `npm run lint` and `npm run build`; both must pass.
5. Mark the task `[x]`, append a one-line note under it (what shipped), then commit.
6. Stop the iteration (the loop schedules the next one).

Rules:
- **One task per iteration.** Keep diffs small and shippable.
- Never start a task that depends on an unchecked prerequisite.
- If a task is too big, split it: mark it `[x]` only when fully done, or break it into sub-bullets and do the first.
- Match existing code conventions (see CLAUDE.md / AGENTS.md). Next.js 16 — read `node_modules/next/dist/docs/` before using changed APIs.
- Do not touch `node_modules`, `.next`, lockfiles unless a task explicitly requires it.

---

## Phase 1 — Theme toggle (dark mode)  ← foundation, do first

The `.dark` token set and `@custom-variant dark` already exist in `globals.css`. Only wiring is missing.

- [x] **1.1 Theme provider** — Add a client `ThemeProvider` (prefer `next-themes`; if not desired, a small custom provider writing `.dark` on `<html>` + `localStorage`). Add `suppressHydrationWarning` to `<html>` in `layout.tsx`. No flash on load (inline script or next-themes default).
  - Shipped: custom ~90-line provider (no dependency) — blocking `<head>` init script (no FOUC), localStorage `theme` key, system-pref fallback, `useTheme()` hook exposed; no button yet. Debugger + reviewer both clean (no P0/P1). P2: init-script resolver duplicates `resolveInitialTheme` — keep in sync when 1.2 lands.
- [x] **1.2 Theme toggle button** — Add a sun/moon toggle (lucide-react) to `header.tsx`, placed before/after the nav, accessible (`aria-label`, keyboard). Works on mobile nav too.
  - Shipped: `theme-toggle.tsx` client island (Sun/Moon, `toggleTheme()`), desktop header (right side) + mobile menu; hydration-safe via `useSyncExternalStore` `useHydrated()` (neutral placeholder pre-mount), 48px target, action-reflecting `aria-label`. Debugger (runtime OK) + reviewer (approve) clean. P2s (deferred): move `useHydrated` into provider for DRY; collapse redundant placeholder/light icon branch; cosmetic header re-indent.
- [x] **1.3 Dark-mode audit** — Sweep pages for hardcoded `bg-white` / light-only colors (e.g. `template-shell.tsx` uses `bg-white` for preview) and replace with tokens so dark mode looks correct everywhere. PDF output stays light (that's correct — e-ink is white paper).
  - Shipped: chrome (`not-found`, slider thumb, variant toggle knob) → theme tokens; new `.paper-preview` utility in `globals.css` remaps surface tokens to fixed-light on all 13 kids + maze + 52 template previews so paper text stays dark-on-white in both themes (kills white-on-white class of bugs centrally); game-grid SVGs use fixed `border-neutral-900`. Orchestrator folded in reviewer P2: extended remap to `--muted`/`--card`/`--popover`/`--secondary`/`--accent` (+foregrounds) for completeness. Debugger (cascade verified) + reviewer (approve) clean. Deferred P2: redundant `bg-white` on 2 nested previews; add a CLAUDE.md note to use `.paper-preview` for new template pages; word-ladder pre-existing `fill="white"` (out of scope).

## Phase 2 — SEO foundation

- [x] **2.1 Single route manifest** — Create `src/lib/site-map.ts` exporting every route (games, templates, kids, guides, packs) as typed data. Refactor `sitemap.ts` to derive from it so it can never drift from disk again. Audit: ensure all ~60 template folders, all kids sub-routes, and all packs are included (current `sitemap.ts` is missing several template folders).
  - Shipped: typed `site-map.ts` (`sections` + helpers `allRoutes`/`templateRoutes`/`PACK_SLUGS`/etc.); `sitemap.ts` now derives from it (104 URLs, was missing `/templates/mcp-docs`). Debugger (xmllint-clean, 1:1 disk match, no regressions) + reviewer (approve) clean. Orchestrator fixed reviewer P2 (incorrect "client component" comment). **Deferred follow-ups for later tasks:** (a) add optional `label?` to `Route` for 2.3 breadcrumbs / 2.6 internal-linking; (b) make `PACK_SLUGS` the single source by importing into `packs/[slug]/layout.tsx` generateStaticParams; (c) optional drift-guard test walking `src/app/**/page.tsx` vs `allRoutes`.
- [x] **2.2 Per-page metadata audit** — Verify **every** `page.tsx` exports a `metadata` object with unique title, description, and `alternates.canonical`. Fill in any missing ones. List offenders in the commit note.
  - VERIFIED NO-OP: audit of all 93 routes (89 static metadata + 4 dynamic `generateMetadata`) found metadata already SEO-complete — unique titles, non-dup descriptions, `alternates.canonical` on every page incl. all 4 dynamic routes. Orchestrator independently re-checked (0/93 missing canonical). No code change needed; no debugger/reviewer run (zero diff).
- [ ] **2.3 Breadcrumb structured data** — Add a reusable `BreadcrumbJsonLd` component and render it on all detail pages (games/templates/kids/guides) with `BreadcrumbList` schema. Add a visible breadcrumb UI too. (Add an optional `label?` field to `Route` in `site-map.ts` here — deferred from 2.1 — since breadcrumbs/linking need human-readable titles.)
- [ ] **2.4 FAQ structured data** — Add `FAQPage` JSON-LD to the home page and each index page (games, templates, kids), plus a visible FAQ section with real, useful Q&As (how to transfer, is it free, what devices, etc.).
- [ ] **2.5 Per-page OG images** — Ensure each top-level section has a dynamic `opengraph-image.tsx`; add per-detail OG images for the highest-traffic pages (sudoku, planner, monthly-calendar, habit-tracker).
- [ ] **2.6 Internal linking** — Add a "Related" links block to detail pages (e.g. each template links to 3–4 sibling templates; each game to related games). Improves crawl depth + dwell.
- [ ] **2.7 Metadata polish** — Add `keywords` per page where relevant, ensure `robots.ts` is complete, add `application-name` / theme-color meta, verify JSON-LD validates.

## Phase 3 — Template flexibility (shared options for ALL templates)

Extend `TemplateShell` + `variants.ts` so every template gains these without per-page work.

- [ ] **3.1 Accent / ink intensity** — Add a control for line/ink weight or a subtle accent so users can make lines lighter/darker for their e-ink contrast preference. Thread through `pdf-utils.ts`.
- [ ] **3.2 Custom title text** — Optional text input so users can set their own page title/label printed on the PDF.
- [ ] **3.3 Line spacing / density** — A control for ruling spacing (narrow/medium/wide) and grid density where applicable.
- [ ] **3.4 Hyperlinked PDFs** — Use jsPDF link annotations to add tappable navigation (e.g. a footer "← index" / page jumps) for multi-page exports. This is a top community request for e-ink planners.
- [ ] **3.5 Dated headers** — Optional start-date so planners/calendars print real dates/weekdays instead of blanks (huge for 2026 demand).

## Phase 4 — New templates (research-driven)

One template per task. Reuse `TemplateShell`, add to nav/home/sitemap/route-manifest. Each needs: page, thumb, metadata, sitemap entry.

- [ ] **4.1 Dated yearly calendar 2026** — `/templates/calendar-2026` (and a 2027 variant) using the new dated-header support.
- [ ] **4.2 Debt snowball / payoff tracker** — `/templates/debt-tracker`.
- [ ] **4.3 Sinking funds tracker** — `/templates/sinking-funds`.
- [ ] **4.4 Net worth tracker** — `/templates/net-worth`.
- [ ] **4.5 Weekly dated planner** — `/templates/weekly-dated` (vertical + horizontal variants).
- [ ] **4.6 Project planner with index** — `/templates/project-planner` (uses hyperlinked PDF nav).
- [ ] **4.7 Bullet journal collection pack** — index + monthly log + future log + trackers, bundled.
- [ ] **4.8 Workout log / gym tracker** — sets/reps/weight grid `/templates/workout-log`.

## Phase 5 — New puzzles & kids content

- [ ] **5.1 Research pass** — Quick web check for missing popular puzzle types (e.g. Hashi/Bridges, Slitherlink, Hitori, Futoshiki, Calcudoku variants, Sudoku variants) and kids worksheets (handwriting sentences, number bonds, skip counting). Write findings as sub-tasks below this one.
- [ ] **5.2** (to be filled by 5.1)

## Phase 6 — Content / guides (SEO long-tail)

- [ ] **6.1 New guide pages** — Add 3–4 long-form guides targeting search intent (e.g. "best reMarkable planner setup", "free dated 2026 calendar for e-ink", "bullet journaling on reMarkable"). Wire into `/guides`, nav, sitemap.
- [ ] **6.2 Pack expansion** — Add new bundled packs (e.g. "2026 planner pack", "finance pack", "student pack") via the `[slug]` pack route + `pack-bundler`.

---

## Done log
(loop appends `- [x] <task id> — <what shipped> — <commit sha>` here)
- [x] 1.1 — theme provider (custom, no-FOUC inline script + useTheme hook), debugger+reviewer clean — dc50fc2
- [x] 1.2 — theme toggle button (desktop + mobile, hydration-safe), debugger+reviewer clean  — 213da38
- [x] 1.3 — dark-mode audit: .paper-preview token-remap utility + chrome fixes, debugger+reviewer clean — **PHASE 1 COMPLETE** — a5bb366
- [x] 2.1 — single route manifest (site-map.ts) → sitemap derives from it, 104 URLs, debugger+reviewer clean  — 51dce8b
- [x] 2.2 — per-page metadata audit: VERIFIED NO-OP (all 93 routes already complete: unique title/desc + canonical)
