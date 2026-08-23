/**
 * Numberlink (Flow): connect matching number pairs with non-crossing,
 * non-branching paths that together cover... classic rules only require the
 * pairs connect without crossing. Generated via randomized pair placement +
 * path carving on a grid where every cell belongs to at most one path.
 */

export interface NumberlinkPuzzle {
  size: number;
  /** 0 = empty, otherwise pair id (1..pairs) */
  endpoints: number[][];
  solution: number[][];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Carve k disjoint self-avoiding random paths that tile part of an n×n grid,
 * then blank everything and keep only the endpoints as clues.
 */
export function generateNumberlink(size = 7): NumberlinkPuzzle | null {
  const n = Math.max(5, Math.min(12, size));

  for (let attempt = 0; attempt < 80; attempt++) {
    const owner: number[][] = Array.from({ length: n }, () =>
      Array<number>(n).fill(0)
    );
    let pairId = 0;
    let freeCells = n * n;

    // Aim to cover most of the grid with paths of varied length.
    const targetPairs = Math.max(3, Math.floor((n * n) / 9));
    for (let p = 0; p < targetPairs; p++) {
      if (freeCells < 6) break;

      // Random start for a snake-like path.
      const startCandidates: [number, number][] = [];
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (owner[r][c] === 0) startCandidates.push([r, c]);
        }
      }
      if (startCandidates.length === 0) break;

      const [sr, sc] =
        startCandidates[Math.floor(Math.random() * startCandidates.length)];
      pairId++;

      const path: [number, number][] = [[sr, sc]];
      const pathSet = new Set<string>([`${sr},${sc}`]);
      let cr = sr;
      let cc = sc;
      const targetLen = 4 + Math.floor(Math.random() * (n + 2));

      while (path.length < targetLen) {
        const options = shuffle(
          (
            [
              [-1, 0],
              [1, 0],
              [0, -1],
              [0, 1],
            ] as [number, number][]
          ).filter(([dr, dc]) => {
            const nr = cr + dr;
            const nc = cc + dc;
            return (
              nr >= 0 && nr < n && nc >= 0 && nc < n &&
              owner[nr][nc] === 0 &&
              !pathSet.has(`${nr},${nc}`)
            );
          })
        );
        if (options.length === 0) break;
        const [dr, dc] = options[0];
        cr += dr;
        cc += dc;
        path.push([cr, cc]);
        pathSet.add(`${cr},${cc}`);
      }

      if (path.length < 3) {
        pairId--; // abandon this pair
        continue;
      }

      for (const [r, c] of path) {
        owner[r][c] = pairId;
        freeCells--;
      }
    }

    if (pairId < 3 || freeCells > (n * n) / 2) continue;

    // Build puzzle: only endpoints shown.
    const endpoints: number[][] = Array.from({ length: n }, () =>
      Array<number>(n).fill(0)
    );
    for (let id = 1; id <= pairId; id++) {
      const cellsOfPair: [number, number][] = [];
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (owner[r][c] === id) cellsOfPair.push([r, c]);
        }
      }
      // Endpoints = two farthest-apart cells along the path.
      const first = cellsOfPair[0];
      const last = cellsOfPair[cellsOfPair.length - 1];
      endpoints[first[0]][first[1]] = id;
      endpoints[last[0]][last[1]] = id;
    }

    return { size: n, endpoints, solution: owner };
  }
  return null;
}
