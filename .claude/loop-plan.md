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
- [x] **2.3 Breadcrumb structured data** — Add a reusable `BreadcrumbJsonLd` component and render it on all detail pages (games/templates/kids/guides) with `BreadcrumbList` schema. Add a visible breadcrumb UI too. (Add an optional `label?` field to `Route` in `site-map.ts` here — deferred from 2.1 — since breadcrumbs/linking need human-readable titles.)
  - Shipped: SSR `Breadcrumbs` component (visible `<nav aria-label>` + `BreadcrumbList` JSON-LD, absolute URLs, `aria-current`, decorative separators), mounted once per section layout (games/templates/kids/guides + **packs**), returns null on index paths. Added `label?` + `labelForPath`/`LABEL_OVERRIDES` to `site-map.ts`. Debugger (SSR JSON-LD, deep trails, zero on index, clean hydration) clean. Reviewer P1: packs section layout was unwired → **orchestrator fixed** (`packs/layout.tsx` now mounts Breadcrumbs; verified pack detail=1/index=0). Deferred P2 → folded into 2.7: extract shared `siteUrl()` helper (base literal now duplicated in 4 files: layout/sitemap/robots/breadcrumbs).
- [x] **2.4 FAQ structured data** — Add `FAQPage` JSON-LD to the home page and each index page (games, templates, kids), plus a visible FAQ section with real, useful Q&As (how to transfer, is it free, what devices, etc.).
  - Shipped: `Faq` server component (native `<details>/<summary>`, no-JS; `FAQPage` JSON-LD built from the SAME items array so it can't drift from visible text) on home + games/templates/kids (5 Q&As each, fact-checked vs codebase). Debugger (1 FAQPage/page, char-for-char match, coexists w/ home schema) clean. Reviewer P1: templates FAQ said "8 packs" but page renders 8 themed packs + all-in-one → **orchestrator fixed** the copy. Deferred P2: cross-page Q&A duplication (free/account/devices repeated) could be trimmed for rich-result eligibility; FAQ skips the `Reveal` animation siblings use (intentional, no-JS).
- [x] **2.5 Per-page OG images** — Ensure each top-level section has a dynamic `opengraph-image.tsx`; add per-detail OG images for the highest-traffic pages (sudoku, planner, monthly-calendar, habit-tracker).
  - Shipped: shared `section-og.tsx` helper (`renderSectionOgImage`, token-matched to existing cards) + new OG/twitter images for guides, packs, and the 4 high-traffic detail pages; existing 8 files untouched (zero diff). Debugger (all routes valid PNG/image-png, per-page og:image meta, no edge errors, no regression) + reviewer (approve) clean. Deferred P2: extend to remaining detail pages via a dynamic `<section>/[slug]/opengraph-image.tsx` using the helper (currently they fall back to section image — acceptable).
- [x] **2.6 Internal linking** — Add a "Related" links block to detail pages (e.g. each template links to 3–4 sibling templates; each game to related games). Improves crawl depth + dwell.
  - Shipped: `RelatedLinks` component (deterministic cyclic selection of 4 same-section 2-segment siblings from `site-map.ts`, section-aware headings, SSR-stable), mounted after `{children}` in games/templates/kids layouts; excludes self/index/dynamic/guides/packs. Debugger (8/8 checks: SSR-present, stable, correct exclusions, no double-render) + reviewer (approve; distinct nav landmarks confirmed) clean. Deferred P2: topical relatedness instead of cyclic (content upgrade only).
- [x] **2.7 Metadata polish** — Add `keywords` per page where relevant, ensure `robots.ts` is complete, add `application-name` / theme-color meta, verify JSON-LD validates. (Also: extract a shared `siteUrl()` helper in `src/lib/` and replace the `NEXT_PUBLIC_SITE_URL ?? "https://remarkable.vishwajeet.co"` literal duplicated across `layout.tsx`/`sitemap.ts`/`robots.ts`/`breadcrumbs.tsx` — deferred from 2.3.)
  - Shipped: `src/lib/site-url.ts` (`SITE_URL`) replacing the base-URL literal in 4 files (URLs byte-identical); `viewport` export with light/dark `themeColor` (#ffffff/#0a0a0a, correct Next 16 placement), `applicationName` + manifest link; keywords on 8 targeted pages (indexes + top detail); all 4 JSON-LD blocks validated. robots.ts already complete (AI crawler allowlist). Debugger (no viewport warnings, sitemap/robots unchanged, dual theme-color, manifest 200) + reviewer (approve) clean. Deferred P2: unify SITE_URL import aliasing; align manifest `theme_color` #171717 (left as-is — distinct PWA-chrome semantic, intentional). **PHASE 2 (SEO) COMPLETE.**

## Phase 3 — Template flexibility (shared options for ALL templates)

Extend `TemplateShell` + `variants.ts` so every template gains these without per-page work.

- [x] **3.1 Accent / ink intensity** — Add a control for line/ink weight or a subtle accent so users can make lines lighter/darker for their e-ink contrast preference. Thread through `pdf-utils.ts`.
  - Shipped: `InkIntensity` (light/regular/bold) in `TemplateVariants`; `INK_INTENSITY` map (greyShift/widthScale) in `constants.ts`; threaded via module-level resolver (`setInkIntensity` in createDoc/addPage) so all ~52 templates gain it with ZERO page.tsx edits (~352 call sites untouched). "regular" = mathematical identity → default PDFs byte-identical; light/bold add `-light`/`-bold` filename suffix. "Ink" control in variant-controls. Debugger (identity proven, no resolver leakage, no page touched) + reviewer (approve; interleave + vanishing-line risks cleared) clean. Deferred P2: drop redundant `setInkIntensity` re-call in `drawHorizontalLines`.
- [x] **3.2 Custom title text** — Optional text input so users can set their own page title/label printed on the PDF.
  - PRODUCT DECISION (user: "ship partial, done right"): the shared `drawHeader` override only cleanly covers 31/53 templates (22 draw headers inline, 5 use multiple headers). Shipped: `customTitle?` in variants; `drawHeader` override applies the custom title to the **first header per PDF only** (module flag `customTitleConsumed` reset in `createDoc`) — fixes the 5 multi-header templates; `fitTextToWidth` ellipsis truncation; input gated by a shared `TEMPLATES_WITH_CUSTOM_TITLE` registry (`custom-title.ts`, 31 paths) so it only shows where it works (no no-op confusion); default output byte-identical; not in filename. Debugger (identity, first-header-only, no leak, gated input, 31==drawHeader-callers) + reviewer (approve) clean. Deferred P2: drift-guard test for the registry (repo has no test suite); the 22 inline-header templates remain unsupported by design.
- [x] **3.3 Line spacing / density** — A control for ruling spacing (narrow/medium/wide) and grid density where applicable.
- [x] **3.4 Hyperlinked PDFs** — Use jsPDF link annotations to add tappable navigation (e.g. a footer "← index" / page jumps) for multi-page exports. This is a top community request for e-ink planners.
  - Shipped: opt-in `tappableNav` (default off → byte-identical); `drawPageNumber` adds in-range "‹ Prev / Next ›" footer tap targets via `doc.link({pageNumber})` only when on + `total>1`; gated to 49 multi-page drawPageNumber templates (`TEMPLATES_WITH_PAGE_NAV` in `template-options.ts`); `-nav` suffix. Debugger (default-identity, link bounding, no setPage/correct-page, gating, 3.2/3.3 intact) + reviewer (approve; geometry clear of page number) clean. Orchestrator fixed reviewer P2 (registry comment "two"→accurate). Deferred P2: taller tap band; registry drift test.
- [x] **3.5 Dated headers** — Optional start-date so planners/calendars print real dates/weekdays instead of blanks (huge for 2026 demand).
  - Shipped (shared, header-only scope): `startDate?` + `formatStartDate` (local-parts, deterministic hardcoded format, validates/rejects bad dates, no UTC off-by-one); `drawHeader` prints the date in the subtitle (becomes subtitle, or appends ` · date` with overflow-fit) only when set → empty=identity; gated to the 31 header templates via registry rename `TEMPLATES_WITH_CUSTOM_TITLE`→`TEMPLATES_WITH_HEADER` (+ alias, 3.2 intact); `-dated` suffix. First debugger run no-opped → re-ran; debugger (identity, UTC check day=6, gating, alias) + reviewer (approve) clean. Date *grids/cells* intentionally deferred to Phase 4 (per-page). Deferred P2: date silently drops if title fills bar (graceful); double-format. **PHASE 3 (template flexibility) COMPLETE.**

## Phase 4 — New templates (research-driven)

One template per task. Reuse `TemplateShell`, add to nav/home/sitemap/route-manifest. Each needs: page, thumb, metadata, sitemap entry.

- [x] **4.1 Dated yearly calendar 2026** — `/templates/calendar-2026` (and a 2027 variant) using the new dated-header support.
  - Shipped: new `/templates/calendar-2026` — date-filled calendar (linked TOC + 12 month pages), year selector 2026/2027, real LOCAL date math (no UTC drift), weekStart-aware, hyperlinked TOC + back-links; full registration (manifest+label, thumb, Core Planner listing, nav, TEMPLATES_WITH_HEADER; correctly NOT in PAGE_NAV since showPageCount=false). Debugger (node-verified dates: Jan2026=Thu, Jan2027=Fri, both week-starts, Feb=28; in sitemap) + reviewer (approve) clean. Orchestrator checked reviewer's thumb-offset P2 → **false positive** (col-2 already correct; col-3 would break it) → left as-is. P2 (leave): "< TOC" glyph; Year label a11y (project-wide pattern).
- [x] **4.2 Debt snowball / payoff tracker** — `/templates/debt-tracker`.
  - Shipped: new `/templates/debt-tracker` — debt list table (Creditor/Balance/APR/Min/Due/Order + TOTAL row), snowball/avalanche method, payoff thermometer + milestones; multi-page; registered (manifest+label, thumb, Life Admin pack, HEADER + PAGE_NAV registries; not LINE_SPACING). Debugger (layout fits all devices node-verified, controls correct, in sitemap, no regressions) + reviewer (approve) clean. Orchestrator made PAGE_NAV comment count-agnostic (was "51 callers"). Deferred P2: local `drawCapture` could reuse `drawLabeledLine`; table strokes use raw colors (matches bill-tracker, ink-intensity won't apply there).
- [x] **4.3 Sinking funds tracker** — `/templates/sinking-funds`.
  - Shipped: new `/templates/sinking-funds` — funds table (Fund/Goal/Saved/Remaining/Monthly/Target + TOTAL) + 6 per-fund progress thermometers (distinct from debt-tracker); multi-page; registered (Life Admin pack, manifest+label, thumb, HEADER + PAGE_NAV; not LINE_SPACING). Debugger (layout fits node-verified, controls correct, sitemap, no regressions) + reviewer (approve, genuine adaptation) clean. P2 (leave): preset thermometer labels.
- [x] **4.4 Net worth tracker** — `/templates/net-worth`.
  - Shipped: new `/templates/net-worth` — balance-sheet layout (side-by-side Assets/Liabilities ledgers w/ subtotals + net-worth equation box + 12-month tracking grid); distinct from debt/sinking-funds; multi-page; registered (Life Admin pack, manifest+label, thumb, HEADER + PAGE_NAV; not LINE_SPACING). Debugger (fits portrait+landscape node-verified, controls, sitemap, no regressions) + reviewer (approve) clean. P2 (leave): fixed form layout (whitespace on larger devices). NOTE: Life Admin now has 6 finance trackers → reinforces the Phase 6.2 dedicated finance pack idea.
- [~] **4.5 Weekly dated planner** — `/templates/weekly-dated` (vertical + horizontal variants).
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
- [x] 2.3 — breadcrumbs (SSR BreadcrumbList JSON-LD + visible nav, all 5 sections incl. packs), label? added to site-map, debugger clean + reviewer P1 (packs) fixed  — 15cbc3b
- [x] 2.4 — FAQ (FAQPage JSON-LD + no-JS details on home/games/templates/kids), debugger clean + reviewer P1 (pack count) fixed  — 3011dcf
- [x] 2.5 — per-page OG images (guides/packs sections + 4 detail pages, shared helper), debugger + reviewer clean  — 8aa0537
- [x] 2.6 — internal "Related" links (cyclic site-map-driven, SSR-stable) on games/templates/kids details, debugger + reviewer clean  — 37cbc77
- [x] 2.7 — metadata polish (SITE_URL dedup, themeColor viewport, applicationName, keywords, JSON-LD validated), debugger + reviewer clean — **PHASE 2 COMPLETE** — fd9d7a6
- [x] 3.1 — ink intensity (light/regular/bold) shared across all templates via module resolver, regular=identity, debugger + reviewer clean  — d79acd6
- [x] 3.2 — custom title (first-header-only, gated to 31 supported templates via registry) — product decision "ship partial", debugger + reviewer clean
- [x] 3.3 — line spacing (narrow/regular/wide, regular=identity), gated to 24 ruled templates, debugger + reviewer clean — 85ed867
- [x] 3.4 — hyperlinked PDFs (opt-in tappable prev/next, default-identity), gated to 49 templates, debugger + reviewer clean — 0718f52
- [x] 3.5 — dated headers (optional start-date in header subtitle, empty=identity), gated to 31 header templates, debugger(re-run) + reviewer clean — **PHASE 3 COMPLETE** — 6e8c33d  — 9fbf049
