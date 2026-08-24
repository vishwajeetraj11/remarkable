# Puzzle Rollout Plan (8 tranches)

Source: strategy session 2026-08. Execute tranche-by-tranche; fresh session per tranche.

## Order
0. `chore/puzzle-test-harness` — Vitest + Playwright, `test`/`test:e2e`/`typecheck`/`verify` scripts, injectable RNG per generator (`rng?: () => number` param, no global Math.random mutation), convert tmp smoke tests to deterministic corpus tests, tmp excluded from lint.
1. `feat/us-games-priority` — pages: /games/codeword (theme+count+size controls, answer grid + key), /games/bingo (true 75-ball BINGO column ranges, free center, call sheet, compact 3×3/4×4 modes), /games/number-search (return placements, guaranteed unique targets, filler can't create extra occurrences). Each: preview, PDF, answers, metadata, SEO copy, page guide, sitemap, analytics; flip hub "Soon"→"Ready" after acceptance.
2. `feat/us-games-core` — binairo, killer-sudoku, word-wheel, hangman pages.
3. `feat/us-games-spatial` — slitherlink, hashi, numberlink, arrow-words pages.
4. `feat/game-bundle-expansion` — refactor bundle-generator into BundlePuzzleAdapter registry {generate, draw, drawAnswer, label}; add 11 adapters w/ retry; one puzzle page + one answer page per type; preserve page size; renderer errors must not corrupt later pages.
5. `feat/locale-foundation` — SiteLocale = en|de|fr|es (+ PuzzleLanguage keeping pt output, no /pt route); typed localized route registry keyed by logical puzzle id (paths, labels, meta, dicts, equivalents, sitemap, switcher); route groups with per-group root layout for `<html lang>`; unprefixed English preserved; manual switching only (no browser-language redirects); EN keeps "Puzzle language" selector incl. pt, localized routes lock locale and hide it; self-canonical + reciprocal hreflang among equivalents only, en = x-default; OG locale-aware.
6. `feat/de-puzzles` — /de, /de/schwedenraetsel (vector-icon registry shared SVG+jsPDF, no rasterizing), wortsuchraetsel, buchstabensalat, kryptogramm, sudoku, kakuro, nonogramm. Reuse existing DE banks in src/lib/languages/*.ts (validated they exist). Grid normalization Ä→AE Ö→OE Ü→UE ß→SS. ≥40 DE arrow-word entries (text + icon clue kinds).
7. `feat/fr-puzzles` — /fr, mots-fleches, mots-meles, mots-croises, mots-melanges, cryptogrammes. WORD_CLUES_FR ≥40 pairs feeding arrow-words + generalized crossword (crossword must accept injected clue bank; unknown locale/theme fails loudly, never English fallback).
8. `feat/es-pilot` — /es, sopa-de-letras, crucigramas. Neutral LatAm Spanish (fix Spain-only terms like PATATA), real ES crossword bank, hreflang=es (no regional dupes), MX/CO-oriented copy.

## Engine fixes required before pages
- killer-sudoku: inverted uniqueness test (solveKiller(findSecond=true) returns truthy when ≥2 solutions exist — should REQUIRE exactly 1).
- word-wheel: varied 9-letter seeds; reject if fallback seed ever used in test corpus.
- hangman: category filter control.
- binairo: uniqueness validation at sizes 6/8/10/12.
- slitherlink: consistent dimension clamping; solver-backed uniqueness.
- hashi: return solution bridges; connected + unique solution check.
- numberlink: ordered paths/edges returned; true path endpoints; branch rejection; uniqueness.
- arrow-words: remove odd-length restriction (current parity hack caps at ~9 entries, 3 down); fixed-seed corpus must yield ≥12 entries + ≥6 crossings.

## Gates per tranche
100 deterministic seeds/generator; assert mappings/dims/uniqueness/counts/placements/solution fidelity/no silent EN fallback. Playwright smoke per route/control/download/locale-switch/404. Poppler-render A4/Letter/e-ink PDFs: overflow, accents, alignment, icon vectorness. `<html lang>`, canonical, hreflang reciprocity, x-default, OG locale, sitemap alternates. Final gate: lint zero-warning, typecheck, unit, build, Playwright, PDF inspection, read-only diff review. Human approves every commit; never push automatically. DE/FR/ES stay on preview until fluent reviewer signs off.

## Ops
OpenCode config: project opencode.json with alpha-build (opencode/x-preview-f-free, edits+tests allowed, installs/commits need approval, pushes denied) + alpha-review (read-only) subagents, subagent_depth 1. Commands /implement-tranche, /verify-tranche, /review-tranche via .opencode/. AGENTS.md gains commands, game/PDF conventions, Next 16 doc-reading requirement. Analytics: replace button-text download detection with explicit events carrying puzzle_key, locale, page_size, count.
