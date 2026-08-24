/**
 * Corpus tests for sheet & grid games: bingo, maze, number-fill,
 * number-search, numberlink, slitherlink, hashi, logic-grid.
 *
 * Seeded PRNG only — the global Math.random guard fails loudly on any
 * accidental global usage.
 */
import { describe, it, expect } from "vitest";
import {
  forbidGlobalRandom,
  mulberry32,
  stable,
} from "../helpers/seeded-rng";
import { generateBingo } from "@/lib/generators/bingo";
import { generateMaze } from "@/lib/generators/maze";
import { generateNumberFill } from "@/lib/generators/number-fill";
import { generateNumberSearch } from "@/lib/generators/number-search";
import { generateNumberlink, countNumberlinkSolutions } from "@/lib/generators/numberlink";
import {
  generateSlitherlink,
  countSlitherlinkSolutions,
} from "@/lib/generators/slitherlink";
import { generateHashi, countHashiSolutions } from "@/lib/generators/hashi";
import { generateLogicGrid } from "@/lib/generators/logic-grid";

forbidGlobalRandom();

describe("generateBingo", () => {
  it("is deterministic per seed", () => {
    for (const seed of [17]) {
      const a = generateBingo(4, 5, 75, mulberry32(seed));
      const b = generateBingo(4, 5, 75, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("classic 75-ball cards use true BINGO column ranges + free center", () => {
    const rangeFor = (col: number): [number, number] => [
      col * 15 + 1,
      (col + 1) * 15,
    ];
    for (let seed = 1; seed <= 20; seed++) {
      const { cards, calls, size } = generateBingo(3, 5, 75, mulberry32(seed));
      expect(size).toBe(5);
      expect(calls).toHaveLength(75);
      expect(new Set(calls).size).toBe(75);

      for (const card of cards) {
        const seen = new Set<number>();
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            const v = card.cells[r][c];
            if (r === 2 && c === 2) {
              expect(v).toBeNull();
              continue;
            }
            expect(v).not.toBeNull();
            if (v === null) continue;
            const [lo, hi] = rangeFor(c);
            expect(v).toBeGreaterThanOrEqual(lo);
            expect(v).toBeLessThanOrEqual(hi);
            expect(seen.has(v)).toBe(false);
            seen.add(v);
          }
        }
        expect(seen.size).toBe(24);
      }
    }
  });

  it("compact modes deal distinct numbers from a custom pool", () => {
    for (let seed = 1; seed <= 10; seed++) {
      for (const dim of [3, 4] as const) {
        const maxNumber = dim === 3 ? 30 : 50;
        const { cards, calls, size } = generateBingo(
          2,
          dim,
          maxNumber,
          mulberry32(seed)
        );
        expect(size).toBe(dim);
        expect(calls).toHaveLength(maxNumber);
        expect(new Set(calls).size).toBe(maxNumber);
        for (const card of cards) {
          const flat = card.cells.flat().filter((v): v is number => v !== null);
          expect(flat).toHaveLength(dim * dim);
          expect(new Set(flat).size).toBe(dim * dim);
          for (const v of flat) {
            expect(v).toBeGreaterThanOrEqual(1);
            expect(v).toBeLessThanOrEqual(maxNumber);
          }
        }
      }
    }
  });
});

describe("generateMaze", () => {
  it("is deterministic per seed", () => {
    for (const seed of [18]) {
      const a = generateMaze(12, 10, mulberry32(seed));
      const b = generateMaze(12, 10, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("walls are symmetric and the solution path connects the corners", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const w = 8 + (seed % 6);
      const h = 8 + ((seed * 3) % 6);
      const { grid, solution, width, height } = generateMaze(w, h, mulberry32(seed));
      expect(width).toBe(w);
      expect(height).toBe(h);

      for (let r = 0; r < h; r++) {
        for (let c = 0; c < w; c++) {
          if (!grid[r][c].right && c + 1 < w) expect(grid[r][c + 1].left).toBe(false);
          if (!grid[r][c].bottom && r + 1 < h) expect(grid[r + 1][c].top).toBe(false);
        }
      }

      expect(solution[0]).toEqual([0, 0]);
      expect(solution[solution.length - 1]).toEqual([h - 1, w - 1]);
      for (let i = 1; i < solution.length; i++) {
        const [pr, pc] = solution[i - 1];
        const [r, c] = solution[i];
        const dist = Math.abs(pr - r) + Math.abs(pc - c);
        expect(dist).toBe(1);
        if (r > pr) expect(grid[pr][pc].bottom).toBe(false);
        if (r < pr) expect(grid[r][c].bottom).toBe(false);
        if (c > pc) expect(grid[pr][pc].right).toBe(false);
        if (c < pc) expect(grid[r][c].right).toBe(false);
      }
    }
  });
});

describe("generateNumberFill", () => {
  it("is deterministic per seed", () => {
    for (const seed of [19]) {
      const a = generateNumberFill(mulberry32(seed));
      const b = generateNumberFill(mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("runs of digits have length >= 3 and numbers list is sorted", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const { grid, numbers, size } = generateNumberFill(mulberry32(seed));
      expect(size).toBe(13);

      const checkLine = (get: (i: number) => number | null) => {
        let len = 0;
        for (let i = 0; i <= size; i++) {
          const v = i < size ? get(i) : null;
          if (v !== null) len++;
          else {
            if (len > 0) expect(len).toBeGreaterThanOrEqual(3);
            len = 0;
          }
        }
      };

      for (let r = 0; r < size; r++) {
        checkLine((c) => grid[r][c]);
      }
      for (let c = 0; c < size; c++) {
        checkLine((r) => grid[r][c]);
      }

      // Sorted by digit-length then value.
      const sorted = [...numbers].sort((a, b) => {
        const ld = String(a).length - String(b).length;
        return ld !== 0 ? ld : a - b;
      });
      expect(numbers).toEqual(sorted);
    }
  });
});

describe("generateNumberSearch", () => {
  it("is deterministic per seed", () => {
    for (const seed of [20]) {
      const a = generateNumberSearch(14, 10, undefined, mulberry32(seed));
      const b = generateNumberSearch(14, 10, undefined, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("targets appear exactly once; placements match the grid", () => {
    for (let seed = 1; seed <= 30; seed++) {
      const { grid, targets, placements, size } = generateNumberSearch(
        12 + (seed % 4),
        8,
        undefined,
        mulberry32(seed)
      );
      expect(targets).toHaveLength(8);
      expect(new Set(targets).size).toBe(8);
      // No target may be a substring of another (would force a duplicate).
      for (const a of targets) {
        for (const b of targets) {
          if (a !== b) expect(b.includes(a)).toBe(false);
        }
      }

      // Every target occurs EXACTLY once in the final grid — filler digits
      // never complete an accidental second occurrence.
      for (const t of targets) {
        let count = 0;
        for (const row of grid) {
          const line = row.join("");
          let idx = line.indexOf(t);
          while (idx !== -1) {
            count++;
            idx = line.indexOf(t, idx + 1);
          }
        }
        expect(count).toBe(1);
      }

      // Placements point at the sequences.
      expect(placements).toHaveLength(targets.length);
      for (const p of placements) {
        expect(targets).toContain(p.target);
        expect(
          grid[p.row].slice(p.col, p.col + p.target.length).join("")
        ).toBe(p.target);
      }

      for (const row of grid) {
        expect(row).toHaveLength(size);
        for (const cell of row) {
          expect(cell).toMatch(/^[0-9]$/);
        }
      }
    }
  });
});

describe("generateNumberlink", () => {
  it("is deterministic per seed", () => {
    for (const seed of [23]) {
      const a = generateNumberlink(7, mulberry32(seed));
      const b = generateNumberlink(7, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("tiles the grid with ordered disjoint paths whose true endpoints are shown", () => {
    let produced = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const result = generateNumberlink(7, mulberry32(seed));
      if (!result) continue;
      produced++;
      const { endpoints, paths, size } = result;

      // Full coverage house rule: every cell belongs to exactly one path.
      const cover = new Set<string>();
      for (const path of paths) {
        for (const [r, c] of path) {
          const key = `${r},${c}`;
          expect(cover.has(key)).toBe(false);
          cover.add(key);
        }
      }
      expect(cover.size).toBe(size * size);

      for (let id = 1; id <= paths.length; id++) {
        const path = paths[id - 1];
        // Length-2 pairs (adjacent cells) are legal numberlink answers.
        expect(path.length).toBeGreaterThanOrEqual(2);

        // Ordered path: consecutive cells are orthogonal neighbours.
        for (let i = 1; i < path.length; i++) {
          const dist =
            Math.abs(path[i][0] - path[i - 1][0]) +
            Math.abs(path[i][1] - path[i - 1][1]);
          expect(dist).toBe(1);
        }

        // Published endpoints are exactly the two path extremes.
        const endpointCells: [number, number][] = [];
        endpoints.forEach((row, r) =>
          row.forEach((v, c) => {
            if (v === id) endpointCells.push([r, c]);
          })
        );
        expect(endpointCells).toHaveLength(2);
        expect(endpointCells).toContainEqual(path[0]);
        expect(endpointCells).toContainEqual(path[path.length - 1]);

        // Endpoints sit at opposite ends: walking the ordered path from one
        // published endpoint must reach the other without branching.
        expect(endpoints[path[0][0]][path[0][1]]).toBe(id);
        expect(endpoints[path[path.length - 1][0]][path[path.length - 1][1]]).toBe(id);
        for (let i = 1; i < path.length - 1; i++) {
          expect(endpoints[path[i][0]][path[i][1]]).toBe(0);
        }
      }

      // Solver confirms uniqueness under the full-coverage rule.
      expect(countNumberlinkSolutions(endpoints, 2)).toBe(1);
    }
    expect(produced).toBeGreaterThan(0);
  });
});

describe("generateSlitherlink", () => {
  it("is deterministic per seed", () => {
    for (const seed of [24]) {
      const a = generateSlitherlink(6, mulberry32(seed));
      const b = generateSlitherlink(6, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("clamps dimensions consistently and its clues are solver-unique", { timeout: 60_000 }, () => {
    const edgeKey = (r1: number, c1: number, r2: number, c2: number): string => {
      const [a, b] = [
        [r1, c1],
        [r2, c2],
      ].sort((x, y) => x[0] - y[0] || x[1] - y[1]);
      return `${a[0]},${a[1]}-${b[0]},${b[1]}`;
    };

    let produced = 0;
    const sizes = [3, 6, 99]; // below min, nominal, above max
    for (const requested of sizes) {
      for (let seed = 1; seed <= 8; seed++) {
        const result = generateSlitherlink(requested, mulberry32(seed));
        if (!result) continue;
        produced++;
        const { clues, solutionEdges, size } = result;

        // Clamped size consistent across every field.
        const n = Math.max(4, Math.min(10, requested));
        expect(size).toBe(n);
        expect(clues).toHaveLength(n);
        for (const row of clues) expect(row).toHaveLength(n);

        // Degree 0 or 2 at every dot.
        const deg = new Map<string, number>();
        for (const e of solutionEdges) {
          const [a, b] = e.split("-");
          for (const d of [a, b]) deg.set(d, (deg.get(d) ?? 0) + 1);
        }
        for (const d of deg.values()) expect([0, 2]).toContain(d);

        // Clues recompute from the loop.
        for (let r = 0; r < n; r++) {
          for (let c = 0; c < n; c++) {
            let count = 0;
            if (solutionEdges.has(edgeKey(r, c, r, c + 1))) count++;
            if (solutionEdges.has(edgeKey(r + 1, c, r + 1, c + 1))) count++;
            if (solutionEdges.has(edgeKey(r, c, r + 1, c))) count++;
            if (solutionEdges.has(edgeKey(r, c + 1, r + 1, c + 1))) count++;
            expect(clues[r][c]).toBe(count);
          }
        }

        // Solver-backed uniqueness.
        expect(countSlitherlinkSolutions(clues, 2)).toBe(1);
      }
    }
    expect(produced).toBeGreaterThan(0);
  });
});

describe("generateHashi", () => {
  it("is deterministic per seed", () => {
    for (const seed of [25]) {
      const a = generateHashi(8, mulberry32(seed));
      const b = generateHashi(8, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("ships bridges that satisfy counts, connect everything, and never cross", { timeout: 60_000 }, () => {
    let produced = 0;
    for (let seed = 1; seed <= 30; seed++) {
      const result = generateHashi(8, mulberry32(seed));
      if (!result) continue;
      produced++;
      const { islands, bridges, size } = result;

      const coords = new Set(islands.map((i) => `${i.row},${i.col}`));
      expect(coords.size).toBe(islands.length);
      for (const isl of islands) {
        expect(isl.count).toBeGreaterThanOrEqual(1);
        expect(isl.count).toBeLessThanOrEqual(8);
      }

      // Bridges reference valid islands and match their counts exactly.
      const degree = new Array(islands.length).fill(0);
      const bridgeKeys = new Set<string>();
      for (const br of bridges) {
        expect(br.a).toBeLessThan(br.b);
        degree[br.a] += br.count;
        degree[br.b] += br.count;
        bridgeKeys.add(`${br.a}-${br.b}-${br.count}`);
      }
      islands.forEach((isl, i) => expect(degree[i]).toBe(isl.count));

      // Aligned, unobstructed, no crossings between any pair of bridges.
      for (const br of bridges) {
        const A = islands[br.a];
        const B = islands[br.b];
        expect(A.row === B.row || A.col === B.col).toBe(true);
      }
      for (let i = 0; i < bridges.length; i++) {
        for (let j = i + 1; j < bridges.length; j++) {
          const A1 = islands[bridges[i].a];
          const A2 = islands[bridges[i].b];
          const B1 = islands[bridges[j].a];
          const B2 = islands[bridges[j].b];
          const crosses =
            A1.row === A2.row && B1.col === B2.col &&
            Math.min(B1.row, B2.row) < A1.row && A1.row < Math.max(B1.row, B2.row) &&
            Math.min(A1.col, A2.col) < B1.col && B1.col < Math.max(A1.col, A2.col);
          const crossesReverse =
            A1.col === A2.col && B1.row === B2.row &&
            Math.min(A1.row, A2.row) < B1.row && B1.row < Math.max(A1.row, A2.row) &&
            Math.min(B1.col, B2.col) < A1.col && A1.col < Math.max(B1.col, B2.col);
          expect(crosses || crossesReverse).toBe(false);
        }
      }

      // Whole network connected.
      const parent = islands.map((_, i) => i);
      const find = (x: number): number => {
        while (parent[x] !== x) {
          parent[x] = parent[parent[x]];
          x = parent[x];
        }
        return x;
      };
      for (const br of bridges) {
        const ra = find(br.a);
        const rb = find(br.b);
        if (ra !== rb) parent[ra] = rb;
      }
      const root = find(0);
      for (let i = 1; i < islands.length; i++) expect(find(i)).toBe(root);

      void size;

      // Solver confirms the printed counts admit only this layout.
      expect(countHashiSolutions(islands, 2)).toBe(1);
    }
    expect(produced).toBeGreaterThan(0);
  });
});

describe("generateLogicGrid", () => {
  it("is deterministic per seed", () => {
    for (const seed of [26]) {
      const a = generateLogicGrid("medium", mulberry32(seed));
      const b = generateLogicGrid("medium", mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("solution is a bijection between primary category and every other category", () => {
    for (let seed = 1; seed <= 80; seed++) {
      const difficulty = (["easy", "medium", "hard"] as const)[seed % 3];
      const { categories, clues, solution } = generateLogicGrid(
        difficulty,
        mulberry32(seed)
      );

      const sizes = categories.map((cat) => cat.items.length);
      expect(new Set(sizes).size).toBe(1); // all categories equal size
      for (const items of categories) {
        expect(new Set(items.items).size).toBe(items.items.length);
      }

      const primary = categories[0];
      const others = categories.slice(1);
      for (const other of others) {
        const mapped = primary.items.map((item) => solution[item][other.name]);
        expect(new Set(mapped).size).toBe(primary.items.length);
        for (const value of mapped) {
          expect(other.items).toContain(value);
        }
      }

      expect(clues.length).toBeGreaterThan(0);
      for (const clue of clues) {
        expect(clue.length).toBeGreaterThan(0);
      }
    }
  });
});
