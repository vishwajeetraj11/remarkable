/**
 * Bundle puzzle adapter registry. Every bundle-able puzzle type implements
 * { id, label, generate, draw, drawAnswer } so the bundle PDF pipeline can
 * iterate adapters generically instead of switching on puzzle types.
 *
 * `generate` may return null (some engines fail their uniqueness gates);
 * callers use generateWithRetry. Renderer errors are contained by safeDraw /
 * safeDrawAnswer so one broken page can never corrupt later ones.
 */
import type jsPDF from "jspdf";

import { generateSudoku, type SudokuPuzzle } from "@/lib/generators/sudoku";
import {
  generateCrossword,
  type CrosswordPuzzle,
} from "@/lib/generators/crossword";
import {
  generateWordSearch,
  type WordSearchPuzzle,
} from "@/lib/generators/word-search";
import { generateMaze, type MazePuzzle } from "@/lib/generators/maze";
import {
  generateNonogram,
  type NonogramPuzzle,
} from "@/lib/generators/nonogram";
import {
  generateWordScramble,
  type WordScramblePuzzle,
} from "@/lib/generators/word-scramble";
import {
  generateCryptogram,
  type CryptogramPuzzle,
} from "@/lib/generators/cryptogram";
import { generateKakuro, type KakuroPuzzle } from "@/lib/generators/kakuro";
import { generateKenKen, type KenKenPuzzle } from "@/lib/generators/kenken";
import {
  generateWordLadder,
  type WordLadderPuzzle,
} from "@/lib/generators/word-ladder";
import {
  generateNumberFill,
  type NumberFillPuzzle,
} from "@/lib/generators/number-fill";
import {
  generateLogicGrid,
  type LogicGridPuzzle,
} from "@/lib/generators/logic-grid";

const MARGIN = 40;

// ─── Shared drawing primitives ────────────────────────────────────────────────

function puzzleHeader(doc: jsPDF, title: string) {
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, MARGIN, MARGIN);
}

function drawGrid(
  doc: jsPDF,
  rows: number,
  cols: number,
  x: number,
  y: number,
  cellSize: number,
  values: (string | number | null)[][],
  opts?: {
    boldBorders?: number;
    blackCells?: boolean[][];
    fontScale?: number;
  },
) {
  const fs = (opts?.fontScale ?? 0.45) * cellSize;
  doc.setFontSize(fs);
  doc.setFont("helvetica", "normal");

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = x + c * cellSize;
      const cy = y + r * cellSize;

      if (opts?.blackCells?.[r]?.[c]) {
        doc.setFillColor(30, 30, 30);
        doc.rect(cx, cy, cellSize, cellSize, "F");
      }

      doc.setDrawColor(160);
      doc.setLineWidth(0.3);
      doc.rect(cx, cy, cellSize, cellSize);

      const val = values[r]?.[c];
      if (val !== null && val !== undefined && val !== 0) {
        doc.setTextColor(30);
        doc.text(
          String(val),
          cx + cellSize / 2,
          cy + cellSize / 2 + fs * 0.35,
          { align: "center" },
        );
      }
    }
  }

  if (opts?.boldBorders) {
    const b = opts.boldBorders;
    doc.setDrawColor(0);
    doc.setLineWidth(1.2);
    for (let br = 0; br <= rows; br += b) {
      doc.line(x, y + br * cellSize, x + cols * cellSize, y + br * cellSize);
    }
    for (let bc = 0; bc <= cols; bc += b) {
      doc.line(x + bc * cellSize, y, x + bc * cellSize, y + rows * cellSize);
    }
  }

  doc.setDrawColor(0);
  doc.setLineWidth(1);
  doc.rect(x, y, cols * cellSize, rows * cellSize);
}

// ─── Adapter contract ─────────────────────────────────────────────────────────

export interface BundlePageContext {
  /** Page width in pt. */
  pw: number;
  /** Page height in pt. */
  ph: number;
}

export interface BundlePuzzleAdapter<T = unknown> {
  id: string;
  label: string;
  /**
   * Build one puzzle instance. Returns null when the engine's acceptance
   * gate rejects the board (e.g. uniqueness checks).
   */
  generate: (rng?: () => number) => T | null;
  /** Render one full puzzle page (starts its own page). */
  draw: (
    doc: jsPDF,
    puzzle: T,
    ctx: BundlePageContext,
    idx: number,
  ) => void;
  /**
   * Render this puzzle's entry in the flowing answer-keys section.
   * Returns the updated cursor Y.
   */
  drawAnswer: (
    doc: jsPDF,
    puzzle: T,
    ctx: BundlePageContext,
    cy: number,
    idx: number,
  ) => number;
}

/** Retry a gated generator a few times before giving up. */
export function generateWithRetry<T>(
  adapter: BundlePuzzleAdapter<T>,
  rng?: () => number,
  attempts = 3,
): T | null {
  for (let i = 0; i < attempts; i++) {
    const p = adapter.generate(rng);
    if (p !== null && p !== undefined) return p;
  }
  return null;
}

/** Run an adapter draw without letting renderer errors escape. */
export function safeDraw(
  doc: jsPDF,
  adapter: BundlePuzzleAdapter<never>,
  puzzle: unknown,
  ctx: BundlePageContext,
  idx: number,
): boolean {
  try {
    (adapter.draw as (d: jsPDF, p: unknown, c: BundlePageContext, i: number) => void)(
      doc,
      puzzle,
      ctx,
      idx,
    );
    return true;
  } catch {
    // Isolate the failure on a fresh page so later puzzles stay intact.
    doc.addPage();
    return false;
  }
}

/** Answer-section twin of safeDraw; keeps the cursor sane after failures. */
export function safeDrawAnswer(
  doc: jsPDF,
  adapter: BundlePuzzleAdapter<never>,
  puzzle: unknown,
  ctx: BundlePageContext,
  cy: number,
  idx: number,
): number {
  try {
    return (
      adapter.drawAnswer as (
        d: jsPDF,
        p: unknown,
        c: BundlePageContext,
        y: number,
        i: number,
      ) => number
    )(doc, puzzle, ctx, cy, idx);
  } catch {
    return cy;
  }
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

const sudokuAdapter: BundlePuzzleAdapter<SudokuPuzzle> = {
  id: "sudoku",
  label: "Sudoku",
  generate: (rng) => generateSudoku("medium", 9, rng),
  draw(doc, puzzle, { pw }, idx) {
    puzzleHeader(doc, `Sudoku #${idx + 1}`);
    const cellSize = Math.min((pw - MARGIN * 2) / 9, 40);
    const ox = (pw - cellSize * 9) / 2;
    drawGrid(doc, 9, 9, ox, MARGIN + 20, cellSize, puzzle.puzzle, {
      boldBorders: 3,
    });
  },
  drawAnswer(doc, puzzle, { pw, ph }, cy, idx) {
    if (cy + 200 > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Sudoku #${idx + 1}`, MARGIN, cy);
    cy += 8;
    const cellSize = 16;
    const ox = (pw - cellSize * 9) / 2;
    drawGrid(doc, 9, 9, ox, cy, cellSize, puzzle.solution, { boldBorders: 3 });
    return cy + 9 * cellSize + 12;
  },
};

const crosswordAdapter: BundlePuzzleAdapter<CrosswordPuzzle> = {
  id: "crossword",
  label: "Crossword",
  generate: (rng) => generateCrossword("general", 15, rng),
  draw(doc, puzzle, { pw, ph }, idx) {
    puzzleHeader(doc, `Crossword #${idx + 1}`);
    const cellSize = Math.min((pw - MARGIN * 2) / puzzle.size, 28);
    const ox = (pw - cellSize * puzzle.size) / 2;
    const oy = MARGIN + 20;

    const display: (string | null)[][] = puzzle.grid.map((row) =>
      row.map((cell) => (cell === null ? null : "")),
    );
    const blacks: boolean[][] = puzzle.grid.map((row) =>
      row.map((cell) => cell === null),
    );

    drawGrid(doc, puzzle.size, puzzle.size, ox, oy, cellSize, display, {
      blackCells: blacks,
      fontScale: 0.3,
    });

    for (const w of puzzle.words) {
      doc.setFontSize(6);
      doc.setFont("helvetica", "bold");
      doc.text(
        String(w.number),
        ox + w.col * cellSize + 2,
        oy + w.row * cellSize + 7,
      );
    }

    let cy = oy + puzzle.size * cellSize + 20;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Across", MARGIN, cy);
    cy += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (const w of puzzle.words.filter((w) => w.direction === "across")) {
      doc.text(`${w.number}. ${w.clue}`, MARGIN, cy);
      cy += 10;
      if (cy > ph - MARGIN) {
        doc.addPage();
        cy = MARGIN;
      }
    }
    cy += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Down", MARGIN, cy);
    cy += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (const w of puzzle.words.filter((w) => w.direction === "down")) {
      doc.text(`${w.number}. ${w.clue}`, MARGIN, cy);
      cy += 10;
      if (cy > ph - MARGIN) {
        doc.addPage();
        cy = MARGIN;
      }
    }
  },
  drawAnswer(doc, puzzle, { ph }, cy, idx) {
    if (cy + 20 > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Crossword #${idx + 1}`, MARGIN, cy);
    cy += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (const w of puzzle.words) {
      doc.text(`${w.number} ${w.direction}: ${w.word}`, MARGIN + 4, cy);
      cy += 9;
      if (cy > ph - MARGIN) {
        doc.addPage();
        cy = MARGIN;
      }
    }
    return cy + 6;
  },
};

const wordSearchAdapter: BundlePuzzleAdapter<WordSearchPuzzle> = {
  id: "word-search",
  label: "Word Search",
  generate: (rng) => generateWordSearch("animals", 15, undefined, rng),
  draw(doc, puzzle, { pw }, idx) {
    puzzleHeader(doc, `Word Search #${idx + 1}`);
    const cellSize = Math.min((pw - MARGIN * 2) / puzzle.size, 28);
    const ox = (pw - cellSize * puzzle.size) / 2;
    drawGrid(doc, puzzle.size, puzzle.size, ox, MARGIN + 20, cellSize, puzzle.grid);

    const cy = MARGIN + 20 + puzzle.size * cellSize + 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const cols = 3;
    const colWidth = (pw - MARGIN * 2) / cols;
    puzzle.words.forEach((word, i) => {
      doc.text(word, MARGIN + ((i % cols) * colWidth), cy + Math.floor(i / cols) * 12);
    });
  },
  drawAnswer(doc, _puzzle, { ph }, cy, idx) {
    if (cy + 14 > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Word Search #${idx + 1} — all words present in grid`, MARGIN, cy);
    return cy + 14;
  },
};

const mazeAdapter: BundlePuzzleAdapter<MazePuzzle> = {
  id: "maze",
  label: "Maze",
  generate: (rng) => generateMaze(20, 20, rng),
  draw(doc, puzzle, { pw, ph }, idx) {
    puzzleHeader(doc, `Maze #${idx + 1}`);
    const maxW = pw - MARGIN * 2;
    const maxH = ph - MARGIN * 2 - 30;
    const cellSize = Math.min(maxW / puzzle.width, maxH / puzzle.height, 24);
    const ox = (pw - cellSize * puzzle.width) / 2;
    const oy = MARGIN + 24;

    doc.setDrawColor(0);
    doc.setLineWidth(0.8);

    for (let r = 0; r < puzzle.height; r++) {
      for (let c = 0; c < puzzle.width; c++) {
        const cell = puzzle.grid[r][c];
        const cx = ox + c * cellSize;
        const cy = oy + r * cellSize;
        if (cell.top) doc.line(cx, cy, cx + cellSize, cy);
        if (cell.left) doc.line(cx, cy, cx, cy + cellSize);
        if (r === puzzle.height - 1 && cell.bottom)
          doc.line(cx, cy + cellSize, cx + cellSize, cy + cellSize);
        if (c === puzzle.width - 1 && cell.right)
          doc.line(cx + cellSize, cy, cx + cellSize, cy + cellSize);
      }
    }

    doc.setFontSize(8);
    doc.text("S", ox + cellSize * 0.3, oy + cellSize * 0.6);
    doc.text(
      "E",
      ox + (puzzle.width - 1) * cellSize + cellSize * 0.3,
      oy + (puzzle.height - 1) * cellSize + cellSize * 0.6,
    );
  },
  drawAnswer(doc, puzzle, { ph }, cy, idx) {
    if (cy + 14 > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(
      `Maze #${idx + 1} — solution length: ${puzzle.solution.length} steps`,
      MARGIN,
      cy,
    );
    return cy + 14;
  },
};

const nonogramAdapter: BundlePuzzleAdapter<NonogramPuzzle> = {
  id: "nonogram",
  label: "Nonogram",
  generate: (rng) => generateNonogram(10, rng),
  draw(doc, puzzle, { pw }, idx) {
    puzzleHeader(doc, `Nonogram #${idx + 1}`);
    const maxClueWidth = 60;
    const available = pw - MARGIN * 2 - maxClueWidth;
    const cellSize = Math.min(available / puzzle.size, 22);
    const ox = MARGIN + maxClueWidth;
    const oy = MARGIN + 60;

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");

    for (let c = 0; c < puzzle.size; c++) {
      const clues = puzzle.colClues[c];
      clues.forEach((n, i) => {
        doc.text(
          String(n),
          ox + c * cellSize + cellSize / 2,
          oy - (clues.length - i) * 8 - 2,
          { align: "center" },
        );
      });
    }

    for (let r = 0; r < puzzle.size; r++) {
      doc.text(puzzle.rowClues[r].join("  "), ox - 4, oy + r * cellSize + cellSize / 2 + 2, {
        align: "right",
      });
    }

    const blank: (string | null)[][] = Array.from({ length: puzzle.size }, () =>
      Array(puzzle.size).fill(""),
    );
    drawGrid(doc, puzzle.size, puzzle.size, ox, oy, cellSize, blank);
  },
  drawAnswer(doc, puzzle, { pw, ph }, cy, idx) {
    if (cy + puzzle.size * 10 + 20 > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Nonogram #${idx + 1}`, MARGIN, cy);
    cy += 10;
    const cellSize = Math.min((pw - MARGIN * 2) / puzzle.size, 12);
    const ox = (pw - cellSize * puzzle.size) / 2;
    const display: (string | null)[][] = puzzle.pattern.map((row) =>
      row.map((v) => (v ? "■" : "")),
    );
    drawGrid(doc, puzzle.size, puzzle.size, ox, cy, cellSize, display, {
      blackCells: puzzle.pattern,
      fontScale: 0.6,
    });
    return cy + puzzle.size * cellSize + 12;
  },
};

const wordScrambleAdapter: BundlePuzzleAdapter<WordScramblePuzzle> = {
  id: "word-scramble",
  label: "Word Scramble",
  generate: (rng) => generateWordScramble("medium", "everyday", 10, undefined, rng),
  draw(doc, puzzle, { ph }, idx) {
    puzzleHeader(doc, `Word Scramble #${idx + 1}`);
    let cy = MARGIN + 24;
    doc.setFont("helvetica", "normal");

    for (const entry of puzzle.scrambles) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(entry.scrambled, MARGIN, cy);
      cy += 14;
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text(`Hint: ${entry.hint}`, MARGIN + 8, cy);
      cy += 8;
      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      for (let i = 0; i < entry.answer.length; i++) {
        doc.line(MARGIN + 8 + i * 16, cy + 4, MARGIN + 8 + i * 16 + 12, cy + 4);
      }
      cy += 18;
      if (cy > ph - MARGIN) {
        doc.addPage();
        cy = MARGIN;
      }
    }
  },
  drawAnswer(doc, puzzle, { ph }, cy, idx) {
    if (cy + 14 > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Word Scramble #${idx + 1}`, MARGIN, cy);
    cy += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (const entry of puzzle.scrambles) {
      doc.text(`${entry.scrambled} → ${entry.answer}`, MARGIN + 4, cy);
      cy += 9;
      if (cy > ph - MARGIN) {
        doc.addPage();
        cy = MARGIN;
      }
    }
    return cy + 6;
  },
};

const cryptogramAdapter: BundlePuzzleAdapter<CryptogramPuzzle> = {
  id: "cryptogram",
  label: "Cryptogram",
  generate: (rng) => generateCryptogram(undefined, rng),
  draw(doc, puzzle, { pw }, idx) {
    puzzleHeader(doc, `Cryptogram #${idx + 1}`);
    const maxWidth = pw - MARGIN * 2;
    let cy = MARGIN + 30;

    doc.setFont("courier", "normal");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(puzzle.ciphertext, maxWidth);
    for (const line of lines) {
      doc.text(line, MARGIN, cy);
      cy += 20;
    }

    cy += 10;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text(`Hint: ${puzzle.hint}`, MARGIN, cy);
  },
  drawAnswer(doc, puzzle, { pw, ph }, cy, idx) {
    if (cy + 30 > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Cryptogram #${idx + 1}`, MARGIN, cy);
    cy += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const lines = doc.splitTextToSize(puzzle.plaintext, pw - MARGIN * 2 - 8);
    doc.text(lines, MARGIN + 4, cy);
    return cy + lines.length * 10 + 8;
  },
};

const kakuroAdapter: BundlePuzzleAdapter<KakuroPuzzle> = {
  id: "kakuro",
  label: "Kakuro",
  generate: (rng) => generateKakuro("medium", rng),
  draw(doc, puzzle, { pw }, idx) {
    puzzleHeader(doc, `Kakuro #${idx + 1}`);
    const cellSize = Math.min((pw - MARGIN * 2) / puzzle.size, 40);
    const ox = (pw - cellSize * puzzle.size) / 2;
    const oy = MARGIN + 20;

    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        const cx = ox + c * cellSize;
        const cy = oy + r * cellSize;
        const cell = puzzle.grid[r][c];

        if (cell.type === "black") {
          doc.setFillColor(30, 30, 30);
          doc.rect(cx, cy, cellSize, cellSize, "F");
        } else if (cell.type === "clue") {
          doc.setFillColor(60, 60, 60);
          doc.rect(cx, cy, cellSize, cellSize, "F");
          doc.setDrawColor(40);
          doc.line(cx, cy, cx + cellSize, cy + cellSize);
          doc.setFontSize(7);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(255, 255, 255);
          if (cell.across !== undefined) {
            doc.text(String(cell.across), cx + cellSize / 2 + 2, cy + cellSize - 3);
          }
          if (cell.down !== undefined) {
            doc.text(String(cell.down), cx + 3, cy + cellSize / 2 - 1);
          }
          doc.setTextColor(0);
        }

        doc.setDrawColor(120);
        doc.setLineWidth(0.3);
        doc.rect(cx, cy, cellSize, cellSize);
      }
    }
    doc.setDrawColor(0);
    doc.setLineWidth(1);
    doc.rect(ox, oy, puzzle.size * cellSize, puzzle.size * cellSize);
  },
  drawAnswer(doc, puzzle, { ph }, cy, idx) {
    if (cy + 14 > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Kakuro #${idx + 1}`, MARGIN, cy);
    cy += 10;
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    for (let r = 0; r < puzzle.size; r++) {
      const rowVals = puzzle.grid[r].map((cell) =>
        cell.type === "white" ? String(cell.value) : ".",
      );
      doc.text(rowVals.join(" "), MARGIN + 4, cy);
      cy += 8;
      if (cy > ph - MARGIN) {
        doc.addPage();
        cy = MARGIN;
      }
    }
    return cy + 6;
  },
};

const kenkenAdapter: BundlePuzzleAdapter<KenKenPuzzle> = {
  id: "kenken",
  label: "KenKen",
  generate: (rng) => generateKenKen("medium", rng),
  draw(doc, puzzle, { pw }, idx) {
    puzzleHeader(doc, `KenKen #${idx + 1}`);
    const cellSize = Math.min((pw - MARGIN * 2) / puzzle.size, 50);
    const ox = (pw - cellSize * puzzle.size) / 2;
    const oy = MARGIN + 20;

    const blank: (string | null)[][] = Array.from({ length: puzzle.size }, () =>
      Array(puzzle.size).fill(""),
    );
    drawGrid(doc, puzzle.size, puzzle.size, ox, oy, cellSize, blank);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    for (const cage of puzzle.cages) {
      const [r, c] = cage.cells.reduce(
        (min, [cr, cc]) =>
          cr < min[0] || (cr === min[0] && cc < min[1]) ? [cr, cc] : min,
        cage.cells[0],
      );
      doc.text(
        `${cage.target}${cage.cells.length > 1 ? cage.operation : ""}`,
        ox + c * cellSize + 2,
        oy + r * cellSize + 9,
      );

      doc.setDrawColor(0);
      doc.setLineWidth(1.5);
      for (const [cr, cc] of cage.cells) {
        const cx = ox + cc * cellSize;
        const cy = oy + cr * cellSize;
        const inCage = (dr: number, dc: number) =>
          cage.cells.some(([ar, ac]) => ar === cr + dr && ac === cc + dc);
        if (!inCage(-1, 0)) doc.line(cx, cy, cx + cellSize, cy);
        if (!inCage(1, 0)) doc.line(cx, cy + cellSize, cx + cellSize, cy + cellSize);
        if (!inCage(0, -1)) doc.line(cx, cy, cx, cy + cellSize);
        if (!inCage(0, 1)) doc.line(cx + cellSize, cy, cx + cellSize, cy + cellSize);
      }
    }
  },
  drawAnswer(doc, puzzle, { pw, ph }, cy, idx) {
    if (cy + puzzle.size * 16 + 20 > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`KenKen #${idx + 1}`, MARGIN, cy);
    cy += 10;
    const cellSize = Math.min((pw - MARGIN * 2) / puzzle.size, 20);
    const ox = (pw - cellSize * puzzle.size) / 2;
    drawGrid(doc, puzzle.size, puzzle.size, ox, cy, cellSize, puzzle.solution);
    return cy + puzzle.size * cellSize + 12;
  },
};

const wordLadderAdapter: BundlePuzzleAdapter<WordLadderPuzzle> = {
  id: "word-ladder",
  label: "Word Ladder",
  generate: (rng) => generateWordLadder("medium", 4, rng),
  draw(doc, puzzle, { pw }, idx) {
    puzzleHeader(doc, `Word Ladder #${idx + 1}`);
    const cx = pw / 2;
    let cy = MARGIN + 36;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(
      "Change one letter at a time to get from the start word to the end word.",
      cx,
      cy,
      { align: "center" },
    );
    cy += 24;

    const boxW = 120;
    const boxH = 28;

    for (let i = 0; i < puzzle.steps.length; i++) {
      const bx = cx - boxW / 2;
      doc.setDrawColor(100);
      doc.setLineWidth(0.5);
      doc.rect(bx, cy, boxW, boxH);

      if (i === 0 || i === puzzle.steps.length - 1) {
        doc.setFont("courier", "bold");
        doc.setFontSize(16);
        doc.text(puzzle.steps[i], cx, cy + boxH / 2 + 5, { align: "center" });
      } else {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(9);
        doc.setTextColor(160);
        doc.text("?", cx, cy + boxH / 2 + 3, { align: "center" });
        doc.setTextColor(0);
      }

      cy += boxH;
      if (i < puzzle.steps.length - 1) {
        doc.setDrawColor(160);
        doc.line(cx, cy, cx, cy + 8);
        cy += 8;
      }
    }
  },
  drawAnswer(doc, puzzle, { ph }, cy, idx) {
    if (cy + 14 > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Word Ladder #${idx + 1}`, MARGIN, cy);
    cy += 10;
    doc.setFont("courier", "normal");
    doc.setFontSize(8);
    doc.text(puzzle.steps.join(" → "), MARGIN + 4, cy);
    return cy + 14;
  },
};

const numberFillAdapter: BundlePuzzleAdapter<NumberFillPuzzle> = {
  id: "number-fill",
  label: "Number Fill",
  generate: (rng) => generateNumberFill(rng),
  draw(doc, puzzle, { pw, ph }, idx) {
    puzzleHeader(doc, `Number Fill #${idx + 1}`);
    const cellSize = Math.min((pw - MARGIN * 2) / puzzle.size, 28);
    const ox = (pw - cellSize * puzzle.size) / 2;
    const oy = MARGIN + 20;

    const blacks: boolean[][] = puzzle.grid.map((row) => row.map((v) => v === null));
    const blank: (string | null)[][] = puzzle.grid.map((row) =>
      row.map((v) => (v === null ? null : "")),
    );
    drawGrid(doc, puzzle.size, puzzle.size, ox, oy, cellSize, blank, {
      blackCells: blacks,
    });

    let cy = oy + puzzle.size * cellSize + 16;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Numbers to place:", MARGIN, cy);
    cy += 12;

    const byLength: Record<number, number[]> = {};
    for (const n of puzzle.numbers) {
      const len = String(n).length;
      if (!byLength[len]) byLength[len] = [];
      byLength[len].push(n);
    }

    for (const [len, nums] of Object.entries(byLength).sort(
      (a, b) => Number(a[0]) - Number(b[0]),
    )) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`${len} digits:`, MARGIN, cy);
      cy += 10;
      doc.setFont("courier", "normal");
      const line = nums.join("  ");
      const wrapped = doc.splitTextToSize(line, pw - MARGIN * 2);
      for (const wl of wrapped) {
        doc.text(wl, MARGIN + 4, cy);
        cy += 9;
        if (cy > ph - MARGIN) {
          doc.addPage();
          cy = MARGIN;
        }
      }
      cy += 4;
    }
  },
  drawAnswer(doc, puzzle, { pw, ph }, cy, idx) {
    if (cy + puzzle.size * 12 + 20 > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Number Fill #${idx + 1}`, MARGIN, cy);
    cy += 10;
    const cellSize = Math.min((pw - MARGIN * 2) / puzzle.size, 14);
    const ox = (pw - cellSize * puzzle.size) / 2;
    const blacks: boolean[][] = puzzle.grid.map((row) => row.map((v) => v === null));
    drawGrid(doc, puzzle.size, puzzle.size, ox, cy, cellSize, puzzle.grid, {
      blackCells: blacks,
      fontScale: 0.55,
    });
    return cy + puzzle.size * cellSize + 12;
  },
};

const logicGridAdapter: BundlePuzzleAdapter<LogicGridPuzzle> = {
  id: "logic-grid",
  label: "Logic Grid",
  generate: (rng) => generateLogicGrid("medium", rng),
  draw(doc, puzzle, { pw, ph }, idx) {
    puzzleHeader(doc, `Logic Grid #${idx + 1} — ${puzzle.title}`);
    let cy = MARGIN + 24;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const descLines = doc.splitTextToSize(puzzle.description, pw - MARGIN * 2);
    doc.text(descLines, MARGIN, cy);
    cy += descLines.length * 11 + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Categories:", MARGIN, cy);
    cy += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (const cat of puzzle.categories) {
      doc.text(`${cat.name}: ${cat.items.join(", ")}`, MARGIN + 4, cy);
      cy += 10;
    }

    cy += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Clues:", MARGIN, cy);
    cy += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    puzzle.clues.forEach((clue, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${clue}`, pw - MARGIN * 2 - 8);
      doc.text(lines, MARGIN + 4, cy);
      cy += lines.length * 10;
      if (cy > ph - MARGIN) {
        doc.addPage();
        cy = MARGIN;
      }
    });
  },
  drawAnswer(doc, puzzle, { ph }, cy, idx) {
    if (cy + 20 > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`Logic Grid #${idx + 1} — ${puzzle.title}`, MARGIN, cy);
    cy += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    for (const [person, attrs] of Object.entries(puzzle.solution)) {
      const parts = Object.entries(attrs)
        .map(([k, v]) => `${k}: ${v}`)
        .join(", ");
      doc.text(`${person} — ${parts}`, MARGIN + 4, cy);
      cy += 9;
      if (cy > ph - MARGIN) {
        doc.addPage();
        cy = MARGIN;
      }
    }
    return cy + 6;
  },
};

/**
 * The bundle registry. Order defines default book order.
 */
export const BUNDLE_ADAPTERS: BundlePuzzleAdapter<never>[] = [
  sudokuAdapter,
  crosswordAdapter,
  wordSearchAdapter,
  mazeAdapter,
  nonogramAdapter,
  wordScrambleAdapter,
  cryptogramAdapter,
  kakuroAdapter,
  kenkenAdapter,
  wordLadderAdapter,
  numberFillAdapter,
  logicGridAdapter,
] as unknown as BundlePuzzleAdapter<never>[];

export function getBundleAdapter(id: string): BundlePuzzleAdapter<never> | undefined {
  return BUNDLE_ADAPTERS.find((a) => a.id === id);
}
