"use client";

import { useState } from "react";
import Link from "next/link";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

interface OpConfig {
  enabled: boolean;
  symbol: string;
  label: string;
}

interface RangeConfig {
  min1: number;
  max1: number;
  min2: number;
  max2: number;
}

function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProblem(
  ops: string[],
  range: RangeConfig
): { a: number; b: number; ans: number; symbol: string } {
  const op = ops[Math.floor(Math.random() * ops.length)];
  const symbolMap: Record<string, string> = { add: "+", sub: "−", mul: "×", div: "÷" };
  const symbol = symbolMap[op];

  let a: number, b: number, ans: number;

  switch (op) {
    case "add":
      a = rng(range.min1, range.max1);
      b = rng(range.min2, range.max2);
      ans = a + b;
      break;
    case "sub":
      a = rng(range.min1, range.max1);
      b = rng(range.min2, Math.min(range.max2, a));
      if (b < range.min2) b = range.min2;
      if (b > a) [a, b] = [b, a];
      ans = a - b;
      break;
    case "mul":
      a = rng(range.min1, range.max1);
      b = rng(range.min2, range.max2);
      ans = a * b;
      break;
    case "div": {
      b = rng(Math.max(1, range.min2), range.max2);
      ans = rng(range.min1, range.max1);
      a = b * ans;
      break;
    }
    default:
      a = rng(range.min1, range.max1);
      b = rng(range.min2, range.max2);
      ans = a + b;
  }

  return { a, b, ans, symbol };
}

export default function CustomMathPage() {
  const [ops, setOps] = useState<Record<string, OpConfig>>({
    add: { enabled: true, symbol: "+", label: "Addition (+)" },
    sub: { enabled: false, symbol: "−", label: "Subtraction (−)" },
    mul: { enabled: false, symbol: "×", label: "Multiplication (×)" },
    div: { enabled: false, symbol: "÷", label: "Division (÷)" },
  });
  const [range, setRange] = useState<RangeConfig>({ min1: 1, max1: 20, min2: 1, max2: 20 });
  const [problemCount, setProblemCount] = useState(20);
  const [pageCount, setPageCount] = useState(2);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4");
  const [generating, setGenerating] = useState(false);

  const enabledOps = Object.entries(ops)
    .filter(([, v]) => v.enabled)
    .map(([k]) => k);

  const toggleOp = (key: string) => {
    setOps((prev) => {
      const next = { ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } };
      const anyEnabled = Object.values(next).some((v) => v.enabled);
      if (!anyEnabled) return prev;
      return next;
    });
  };

  const previewProblems =
    enabledOps.length > 0
      ? Array.from({ length: 6 }, () => generateProblem(enabledOps, range))
      : [];

  async function generate() {
    if (enabledOps.length === 0) return;
    setGenerating(true);

    const { jsPDF } = await import("jspdf");
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const margin = 36;
    const titleH = 40;
    const cols = problemCount <= 15 ? 2 : 3;
    const rows = Math.ceil(problemCount / cols);
    const colW = (w - margin * 2) / cols;
    const rowH = (h - margin * 2 - titleH) / rows;

    const allProblems: ReturnType<typeof generateProblem>[][] = [];
    for (let page = 0; page < pageCount; page++) {
      allProblems.push(
        Array.from({ length: problemCount }, () => generateProblem(enabledOps, range))
      );
    }

    const opsLabel = enabledOps
      .map((k) => ops[k].symbol)
      .join(" ");

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();
      const problems = allProblems[page];

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(
        `Custom Math Worksheet (${opsLabel})  ·  Page ${page + 1}`,
        margin,
        margin + 16
      );

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Name: ___________________________   Score: ______ / ${problemCount}`,
        w - margin,
        margin + 16,
        { align: "right" }
      );

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 22, w - margin, margin + 22);

      problems.forEach((prob, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = margin + col * colW + colW * 0.1;
        const y = margin + titleH + row * rowH;
        const boxW = colW * 0.7;
        const boxH = rowH * 0.8;

        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(160, 160, 160);
        doc.text(`${i + 1}.`, x, y + 10);

        doc.setFontSize(18);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(20, 20, 20);
        doc.text(String(prob.a), x + boxW * 0.5, y + 24, { align: "right" });
        doc.text(String(prob.b), x + boxW * 0.5, y + 42, { align: "right" });

        doc.setFontSize(16);
        doc.setTextColor(60, 60, 60);
        doc.text(prob.symbol, x + boxW * 0.1, y + 42);

        doc.setDrawColor(100, 100, 100);
        doc.setLineWidth(0.8);
        doc.line(x + boxW * 0.1, y + 48, x + boxW * 0.55, y + 48);

        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.3);
        doc.roundedRect(x - 4, y + 2, boxW + 8, boxH, 3, 3, "S");
      });
    }

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
      const startY = margin + titleH + pageIdx * (Math.ceil(problemCount / 5) * 18 + 20);

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

    doc.save(`math-custom-${pageCount}p.pdf`);
    setGenerating(false);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <Link
          href="/kids/math"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Math Worksheets
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-2">Custom Math Worksheets</h1>
        <p className="mt-1 text-muted-foreground">
          Fine-tune every aspect of your math worksheets — choose operations, set exact number ranges, and control problem count.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operations</CardTitle>
              <CardDescription>Select which operations to include (at least one).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ops).map(([key, config]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleOp(key)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors ${
                      config.enabled
                        ? "border-foreground/20 bg-foreground/5 text-foreground"
                        : "border-border text-muted-foreground hover:border-foreground/10"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] font-bold ${
                        config.enabled
                          ? "border-foreground bg-foreground text-background"
                          : "border-muted-foreground/40"
                      }`}
                    >
                      {config.enabled ? "✓" : ""}
                    </span>
                    {config.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Number Ranges</CardTitle>
              <CardDescription>
                Set min/max for each operand. Division answers are kept whole.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">First operand</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={range.min1}
                      onChange={(e) =>
                        setRange((r) => ({ ...r, min1: Math.max(0, Number(e.target.value)) }))
                      }
                      className="h-8 w-20 rounded-lg border border-input bg-transparent px-2 text-sm text-center outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                    <span className="text-muted-foreground text-sm">to</span>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={range.max1}
                      onChange={(e) =>
                        setRange((r) => ({ ...r, max1: Math.max(r.min1, Number(e.target.value)) }))
                      }
                      className="h-8 w-20 rounded-lg border border-input bg-transparent px-2 text-sm text-center outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Second operand</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={range.min2}
                      onChange={(e) =>
                        setRange((r) => ({ ...r, min2: Math.max(0, Number(e.target.value)) }))
                      }
                      className="h-8 w-20 rounded-lg border border-input bg-transparent px-2 text-sm text-center outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                    <span className="text-muted-foreground text-sm">to</span>
                    <input
                      type="number"
                      min={0}
                      max={999}
                      value={range.max2}
                      onChange={(e) =>
                        setRange((r) => ({ ...r, max2: Math.max(r.min2, Number(e.target.value)) }))
                      }
                      className="h-8 w-20 rounded-lg border border-input bg-transparent px-2 text-sm text-center outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Output</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Problems per page: {problemCount}</Label>
                <Slider
                  min={10}
                  max={30}
                  step={2}
                  value={[problemCount]}
                  onValueChange={(v) => {
                    const val = Array.isArray(v) ? v[0] : v;
                    setProblemCount(val);
                  }}
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
                  onValueChange={(v) => {
                    const val = Array.isArray(v) ? v[0] : v;
                    setPageCount(val);
                  }}
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
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={generate}
            disabled={generating || enabledOps.length === 0}
            className="w-full"
            size="lg"
          >
            {generating
              ? "Generating…"
              : `Generate & Download PDF (${pageCount} sheet${pageCount > 1 ? "s" : ""} + key)`}
          </Button>
        </div>
      </div>

      {previewProblems.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">
            Preview
          </h2>
          <div className="border border-border rounded-xl bg-white p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
              <span className="text-sm font-semibold">
                Custom Worksheet ({enabledOps.map((k) => ops[k].symbol).join(", ")})
              </span>
              <span className="text-xs text-muted-foreground">
                Range: {range.min1}–{range.max1} {enabledOps.map((k) => ops[k].symbol).join("/")} {range.min2}–{range.max2}
              </span>
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
            <p className="text-xs text-muted-foreground mt-3">
              Answer key included on the last page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
