export interface NumberFillPuzzle {
  grid: (number | null)[][]; // null = black cell, number = digit
  numbers: number[]; // list of numbers to place (what the solver sees)
  size: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function runsValid(black: boolean[][], size: number): boolean {
  for (let r = 0; r < size; r++) {
    let len = 0;
    for (let c = 0; c <= size; c++) {
      if (c < size && !black[r][c]) {
        len++;
      } else {
        if (len > 0 && len < 3) return false;
        len = 0;
      }
    }
  }
  for (let c = 0; c < size; c++) {
    let len = 0;
    for (let r = 0; r <= size; r++) {
      if (r < size && !black[r][c]) {
        len++;
      } else {
        if (len > 0 && len < 3) return false;
        len = 0;
      }
    }
  }
  return true;
}

interface RunStats {
  total: number;
  distinctLengths: number;
  maxLength: number;
}

function analyzeRuns(black: boolean[][], size: number): RunStats {
  const counts = new Map<number, number>();

  const record = (len: number) => {
    if (len >= 3) counts.set(len, (counts.get(len) || 0) + 1);
  };

  for (let r = 0; r < size; r++) {
    let len = 0;
    for (let c = 0; c <= size; c++) {
      if (c < size && !black[r][c]) len++;
      else { record(len); len = 0; }
    }
  }
  for (let c = 0; c < size; c++) {
    let len = 0;
    for (let r = 0; r <= size; r++) {
      if (r < size && !black[r][c]) len++;
      else { record(len); len = 0; }
    }
  }

  return {
    total: [...counts.values()].reduce((a, b) => a + b, 0),
    distinctLengths: counts.size,
    maxLength: counts.size > 0 ? Math.max(...counts.keys()) : 0,
  };
}

function buildPattern(size: number): boolean[][] {
  let bestPattern: boolean[][] | null = null;
  let bestScore = -Infinity;

  for (let attempt = 0; attempt < 100; attempt++) {
    const black: boolean[][] = Array.from({ length: size }, () =>
      Array(size).fill(false)
    );

    const candidates: [number, number][] = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (r * size + c <= (size - 1 - r) * size + (size - 1 - c)) {
          candidates.push([r, c]);
        }
      }
    }

    const shuffled = shuffle(candidates);
    let placed = 0;
    const target = Math.floor(size * size * 0.28);

    for (const [r, c] of shuffled) {
      if (placed >= target) break;
      const sr = size - 1 - r;
      const sc = size - 1 - c;

      black[r][c] = true;
      if (r !== sr || c !== sc) black[sr][sc] = true;

      if (!runsValid(black, size)) {
        black[r][c] = false;
        if (r !== sr || c !== sc) black[sr][sc] = false;
      } else {
        placed += r === sr && c === sc ? 1 : 2;
      }
    }

    if (placed < 15) continue;

    const stats = analyzeRuns(black, size);
    if (stats.total < 20 || stats.distinctLengths < 3) continue;

    const score =
      stats.total * 2 + stats.distinctLengths * 10 - stats.maxLength * 3;

    if (score > bestScore) {
      bestScore = score;
      bestPattern = black.map((row) => [...row]);
      if (stats.total >= 30 && stats.distinctLengths >= 4 && stats.maxLength <= 8)
        break;
    }
  }

  return bestPattern || fallbackPattern(size);
}

function fallbackPattern(size: number): boolean[][] {
  const black: boolean[][] = Array.from({ length: size }, () =>
    Array(size).fill(false)
  );
  // Verified 13×13 symmetric pattern — all runs ≥ 3
  const cells: [number, number][] = [
    [0, 4], [0, 8], [1, 4], [1, 8],
    [3, 0], [3, 6], [3, 12],
    [4, 3], [4, 9],
    [6, 4], [6, 8],
    [8, 3], [8, 9],
    [9, 0], [9, 6], [9, 12],
    [11, 4], [11, 8], [12, 4], [12, 8],
  ];
  for (const [r, c] of cells) black[r][c] = true;
  return black;
}

function extractNumbers(
  grid: (number | null)[][],
  size: number
): number[] {
  const numbers: number[] = [];

  const collect = (digits: number[]) => {
    if (digits.length >= 3) {
      numbers.push(digits.reduce((acc, d) => acc * 10 + d, 0));
    }
  };

  for (let r = 0; r < size; r++) {
    let digits: number[] = [];
    for (let c = 0; c < size; c++) {
      const v = grid[r][c];
      if (v !== null) digits.push(v);
      else { collect(digits); digits = []; }
    }
    collect(digits);
  }

  for (let c = 0; c < size; c++) {
    let digits: number[] = [];
    for (let r = 0; r < size; r++) {
      const v = grid[r][c];
      if (v !== null) digits.push(v);
      else { collect(digits); digits = []; }
    }
    collect(digits);
  }

  return numbers;
}

function fillGrid(
  black: boolean[][],
  size: number
): (number | null)[][] {
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c) => {
      if (black[r][c]) return null;
      const hStart = c === 0 || black[r][c - 1];
      const vStart = r === 0 || black[r - 1][c];
      return hStart || vStart
        ? 1 + Math.floor(Math.random() * 9)
        : Math.floor(Math.random() * 10);
    })
  );
}

export function generateNumberFill(): NumberFillPuzzle {
  const size = 13;
  const black = buildPattern(size);

  for (let attempt = 0; attempt < 150; attempt++) {
    const grid = fillGrid(black, size);
    const numbers = extractNumbers(grid, size);

    if (new Set(numbers).size === numbers.length) {
      numbers.sort((a, b) => {
        const ld = String(a).length - String(b).length;
        return ld !== 0 ? ld : a - b;
      });
      return { grid, numbers, size };
    }
  }

  const grid = fillGrid(black, size);
  const numbers = extractNumbers(grid, size);
  numbers.sort((a, b) => {
    const ld = String(a).length - String(b).length;
    return ld !== 0 ? ld : a - b;
  });
  return { grid, numbers, size };
}
