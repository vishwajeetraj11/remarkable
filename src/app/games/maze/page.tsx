"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateMaze, MazePuzzle } from "@/lib/generators/maze";

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

type PageSize = "a4" | "letter" | "remarkable";
type Difficulty = "easy" | "medium" | "hard" | "expert";

const PAGE_DIMENSIONS: Record<PageSize, { w: number; h: number }> = {
  a4:         { w: 595,    h: 842    },
  letter:     { w: 612,    h: 792    },
  remarkable: { w: 495.72, h: 661.68 },
};

const DIFFICULTIES: Record<Difficulty, { label: string; cols: number; rows: number }> = {
  easy:   { label: "Easy (10×10)",   cols: 10, rows: 10 },
  medium: { label: "Medium (20×20)", cols: 20, rows: 20 },
  hard:   { label: "Hard (30×30)",   cols: 30, rows: 30 },
  expert: { label: "Expert (40×40)", cols: 40, rows: 40 },
};

// ---------------------------------------------------------------------------
// PDF generation
// ---------------------------------------------------------------------------

async function downloadPDF(puzzle: MazePuzzle, difficulty: Difficulty, pageSize: PageSize) {
  const { jsPDF } = await import("jspdf");
  const { w, h } = PAGE_DIMENSIONS[pageSize];
  const doc = new jsPDF({ unit: "pt", format: [w, h], orientation: "portrait" });

  const margin = 40;
  const usableW = w - margin * 2;
  const usableH = h - margin * 2;

  // Page 1: Maze puzzle
  drawMazePage(doc, puzzle, difficulty, margin, usableW, usableH, false);

  // Page 2: Solution
  doc.addPage();
  drawMazePage(doc, puzzle, difficulty, margin, usableW, usableH, true);

  doc.save(`maze-${difficulty}.pdf`);
}

function drawMazePage(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  puzzle: MazePuzzle,
  difficulty: Difficulty,
  margin: number,
  usableW: number,
  usableH: number,
  showSolution: boolean
) {
  const { grid, width, height, solution } = puzzle;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  const diffLabel = DIFFICULTIES[difficulty].label;
  const title = showSolution ? `Maze — ${diffLabel} (Solution)` : `Maze — ${diffLabel}`;
  doc.text(title, margin + usableW / 2, margin + 14, { align: "center" });

  const mazeAreaY = margin + 30;
  const mazeAreaH = usableH - 30;

  const cellW = Math.min(usableW / width, mazeAreaH / height);
  const cellH = cellW;
  const mazeW = cellW * width;
  const mazeH = cellH * height;
  const mazeX = margin + (usableW - mazeW) / 2;
  const mazeY = mazeAreaY;

  // Draw solution path first (underneath walls)
  if (showSolution && solution.length > 0) {
    doc.setDrawColor(100, 160, 255);
    doc.setFillColor(200, 225, 255);

    const pathCellPad = cellW * 0.2;
    for (const [r, c] of solution) {
      doc.rect(
        mazeX + c * cellW + pathCellPad,
        mazeY + r * cellH + pathCellPad,
        cellW - pathCellPad * 2,
        cellH - pathCellPad * 2,
        "F"
      );
    }
  }

  // Draw maze walls
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const cell = grid[r][c];
      const x = mazeX + c * cellW;
      const y = mazeY + r * cellH;

      // Top wall — skip top of row 0 col 0 (entrance)
      if (cell.top) {
        const isEntrance = r === 0 && c === 0;
        if (!isEntrance) {
          doc.line(x, y, x + cellW, y);
        }
      }

      // Bottom wall — skip bottom of last row last col (exit)
      if (cell.bottom) {
        const isExit = r === height - 1 && c === width - 1;
        if (!isExit) {
          doc.line(x, y + cellH, x + cellW, y + cellH);
        }
      }

      // Left wall
      if (cell.left) {
        doc.line(x, y, x, y + cellH);
      }

      // Right wall
      if (cell.right) {
        doc.line(x + cellW, y, x + cellW, y + cellH);
      }
    }
  }

  // Border around maze
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.5);
  doc.rect(mazeX, mazeY, mazeW, mazeH, "S");

  // Entry/exit labels
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(60, 60, 60);
  doc.text("START", mazeX, mazeY - 4, { align: "left" });
  doc.text("END", mazeX + mazeW, mazeY + mazeH + 10, { align: "right" });
}

// ---------------------------------------------------------------------------
// Canvas preview renderer
// ---------------------------------------------------------------------------

function drawMazeOnCanvas(
  canvas: HTMLCanvasElement,
  puzzle: MazePuzzle,
  showSolution: boolean
) {
  const { grid, width, height, solution } = puzzle;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const displayW = canvas.clientWidth || 600;
  const displayH = canvas.clientHeight || 600;
  canvas.width = displayW * dpr;
  canvas.height = displayH * dpr;
  ctx.scale(dpr, dpr);

  ctx.clearRect(0, 0, displayW, displayH);

  const padding = 16;
  const cellW = (displayW - padding * 2) / width;
  const cellH = (displayH - padding * 2) / height;
  const offsetX = padding;
  const offsetY = padding;

  // Solution path
  if (showSolution && solution.length > 0) {
    ctx.fillStyle = "rgba(96, 165, 250, 0.35)";
    const pad = Math.min(cellW, cellH) * 0.15;
    for (const [r, c] of solution) {
      ctx.fillRect(
        offsetX + c * cellW + pad,
        offsetY + r * cellH + pad,
        cellW - pad * 2,
        cellH - pad * 2
      );
    }
  }

  // Walls
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = Math.max(0.5, Math.min(1.5, cellW * 0.1));
  ctx.lineCap = "square";

  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const cell = grid[r][c];
      const x = offsetX + c * cellW;
      const y = offsetY + r * cellH;

      ctx.beginPath();
      if (cell.top && !(r === 0 && c === 0)) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + cellW, y);
      }
      if (cell.bottom && !(r === height - 1 && c === width - 1)) {
        ctx.moveTo(x, y + cellH);
        ctx.lineTo(x + cellW, y + cellH);
      }
      if (cell.left) {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + cellH);
      }
      if (cell.right) {
        ctx.moveTo(x + cellW, y);
        ctx.lineTo(x + cellW, y + cellH);
      }
      ctx.stroke();
    }
  }

  // Start / End markers
  const markerR = Math.min(cellW, cellH) * 0.3;

  // Start — top-left
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(offsetX + cellW / 2, offsetY + cellH / 2, markerR, 0, Math.PI * 2);
  ctx.fill();

  // End — bottom-right
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(
    offsetX + (width - 0.5) * cellW,
    offsetY + (height - 0.5) * cellH,
    markerR,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MazePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [puzzle, setPuzzle] = useState<MazePuzzle | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = useCallback(() => {
    const { cols, rows } = DIFFICULTIES[difficulty];
    const p = generateMaze(cols, rows);
    setPuzzle(p);
    setShowSolution(false);
  }, [difficulty]);

  useEffect(() => {
    generate();
  }, [generate]);

  // Redraw canvas when puzzle or solution visibility changes
  useEffect(() => {
    if (!puzzle || !canvasRef.current) return;
    drawMazeOnCanvas(canvasRef.current, puzzle, showSolution);
  }, [puzzle, showSolution]);

  // Redraw on resize
  useEffect(() => {
    if (!puzzle || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const observer = new ResizeObserver(() => {
      drawMazeOnCanvas(canvas, puzzle, showSolution);
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [puzzle, showSolution]);

  const handleDownload = async () => {
    if (!puzzle) return;
    setIsGenerating(true);
    try {
      await downloadPDF(puzzle, difficulty, pageSize);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Maze Generator</h1>
        <p className="mt-1 text-muted-foreground">
          Procedurally generated mazes using recursive backtracking — with solution on the last page.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-8 flex flex-wrap gap-6 items-end">
        {/* Difficulty */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Difficulty</label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DIFFICULTIES).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Page size */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Page size</label>
          <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSize)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a4">A4</SelectItem>
              <SelectItem value="letter">Letter</SelectItem>
              <SelectItem value="remarkable">reMarkable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={generate}>
            Regenerate
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSolution((s) => !s)}
            disabled={!puzzle}
          >
            {showSolution ? "Hide Solution" : "Show Solution"}
          </Button>
          <Button onClick={handleDownload} disabled={!puzzle || isGenerating}>
            {isGenerating ? "Generating…" : "Generate & Download PDF"}
          </Button>
        </div>
      </div>

      {/* Canvas preview */}
      <div className="border border-border rounded-xl overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          className="w-full aspect-square"
          style={{ display: "block" }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
          Start
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 rounded-full bg-red-500" />
          End
        </div>
        {showSolution && (
          <div className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded bg-blue-300 opacity-60" />
            Solution path
          </div>
        )}
      </div>
    </div>
  );
}
