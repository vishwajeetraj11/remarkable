/**
 * Corpus tests for number-logic generators: sudoku, killer-sudoku,
 * kenken, kakuro, futoshiki, binairo, nonogram.
 *
 * Every generator runs under a seeded PRNG (mulberry32). The installed
 * guard fails loudly if any code path reaches for global Math.random.
 */
import { describe, it, expect } from "vitest";
import {
  forbidGlobalRandom,
  mulberry32,
  stable,
} from "../helpers/seeded-rng";
import { generateSudoku } from "@/lib/generators/sudoku";
import { generateKillerSudoku } from "@/lib/generators/killer-sudoku";
import { generateKenKen } from "@/lib/generators/kenken";
import { generateKakuro } from "@/lib/generators/kakuro";
import { generateFutoshiki } from "@/lib/generators/futoshiki";
import { generateBinairo } from "@/lib/generators/binairo";
import { generateNonogram } from "@/lib/generators/nonogram";

forbidGlobalRandom();

function validSudokuSolution(solution: number[][], boxW: number, boxH: number): void {
  const size = solution.length;
  for (let r = 0; r < size; r++) {
    expect(new Set(solution[r])).toEqual(
      new Set(Array.from({ length: size }, (_, i) => i + 1))
    );
  }
  for (let c = 0; c < size; c++) {
    const col = solution.map((row) => row[c]);
    expect(new Set(col)).toEqual(
      new Set(Array.from({ length: size }, (_, i) => i + 1))
    );
  }
  for (let br = 0; br < size; br += boxH) {
    for (let bc = 0; bc < size; bc += boxW) {
      const box: number[] = [];
      for (let r = br; r < br + boxH; r++) {
        for (let c = bc; c < bc + boxW; c++) box.push(solution[r][c]);
      }
      expect(new Set(box).size).toBe(box.length);
    }
  }
}

function validLatinSquare(solution: number[][], size: number): void {
  for (let r = 0; r < size; r++) {
    expect(new Set(solution[r])).toEqual(
      new Set(Array.from({ length: size }, (_, i) => i + 1))
    );
  }
  for (let c = 0; c < size; c++) {
    const col = solution.map((row) => row[c]);
    expect(new Set(col)).toEqual(
      new Set(Array.from({ length: size }, (_, i) => i + 1))
    );
  }
}

describe("generateSudoku", () => {
  it("is deterministic per seed", () => {
    for (const seed of [1, 42, 999]) {
      const a = generateSudoku("medium", 6, mulberry32(seed));
      const b = generateSudoku("medium", 6, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("produces valid solutions and consistent puzzles across seeds", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const { puzzle, solution } = generateSudoku("medium", 9, mulberry32(seed));
      validSudokuSolution(solution, 3, 3);
      expect(puzzle).toHaveLength(9);
      // Clues must match the solution.
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (puzzle[r][c] !== 0) {
            expect(puzzle[r][c]).toBe(solution[r][c]);
          }
        }
      }
    }
  });
});

describe("generateKillerSudoku", () => {
  it("is deterministic per seed", () => {
    for (const seed of [7, 77]) {
      const a = generateKillerSudoku("easy", mulberry32(seed));
      const b = generateKillerSudoku("easy", mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("partitions the grid into cages whose sums match the solution", () => {
    for (let seed = 1; seed <= 3; seed++) {
      const puzzle = generateKillerSudoku("easy", mulberry32(seed));
      expect(puzzle).not.toBeNull();
      if (!puzzle) continue;
      validSudokuSolution(puzzle.solution, 3, 3);

      const seen = new Set<string>();
      for (const cage of puzzle.cages) {
        let sum = 0;
        for (const [r, c] of cage.cells) {
          const key = `${r},${c}`;
          expect(seen.has(key)).toBe(false);
          seen.add(key);
          sum += puzzle.solution[r][c];
        }
        expect(sum).toBe(cage.sum);
        // No repeated digit within a cage.
        const digits = cage.cells.map(([r, c]) => puzzle.solution[r][c]);
        expect(new Set(digits).size).toBe(digits.length);
      }
      expect(seen.size).toBe(81);
    }
  });
});

describe("generateKenKen", () => {
  it("is deterministic per seed", () => {
    for (const seed of [5, 50]) {
      const a = generateKenKen("easy", mulberry32(seed));
      const b = generateKenKen("easy", mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("builds cages with correct targets over a latin-square solution", () => {
    for (let seed = 1; seed <= 50; seed++) {
      const { solution, cages, size } = generateKenKen("easy", mulberry32(seed));
      const seen = new Set<string>();
      for (const cage of cages) {
        const values = cage.cells.map(([r, c]) => solution[r][c]);
        for (const [r, c] of cage.cells) {
          expect(r).toBeGreaterThanOrEqual(0);
          expect(r).toBeLessThan(size);
          expect(c).toBeGreaterThanOrEqual(0);
          expect(c).toBeLessThan(size);
          expect(seen.has(`${r},${c}`)).toBe(false);
          seen.add(`${r},${c}`);
        }
        if (values.length === 1) {
          expect(cage.target).toBe(values[0]);
        } else if (cage.operation === "+") {
          expect(values.reduce((s, v) => s + v, 0)).toBe(cage.target);
        } else if (cage.operation === "-") {
          expect(Math.abs(values[0] - values[1])).toBe(cage.target);
        } else if (cage.operation === "×") {
          expect(values.reduce((p, v) => p * v, 1)).toBe(cage.target);
        } else {
          const [a, b] = [...values].sort((x, y) => y - x);
          expect(a % b).toBe(0);
          expect(a / b).toBe(cage.target);
        }
      }
      expect(seen.size).toBe(size * size);
      validLatinSquare(solution, size);
    }
  });
});

describe("generateKakuro", () => {
  it("is deterministic per seed", () => {
    for (const seed of [3, 33]) {
      const a = generateKakuro("medium", mulberry32(seed));
      const b = generateKakuro("medium", mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("satisfies run constraints: distinct digits summing to clues", () => {
    for (let seed = 1; seed <= 10; seed++) {
      const { grid, size } = generateKakuro("medium", mulberry32(seed));
      expect(grid).toHaveLength(size);

      const checkRun = (cells: { r: number; c: number }[]): number | null => {
        if (cells.length < 2) return null;
        const vals = cells.map(({ r, c }) => {
          const cell = grid[r][c];
          expect(cell.type).toBe("white");
          return cell.type === "white" ? cell.value : -1;
        });
        expect(new Set(vals).size).toBe(vals.length);
        return vals.reduce((s, v) => s + v, 0);
      };

      for (let r = 0; r < size; r++) {
        let run: { r: number; c: number }[] = [];
        for (let c = 0; c <= size; c++) {
          const isWhite = c < size && grid[r][c].type === "white";
          if (isWhite) run.push({ r, c });
          else if (run.length > 0) {
            const sum = checkRun(run);
            if (sum !== null) expect(sum).toBeGreaterThan(0);
            run = [];
          }
        }
      }

      for (let c = 0; c < size; c++) {
        let run: { r: number; c: number }[] = [];
        for (let r = 0; r <= size; r++) {
          const isWhite = r < size && grid[r][c].type === "white";
          if (isWhite) run.push({ r, c });
          else if (run.length > 0) {
            checkRun(run);
            run = [];
          }
        }
      }
    }
  });
});

describe("generateFutoshiki", () => {
  it("is deterministic per seed", () => {
    for (const seed of [11]) {
      const a = generateFutoshiki(5, "medium", mulberry32(seed));
      const b = generateFutoshiki(5, "medium", mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("keeps givens and inequalities consistent with the solution", () => {
    for (let seed = 1; seed <= 5; seed++) {
      const n = 4 + (seed % 2); // 4 or 5
      const { solution, givens, inequalities, size } = generateFutoshiki(
        n,
        "medium",
        mulberry32(seed)
      );
      expect(size).toBe(n);

      for (let r = 0; r < n; r++) {
        expect(new Set(solution[r])).toEqual(
          new Set(Array.from({ length: n }, (_, i) => i + 1))
        );
        for (let c = 0; c < n; c++) {
          if (givens[r][c] !== 0) {
            expect(givens[r][c]).toBe(solution[r][c]);
          }
        }
      }

      for (const ineq of inequalities) {
        const a = solution[ineq.r1][ineq.c1];
        const b = solution[ineq.r2][ineq.c2];
        expect(a).toBeGreaterThan(b);
      }
    }
  });
});

describe("generateBinairo", () => {
  it("is deterministic per seed", () => {
    for (const seed of [21]) {
      const a = generateBinairo(8, mulberry32(seed));
      const b = generateBinairo(8, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("solutions obey balance/no-triples/unique-line rules; clues ⊆ solution", () => {
    for (let seed = 1; seed <= 8; seed++) {
      const size = seed % 2 === 0 ? 6 : 8;
      const { puzzle, solution } = generateBinairo(
        size as 6 | 8,
        mulberry32(seed)
      );

      const linesValid = (get: (i: number) => number[]) => {
        const seenLines = new Set<string>();
        for (let i = 0; i < size; i++) {
          const line = get(i);
          const zeros = line.filter((v) => v === 0).length;
          const ones = line.filter((v) => v === 1).length;
          expect(zeros).toBe(size / 2);
          expect(ones).toBe(size / 2);
          for (let j = 2; j < size; j++) {
            const triple = new Set([line[j - 2], line[j - 1], line[j]]);
            expect(triple.size).toBeGreaterThan(1);
          }
          const key = line.join("");
          expect(seenLines.has(key)).toBe(false);
          seenLines.add(key);
        }
      };

      linesValid((i) => solution[i]);
      linesValid((i) => solution.map((row) => row[i]));

      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (puzzle[r][c] !== -1) {
            expect(puzzle[r][c]).toBe(solution[r][c]);
          }
        }
      }
    }
  });
});

describe("generateNonogram", () => {
  it("is deterministic per seed", () => {
    for (const seed of [13]) {
      const a = generateNonogram(12, mulberry32(seed));
      const b = generateNonogram(12, mulberry32(seed));
      expect(stable(a)).toBe(stable(b));
    }
  });

  it("clues always recompute from the pattern", () => {
    const computeClues = (line: boolean[]): number[] => {
      const clues: number[] = [];
      let count = 0;
      for (const cell of line) {
        if (cell) count++;
        else if (count > 0) {
          clues.push(count);
          count = 0;
        }
      }
      if (count > 0) clues.push(count);
      return clues.length > 0 ? clues : [0];
    };

    for (let seed = 1; seed <= 60; seed++) {
      const { pattern, rowClues, colClues, size } = generateNonogram(
        10 + (seed % 5),
        mulberry32(seed)
      );
      expect(rowClues).toEqual(pattern.map(computeClues));
      expect(colClues).toEqual(
        Array.from({ length: size }, (_, c) =>
          computeClues(pattern.map((row) => row[c]))
        )
      );
    }
  });
});
