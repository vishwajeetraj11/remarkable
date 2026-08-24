/**
 * Killer sudoku: sudoku grid partitioned into cages; only cage sums are
 * given (no starting digits). Larger cages = harder. Uniqueness is verified
 * with a backtracking killer solver.
 */

import { generateSudoku, type SudokuDifficulty } from "./sudoku";

export interface KillerCage {
  /** Cell coordinates in reading order along the cage path. */
  cells: [number, number][];
  sum: number;
}

export interface KillerSudokuPuzzle {
  cages: KillerCage[];
  solution: number[][];
  difficulty: SudokuDifficulty;
}

/**
 * Build cages by greedy coalescing: start from 81 single-cell cages
 * (trivially unique — the full solution is given) and repeatedly merge two
 * adjacent cages whenever the result stays uniquely solvable and respects
 * the per-cage digit-uniqueness convention. Uniqueness is therefore
 * preserved by construction; difficulty only caps cage size.
 */
function coalesceCages(
  solution: number[][],
  maxTarget: number,
  rng: () => number
): { cells: [number, number][]; sum: number }[] {
  const cageOf: number[][] = Array.from({ length: 9 }, (_, r) =>
    Array.from({ length: 9 }, (_, c) => r * 9 + c)
  );
  const cellsOf: Map<number, [number, number][]> = new Map();
  const digitsOf: Map<number, Set<number>> = new Map();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const id = r * 9 + c;
      cellsOf.set(id, [[r, c]]);
      digitsOf.set(id, new Set([solution[r][c]]));
    }
  }

  const NEIGHBORS = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ] as const;

  const mergeableIds = (): number[] => {
    const ids: number[] = [];
    for (const [id, cells] of cellsOf) {
      if (cells.length >= maxTarget) continue;
      for (const [r, c] of cells) {
        for (const [dr, dc] of NEIGHBORS) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9 && cageOf[nr][nc] !== id) {
            ids.push(id);
            break;
          }
        }
        if (ids[ids.length - 1] === id) break;
      }
    }
    return ids;
  };

  let failures = 0;
  while (failures < 60) {
    const candidates = mergeableIds();
    if (candidates.length === 0) break;

    const idA = candidates[Math.floor(rng() * candidates.length)];
    // Pick a random neighbouring foreign cage.
    const foreign: number[] = [];
    for (const [r, c] of cellsOf.get(idA)!) {
      for (const [dr, dc] of NEIGHBORS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9 && cageOf[nr][nc] !== idA) {
          foreign.push(cageOf[nr][nc]);
        }
      }
    }
    const idB = foreign[Math.floor(rng() * foreign.length)];

    const cellsA = cellsOf.get(idA)!;
    const cellsB = cellsOf.get(idB)!;
    if (cellsA.length + cellsB.length > maxTarget) {
      failures++;
      continue;
    }
    // Convention: no repeated digit within a cage.
    let disjoint = true;
    for (const d of digitsOf.get(idB)!) {
      if (digitsOf.get(idA)!.has(d)) {
        disjoint = false;
        break;
      }
    }
    if (!disjoint) {
      failures++;
      continue;
    }

    // Trial merge; keep only if still uniquely solvable.
    const mergedCells = [...cellsA, ...cellsB];
    const mergedSum =
      mergedCells.reduce((acc, [r, c]) => acc + solution[r][c], 0);
    const trial: { cells: [number, number][]; sum: number }[] = [];
    for (const [id, cells] of cellsOf) {
      if (id === idA) trial.push({ cells: mergedCells, sum: mergedSum });
      else if (id !== idB) trial.push({ cells, sum: cells.reduce((a, [r, c]) => a + solution[r][c], 0) });
    }
    // Trial merge; keep only if still uniquely solvable. The reduced node
    // budget makes hopeless trials bail out fast — a budget trip reads as
    // "not unique", which simply rejects the merge.
    if (countKillerSolutions(trial, 2, 150_000) !== 1) {
      failures++;
      continue;
    }

    // Commit merge.
    for (const [r, c] of cellsB) cageOf[r][c] = idA;
    cellsOf.set(idA, mergedCells);
    const digits = new Set(digitsOf.get(idA)!);
    for (const d of digitsOf.get(idB)!) digits.add(d);
    digitsOf.set(idA, digits);
    cellsOf.delete(idB);
    digitsOf.delete(idB);
    failures = 0;
  }

  return [...cellsOf.values()].map((cells) => ({
    cells,
    sum: cells.reduce((acc, [r, c]) => acc + solution[r][c], 0),
  }));
}

export function generateKillerSudoku(
  difficulty: SudokuDifficulty = "medium",
  rng: () => number = Math.random
): KillerSudokuPuzzle | null {
  // Larger cages on easier difficulties mean FEWER constraints... in killer
  // sudoku it is the reverse of classic sudoku: small cages pin digits down
  // (easier), large cages force sum-based deduction (harder).
  const targetSizes: Record<SudokuDifficulty, number> = {
    easy: 2,
    medium: 3,
    hard: 3,
    evil: 4,
  };
  const target = targetSizes[difficulty];

  const { solution } = generateSudoku(difficulty, 9, rng);
  const cages = coalesceCages(solution, target, rng);

  return { cages, solution, difficulty };
}

/**
 * Count killer solutions, stopping as soon as `limit` is reached.
 * Uniqueness checks use limit 2 and require the result to be exactly 1.
 *
 * Cells are visited cage by cage rather than in reading order: finishing
 * each cage early lets the sum constraint prune immediately and keeps the
 * search polynomial-ish in practice (reading-order search explodes
 * exponentially on some cage layouts). A node budget guards against
 * pathological instances — callers treat anything !== 1 as "not unique".
 *
 * Exported so corpus tests can independently verify published puzzles.
 */
export function countKillerSolutions(
  cages: { cells: [number, number][]; sum: number }[],
  limit = 2,
  nodeBudget = 400_000
): number {
  // cell -> cage index
  const cageOf: number[][] = Array.from({ length: 9 }, () => Array(9).fill(-1));
  cages.forEach((cage, idx) =>
    cage.cells.forEach(([r, c]) => {
      cageOf[r][c] = idx;
    })
  );

  const grid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
  const remaining: number[] = cages.map((c) => c.sum);
  const unfilled: number[] = cages.map((c) => c.cells.length);
  let solutions = 0;
  let nodes = 0;

  function canPlace(row: number, col: number, v: number): boolean {
    for (let c = 0; c < 9; c++) if (grid[row][c] === v) return false;
    for (let r = 0; r < 9; r++) if (grid[r][col] === v) return false;
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) if (grid[r][c] === v) return false;
    }
    const ci = cageOf[row][col];
    for (const [cr, cc] of cages[ci].cells) {
      if ((cr !== row || cc !== col) && grid[cr][cc] === v) return false;
    }
    return true;
  }

  function backtrack(cageIdx: number, cellIdx: number): void {
    if (solutions >= limit) return;
    if (++nodes > nodeBudget) {
      // Budget exhausted: signal "effectively ambiguous" so callers reject.
      solutions = limit + 1;
      return;
    }
    if (cageIdx >= cages.length) {
      solutions++;
      return;
    }
    const [row, col] = cages[cageIdx].cells[cellIdx];
    const nextCell = cellIdx + 1;
    const nextCage = nextCell >= cages[cageIdx].cells.length ? cageIdx + 1 : cageIdx;

    for (let v = 1; v <= 9; v++) {
      if (!canPlace(row, col, v)) continue;
      remaining[cageIdx] -= v;
      unfilled[cageIdx]--;
      const left = unfilled[cageIdx];
      // Sum must stay reachable: every outstanding cell needs 1..9.
      if (
        remaining[cageIdx] >= left &&
        remaining[cageIdx] <= 9 * left &&
        (left > 0 || remaining[cageIdx] === 0)
      ) {
        grid[row][col] = v;
        backtrack(nextCage, nextCage === cageIdx ? nextCell : 0);
        grid[row][col] = 0;
        if (solutions >= limit) {
          remaining[cageIdx] += v;
          unfilled[cageIdx]++;
          return;
        }
      }
      remaining[cageIdx] += v;
      unfilled[cageIdx]++;
    }
  }

  backtrack(0, 0);
  return solutions;
}

