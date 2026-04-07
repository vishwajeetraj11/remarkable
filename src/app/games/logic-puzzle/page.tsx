"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
  generateLogicGrid,
  LogicDifficulty,
  LogicGridPuzzle,
} from "@/lib/generators/logic-grid";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

const DIFFICULTY_LABELS: Record<LogicDifficulty, string> = {
  easy: "Easy (3 × 3)",
  medium: "Medium (4 × 4)",
  hard: "Hard (5 × 4)",
};

// ─── PDF Generation ───────────────────────────────────────────────────────────

function drawCrossReferenceGrid(
  doc: jsPDF,
  puzzle: LogicGridPuzzle,
  originX: number,
  originY: number,
  cellSize: number
) {
  const cats = puzzle.categories;
  const primary = cats[0];
  const others = cats.slice(1);
  const n = primary.items.length;

  const labelW = cellSize * 2.4;
  const labelH = cellSize * 1.6;
  const gridStartX = originX + labelW;
  const gridStartY = originY + labelH;
  const totalCols = others.length * n;
  const totalRows = n;

  doc.setFillColor(255, 255, 255);
  doc.rect(
    gridStartX,
    gridStartY,
    totalCols * cellSize,
    totalRows * cellSize,
    "F"
  );

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  for (let r = 0; r <= totalRows; r++) {
    const y = gridStartY + r * cellSize;
    doc.line(gridStartX, y, gridStartX + totalCols * cellSize, y);
  }
  for (let c = 0; c <= totalCols; c++) {
    const x = gridStartX + c * cellSize;
    doc.line(x, gridStartY, x, gridStartY + totalRows * cellSize);
  }

  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(1);
  doc.rect(
    gridStartX,
    gridStartY,
    totalCols * cellSize,
    totalRows * cellSize
  );
  for (let g = 0; g <= others.length; g++) {
    const x = gridStartX + g * n * cellSize;
    doc.line(x, gridStartY, x, gridStartY + totalRows * cellSize);
  }

  doc.setFontSize(Math.min(7, cellSize * 0.55));
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  for (let i = 0; i < others.length; i++) {
    const cx = gridStartX + i * n * cellSize + (n * cellSize) / 2;
    doc.text(others[i].name, cx, gridStartY - 4, { align: "center" });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(Math.min(6.5, cellSize * 0.5));
  for (let i = 0; i < others.length; i++) {
    for (let j = 0; j < n; j++) {
      const cx = gridStartX + i * n * cellSize + j * cellSize + cellSize / 2;
      const label = others[i].items[j];
      const truncated =
        label.length > 8 ? label.slice(0, 7) + "…" : label;
      doc.text(truncated, cx, gridStartY - labelH + labelH - 2, {
        align: "center",
        angle: 45,
      });
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(Math.min(7, cellSize * 0.55));
  const primaryLabelX = originX + labelW - 6;
  doc.text(primary.name, primaryLabelX, gridStartY - 4, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(Math.min(6.5, cellSize * 0.5));
  for (let i = 0; i < n; i++) {
    const cy = gridStartY + i * cellSize + cellSize * 0.6;
    const label = primary.items[i];
    const truncated =
      label.length > 12 ? label.slice(0, 11) + "…" : label;
    doc.text(truncated, gridStartX - 4, cy, { align: "right" });
  }

  return {
    width: labelW + totalCols * cellSize,
    height: labelH + totalRows * cellSize,
  };
}

function drawSolutionTable(
  doc: jsPDF,
  puzzle: LogicGridPuzzle,
  originX: number,
  originY: number,
  tableW: number
) {
  const cats = puzzle.categories;
  const n = cats[0].items.length;
  const colW = tableW / cats.length;
  const rowH = 18;

  doc.setFillColor(235, 235, 235);
  doc.rect(originX, originY, tableW, rowH, "F");
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.8);
  doc.rect(originX, originY, tableW, rowH);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  for (let c = 0; c < cats.length; c++) {
    const cx = originX + c * colW + colW / 2;
    doc.text(cats[c].name, cx, originY + rowH * 0.65, { align: "center" });
  }

  const primary = cats[0];
  const others = cats.slice(1);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);

  for (let r = 0; r < n; r++) {
    const y = originY + rowH + r * rowH;
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.3);
    doc.rect(originX, y, tableW, rowH);

    const key = primary.items[r];
    const cx0 = originX + colW / 2;
    doc.text(key, cx0, y + rowH * 0.65, { align: "center" });

    for (let c = 0; c < others.length; c++) {
      const val = puzzle.solution[key]?.[others[c].name] ?? "";
      const cx = originX + (c + 1) * colW + colW / 2;
      doc.text(val, cx, y + rowH * 0.65, { align: "center" });
    }
  }

  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.8);
  doc.rect(originX, originY, tableW, rowH * (n + 1));
  for (let c = 1; c < cats.length; c++) {
    const x = originX + c * colW;
    doc.line(x, originY, x, originY + rowH * (n + 1));
  }
}

function generatePDF(
  puzzle: LogicGridPuzzle,
  pageSize: PageSizeKey,
  difficulty: LogicDifficulty
) {
  const { w: pageW, h: pageH } = PAGE_SIZES[pageSize];
  const margin = pageW * 0.08;
  const usableW = pageW - margin * 2;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [pageW, pageH],
  });

  let y = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text(puzzle.title, pageW / 2, y, { align: "center" });
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const descLines = doc.splitTextToSize(puzzle.description, usableW);
  doc.text(descLines, pageW / 2, y, { align: "center" });
  y += descLines.length * 12 + 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text("Clues", margin, y);
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);

  puzzle.clues.forEach((clue, i) => {
    const lines = doc.splitTextToSize(
      `${i + 1}. ${clue}`,
      usableW - 10
    );
    if (y + lines.length * 11 > pageH - margin * 2) {
      doc.addPage([pageW, pageH]);
      y = margin;
    }
    doc.text(lines, margin + 5, y);
    y += lines.length * 11 + 2;
  });

  y += 16;

  const n = puzzle.categories[0].items.length;
  const others = puzzle.categories.slice(1);
  const maxCellSize = Math.min(
    (usableW - n * 2.4 * 14) / (others.length * n),
    22
  );
  const cellSize = Math.max(maxCellSize, 12);

  if (y + cellSize * n + cellSize * 2 > pageH - margin) {
    doc.addPage([pageW, pageH]);
    y = margin;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text("Solving Grid", margin, y);
  y += 16;

  drawCrossReferenceGrid(doc, puzzle, margin, y, cellSize);

  // Answer key page
  doc.addPage([pageW, pageH]);
  let ay = margin;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text("Answer Key", pageW / 2, ay, { align: "center" });
  ay += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text(
    `${puzzle.title} — ${DIFFICULTY_LABELS[difficulty]}`,
    pageW / 2,
    ay + 12,
    { align: "center" }
  );
  ay += 32;

  const tableW = Math.min(usableW, 420);
  const tableX = (pageW - tableW) / 2;
  drawSolutionTable(doc, puzzle, tableX, ay, tableW);

  doc.save(`logic-puzzle-${difficulty}.pdf`);
}

// ─── Preview Grid Component ───────────────────────────────────────────────────

function LogicGridPreview({ puzzle }: { puzzle: LogicGridPuzzle }) {
  const cats = puzzle.categories;
  const primary = cats[0];
  const others = cats.slice(1);
  const n = primary.items.length;

  const cellSize = 28;
  const labelW = 80;
  const labelH = 60;
  const gridW = others.length * n * cellSize;
  const gridH = n * cellSize;
  const totalW = labelW + gridW;
  const totalH = labelH + gridH;

  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      className="w-full max-w-[400px] h-auto border-2 border-foreground bg-white"
      shapeRendering="crispEdges"
      role="img"
      aria-label="Logic grid puzzle preview"
    >
      <rect x="0" y="0" width={totalW} height={totalH} fill="white" />

      {others.map((cat, gi) =>
        Array.from({ length: n }).map((_, ci) => (
          <g key={`col-${gi}-${ci}`}>
            <line
              x1={labelW + gi * n * cellSize + ci * cellSize}
              y1={labelH}
              x2={labelW + gi * n * cellSize + ci * cellSize}
              y2={labelH + gridH}
              stroke="#d4d4d8"
              strokeWidth={1}
            />
          </g>
        ))
      )}

      {Array.from({ length: n + 1 }).map((_, ri) => (
        <line
          key={`row-${ri}`}
          x1={labelW}
          y1={labelH + ri * cellSize}
          x2={labelW + gridW}
          y2={labelH + ri * cellSize}
          stroke="#d4d4d8"
          strokeWidth={1}
        />
      ))}

      {others.map((_, gi) => (
        <line
          key={`group-${gi}`}
          x1={labelW + gi * n * cellSize}
          y1={labelH}
          x2={labelW + gi * n * cellSize}
          y2={labelH + gridH}
          stroke="#111"
          strokeWidth={2}
        />
      ))}
      <line
        x1={labelW + gridW}
        y1={labelH}
        x2={labelW + gridW}
        y2={labelH + gridH}
        stroke="#111"
        strokeWidth={2}
      />

      <rect
        x={labelW}
        y={labelH}
        width={gridW}
        height={gridH}
        fill="none"
        stroke="#111"
        strokeWidth={2}
      />

      {others.map((cat, gi) => (
        <text
          key={`cat-label-${gi}`}
          x={labelW + gi * n * cellSize + (n * cellSize) / 2}
          y={labelH - 28}
          textAnchor="middle"
          fontSize={9}
          fontWeight={700}
          fill="#111"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {cat.name}
        </text>
      ))}

      {others.map((cat, gi) =>
        cat.items.map((item, ci) => (
          <text
            key={`col-label-${gi}-${ci}`}
            x={labelW + gi * n * cellSize + ci * cellSize + cellSize / 2}
            y={labelH - 6}
            textAnchor="end"
            fontSize={7}
            fill="#444"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            transform={`rotate(-45, ${labelW + gi * n * cellSize + ci * cellSize + cellSize / 2}, ${labelH - 6})`}
          >
            {item.length > 8 ? item.slice(0, 7) + "…" : item}
          </text>
        ))
      )}

      <text
        x={labelW - 6}
        y={labelH - 28}
        textAnchor="end"
        fontSize={9}
        fontWeight={700}
        fill="#111"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {primary.name}
      </text>

      {primary.items.map((item, ri) => (
        <text
          key={`row-label-${ri}`}
          x={labelW - 6}
          y={labelH + ri * cellSize + cellSize * 0.62}
          textAnchor="end"
          fontSize={8}
          fill="#444"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
        >
          {item.length > 10 ? item.slice(0, 9) + "…" : item}
        </text>
      ))}
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LogicPuzzlePage() {
  const [difficulty, setDifficulty] = useState<LogicDifficulty>("easy");
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [preview, setPreview] = useState<LogicGridPuzzle | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const regeneratePreview = useCallback(() => {
    setPreview(generateLogicGrid(difficulty));
  }, [difficulty]);

  useEffect(() => {
    regeneratePreview();
  }, [regeneratePreview]);

  const handleDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const puzzle = generateLogicGrid(difficulty);
        generatePDF(puzzle, pageSize, difficulty);
        setPreview(puzzle);
      } finally {
        setIsGenerating(false);
      }
    }, 50);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Logic Grid Puzzles
        </h1>
        <p className="mt-2 text-muted-foreground">
          Deduce which items belong together using logical clues. Each PDF
          includes a solving grid and answer key.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>
              Configure your puzzle before downloading.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={difficulty}
                onValueChange={(v) => setDifficulty(v as LogicDifficulty)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy (3 × 3)</SelectItem>
                  <SelectItem value="medium">Medium (4 × 4)</SelectItem>
                  <SelectItem value="hard">Hard (5 × 4)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Page Size</Label>
              <Select
                value={pageSize}
                onValueChange={(v) => setPageSize(v as PageSizeKey)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A4">{PAGE_SIZES.A4.label}</SelectItem>
                  <SelectItem value="Letter">{PAGE_SIZES.Letter.label}</SelectItem>
                  <SelectItem value="eInk">{PAGE_SIZES.eInk.label}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleDownload}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating…" : "Generate & Download PDF"}
            </Button>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle>Preview</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="shrink-0"
                onClick={regeneratePreview}
              >
                Regenerate
              </Button>
            </div>
            <CardDescription>
              {DIFFICULTY_LABELS[difficulty]} · {preview?.title ?? ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex w-full flex-col gap-4 pt-0 pb-6">
            {preview ? (
              <>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {preview.description}
                </p>
                <LogicGridPreview puzzle={preview} />
                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="font-semibold text-foreground">
                    Clues ({preview.clues.length}):
                  </p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    {preview.clues.slice(0, 6).map((clue, i) => (
                      <li key={i}>{clue}</li>
                    ))}
                    {preview.clues.length > 6 && (
                      <li className="text-muted-foreground/60">
                        …and {preview.clues.length - 6} more in the PDF
                      </li>
                    )}
                  </ol>
                </div>
              </>
            ) : (
              <div className="flex aspect-4/3 w-full items-center justify-center border-2 border-dashed border-border text-muted-foreground text-sm">
                Generating…
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
