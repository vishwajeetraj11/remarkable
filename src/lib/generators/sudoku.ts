import { shuffleArray } from "@/lib/pdf-constants";

export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'evil';

/** Supported grid sizes. Each size N uses boxes of boxW × boxH cells. */
export type SudokuGridSize = 4 | 6 | 9 | 12;

export interface SudokuPuzzle {
  size: SudokuGridSize;
  puzzle: number[][];
  solution: number[][];
}

// Box dimensions [boxWidth, boxHeight] per grid size. boxW * boxH === size.
const BOX_DIMS: Record<SudokuGridSize, { boxW: number; boxH: number }> = {
  4: { boxW: 2, boxH: 2 },
  6: { boxW: 3, boxH: 2 },
  9: { boxW: 3, boxH: 3 },
  12: { boxW: 4, boxH: 3 },
};

// Clue counts for the classic 9×9 grid (preserves historical difficulty feel).
const NINE_BY_NINE_CLUES: Record<SudokuDifficulty, number> = {
  easy: 35,
  medium: 28,
  hard: 22,
  evil: 17,
};

// Clue density (fraction of total cells) used to derive targets for the other
// grid sizes, anchored to the 9×9 counts above.
const CLUE_DENSITY: Record<SudokuDifficulty, number> = {
  easy: 35 / 81,
  medium: 28 / 81,
  hard: 22 / 81,
  evil: 17 / 81,
};

function clueTarget(size: SudokuGridSize, difficulty: SudokuDifficulty): number {
  if (size === 9) return NINE_BY_NINE_CLUES[difficulty];
  return Math.max(4, Math.round(size * size * CLUE_DENSITY[difficulty]));
}

/** Number of starting clues a puzzle of `size` will aim for at `difficulty`. */
export function cluesForDifficulty(
  size: SudokuGridSize,
  difficulty: SudokuDifficulty
): number {
  return clueTarget(size, difficulty);
}

function createEmptyGrid(size: number): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

function isValid(
  grid: number[][],
  row: number,
  col: number,
  num: number,
  boxW: number,
  boxH: number
): boolean {
  // Check row
  for (let c = 0; c < grid.length; c++) {
    if (grid[row][c] === num) return false;
  }
  // Check column
  for (let r = 0; r < grid.length; r++) {
    if (grid[r][col] === num) return false;
  }
  // Check box
  const boxRow = Math.floor(row / boxH) * boxH;
  const boxCol = Math.floor(col / boxW) * boxW;
  for (let r = 0; r < boxH; r++) {
    for (let c = 0; c < boxW; c++) {
      if (grid[boxRow + r][boxCol + c] === num) return false;
    }
  }
  return true;
}

function fillGrid(grid: number[][], boxW: number, boxH: number): boolean {
  const size = grid.length;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffleArray(
          Array.from({ length: size }, (_, i) => i + 1)
        );
        for (const num of nums) {
          if (isValid(grid, row, col, num, boxW, boxH)) {
            grid[row][col] = num;
            if (fillGrid(grid, boxW, boxH)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function copyGrid(grid: number[][]): number[][] {
  return grid.map(row => [...row]);
}

/**
 * Count solutions (stops early after finding `limit`, for unique-solution checks).
 */
function countSolutions(
  grid: number[][],
  boxW: number,
  boxH: number,
  limit = 2,
  deadline = Number.POSITIVE_INFINITY,
): number {
  let count = 0;
  const size = grid.length;

  function solve(g: number[][]): boolean {
    if (Date.now() > deadline) return true;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (g[row][col] === 0) {
          for (let num = 1; num <= size; num++) {
            if (isValid(g, row, col, num, boxW, boxH)) {
              g[row][col] = num;
              if (solve(g)) {
                g[row][col] = 0;
                return true;
              }
              g[row][col] = 0;
            }
          }
          return false; // no valid number, backtrack
        }
      }
    }
    // All cells filled: found a solution
    count++;
    return count >= limit;
  }

  solve(copyGrid(grid));
  return count;
}

// Uniqueness checking is the expensive part of generation (a full solution
// count per removal attempt). Budget it per puzzle so large grids and low-clue
// difficulties can never stall a download.
const UNIQUENESS_BUDGET_MS = 900;

function removeClues(
  solution: number[][],
  targetClues: number,
  boxW: number,
  boxH: number,
  checkUniqueness: boolean
): number[][] {
  const puzzle = copyGrid(solution);
  const size = solution.length;
  const cells = shuffleArray(Array.from({ length: size * size }, (_, i) => i));

  let filledCells = size * size;
  const deadline = Date.now() + UNIQUENESS_BUDGET_MS;

  for (const cellIndex of cells) {
    if (filledCells <= targetClues) break;
    // Out of budget: keep the puzzle as-is. It is still valid and solvable;
    // uniqueness just isn't guaranteed beyond this point.
    if (checkUniqueness && Date.now() > deadline) break;

    const row = Math.floor(cellIndex / size);
    const col = cellIndex % size;

    if (puzzle[row][col] === 0) continue;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    filledCells--;

    if (checkUniqueness) {
      const solutions = countSolutions(puzzle, boxW, boxH, 2, deadline);
      if (solutions !== 1) {
        // Restore — removing this cell breaks uniqueness
        puzzle[row][col] = backup;
        filledCells++;
      }
    }
  }

  return puzzle;
}

export function generateSudoku(
  difficulty: SudokuDifficulty,
  size: SudokuGridSize = 9
): SudokuPuzzle {
  const { boxW, boxH } = BOX_DIMS[size];
  const solution = createEmptyGrid(size);
  fillGrid(solution, boxW, boxH);

  const targetClues = clueTarget(size, difficulty);
  // Evil puzzles already skip the uniqueness guarantee on 9×9 (same as before
  // this file supported multiple sizes). 12×12 grids skip it at every
  // difficulty: a full solution-count per removal is far too slow there.
  const checkUniqueness = difficulty !== "evil" && size < 12;
  const puzzle = removeClues(solution, targetClues, boxW, boxH, checkUniqueness);

  return { size, puzzle, solution };
}

export function boxDimensions(size: SudokuGridSize): { boxW: number; boxH: number } {
  return BOX_DIMS[size];
}
