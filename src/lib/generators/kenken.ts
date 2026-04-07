import { shuffleArray } from "@/lib/pdf-constants";

export type KenKenDifficulty = 'easy' | 'medium' | 'hard';

export interface Cage {
  cells: [number, number][];
  target: number;
  operation: '+' | '-' | '×' | '÷';
}

export interface KenKenPuzzle {
  solution: number[][];
  cages: Cage[];
  size: number;
}

const GRID_SIZES: Record<KenKenDifficulty, number> = {
  easy: 4,
  medium: 5,
  hard: 6,
};

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

function getAdjacentCells(row: number, col: number, n: number): [number, number][] {
  const adj: [number, number][] = [];
  if (row > 0) adj.push([row - 1, col]);
  if (row < n - 1) adj.push([row + 1, col]);
  if (col > 0) adj.push([row, col - 1]);
  if (col < n - 1) adj.push([row, col + 1]);
  return adj;
}

function partitionIntoCages(n: number): [number, number][][] {
  const assigned: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));
  const cages: [number, number][][] = [];

  const cells = shuffleArray(
    Array.from({ length: n * n }, (_, i): [number, number] => [Math.floor(i / n), i % n])
  );

  for (const [row, col] of cells) {
    if (assigned[row][col]) continue;

    const cage: [number, number][] = [[row, col]];
    assigned[row][col] = true;

    const targetSize = Math.random() < 0.1 ? 1 : Math.random() < 0.55 ? 2 : 3;

    while (cage.length < targetSize) {
      const candidates: [number, number][] = [];
      for (const [cr, cc] of cage) {
        for (const [nr, nc] of getAdjacentCells(cr, cc, n)) {
          if (!assigned[nr][nc] && !candidates.some(([r, c]) => r === nr && c === nc)) {
            candidates.push([nr, nc]);
          }
        }
      }
      if (candidates.length === 0) break;
      const next = candidates[Math.floor(Math.random() * candidates.length)];
      cage.push(next);
      assigned[next[0]][next[1]] = true;
    }

    cages.push(cage);
  }

  return cages;
}

function chooseCageOperation(values: number[]): { target: number; operation: '+' | '-' | '×' | '÷' } {
  if (values.length === 1) {
    return { target: values[0], operation: '+' };
  }

  if (values.length === 2) {
    const [a, b] = values;
    const options: { target: number; operation: '+' | '-' | '×' | '÷' }[] = [
      { target: a + b, operation: '+' },
      { target: Math.abs(a - b), operation: '-' },
      { target: a * b, operation: '×' },
    ];
    const [big, small] = a >= b ? [a, b] : [b, a];
    if (small !== 0 && big % small === 0) {
      options.push({ target: big / small, operation: '÷' });
    }
    return options[Math.floor(Math.random() * options.length)];
  }

  if (Math.random() < 0.5) {
    return { target: values.reduce((s, v) => s + v, 0), operation: '+' };
  }
  return { target: values.reduce((p, v) => p * v, 1), operation: '×' };
}

export function generateKenKen(difficulty: KenKenDifficulty): KenKenPuzzle {
  const size = GRID_SIZES[difficulty];
  const solution = generateLatinSquare(size);
  const cellGroups = partitionIntoCages(size);

  const cages: Cage[] = cellGroups.map((cells) => {
    const values = cells.map(([r, c]) => solution[r][c]);
    const { target, operation } = chooseCageOperation(values);
    return { cells, target, operation };
  });

  return { solution, cages, size };
}
