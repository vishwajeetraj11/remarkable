"use client";

import { useEffect, useState } from "react";
import { getLocalYear } from "@/lib/client-date";
import { TemplateShell } from "@/components/templates/template-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  addPage,
  createDoc,
  drawBox,
  drawHeader,
  drawPageNumber,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getMargins,
  getPageDimensions,
  variantSuffix,
} from "@/lib/templates/variants";

const QUARTERS = {
  q1: "Q1 - January to March",
  q2: "Q2 - April to June",
  q3: "Q3 - July to September",
  q4: "Q4 - October to December",
} as const;

function drawWritingLines(
  doc: ReturnType<typeof createDoc>,
  x: number,
  y: number,
  width: number,
  height: number,
  spacing = 16,
) {
  doc.setDrawColor(COLORS.lineLight[0], COLORS.lineLight[1], COLORS.lineLight[2]);
  doc.setLineWidth(0.3);
  for (let lineY = y + spacing; lineY < y + height - 5; lineY += spacing) {
    doc.line(x + 8, lineY, x + width - 8, lineY);
  }
}

function drawReviewBox(
  doc: ReturnType<typeof createDoc>,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
) {
  drawBox(doc, x, y, width, height, { label });
  drawWritingLines(doc, x, y + 18, width, height - 18);
}

async function generateQuarterlyReview(
  variants: TemplateVariants,
  pageCount: number,
  quarter: keyof typeof QUARTERS,
  year: number,
) {
  const doc = createDoc(variants);
  const { w, h } = getPageDimensions(variants);
  const m = getMargins(variants);
  const bodyW = w - m.left - m.right;
  const footerBottom = h - m.bottom - 22;
  const compact = h < 450;
  const gap = 12;
  const halfW = (bodyW - gap) / 2;
  const subtitle = `${QUARTERS[quarter]} ${year}`;
  const bandGap = compact ? 6 : gap;
  const bandHeight = compact ? 42 : 82;

  for (let page = 0; page < pageCount; page += 1) {
    if (page > 0) addPage(doc, variants);
    drawHeader(doc, variants, {
      title: "Quarterly Review",
      subtitle,
    });

    let y = m.top + 48;
    drawReviewBox(doc, m.left, y, halfW, bandHeight, "Wins / results");
    drawReviewBox(doc, m.left + halfW + gap, y, halfW, bandHeight, "Evidence / metrics");
    y += bandHeight + bandGap;
    drawReviewBox(doc, m.left, y, halfW, bandHeight, "Lessons learned");
    drawReviewBox(doc, m.left + halfW + gap, y, halfW, bandHeight, "Stop / start / continue");
    y += bandHeight + bandGap;
    drawReviewBox(doc, m.left, y, bodyW, bandHeight, "Unfinished work");
    y += bandHeight + bandGap;
    drawReviewBox(doc, m.left, y, bodyW, Math.max(compact ? 40 : 72, footerBottom - y), "Next-quarter priorities");
    drawPageNumber(doc, page + 1, pageCount, variants);
  }

  doc.save(`quarterly-review-${quarter}-${year}-${variantSuffix(variants)}-${pageCount}p.pdf`);
}

export default function QuarterlyReviewPage() {
  const [quarter, setQuarter] = useState<keyof typeof QUARTERS>("q1");
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setYear((value) => value ?? getLocalYear());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <TemplateShell
      title="Quarterly Review"
      description="Close a quarter with evidence, lessons, unfinished work, and priorities for what comes next."
      onGenerate={(variants, pageCount) =>
        generateQuarterlyReview(variants, pageCount, quarter, year ?? 0)
      }
      defaultPageCount={1}
      maxPages={8}
      extraControls={() => (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Quarter</Label>
            <Select
              value={quarter}
              onValueChange={(value) => setQuarter(value as keyof typeof QUARTERS)}
            >
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(QUARTERS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quarterly-review-year">Year</Label>
            <Input
              id="quarterly-review-year"
              type="number"
              min={2000}
              max={2100}
              value={year ?? ""}
              onChange={(event) => {
                const nextYear = Number(event.target.value);
                if (Number.isFinite(nextYear)) {
                  setYear(Math.min(2100, Math.max(2000, nextYear)));
                }
              }}
            />
          </div>
        </div>
      )}
    >
      {() => (
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div>Evidence-first quarter closeout</div>
          <div>Wins, metrics, lessons, and unfinished work</div>
          <div>Clear next-quarter priority space</div>
        </div>
      )}
    </TemplateShell>
  );
}
