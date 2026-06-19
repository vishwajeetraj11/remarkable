import { shuffleArray } from "@/lib/pdf-constants";

export type FutoshikiDifficulty = "easy" | "medium" | "hard";

/**
 * An inequality constraint between two orthogonally-adjacent cells.
 * `[r1, c1]` is the "greater" cell and `[r2, c2]` is the "lesser" cell, i.e.
 * the solution always satisfies `solution[r1][c1] > solution[r2][c2]`.
 * `orientation` records whether the two cells are horizontal (left/right)
 * or vertical (top/bottom) neighbours, which the renderer needs to draw the
 * sign in the gap between cells.
 */
export interface Inequality {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
  orientation: "horizontal" | "vertical";
}

export interface FutoshikiPuzzle {
  /** Fully-solved Latin square (1..size in every row/column). */
  solution: number[][];
  /** Givens shown to the solver; `0` means the cell is blank. */
  givens: number[][];
  /** Inequality signs placed between adjacent cells. */
  inequalities: Inequality[];
  size: number;
}

const GRID_SIZES: Record<FutoshikiDifficulty, number> = {
  easy: 4,
  medium: 5,
  hard: 6,
};

/**
 * Fraction of inequality "edges" (adjacent cell pairs) that carry a sign.
 * Harder puzzles use fewer signs and fewer givens, so more must be deduced.
 */
const INEQUALITY_FRACTION: Record<FutoshikiDifficulty, number> = {
  easy: 0.35,
  medium: 0.28,
  hard: 0.22,
};

// ─── Latin square ────────────────────────────────────────────────────────────

function generateLatinSquare(n: number): number[][] {
  const grid: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

  function isValid(row: number, col: number, num: number): boolean {
    for (let c = 0; c < n; c++) if (grid[row][c] === num) return false;
    for (let r = 0; r < n; r++) if (grid[r][col] === num) return false;
    return true;
  }

  function fill(): boolean {
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        if (grid[row][col] === 0) {
          for (const num of shuffleArray(Array.from({ length: n }, (_, i) => i + 1))) {
            if (isValid(row, col, num)) {
              grid[row][col] = num;
              if (fill()) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  fill();
  return grid;
}

function copyGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

// ─── Inequality selection ────────────────────────────────────────────────────

/**
 * Build the list of all adjacent cell pairs (edges) and orient each one so it
 * is consistent with the solution (the greater cell first). Then keep a random
 * subset sized by difficulty.
 */
function chooseInequalities(
  solution: number[][],
  n: number,
  fraction: number
): Inequality[] {
  const edges: Inequality[] = [];

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      // Horizontal neighbour (right)
      if (c < n - 1) {
        const a = solution[r][c];
        const b = solution[r][c + 1];
        edges.push(
          a > b
            ? { r1: r, c1: c, r2: r, c2: c + 1, orientation: "horizontal" }
            : { r1: r, c1: c + 1, r2: r, c2: c, orientation: "horizontal" }
        );
      }
      // Vertical neighbour (down)
      if (r < n - 1) {
        const a = solution[r][c];
        const b = solution[r + 1][c];
        edges.push(
          a > b
            ? { r1: r, c1: c, r2: r + 1, c2: c, orientation: "vertical" }
            : { r1: r + 1, c1: c, r2: r, c2: c, orientation: "vertical" }
        );
      }
    }
  }

  const shuffled = shuffleArray(edges);
  const count = Math.max(n, Math.round(edges.length * fraction));
  return shuffled.slice(0, count);
}

// ─── Solver / uniqueness ─────────────────────────────────────────────────────

/**
 * Count solutions of a Futoshiki puzzle (givens + inequalities), stopping early
 * once `limit` solutions are found. A backtracking solver that respects both
 * the Latin-square constraint and every inequality.
 */
function countSolutions(
  givens: number[][],
  inequalities: Inequality[],
  n: number,
  limit = 2
): number {
  const grid = copyGrid(givens);

  // Index inequalities by the cells they touch for fast partial checks.
  const constraintsAt: Inequality[][] = Array.from({ length: n * n }, () => []);
  const key = (r: number, c: number) => r * n + c;
  for (const ineq of inequalities) {
    constraintsAt[key(ineq.r1, ineq.c1)].push(ineq);
    constraintsAt[key(ineq.r2, ineq.c2)].push(ineq);
  }

  function latinOk(row: number, col: number, num: number): boolean {
    for (let c = 0; c < n; c++) if (c !== col && grid[row][c] === num) return false;
    for (let r = 0; r < n; r++) if (r !== row && grid[r][col] === num) return false;
    return true;
  }

  /**
   * Check every inequality touching (row, col) that already has both endpoints
   * filled. Unfilled endpoints (0) are skipped — they will be validated later.
   */
  function inequalitiesOk(row: number, col: number): boolean {
    for (const ineq of constraintsAt[key(row, col)]) {
      const greater = grid[ineq.r1][ineq.c1];
      const lesser = grid[ineq.r2][ineq.c2];
      if (greater !== 0 && lesser !== 0 && greater <= lesser) return false;
    }
    return true;
  }

  let count = 0;

  function solve(): boolean {
    // Find next empty cell.
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= n; num++) {
            if (latinOk(row, col, num)) {
              grid[row][col] = num;
              if (inequalitiesOk(row, col)) {
                if (solve()) {
                  grid[row][col] = 0;
                  return true; // limit reached — bubble up
                }
              }
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    // Full grid: a complete, valid solution.
    count++;
    return count >= limit;
  }

  solve();
  return count;
}

// ─── Givens removal ──────────────────────────────────────────────────────────

/**
 * Start from the full solution and remove givens one at a time, keeping the
 * puzzle uniquely solvable (with the chosen inequalities). Returns the reduced
 * givens grid (0 = blank).
 */
function reduceGivens(
  solution: number[][],
  inequalities: Inequality[],
  n: number
): number[][] {
  const givens = copyGrid(solution);
  const cells = shuffleArray(
    Array.from({ length: n * n }, (_, i) => i)
  );

  for (const idx of cells) {
    const row = Math.floor(idx / n);
    const col = idx % n;
    if (givens[row][col] === 0) continue;

    const backup = givens[row][col];
    givens[row][col] = 0;

    // Keep the removal only if the puzzle still has exactly one solution.
    if (countSolutions(givens, inequalities, n) !== 1) {
      givens[row][col] = backup;
    }
  }

  return givens;
}

// ─── Public generator ────────────────────────────────────────────────────────

/**
 * Generate a Futoshiki puzzle with a guaranteed unique solution.
 *
 * Algorithm:
 *  1. Build a random solved Latin square.
 *  2. Pick a difficulty-scaled subset of inequality signs between adjacent
 *     cells, each oriented to be consistent with the solution.
 *  3. Greedily remove givens while the backtracking solver confirms the puzzle
 *     still has exactly one solution.
 *
 * The whole grid is small (4–6), so the bounded backtracking solver is fast
 * enough to run client-side. We retry a few times in the (rare) event a sparse
 * inequality set leaves the empty grid non-unique even with no givens removed.
 */
export function generateFutoshiki(
  size: number,
  difficulty: FutoshikiDifficulty = "medium"
): FutoshikiPuzzle {
  const n = Math.max(4, Math.min(7, size));
  const fraction = INEQUALITY_FRACTION[difficulty];

  for (let attempt = 0; attempt < 20; attempt++) {
    const solution = generateLatinSquare(n);
    const inequalities = chooseInequalities(solution, n, fraction);
    const givens = reduceGivens(solution, inequalities, n);

    // reduceGivens preserves uniqueness, so this is uniquely solvable.
    return { solution, givens, inequalities, size: n };
  }

  // Fallback (unreachable in practice): full givens are always unique.
  const solution = generateLatinSquare(n);
  return {
    solution,
    givens: copyGrid(solution),
    inequalities: chooseInequalities(solution, n, fraction),
    size: n,
  };
}

/**
 * Convenience: derive the grid size used for a difficulty (mirrors the other
 * Latin-square generators that key size off difficulty).
 */
export function futoshikiSizeForDifficulty(difficulty: FutoshikiDifficulty): number {
  return GRID_SIZES[difficulty];
}
