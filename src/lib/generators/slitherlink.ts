/**
 * Slitherlink: draw a single closed loop along the dot lattice edges; each
 * cell clue counts how many of its edges belong to the loop. Fully clued
 * variant (every cell numbered) so puzzles are tightly constrained, and a
 * solver verifies the clues admit exactly one loop before publishing.
 */

export interface SlitherlinkPuzzle {
  /** cells x cells puzzle */
  size: number;
  /** clue[r][c] = number of loop edges around that cell (0-3) */
  clues: number[][];
  solutionEdges: Set<string>;
}

function edgeKey(r1: number, c1: number, r2: number, c2: number): string {
  const [a, b] = [
    [r1, c1],
    [r2, c2],
  ].sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  return `${a[0]},${a[1]}-${b[0]},${b[1]}`;
}

/**
 * Count loops satisfying the full clue set, stopping at `limit`. Dots are
 * decided row-major; each dot uses either no edges or exactly two (cycle
 * cover), which keeps every partial assignment acyclic-compatible. A node
 * budget guards pathological instances ("more than one"). Exported for
 * corpus verification.
 */
export function countSlitherlinkSolutions(
  clues: number[][],
  limit = 2,
  nodeBudget = 400_000
): number {
  const n = clues.length;
  const totalDots = (n + 1) * (n + 1);
  // -1 unknown; otherwise 0/1.
  const h: number[][] = Array.from({ length: n + 1 }, () => Array(n).fill(-1));
  const v: number[][] = Array.from({ length: n }, () => Array(n + 1).fill(-1));
  let solutions = 0;
  let nodes = 0;

  function cellSatisfied(r: number, c: number): boolean {
    let count = 0;
    if (h[r][c] === 1) count++;
    if (h[r + 1][c] === 1) count++;
    if (v[r][c] === 1) count++;
    if (v[r][c + 1] === 1) count++;
    return count === clues[r][c];
  }

  function singleCycle(): boolean {
    // Collect used unit edges as adjacency between lattice points.
    const adj = new Map<string, string[]>();
    let edgeCount = 0;
    const addEdge = (r1: number, c1: number, r2: number, c2: number) => {
      const k1 = `${r1},${c1}`;
      const k2 = `${r2},${c2}`;
      if (!adj.has(k1)) adj.set(k1, []);
      if (!adj.has(k2)) adj.set(k2, []);
      adj.get(k1)!.push(k2);
      adj.get(k2)!.push(k1);
      edgeCount++;
    };
    for (let r = 0; r <= n; r++) {
      for (let c = 0; c < n; c++) if (h[r][c] === 1) addEdge(r, c, r, c + 1);
    }
    for (let r = 0; r < n; r++) {
      for (let c = 0; c <= n; c++) if (v[r][c] === 1) addEdge(r, c, r + 1, c);
    }
    if (edgeCount === 0) return false;
    // Walk one cycle; a closed loop of k edges returns to its start on the
    // k-th move (which the loop detects without counting), so a single cycle
    // covering everything gives steps = edgeCount - 1 and k visited dots.
    const startKey = adj.keys().next().value as string;
    const visited = new Set<string>([startKey]);
    let prev = "";
    let cur = startKey;
    let steps = 0;
    while (steps < edgeCount) {
      const nbrs = adj.get(cur)!;
      const next = nbrs.find((p) => p !== prev);
      if (!next) break;
      if (next === startKey) break;
      visited.add(next);
      prev = cur;
      cur = next;
      steps++;
    }
    // The walk breaks upon reaching startKey without updating cur, so
    // closure means "cur connects back to start", not "cur is start".
    return (
      adj.get(cur)!.includes(startKey) &&
      steps === edgeCount - 1 &&
      visited.size === edgeCount
    );
  }

  function dfs(dot: number): void {
    if (solutions >= limit) return;
    if (++nodes > nodeBudget) {
      solutions = limit + 1;
      return;
    }
    if (dot === totalDots) {
      if (singleCycle()) solutions++;
      return;
    }
    const r = Math.floor(dot / (n + 1));
    const c = dot % (n + 1);
    // Edges fixed by earlier decisions:
    const west = c > 0 ? h[r][c - 1] : 0;
    const north = r > 0 ? v[r - 1][c] : 0;
    if (west === -1 || north === -1) throw new Error("solver order broken");

    for (const east of [0, 1]) {
      // Border dots have no east/south edge; only "absent" is allowed there.
      if (c === n && east === 1) continue;
      if (c < n && h[r][c] !== -1 && h[r][c] !== east) continue;
      for (const south of [0, 1]) {
        if (r === n && south === 1) continue;
        if (r < n && v[r][c] !== -1 && v[r][c] !== south) continue;
        const degree = west + north + east + south;
        if (degree !== 0 && degree !== 2) continue;
        // Commit this dot's outgoing edges.
        const savedE = c < n ? h[r][c] : -2;
        const savedS = r < n ? v[r][c] : -2;
        if (c < n) h[r][c] = east;
        if (r < n) v[r][c] = south;

        // Finalize cells whose last edge just got decided (bottom-right dot
        // of cell (r-1,c-1) is this dot).
        if (r > 0 && c > 0 && !cellSatisfied(r - 1, c - 1)) {
          if (c < n) h[r][c] = savedE === -2 ? -1 : savedE;
          if (r < n) v[r][c] = savedS === -2 ? -1 : savedS;
          continue;
        }

        dfs(dot + 1);

        if (c < n) h[r][c] = savedE === -2 ? -1 : savedE;
        if (r < n) v[r][c] = savedS === -2 ? -1 : savedS;
        if (solutions >= limit) return;
      }
    }
  }

  dfs(0);
  return solutions;
}

/**
 * Generate an interesting simple orthogonal loop by mutating a rectangle:
 * repeatedly replace one boundary edge with a detour, keeping the polygon
 * simple (no self-intersections) and inside the n×n lattice. Clues are then
 * solver-checked for uniqueness.
 */
export function generateSlitherlink(size = 6, rng: () => number = Math.random): SlitherlinkPuzzle | null {
  const n = Math.max(4, Math.min(10, size));

  for (let attempt = 0; attempt < 12; attempt++) {
    type Pt = [number, number];
    let poly: Pt[] = [
      [1, 1],
      [1, n - 1],
      [n - 1, n - 1],
      [n - 1, 1],
    ]; // closed implicitly

    function segmentsIntersect(a1: Pt, a2: Pt, b1: Pt, b2: Pt): boolean {
      const o = (p: Pt, q: Pt, r: Pt) =>
        Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
      const d1 = o(a1, a2, b1);
      const d2 = o(a1, a2, b2);
      const d3 = o(b1, b2, a1);
      const d4 = o(b1, b2, a2);
      if (d1 !== d2 && d3 !== d4) return true;
      const onSeg = (p: Pt, q: Pt, r: Pt) =>
        Math.min(p[0], r[0]) <= q[0] &&
        q[0] <= Math.max(p[0], r[0]) &&
        Math.min(p[1], r[1]) <= q[1] &&
        q[1] <= Math.max(p[1], r[1]);
      if (d1 === 0 && onSeg(a1, b1, a2)) return true;
      if (d2 === 0 && onSeg(a1, b2, a2)) return true;
      if (d3 === 0 && onSeg(b1, a1, b2)) return true;
      if (d4 === 0 && onSeg(b1, a2, b2)) return true;
      return false;
    }

    function isSimple(pts: Pt[]): boolean {
      const m = pts.length;
      for (let i = 0; i < m; i++) {
        for (let j = i + 1; j < m; j++) {
          if (Math.abs(i - j) <= 1 || (i === 0 && j === m - 1)) continue;
          const nextI = (i + 1) % m;
          const nextJ = (j + 1) % m;
          if (segmentsIntersect(pts[i], pts[nextI], pts[j], pts[nextJ])) {
            return false;
          }
        }
      }
      return true;
    }

    function inBounds(p: Pt): boolean {
      return p[0] >= 0 && p[0] <= n && p[1] >= 0 && p[1] <= n;
    }

    // Mutate.
    for (let k = 0; k < Math.floor(n * 2.5); k++) {
      const m = poly.length;
      const i = Math.floor(rng() * m);
      const j = (i + 1) % m;
      const a = poly[i];
      const b = poly[j];

      const horizontal = a[0] === b[0]; // same row → bump offsets the row

      const candidates: [Pt, Pt][] = [];
      if (horizontal) {
        for (const d of [-2, -1, 1, 2]) {
          candidates.push([
            [a[0] + d, a[1]],
            [a[0] + d, b[1]],
          ]);
        }
      } else {
        for (const d of [-2, -1, 1, 2]) {
          candidates.push([
            [a[0], b[1] + d],
            [b[0], b[1] + d],
          ]);
        }
      }

      for (const [q1, q2] of candidates) {
        if (!inBounds(q1) || !inBounds(q2)) continue;
        if (
          poly.some(
            (p) =>
              (p[0] === q1[0] && p[1] === q1[1]) ||
              (p[0] === q2[0] && p[1] === q2[1])
          )
        ) {
          continue;
        }
        if (
          (q1[0] === a[0] && q1[1] === a[1]) ||
          (q2[0] === b[0] && q2[1] === b[1])
        ) {
          continue;
        }
        const candidate = [...poly.slice(0, j), q1, q2, ...poly.slice(j)];
        if (isSimple(candidate)) {
          poly = candidate;
          break;
        }
      }
    }

    // Convert polygon to edge set.
    const edgeSet = new Set<string>();
    for (let i = 0; i < poly.length; i++) {
      const [r1, c1] = poly[i];
      const [r2, c2] = poly[(i + 1) % poly.length];
      const dr = Math.sign(r2 - r1);
      const dc = Math.sign(c2 - c1);
      let r = r1;
      let c = c1;
      while (r !== r2 || c !== c2) {
        const nr = r + dr;
        const nc = c + dc;
        edgeSet.add(edgeKey(r, c, nr, nc));
        r = nr;
        c = nc;
        if (edgeSet.size > n * n * 4) break; // safety net
      }
    }

    // Clues: count loop edges around each cell.
    const clues: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        let count = 0;
        if (edgeSet.has(edgeKey(r, c, r, c + 1))) count++; // top
        if (edgeSet.has(edgeKey(r + 1, c, r + 1, c + 1))) count++; // bottom
        if (edgeSet.has(edgeKey(r, c, r + 1, c))) count++; // left
        if (edgeSet.has(edgeKey(r, c + 1, r + 1, c + 1))) count++; // right
        clues[r][c] = count;
      }
    }

    // Publish only unambiguous clue sets.
    if (countSlitherlinkSolutions(clues, 2) !== 1) continue;

    return { size: n, clues, solutionEdges: edgeSet };
  }
  return null;
}
