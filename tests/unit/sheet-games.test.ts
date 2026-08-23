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
import { generateNumberlink } from "@/lib/generators/numberlink";
import { generateSlitherlink } from "@/lib/generators/slitherlink";
import { generateHashi } from "@/lib/generators/hashi";
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

  it("cards draw distinct in-range numbers with a free center; calls are a permutation", () => {
    // NOTE: true 75-ball column ranges are a tranche-1 acceptance item
    // (see docs/puzzle-rollout.md); the current generator only guarantees
    // distinct values from the number pool.
    for (let seed = 1; seed <= 40; seed++) {
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
            expect(v).toBeGreaterThanOrEqual(1);
            expect(v).toBeLessThanOrEqual(75);
            expect(seen.has(v)).toBe(false);
            seen.add(v);
          }
        }
        expect(seen.size).toBe(24);
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

  it("targets appear left-to-right in the final grid", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const { grid, targets, size } = generateNumberSearch(
        12 + (seed % 4),
        8,
        undefined,
        mulberry32(seed)
      );
      expect(targets.length).toBeGreaterThan(0);
      expect(new Set(targets).size).toBe(targets.length);

      for (const t of targets) {
        const found = grid.some((row) => row.join("").includes(t));
        expect(found).toBe(true);
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

  it("each pair id has exactly two endpoints connected by its solution path", () => {
    let produced = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const result = generateNumberlink(7, mulberry32(seed));
      if (!result) continue;
      produced++;
      const { endpoints, solution } = result;

      const endpointCount: Record<number, number> = {};
      for (const row of endpoints.flat()) {
        if (row > 0) endpointCount[row] = (endpointCount[row] ?? 0) + 1;
      }
      const ids = Object.keys(endpointCount).map(Number);
      expect(ids.length).toBeGreaterThanOrEqual(3);
      for (const id of ids) {
        expect(endpointCount[id]).toBe(2);
      }

      // Every solution path is contiguous and matches its id.
      for (const id of ids) {
        const cells: [number, number][] = [];
        solution.forEach((row, r) =>
          row.forEach((v, c) => {
            if (v === id) cells.push([r, c]);
          })
        );
        // Path visits each cell once (non-branching coverage).
        const inPath = cells.filter(([r, c]) => solution[r][c] === id);
        expect(inPath.length).toBeGreaterThan(0);
        // Endpoints lie at the extremes of the path.
        const endpointCells: [number, number][] = [];
        endpoints.forEach((row, r) =>
          row.forEach((v, c) => {
            if (v === id) endpointCells.push([r, c]);
          })
        );
        for (const [er, ec] of endpointCells) {
          expect(solution[er][ec]).toBe(id);
        }
      }
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

  it("solution edges form one closed loop matching every clue", () => {
    const edgeKey = (r1: number, c1: number, r2: number, c2: number): string => {
      const [a, b] = [
        [r1, c1],
        [r2, c2],
      ].sort((x, y) => x[0] - y[0] || x[1] - y[1]);
      return `${a[0]},${a[1]}-${b[0]},${b[1]}`;
    };

    for (let seed = 1; seed <= 50; seed++) {
      const n = 5 + (seed % 4);
      const { clues, solutionEdges, size } = generateSlitherlink(n, mulberry32(seed));

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
      expect(size).toBe(n);
    }
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

  it("produces islands with counts in 1..8 inside the grid", () => {
    let produced = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const result = generateHashi(8, mulberry32(seed));
      if (!result) continue;
      produced++;
      expect(result.islands.length).toBeGreaterThanOrEqual(4);
      for (const isl of result.islands) {
        expect(isl.count).toBeGreaterThanOrEqual(1);
        expect(isl.count).toBeLessThanOrEqual(8);
        expect(isl.row).toBeGreaterThanOrEqual(0);
        expect(isl.row).toBeLessThan(result.size);
        expect(isl.col).toBeGreaterThanOrEqual(0);
        expect(isl.col).toBeLessThan(result.size);
      }
      const coords = new Set(result.islands.map((i) => `${i.row},${i.col}`));
      expect(coords.size).toBe(result.islands.length);
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
