/**
 * DE tranche invariants: Schwedenrätsel bank size + icon coverage, grid
 * normalization, and injected-bank generation.
 */
import { describe, it, expect } from "vitest";

import { ARROW_WORDS_DE } from "@/lib/languages/arrow-words-de";
import { allClueIconIds, getClueIcon, iconToSvg } from "@/lib/i18n/clue-icons";
import { normalizeForGrid } from "@/lib/i18n/normalize";
import { generateArrowWords } from "@/lib/generators/arrow-words";
import { mulberry32 } from "../helpers/seeded-rng";

describe("schwedenraetsel bank", () => {
  it("ships at least 40 entries", () => {
    expect(ARROW_WORDS_DE.length).toBeGreaterThanOrEqual(40);
  });

  it("every entry resolves to a registered icon and an A-Z word", () => {
    const known = new Set(allClueIconIds());
    for (const e of ARROW_WORDS_DE) {
      expect(e.word).toMatch(/^[A-Z]{3,}$/);
      expect(known.has(e.clue), `unknown icon ${e.clue}`).toBe(true);
    }
  });

  it("icon registry renders SVG and covers primitives", () => {
    for (const id of allClueIconIds()) {
      expect(getClueIcon(id)).toBeDefined();
      const svg = iconToSvg(id, 40);
      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
    }
  });
});

describe("normalizeForGrid", () => {
  it("spells out German umlauts and strips the rest", () => {
    expect(normalizeForGrid("Schule")).toBe("SCHULE");
    expect(normalizeForGrid("Bär")).toBe("BAER");
    expect(normalizeForGrid("öl")).toBe("OEL");
    expect(normalizeForGrid("Fuß")).toBe("FUSS");
    expect(normalizeForGrid("Grüße")).toBe("GRUESSE");
  });
});

describe("generateArrowWords with injected bank", () => {
  it("produces puzzles whose clues come from the injected bank only", { timeout: 60_000 }, () => {
    const allowed = new Set(ARROW_WORDS_DE.map((e) => e.clue));
    let produced = 0;
    for (let seed = 1; seed <= 6; seed++) {
      const p = generateArrowWords(13, mulberry32(seed), ARROW_WORDS_DE);
      if (!p) continue;
      produced++;
      for (const e of p.entries) {
        expect(allowed.has(e.clue)).toBe(true);
        expect(ARROW_WORDS_DE.some((b) => b.word === e.word)).toBe(true);
      }
    }
    expect(produced).toBeGreaterThan(0);
  });
});
