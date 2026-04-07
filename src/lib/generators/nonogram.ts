export interface NonogramPuzzle {
  pattern: boolean[][];
  rowClues: number[][];
  colClues: number[][];
  size: number;
}

function computeClues(line: boolean[]): number[] {
  const clues: number[] = [];
  let count = 0;
  for (const cell of line) {
    if (cell) {
      count++;
    } else if (count > 0) {
      clues.push(count);
      count = 0;
    }
  }
  if (count > 0) clues.push(count);
  return clues.length > 0 ? clues : [0];
}

export function generateNonogram(size: number): NonogramPuzzle {
  // Fill density between 40-60% so puzzles are interesting and solvable
  const density = 0.4 + Math.random() * 0.2;

  const pattern: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => Math.random() < density)
  );

  const rowClues: number[][] = pattern.map((row) => computeClues(row));

  const colClues: number[][] = Array.from({ length: size }, (_, c) =>
    computeClues(pattern.map((row) => row[c]))
  );

  return { pattern, rowClues, colClues, size };
}
