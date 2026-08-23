/**
 * Binairo (Takuzu): binary puzzle on an even grid. Rules: equal 0s and 1s
 * per row/column, no three identical in a row, every row (and column) unique.
 */

export interface BinairoPuzzle {
  size: 6 | 8 | 10 | 12;
  /** Puzzle grid; -1 marks empty cells. */
  puzzle: number[][];
  solution: number[][];
}

function validPlacement(
  grid: number[][],
  row: number,
  col: number,
  val: number,
  size: number
): boolean {
  // No three consecutive horizontally
  for (const [a, b] of [
    [col - 2, col - 1],
    [col - 1, col + 1],
    [col + 1, col + 2],
  ]) {
    if (
      a >= 0 &&
      b < size &&
      grid[row][a] === val &&
      grid[row][b] === val
    ) {
      return false;
    }
  }
  // No three consecutive vertically
  for (const [a, b] of [
    [row - 2, row - 1],
    [row - 1, row + 1],
    [row + 1, row + 2],
  ]) {
    if (
      a >= 0 &&
      b < size &&
      grid[a][col] === val &&
      grid[b][col] === val
    ) {
      return false;
    }
  }
  // Row balance: count of `val` must stay within size/2 AFTER placement.
  let rowCount = 0;
  for (let c = 0; c < size; c++) if (grid[row][c] === val) rowCount++;
  if (rowCount >= size / 2) return false;
  // Column balance
  let colCount = 0;
  for (let r = 0; r < size; r++) if (grid[r][col] === val) colCount++;
  if (colCount >= size / 2) return false;

  return true;
}

function rowsComplete(grid: number[][], size: number): boolean {
  for (let r = 0; r < size; r++) {
    if (grid[r].includes(-1)) continue;
    for (let other = 0; other < size; other++) {
      if (other !== r && !grid[other].includes(-1)) {
        if (grid[r].join("") === grid[other].join("")) return false;
      }
    }
  }
  for (let c = 0; c < size; c++) {
    const col = Array.from({ length: size }, (_, r) => grid[r][c]);
    if (col.includes(-1)) continue;
    for (let other = 0; other < size; other++) {
      const otherCol = Array.from({ length: size }, (_, r) => grid[r][other]);
      if (other !== c && !otherCol.includes(-1)) {
        if (col.join("") === otherCol.join("")) return false;
      }
    }
  }
  return true;
}

/** Fill a complete valid Binairo solution via randomized backtracking. */
function fillGrid(grid: number[][], size: number, rng: () => number): boolean {
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === -1) {
        const values = rng() < 0.5 ? [0, 1] : [1, 0];
        for (const v of values) {
          if (validPlacement(grid, row, col, v, size)) {
            grid[row][col] = v;
            if (rowsComplete(grid, size) && fillGrid(grid, size, rng)) return true;
            grid[row][col] = -1;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/** Count solutions up to `limit` under full Binairo rules. */
export function countBinairoSolutions(
  grid: number[][],
  size: number,
  limit = 2
): number {
  let count = 0;

  function solve(g: number[][]): void {
    if (count >= limit) return;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (g[row][col] === -1) {
          for (const v of [0, 1]) {
            if (validPlacement(g, row, col, v, size)) {
              g[row][col] = v;
              solve(g);
              g[row][col] = -1;
            }
          }
          return;
        }
      }
    }
    if (rowsComplete(g, size)) count++;
  }

  solve(grid.map((r) => [...r]));
  return count;
}

export function generateBinairo(size: BinairoPuzzle["size"] = 8, rng: () => number = Math.random): BinairoPuzzle {
  const solution: number[][] = Array.from({ length: size }, () =>
    Array<number>(size).fill(-1)
  );
  fillGrid(solution, size, rng);

  // Remove symmetric cell pairs while the solution stays unique.
  const puzzle = solution.map((r) => [...r]);
  const pairs: [number, number][][] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (r * size + c < ((size - 1 - r) * size + (size - 1 - c))) {
        pairs.push([
          [r, c],
          [size - 1 - r, size - 1 - c],
        ]);
      }
    }
  }
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  for (const [[r1, c1], [r2, c2]] of pairs) {
    const backup = [puzzle[r1][c1], puzzle[r2][c2]];
    puzzle[r1][c1] = -1;
    puzzle[r2][c2] = -1;
    if (countBinairoSolutions(puzzle, size, 2) !== 1) {
      puzzle[r1][c1] = backup[0];
      puzzle[r2][c2] = backup[1];
    }
  }

  return { size, puzzle, solution };
}
