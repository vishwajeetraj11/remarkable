"use client";

import { useState, useCallback } from "react";
import jsPDF from "jspdf";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { FileDown, Loader2 } from "lucide-react";

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

// ---------------------------------------------------------------------------

const PUZZLE_TYPES = [
  { id: "sudoku", label: "Sudoku" },
  { id: "crossword", label: "Crossword" },
  { id: "word-search", label: "Word Search" },
  { id: "maze", label: "Maze" },
  { id: "nonogram", label: "Nonogram" },
  { id: "word-scramble", label: "Word Scramble" },
  { id: "cryptogram", label: "Cryptogram" },
  { id: "kakuro", label: "Kakuro" },
  { id: "kenken", label: "KenKen" },
  { id: "word-ladder", label: "Word Ladder" },
  { id: "number-fill", label: "Number Fill" },
  { id: "logic-grid", label: "Logic Grid" },
] as const;

type PuzzleId = (typeof PUZZLE_TYPES)[number]["id"];

const PAGE_SIZES: Record<string, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
  "E-ink Tablet": [495.72, 661.68],
};

// ---------------------------------------------------------------------------
// PDF helpers
// ---------------------------------------------------------------------------

const MARGIN = 40;

function pageTitle(
  doc: jsPDF,
  title: string,
  pw: number,
  _ph: number,
  subtitle?: string,
) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(title, pw / 2, 60, { align: "center" });
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(subtitle, pw / 2, 80, { align: "center" });
  }
}

function sectionHeader(doc: jsPDF, title: string, pw: number) {
  doc.addPage();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, pw / 2, 60, { align: "center" });
  doc.setDrawColor(180);
  doc.line(MARGIN, 70, pw - MARGIN, 70);
}

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

// ---------------------------------------------------------------------------
// Per-type renderers (puzzle page)
// ---------------------------------------------------------------------------

function renderSudoku(
  doc: jsPDF,
  puzzle: SudokuPuzzle,
  pw: number,
  idx: number,
) {
  puzzleHeader(doc, `Sudoku #${idx + 1}`);
  const cellSize = Math.min((pw - MARGIN * 2) / 9, 40);
  const ox = (pw - cellSize * 9) / 2;
  drawGrid(doc, 9, 9, ox, MARGIN + 20, cellSize, puzzle.puzzle, {
    boldBorders: 3,
  });
}

function renderCrossword(
  doc: jsPDF,
  puzzle: CrosswordPuzzle,
  pw: number,
  ph: number,
  idx: number,
) {
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
    const line = `${w.number}. ${w.clue}`;
    doc.text(line, MARGIN, cy);
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
    const line = `${w.number}. ${w.clue}`;
    doc.text(line, MARGIN, cy);
    cy += 10;
    if (cy > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
  }
}

function renderWordSearch(
  doc: jsPDF,
  puzzle: WordSearchPuzzle,
  pw: number,
  idx: number,
) {
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
    const col = i % cols;
    const row = Math.floor(i / cols);
    doc.text(word, MARGIN + col * colWidth, cy + row * 12);
  });
}

function renderMaze(
  doc: jsPDF,
  puzzle: MazePuzzle,
  pw: number,
  ph: number,
  idx: number,
) {
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
}

function renderNonogram(
  doc: jsPDF,
  puzzle: NonogramPuzzle,
  pw: number,
  idx: number,
) {
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
    const clues = puzzle.rowClues[r];
    const clueStr = clues.join("  ");
    doc.text(clueStr, ox - 4, oy + r * cellSize + cellSize / 2 + 2, {
      align: "right",
    });
  }

  const blank: (string | null)[][] = Array.from({ length: puzzle.size }, () =>
    Array(puzzle.size).fill(""),
  );
  drawGrid(doc, puzzle.size, puzzle.size, ox, oy, cellSize, blank);
}

function renderWordScramble(
  doc: jsPDF,
  puzzle: WordScramblePuzzle,
  _pw: number,
  ph: number,
  idx: number,
) {
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
      doc.line(
        MARGIN + 8 + i * 16,
        cy + 4,
        MARGIN + 8 + i * 16 + 12,
        cy + 4,
      );
    }
    cy += 18;
    if (cy > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
  }
}

function renderCryptogram(
  doc: jsPDF,
  puzzle: CryptogramPuzzle,
  pw: number,
  idx: number,
) {
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
}

function renderKakuro(
  doc: jsPDF,
  puzzle: KakuroPuzzle,
  pw: number,
  idx: number,
) {
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
          doc.text(
            String(cell.across),
            cx + cellSize / 2 + 2,
            cy + cellSize - 3,
          );
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
}

function renderKenKen(
  doc: jsPDF,
  puzzle: KenKenPuzzle,
  pw: number,
  idx: number,
) {
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
      if (!inCage(1, 0))
        doc.line(cx, cy + cellSize, cx + cellSize, cy + cellSize);
      if (!inCage(0, -1)) doc.line(cx, cy, cx, cy + cellSize);
      if (!inCage(0, 1))
        doc.line(cx + cellSize, cy, cx + cellSize, cy + cellSize);
    }
  }
}

function renderWordLadder(
  doc: jsPDF,
  puzzle: WordLadderPuzzle,
  pw: number,
  idx: number,
) {
  puzzleHeader(doc, `Word Ladder #${idx + 1}`);
  const cx = pw / 2;
  let cy = MARGIN + 36;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Change one letter at a time to get from the start word to the end word.`,
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
}

function renderNumberFill(
  doc: jsPDF,
  puzzle: NumberFillPuzzle,
  pw: number,
  ph: number,
  idx: number,
) {
  puzzleHeader(doc, `Number Fill #${idx + 1}`);
  const cellSize = Math.min((pw - MARGIN * 2) / puzzle.size, 28);
  const ox = (pw - cellSize * puzzle.size) / 2;
  const oy = MARGIN + 20;

  const blacks: boolean[][] = puzzle.grid.map((row) =>
    row.map((v) => v === null),
  );
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
  doc.setFont("courier", "normal");
  doc.setFontSize(8);

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
}

function renderLogicGrid(
  doc: jsPDF,
  puzzle: LogicGridPuzzle,
  pw: number,
  ph: number,
  idx: number,
) {
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
    const lines = doc.splitTextToSize(
      `${i + 1}. ${clue}`,
      pw - MARGIN * 2 - 8,
    );
    doc.text(lines, MARGIN + 4, cy);
    cy += lines.length * 10;
    if (cy > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
  });
}

// ---------------------------------------------------------------------------
// Answer key renderers
// ---------------------------------------------------------------------------

function answerSudoku(
  doc: jsPDF,
  puzzle: SudokuPuzzle,
  pw: number,
  ph: number,
  cy: number,
  idx: number,
): number {
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
}

function answerCrossword(
  doc: jsPDF,
  puzzle: CrosswordPuzzle,
  pw: number,
  ph: number,
  cy: number,
  idx: number,
): number {
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
    const line = `${w.number} ${w.direction}: ${w.word}`;
    doc.text(line, MARGIN + 4, cy);
    cy += 9;
    if (cy > ph - MARGIN) {
      doc.addPage();
      cy = MARGIN;
    }
  }
  return cy + 6;
}

function answerWordSearch(
  doc: jsPDF,
  _puzzle: WordSearchPuzzle,
  _pw: number,
  ph: number,
  cy: number,
  idx: number,
): number {
  if (cy + 14 > ph - MARGIN) {
    doc.addPage();
    cy = MARGIN;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Word Search #${idx + 1} — all words present in grid`, MARGIN, cy);
  return cy + 14;
}

function answerMaze(
  doc: jsPDF,
  puzzle: MazePuzzle,
  _pw: number,
  ph: number,
  cy: number,
  idx: number,
): number {
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
}

function answerNonogram(
  doc: jsPDF,
  puzzle: NonogramPuzzle,
  pw: number,
  ph: number,
  cy: number,
  idx: number,
): number {
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
  const blacks: boolean[][] = puzzle.pattern;
  drawGrid(doc, puzzle.size, puzzle.size, ox, cy, cellSize, display, {
    blackCells: blacks,
    fontScale: 0.6,
  });
  return cy + puzzle.size * cellSize + 12;
}

function answerWordScramble(
  doc: jsPDF,
  puzzle: WordScramblePuzzle,
  _pw: number,
  ph: number,
  cy: number,
  idx: number,
): number {
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
}

function answerCryptogram(
  doc: jsPDF,
  puzzle: CryptogramPuzzle,
  pw: number,
  ph: number,
  cy: number,
  idx: number,
): number {
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
}

function answerKakuro(
  doc: jsPDF,
  puzzle: KakuroPuzzle,
  _pw: number,
  ph: number,
  cy: number,
  idx: number,
): number {
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
}

function answerKenKen(
  doc: jsPDF,
  puzzle: KenKenPuzzle,
  pw: number,
  ph: number,
  cy: number,
  idx: number,
): number {
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
}

function answerWordLadder(
  doc: jsPDF,
  puzzle: WordLadderPuzzle,
  _pw: number,
  ph: number,
  cy: number,
  idx: number,
): number {
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
}

function answerNumberFill(
  doc: jsPDF,
  puzzle: NumberFillPuzzle,
  pw: number,
  ph: number,
  cy: number,
  idx: number,
): number {
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
  const blacks: boolean[][] = puzzle.grid.map((row) =>
    row.map((v) => v === null),
  );
  drawGrid(doc, puzzle.size, puzzle.size, ox, cy, cellSize, puzzle.grid, {
    blackCells: blacks,
    fontScale: 0.55,
  });
  return cy + puzzle.size * cellSize + 12;
}

function answerLogicGrid(
  doc: jsPDF,
  puzzle: LogicGridPuzzle,
  _pw: number,
  ph: number,
  cy: number,
  idx: number,
): number {
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
}

// ---------------------------------------------------------------------------
// Generator orchestrator
// ---------------------------------------------------------------------------

type GeneratedPuzzle =
  | { type: "sudoku"; data: SudokuPuzzle }
  | { type: "crossword"; data: CrosswordPuzzle }
  | { type: "word-search"; data: WordSearchPuzzle }
  | { type: "maze"; data: MazePuzzle }
  | { type: "nonogram"; data: NonogramPuzzle }
  | { type: "word-scramble"; data: WordScramblePuzzle }
  | { type: "cryptogram"; data: CryptogramPuzzle }
  | { type: "kakuro"; data: KakuroPuzzle }
  | { type: "kenken"; data: KenKenPuzzle }
  | { type: "word-ladder"; data: WordLadderPuzzle }
  | { type: "number-fill"; data: NumberFillPuzzle }
  | { type: "logic-grid"; data: LogicGridPuzzle };

function generatePuzzles(
  types: PuzzleId[],
  countPerType: number,
): Map<PuzzleId, GeneratedPuzzle[]> {
  const result = new Map<PuzzleId, GeneratedPuzzle[]>();

  for (const t of types) {
    const puzzles: GeneratedPuzzle[] = [];
    for (let i = 0; i < countPerType; i++) {
      switch (t) {
        case "sudoku":
          puzzles.push({ type: t, data: generateSudoku("medium") });
          break;
        case "crossword":
          puzzles.push({ type: t, data: generateCrossword("general") });
          break;
        case "word-search":
          puzzles.push({ type: t, data: generateWordSearch("animals") });
          break;
        case "maze":
          puzzles.push({ type: t, data: generateMaze(20, 20) });
          break;
        case "nonogram":
          puzzles.push({ type: t, data: generateNonogram(10) });
          break;
        case "word-scramble":
          puzzles.push({
            type: t,
            data: generateWordScramble("medium", "everyday", 10),
          });
          break;
        case "cryptogram":
          puzzles.push({ type: t, data: generateCryptogram() });
          break;
        case "kakuro":
          puzzles.push({ type: t, data: generateKakuro("medium") });
          break;
        case "kenken":
          puzzles.push({ type: t, data: generateKenKen("medium") });
          break;
        case "word-ladder":
          puzzles.push({ type: t, data: generateWordLadder("medium") });
          break;
        case "number-fill":
          puzzles.push({ type: t, data: generateNumberFill() });
          break;
        case "logic-grid":
          puzzles.push({ type: t, data: generateLogicGrid("medium") });
          break;
      }
    }
    result.set(t, puzzles);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BundleGenerator() {
  const [selected, setSelected] = useState<Set<PuzzleId>>(
    () => new Set(PUZZLE_TYPES.map((p) => p.id)),
  );
  const [perType, setPerType] = useState(2);
  const [pageSize, setPageSize] = useState("A4");
  const [generating, setGenerating] = useState(false);

  const toggle = useCallback((id: PuzzleId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    if (selected.size === 0) return;
    setGenerating(true);

    // Yield to let the UI show the loading state
    await new Promise((r) => setTimeout(r, 50));

    try {
      const [pw, ph] = PAGE_SIZES[pageSize];
      const doc = new jsPDF({
        unit: "pt",
        format: [pw, ph],
      });

      const types = PUZZLE_TYPES.filter((p) => selected.has(p.id)).map(
        (p) => p.id,
      );
      const allPuzzles = generatePuzzles(types, perType);

      // Title page
      pageTitle(doc, "Puzzle Bundle", pw, ph, `${types.length} puzzle types · ${perType} each`);
      let cy = 100;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      for (const t of types) {
        const label = PUZZLE_TYPES.find((p) => p.id === t)?.label ?? t;
        doc.text(`• ${label}`, pw / 2 - 60, cy);
        cy += 16;
      }

      // Render each type
      for (const t of types) {
        const label = PUZZLE_TYPES.find((p) => p.id === t)?.label ?? t;
        sectionHeader(doc, `${label} Puzzles`, pw);

        const puzzles = allPuzzles.get(t) ?? [];
        for (let i = 0; i < puzzles.length; i++) {
          const p = puzzles[i];
          switch (p.type) {
            case "sudoku":
              renderSudoku(doc, p.data, pw, i);
              break;
            case "crossword":
              renderCrossword(doc, p.data, pw, ph, i);
              break;
            case "word-search":
              renderWordSearch(doc, p.data, pw, i);
              break;
            case "maze":
              renderMaze(doc, p.data, pw, ph, i);
              break;
            case "nonogram":
              renderNonogram(doc, p.data, pw, i);
              break;
            case "word-scramble":
              renderWordScramble(doc, p.data, pw, ph, i);
              break;
            case "cryptogram":
              renderCryptogram(doc, p.data, pw, i);
              break;
            case "kakuro":
              renderKakuro(doc, p.data, pw, i);
              break;
            case "kenken":
              renderKenKen(doc, p.data, pw, i);
              break;
            case "word-ladder":
              renderWordLadder(doc, p.data, pw, i);
              break;
            case "number-fill":
              renderNumberFill(doc, p.data, pw, ph, i);
              break;
            case "logic-grid":
              renderLogicGrid(doc, p.data, pw, ph, i);
              break;
          }
        }
      }

      // Answer keys
      doc.addPage();
      pageTitle(doc, "Answer Keys", pw, ph);
      let acy = 100;

      for (const t of types) {
        const puzzles = allPuzzles.get(t) ?? [];
        for (let i = 0; i < puzzles.length; i++) {
          const p = puzzles[i];
          switch (p.type) {
            case "sudoku":
              acy = answerSudoku(doc, p.data, pw, ph, acy, i);
              break;
            case "crossword":
              acy = answerCrossword(doc, p.data, pw, ph, acy, i);
              break;
            case "word-search":
              acy = answerWordSearch(doc, p.data, pw, ph, acy, i);
              break;
            case "maze":
              acy = answerMaze(doc, p.data, pw, ph, acy, i);
              break;
            case "nonogram":
              acy = answerNonogram(doc, p.data, pw, ph, acy, i);
              break;
            case "word-scramble":
              acy = answerWordScramble(doc, p.data, pw, ph, acy, i);
              break;
            case "cryptogram":
              acy = answerCryptogram(doc, p.data, pw, ph, acy, i);
              break;
            case "kakuro":
              acy = answerKakuro(doc, p.data, pw, ph, acy, i);
              break;
            case "kenken":
              acy = answerKenKen(doc, p.data, pw, ph, acy, i);
              break;
            case "word-ladder":
              acy = answerWordLadder(doc, p.data, pw, ph, acy, i);
              break;
            case "number-fill":
              acy = answerNumberFill(doc, p.data, pw, ph, acy, i);
              break;
            case "logic-grid":
              acy = answerLogicGrid(doc, p.data, pw, ph, acy, i);
              break;
          }
        }
      }

      doc.save("puzzle-bundle.pdf");
    } finally {
      setGenerating(false);
    }
  }, [selected, perType, pageSize]);

  return (
    <Card className="mt-12">
      <CardHeader>
        <CardTitle>Puzzle Bundle</CardTitle>
        <CardDescription>
          Generate a mixed puzzle book with multiple puzzle types in one PDF
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Puzzle type checkboxes */}
        <div>
          <Label className="mb-3">Puzzle types to include</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {PUZZLE_TYPES.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent/40 transition-colors has-checked:bg-accent/60"
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="accent-primary size-4"
                />
                {p.label}
              </label>
            ))}
          </div>
        </div>

        {/* Puzzles per type */}
        <div className="space-y-2">
          <Label>
            Puzzles per type: <span className="font-mono">{perType}</span>
          </Label>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[perType]}
            onValueChange={(v) => setPerType(v)}
          />
        </div>

        {/* Page size */}
        <div className="space-y-2">
          <Label>Page size</Label>
          <Select value={pageSize} onValueChange={setPageSize}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="A4">A4 (595 × 842)</SelectItem>
              <SelectItem value="Letter">Letter (612 × 792)</SelectItem>
              <SelectItem value="E-ink Tablet">
                E-ink Tablet (496 × 662)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Generate button */}
        <Button
          size="lg"
          disabled={generating || selected.size === 0}
          onClick={handleGenerate}
          className="w-full sm:w-auto"
        >
          {generating ? (
            <>
              <Loader2 className="animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <FileDown />
              Generate Bundle PDF
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
