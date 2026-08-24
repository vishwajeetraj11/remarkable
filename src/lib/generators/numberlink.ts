/**
 * Numberlink / Flow-style paths: connect matching number pairs with
 * non-crossing, non-branching paths.
 *
 * House rule (stated on the printable): paths together COVER EVERY CELL,
 * Flow-free style. Full coverage plus a solver check gives genuinely unique
 * puzzles — random sparse carvings almost never are, because rerouting
 * through the holes is too easy.
 *
 * The generator carves disjoint self-avoiding paths tiling the whole grid,
 * publishes only the true path endpoints, and ships the ordered solution
 * paths for the answer page.
 */

export interface NumberlinkPuzzle {
  size: number;
  /** 0 = empty, otherwise pair id (1..pairs) */
  endpoints: number[][];
  /** Ordered cells of each pair's connecting path, index = pairId - 1. */
  paths: [number, number][][];
}

/**
 * Count full-coverage routings of all pairs, stopping at `limit`. Paths are
 * simple (no branching/revisits) and vertex-disjoint; every cell must belong
 * to exactly one path. Node budget guards pathological instances. Exported
 * for corpus verification.
 */
export function countNumberlinkSolutions(
  endpoints: number[][],
  limit = 2,
  nodeBudget = 250_000
): number {
  const n = endpoints.length;

  // Collect pairs.
  const pairs = new Map<number, [number, number][]>();
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const id = endpoints[r][c];
      if (id > 0) {
        if (!pairs.has(id)) pairs.set(id, []);
        pairs.get(id)!.push([r, c]);
      }
    }
  }
  if ([...pairs.values()].some((p) => p.length !== 2)) return 0;
  const pairList = [...pairs.entries()].sort((a, b) => a[0] - b[0]);

  // occupied[r][c]: -1 free, else pair id owning the cell (endpoints included).
  const occupied: number[][] = Array.from({ length: n }, (_, r) =>
    Array.from({ length: n }, (_, c) => (endpoints[r][c] > 0 ? -2 : -1))
  );
  // Mark all endpoints as reserved by their own pair up front.
  for (const [id, [a, b]] of pairList) {
    occupied[a[0]][a[1]] = id;
    occupied[b[0]][b[1]] = id;
  }

  let solutions = 0;
  let nodes = 0;

  function regionsReachable(pairIndex: number): boolean {
    // Every connected region of free cells must be enterable by some
    // remaining pair, otherwise full coverage is impossible.
    const seen = Array.from({ length: n }, () => Array(n).fill(false));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        if (occupied[r][c] !== -1 || seen[r][c]) continue;
        // Flood this free region.
        let reachable = false;
        const stack: [number, number][] = [[r, c]];
        seen[r][c] = true;
        while (stack.length) {
          const [cr, cc] = stack.pop()!;
          for (const [dr, dc] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ] as const) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr < 0 || nr >= n || nc < 0 || nc >= n || seen[nr][nc]) continue;
            if (occupied[nr][nc] !== -1) continue;
            seen[nr][nc] = true;
            stack.push([nr, nc]);
          }
          // Region touches a cell adjacent to a pending pair's endpoint?
          for (const [dr, dc] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
          ] as const) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
            const owner = occupied[nr][nc];
            if (owner >= 1) {
              const pendingIndex = pairList.findIndex(([id]) => id === owner);
              if (pendingIndex >= pairIndex) reachable = true;
            }
          }
        }
        if (!reachable) return false;
      }
    }
    return true;
  }

  function solve(pairIndex: number): void {
    if (solutions >= limit) return;
    if (++nodes > nodeBudget) {
      solutions = limit + 1;
      return;
    }
    if (pairIndex === pairList.length) {
      solutions++;
      return;
    }
    const id = pairList[pairIndex][0];
    const [sr, sc] = pairList[pairIndex][1][0];
    const [tr, tc] = pairList[pairIndex][1][1];

    // DFS a simple path sr,sc -> tr,tc through free cells.
    const onPath = new Set<string>();
    function walk(r: number, c: number): void {
      if (solutions >= limit) return;
      if (++nodes > nodeBudget) {
        solutions = limit + 1;
        return;
      }
      onPath.add(`${r},${c}`);
      if (r === tr && c === tc) {
        // Commit path, solve next pair.
        for (const key of onPath) {
          const [pr, pc] = key.split(",").map(Number);
          occupied[pr][pc] = id;
        }
        if (regionsReachable(pairIndex + 1)) solve(pairIndex + 1);
        // Restore exact pre-commit state: endpoints stay reserved (-2),
        // interior cells back to free (-1).
        for (const key of onPath) {
          const [pr, pc] = key.split(",").map(Number);
          occupied[pr][pc] = endpoints[pr][pc] > 0 ? -2 : -1;
        }
        onPath.delete(`${r},${c}`);
        return;
      }
      for (const [dr, dc] of [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ] as const) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
        // Free cells are walkable; the matching endpoint is the destination.
        const isTarget = nr === tr && nc === tc;
        if (occupied[nr][nc] !== -1 && !isTarget) continue;
        if (onPath.has(`${nr},${nc}`)) continue;
        walk(nr, nc);
        if (solutions >= limit) break;
      }
      onPath.delete(`${r},${c}`);
    }

    walk(sr, sc);
  }

  solve(0);
  return solutions;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateNumberlink(size = 7, rng: () => number = Math.random): NumberlinkPuzzle | null {
  const n = Math.max(5, Math.min(12, size));

  for (let attempt = 0; attempt < 80; attempt++) {
    const owner: number[][] = Array.from({ length: n }, () =>
      Array<number>(n).fill(0)
    );
    const carvedPaths: [number, number][][] = [];
    let freeCells = n * n;

    // Tile the whole grid. Always carve the smallest free component first —
    // draining pockets before they strand single cells — and treat a whole
    // small component as one path so nothing gets fragmented.
    let failed = false;
    while (freeCells > 0 && !failed) {
      // Flood-fill free components.
      const compOf: number[][] = Array.from({ length: n }, () =>
        Array(n).fill(-1)
      );
      const comps: [number, number][][] = [];
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          if (owner[r][c] !== 0 || compOf[r][c] !== -1) continue;
          const id = comps.length;
          const cells: [number, number][] = [[r, c]];
          compOf[r][c] = id;
          const queue = [[r, c]];
          while (queue.length) {
            const [cr, cc] = queue.shift()!;
            for (const [dr, dc] of [
              [-1, 0],
              [1, 0],
              [0, -1],
              [0, 1],
            ] as const) {
              const nr = cr + dr;
              const nc = cc + dc;
              if (
                nr < 0 || nr >= n || nc < 0 || nc >= n ||
                owner[nr][nc] !== 0 || compOf[nr][nc] !== -1
              ) continue;
              compOf[nr][nc] = id;
              cells.push([nr, nc]);
              queue.push([nr, nc]);
            }
          }
          comps.push(cells);
        }
      }

      comps.sort((a, b) => a.length - b.length);
      const comp = comps[0];
      if (comp.length === 1) {
        failed = true; // a lone cell can never join a path
        break;
      }

      // Random start inside the smallest component.
      const [sr, sc] = comp[Math.floor(rng() * comp.length)];
      const pairId = carvedPaths.length + 1;

      const path: [number, number][] = [[sr, sc]];
      const pathSet = new Set<string>([`${sr},${sc}`]);
      let cr = sr;
      let cc = sc;
      // Small components get carved wholesale; big ones wander using
      // least-fragmentation scoring so no lonely cells get stranded.
      const targetLen =
        comp.length <= n
          ? comp.length
          : Math.min(freeCells, 4 + Math.floor(rng() * (n + 2)));

      const freeAfter = (
        occupied: Set<string>
      ): number => {
        // Count connected regions of unoccupied cells.
        const seen = new Set<string>();
        let regions = 0;
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            const key = `${r},${c}`;
            if (owner[r][c] !== 0 || occupied.has(key) || seen.has(key)) continue;
            regions++;
            const stack = [key];
            seen.add(key);
            while (stack.length) {
              const cur = stack.pop()!;
              const [cr, cc] = cur.split(",").map(Number);
              for (const [dr, dc] of [
                [-1, 0],
                [1, 0],
                [0, -1],
                [0, 1],
              ] as const) {
                const nr = cr + dr;
                const nc = cc + dc;
                if (nr < 0 || nr >= n || nc < 0 || nc >= n) continue;
                const nk = `${nr},${nc}`;
                if (
                  owner[nr][nc] !== 0 ||
                  occupied.has(nk) ||
                  seen.has(nk)
                ) continue;
                seen.add(nk);
                stack.push(nk);
              }
            }
          }
        }
        return regions;
      };

      while (path.length < targetLen) {
        const candidates = (
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
        });
        if (candidates.length === 0) break;

        // Score each candidate by how many free regions remain behind it;
        // fewer is better (avoids cutting pockets off).
        let bestOpts: [number, number][] = [];
        let bestScore = Infinity;
        for (const cand of shuffle(candidates, rng)) {
          const trial = new Set(pathSet);
          trial.add(`${cr + cand[0]},${cc + cand[1]}`);
          const score = freeAfter(trial);
          if (score < bestScore) {
            bestScore = score;
            bestOpts = [cand];
          } else if (score === bestScore) {
            bestOpts.push(cand);
          }
        }
        const [dr, dc] = bestOpts[Math.floor(rng() * bestOpts.length)];
        cr += dr;
        cc += dc;
        path.push([cr, cc]);
        pathSet.add(`${cr},${cc}`);
      }

      if (path.length < 2) {
        continue; // cannot even make a pair here; retry the sweep
      }

      for (const [r, c] of path) {
        owner[r][c] = pairId;
        freeCells--;
      }
      carvedPaths.push(path);
    }

    if (failed || freeCells > 0) continue; // house rule: full coverage

    // Build puzzle: only the true path endpoints shown.
    const endpoints: number[][] = Array.from({ length: n }, () =>
      Array<number>(n).fill(0)
    );
    for (const path of carvedPaths) {
      const [fr, fc] = path[0];
      const [lr, lc] = path[path.length - 1];
      endpoints[fr][fc] = owner[fr][fc];
      endpoints[lr][lc] = owner[lr][lc];
    }

    // Publish only unambiguous boards.
    if (countNumberlinkSolutions(endpoints, 2) !== 1) continue;

    return { size: n, endpoints, paths: carvedPaths };
  }
  return null;
}
