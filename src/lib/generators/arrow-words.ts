/**
 * Arrow words (mots fléchés): France's favorite format. Answers run across
 * even rows and down even columns; every answer is preceded by a dedicated
 * clue cell holding the clue text plus an arrow pointing into the answer.
 *
 * Layout rules:
 *   - Across answers live on even rows, down answers on even columns, so
 *     crossings land on (even, even) cells and never collide with clue
 *     cells, which always sit at coordinates adjacent to an answer start.
 *   - Every answer reserves BOTH the clue cell before it and the cell after
 *     its final letter, so printed clues never collide with letters.
 */

export interface ArrowWordEntry {
  word: string;
  clue: string;
  /** Clue cell position (holds the printed clue text + arrow). */
  clueRow: number;
  clueCol: number;
  /** Answer start position. */
  row: number;
  col: number;
  direction: "across" | "down";
}

export interface ArrowWordPuzzle {
  size: number;
  entries: ArrowWordEntry[];
}

const WORD_CLUES: { word: string; clue: string }[] = [
  { word: "APPLE", clue: "Common red fruit" },
  { word: "BRIDGE", clue: "Crosses a river" },
  { word: "CLOUD", clue: "Floats in sky" },
  { word: "DANCE", clue: "Move to music" },
  { word: "EAGLE", clue: "Bird of prey" },
  { word: "FLAME", clue: "Part of fire" },
  { word: "GLOBE", clue: "Model of Earth" },
  { word: "HARBOR", clue: "Boat shelter" },
  { word: "JACKET", clue: "Short coat" },
  { word: "KNIGHT", clue: "Armored rider" },
  { word: "LEMON", clue: "Sour citrus" },
  { word: "MIRROR", clue: "Reflects image" },
  { word: "NOVEL", clue: "Long fiction" },
  { word: "OCEAN", clue: "Salt water body" },
  { word: "PIANO", clue: "88-key instrument" },
  { word: "QUEEN", clue: "Female monarch" },
  { word: "RIVER", clue: "Flowing stream" },
  { word: "STONE", clue: "Small rock" },
  { word: "TIGER", clue: "Striped big cat" },
  { word: "WATER", clue: "H₂O" },
  { word: "ZEBRA", clue: "Striped animal" },
  { word: "BREAD", clue: "Baked staple" },
  { word: "CHAIR", clue: "Seat with back" },
  { word: "DREAM", clue: "Night vision" },
  { word: "EARTH", clue: "Our planet" },
  { word: "FRUIT", clue: "Sweet produce" },
  { word: "GRASS", clue: "Lawn covering" },
  { word: "HEART", clue: "Pumping organ" },
  { word: "LIGHT", clue: "Bright / not heavy" },
  { word: "MONEY", clue: "Coins and notes" },
];

type CellState = -1 | 0 | 1; // -1 clue/reserved cell, 0 empty, 1 letter

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateArrowWords(size = 11): ArrowWordPuzzle | null {
  const n = Math.max(11, Math.min(15, size));

  for (let outerAttempt = 0; outerAttempt < 20; outerAttempt++) {
    const state: CellState[][] = Array.from({ length: n }, () =>
      Array<CellState>(n).fill(0)
    );
    const letters: (string | null)[][] = Array.from({ length: n }, () =>
      Array<string | null>(n).fill(null)
    );
    const acrossOwner: boolean[][] = Array.from({ length: n }, () =>
      Array<boolean>(n).fill(false)
    );
    const downOwner: boolean[][] = Array.from({ length: n }, () =>
      Array<boolean>(n).fill(false)
    );
    let crossings = 0;
    const entries: ArrowWordEntry[] = [];
    const pool = shuffle(WORD_CLUES);

    /**
     * Can `word` start at (row,col)? Requires: the clue cell before the
     * start is inside the grid and still empty, every path cell is empty or
     * a matching crossing letter, passage-direction rules hold, and the
     * terminator cell after the end is inside and empty.
     */
    function fits(
      row: number,
      col: number,
      word: string,
      dir: "across" | "down"
    ): boolean {
      if (word.length < 3) return false;
      const dr = dir === "down" ? 1 : 0;
      const dc = dir === "across" ? 1 : 0;

      // Clue cell before the start.
      const pr = row - dr;
      const pc = col - dc;
      if (pr < 0 || pc < 0 || pr >= n || pc >= n || state[pr][pc] !== 0) {
        return false;
      }
      // Terminator after the end.
      const endR = row + dr * (word.length - 1);
      const endC = col + dc * (word.length - 1);
      if (endR >= n || endC >= n) return false;
      const ar = endR + dr;
      const ac = endC + dc;
      if (ar < n && ac < n && state[ar][ac] !== 0) return false;

      for (let i = 0; i < word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        const s = state[r][c];
        if (s === -1) return false;
        if (s === 1) {
          if (letters[r][c] !== word[i]) return false;
        }
      }
      // Crossing coordinates are (even, even). Across answers start on even
      // columns and have odd length; down answers start on even rows with odd
      // length. That keeps clue cells and terminators on odd coordinates so
      // they never block a potential crossing.
      if (dir === "across" && ((col % 2 !== 0) || word.length % 2 === 0)) {
        return false;
      }
      if (dir === "down" && ((row % 2 !== 0) || word.length % 2 === 0)) {
        return false;
      }
      return true;
    }

    function place(
      row: number,
      col: number,
      item: { word: string; clue: string },
      dir: "across" | "down"
    ): void {
      const dr = dir === "down" ? 1 : 0;
      const dc = dir === "across" ? 1 : 0;
      for (let i = 0; i < item.word.length; i++) {
        const r = row + dr * i;
        const c = col + dc * i;
        state[r][c] = 1;
        letters[r][c] = item.word[i];
        if (dir === "across") {
          if (downOwner[r][c]) crossings++;
          acrossOwner[r][c] = true;
        } else {
          if (acrossOwner[r][c]) crossings++;
          downOwner[r][c] = true;
        }
      }
      const pr = row - dr;
      const pc = col - dc;
      state[pr][pc] = -1; // guaranteed empty by fits()
      const ar = row + dr * item.word.length;
      const ac = col + dc * item.word.length;
      if (ar < n && ac < n && state[ar][ac] === 0) state[ar][ac] = -1;

      entries.push({
        word: item.word,
        clue: item.clue,
        clueRow: pr,
        clueCol: pc,
        row,
        col,
        direction: dir,
      });
    }

    // Across words on even rows (even start col, odd length); down words on
    // even columns (even start row, odd length). Interleave for crossings.
    for (let line = 0; line < n; line += 2) {
      for (const dir of ["across", "down"] as const) {
        for (let attempt = 0; attempt < 60; attempt++) {
          if (pool.length === 0) break;
          const item = pool[0];
          if (item.word.length % 2 === 0 || item.word.length + 2 > n) {
            // Never placeable under parity rules — rotate to the back.
            pool.push(pool.shift()!);
            continue;
          }
          const coord =
            Math.floor(Math.random() * Math.ceil((n - 1) / 2)) * 2;
          const row = dir === "across" ? line : coord;
          const col = dir === "across" ? coord : line;
          if (!fits(row, col, item.word, dir)) continue;
          pool.shift();
          place(row, col, item, dir);
        }
      }
    }

    if (entries.length >= 12 && crossings >= 6) {
      return { size: n, entries };
    }
  }
  return null;
}
