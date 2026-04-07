"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
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

function getDayHeaders(weekStart: "monday" | "sunday") {
  return weekStart === "sunday"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}

function getCalendarGrid(year: number, month: number, weekStart: "monday" | "sunday") {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let startOffset = firstDay.getDay();
  if (weekStart === "monday") {
    startOffset = startOffset === 0 ? 6 : startOffset - 1;
  }
  const grid: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  while (grid.length % 7 !== 0) grid.push(null);
  return grid;
}

export default function MonthlyCalendarPage() {
  const now = new Date();
  const [startMonth, setStartMonth] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [months, setMonths] = useState(3);

  async function generate(variants: TemplateVariants, _pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const [startYear, startMo] = startMonth.split("-").map(Number);
    const dayHeaders = getDayHeaders(variants.weekStart);
    const totalPages = months + 1;

    // Page 1: Table of Contents
    drawHeader(doc, variants, { title: "Calendar Navigation", dark: true });

    const tocStartY = m.top + 52;
    const tocLineH = 22;

    for (let mi = 0; mi < months; mi++) {
      const date = new Date(startYear, startMo - 1 + mi, 1);
      const label = `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
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

    // Month pages (pages 2..N)
    for (let mi = 0; mi < months; mi++) {
      addPage(doc, variants);

      const date = new Date(startYear, startMo - 1 + mi, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      const grid = getCalendarGrid(year, month, variants.weekStart);
      const rows = grid.length / 7;

      drawHeader(doc, variants, {
        title: `${MONTH_NAMES[month]} ${year}`,
        dark: true,
      });

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

      // Day headers
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

      // Horizontal lines
      for (let r = 0; r <= rows + 1; r++) {
        const y = gridTop + r * rowH;
        doc.line(m.left, y, w - m.right, y);
      }
      // Vertical lines
      for (let c = 0; c <= 7; c++) {
        const x = m.left + c * colW;
        doc.line(x, gridTop, x, gridTop + (rows + 1) * rowH);
      }

      // Day numbers
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

    doc.save(`monthly-calendar-${startMonth}-${months}m-${variantSuffix(variants)}.pdf`);
  }

  return (
    <TemplateShell
      title="Monthly Calendar"
      description="Traditional monthly grid calendar with large day cells for notes and events."
      showWeekStart
      showPageCount={false}
      onGenerate={generate}
      downloadLabel={() =>
        `Generate & Download PDF (${months} month${months > 1 ? "s" : ""})`
      }
      extraControls={() => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Start month</Label>
            <Input
              type="month"
              value={startMonth}
              onChange={(e) => setStartMonth(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Number of months: {months}</Label>
            <Slider
              min={1}
              max={12}
              value={[months]}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                setMonths(val);
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span><span>12</span>
            </div>
          </div>
        </div>
      )}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>One page per month</div>
          <div>7-column grid with day numbers</div>
          <div>Large cells for writing</div>
        </div>
      )}
    </TemplateShell>
  );
}
