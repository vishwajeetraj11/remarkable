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

/** Partition the 9×9 grid into contiguous cages via random growth. */
function makeCages(targetSize: number): [number, number][][] {
  const assigned: boolean[][] = Array.from({ length: 9 }, () =>
    Array<boolean>(9).fill(false)
  );
  const cages: [number, number][][] = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (assigned[r][c]) continue;

      const cage: [number, number][] = [[r, c]];
      assigned[r][c] = true;

      while (cage.length < targetSize) {
        // Candidate frontier cells adjacent to the cage.
        const frontier = new Set<string>();
        for (const [cr, cc] of cage) {
          for (const [dr, dc] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ]) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < 9 && nc >= 0 && nc < 9 && !assigned[nr][nc]) {
              frontier.add(`${nr},${nc}`);
            }
          }
        }
        if (frontier.size === 0) break;
        const options = [...frontier].map((key) => {
          const [nr, nc] = key.split(",").map(Number);
          return [nr, nc] as [number, number];
        });
        const pick = options[Math.floor(Math.random() * options.length)];
        assigned[pick[0]][pick[1]] = true;
        cage.push(pick);
      }

      cages.push(cage);
    }
  }
  return cages;
}

/** Solve the killer constraints; returns first solution or null. */
function solveKiller(
  cages: { cells: [number, number][]; sum: number }[],
  findSecond = false
): number[][] | null {
  // cell -> cage index
  const cageOf: number[][] = Array.from({ length: 9 }, () => Array(9).fill(-1));
  cages.forEach((cage, idx) =>
    cage.cells.forEach(([r, c]) => {
      cageOf[r][c] = idx;
    })
  );
  const remaining: number[] = cages.map((c) => c.sum);

  const grid: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));
  let solutions = 0;
  let firstSolution: number[][] | null = null;

  function canPlace(row: number, col: number, v: number): boolean {
    for (let c = 0; c < 9; c++) if (grid[row][c] === v) return false;
    for (let r = 0; r < 9; r++) if (grid[r][col] === v) return false;
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) if (grid[r][c] === v) return false;
    }
    // Cage no-repeat
    const ci = cageOf[row][col];
    for (const [cr, cc] of cages[ci].cells) {
      if ((cr !== row || cc !== col) && grid[cr][cc] === v) return false;
    }
    return true;
  }

  function backtrack(pos: number): void {
    if (!findSecond && solutions > 0) return;
    if (pos === 81) {
      solutions++;
      if (!firstSolution) {
        firstSolution = grid.map((r) => [...r]);
      }
      return;
    }
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    for (let v = 1; v <= 9; v++) {
      if (!canPlace(row, col, v)) continue;
      const ci = cageOf[row][col];
      remaining[ci] -= v;
      // Cage must not overshoot its remaining sum.
      const cellsLeft =
        cages[ci].cells.filter(([r, c]) => grid[r][c] === 0).length - 1;
      const minPossible = remaining[ci] - 9 * Math.max(0, cellsLeft - 1);
      if (remaining[ci] >= 0 && (cellsLeft > 0 || remaining[ci] === 0) && minPossible <= 9) {
        grid[row][col] = v;
        backtrack(pos + 1);
        grid[row][col] = 0;
      }
      remaining[ci] += v;
    }
  }

  backtrack(0);
  return solutions >= (findSecond ? 2 : 1) ? firstSolution : null;
}

export function generateKillerSudoku(
  difficulty: SudokuDifficulty = "medium"
): KillerSudokuPuzzle | null {
  // Larger cages on easier difficulties.
  const targetSizes: Record<SudokuDifficulty, number> = {
    easy: 2,
    medium: 3,
    hard: 3,
    evil: 4,
  };
  const target = targetSizes[difficulty];

  for (let attempt = 0; attempt < 12; attempt++) {
    const { solution } = generateSudoku(difficulty, 9);
    const cagesCells = makeCages(target);
    const cages = cagesCells.map((cells) => ({
      cells,
      sum: cells.reduce((acc, [r, c]) => acc + solution[r][c], 0),
    }));

    // The generated sudoku is one valid fill; verify it's the ONLY one.
    const solved = solveKiller(cages, true);
    if (solved) {
      return { cages, solution, difficulty };
    }
  }
  return null;
}
