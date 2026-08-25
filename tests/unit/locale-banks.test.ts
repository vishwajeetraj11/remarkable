/**
 * FR + ES tranche invariants: bank sizes, injected-bank crossword, loud
 * failure on unknown themes, neutral LatAm vocabulary.
 */
import { describe, it, expect } from "vitest";

import { WORD_CLUES_FR } from "@/lib/languages/arrow-words-fr";
import { generateCrossword } from "@/lib/generators/crossword";
import { WORD_SEARCH_BANKS } from "@/lib/languages/word-search-words";
import { mulberry32 } from "../helpers/seeded-rng";

describe("french banks", () => {
  it("ships at least 40 word+clue pairs", () => {
    expect(WORD_CLUES_FR.length).toBeGreaterThanOrEqual(40);
    for (const e of WORD_CLUES_FR) {
      expect(e.word).toMatch(/^[A-Za-zÀ-ÿ]{2,}$/);
      expect(e.clue.length).toBeGreaterThan(2);
    }
  });
});

describe("crossword injected bank", () => {
  it("builds a valid puzzle from an injected locale bank", () => {
    const p = generateCrossword("ignored", 13, mulberry32(7), WORD_CLUES_FR);
    expect(p.words.length).toBeGreaterThan(5);
    const words = new Set(p.words.map((w) => w.word));
    for (const w of words) {
      expect(WORD_CLUES_FR.some((b) => b.word.toUpperCase() === w.toUpperCase())).toBe(true);
    }
  });

  it("fails loudly on unknown themes instead of serving English", () => {
    expect(() => generateCrossword("nonexistent-theme", 11, mulberry32(1))).toThrow(
      /unknown crossword theme/i,
    );
  });
});

describe("es pilot", () => {
  it("uses neutral LatAm vocabulary (no Spain-only PATATA)", () => {
    const es = WORD_SEARCH_BANKS.es as Record<string, string[]>;
    const all = Object.values(es).flat();
    expect(all).not.toContain("PATATA");
    expect(all.length).toBeGreaterThan(30);
  });
});
