/**
 * Codeword (codebreaker): a crossword-style grid where every letter has been
 * replaced by a number (1–26). Three starter letters are given; solvers
 * deduce the rest from word patterns. Built on the crossword generator.
 */

import { generateCrossword } from "./crossword";

export interface CodewordPuzzle {
  /** Grid of numbers; 0 marks blocked cells. */
  grid: number[][];
  size: number;
  /** number -> letter mapping used by this puzzle */
  code: Record<number, string>;
  /** Numbers revealed as starters: { cellKey: letter } */
  revealed: { row: number; col: number; letter: string }[];
}

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateCodeword(theme = "general"): CodewordPuzzle {
  // Try a few crossword seeds — codewords need decent fill density.
  let best: ReturnType<typeof generateCrossword> | null = null;
  for (let t = 0; t < 6; t++) {
    const puzzle = generateCrossword(theme);
    const filled = puzzle.grid.flat().filter((c) => c !== null).length;
    if (!best || filled > best.grid.flat().filter((c) => c !== null).length) {
      best = puzzle;
    }
  }
  const base = best ?? generateCrossword(theme);
  const size = base.size;

  const usedLetters = [
    ...new Set(base.grid.flat().filter((c): c is string => c !== null)),
  ];

  // Assign random distinct numbers to the used letters.
  const availableNumbers = shuffled(
    Array.from({ length: ALPHABET.length }, (_, i) => i + 1)
  );
  const code: Record<number, string> = {};
  const letterToNumber: Record<string, number> = {};
  usedLetters.forEach((letter, idx) => {
    const num = availableNumbers[idx];
    code[num] = letter;
    letterToNumber[letter] = num;
  });

  const grid: number[][] = Array.from({ length: size }, () =>
    Array<number>(size).fill(0)
  );
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const ch = base.grid[r][c];
      if (ch !== null) grid[r][c] = letterToNumber[ch];
    }
  }

  // Reveal three starter cells from different words.
  const candidates = shuffled(base.words.slice(0, 8));
  const revealed: { row: number; col: number; letter: string }[] = [];
  const seenLetters = new Set<string>();
  for (const w of candidates) {
    if (revealed.length >= 3) break;
    if (seenLetters.has(w.word[0])) continue;
    seenLetters.add(w.word[0]);
    revealed.push({ row: w.row, col: w.col, letter: w.word[0] });
  }

  return { grid, size, code, revealed };
}
