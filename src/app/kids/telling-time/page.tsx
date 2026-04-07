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

interface TimeProblem {
  hours: number;
  minutes: number;
}

function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTime(diff: Difficulty): TimeProblem {
  const hours = rng(1, 12);
  let minutes: number;
  if (diff === "easy") {
    minutes = 0;
  } else if (diff === "medium") {
    minutes = [0, 15, 30, 45][rng(0, 3)];
  } else {
    minutes = rng(0, 11) * 5;
  }
  return { hours, minutes };
}

function formatTime(t: TimeProblem): string {
  return `${t.hours}:${String(t.minutes).padStart(2, "0")}`;
}

function drawClockPdf(
  doc: jsPDF,
  cx: number,
  cy: number,
  radius: number,
  time: TimeProblem | null,
  showHands: boolean
) {
  // Outer circle
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(1.5);
  doc.setFillColor(255, 255, 255);
  doc.circle(cx, cy, radius, "FD");

  // Inner rim
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.3);
  doc.circle(cx, cy, radius - 3, "S");

  // Hour tick marks and numbers
  for (let i = 1; i <= 12; i++) {
    const angle = ((i * 30 - 90) * Math.PI) / 180;
    const outerR = radius - 5;
    const innerR = i % 3 === 0 ? radius - 14 : radius - 10;
    const ox = cx + Math.cos(angle) * outerR;
    const oy = cy + Math.sin(angle) * outerR;
    const ix = cx + Math.cos(angle) * innerR;
    const iy = cy + Math.sin(angle) * innerR;

    doc.setDrawColor(60, 60, 60);
    doc.setLineWidth(i % 3 === 0 ? 1.2 : 0.6);
    doc.line(ox, oy, ix, iy);

    // Numbers
    const numR = radius - 20;
    const nx = cx + Math.cos(angle) * numR;
    const ny = cy + Math.sin(angle) * numR;
    doc.setFontSize(Math.max(7, radius * 0.16));
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(String(i), nx, ny + 2.5, { align: "center" });
  }

  // Minute tick marks
  for (let i = 0; i < 60; i++) {
    if (i % 5 === 0) continue;
    const angle = ((i * 6 - 90) * Math.PI) / 180;
    const ox = cx + Math.cos(angle) * (radius - 5);
    const oy = cy + Math.sin(angle) * (radius - 5);
    const ix = cx + Math.cos(angle) * (radius - 8);
    const iy = cy + Math.sin(angle) * (radius - 8);
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.3);
    doc.line(ox, oy, ix, iy);
  }

  // Center dot
  doc.setFillColor(40, 40, 40);
  doc.circle(cx, cy, 2.5, "F");

  if (showHands && time) {
    // Hour hand
    const hourAngle =
      ((time.hours % 12) * 30 + time.minutes * 0.5 - 90) * (Math.PI / 180);
    const hourLen = radius * 0.5;
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(3);
    doc.line(
      cx,
      cy,
      cx + Math.cos(hourAngle) * hourLen,
      cy + Math.sin(hourAngle) * hourLen
    );

    // Minute hand
    const minAngle = (time.minutes * 6 - 90) * (Math.PI / 180);
    const minLen = radius * 0.72;
    doc.setDrawColor(30, 30, 30);
    doc.setLineWidth(1.5);
    doc.line(
      cx,
      cy,
      cx + Math.cos(minAngle) * minLen,
      cy + Math.sin(minAngle) * minLen
    );

    // Center cap
    doc.setFillColor(30, 30, 30);
    doc.circle(cx, cy, 2, "F");
  }
}

export default function TellingTimePage() {
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

    const cols = problemsPerPage <= 4 ? 2 : 3;
    const rows = Math.ceil(problemsPerPage / cols);
    const cellW = (w - margin * 2) / cols;
    const cellH = (h - margin * 2 - titleH) / rows;
    const clockR = Math.min(cellW, cellH) * 0.32;

    const allProblems: TimeProblem[][] = [];

    for (let page = 0; page < pageCount; page++) {
      allProblems.push(
        Array.from({ length: problemsPerPage }, () => generateTime(difficulty))
      );
    }

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();
      const problems = allProblems[page];

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(
        `Telling Time  ·  Page ${page + 1}`,
        margin,
        margin + 14
      );

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(
        "Name: ___________________________",
        w - margin,
        margin + 14,
        { align: "right" }
      );

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 20, w - margin, margin + 20);

      problems.forEach((time, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const cellX = margin + col * cellW;
        const cellY = margin + titleH + row * cellH;
        const cx = cellX + cellW / 2;
        const cy = cellY + cellH * 0.42;

        // Problem number
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text(`${i + 1}.`, cellX + 4, cellY + 10);

        drawClockPdf(doc, cx, cy, clockR, time, true);

        // Write-the-time line
        const lineY = cy + clockR + 16;
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text("Time:", cx - 30, lineY);
        doc.setDrawColor(140, 140, 140);
        doc.setLineWidth(0.6);
        doc.line(cx - 8, lineY, cx + 36, lineY);
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
    const ansColW = (w - margin * 2) / 4;

    allProblems.forEach((problems, pageIdx) => {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(80, 80, 80);
      doc.text(`Page ${pageIdx + 1}:`, margin, ay);
      ay += 14;

      problems.forEach((time, i) => {
        const col = i % 4;
        const x = margin + col * ansColW + 10;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text(`${i + 1}. ${formatTime(time)}`, x, ay);
        if (col === 3 || i === problems.length - 1) {
          ay += 14;
        }
      });
      ay += 8;
      if (ay > h - margin) {
        doc.addPage();
        ay = margin + 20;
      }
    });

    doc.save(`telling-time-${difficulty}-${pageCount}p.pdf`);
    setGenerating(false);
  }

  const previewTimes: TimeProblem[] = [
    { hours: 3, minutes: 0 },
    { hours: 7, minutes: 30 },
    { hours: 10, minutes: 15 },
    { hours: 1, minutes: 45 },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Telling Time Worksheets
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Practice reading analog clocks with exercises for hours, half hours,
          and minutes.
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
              <SelectItem value="easy">Easy (hours only)</SelectItem>
              <SelectItem value="medium">Medium (half & quarter hours)</SelectItem>
              <SelectItem value="hard">Hard (5-minute intervals)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Clocks per page: {problemsPerPage}</Label>
          <Slider
            min={4}
            max={9}
            value={[problemsPerPage]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setProblemsPerPage(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>4</span>
            <span>9</span>
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
        <div className="border border-border rounded-xl bg-white p-5">
          <div className="grid grid-cols-4 gap-3">
            {previewTimes.map((time, i) => {
              const hourAngle =
                ((time.hours % 12) * 30 + time.minutes * 0.5 - 90) *
                (Math.PI / 180);
              const minAngle = (time.minutes * 6 - 90) * (Math.PI / 180);
              const r = 38;
              return (
                <div key={i} className="flex flex-col items-center gap-2">
                  <svg width={90} height={90} viewBox="0 0 90 90">
                    <circle
                      cx={45}
                      cy={45}
                      r={r}
                      fill="white"
                      stroke="#333"
                      strokeWidth={1.5}
                    />
                    {Array.from({ length: 12 }, (_, n) => {
                      const a = ((n * 30) * Math.PI) / 180;
                      const ox = 45 + Math.cos(a) * (r - 3);
                      const oy = 45 + Math.sin(a) * (r - 3);
                      const ix = 45 + Math.cos(a) * (r - (n % 3 === 0 ? 9 : 6));
                      const iy = 45 + Math.sin(a) * (r - (n % 3 === 0 ? 9 : 6));
                      return (
                        <line
                          key={n}
                          x1={ox}
                          y1={oy}
                          x2={ix}
                          y2={iy}
                          stroke="#666"
                          strokeWidth={n % 3 === 0 ? 1 : 0.5}
                        />
                      );
                    })}
                    {Array.from({ length: 12 }, (_, n) => {
                      const a = (((n + 1) * 30 - 90) * Math.PI) / 180;
                      const nx = 45 + Math.cos(a) * (r - 15);
                      const ny = 45 + Math.sin(a) * (r - 15);
                      return (
                        <text
                          key={n}
                          x={nx}
                          y={ny}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={8}
                          fontWeight="bold"
                          fill="#333"
                        >
                          {n + 1}
                        </text>
                      );
                    })}
                    {/* Hour hand */}
                    <line
                      x1={45}
                      y1={45}
                      x2={45 + Math.cos(hourAngle) * r * 0.5}
                      y2={45 + Math.sin(hourAngle) * r * 0.5}
                      stroke="#222"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                    />
                    {/* Minute hand */}
                    <line
                      x1={45}
                      y1={45}
                      x2={45 + Math.cos(minAngle) * r * 0.72}
                      y2={45 + Math.sin(minAngle) * r * 0.72}
                      stroke="#222"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                    />
                    <circle cx={45} cy={45} r={2} fill="#222" />
                  </svg>
                  <span className="text-xs text-muted-foreground">
                    Time: _____
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
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
