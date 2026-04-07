"use client";

import { useState } from "react";
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

const PAGE_SIZES = {
  remarkable: { w: 495.72, h: 661.68, label: "reMarkable (1404×1872)" },
  a4: { w: 595.28, h: 841.89, label: "A4" },
  letter: { w: 612, h: 792, label: "US Letter" },
};

type PageSizeKey = keyof typeof PAGE_SIZES;
type Operation = "addition" | "subtraction" | "multiplication" | "division";
type Difficulty = "single" | "double" | "mixed";

function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem(op: Operation, diff: Difficulty): { a: number; b: number; ans: number; symbol: string } {
  const isDouble = diff === "double" || (diff === "mixed" && Math.random() > 0.5);
  const max = isDouble ? 99 : 9;

  let a: number, b: number, ans: number;
  const symbol = { addition: "+", subtraction: "−", multiplication: "×", division: "÷" }[op];

  switch (op) {
    case "addition":
      a = rng(1, max);
      b = rng(1, max);
      ans = a + b;
      break;
    case "subtraction":
      a = rng(1, max);
      b = rng(1, a); // b <= a so result >= 0
      ans = a - b;
      break;
    case "multiplication":
      a = rng(1, isDouble ? 12 : 9);
      b = rng(1, isDouble ? 12 : 9);
      ans = a * b;
      break;
    case "division": {
      b = rng(1, isDouble ? 12 : 9);
      ans = rng(1, isDouble ? 12 : 9);
      a = b * ans; // ensure clean division
      break;
    }
  }

  return { a, b, ans, symbol };
}

export default function MathPage() {
  const [operation, setOperation] = useState<Operation>("addition");
  const [difficulty, setDifficulty] = useState<Difficulty>("single");
  const [problemsPerPage, setProblemsPerPage] = useState(20);
  const [pageCount, setPageCount] = useState(2);
  const [pageSize, setPageSize] = useState<PageSizeKey>("remarkable");
  const [generating, setGenerating] = useState(false);

  // Generate a stable preview
  const previewProblems = Array.from({ length: 6 }, () => generateProblem(operation, difficulty));

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const margin = 36;
    const titleH = 40;
    const cols = problemsPerPage <= 15 ? 2 : 3;
    const rows = Math.ceil(problemsPerPage / cols);
    const colW = (w - margin * 2) / cols;
    const rowH = (h - margin * 2 - titleH) / rows;

    // Generate all problems
    const allProblems: ReturnType<typeof generateProblem>[][] = [];
    for (let page = 0; page < pageCount; page++) {
      allProblems.push(
        Array.from({ length: problemsPerPage }, () => generateProblem(operation, difficulty))
      );
    }

    // Worksheet pages
    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();
      const problems = allProblems[page];

      // Title
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(
        `${operation.charAt(0).toUpperCase() + operation.slice(1)} Worksheet  ·  Page ${page + 1}`,
        margin,
        margin + 16
      );

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(`Name: ___________________________   Score: ______ / ${problemsPerPage}`, w - margin, margin + 16, { align: "right" });

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 22, w - margin, margin + 22);

      // Problems
      problems.forEach((prob, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = margin + col * colW + colW * 0.1;
        const y = margin + titleH + row * rowH;

        const boxW = colW * 0.7;
        const boxH = rowH * 0.8;

        // Problem number
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 160, 160);
        doc.text(`${i + 1}.`, x, y + 10);

        // Numbers — vertical format
        doc.setFontSize(18);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(20, 20, 20);
        doc.text(String(prob.a), x + boxW * 0.5, y + 24, { align: "right" });
        doc.text(String(prob.b), x + boxW * 0.5, y + 42, { align: "right" });

        // Operation symbol
        doc.setFontSize(16);
        doc.setTextColor(60, 60, 60);
        doc.text(prob.symbol, x + boxW * 0.1, y + 42);

        // Answer line
        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.8);
        doc.line(x + boxW * 0.1, y + 48, x + boxW * 0.55, y + 48);

        // Light box border
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.3);
        doc.roundedRect(x - 4, y + 2, boxW + 8, boxH, 3, 3, "S");
      });
    }

    // Answer key page
    doc.addPage();
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Answer Key", margin, margin + 16);
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(0.5);
    doc.line(margin, margin + 22, w - margin, margin + 22);

    allProblems.forEach((problems, pageIdx) => {
      const answerColW = (w - margin * 2) / 5;
      const startY = margin + titleH + pageIdx * (Math.ceil(problemsPerPage / 5) * 18 + 20);

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(`Page ${pageIdx + 1}:`, margin, startY);

      problems.forEach((prob, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const x = margin + col * answerColW;
        const y = startY + 12 + row * 18;
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(`${i + 1}. ${prob.a} ${prob.symbol} ${prob.b} = ${prob.ans}`, x, y);
      });
    });

    doc.save(`math-${operation}-${difficulty}-${pageCount}p.pdf`);
    setGenerating(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Math Worksheets</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Clean arithmetic practice sheets with answer key on the last page.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <div className="space-y-1.5">
          <Label>Operation</Label>
          <Select value={operation} onValueChange={(v) => setOperation(v as Operation)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="addition">Addition (+)</SelectItem>
              <SelectItem value="subtraction">Subtraction (−)</SelectItem>
              <SelectItem value="multiplication">Multiplication (×)</SelectItem>
              <SelectItem value="division">Division (÷)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Difficulty</Label>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single digit (1–9)</SelectItem>
              <SelectItem value="double">Double digit (10–99)</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Problems per page: {problemsPerPage}</Label>
          <Slider
            min={10}
            max={30}
            step={2}
            value={[problemsPerPage]}
            onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setProblemsPerPage(val); }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10</span><span>30</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Worksheet pages: {pageCount}</Label>
          <Slider
            min={1}
            max={10}
            value={[pageCount]}
            onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setPageCount(val); }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span><span>10</span>
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
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Preview</h2>
        <div className="border border-border rounded-xl bg-white p-5">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <span className="text-sm font-semibold capitalize">{operation} Worksheet</span>
            <span className="text-xs text-muted-foreground">Name: ____________  Score: __ / {problemsPerPage}</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {previewProblems.map((prob, i) => (
              <div key={i} className="border border-border/40 rounded p-3">
                <div className="text-[10px] text-muted-foreground mb-1">{i + 1}.</div>
                <div className="font-mono text-right text-base font-medium">{prob.a}</div>
                <div className="font-mono text-right text-base font-medium flex justify-between">
                  <span className="text-muted-foreground">{prob.symbol}</span>
                  <span>{prob.b}</span>
                </div>
                <div className="border-t border-foreground mt-1 pt-1 h-5" />
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Answer key included on the last page.</p>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating ? "Generating…" : `Generate & Download PDF (${pageCount} sheet${pageCount > 1 ? "s" : ""} + answer key)`}
      </Button>
    </div>
  );
}
