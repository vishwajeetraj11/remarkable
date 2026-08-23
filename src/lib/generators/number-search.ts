/**
 * Number search — like a word search, but the hidden items are number
 * sequences read left-to-right only in the final grid (classic magazine
 * format). Sequences never overlap, so finding them stays fair.
 */

export interface NumberSearchPuzzle {
  grid: string[][];
  targets: string[];
  size: number;
}

const DIGITS = "0123456789";

function randomDigit(rng: () => number): string {
  return DIGITS[Math.floor(rng() * DIGITS.length)];
}

export function generateNumberSearch(
  size: number,
  count: number,
  lengthRange: [number, number] = [3, 5],
  rng: () => number = Math.random
): NumberSearchPuzzle {
  const n = Math.max(8, Math.min(20, size));
  const [minLen, maxLen] = [
    Math.max(2, lengthRange[0]),
    Math.min(lengthRange[1], n),
  ];

  // Horizontal-only placement keeps the puzzle readable (standard format).
  const grid: string[][] = Array.from({ length: n }, () =>
    Array<string>(n).fill("")
  );
  const targets: string[] = [];
  const occupied: Set<string> = new Set();

  const maxAttempts = count * 60;
  for (let attempt = 0; attempt < maxAttempts && targets.length < count; attempt++) {
    const len = minLen + Math.floor(rng() * (maxLen - minLen + 1));
    let seq = "";
    for (let i = 0; i < len; i++) {
      seq += i === 0 ? String(1 + Math.floor(rng() * 9)) : randomDigit(rng);
    }
    if (targets.includes(seq)) continue;

    const row = Math.floor(rng() * n);
    const col = Math.floor(rng() * (n - len + 1));

    let free = true;
    for (let c = col; c < col + len; c++) {
      if (grid[row][c] !== "" || occupied.has(`${row},${c}`)) {
        free = false;
        break;
      }
    }
    if (!free) continue;

    for (let c = col; c < col + len; c++) {
      grid[row][c] = seq[c - col];
      occupied.add(`${row},${c}`);
    }
    targets.push(seq);
  }

  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === "") grid[r][c] = randomDigit(rng);
    }
  }

  return { grid, targets, size: n };
}
