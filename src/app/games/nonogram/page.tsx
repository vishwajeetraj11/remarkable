"use client";

import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateNonogram, NonogramPuzzle } from "@/lib/generators/nonogram";

const PAGE_SIZES = {
  A4: { width: 595, height: 842, label: "A4" },
  Letter: { width: 612, height: 792, label: "Letter" },
  reMarkable: { width: 495.72, height: 661.68, label: "reMarkable" },
} as const;

type PageSizeKey = keyof typeof PAGE_SIZES;

const SIZE_OPTIONS = [
  { value: "5", label: "5×5 (Easy)" },
  { value: "10", label: "10×10 (Medium)" },
  { value: "15", label: "15×15 (Hard)" },
];

function NonogramPreview({ puzzle }: { puzzle: NonogramPuzzle }) {
  const { rowClues, colClues, size } = puzzle;

  const maxColClueRows = Math.max(...colClues.map((c) => c.length));
  const maxRowClueCols = Math.max(...rowClues.map((r) => r.length));

  const cellPx = size === 5 ? 36 : size === 10 ? 28 : 22;
  const clueColW = maxRowClueCols * (cellPx - 2) + 4;

  return (
    <div className="overflow-auto">
      <table
        style={{
          borderCollapse: "collapse",
          fontSize: cellPx <= 22 ? 9 : cellPx <= 28 ? 11 : 13,
          lineHeight: 1.1,
          userSelect: "none",
        }}
      >
        <thead>
          {/* Column clue rows */}
          {Array.from({ length: maxColClueRows }, (_, clueRowIdx) => (
            <tr key={`clue-row-${clueRowIdx}`}>
              {/* Corner blank cells */}
              <td
                colSpan={maxRowClueCols}
                style={{ width: clueColW, border: "none" }}
              />
              {colClues.map((clue, c) => {
                const paddedIdx = clueRowIdx - (maxColClueRows - clue.length);
                return (
                  <td
                    key={c}
                    style={{
                      width: cellPx,
                      height: cellPx * 0.85,
                      textAlign: "center",
                      verticalAlign: "bottom",
                      paddingBottom: 2,
                      color: "#333",
                      fontWeight: 600,
                      border: "none",
                    }}
                  >
                    {paddedIdx >= 0 && clue[paddedIdx] !== 0
                      ? clue[paddedIdx]
                      : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {Array.from({ length: size }, (_, r) => (
            <tr key={r}>
              {/* Row clues */}
              {Array.from({ length: maxRowClueCols }, (_, clueColIdx) => {
                const clue = rowClues[r];
                const paddedIdx = clueColIdx - (maxRowClueCols - clue.length);
                return (
                  <td
                    key={clueColIdx}
                    style={{
                      width: cellPx - 2,
                      textAlign: "right",
                      paddingRight: 4,
                      color: "#333",
                      fontWeight: 600,
                      border: "none",
                      verticalAlign: "middle",
                    }}
                  >
                    {paddedIdx >= 0 && clue[paddedIdx] !== 0
                      ? clue[paddedIdx]
                      : ""}
                  </td>
                );
              })}
              {/* Grid cells */}
              {Array.from({ length: size }, (_, c) => (
                <td
                  key={c}
                  style={{
                    width: cellPx,
                    height: cellPx,
                    border: "1px solid #aaa",
                    backgroundColor: "#fff",
                    boxSizing: "border-box",
                    outline:
                      size > 5 && (c + 1) % 5 === 0 && c + 1 < size
                        ? "2px solid #666"
                        : undefined,
                  }}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

async function downloadPDF(
  puzzle: NonogramPuzzle,
  pageSizeKey: PageSizeKey
) {
  const ps = PAGE_SIZES[pageSizeKey];
  const doc = new jsPDF({ unit: "pt", format: [ps.width, ps.height] });

  const { rowClues, colClues, pattern, size } = puzzle;
  const margin = 36;

  const maxColClueRows = Math.max(...colClues.map((c) => c.length));
  const maxRowClueCols = Math.max(...rowClues.map((r) => r.length));

  const availW = ps.width - margin * 2;
  const cellSize = Math.min(
    Math.floor(availW / (size + maxRowClueCols + 1)),
    size === 5 ? 30 : size === 10 ? 22 : 16
  );
  const clueW = cellSize * maxRowClueCols;
  const gridW = cellSize * size;
  const gridH = cellSize * size;
  const colClueH = cellSize * maxColClueRows;

  const totalW = clueW + gridW;
  const offsetX = (ps.width - totalW) / 2;
  const startY = margin + 28;
  const gridStartX = offsetX + clueW;
  const gridStartY = startY + colClueH;

  const drawGrid = (filled: boolean) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Nonogram", ps.width / 2, margin + 4, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`${size}×${size}`, ps.width / 2, margin + 16, { align: "center" });
    doc.setTextColor(0, 0, 0);

    // Column clues
    doc.setFont("helvetica", "bold");
    doc.setFontSize(cellSize * 0.45);
    for (let c = 0; c < size; c++) {
      const clue = colClues[c];
      for (let k = 0; k < clue.length; k++) {
        const clueRowOffset = maxColClueRows - clue.length + k;
        const cx = gridStartX + c * cellSize + cellSize / 2;
        const cy = startY + clueRowOffset * cellSize + cellSize * 0.65;
        if (clue[k] !== 0) doc.text(String(clue[k]), cx, cy, { align: "center" });
      }
    }

    // Row clues
    for (let r = 0; r < size; r++) {
      const clue = rowClues[r];
      for (let k = 0; k < clue.length; k++) {
        const clueColOffset = maxRowClueCols - clue.length + k;
        const cx = offsetX + clueColOffset * cellSize + cellSize * 0.7;
        const cy = gridStartY + r * cellSize + cellSize * 0.65;
        if (clue[k] !== 0) doc.text(String(clue[k]), cx, cy, { align: "center" });
      }
    }

    // Grid cells
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const x = gridStartX + c * cellSize;
        const y = gridStartY + r * cellSize;

        if (filled && pattern[r][c]) {
          doc.setFillColor(20, 20, 20);
          doc.rect(x, y, cellSize, cellSize, "F");
        } else {
          doc.setFillColor(255, 255, 255);
          doc.setDrawColor(
            size > 5 && (c + 1) % 5 === 0 && c + 1 < size ? 60 : 160,
            size > 5 && (c + 1) % 5 === 0 && c + 1 < size ? 60 : 160,
            size > 5 && (c + 1) % 5 === 0 && c + 1 < size ? 60 : 160
          );
          doc.setLineWidth(
            size > 5 && ((c + 1) % 5 === 0 || (r + 1) % 5 === 0) ? 1 : 0.4
          );
          doc.rect(x, y, cellSize, cellSize, "FD");
        }
      }
    }

    // Draw outer border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(1.5);
    doc.rect(gridStartX, gridStartY, gridW, gridH);
  };

  // Page 1: empty puzzle
  drawGrid(false);

  // Page 2: solution
  doc.addPage();
  drawGrid(true);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text("— Solution —", ps.width / 2, margin - 8, { align: "center" });

  doc.save("nonogram.pdf");
}

export default function NonogramPage() {
  const [gridSize, setGridSize] = useState("10");
  const [pageSize, setPageSize] = useState<PageSizeKey>("reMarkable");
  const [puzzle, setPuzzle] = useState<NonogramPuzzle | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = useCallback(() => {
    setGenerating(true);
    setTimeout(() => {
      setPuzzle(generateNonogram(Number(gridSize)));
      setGenerating(false);
    }, 0);
  }, [gridSize]);

  const handleDownload = useCallback(async () => {
    if (!puzzle) return;
    await downloadPDF(puzzle, pageSize);
  }, [puzzle, pageSize]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nonogram Generator</h1>
        <p className="mt-2 text-muted-foreground">
          Reveal the hidden picture by filling cells using the number clues.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-1">
          <label className="text-sm font-medium">Grid Size</label>
          <Select value={gridSize} onValueChange={setGridSize}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Page Size</label>
          <Select
            value={pageSize}
            onValueChange={(v) => setPageSize(v as PageSizeKey)}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reMarkable">reMarkable</SelectItem>
              <SelectItem value="A4">A4</SelectItem>
              <SelectItem value="Letter">Letter</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? "Generating…" : "Generate"}
        </Button>

        {puzzle && (
          <Button variant="outline" onClick={handleDownload}>
            Download PDF
          </Button>
        )}
      </div>

      {puzzle && (
        <div className="border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
            Preview
          </h2>
          <NonogramPreview puzzle={puzzle} />
        </div>
      )}

      {!puzzle && (
        <div className="border border-dashed border-border rounded-lg p-12 text-center text-muted-foreground text-sm">
          Click Generate to create a nonogram puzzle.
        </div>
      )}
    </div>
  );
}
