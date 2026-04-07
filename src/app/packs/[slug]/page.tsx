"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

import { generateWordSearch } from "@/lib/generators/word-search";
import { generateCrossword } from "@/lib/generators/crossword";
import { generateMaze } from "@/lib/generators/maze";
import { generateWordScramble } from "@/lib/generators/word-scramble";
import { generateSudoku } from "@/lib/generators/sudoku";
import { generateKakuro } from "@/lib/generators/kakuro";
import { generateKenKen } from "@/lib/generators/kenken";
import { generateCryptogram } from "@/lib/generators/cryptogram";
import { generateLogicGrid } from "@/lib/generators/logic-grid";

import type { WordSearchPuzzle } from "@/lib/generators/word-search";
import type { CrosswordPuzzle } from "@/lib/generators/crossword";
import type { MazePuzzle } from "@/lib/generators/maze";
import type { SudokuPuzzle } from "@/lib/generators/sudoku";
import type { KakuroPuzzle, ClueCell } from "@/lib/generators/kakuro";
import type { KenKenPuzzle } from "@/lib/generators/kenken";
import type { CryptogramPuzzle } from "@/lib/generators/cryptogram";
import type { LogicGridPuzzle } from "@/lib/generators/logic-grid";

type PageSize = "A4" | "Letter" | "E-ink";

const PAGE_DIMENSIONS: Record<PageSize, [number, number]> = {
  A4: [595, 842],
  Letter: [612, 792],
  "E-ink": [495.72, 661.68],
};

interface PackDef {
  name: string;
  description: string;
  sections: string[];
}

const PACK_DEFS: Record<string, PackDef> = {
  "road-trip": {
    name: "Road Trip Activity Pack",
    description:
      "Travel-themed word searches, crosswords, mazes, and word scrambles.",
    sections: ["Word Search", "Crossword", "Maze", "Word Scramble"],
  },
  classroom: {
    name: "Classroom Pack",
    description:
      "Math worksheets, spelling practice, sight words, and pattern sequences.",
    sections: [
      "Math Worksheets",
      "Spelling Practice",
      "Sight Words",
      "Pattern Sequences",
    ],
  },
  "brain-training": {
    name: "Brain Training Pack",
    description:
      "Sudoku, Kakuro, KenKen, cryptograms, and logic grid puzzles.",
    sections: ["Sudoku", "Kakuro", "KenKen", "Cryptogram", "Logic Puzzle"],
  },
};

// ─── PDF Drawing Helpers ──────────────────────────────────────────────────────

function drawTitlePage(
  doc: jsPDF,
  w: number,
  h: number,
  pack: PackDef,
  perType: number
) {
  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.text(pack.name, w / 2, h * 0.3, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(pack.description, w / 2, h * 0.3 + 30, {
    align: "center",
    maxWidth: w * 0.7,
  });

  doc.setTextColor(0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Contents", w / 2, h * 0.5, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  pack.sections.forEach((section, i) => {
    doc.text(
      `${section}  —  ${perType} ${perType === 1 ? "page" : "pages"}`,
      w / 2,
      h * 0.5 + 25 + i * 18,
      { align: "center" }
    );
  });

  const totalPages = pack.sections.length * perType;
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(`${totalPages} puzzles total`, w / 2, h * 0.8, {
    align: "center",
  });
  doc.setTextColor(0);
}

function drawSectionDivider(
  doc: jsPDF,
  w: number,
  h: number,
  sectionName: string,
  sectionIndex: number,
  totalSections: number
) {
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(sectionName, w / 2, h * 0.45, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120);
  doc.text(
    `Section ${sectionIndex + 1} of ${totalSections}`,
    w / 2,
    h * 0.45 + 22,
    { align: "center" }
  );
  doc.setTextColor(0);
}

function drawPageHeader(
  doc: jsPDF,
  w: number,
  label: string,
  pageNum: number
) {
  const margin = 40;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(140);
  doc.text(label, margin, 28);
  doc.text(`${pageNum}`, w - margin, 28, { align: "right" });
  doc.setTextColor(0);
}

// ─── Road Trip Pack Renderers ─────────────────────────────────────────────────

function renderWordSearch(
  doc: jsPDF,
  w: number,
  h: number,
  puzzle: WordSearchPuzzle,
  isAnswer: boolean
) {
  const margin = 40;
  const gridArea = Math.min(w - margin * 2, h - 140);
  const cellSize = gridArea / puzzle.size;
  const originX = (w - gridArea) / 2;
  const originY = 55;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      const cx = originX + c * cellSize + cellSize / 2;
      const cy = originY + r * cellSize + cellSize * 0.65;
      doc.text(puzzle.grid[r][c], cx, cy, { align: "center" });
    }
  }

  if (isAnswer) {
    doc.setDrawColor(0);
    doc.setLineWidth(0.8);
    for (const p of puzzle.placements) {
      const x1 = originX + p.col * cellSize + cellSize / 2;
      const y1 = originY + p.row * cellSize + cellSize / 2;
      const x2 = x1 + (p.word.length - 1) * p.direction.dc * cellSize;
      const y2 = y1 + (p.word.length - 1) * p.direction.dr * cellSize;
      doc.line(x1, y1, x2, y2);
    }
  }

  const wordsY = originY + gridArea + 15;
  doc.setFontSize(7);
  const wordCols = 4;
  const colW = (w - margin * 2) / wordCols;
  puzzle.words.forEach((word, i) => {
    const col = i % wordCols;
    const row = Math.floor(i / wordCols);
    doc.text(word, margin + col * colW, wordsY + row * 10);
  });
}

function renderCrossword(
  doc: jsPDF,
  w: number,
  h: number,
  puzzle: CrosswordPuzzle,
  isAnswer: boolean
) {
  const margin = 40;
  const gridArea = Math.min(w - margin * 2, (h - 160) * 0.55);
  const cellSize = gridArea / puzzle.size;
  const originX = (w - gridArea) / 2;
  const originY = 55;

  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      const x = originX + c * cellSize;
      const y = originY + r * cellSize;
      if (puzzle.grid[r][c] === null) {
        doc.setFillColor(0, 0, 0);
        doc.rect(x, y, cellSize, cellSize, "F");
      } else {
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
        doc.rect(x, y, cellSize, cellSize, "S");
        if (isAnswer) {
          doc.setFontSize(Math.max(6, cellSize * 0.5));
          doc.setFont("helvetica", "normal");
          doc.text(puzzle.grid[r][c]!, x + cellSize / 2, y + cellSize * 0.7, {
            align: "center",
          });
        }
      }
    }
  }

  for (const word of puzzle.words) {
    const x = originX + word.col * cellSize + 1.5;
    const y = originY + word.row * cellSize + 5;
    doc.setFontSize(4);
    doc.text(`${word.number}`, x, y);
  }

  const cluesY = originY + gridArea + 15;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("Across", margin, cluesY);
  doc.text("Down", w / 2, cluesY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  const across = puzzle.words.filter((w) => w.direction === "across");
  const down = puzzle.words.filter((w) => w.direction === "down");

  across.forEach((word, i) => {
    const text = `${word.number}. ${word.clue}`;
    doc.text(text, margin, cluesY + 12 + i * 9, { maxWidth: w / 2 - margin - 10 });
  });
  down.forEach((word, i) => {
    const text = `${word.number}. ${word.clue}`;
    doc.text(text, w / 2, cluesY + 12 + i * 9, { maxWidth: w / 2 - margin - 10 });
  });
}

function renderMaze(
  doc: jsPDF,
  w: number,
  h: number,
  maze: MazePuzzle,
  isAnswer: boolean
) {
  const margin = 40;
  const availW = w - margin * 2;
  const availH = h - 100;
  const cellW = availW / maze.width;
  const cellH = availH / maze.height;
  const cellSize = Math.min(cellW, cellH);
  const originX = (w - maze.width * cellSize) / 2;
  const originY = 55;

  doc.setDrawColor(0);
  doc.setLineWidth(0.6);

  for (let r = 0; r < maze.height; r++) {
    for (let c = 0; c < maze.width; c++) {
      const x = originX + c * cellSize;
      const y = originY + r * cellSize;
      const cell = maze.grid[r][c];
      if (cell.top && !(r === 0 && c === 0))
        doc.line(x, y, x + cellSize, y);
      if (cell.bottom && !(r === maze.height - 1 && c === maze.width - 1))
        doc.line(x, y + cellSize, x + cellSize, y + cellSize);
      if (cell.left) doc.line(x, y, x, y + cellSize);
      if (cell.right) doc.line(x + cellSize, y, x + cellSize, y + cellSize);
    }
  }

  if (isAnswer && maze.solution.length > 0) {
    doc.setDrawColor(120);
    doc.setLineWidth(1.2);
    for (let i = 1; i < maze.solution.length; i++) {
      const [pr, pc] = maze.solution[i - 1];
      const [cr, cc] = maze.solution[i];
      doc.line(
        originX + pc * cellSize + cellSize / 2,
        originY + pr * cellSize + cellSize / 2,
        originX + cc * cellSize + cellSize / 2,
        originY + cr * cellSize + cellSize / 2
      );
    }
    doc.setDrawColor(0);
  }
}

function renderWordScramble(
  doc: jsPDF,
  w: number,
  _h: number,
  scrambles: { scrambled: string; answer: string; hint: string }[],
  isAnswer: boolean
) {
  const margin = 40;
  const startY = 60;

  doc.setFontSize(9);
  scrambles.forEach((entry, i) => {
    const y = startY + i * 22;
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}.  ${entry.scrambled}`, margin, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(`Hint: ${entry.hint}`, margin + 10, y + 9);
    doc.setFontSize(9);

    if (isAnswer) {
      doc.setFont("helvetica", "italic");
      doc.text(entry.answer, w - margin, y, { align: "right" });
      doc.setFont("helvetica", "normal");
    }
  });
}

// ─── Brain Training Pack Renderers ────────────────────────────────────────────

function renderSudoku(
  doc: jsPDF,
  w: number,
  h: number,
  puzzle: SudokuPuzzle,
  isAnswer: boolean
) {
  const gridSize = Math.min(w - 80, h - 120) * 0.8;
  const cellSize = gridSize / 9;
  const originX = (w - gridSize) / 2;
  const originY = 55;

  const grid = isAnswer ? puzzle.solution : puzzle.puzzle;

  doc.setFontSize(Math.round(cellSize * 0.55));
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val !== 0) {
        const cx = originX + c * cellSize + cellSize / 2;
        const cy = originY + r * cellSize + cellSize * 0.68;
        const isPrefilled = puzzle.puzzle[r][c] !== 0;
        doc.setFont("helvetica", isPrefilled && !isAnswer ? "bold" : "normal");
        doc.text(`${val}`, cx, cy, { align: "center" });
      }
    }
  }

  doc.setLineWidth(0.3);
  doc.setDrawColor(0);
  for (let i = 0; i <= 9; i++) {
    doc.setLineWidth(i % 3 === 0 ? 1.2 : 0.3);
    doc.line(originX, originY + i * cellSize, originX + gridSize, originY + i * cellSize);
    doc.line(originX + i * cellSize, originY, originX + i * cellSize, originY + gridSize);
  }
}

function renderKakuro(
  doc: jsPDF,
  w: number,
  h: number,
  puzzle: KakuroPuzzle,
  isAnswer: boolean
) {
  const gridSize = Math.min(w - 80, h - 120) * 0.75;
  const cellSize = gridSize / puzzle.size;
  const originX = (w - gridSize) / 2;
  const originY = 55;

  for (let r = 0; r < puzzle.size; r++) {
    for (let c = 0; c < puzzle.size; c++) {
      const x = originX + c * cellSize;
      const y = originY + r * cellSize;
      const cell = puzzle.grid[r][c];

      if (cell.type === "black") {
        doc.setFillColor(30, 30, 30);
        doc.rect(x, y, cellSize, cellSize, "F");
      } else if (cell.type === "clue") {
        doc.setFillColor(60, 60, 60);
        doc.rect(x, y, cellSize, cellSize, "F");
        doc.setDrawColor(255);
        doc.setLineWidth(0.3);
        doc.line(x, y, x + cellSize, y + cellSize);

        const clue = cell as ClueCell;
        doc.setFontSize(Math.max(4, cellSize * 0.25));
        doc.setTextColor(255);
        if (clue.across) {
          doc.text(`${clue.across}`, x + cellSize * 0.55, y + cellSize * 0.92);
        }
        if (clue.down) {
          doc.text(`${clue.down}`, x + cellSize * 0.05, y + cellSize * 0.4);
        }
        doc.setTextColor(0);
      } else {
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
        doc.rect(x, y, cellSize, cellSize, "S");
        if (isAnswer && cell.value) {
          doc.setFontSize(Math.max(5, cellSize * 0.45));
          doc.text(`${cell.value}`, x + cellSize / 2, y + cellSize * 0.65, {
            align: "center",
          });
        }
      }
    }
  }
}

function renderKenKen(
  doc: jsPDF,
  w: number,
  h: number,
  puzzle: KenKenPuzzle,
  isAnswer: boolean
) {
  const gridSize = Math.min(w - 80, h - 120) * 0.75;
  const cellSize = gridSize / puzzle.size;
  const originX = (w - gridSize) / 2;
  const originY = 55;

  doc.setDrawColor(180);
  doc.setLineWidth(0.3);
  for (let r = 0; r <= puzzle.size; r++) {
    doc.line(originX, originY + r * cellSize, originX + gridSize, originY + r * cellSize);
    doc.line(originX + r * cellSize, originY, originX + r * cellSize, originY + gridSize);
  }

  doc.setDrawColor(0);
  doc.setLineWidth(1.5);
  for (const cage of puzzle.cages) {
    for (const [cr, cc] of cage.cells) {
      const x = originX + cc * cellSize;
      const y = originY + cr * cellSize;
      const inCage = (dr: number, dc: number) =>
        cage.cells.some(([r2, c2]) => r2 === cr + dr && c2 === cc + dc);

      if (!inCage(-1, 0)) doc.line(x, y, x + cellSize, y);
      if (!inCage(1, 0)) doc.line(x, y + cellSize, x + cellSize, y + cellSize);
      if (!inCage(0, -1)) doc.line(x, y, x, y + cellSize);
      if (!inCage(0, 1)) doc.line(x + cellSize, y, x + cellSize, y + cellSize);
    }

    const topLeft = cage.cells.reduce(
      (min, [r, c]) => (r < min[0] || (r === min[0] && c < min[1]) ? [r, c] : min),
      cage.cells[0]
    );
    const lx = originX + topLeft[1] * cellSize + 2;
    const ly = originY + topLeft[0] * cellSize + Math.max(6, cellSize * 0.28);
    doc.setFontSize(Math.max(5, cellSize * 0.22));
    doc.setFont("helvetica", "bold");
    doc.text(`${cage.target}${cage.operation}`, lx, ly);
    doc.setFont("helvetica", "normal");
  }

  if (isAnswer) {
    doc.setFontSize(Math.max(6, cellSize * 0.45));
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        const cx = originX + c * cellSize + cellSize / 2;
        const cy = originY + r * cellSize + cellSize * 0.7;
        doc.text(`${puzzle.solution[r][c]}`, cx, cy, { align: "center" });
      }
    }
  }
}

function renderCryptogram(
  doc: jsPDF,
  w: number,
  _h: number,
  puzzle: CryptogramPuzzle,
  isAnswer: boolean
) {
  const margin = 40;
  const startY = 70;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text("Decode the cipher — each letter has been substituted with another.", margin, startY - 15);
  doc.setTextColor(0);

  doc.setFontSize(11);
  doc.setFont("courier", "normal");
  const lines = doc.splitTextToSize(puzzle.ciphertext, w - margin * 2);
  lines.forEach((line: string, i: number) => {
    doc.text(line, margin, startY + i * 18);
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    for (let j = 0; j < line.length; j++) {
      if (/[A-Z]/.test(line[j])) {
        const charW = 6.6;
        const x = margin + j * charW;
        doc.line(x, startY + i * 18 + 4, x + charW - 1, startY + i * 18 + 4);
      }
    }
  });

  if (isAnswer) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const answerY = startY + lines.length * 18 + 25;
    doc.setFont("helvetica", "bold");
    doc.text("Answer:", margin, answerY);
    doc.setFont("helvetica", "normal");
    const answerLines = doc.splitTextToSize(puzzle.plaintext, w - margin * 2);
    answerLines.forEach((line: string, i: number) => {
      doc.text(line, margin, answerY + 14 + i * 14);
    });
  }
}

function renderLogicGrid(
  doc: jsPDF,
  w: number,
  _h: number,
  puzzle: LogicGridPuzzle,
  isAnswer: boolean
) {
  const margin = 40;
  let y = 55;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(puzzle.title, margin, y);
  y += 14;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  const descLines = doc.splitTextToSize(puzzle.description, w - margin * 2);
  descLines.forEach((line: string) => {
    doc.text(line, margin, y);
    y += 9;
  });
  y += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Categories:", margin, y);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  for (const cat of puzzle.categories) {
    doc.text(`${cat.name}: ${cat.items.join(", ")}`, margin + 5, y);
    y += 9;
  }
  y += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Clues:", margin, y);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  puzzle.clues.forEach((clue, i) => {
    const clueLines = doc.splitTextToSize(`${i + 1}. ${clue}`, w - margin * 2 - 10);
    clueLines.forEach((line: string) => {
      doc.text(line, margin + 5, y);
      y += 9;
    });
  });

  if (isAnswer) {
    y += 12;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("Solution:", margin, y);
    y += 10;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    const primary = puzzle.categories[0];
    for (const item of primary.items) {
      const entry = puzzle.solution[item];
      const parts = entry
        ? puzzle.categories.slice(1).map((cat) => entry[cat.name]).filter(Boolean)
        : [];
      doc.text(`${item}: ${parts.join(", ")}`, margin + 5, y);
      y += 9;
    }
  }
}

// ─── Classroom Pack Renderers ─────────────────────────────────────────────────

interface MathProblem {
  text: string;
  answer: number;
}

function generateMathProblems(): MathProblem[] {
  const problems: MathProblem[] = [];
  for (let i = 0; i < 20; i++) {
    const isAdd = Math.random() > 0.4;
    const a = Math.floor(Math.random() * 50) + 10;
    const b = Math.floor(Math.random() * (isAdd ? 50 : a)) + 1;
    const answer = isAdd ? a + b : a - b;
    problems.push({
      text: `${a} ${isAdd ? "+" : "−"} ${b} = `,
      answer,
    });
  }
  return problems;
}

function renderMathWorksheet(
  doc: jsPDF,
  w: number,
  _h: number,
  problems: MathProblem[],
  isAnswer: boolean
) {
  const margin = 40;
  const y = 60;

  doc.setFontSize(10);
  const colW = (w - margin * 2) / 2;
  problems.forEach((p, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * colW;
    const py = y + row * 24;
    doc.setFont("helvetica", "normal");
    doc.text(`${i + 1}.  ${p.text}`, x, py);
    if (isAnswer) {
      doc.setFont("helvetica", "bold");
      doc.text(`${p.answer}`, x + colW - 30, py);
    } else {
      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.line(x + colW - 50, py + 2, x + colW - 10, py + 2);
    }
  });
}

const SPELLING_WORDS = [
  "because", "friend", "school", "favorite", "thought",
  "beautiful", "different", "important", "together", "remember",
  "sometimes", "everyone", "something", "another", "surprise",
  "weather", "believe", "through", "enough", "library",
];

function pickSpellingWords(): string[] {
  return [...SPELLING_WORDS].sort(() => Math.random() - 0.5).slice(0, 12);
}

function renderSpellingPractice(
  doc: jsPDF,
  w: number,
  _h: number,
  words: string[],
  isAnswer: boolean
) {
  const margin = 40;
  let y = 60;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Write each word three times:", margin, y);
  y += 16;

  doc.setFontSize(10);
  words.forEach((word) => {
    doc.setFont("helvetica", "bold");
    doc.text(word, margin, y);
    if (isAnswer) {
      doc.setFont("helvetica", "normal");
      doc.text(`${word}   ${word}   ${word}`, margin + 80, y);
    } else {
      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      for (let j = 0; j < 3; j++) {
        const lx = margin + 80 + j * 90;
        doc.line(lx, y + 2, lx + 70, y + 2);
      }
    }
    y += 20;
  });
}

const SIGHT_WORDS = [
  "the", "and", "you", "that", "was", "are", "with", "have",
  "this", "will", "your", "from", "they", "been", "said",
  "each", "which", "their", "about", "would", "make", "like",
  "just", "over", "know", "than", "first", "water", "into", "could",
];

function pickSightWords(): string[] {
  return [...SIGHT_WORDS].sort(() => Math.random() - 0.5).slice(0, 20);
}

function renderSightWords(
  doc: jsPDF,
  w: number,
  _h: number,
  words: string[]
) {
  const margin = 40;
  let y = 60;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Read each word, then trace and write it:", margin, y);
  y += 16;

  const colW = (w - margin * 2) / 2;
  doc.setFontSize(14);
  words.forEach((word, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * colW;
    const py = y + row * 24;
    doc.setFont("helvetica", "bold");
    doc.text(word, x, py);
    doc.setDrawColor(200);
    doc.setLineWidth(0.3);
    doc.line(x + 60, py + 2, x + colW - 10, py + 2);
  });
}

interface PatternEntry {
  sequence: number[];
  answer: number;
  rule: string;
}

function generatePatterns(): PatternEntry[] {
  const patterns: PatternEntry[] = [];
  for (let i = 0; i < 10; i++) {
    const start = Math.floor(Math.random() * 10) + 1;
    const step = Math.floor(Math.random() * 7) + 2;
    const seq = Array.from({ length: 5 }, (_, j) => start + j * step);
    patterns.push({ sequence: seq, answer: start + 5 * step, rule: `+${step}` });
  }
  return patterns;
}

function renderPatternSequence(
  doc: jsPDF,
  w: number,
  _h: number,
  patterns: PatternEntry[],
  isAnswer: boolean
) {
  const margin = 40;
  let y = 60;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Complete each pattern by finding the next number:", margin, y);
  y += 16;

  doc.setFontSize(10);
  patterns.forEach((p, i) => {
    doc.setFont("helvetica", "normal");
    const seqText = p.sequence.join(",  ") + ",  ___";
    doc.text(`${i + 1}.   ${seqText}`, margin, y);
    if (isAnswer) {
      doc.setFont("helvetica", "bold");
      doc.text(`${p.answer}  (${p.rule})`, w - margin - 60, y);
    }
    y += 22;
  });
}

// ─── Main PDF Generator ───────────────────────────────────────────────────────

function generatePackPDF(slug: string, pageSize: PageSize, perType: number) {
  const pack = PACK_DEFS[slug];
  if (!pack) return;

  const [w, h] = PAGE_DIMENSIONS[pageSize];
  const doc = new jsPDF({ unit: "pt", format: [w, h] });

  drawTitlePage(doc, w, h, pack, perType);

  let pageNum = 1;

  const answerPages: (() => void)[] = [];

  for (let si = 0; si < pack.sections.length; si++) {
    const section = pack.sections[si];

    doc.addPage([w, h]);
    drawSectionDivider(doc, w, h, section, si, pack.sections.length);

    for (let pi = 0; pi < perType; pi++) {
      doc.addPage([w, h]);
      pageNum++;
      drawPageHeader(doc, w, `${section} — ${pi + 1}/${perType}`, pageNum);

      if (slug === "road-trip") {
        renderRoadTripSection(doc, w, h, section, pi, answerPages, pageNum);
      } else if (slug === "classroom") {
        renderClassroomSection(doc, w, h, section, pi, answerPages, pageNum);
      } else if (slug === "brain-training") {
        renderBrainTrainingSection(doc, w, h, section, pi, answerPages, pageNum);
      }
    }
  }

  if (answerPages.length > 0) {
    doc.addPage([w, h]);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Answer Key", w / 2, h * 0.45, { align: "center" });

    for (const render of answerPages) {
      doc.addPage([w, h]);
      render();
    }
  }

  doc.save(`${slug}-pack.pdf`);
}

function renderRoadTripSection(
  doc: jsPDF,
  w: number,
  h: number,
  section: string,
  _idx: number,
  answerPages: (() => void)[],
  pageNum: number
) {
  switch (section) {
    case "Word Search": {
      const puzzle = generateWordSearch("general", 14);
      renderWordSearch(doc, w, h, puzzle, false);
      answerPages.push(() => {
        drawPageHeader(doc, w, "Answer — Word Search", pageNum);
        renderWordSearch(doc, w, h, puzzle, true);
      });
      break;
    }
    case "Crossword": {
      const puzzle = generateCrossword("general");
      renderCrossword(doc, w, h, puzzle, false);
      answerPages.push(() => {
        drawPageHeader(doc, w, "Answer — Crossword", pageNum);
        renderCrossword(doc, w, h, puzzle, true);
      });
      break;
    }
    case "Maze": {
      const puzzle = generateMaze(16, 20);
      renderMaze(doc, w, h, puzzle, false);
      answerPages.push(() => {
        drawPageHeader(doc, w, "Answer — Maze", pageNum);
        renderMaze(doc, w, h, puzzle, true);
      });
      break;
    }
    case "Word Scramble": {
      const puzzle = generateWordScramble("medium", "everyday", 12);
      renderWordScramble(doc, w, h, puzzle.scrambles, false);
      answerPages.push(() => {
        drawPageHeader(doc, w, "Answer — Word Scramble", pageNum);
        renderWordScramble(doc, w, h, puzzle.scrambles, true);
      });
      break;
    }
  }
}

function renderClassroomSection(
  doc: jsPDF,
  w: number,
  h: number,
  section: string,
  _idx: number,
  answerPages: (() => void)[],
  pageNum: number
) {
  switch (section) {
    case "Math Worksheets": {
      const problems = generateMathProblems();
      renderMathWorksheet(doc, w, h, problems, false);
      answerPages.push(() => {
        drawPageHeader(doc, w, "Answer — Math", pageNum);
        renderMathWorksheet(doc, w, h, problems, true);
      });
      break;
    }
    case "Spelling Practice": {
      const words = pickSpellingWords();
      renderSpellingPractice(doc, w, h, words, false);
      answerPages.push(() => {
        drawPageHeader(doc, w, "Answer — Spelling", pageNum);
        renderSpellingPractice(doc, w, h, words, true);
      });
      break;
    }
    case "Sight Words": {
      const words = pickSightWords();
      renderSightWords(doc, w, h, words);
      break;
    }
    case "Pattern Sequences": {
      const patterns = generatePatterns();
      renderPatternSequence(doc, w, h, patterns, false);
      answerPages.push(() => {
        drawPageHeader(doc, w, "Answer — Patterns", pageNum);
        renderPatternSequence(doc, w, h, patterns, true);
      });
      break;
    }
  }
}

function renderBrainTrainingSection(
  doc: jsPDF,
  w: number,
  h: number,
  section: string,
  _idx: number,
  answerPages: (() => void)[],
  pageNum: number
) {
  switch (section) {
    case "Sudoku": {
      const puzzle = generateSudoku("medium");
      renderSudoku(doc, w, h, puzzle, false);
      answerPages.push(() => {
        drawPageHeader(doc, w, "Answer — Sudoku", pageNum);
        renderSudoku(doc, w, h, puzzle, true);
      });
      break;
    }
    case "Kakuro": {
      const puzzle = generateKakuro("medium");
      renderKakuro(doc, w, h, puzzle, false);
      answerPages.push(() => {
        drawPageHeader(doc, w, "Answer — Kakuro", pageNum);
        renderKakuro(doc, w, h, puzzle, true);
      });
      break;
    }
    case "KenKen": {
      const puzzle = generateKenKen("medium");
      renderKenKen(doc, w, h, puzzle, false);
      answerPages.push(() => {
        drawPageHeader(doc, w, "Answer — KenKen", pageNum);
        renderKenKen(doc, w, h, puzzle, true);
      });
      break;
    }
    case "Cryptogram": {
      const puzzle = generateCryptogram();
      renderCryptogram(doc, w, h, puzzle, false);
      answerPages.push(() => {
        drawPageHeader(doc, w, "Answer — Cryptogram", pageNum);
        renderCryptogram(doc, w, h, puzzle, true);
      });
      break;
    }
    case "Logic Puzzle": {
      const puzzle = generateLogicGrid("medium");
      renderLogicGrid(doc, w, h, puzzle, false);
      answerPages.push(() => {
        drawPageHeader(doc, w, "Answer — Logic Puzzle", pageNum);
        renderLogicGrid(doc, w, h, puzzle, true);
      });
      break;
    }
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PackPage() {
  const { slug } = useParams<{ slug: string }>();
  const pack = PACK_DEFS[slug];

  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [perType, setPerType] = useState(1);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    requestAnimationFrame(() => {
      try {
        generatePackPDF(slug, pageSize, perType);
      } finally {
        setGenerating(false);
      }
    });
  }, [slug, pageSize, perType]);

  if (!pack) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Pack not found</h1>
        <Link href="/packs" className="mt-4 inline-block text-sm underline">
          Back to packs
        </Link>
      </div>
    );
  }

  const totalPages = pack.sections.length * perType;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/packs"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← All packs
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">{pack.name}</h1>
      <p className="mt-2 text-muted-foreground">{pack.description}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {pack.sections.map((s) => (
          <span
            key={s}
            className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
          >
            {s}
          </span>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Configure Pack</CardTitle>
          <CardDescription>
            Choose your page size and how many puzzles per type.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Page Size</Label>
            <Select
              value={pageSize}
              onValueChange={(v) => setPageSize(v as PageSize)}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 (595 × 842)</SelectItem>
                <SelectItem value="Letter">Letter (612 × 792)</SelectItem>
                <SelectItem value="E-ink">E-ink (496 × 662)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>
              Puzzles per type:{" "}
              <span className="font-semibold tabular-nums">{perType}</span>
            </Label>
            <Slider
              min={1}
              max={3}
              step={1}
              value={[perType]}
              onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setPerType(val); }}
              className="w-48"
            />
            <p className="text-xs text-muted-foreground">
              {totalPages} puzzles + title page + section dividers + answer key
            </p>
          </div>

          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating…" : "Download PDF Pack"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
