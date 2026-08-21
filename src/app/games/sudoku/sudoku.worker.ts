/// <reference lib="webworker" />

import {
  generateSudoku,
  type SudokuDifficulty,
  type SudokuGridSize,
} from "@/lib/generators/sudoku";

type SudokuWorkerRequest = {
  difficulty: SudokuDifficulty;
  gridSize?: SudokuGridSize;
  count: number;
};

const workerScope = self as unknown as DedicatedWorkerGlobalScope;

workerScope.addEventListener(
  "message",
  (event: MessageEvent<SudokuWorkerRequest>) => {
    try {
      const { difficulty, gridSize, count } = event.data;
      const puzzles = Array.from({ length: count }, () =>
        generateSudoku(difficulty, gridSize ?? 9),
      );
      workerScope.postMessage({ puzzles });
    } catch (error) {
      workerScope.postMessage({
        error: error instanceof Error ? error.message : "Sudoku generation failed",
      });
    }
  },
);
