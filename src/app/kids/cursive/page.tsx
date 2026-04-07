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

type ContentType = "lowercase" | "uppercase" | "words" | "sentences";

const CONTENT_SETS: Record<ContentType, string[]> = {
  lowercase: "abcdefghijklmnopqrstuvwxyz".split(""),
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  words: [
    "apple", "bird", "cake", "door", "egg", "fish", "goat", "hand",
    "ice", "jump", "kite", "lamp", "moon", "nest", "open", "play",
    "queen", "rain", "star", "tree", "upon", "vine", "wind", "box",
    "yarn", "zoo",
  ],
  sentences: [
    "The quick brown fox jumps.",
    "A big red ball rolls fast.",
    "She runs to the green park.",
    "We like to play in the sun.",
    "The cat sat on the soft mat.",
    "He gave her a pretty flower.",
    "I can see the bright stars.",
    "My dog loves to fetch sticks.",
    "The birds sing every morning.",
    "We read books at the library.",
  ],
};

const CONTENT_LABELS: Record<ContentType, string> = {
  lowercase: "Lowercase letters (a–z)",
  uppercase: "Uppercase letters (A–Z)",
  words: "Common words",
  sentences: "Short sentences",
};

function drawHandwritingGuides(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  zoneH: number,
) {
  const topLine = y;
  const midLine = y + zoneH * 0.4;
  const baseLine = y + zoneH * 0.7;
  const descLine = y + zoneH;

  doc.setLineWidth(0.5);
  doc.setDrawColor(180, 180, 180);
  doc.line(x, topLine, x + width, topLine);
  doc.line(x, baseLine, x + width, baseLine);
  doc.line(x, descLine, x + width, descLine);

  doc.setLineWidth(0.3);
  doc.setDrawColor(210, 210, 210);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(x, midLine, x + width, midLine);
  doc.setLineDashPattern([], 0);
}

export default function CursivePage() {
  const [contentType, setContentType] = useState<ContentType>("lowercase");
  const [linesPerPage, setLinesPerPage] = useState(6);
  const [pageCount, setPageCount] = useState(3);
  const [pageSize, setPageSize] = useState<PageSizeKey>("eInk");
  const [generating, setGenerating] = useState(false);

  const previewItems = CONTENT_SETS[contentType].slice(0, 3);

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const margin = 36;
    const items = CONTENT_SETS[contentType];
    let itemIdx = 0;
    const practiceRows = 3;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(
        `Cursive Practice – ${CONTENT_LABELS[contentType]}  ·  Page ${page + 1}`,
        margin,
        margin + 16,
      );

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text("Name: ___________________________", w - margin, margin + 16, {
        align: "right",
      });

      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.5);
      doc.line(margin, margin + 22, w - margin, margin + 22);

      const contentTop = margin + 34;
      const contentH = h - contentTop - margin;
      const lineBlockH = contentH / linesPerPage;
      const guideWidth = w - margin * 2;
      const totalRows = 1 + practiceRows;
      const zoneH = (lineBlockH - 8) / totalRows;

      for (let li = 0; li < linesPerPage; li++) {
        const item = items[itemIdx % items.length];
        itemIdx++;
        const blockY = contentTop + li * lineBlockH;

        const modelY = blockY + 2;

        drawHandwritingGuides(doc, margin, modelY, guideWidth, zoneH);

        doc.setFontSize(Math.min(zoneH * 0.55, 22));
        doc.setFont("helvetica", "bolditalic");
        doc.setTextColor(60, 60, 60);
        const textBaseline = modelY + zoneH * 0.65;
        doc.text(item, margin + 6, textBaseline);

        if (contentType === "lowercase" || contentType === "uppercase") {
          const modelWidth = doc.getTextWidth(item) + 12;
          const repeatCount = Math.floor(
            (guideWidth - modelWidth) / (doc.getTextWidth(item + " ") || 20),
          );
          doc.setTextColor(200, 200, 200);
          for (let r = 0; r < Math.min(repeatCount, 8); r++) {
            doc.text(
              item,
              margin + modelWidth + r * (doc.getTextWidth(item) + 8),
              textBaseline,
            );
          }
        }

        for (let row = 1; row <= practiceRows; row++) {
          const rowY = blockY + 2 + row * zoneH;
          drawHandwritingGuides(doc, margin, rowY, guideWidth, zoneH);
        }

        if (li < linesPerPage - 1) {
          doc.setDrawColor(230, 230, 230);
          doc.setLineWidth(0.2);
          const sepY = blockY + lineBlockH - 2;
          doc.line(margin, sepY, w - margin, sepY);
        }
      }
    }

    doc.save(`cursive-${contentType}-${linesPerPage}l-${pageCount}p.pdf`);
    setGenerating(false);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Cursive Handwriting Practice
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Guided cursive writing sheets with four-line guidelines for letters,
          words, and sentences.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
        <div className="space-y-1.5">
          <Label>Content type</Label>
          <Select
            value={contentType}
            onValueChange={(v) => setContentType(v as ContentType)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CONTENT_LABELS).map(([k, label]) => (
                <SelectItem key={k} value={k}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Lines per page: {linesPerPage}</Label>
          <Slider
            min={4}
            max={8}
            value={[linesPerPage]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setLinesPerPage(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>4</span>
            <span>8</span>
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
            <span>1</span>
            <span>10</span>
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
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
            <span className="text-sm font-semibold">
              Cursive – {CONTENT_LABELS[contentType]}
            </span>
            <span className="text-xs text-muted-foreground">
              Name: ____________
            </span>
          </div>
          <div className="space-y-4">
            {previewItems.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="relative border-l-2 border-muted-foreground/10 pl-3">
                  <div className="italic font-serif text-lg text-foreground/80 mb-1">
                    {item}
                  </div>
                  {Array.from({ length: 3 }).map((_, row) => (
                    <div key={row} className="relative h-7">
                      <div className="absolute inset-x-0 top-0 border-t border-muted-foreground/15" />
                      <div className="absolute inset-x-0 top-[40%] border-t border-dashed border-muted-foreground/10" />
                      <div className="absolute inset-x-0 top-[70%] border-t border-muted-foreground/15" />
                      <div className="absolute inset-x-0 bottom-0 border-t border-muted-foreground/15" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Four-line guides: top line, dashed midline, baseline, descender
            line.
          </p>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating
          ? "Generating…"
          : `Generate & Download PDF (${pageCount} page${pageCount > 1 ? "s" : ""})`}
      </Button>
    </div>
  );
}
