"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createDoc,
  addPage,
  drawHeader,
  drawPageNumber,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEARS = [2026, 2027] as const;
type Year = (typeof YEARS)[number];

function getDayHeaders(weekStart: "monday" | "sunday") {
  return weekStart === "sunday"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}

// Build a calendar grid of day numbers (or null for blank cells) for a given
// month. Dates are computed with LOCAL `new Date(year, monthIndex, 1)` — never
// string parsing — so there is no UTC-midnight drift that could push the 1st
// onto the wrong weekday in negative-offset timezones.
function getCalendarGrid(year: number, month: number, weekStart: "monday" | "sunday") {
  // getDay() of the 1st gives the weekday (0 = Sunday) in LOCAL time.
  const firstWeekday = new Date(year, month, 1).getDay();
  // Day 0 of the next month is the last day of THIS month → its day-of-month
  // is the number of days in the month (handles 28/29/30/31 correctly).
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Number of leading blank cells before the 1st, honoring the week start.
  let startOffset = firstWeekday;
  if (weekStart === "monday") {
    startOffset = startOffset === 0 ? 6 : startOffset - 1;
  }

  const grid: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  // Pad trailing cells so the grid is a whole number of 7-column rows.
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

export default function Calendar2026Page() {
  const [year, setYear] = useState<Year>(2026);

  async function generate(variants: TemplateVariants) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const dayHeaders = getDayHeaders(variants.weekStart);
    const totalPages = 13; // 1 TOC + 12 months

    // Page 1: Table of Contents (links to each month page)
    drawHeader(doc, variants, { title: `${year} Calendar`, dark: true });

    const tocStartY = m.top + 52;
    const tocLineH = 22;

    for (let mi = 0; mi < 12; mi++) {
      const label = `${MONTH_NAMES[mi]} ${year}`;
      const y = tocStartY + mi * tocLineH;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);
      doc.text(label, m.left + 8, y);

      const textW = doc.getTextWidth(label);
      doc.link(m.left + 8, y - 10, textW, 14, { pageNumber: mi + 2 });

      doc.setDrawColor(COLORS.lineMedium[0], COLORS.lineMedium[1], COLORS.lineMedium[2]);
      doc.setLineWidth(0.3);
      doc.line(m.left + 8, y + 2, m.left + 8 + textW, y + 2);
    }

    drawPageNumber(doc, 1, totalPages, variants);

    // Month pages (pages 2..13) — one real calendar grid per month.
    for (let mi = 0; mi < 12; mi++) {
      addPage(doc, variants);

      const grid = getCalendarGrid(year, mi, variants.weekStart);
      const rows = grid.length / 7;

      drawHeader(doc, variants, {
        title: `${MONTH_NAMES[mi]} ${year}`,
        dark: true,
      });

      // Back-to-TOC link in the header area.
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
      const tocText = "< TOC";
      const tocW = doc.getTextWidth(tocText);
      doc.text(tocText, w - m.right - tocW, m.top + 36);
      doc.link(w - m.right - tocW, m.top + 28, tocW, 12, { pageNumber: 1 });

      const gridTop = m.top + 44;
      const colW = bodyW / 7;
      const rowH = (h - m.bottom - gridTop - 12) / (rows + 1);

      // Day-of-week column headers.
      dayHeaders.forEach((day, i) => {
        const x = m.left + i * colW;
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        const [tr, tg, tb] = COLORS.textMedium;
        doc.setTextColor(tr, tg, tb);
        doc.text(day, x + colW / 2, gridTop + rowH / 2 + 2, { align: "center" });
      });

      doc.setFont("helvetica", "normal");
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);

      // Horizontal grid lines (header row + one per week).
      for (let r = 0; r <= rows + 1; r++) {
        const y = gridTop + r * rowH;
        doc.line(m.left, y, w - m.right, y);
      }
      // Vertical grid lines.
      for (let c = 0; c <= 7; c++) {
        const x = m.left + c * colW;
        doc.line(x, gridTop, x, gridTop + (rows + 1) * rowH);
      }

      // Real day numbers placed in the correct weekday columns.
      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      grid.forEach((day, idx) => {
        if (day === null) return;
        const col = idx % 7;
        const row = Math.floor(idx / 7);
        const x = m.left + col * colW + 4;
        const y = gridTop + (row + 1) * rowH + 10;
        doc.setFontSize(8);
        doc.text(String(day), x, y);
      });

      drawPageNumber(doc, mi + 2, totalPages, variants);
    }

    doc.save(`calendar-${year}-${variantSuffix(variants)}.pdf`);
  }

  return (
    <TemplateShell
      title={`${year} Calendar`}
      description="Dated monthly calendar with real day numbers in the correct weekday columns — one page per month for the whole year."
      showWeekStart
      showPageCount={false}
      onGenerate={generate}
      downloadLabel={() => `Generate & Download ${year} PDF (12 months)`}
      extraControls={() => (
        <div className="space-y-1.5">
          <Label>Year</Label>
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v) as Year)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Real dates for {year} (also offers 2027)</div>
          <div>12 pages — one per month, plus a linked contents page</div>
          <div>7-column grid with large cells for notes</div>
        </div>
      )}
    </TemplateShell>
  );
}
