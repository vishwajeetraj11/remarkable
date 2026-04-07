import { shuffleArray } from "@/lib/pdf-constants";

export type CellType = "black" | "white" | "clue";

export interface ClueCell {
  type: "clue";
  across?: number;
  down?: number;
}

export interface WhiteCell {
  type: "white";
  value: number;
}

export interface BlackCell {
  type: "black";
}

export type Cell = ClueCell | WhiteCell | BlackCell;

export interface KakuroPuzzle {
  grid: Cell[][];
  size: number;
}

export type KakuroDifficulty = "easy" | "medium" | "hard";

// Grid patterns: 1 = white cell, 0 = black/clue cell
// Row 0 and col 0 are always clue/black borders.
const PATTERNS: Record<KakuroDifficulty, number[][]> = {
  easy: [
    [0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 1],
    [0, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0],
    [0, 1, 1, 0, 1, 1],
  ],
  medium: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 1],
    [0, 1, 1, 1, 0, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 0, 1, 1, 1],
    [0, 1, 1, 1, 0, 0, 1, 1],
    [0, 1, 1, 0, 0, 1, 1, 0],
  ],
  hard: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    [0, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 0, 0, 1, 1, 0],
    [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 1, 1, 1],
    [0, 1, 1, 0, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 0, 1, 1, 0, 0, 1, 1],
  ],
};

interface Run {
  cells: [number, number][];
  direction: "across" | "down";
  clueRow: number;
  clueCol: number;
}

function extractRuns(pattern: number[][]): Run[] {
  const size = pattern.length;
  const runs: Run[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (pattern[r][c] !== 1) continue;

      // Start of horizontal run: left neighbor is not white
      if (c === 0 || pattern[r][c - 1] !== 1) {
        const cells: [number, number][] = [];
        let cc = c;
        while (cc < size && pattern[r][cc] === 1) {
          cells.push([r, cc]);
          cc++;
        }
        if (cells.length >= 2) {
          // Clue cell is the cell immediately to the left of the run
          runs.push({ cells, direction: "across", clueRow: r, clueCol: c - 1 });
        }
      }

      // Start of vertical run: top neighbor is not white
      if (r === 0 || pattern[r - 1][c] !== 1) {
        const cells: [number, number][] = [];
        let rr = r;
        while (rr < size && pattern[rr][c] === 1) {
          cells.push([rr, c]);
          rr++;
        }
        if (cells.length >= 2) {
          runs.push({ cells, direction: "down", clueRow: r - 1, clueCol: c });
        }
      }
    }
  }

  return runs;
}

function fillValues(pattern: number[][], runs: Run[]): number[][] | null {
  const size = pattern.length;
  const grid: number[][] = Array.from({ length: size }, () => Array(size).fill(0));

  const whiteCells: [number, number][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (pattern[r][c] === 1) whiteCells.push([r, c]);
    }
  }

  // Map each cell to its runs for fast constraint lookup
  const cellRuns: Map<string, Run[]> = new Map();
  for (const run of runs) {
    for (const [r, c] of run.cells) {
      const key = `${r},${c}`;
      if (!cellRuns.has(key)) cellRuns.set(key, []);
      cellRuns.get(key)!.push(run);
    }
  }

  function isValidPlacement(r: number, c: number, val: number): boolean {
    const myRuns = cellRuns.get(`${r},${c}`) || [];
    for (const run of myRuns) {
      for (const [cr, cc] of run.cells) {
        if (cr === r && cc === c) continue;
        if (grid[cr][cc] === val) return false;
      }
    }
    return true;
  }

  function solve(idx: number): boolean {
    if (idx >= whiteCells.length) return true;
    const [r, c] = whiteCells[idx];
    const candidates = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const val of candidates) {
      if (isValidPlacement(r, c, val)) {
        grid[r][c] = val;
        if (solve(idx + 1)) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  }

  if (!solve(0)) return null;
  return grid;
}

export function generateKakuro(difficulty: KakuroDifficulty): KakuroPuzzle {
  const pattern = PATTERNS[difficulty];
  const size = pattern.length;
  const runs = extractRuns(pattern);

  let values: number[][] | null = null;
  // Retry with different random orderings if backtracking fails
  for (let attempt = 0; attempt < 20; attempt++) {
    values = fillValues(pattern, runs);
    if (values) break;
  }

  if (!values) {
    throw new Error("Failed to generate a valid Kakuro puzzle");
  }

  // Build final grid
  const grid: Cell[][] = Array.from({ length: size }, () =>
    Array(size).fill(null).map(() => ({ type: "black" }) as Cell)
  );

  // Place white cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (pattern[r][c] === 1) {
        grid[r][c] = { type: "white", value: values[r][c] };
      }
    }
  }

  // Place clue cells with sums
  for (const run of runs) {
    const { clueRow: cr, clueCol: cc, direction, cells } = run;
    if (cr < 0 || cc < 0) continue;

    const sum = cells.reduce((s, [r, c]) => s + values![r][c], 0);

    const existing = grid[cr][cc];
    if (existing.type === "clue") {
      if (direction === "across") existing.across = sum;
      else existing.down = sum;
    } else {
      grid[cr][cc] = {
        type: "clue",
        ...(direction === "across" ? { across: sum } : { down: sum }),
      };
    }
  }

  return { grid, size };
}
