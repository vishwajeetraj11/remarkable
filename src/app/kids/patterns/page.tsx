"use client";

import { useState, useCallback } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

type PatternType = "shapes" | "numbers" | "letters" | "mixed";
type Difficulty = "easy" | "medium" | "hard";

const SHAPE_NAMES = ["circle", "square", "triangle", "star", "diamond"] as const;
type ShapeName = (typeof SHAPE_NAMES)[number];

function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface PatternProblem {
  visible: string[];
  blanks: string[];
  type: "shapes" | "numbers" | "letters";
}

function generateShapePattern(diff: Difficulty): PatternProblem {
  const pool = SHAPE_NAMES.slice(0, diff === "easy" ? 2 : diff === "medium" ? 3 : 4);
  let sequence: ShapeName[];

  if (diff === "easy") {
    const a = pool[0], b = pool[1];
    sequence = [a, b, a, b, a, b, a, b];
  } else if (diff === "medium") {
    const a = pool[0], b = pool[1], c = pool[2];
    sequence = [a, b, c, a, b, c, a, b, c];
  } else {
    if (Math.random() > 0.5) {
      const a = pool[0], b = pool[1];
      sequence = [a, a, b, b, a, a, b, b, a, a];
    } else {
      const a = pool[0], b = pool[1], c = pool[2];
      sequence = [a, b, b, c, a, b, b, c, a, b];
    }
  }

  const blankCount = diff === "easy" ? 2 : 3;
  const visible = sequence.slice(0, sequence.length - blankCount);
  const blanks = sequence.slice(sequence.length - blankCount);
  return { visible, blanks, type: "shapes" };
}

function generateNumberPattern(diff: Difficulty): PatternProblem {
  let sequence: number[];

  if (diff === "easy") {
    const start = rng(1, 5);
    const step = rng(1, 3);
    sequence = Array.from({ length: 7 }, (_, i) => start + step * i);
  } else if (diff === "medium") {
    const type = rng(0, 2);
    if (type === 0) {
      const start = rng(2, 5);
      const step = rng(3, 5);
      sequence = Array.from({ length: 7 }, (_, i) => start + step * i);
    } else if (type === 1) {
      const start = rng(50, 80);
      const step = rng(2, 5);
      sequence = Array.from({ length: 7 }, (_, i) => start - step * i);
    } else {
      const start = rng(2, 4);
      sequence = Array.from({ length: 7 }, (_, i) => start * (i + 1));
    }
  } else {
    const type = rng(0, 2);
    if (type === 0) {
      const base = rng(2, 3);
      sequence = Array.from({ length: 7 }, (_, i) => base ** (i + 1));
      if (sequence[sequence.length - 1] > 999) {
        sequence = Array.from({ length: 7 }, (_, i) => 2 ** (i + 1));
      }
    } else if (type === 1) {
      const a = rng(1, 3), b = rng(2, 5);
      sequence = [];
      for (let i = 0; i < 8; i++) {
        sequence.push(i % 2 === 0 ? a + i * 2 : b + i * 2);
      }
    } else {
      sequence = [1, 1, 2, 3, 5, 8, 13];
    }
  }

  const blankCount = diff === "easy" ? 2 : 3;
  const visible = sequence.slice(0, sequence.length - blankCount).map(String);
  const blanks = sequence.slice(sequence.length - blankCount).map(String);
  return { visible, blanks, type: "numbers" };
}

function generateLetterPattern(diff: Difficulty): PatternProblem {
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  if (diff === "easy") {
    const a = pickRandom(alpha.split(""));
    const b = pickRandom(alpha.split("").filter((c) => c !== a));
    const seq = [a, b, a, b, a, b, a, b];
    return { visible: seq.slice(0, 6), blanks: seq.slice(6), type: "letters" };
  } else if (diff === "medium") {
    const a = pickRandom(alpha.split(""));
    const b = pickRandom(alpha.split("").filter((c) => c !== a));
    const c = pickRandom(alpha.split("").filter((ch) => ch !== a && ch !== b));
    const seq = [a, b, c, a, b, c, a, b, c];
    return { visible: seq.slice(0, 6), blanks: seq.slice(6), type: "letters" };
  } else {
    const startIdx = rng(0, 18);
    const step = rng(1, 3);
    const seq: string[] = [];
    for (let i = 0; i < 8; i++) {
      seq.push(alpha[(startIdx + i * step) % 26]);
    }
    return { visible: seq.slice(0, 5), blanks: seq.slice(5), type: "letters" };
  }
}

function generateProblem(
  pType: PatternType,
  diff: Difficulty
): PatternProblem {
  const effectiveType =
    pType === "mixed"
      ? pickRandom(["shapes", "numbers", "letters"] as const)
      : pType;

  switch (effectiveType) {
    case "shapes":
      return generateShapePattern(diff);
    case "numbers":
      return generateNumberPattern(diff);
    case "letters":
      return generateLetterPattern(diff);
  }
}

function drawShapePdf(
  doc: jsPDF,
  name: string,
  cx: number,
  cy: number,
  size: number,
  fill: boolean = true
) {
  const r = size / 2;
  doc.setLineWidth(1.2);
  doc.setDrawColor(40, 40, 40);

  switch (name) {
    case "circle":
      if (fill) {
        doc.setFillColor(40, 40, 40);
        doc.circle(cx, cy, r, "FD");
      } else {
        doc.circle(cx, cy, r, "S");
      }
      break;
    case "square":
      if (fill) {
        doc.setFillColor(40, 40, 40);
        doc.rect(cx - r, cy - r, size, size, "FD");
      } else {
        doc.rect(cx - r, cy - r, size, size, "S");
      }
      break;
    case "triangle": {
      const pts = [
        { x: cx, y: cy - r },
        { x: cx - r, y: cy + r * 0.7 },
        { x: cx + r, y: cy + r * 0.7 },
      ];
      if (fill) {
        doc.setFillColor(40, 40, 40);
        doc.triangle(
          pts[0].x, pts[0].y,
          pts[1].x, pts[1].y,
          pts[2].x, pts[2].y,
          "FD"
        );
      } else {
        doc.triangle(
          pts[0].x, pts[0].y,
          pts[1].x, pts[1].y,
          pts[2].x, pts[2].y,
          "S"
        );
      }
      break;
    }
    case "star": {
      const points: [number, number][] = [];
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 2) * -1 + (i * Math.PI) / 5;
        const rad = i % 2 === 0 ? r : r * 0.4;
        points.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
      }
      doc.setLineWidth(1.2);
      for (let i = 0; i < points.length; i++) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[(i + 1) % points.length];
        doc.line(x1, y1, x2, y2);
      }
      break;
    }
    case "diamond": {
      const pts2 = [
        { x: cx, y: cy - r },
        { x: cx + r * 0.7, y: cy },
        { x: cx, y: cy + r },
        { x: cx - r * 0.7, y: cy },
      ];
      doc.setLineWidth(1.2);
      for (let i = 0; i < 4; i++) {
        const a = pts2[i];
        const b = pts2[(i + 1) % 4];
        doc.line(a.x, a.y, b.x, b.y);
      }
      break;
    }
  }
}

export default function PatternsPage() {
  const [patternType, setPatternType] = useState<PatternType>("shapes");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [problemsPerPage, setProblemsPerPage] = useState(6);
  const [pageCount, setPageCount] = useState(2);
  const [pageSize, setPageSize] = useState<PageSizeKey>("eInk");
  const [generating, setGenerating] = useState(false);

  const generatePreview = useCallback(() => {
    return Array.from({ length: 3 }, () => generateProblem(patternType, difficulty));
  }, [patternType, difficulty]);

  const previewProblems = generatePreview();

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const margin = 32;
    const titleH = 36;

    const allProblems: PatternProblem[][] = [];
    for (let page = 0; page < pageCount; page++) {
      allProblems.push(
        Array.from({ length: problemsPerPage }, () =>
          generateProblem(patternType, difficulty)
        )
      );
    }

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();
      const problems = allProblems[page];

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(
        `Pattern Recognition  ·  Page ${page + 1}`,
        margin,
        margin + 14
      );

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text("Name: ___________________________", w - margin, margin + 14, {
        align: "right",
      });

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 20, w - margin, margin + 20);

      const rowH = (h - margin * 2 - titleH) / problemsPerPage;
      const elemSize = Math.min(18, rowH * 0.35);

      problems.forEach((prob, pIdx) => {
        const py = margin + titleH + pIdx * rowH;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(140, 140, 140);
        doc.text(`${pIdx + 1}.`, margin, py + rowH * 0.5 + 3);

        const startX = margin + 20;
        const spacing = elemSize * 2.2;
        const allElems = [...prob.visible, ...prob.blanks];

        allElems.forEach((elem, eIdx) => {
          const ex = startX + eIdx * spacing + spacing / 2;
          const ey = py + rowH * 0.45;
          const isBlank = eIdx >= prob.visible.length;

          if (isBlank) {
            doc.setDrawColor(180, 180, 180);
            doc.setLineWidth(0.8);
            doc.setLineDashPattern([3, 2], 0);
            doc.rect(
              ex - elemSize * 0.7,
              ey - elemSize * 0.7,
              elemSize * 1.4,
              elemSize * 1.4,
              "S"
            );
            doc.setLineDashPattern([], 0);
            doc.setFontSize(10);
            doc.setTextColor(190, 190, 190);
            doc.text("?", ex, ey + 4, { align: "center" });
          } else if (prob.type === "shapes") {
            drawShapePdf(doc, elem, ex, ey, elemSize, false);
          } else {
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(30, 30, 30);
            doc.text(elem, ex, ey + 5, { align: "center" });
          }
        });

        if (pIdx < problemsPerPage - 1) {
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.3);
          doc.line(margin, py + rowH, w - margin, py + rowH);
        }
      });
    }

    // Answer key page
    doc.addPage();
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Answer Key", margin, margin + 14);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 20, w - margin, margin + 20);

    let ay = margin + 36;
    allProblems.forEach((problems, pageIdx) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(`Page ${pageIdx + 1}:`, margin, ay);
      ay += 14;

      problems.forEach((prob, pIdx) => {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        const answerText = prob.blanks.join(", ");
        doc.text(`${pIdx + 1}. ${answerText}`, margin + 10, ay);
        ay += 13;
        if (ay > h - margin) {
          doc.addPage();
          ay = margin + 20;
        }
      });
      ay += 8;
    });

    doc.save(`patterns-${patternType}-${difficulty}-${pageCount}p.pdf`);
    setGenerating(false);
  }

  function renderPreviewElement(
    elem: string,
    type: PatternProblem["type"],
    isBlank: boolean
  ) {
    if (isBlank) {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8 border-2 border-dashed border-muted-foreground/30 rounded text-muted-foreground/40 text-xs">
          ?
        </span>
      );
    }
    if (type === "shapes") {
      return (
        <span className="inline-flex items-center justify-center w-8 h-8">
          {elem === "circle" && (
            <span className="w-5 h-5 rounded-full border-2 border-foreground" />
          )}
          {elem === "square" && (
            <span className="w-5 h-5 border-2 border-foreground" />
          )}
          {elem === "triangle" && (
            <span
              className="w-0 h-0 border-l-10 border-r-10 border-b-18 border-l-transparent border-r-transparent border-b-foreground"
            />
          )}
          {elem === "star" && <span className="text-base">★</span>}
          {elem === "diamond" && (
            <span className="w-4 h-4 border-2 border-foreground rotate-45" />
          )}
        </span>
      );
    }
    return <span className="inline-flex items-center justify-center w-8 h-8 font-bold text-sm">{elem}</span>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Pattern Recognition Worksheets
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete the pattern exercises with shapes, numbers, and letters for
          early learners.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <div className="space-y-1.5">
          <Label>Pattern type</Label>
          <Select
            value={patternType}
            onValueChange={(v) => setPatternType(v as PatternType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="shapes">Shapes</SelectItem>
              <SelectItem value="numbers">Numbers</SelectItem>
              <SelectItem value="letters">Letters</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Difficulty</Label>
          <Select
            value={difficulty}
            onValueChange={(v) => setDifficulty(v as Difficulty)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy (AB patterns)</SelectItem>
              <SelectItem value="medium">Medium (ABC patterns)</SelectItem>
              <SelectItem value="hard">Hard (complex patterns)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Problems per page: {problemsPerPage}</Label>
          <Slider
            min={6}
            max={12}
            value={[problemsPerPage]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setProblemsPerPage(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>6</span>
            <span>12</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Worksheet pages: {pageCount}</Label>
          <Slider
            min={1}
            max={8}
            value={[pageCount]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setPageCount(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>8</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Page size</Label>
          <Select
            value={pageSize}
            onValueChange={(v) => setPageSize(v as PageSizeKey)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAGE_SIZES).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
          Preview
        </h2>
        <div className="border border-border rounded-xl bg-white p-5 space-y-4">
          {previewProblems.map((prob, i) => (
            <div key={i} className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-muted-foreground mr-2">
                {i + 1}.
              </span>
              {[...prob.visible, ...prob.blanks].map((elem, eIdx) =>
                renderPreviewElement(
                  elem,
                  prob.type,
                  eIdx >= prob.visible.length
                )
              )}
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-2">
            Answer key included on the last page.
          </p>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating
          ? "Generating…"
          : `Generate & Download PDF (${pageCount} sheet${pageCount > 1 ? "s" : ""} + answer key)`}
      </Button>
    </div>
  );
}
