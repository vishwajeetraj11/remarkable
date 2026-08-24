/**
 * Corpus tests for word generators: word-search, word-scramble,
 * word-wheel, word-ladder, hangman, cryptogram, crossword, codeword,
 * arrow-words.
 *
 * Seeded PRNG only — the global Math.random guard fails loudly on any
 * accidental global usage.
 */
import { describe, it, expect } from "vitest";
import {
  forbidGlobalRandom,
  mulberry32,
  stable,
} from "../helpers/seeded-rng";
import { generateWordSearch } from "@/lib/generators/word-search";
import { generateWordScramble } from "@/lib/generators/word-scramble";
import { generateWordWheel } from "@/lib/generators/word-wheel";
import { generateWordLadder } from "@/lib/generators/word-ladder";
import { generateHangmanSheet } from "@/lib/generators/hangman";
import { generateCryptogram } from "@/lib/generators/cryptogram";
import { generateCrossword } from "@/lib/generators/crossword";
import { generateCodeword } from "@/lib/generators/codeword";
import { generateArrowWords } from "@/lib/generators/arrow-words";

forbidGlobalRandom();

describe("generateWordSearch", () => {
  it("is deterministic per seed", () => {
    for (const seed of [2, 22]) {
      const a = generateWordSearch("animals", 14, undefined, mulberry32(seed));
      const b = generateWordSearch("animals", 14, undefined, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("places every returned word at its stated position and direction", () => {
    for (let seed = 1; seed <= 40; seed++) {
      const { grid, words, placements, size } = generateWordSearch(
        "animals",
        14,
        undefined,
        mulberry32(seed)
      );
      expect(size).toBe(14);
      expect(words.length).toBe(placements.length);
      expect(words.length).toBeGreaterThan(0);

      for (const p of placements) {
        for (let i = 0; i < p.word.length; i++) {
          const r = p.row + p.direction.dr * i;
          const c = p.col + p.direction.dc * i;
          expect(grid[r][c]).toBe(p.word[i]);
        }
      }
    }
  });
});

describe("generateWordScramble", () => {
  it("is deterministic per seed", () => {
    for (const seed of [8]) {
      const a = generateWordScramble("easy", "food", 6, undefined, mulberry32(seed));
      const b = generateWordScramble("easy", "food", 6, undefined, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("scrambles are anagrams of their answers", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const { scrambles } = generateWordScramble(
        "medium",
        "animals",
        8,
        undefined,
        mulberry32(seed)
      );
      expect(scrambles.length).toBeGreaterThan(0);
      for (const s of scrambles) {
        expect([...s.scrambled].sort().join("")).toBe(
          [...s.answer].sort().join("")
        );
        expect(s.hint.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("generateWordWheel", () => {
  it("is deterministic per seed", () => {
    for (const seed of [4]) {
      const a = generateWordWheel(10, mulberry32(seed));
      const b = generateWordWheel(10, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("every solution contains the center letter and fits the wheel letters", () => {
    for (let seed = 1; seed <= 15; seed++) {
      const { letters, centerIndex, solutions } = generateWordWheel(
        10,
        mulberry32(seed)
      );
      expect(letters).toHaveLength(9);
      expect(new Set(letters).size).toBe(9);
      // The deterministic fallback ("education") must never surface in the
      // corpus — it would mean every attempt failed to find a varied seed.
      expect(letters.join("")).not.toBe("education");
      expect(letters.join("")).toMatch(/^[a-z]{9}$/);
      const center = letters[centerIndex];
      const pool = new Map<string, number>();
      for (const ch of letters) pool.set(ch, (pool.get(ch) ?? 0) + 1);

      expect(solutions.length).toBeGreaterThanOrEqual(10);
      for (const w of solutions) {
        expect(w.includes(center)).toBe(true);
        const need = new Map<string, number>();
        for (const ch of w) need.set(ch, (need.get(ch) ?? 0) + 1);
        for (const [ch, n] of need) {
          expect(pool.get(ch) ?? 0).toBeGreaterThanOrEqual(n);
        }
      }
    }
  });
});

describe("generateWordLadder", () => {
  it("is deterministic per seed", () => {
    for (const seed of [6]) {
      const a = generateWordLadder("easy", 4, mulberry32(seed));
      const b = generateWordLadder("easy", 4, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("chains are valid one-letter-step ladders of the requested length", () => {
    for (let seed = 1; seed <= 8; seed++) {
      const wordLength = ([3, 4, 5] as const)[seed % 3];
      const { startWord, endWord, steps } = generateWordLadder(
        "medium",
        wordLength,
        mulberry32(seed)
      );
      expect(steps[0]).toBe(startWord);
      expect(steps[steps.length - 1]).toBe(endWord);
      expect(startWord).not.toBe(endWord);
      for (const w of steps) expect(w.length).toBe(wordLength);
      for (let i = 1; i < steps.length; i++) {
        let diff = 0;
        for (let j = 0; j < wordLength; j++) {
          if (steps[i][j] !== steps[i - 1][j]) diff++;
        }
        expect(diff).toBe(1);
      }
    }
  });
});

describe("generateHangmanSheet", () => {
  it("is deterministic per seed", () => {
    for (const seed of [9]) {
      const a = generateHangmanSheet(8, undefined, mulberry32(seed));
      const b = generateHangmanSheet(8, undefined, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("rounds have unique words in known categories", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const count = 5 + (seed % 10);
      const { rounds, categories } = generateHangmanSheet(count, undefined, mulberry32(seed));
      expect(rounds).toHaveLength(count);
      expect(new Set(categories).size).toBe(categories.length);
      const words = rounds.map((r) => r.word);
      expect(new Set(words).size).toBe(words.length);
      for (const round of rounds) {
        expect(categories).toContain(round.category);
      }
    }
  });

  it("category filter restricts rounds and clamps to the available pool", () => {
    for (let seed = 1; seed <= 10; seed++) {
      // Filtered: every round comes from the requested category.
      const filtered = generateHangmanSheet(6, ["Animals"], mulberry32(seed));
      expect(filtered.rounds).toHaveLength(6);
      for (const round of filtered.rounds) {
        expect(round.category).toBe("Animals");
      }

      // Unknown categories fall back to all categories.
      const unknown = generateHangmanSheet(4, ["Nonexistent"], mulberry32(seed));
      expect(unknown.rounds).toHaveLength(4);

      // Requesting more words than a category holds clamps instead of looping.
      const clamped = generateHangmanSheet(50, ["Jobs"], mulberry32(seed));
      const jobWords = new Set(clamped.rounds.map((r) => r.word));
      expect(jobWords.size).toBe(clamped.rounds.length);
      for (const round of clamped.rounds) {
        expect(round.category).toBe("Jobs");
      }
    }
  });
});

describe("generateCryptogram", () => {
  it("is deterministic per seed", () => {
    for (const seed of [12]) {
      const a = generateCryptogram(undefined, mulberry32(seed));
      const b = generateCryptogram(undefined, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("key is a bijection and decrypts the ciphertext to the plaintext", () => {
    for (let seed = 1; seed <= 80; seed++) {
      const rng = mulberry32(seed);
      const quote = "Testing one two three with words";
      const { plaintext, ciphertext, key, hint } = generateCryptogram(quote, rng);
      // Custom quotes are returned verbatim; encryption uppercases.
      expect(plaintext).toBe(quote);

      const values = Object.values(key);
      expect(new Set(values).size).toBe(values.length); // injective
      expect(values.length).toBe(26);

      const decoded = ciphertext
        .split("")
        .map((ch) =>
          /[A-Z]/.test(ch)
            ? Object.entries(key).find(([, v]) => v === ch)?.[0] ?? "?"
            : ch
        )
        .join("");
      expect(decoded).toBe(quote.toUpperCase());

      expect(hint).toMatch(/^[A-Z] = [A-Z](, [A-Z] = [A-Z])*$/);
    }
  });
});

describe("generateCrossword", () => {
  it("is deterministic per seed", () => {
    for (const seed of [14]) {
      const a = generateCrossword("general", 15, mulberry32(seed));
      const b = generateCrossword("general", 15, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("every placed word reads correctly from the grid", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const { grid, words, size } = generateCrossword("general", 15, mulberry32(seed));
      expect(size).toBe(15);
      expect(words.length).toBeGreaterThan(0);

      for (const w of words) {
        const dr = w.direction === "down" ? 1 : 0;
        const dc = w.direction === "across" ? 1 : 0;
        for (let i = 0; i < w.word.length; i++) {
          expect(grid[w.row + dr * i][w.col + dc * i]).toBe(w.word[i]);
        }
      }

      // Crossings must agree: any shared cell has a single letter already
      // guaranteed by grid writes; assert no letter cell conflicts by
      // re-deriving the grid from words alone.
      const derived: (string | null)[][] = Array.from({ length: size }, () =>
        Array<string | null>(size).fill(null)
      );
      for (const w of words) {
        const dr = w.direction === "down" ? 1 : 0;
        const dc = w.direction === "across" ? 1 : 0;
        for (let i = 0; i < w.word.length; i++) {
          const r = w.row + dr * i;
          const c = w.col + dc * i;
          if (derived[r][c] !== null && derived[r][c] !== w.word[i]) {
            throw new Error(`crossing conflict at ${r},${c}`);
          }
          derived[r][c] = w.word[i];
        }
      }
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (grid[r][c] === null) {
            expect(derived[r][c]).toBeNull();
          } else {
            expect(derived[r][c]).toBe(grid[r][c]);
          }
        }
      }
    }
  });
});

describe("generateCodeword", () => {
  it("is deterministic per seed", () => {
    for (const seed of [15]) {
      const a = generateCodeword("general", 15, mulberry32(seed));
      const b = generateCodeword("general", 15, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("number->letter code is injective and decodes back to the crossword", () => {
    for (let seed = 1; seed <= 8; seed++) {
      const requestedSize = 13;
      const { grid, code, revealed, size } = generateCodeword(
        "general",
        requestedSize,
        mulberry32(seed)
      );
      expect(size).toBe(requestedSize);
      const letters = Object.values(code);
      expect(new Set(letters).size).toBe(letters.length);

      const filled = grid.flat().filter((v) => v > 0);
      expect(filled.length).toBeGreaterThanOrEqual(30);

      for (const rev of revealed) {
        expect(code[grid[rev.row][rev.col]]).toBe(rev.letter);
      }
      expect(revealed.length).toBeGreaterThan(0);
    }
  });
});

describe("generateArrowWords", () => {
  it("is deterministic per seed (including null results)", () => {
    for (const seed of [16, 160]) {
      const a = generateArrowWords(11, mulberry32(seed));
      const b = generateArrowWords(11, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("entries obey layout rules when a puzzle is produced", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const result = generateArrowWords(11, mulberry32(seed));
      if (!result) continue;
      const { size, entries } = result;

      const starts = new Set(
        entries.map((e) => `${e.row},${e.col},${e.direction}`)
      );
      expect(starts.size).toBe(entries.length);

      for (const e of entries) {
        const dr = e.direction === "down" ? 1 : 0;
        const dc = e.direction === "across" ? 1 : 0;
        expect(e.clueRow).toBe(e.row - dr);
        expect(e.clueCol).toBe(e.col - dc);
        expect(e.clueRow).toBeGreaterThanOrEqual(0);
        expect(e.clueCol).toBeGreaterThanOrEqual(0);

        const endR = e.row + dr * (e.word.length - 1);
        const endC = e.col + dc * (e.word.length - 1);
        expect(endR).toBeLessThan(size);
        expect(endC).toBeLessThan(size);
      }

      // Crossings agree letter-for-letter.
      const cellOwner = new Map<string, string>();
      for (const e of entries) {
        const dr = e.direction === "down" ? 1 : 0;
        const dc = e.direction === "across" ? 1 : 0;
        for (let i = 0; i < e.word.length; i++) {
          const key = `${e.row + dr * i},${e.col + dc * i}`;
          const prev = cellOwner.get(key);
          if (prev !== undefined && prev !== e.word[i]) {
            throw new Error(`arrow-word crossing conflict at ${key}`);
          }
          cellOwner.set(key, e.word[i]);
        }
      }
    }
  });

  it("fixed seeds yield >=12 entries with >=6 crossings (parity cap removed)", { timeout: 30_000 }, () => {
    // docs/puzzle-rollout.md gate: after removing the odd-length
    // restriction the corpus must reliably produce dense boards.
    let produced = 0;
    let minEntries = Infinity;
    let minCrossings = Infinity;
    for (let seed = 1; seed <= 20; seed++) {
      const result = generateArrowWords(11, mulberry32(seed));
      if (!result) continue;
      produced++;
      const { entries } = result;

      minEntries = Math.min(minEntries, entries.length);

      // Count crossings: cells owned by both an across and a down entry.
      const acrossCells = new Set<string>();
      const downCells = new Set<string>();
      for (const e of entries) {
        const dr = e.direction === "down" ? 1 : 0;
        const dc = e.direction === "across" ? 1 : 0;
        for (let i = 0; i < e.word.length; i++) {
          (e.direction === "across" ? acrossCells : downCells).add(
            `${e.row + dr * i},${e.col + dc * i}`
          );
        }
      }
      let crossings = 0;
      for (const key of acrossCells) if (downCells.has(key)) crossings++;
      minCrossings = Math.min(minCrossings, crossings);
    }

    expect(produced).toBe(20);
    expect(minEntries).toBeGreaterThanOrEqual(12);
    expect(minCrossings).toBeGreaterThanOrEqual(6);
  });
});
