/**
 * Hashiwokakero (Bridges): connect numbered islands with single/double
 * bridges so every island's bridge count is met and the whole network is
 * connected. Bridges never cross.
 *
 * Puzzles are published only when a solver confirms the island counts admit
 * EXACTLY one bridge layout; the solved bridges ship with the puzzle so the
 * PDF can print an answer page.
 */

export interface HashiIsland {
  row: number;
  col: number;
  count: number;
}

/** a/b index into HashiPuzzle.islands; count = number of parallel bridges. */
export interface HashiBridge {
  a: number;
  b: number;
  count: 1 | 2;
}

export interface HashiPuzzle {
  size: number;
  islands: HashiIsland[];
  /** Solved layout — uniquely determined by the island counts. */
  bridges: HashiBridge[];
}

interface Slot {
  a: number;
  b: number;
  /** Bridges placed on this slot during search. */
  used: 0 | 1 | 2;
}

/**
 * Count distinct valid bridge layouts for the given island counts, stopping
 * at `limit`. A node budget bails out of pathological instances (treated as
 * "more than one"). Exported for corpus verification.
 */
export function countHashiSolutions(
  islands: { row: number; col: number; count: number }[],
  limit = 2,
  nodeBudget = 300_000
): number {
  const nIslands = islands.length;
  if (nIslands === 0) return 0;

  // Visible neighbour slots: nearest aligned island with clear line of sight.
  const byRow = new Map<number, number[]>();
  const byCol = new Map<number, number[]>();
  islands.forEach((isl, i) => {
    if (!byRow.has(isl.row)) byRow.set(isl.row, []);
    if (!byCol.has(isl.col)) byCol.set(isl.col, []);
    byRow.get(isl.row)!.push(i);
    byCol.get(isl.col)!.push(i);
  });

  const slotOf = new Map<string, number>();
  const slots: Slot[] = [];
  // Slots per island: up to one per direction.
  const dirSlot: number[][] = Array.from({ length: nIslands }, () =>
    Array(4).fill(-1)
  ); // 0=N 1=S 2=E 3=W

  function connectAligned(indices: number[], axis: "row" | "col"): void {
    const sorted = [...indices].sort((x, y) =>
      axis === "row" ? islands[x].col - islands[y].col : islands[x].row - islands[y].row
    );
    for (let k = 0; k < sorted.length - 1; k++) {
      const a = sorted[k];
      const b = sorted[k + 1];
      const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
      if (slotOf.has(key)) continue;
      const idx = slots.length;
      slots.push({ a: Math.min(a, b), b: Math.max(a, b), used: 0 });
      slotOf.set(key, idx);
      if (axis === "row") {
        dirSlot[a][3] = idx; // W
        dirSlot[b][2] = idx; // E
      } else {
        dirSlot[a][0] = idx; // N
        dirSlot[b][1] = idx; // S
      }
    }
  }

  for (const idxs of byRow.values()) connectAligned(idxs, "row");
  for (const idxs of byCol.values()) connectAligned(idxs, "col");

  const remaining = islands.map((i) => i.count);
  let bestOpenSlots: number[] = [];
  let solutions = 0;
  let nodes = 0;

  function connectedAll(): boolean {
    const parent = Array.from({ length: nIslands }, (_, i) => i);
    const find = (x: number): number => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    };
    for (const s of slots) {
      if (s.used === 0) continue;
      const ra = find(s.a);
      const rb = find(s.b);
      if (ra !== rb) parent[ra] = rb;
    }
    const root = find(0);
    for (let i = 1; i < nIslands; i++) if (find(i) !== root) return false;
    return true;
  }

  function solve(): void {
    if (solutions >= limit) return;
    if (++nodes > nodeBudget) {
      solutions = limit + 1;
      return;
    }
    // Pick the unsatisfied island with the fewest filling options (MRV-ish).
    let best = -1;
    let bestOptions: number[][] | null = null;
    for (let i = 0; i < nIslands; i++) {
      if (remaining[i] === 0) continue;
      // Slot indices (not directions) so callers can index `slots` directly.
      const openSlots = [0, 1, 2, 3]
        .filter((d) => {
          const s = dirSlot[i][d];
          return s >= 0 && slots[s].used < 2 && remaining[slots[s].a === i ? slots[s].b : slots[s].a] > 0;
        })
        .map((d) => dirSlot[i][d]);
      // Enumerate distributions of remaining[i] across open slots (each 0..2,
      // capped by slot room), respecting the neighbour's remaining count too.
      const options: number[][] = [];
      const caps = openSlots.map((sIdx) => {
        const s = slots[sIdx];
        const other = s.a === i ? s.b : s.a;
        return Math.min(2 - s.used, 2, remaining[other]);
      });
      const rec = (k: number, left: number, acc: number[]): void => {
        if (options.length > 24) return; // cap combinatorics; MRV rarely hits this
        if (k === openSlots.length) {
          if (left === 0) options.push([...acc]);
          return;
        }
        for (let v = 0; v <= Math.min(caps[k], left); v++) {
          acc.push(v);
          rec(k + 1, left - v, acc);
          acc.pop();
        }
      };
      rec(0, remaining[i], []);
      if (options.length === 0) return; // dead end
      if (bestOptions === null || options.length < bestOptions.length) {
        best = i;
        bestOptions = options;
        bestOpenSlots = openSlots;
      }
      if (options.length === 1) break;
    }
    if (best === -1) {
      // All satisfied: verify connectivity.
      if (connectedAll()) solutions++;
      return;
    }

    // Capture locally: nested solve() calls overwrite best* state.
    const chosenIsland = best;
    const chosenSlots = [...bestOpenSlots];
    for (const dist of bestOptions!) {
      for (let j = 0; j < dist.length; j++) {
        slots[chosenSlots[j]].used += dist[j] as 0 | 1 | 2;
      }
      remaining[chosenIsland] = 0;
      for (let j = 0; j < dist.length; j++) {
        const s = slots[chosenSlots[j]];
        const other = s.a === chosenIsland ? s.b : s.a;
        remaining[other] -= dist[j];
      }
      solve();
      for (let j = 0; j < dist.length; j++) {
        const s = slots[chosenSlots[j]];
        const other = s.a === chosenIsland ? s.b : s.a;
        remaining[other] += dist[j];
        slots[chosenSlots[j]].used -= dist[j] as 0 | 1 | 2;
      }
      remaining[chosenIsland] = islands[chosenIsland].count;
      if (solutions >= limit) return;
    }
  }

  solve();
  return solutions;
}

function buildBridges(
  islands: { row: number; col: number; count: number }[]
): HashiBridge[] | null {
  // Re-run the solver collecting one concrete solution.
  // Reuse countHashiSolutions machinery by reconstructing greedily: simplest
  // correct approach is a fresh backtracking that records the first found
  // layout. Duplicating ~40 lines is acceptable for clarity here.
  const nIslands = islands.length;

  const byRow = new Map<number, number[]>();
  const byCol = new Map<number, number[]>();
  islands.forEach((isl, i) => {
    if (!byRow.has(isl.row)) byRow.set(isl.row, []);
    if (!byCol.has(isl.col)) byCol.set(isl.col, []);
    byRow.get(isl.row)!.push(i);
    byCol.get(isl.col)!.push(i);
  });

  const slotOf = new Map<string, number>();
  const slots: Slot[] = [];
  const dirSlot: number[][] = Array.from({ length: nIslands }, () =>
    Array(4).fill(-1)
  );
  const link = (a: number, b: number, axis: "row" | "col"): void => {
    const key = `${Math.min(a, b)}-${Math.max(a, b)}`;
    if (slotOf.has(key)) return;
    const idx = slots.length;
    slots.push({ a: Math.min(a, b), b: Math.max(a, b), used: 0 });
    slotOf.set(key, idx);
    if (axis === "row") {
      dirSlot[a][3] = idx;
      dirSlot[b][2] = idx;
    } else {
      dirSlot[a][0] = idx;
      dirSlot[b][1] = idx;
    }
  };
  const chain = (indices: number[], axis: "row" | "col"): void => {
    const sorted = [...indices].sort((x, y) =>
      axis === "row" ? islands[x].col - islands[y].col : islands[x].row - islands[y].row
    );
    for (let k = 0; k < sorted.length - 1; k++) link(sorted[k], sorted[k + 1], axis);
  };
  for (const idxs of byRow.values()) chain(idxs, "row");
  for (const idxs of byCol.values()) chain(idxs, "col");

  const remaining = islands.map((i) => i.count);
  let found: number[] | null = null; // per-slot final bridge counts

  function connectedAll(): boolean {
    const parent = Array.from({ length: nIslands }, (_, i) => i);
    const find = (x: number): number => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    };
    for (const s of slots) {
      if (s.used === 0) continue;
      const ra = find(s.a);
      const rb = find(s.b);
      if (ra !== rb) parent[ra] = rb;
    }
    const root = find(0);
    for (let i = 1; i < nIslands; i++) if (find(i) !== root) return false;
    return true;
  }

  function solve(): boolean {
    let best = -1;
    let bestOpenSlots: number[] = [];
    let bestOptions: number[][] | null = null;
    for (let i = 0; i < nIslands; i++) {
      if (remaining[i] === 0) continue;
      // Slot indices (not directions) so callers can index `slots` directly.
      const openSlots = [0, 1, 2, 3]
        .filter((d) => {
          const s = dirSlot[i][d];
          return s >= 0 && slots[s].used < 2 && remaining[slots[s].a === i ? slots[s].b : slots[s].a] > 0;
        })
        .map((d) => dirSlot[i][d]);
      const options: number[][] = [];
      const caps = openSlots.map((sIdx) => {
        const s = slots[sIdx];
        const other = s.a === i ? s.b : s.a;
        return Math.min(2 - s.used, 2, remaining[other]);
      });
      const rec = (k: number, left: number, acc: number[]): void => {
        if (options.length > 24) return;
        if (k === openSlots.length) {
          if (left === 0) options.push([...acc]);
          return;
        }
        for (let v = 0; v <= Math.min(caps[k], left); v++) {
          acc.push(v);
          rec(k + 1, left - v, acc);
          acc.pop();
        }
      };
      rec(0, remaining[i], []);
      if (options.length === 0) return false;
      if (bestOptions === null || options.length < bestOptions.length) {
        best = i;
        bestOptions = options;
        bestOpenSlots = openSlots;
      }
      if (options.length === 1) break;
    }
    if (best === -1) {
      if (connectedAll()) {
        found = slots.map((s) => s.used);
        return true;
      }
      return false;
    }
    // Capture locally: nested solve() calls overwrite best* state.
    const chosenIsland = best;
    const chosenSlots = [...bestOpenSlots];
    for (const dist of bestOptions!) {
      for (let j = 0; j < dist.length; j++) slots[chosenSlots[j]].used += dist[j] as 0 | 1 | 2;
      const saved = remaining[chosenIsland];
      remaining[chosenIsland] = 0;
      for (let j = 0; j < dist.length; j++) {
        const s = slots[chosenSlots[j]];
        const other = s.a === chosenIsland ? s.b : s.a;
        remaining[other] -= dist[j];
      }
      if (solve()) return true;
      for (let j = 0; j < dist.length; j++) {
        const s = slots[chosenSlots[j]];
        const other = s.a === chosenIsland ? s.b : s.a;
        remaining[other] += dist[j];
        slots[chosenSlots[j]].used -= dist[j] as 0 | 1 | 2;
      }
      remaining[chosenIsland] = saved;
    }
    return false;
  }

  if (!solve()) return null;
  return slots
    .map((s, i) => ({ a: s.a, b: s.b, count: found![i] as 1 | 2 }))
    .filter((s) => s.count > 0);
}

export function generateHashi(size = 8, rng: () => number = Math.random): HashiPuzzle | null {
  const n = Math.max(6, Math.min(14, size));

  for (let attempt = 0; attempt < 60; attempt++) {
    // Scatter islands sparsely.
    const used = new Set<string>();
    const cells: [number, number][] = [];
    const targetIslands = Math.max(6, Math.round((n * n) / 16));
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

    const degN = new Array(cells.length).fill(0);
    const degS = new Array(cells.length).fill(0);
    const degE = new Array(cells.length).fill(0);
    const degW = new Array(cells.length).fill(0);
    const bridges: Bridge[] = [];

    function segmentsBlocked(a: number, b: number): boolean {
      const [ra, ca] = cells[a];
      const [rb, cb] = cells[b];
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

    const parent = cells.map((_, i) => i);
    function find(x: number): number {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    }

    let tries = 0;
    // Grow a connected random graph, then keep saturating it: denser boards
    // have fewer alternative layouts, which makes uniqueness reachable.
    while (tries++ < 1200) {
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
    }

    if (new Set(cells.map((_, i) => find(i))).size !== 1) continue;

    const counts = cells.map((_, i) => degN[i] + degS[i] + degE[i] + degW[i]);
    if (counts.some((c) => c === 0)) continue;

    const islandList = cells.map(([row, col], i) => ({ row, col, count: counts[i] }));

    // Publish only unambiguous boards.
    if (countHashiSolutions(islandList, 2) !== 1) continue;

    const solved = buildBridges(islandList);
    if (!solved) continue;

    return { size: n, islands: islandList, bridges: solved };
  }
  return null;
}

interface Bridge {
  a: number;
  b: number;
  count: 1 | 2;
}
