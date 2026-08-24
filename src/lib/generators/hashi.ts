/**
 * Hashiwokakero (Bridges): connect numbered islands with single/double
 * bridges so every island's bridge count is met and the whole network is
 * connected. Bridges never cross.
 */

export interface HashiIsland {
  row: number;
  col: number;
  count: number;
}

export interface HashiPuzzle {
  size: number;
  islands: HashiIsland[];
}

interface Bridge {
  a: number;
  b: number;
  count: 1 | 2;
}

export function generateHashi(size = 8, rng: () => number = Math.random): HashiPuzzle | null {
  const n = Math.max(6, Math.min(14, size));

  for (let attempt = 0; attempt < 60; attempt++) {
    // Scatter islands sparsely.
    const used = new Set<string>();
    const cells: [number, number][] = [];
    const targetIslands = Math.max(5, Math.round((n * n) / 16));
    let guard = 0;
    while (cells.length < targetIslands && guard++ < 500) {
      const r = Math.floor(rng() * n);
      const c = Math.floor(rng() * n);
      if (used.has(`${r},${c}`)) continue;
      cells.push([r, c]);
      used.add(`${r},${c}`);
    }
    if (cells.length < 5) continue;

    const idxOf = new Map<string, number>();
    cells.forEach(([r, c], i) => idxOf.set(`${r},${c}`, i));

    // degree per axis: how many bridges each island has in each direction.
    const degN = new Array(cells.length).fill(0);
    const degS = new Array(cells.length).fill(0);
    const degE = new Array(cells.length).fill(0);
    const degW = new Array(cells.length).fill(0);
    const bridges: Bridge[] = [];

    function segmentsBlocked(a: number, b: number): boolean {
      const [ra, ca] = cells[a];
      const [rb, cb] = cells[b];
      // An island strictly between?
      if (ra === rb) {
        for (let c = Math.min(ca, cb) + 1; c < Math.max(ca, cb); c++) {
          if (idxOf.has(`${ra},${c}`)) return true;
        }
      } else {
        for (let r = Math.min(ra, rb) + 1; r < Math.max(ra, rb); r++) {
          if (idxOf.has(`${r},${ca}`)) return true;
        }
      }
      return false;
    }

    function crossesExisting(a: number, b: number): boolean {
      const [ra, ca] = cells[a];
      const [rb, cb] = cells[b];
      for (const br of bridges) {
        const [r1, c1] = cells[br.a];
        const [r2, c2] = cells[br.b];
        if (ra === rb) {
          // Candidate horizontal; vertical bridges cross it.
          if (r1 !== r2) {
            const col = c1;
            const rowLo = Math.min(r1, r2);
            const rowHi = Math.max(r1, r2);
            const candLo = Math.min(ca, cb);
            const candHi = Math.max(ca, cb);
            if (rowLo < ra && ra < rowHi && candLo < col && col < candHi) {
              return true;
            }
          }
        } else {
          // Candidate vertical; horizontal bridges cross it.
          if (c1 !== c2) {
            const row = r1;
            const colLo = Math.min(c1, c2);
            const colHi = Math.max(c1, c2);
            const vRowLo = Math.min(ra, rb);
            const vRowHi = Math.max(ra, rb);
            if (vRowLo < row && row < vRowHi && colLo < ca && ca < colHi) {
              return true;
            }
          }
        }
      }
      return false;
    }

    function remainingCapacity(i: number): number {
      return 8 - (degN[i] + degS[i] + degE[i] + degW[i]);
    }

    // Grow a connected random graph.
    const parent = cells.map((_, i) => i);
    function find(x: number): number {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    }

    let tries = 0;
    while (tries++ < 800) {
      const a = Math.floor(rng() * cells.length);
      const b = Math.floor(rng() * cells.length);
      if (a === b || !cells[a] || !cells[b]) continue;

      const [ra, ca] = cells[a];
      const [rb, cb] = cells[b];
      const aligned = ra === rb || ca === cb;
      if (!aligned) continue;
      if (remainingCapacity(a) <= 0 || remainingCapacity(b) <= 0) continue;
      if (segmentsBlocked(a, b)) continue;
      if (crossesExisting(a, b)) continue;

      const existing = bridges.find(
        (br) =>
          (br.a === Math.min(a, b) && br.b === Math.max(a, b)) ||
          (br.a === Math.max(a, b) && br.b === Math.min(a, b))
      );

      if (existing) {
        if (existing.count >= 2) continue;
        existing.count = 2 as 1 | 2;
      } else {
        bridges.push({ a: Math.min(a, b), b: Math.max(a, b), count: 1 });
      }

      if (ra === rb) {
        if (cb > ca) {
          degE[a]++;
          degW[b]++;
        } else {
          degW[a]++;
          degE[b]++;
        }
      } else {
        if (rb > ra) {
          degS[a]++;
          degN[b]++;
        } else {
          degN[a]++;
          degS[b]++;
        }
      }

      const rootA = find(a);
      const rootB = find(b);
      if (rootA !== rootB) parent[rootA] = rootB;
      if (new Set(cells.map((_, i) => find(i))).size === 1 && tries > 40) break;
    }

    if (new Set(cells.map((_, i) => find(i))).size !== 1) continue;

    const counts = cells.map((_, i) => degN[i] + degS[i] + degE[i] + degW[i]);
    if (counts.some((c) => c === 0)) continue;

    return {
      size: n,
      islands: cells.map(([row, col], i) => ({ row, col, count: counts[i] })),
    };
  }
  return null;
}
