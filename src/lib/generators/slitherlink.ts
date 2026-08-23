/**
 * Slitherlink: draw a single closed loop along the dot lattice edges; each
 * cell clue counts how many of its edges belong to the loop. Fully clued
 * variant (every cell numbered) so puzzles are always well-defined.
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
 * Generate an interesting simple orthogonal loop by mutating a rectangle:
 * repeatedly replace one boundary edge with a 3-segment detour, keeping the
 * polygon simple (no self-intersections) and inside the n×n lattice.
 */
export function generateSlitherlink(size = 6): SlitherlinkPuzzle {
  const n = Math.max(4, Math.min(10, size));

  type Pt = [number, number];
  let poly: Pt[] = [
    [1, 1],
    [1, size - 1],
    [size - 1, size - 1],
    [size - 1, 1],
  ]; // closed implicitly

  function segmentsIntersect(
    a1: Pt,
    a2: Pt,
    b1: Pt,
    b2: Pt
  ): boolean {
    const o = (p: Pt, q: Pt, r: Pt) =>
      Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
    const d1 = o(a1, a2, b1);
    const d2 = o(a1, a2, b2);
    const d3 = o(b1, b2, a1);
    const d4 = o(b1, b2, a2);
    if (d1 !== d2 && d3 !== d4) return true;
    // Collinear overlap check.
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
        if (
          segmentsIntersect(pts[i], pts[nextI], pts[j], pts[nextJ])
        ) {
          return false;
        }
      }
    }
    return true;
  }

  function inBounds(p: Pt): boolean {
    return p[0] >= 0 && p[0] <= size && p[1] >= 0 && p[1] <= size;
  }

  // Mutate.
  for (let k = 0; k < Math.floor(size * 2.5); k++) {
    const m = poly.length;
    const i = Math.floor(Math.random() * m);
    const j = (i + 1) % m;
    const a = poly[i];
    const b = poly[j];

    const horizontal = a[0] === b[0]; // same row → bump offsets the row

    // Orthogonal detour: replace edge a→b with a→q1→q2→b where the pair
    // (q1,q2) bumps perpendicular to the segment. Two points keep every
    // segment axis-aligned.
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
      // Reject degenerate bumps landing on existing vertices.
      if (
        poly.some(
          (p) =>
            (p[0] === q1[0] && p[1] === q1[1]) ||
            (p[0] === q2[0] && p[1] === q2[1])
        )
      ) {
        continue;
      }
      // Skip zero-progress bumps (q1===a or q2===b).
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
    // Axis-aligned consecutive points may span multiple unit edges — expand.
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
      if (edgeSet.size > size * size * 4) break; // safety net
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

  return { size: n, clues, solutionEdges: edgeSet };
}
