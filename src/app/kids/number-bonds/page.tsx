"use client";

import { useState } from "react";
import Link from "next/link";
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

type Mode = "bonds" | "skip";
type BondFormat = "diagram" | "equation";

function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Number bonds ────────────────────────────────────────────────────────────
// A bond is part1 + part2 = whole. `blank` marks which value(s) the child solves.
type Bond = {
  whole: number;
  part1: number;
  part2: number;
  blank: "part1" | "part2" | "whole";
};

function generateBond(whole: number): Bond {
  // part1 in [0, whole]; part2 derived so the two parts always sum to whole.
  const part1 = rng(0, whole);
  const part2 = whole - part1;
  const which = rng(0, 2);
  const blank: Bond["blank"] = which === 0 ? "part1" : which === 1 ? "part2" : "whole";
  return { whole, part1, part2, blank };
}

// ─── Skip counting ───────────────────────────────────────────────────────────
// A sequence of `length` terms starting at `start`, stepping by `step`.
// `blanks` is the set of indices the child fills in.
type SkipRow = {
  values: number[];
  blanks: Set<number>;
};

function generateSkipRow(start: number, step: number, length: number): SkipRow {
  const values = Array.from({ length }, (_, i) => start + i * step);
  // Blank out roughly 40% of positions at varied spots, never the first term
  // (so the pattern is established). Guarantee at least 2 blanks.
  const blankCount = Math.max(2, Math.round(length * 0.4));
  const blanks = new Set<number>();
  const candidates = Array.from({ length: length - 1 }, (_, i) => i + 1);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  for (let i = 0; i < blankCount && i < candidates.length; i++) {
    blanks.add(candidates[i]);
  }
  return { values, blanks };
}

export default function NumberBondsPage() {
  const [mode, setMode] = useState<Mode>("bonds");

  // Number bond controls
  const [whole, setWhole] = useState(10);
  const [bondFormat, setBondFormat] = useState<BondFormat>("diagram");
  const [bondsPerPage, setBondsPerPage] = useState(12);

  // Skip counting controls
  const [step, setStep] = useState(2);
  const [skipStart, setSkipStart] = useState(0);
  const [seqLength, setSeqLength] = useState(8);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Shared
  const [pageCount, setPageCount] = useState(2);
  const [pageSize, setPageSize] = useState<PageSizeKey>("eInk");
  const [generating, setGenerating] = useState(false);

  // Stable previews
  const previewBonds = Array.from({ length: 4 }, () => generateBond(whole));
  const previewRows = Array.from({ length: 3 }, () =>
    generateSkipRow(skipStart, step, seqLength)
  );

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });
    const margin = 36;
    const titleH = 44;

    if (mode === "bonds") {
      generateBondsPdf(doc, w, h, margin, titleH);
    } else {
      generateSkipPdf(doc, w, h, margin, titleH);
    }

    const name =
      mode === "bonds"
        ? `number-bonds-${whole}-${pageCount}p.pdf`
        : `skip-counting-by-${step}-${pageCount}p.pdf`;
    doc.save(name);
    setGenerating(false);
  }

  function drawHeader(
    doc: jsPDF,
    w: number,
    margin: number,
    title: string,
    pageLabel: string,
    countLabel: string
  ) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(`${title}  ·  ${pageLabel}`, margin, margin + 16);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Name: ___________________________   Score: ______ / ${countLabel}`,
      w - margin,
      margin + 16,
      { align: "right" }
    );

    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 22, w - margin, margin + 22);
  }

  function generateBondsPdf(
    doc: jsPDF,
    w: number,
    h: number,
    margin: number,
    titleH: number
  ) {
    const cols = 3;
    const rows = Math.ceil(bondsPerPage / cols);
    const colW = (w - margin * 2) / cols;
    const rowH = (h - margin * 2 - titleH) / rows;

    const allBonds: Bond[][] = [];
    for (let page = 0; page < pageCount; page++) {
      allBonds.push(Array.from({ length: bondsPerPage }, () => generateBond(whole)));
    }

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();
      drawHeader(
        doc,
        w,
        margin,
        "Number Bonds Worksheet",
        `Page ${page + 1}`,
        String(bondsPerPage)
      );

      allBonds[page].forEach((bond, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cx = margin + col * colW + colW / 2;
        const cellTop = margin + titleH + row * rowH;

        // Problem number
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 160, 160);
        doc.text(`${i + 1}.`, margin + col * colW + 8, cellTop + 10);

        if (bondFormat === "diagram") {
          drawBondDiagram(doc, cx, cellTop, rowH, bond, false);
        } else {
          drawBondEquation(doc, margin + col * colW, cellTop, colW, bond, false);
        }
      });
    }

    // Answer key
    doc.addPage();
    drawHeader(doc, w, margin, "Number Bonds", "Answer Key", String(bondsPerPage));
    const answerColW = (w - margin * 2) / 4;
    let ansY = margin + titleH;
    allBonds.forEach((bonds, pageIdx) => {
      const blockH = Math.ceil(bondsPerPage / 4) * 18 + 22;
      // Spill onto a fresh page when the next page-block won't fit.
      if (ansY + blockH > h - margin) {
        doc.addPage();
        drawHeader(doc, w, margin, "Number Bonds", "Answer Key", String(bondsPerPage));
        ansY = margin + titleH;
      }
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(`Page ${pageIdx + 1}:`, margin, ansY);

      bonds.forEach((bond, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = margin + col * answerColW;
        const y = ansY + 14 + row * 18;
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(
          `${i + 1}. ${bond.part1} + ${bond.part2} = ${bond.whole}`,
          x,
          y
        );
      });
      ansY += blockH;
    });
  }

  // Draws the classic bond: whole circle on top, two part circles below,
  // connected by lines. `solved` fills every value (used for answer key only,
  // though worksheet pages always pass false).
  function drawBondDiagram(
    doc: jsPDF,
    cx: number,
    cellTop: number,
    rowH: number,
    bond: Bond,
    solved: boolean
  ) {
    const r = Math.min(16, rowH * 0.16);
    const wholeY = cellTop + 18 + r;
    const partY = wholeY + r * 2.6 + r;
    const partDX = r * 2.1;

    doc.setDrawColor(80, 80, 80);
    doc.setLineWidth(0.8);
    // connector lines
    doc.line(cx, wholeY + r, cx - partDX, partY - r);
    doc.line(cx, wholeY + r, cx + partDX, partY - r);

    // circles
    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(1);
    doc.circle(cx, wholeY, r, "S");
    doc.circle(cx - partDX, partY, r, "S");
    doc.circle(cx + partDX, partY, r, "S");

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(25, 25, 25);

    const label = (value: number, isBlank: boolean, x: number, y: number) => {
      if (!isBlank || solved) {
        doc.text(String(value), x, y + 4.5, { align: "center" });
      }
    };
    label(bond.whole, bond.blank === "whole", cx, wholeY);
    label(bond.part1, bond.blank === "part1", cx - partDX, partY);
    label(bond.part2, bond.blank === "part2", cx + partDX, partY);
  }

  function drawBondEquation(
    doc: jsPDF,
    x: number,
    cellTop: number,
    colW: number,
    bond: Bond,
    solved: boolean
  ) {
    const y = cellTop + rowEqOffset();
    doc.setFontSize(15);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(25, 25, 25);
    const cell = (value: number, isBlank: boolean) =>
      isBlank && !solved ? "____" : String(value);
    const text = `${cell(bond.part1, bond.blank === "part1")} + ${cell(
      bond.part2,
      bond.blank === "part2"
    )} = ${cell(bond.whole, bond.blank === "whole")}`;
    doc.text(text, x + colW / 2, y, { align: "center" });
  }

  function rowEqOffset() {
    return 34;
  }

  function generateSkipPdf(
    doc: jsPDF,
    w: number,
    h: number,
    margin: number,
    titleH: number
  ) {
    const rowH = (h - margin * 2 - titleH) / rowsPerPage;

    const allRows: SkipRow[][] = [];
    for (let page = 0; page < pageCount; page++) {
      allRows.push(
        Array.from({ length: rowsPerPage }, () =>
          generateSkipRow(skipStart, step, seqLength)
        )
      );
    }

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();
      drawHeader(
        doc,
        w,
        margin,
        `Skip Counting by ${step}`,
        `Page ${page + 1}`,
        String(rowsPerPage)
      );

      allRows[page].forEach((srow, i) => {
        const y = margin + titleH + i * rowH + rowH * 0.5;
        const x = margin;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 160, 160);
        doc.text(`${i + 1}.`, x, y);

        const cellW = (w - margin * 2 - 18) / seqLength;
        srow.values.forEach((value, idx) => {
          const cx = x + 18 + idx * cellW + cellW / 2;
          doc.setFontSize(13);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(25, 25, 25);
          if (srow.blanks.has(idx)) {
            // blank box
            doc.setDrawColor(120, 120, 120);
            doc.setLineWidth(0.8);
            doc.line(cx - cellW * 0.32, y + 3, cx + cellW * 0.32, y + 3);
          } else {
            doc.text(String(value), cx, y, { align: "center" });
          }
          // comma separators between cells
          if (idx < seqLength - 1) {
            doc.setFontSize(11);
            doc.setTextColor(140, 140, 140);
            doc.text(",", cx + cellW * 0.45, y);
          }
        });
      });
    }

    // Answer key
    doc.addPage();
    drawHeader(
      doc,
      w,
      margin,
      `Skip Counting by ${step}`,
      "Answer Key",
      String(rowsPerPage)
    );
    let ansY = margin + titleH;
    allRows.forEach((srows, pageIdx) => {
      const blockH = rowsPerPage * 16 + 24;
      // Spill onto a fresh page when the next page-block won't fit.
      if (ansY + blockH > h - margin) {
        doc.addPage();
        drawHeader(
          doc,
          w,
          margin,
          `Skip Counting by ${step}`,
          "Answer Key",
          String(rowsPerPage)
        );
        ansY = margin + titleH;
      }
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(`Page ${pageIdx + 1}:`, margin, ansY);

      srows.forEach((srow, i) => {
        const y = ansY + 14 + i * 16;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(`${i + 1}. ${srow.values.join(", ")}`, margin, y);
      });
      ansY += blockH;
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Number Bonds &amp; Skip Counting
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Two early-math worksheet types in one generator: part-part-whole number
          bonds and fill-in-the-blank skip counting. Answer key on the last page.
        </p>
        <Link
          href="/kids/math"
          className="inline-block mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
        >
          Looking for arithmetic drills? Try Math Worksheets →
        </Link>
      </div>

      {/* Mode toggle */}
      <div className="mb-6 inline-flex rounded-lg border border-border p-1 bg-muted/20">
        <button
          type="button"
          onClick={() => setMode("bonds")}
          className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
            mode === "bonds"
              ? "bg-background shadow-sm font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Number Bonds
        </button>
        <button
          type="button"
          onClick={() => setMode("skip")}
          className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
            mode === "skip"
              ? "bg-background shadow-sm font-medium"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Skip Counting
        </button>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        {mode === "bonds" ? (
          <>
            <div className="space-y-1.5">
              <Label>Whole (target)</Label>
              <Select
                value={String(whole)}
                onValueChange={(v) => setWhole(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 15, 20, 50, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Format</Label>
              <Select
                value={bondFormat}
                onValueChange={(v) => setBondFormat(v as BondFormat)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diagram">Bond diagram (circles)</SelectItem>
                  <SelectItem value="equation">Equation form</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bonds per page: {bondsPerPage}</Label>
              <Slider
                min={9}
                max={18}
                step={3}
                value={[bondsPerPage]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setBondsPerPage(val);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>9</span>
                <span>18</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label>Skip by (step)</Label>
              <Select value={String(step)} onValueChange={(v) => setStep(Number(v))}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 3, 4, 5, 10, 25, 100].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Start at</Label>
              <Select
                value={String(skipStart)}
                onValueChange={(v) => setSkipStart(Number(v))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 5, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Numbers per row: {seqLength}</Label>
              <Slider
                min={6}
                max={12}
                value={[seqLength]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setSeqLength(val);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6</span>
                <span>12</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rows per page: {rowsPerPage}</Label>
              <Slider
                min={6}
                max={14}
                value={[rowsPerPage]}
                onValueChange={(v) => {
                  const val = Array.isArray(v) ? v[0] : v;
                  setRowsPerPage(val);
                }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>6</span>
                <span>14</span>
              </div>
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label>Worksheet pages: {pageCount}</Label>
          <Slider
            min={1}
            max={10}
            value={[pageCount]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setPageCount(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>10</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Page size</Label>
          <Select value={pageSize} onValueChange={(v) => setPageSize(v as PageSizeKey)}>
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

      {/* Preview */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
          Preview
        </h2>
        <div className="paper-preview border border-border rounded-xl p-5">
          {mode === "bonds" ? (
            <>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <span className="text-sm font-semibold">
                  Number Bonds Worksheet
                </span>
                <span className="text-xs text-muted-foreground">
                  Whole = {whole}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {previewBonds.map((bond, i) => (
                  <div
                    key={i}
                    className="border border-border/40 rounded p-3 text-center"
                  >
                    <div className="text-[10px] text-muted-foreground mb-1 text-left">
                      {i + 1}.
                    </div>
                    {bondFormat === "diagram" ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-full border border-foreground flex items-center justify-center text-sm font-bold">
                          {bond.blank === "whole" ? "" : bond.whole}
                        </div>
                        <div className="flex gap-3">
                          <div className="w-7 h-7 rounded-full border border-foreground flex items-center justify-center text-xs font-bold">
                            {bond.blank === "part1" ? "" : bond.part1}
                          </div>
                          <div className="w-7 h-7 rounded-full border border-foreground flex items-center justify-center text-xs font-bold">
                            {bond.blank === "part2" ? "" : bond.part2}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono text-sm py-3">
                        {bond.blank === "part1" ? "__" : bond.part1} +{" "}
                        {bond.blank === "part2" ? "__" : bond.part2} ={" "}
                        {bond.blank === "whole" ? "__" : bond.whole}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <span className="text-sm font-semibold">
                  Skip Counting by {step}
                </span>
                <span className="text-xs text-muted-foreground">
                  Start at {skipStart}
                </span>
              </div>
              <div className="space-y-3">
                {previewRows.map((srow, i) => (
                  <div key={i} className="flex items-center gap-2 font-mono text-sm">
                    <span className="text-[10px] text-muted-foreground w-4">
                      {i + 1}.
                    </span>
                    {srow.values.map((value, idx) => (
                      <span key={idx} className="flex items-center gap-2">
                        <span
                          className={
                            srow.blanks.has(idx)
                              ? "inline-block w-8 border-b border-foreground text-center"
                              : ""
                          }
                        >
                          {srow.blanks.has(idx) ? " " : value}
                        </span>
                        {idx < srow.values.length - 1 && (
                          <span className="text-muted-foreground">,</span>
                        )}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Answer key included on the last page.
          </p>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating
          ? "Generating…"
          : `Generate & Download PDF (${pageCount} sheet${
              pageCount > 1 ? "s" : ""
            } + answer key)`}
      </Button>
    </div>
  );
}
