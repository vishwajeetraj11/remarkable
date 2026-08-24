/**
 * Bingo card generator: classic B-I-N-G-O 5×5 with true column ranges
 * (B 1-15 … O 61-75) and a free center whenever the pool splits evenly into
 * columns, or a compact 3×3/4×4 variant over a custom range. Includes a
 * call-order list.
 */

export interface BingoCard {
  /** Row-major grid; null marks the free space. */
  cells: (number | null)[][];
}

export interface BingoGame {
  cards: BingoCard[];
  calls: number[];
  size: number;
}

function shuffled(range: number[], rng: () => number): number[] {
  const a = [...range];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Classic BINGO column ranges: split the number pool into `dim` contiguous
 * equal bands (75 balls / 5 columns → B 1-15 … O 61-75). Returns null when
 * the pool does not divide evenly, in which case cards fall back to dealing
 * from one shared shuffled pool.
 */
function columnRangesFor(
  dim: number,
  max: number
): [number, number][] | null {
  if (max % dim !== 0 || max < dim) return null;
  const span = max / dim;
  return Array.from({ length: dim }, (_, i) => [i * span + 1, (i + 1) * span]);
}

export function generateBingo(
  cardCount = 4,
  size: 3 | 4 | 5 = 5,
  maxNumber = 75,
  rng: () => number = Math.random
): BingoGame {
  const n = Math.max(1, Math.min(20, cardCount));
  const dim = size;
  const max = Math.max(dim * dim - 1, Math.min(999, maxNumber));
  const ranges = columnRangesFor(dim, max);

  const cards: BingoCard[] = [];
  for (let c = 0; c < n; c++) {
    // Per-column draws keep every card within the classic BINGO bands.
    const columnPicks: number[][] | null = ranges
      ? ranges.map(([lo, hi]) =>
          shuffled(
            Array.from({ length: hi - lo + 1 }, (_, i) => lo + i),
            rng
          ).slice(0, dim)
        )
      : null;

    let idx = 0;
    const sharedPool = columnPicks
      ? null
      : shuffled(Array.from({ length: max }, (_, i) => i + 1), rng);

    const cells: (number | null)[][] = [];
    for (let r = 0; r < dim; r++) {
      const row: (number | null)[] = [];
      for (let col = 0; col < dim; col++) {
        if (dim === 5 && r === 2 && col === 2) {
          row.push(null); // free space
        } else if (columnPicks && sharedPool === null) {
          row.push(columnPicks[col][r]);
        } else {
          row.push(sharedPool![idx++]);
        }
      }
      cells.push(row);
    }
    cards.push({ cells });
  }

  return { cards, calls: shuffled(Array.from({ length: max }, (_, i) => i + 1), rng), size: dim };
}
