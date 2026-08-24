/**
 * Number search — like a word search, but the hidden items are number
 * sequences read left-to-right only in the final grid (classic magazine
 * format). Sequences never overlap, every target appears EXACTLY once
 * (filler digits can never complete an accidental extra occurrence), and
 * placements are returned so answer keys can highlight the sequences.
 */

export interface NumberSearchPuzzle {
  grid: string[][];
  targets: string[];
  size: number;
  /** Where each target was placed (row, col = first digit). */
  placements: { target: string; row: number; col: number }[];
}

const DIGITS = "0123456789";

function randomDigit(rng: () => number): string {
  return DIGITS[Math.floor(rng() * DIGITS.length)];
}

/** Count left-to-right occurrences of `seq` across all grid rows. */
function countOccurrences(grid: string[][], seq: string): number {
  let count = 0;
  for (const row of grid) {
    const line = row.join("");
    let idx = line.indexOf(seq);
    while (idx !== -1) {
      count++;
      idx = line.indexOf(seq, idx + 1);
    }
  }
  return count;
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
  // Each attempt regenerates everything so uniqueness is never compromised.
  const maxAttempts = 300;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const grid: string[][] = Array.from({ length: n }, () =>
      Array<string>(n).fill("")
    );
    const targets: string[] = [];
    const placements: { target: string; row: number; col: number }[] = [];
    const occupied: Set<string> = new Set();

    const placementAttempts = count * 60;
    for (
      let attempt2 = 0;
      attempt2 < placementAttempts && targets.length < count;
      attempt2++
    ) {
      const len = minLen + Math.floor(rng() * (maxLen - minLen + 1));
      let seq = "";
      for (let i = 0; i < len; i++) {
        seq += i === 0 ? String(1 + Math.floor(rng() * 9)) : randomDigit(rng);
      }
      if (targets.includes(seq)) continue;
      // A target containing another target (or contained by one) would make
      // the shorter one appear twice in the grid.
      if (targets.some((t) => t.includes(seq) || seq.includes(t))) continue;

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
      placements.push({ target: seq, row, col });
    }

    if (targets.length < count) continue;

    // Fill remaining cells. Each filler digit must not complete a new
    // occurrence of any target ending at that cell (sequences read
    // left-to-right only, so only windows ending here matter).
    let valid = true;
    for (let r = 0; r < n && valid; r++) {
      for (let c = 0; c < n && valid; c++) {
        if (grid[r][c] !== "") continue;
        const prefix = grid[r].slice(0, c).join("");
        let placedDigit: string | null = null;
        for (const d of DIGITS) {
          const candidate = prefix + d;
          const createsDuplicate = targets.some((t) =>
            candidate.endsWith(t)
          );
          if (!createsDuplicate) {
            placedDigit = d;
            break;
          }
        }
        if (placedDigit === null) {
          // Every digit completes some target — regenerate from scratch.
          valid = false;
          break;
        }
        grid[r][c] = placedDigit;
      }
    }

    if (!valid) continue;

    // Final guarantee: each target appears exactly once in the finished grid.
    if (targets.every((t) => countOccurrences(grid, t) === 1)) {
      return { grid, targets, size: n, placements };
    }
  }

  throw new Error(
    "generateNumberSearch could not build a unique-target grid — reduce the sequence count or enlarge the grid"
  );
}
