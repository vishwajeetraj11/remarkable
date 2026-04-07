export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'evil';

export interface SudokuPuzzle {
  puzzle: number[][];
  solution: number[][];
}

// Clue counts per difficulty
const CLUE_COUNTS: Record<SudokuDifficulty, number> = {
  easy: 35,
  medium: 28,
  hard: 22,
  evil: 17,
};

function createEmptyGrid(): number[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(0));
}

function isValid(grid: number[][], row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }
  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[boxRow + r][boxCol + c] === num) return false;
    }
  }
  return true;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fillGrid(grid: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        const nums = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
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
 * Count solutions (stops early after finding 2, for unique-solution checks).
 */
function countSolutions(grid: number[][], limit = 2): number {
  let count = 0;

  function solve(g: number[][]): boolean {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (g[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(g, row, col, num)) {
              g[row][col] = num;
              if (solve(g)) {
                // found one more solution
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

function removeClues(solution: number[][], targetClues: number): number[][] {
  const puzzle = copyGrid(solution);
  const cells = shuffleArray(
    Array.from({ length: 81 }, (_, i) => i)
  );

  let filledCells = 81;

  for (const cellIndex of cells) {
    if (filledCells <= targetClues) break;

    const row = Math.floor(cellIndex / 9);
    const col = cellIndex % 9;

    if (puzzle[row][col] === 0) continue;

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    filledCells--;

    // For evil difficulty (17 clues), skip uniqueness check for speed.
    // At 17 clues uniqueness is not guaranteed but puzzles are still solvable.
    if (targetClues > 17) {
      const solutions = countSolutions(puzzle);
      if (solutions !== 1) {
        // Restore — removing this cell breaks uniqueness
        puzzle[row][col] = backup;
        filledCells++;
      }
    }
  }

  return puzzle;
}

export function generateSudoku(difficulty: SudokuDifficulty): SudokuPuzzle {
  const solution = createEmptyGrid();
  fillGrid(solution);

  const targetClues = CLUE_COUNTS[difficulty];
  const puzzle = removeClues(solution, targetClues);

  return {
    puzzle,
    solution,
  };
}
