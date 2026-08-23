/**
 * Bingo card generator: classic B-I-N-O 5×5 with column ranges, or a compact
 * 3×3/4×4 variant over a custom range. Includes a call-order list.
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

function shuffled(range: number[]): number[] {
  const a = [...range];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateBingo(
  cardCount = 4,
  size: 3 | 4 | 5 = 5,
  maxNumber = 75
): BingoGame {
  const n = Math.max(1, Math.min(20, cardCount));
  const dim = size;
  const max = Math.max(dim * dim - 1, Math.min(999, maxNumber));

  const cards: BingoCard[] = [];
  for (let c = 0; c < n; c++) {
    const pool = shuffled(Array.from({ length: max }, (_, i) => i + 1));
    let idx = 0;
    const cells: (number | null)[][] = [];
    for (let r = 0; r < dim; r++) {
      const row: (number | null)[] = [];
      for (let col = 0; col < dim; col++) {
        if (dim === 5 && r === 2 && col === 2) {
          row.push(null); // free space
        } else {
          row.push(pool[idx++]);
        }
      }
      cells.push(row);
    }
    cards.push({ cells });
  }

  return { cards, calls: shuffled(Array.from({ length: max }, (_, i) => i + 1)), size: dim };
}
