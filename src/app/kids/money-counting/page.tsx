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
import { PAGE_SIZES, type PageSizeKey } from "@/lib/pdf-constants";

type Difficulty = "easy" | "medium" | "hard";

interface Coin {
  value: number;
  label: string;
  sizeFactor: number;
}

const ALL_COINS: Coin[] = [
  { value: 1, label: "1¢", sizeFactor: 0.7 },
  { value: 5, label: "5¢", sizeFactor: 0.8 },
  { value: 10, label: "10¢", sizeFactor: 0.75 },
  { value: 25, label: "25¢", sizeFactor: 1.0 },
];

function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface CountingProblem {
  coins: { coin: Coin; count: number }[];
  total: number;
  type: "count" | "make";
}

function getAvailableCoins(diff: Difficulty): Coin[] {
  if (diff === "easy") return ALL_COINS.filter((c) => c.value <= 5);
  if (diff === "medium") return ALL_COINS.filter((c) => c.value <= 10);
  return ALL_COINS;
}

function getMaxTotal(diff: Difficulty): number {
  if (diff === "easy") return 50;
  if (diff === "medium") return 100;
  return 200;
}

function generateCountProblem(diff: Difficulty): CountingProblem {
  const available = getAvailableCoins(diff);
  const maxTotal = getMaxTotal(diff);
  const coins: { coin: Coin; count: number }[] = [];
  let total = 0;

  const numTypes = rng(2, available.length);
  const selected = [...available].sort(() => Math.random() - 0.5).slice(0, numTypes);

  for (const coin of selected) {
    const maxCount = Math.min(
      Math.floor((maxTotal - total) / coin.value),
      coin.value === 1 ? 6 : coin.value === 5 ? 5 : coin.value === 10 ? 4 : 3
    );
    if (maxCount <= 0) continue;
    const count = rng(1, maxCount);
    coins.push({ coin, count });
    total += coin.value * count;
  }

  if (total === 0) {
    const c = available[0];
    const count = rng(1, 4);
    coins.push({ coin: c, count });
    total = c.value * count;
  }

  return { coins, total, type: "count" };
}

function generateMakeProblem(diff: Difficulty): CountingProblem {
  const available = getAvailableCoins(diff);
  const maxTotal = getMaxTotal(diff);
  const target = rng(Math.min(10, maxTotal), maxTotal);

  let remaining = target;
  const coins: { coin: Coin; count: number }[] = [];
  const sorted = [...available].sort((a, b) => b.value - a.value);

  for (const coin of sorted) {
    if (remaining <= 0) break;
    const maxCount = Math.floor(remaining / coin.value);
    if (maxCount <= 0) continue;
    const count = rng(1, maxCount);
    coins.push({ coin, count });
    remaining -= coin.value * count;
  }

  if (remaining > 0) {
    const penny = available.find((c) => c.value === 1);
    if (penny) {
      const existing = coins.find((c) => c.coin.value === 1);
      if (existing) {
        existing.count += remaining;
      } else {
        coins.push({ coin: penny, count: remaining });
      }
    }
  }

  const actualTotal = coins.reduce((s, c) => s + c.coin.value * c.count, 0);
  return { coins, total: actualTotal, type: "make" };
}

function generateProblem(diff: Difficulty): CountingProblem {
  return Math.random() > 0.4
    ? generateCountProblem(diff)
    : generateMakeProblem(diff);
}

function formatCents(cents: number): string {
  if (cents >= 100) {
    const dollars = Math.floor(cents / 100);
    const rem = cents % 100;
    return rem === 0 ? `$${dollars}.00` : `$${dollars}.${String(rem).padStart(2, "0")}`;
  }
  return `${cents}¢`;
}

function drawCoinPdf(
  doc: jsPDF,
  cx: number,
  cy: number,
  baseR: number,
  coin: Coin
) {
  const r = baseR * coin.sizeFactor;

  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(1);
  doc.setFillColor(245, 245, 240);
  doc.circle(cx, cy, r, "FD");

  doc.setDrawColor(120, 120, 120);
  doc.setLineWidth(0.4);
  doc.circle(cx, cy, r - 2, "S");

  doc.setFontSize(Math.max(6, r * 0.7));
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);
  doc.text(coin.label, cx, cy + r * 0.25, { align: "center" });
}

export default function MoneyCountingPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [problemsPerPage, setProblemsPerPage] = useState(6);
  const [pageCount, setPageCount] = useState(2);
  const [pageSize, setPageSize] = useState<PageSizeKey>("eInk");
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const margin = 32;
    const titleH = 36;

    const allProblems: CountingProblem[][] = [];
    for (let page = 0; page < pageCount; page++) {
      allProblems.push(
        Array.from({ length: problemsPerPage }, () =>
          generateProblem(difficulty)
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
        `Money Counting  ·  Page ${page + 1}`,
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
      const coinBaseR = Math.min(14, rowH * 0.22);

      problems.forEach((prob, pIdx) => {
        const py = margin + titleH + pIdx * rowH;

        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(140, 140, 140);
        doc.text(`${pIdx + 1}.`, margin, py + 12);

        if (prob.type === "count") {
          let coinX = margin + 20;
          const coinY = py + rowH * 0.35;

          prob.coins.forEach(({ coin, count }) => {
            for (let c = 0; c < count; c++) {
              if (coinX + coinBaseR * 2 > w - margin) break;
              drawCoinPdf(
                doc,
                coinX + coinBaseR,
                coinY,
                coinBaseR,
                coin
              );
              coinX += coinBaseR * 2.2;
            }
            coinX += 4;
          });

          // Answer line
          const lineY = py + rowH * 0.72;
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(100, 100, 100);
          doc.text("Total:", margin + 20, lineY);
          doc.setDrawColor(140, 140, 140);
          doc.setLineWidth(0.6);
          doc.line(margin + 50, lineY, margin + 110, lineY);
        } else {
          // "Make this amount" problem
          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(30, 30, 30);
          doc.text(
            `Make ${formatCents(prob.total)}`,
            margin + 20,
            py + 14
          );

          const available = getAvailableCoins(difficulty);
          const tableY = py + 22;
          const colW = (w - margin * 2 - 20) / available.length;

          available.forEach((coin, ci) => {
            const cx = margin + 20 + ci * colW + colW / 2;
            drawCoinPdf(doc, cx, tableY + 10, Math.min(10, coinBaseR * 0.8), coin);
            doc.setDrawColor(160, 160, 160);
            doc.setLineWidth(0.5);
            doc.line(cx - 12, tableY + 22, cx + 12, tableY + 22);
          });
        }

        if (pIdx < problemsPerPage - 1) {
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.3);
          doc.line(margin, py + rowH, w - margin, py + rowH);
        }
      });
    }

    // Answer key
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

      problems.forEach((prob, i) => {
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);

        if (prob.type === "count") {
          const coinDesc = prob.coins
            .map((c) => `${c.count}×${c.coin.label}`)
            .join(" + ");
          doc.text(
            `${i + 1}. ${coinDesc} = ${formatCents(prob.total)}`,
            margin + 10,
            ay
          );
        } else {
          const breakdown = prob.coins
            .map((c) => `${c.count}×${c.coin.label}`)
            .join(" + ");
          doc.text(
            `${i + 1}. ${formatCents(prob.total)} → ${breakdown}`,
            margin + 10,
            ay
          );
        }
        ay += 13;
        if (ay > h - margin) {
          doc.addPage();
          ay = margin + 20;
        }
      });
      ay += 8;
    });

    doc.save(`money-counting-${difficulty}-${pageCount}p.pdf`);
    setGenerating(false);
  }

  const previewProblems: CountingProblem[] = [
    {
      coins: [
        { coin: ALL_COINS[0], count: 3 },
        { coin: ALL_COINS[1], count: 2 },
      ],
      total: 13,
      type: "count",
    },
    {
      coins: [
        { coin: ALL_COINS[3], count: 1 },
        { coin: ALL_COINS[2], count: 2 },
        { coin: ALL_COINS[0], count: 3 },
      ],
      total: 48,
      type: "count",
    },
    {
      coins: [
        { coin: ALL_COINS[3], count: 2 },
        { coin: ALL_COINS[1], count: 1 },
      ],
      total: 55,
      type: "make",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Money Counting Worksheets
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Learn to count coins and make change with visual coin-counting
          exercises.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
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
              <SelectItem value="easy">
                Easy (pennies & nickels, under 50¢)
              </SelectItem>
              <SelectItem value="medium">
                Medium (+ dimes, under $1)
              </SelectItem>
              <SelectItem value="hard">
                Hard (all coins, up to $2)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Problems per page: {problemsPerPage}</Label>
          <Slider
            min={4}
            max={10}
            value={[problemsPerPage]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setProblemsPerPage(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>4</span>
            <span>10</span>
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
            <div key={i}>
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-muted-foreground mr-1">
                  {i + 1}.
                </span>
                {prob.type === "make" && (
                  <span className="text-sm font-semibold mr-2">
                    Make {formatCents(prob.total)}:
                  </span>
                )}
              </div>
              {prob.type === "count" && (
                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                  {prob.coins.flatMap(({ coin, count }) =>
                    Array.from({ length: count }, (_, ci) => (
                      <span
                        key={`${coin.value}-${ci}`}
                        className="inline-flex items-center justify-center rounded-full border-2 border-foreground/30 bg-muted/40 text-[10px] font-bold"
                        style={{
                          width: `${20 * coin.sizeFactor + 8}px`,
                          height: `${20 * coin.sizeFactor + 8}px`,
                        }}
                      >
                        {coin.label}
                      </span>
                    ))
                  )}
                </div>
              )}
              {prob.type === "count" ? (
                <div className="text-xs text-muted-foreground">
                  Total: _______
                </div>
              ) : (
                <div className="flex gap-4 mt-1">
                  {getAvailableCoins(difficulty).map((coin) => (
                    <div key={coin.value} className="flex flex-col items-center gap-1">
                      <span
                        className="inline-flex items-center justify-center rounded-full border-2 border-foreground/30 bg-muted/40 text-[9px] font-bold"
                        style={{
                          width: `${16 * coin.sizeFactor + 6}px`,
                          height: `${16 * coin.sizeFactor + 6}px`,
                        }}
                      >
                        {coin.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ___
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {i < previewProblems.length - 1 && (
                <div className="border-t border-border/30 mt-3" />
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
