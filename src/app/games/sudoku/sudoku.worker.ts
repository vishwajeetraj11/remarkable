/// <reference lib="webworker" />

import {
  generateSudoku,
  type SudokuDifficulty,
} from "@/lib/generators/sudoku";

type SudokuWorkerRequest = {
  difficulty: SudokuDifficulty;
  count: number;
};

const workerScope = self as unknown as DedicatedWorkerGlobalScope;

workerScope.addEventListener(
  "message",
  (event: MessageEvent<SudokuWorkerRequest>) => {
    try {
      const { difficulty, count } = event.data;
      const puzzles = Array.from({ length: count }, () =>
        generateSudoku(difficulty),
      );
      workerScope.postMessage({ puzzles });
    } catch (error) {
      workerScope.postMessage({
        error: error instanceof Error ? error.message : "Sudoku generation failed",
      });
    }
  },
);
