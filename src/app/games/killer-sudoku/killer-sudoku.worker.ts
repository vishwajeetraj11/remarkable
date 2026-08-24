/// <reference lib="webworker" />

import { generateKillerSudoku } from "@/lib/generators/killer-sudoku";
import type { SudokuDifficulty } from "@/lib/generators/sudoku";

type KillerWorkerRequest = {
  difficulty: SudokuDifficulty;
  count: number;
};

const workerScope = self as unknown as DedicatedWorkerGlobalScope;

workerScope.addEventListener(
  "message",
  (event: MessageEvent<KillerWorkerRequest>) => {
    try {
      const { difficulty, count } = event.data;
      const puzzles = Array.from({ length: count }, () =>
        generateKillerSudoku(difficulty),
      );
      if (puzzles.some((p) => p === null)) {
        workerScope.postMessage({
          error: "Could not generate a unique killer sudoku — try again.",
        });
        return;
      }
      workerScope.postMessage({ puzzles });
    } catch (error) {
      workerScope.postMessage({
        error:
          error instanceof Error
            ? error.message
            : "Killer sudoku generation failed",
      });
    }
  },
);
