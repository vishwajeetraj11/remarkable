"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Toggle } from "@/components/templates/variant-controls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDoc, addPage, drawPageNumber } from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  type WeekStart,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

type Layout = "vertical" | "horizontal";

// Parse an ISO YYYY-MM-DD string into a LOCAL Date built from explicit y/m/d
// parts. We deliberately avoid `new Date("YYYY-MM-DD")`, which the spec parses
// as UTC midnight — in negative-offset (e.g. US) timezones that renders as the
// previous calendar day. Falls back to today on invalid input. Mirrors
// `formatStartDate` in variants.ts and calendar-2026's local date construction.
function parseLocalDate(iso: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (match) {
    const y = Number(match[1]);
    const mo = Number(match[2]);
    const d = Number(match[3]);
    const date = new Date(y, mo - 1, d);
    if (
      date.getFullYear() === y &&
      date.getMonth() === mo - 1 &&
      date.getDate() === d
    ) {
      return date;
    }
  }
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date: Date, days: number) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

function toWeekStart(date: Date, weekStart: WeekStart) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  if (weekStart === "sunday") {
    d.setDate(d.getDate() - day);
  } else {
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
  }
  return d;
}

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// e.g. "Mon 6 Jan" — weekday + day + month, all from LOCAL parts.
function formatDayLabel(date: Date) {
  return `${WEEKDAY_NAMES[date.getDay()]} ${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

// e.g. "6 Jan" — short day + month for column headers / ranges.
function formatShort(date: Date) {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]}`;
}

function getDayLabels(weekStart: WeekStart) {
  return weekStart === "sunday"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}

// Index within the week (0..6) that is the weekend, used for a subtle tint.
// Saturday = getDay() 6, Sunday = getDay() 0.
function isWeekend(date: Date) {
  const d = date.getDay();
  return d === 0 || d === 6;
}

export default function WeeklyDatedPage() {
  const today = new Date();
  const isoToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [startDate, setStartDate] = useState(isoToday);
  const [layout, setLayout] = useState<Layout>("vertical");

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;
    const weekOfDate = toWeekStart(parseLocalDate(startDate), variants.weekStart);
    const totalPages = pageCount;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) addPage(doc, variants);

      // Each page is the next consecutive week: page N = base week + N.
      const weekBegin = addDays(weekOfDate, page * 7);
      const weekEnd = addDays(weekBegin, 6);

      // Dark header bar with the week's real date range.
      const [hr, hg, hb] = COLORS.headerBgDark;
      doc.setFillColor(hr, hg, hb);
      doc.rect(m.left, m.top, bodyW, 28, "F");
      const [wr, wg, wb] = COLORS.white;
      doc.setTextColor(wr, wg, wb);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Week of ${formatShort(weekBegin)} – ${formatShort(weekEnd)}`,
        m.left + 8,
        m.top + 18
      );

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      doc.setFont("helvetica", "normal");

      const bodyTop = m.top + 28 + 12;
      const bodyBottom = h - m.bottom;
      const bodyH = bodyBottom - bodyTop;

      if (layout === "vertical") {
        drawVertical(doc, weekBegin, {
          left: m.left,
          right: w - m.right,
          top: bodyTop,
          bottom: bodyBottom,
          height: bodyH,
        });
      } else {
        drawHorizontal(doc, weekBegin, {
          left: m.left,
          right: w - m.right,
          top: bodyTop,
          bottom: bodyBottom,
          height: bodyH,
        });
      }

      drawPageNumber(doc, page + 1, totalPages, variants);
    }

    doc.save(
      `weekly-dated-${layout}-${variantSuffix(variants)}-${pageCount}w.pdf`
    );
  }

  return (
    <TemplateShell
      title="Weekly Dated Planner"
      description="Dated weekly planner with real dates — choose a vertical (rows) or horizontal (columns) layout."
      showWeekStart
      showPageCount
      maxPages={12}
      defaultPageCount={4}
      onGenerate={generate}
      downloadLabel={(pages) =>
        `Generate & Download PDF (${pages} week${pages > 1 ? "s" : ""})`
      }
      extraControls={() => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="weekStartDate">Week start date</Label>
            <Input
              id="weekStartDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Snaps to the week containing this date.
            </p>
          </div>
          <div className="pt-1 space-y-2">
            <Label>Layout</Label>
            <Toggle
              checked={layout === "horizontal"}
              onToggle={() =>
                setLayout((l) => (l === "vertical" ? "horizontal" : "vertical"))
              }
              label={
                layout === "vertical"
                  ? "Vertical (7 day rows)"
                  : "Horizontal (7 columns)"
              }
            />
          </div>
        </div>
      )}
    >
      {(variants) => {
        const previewWeek = toWeekStart(
          parseLocalDate(startDate),
          variants.weekStart
        );
        const DAYS = getDayLabels(variants.weekStart);
        return layout === "vertical" ? (
          <div className="w-full">
            <div className="bg-foreground text-background text-xs font-bold px-3 py-2 rounded-t-md">
              Week of {formatShort(previewWeek)} –{" "}
              {formatShort(addDays(previewWeek, 6))}
            </div>
            <div className="border border-t-0 border-border rounded-b-md divide-y divide-border">
              {DAYS.map((_, i) => {
                const d = addDays(previewWeek, i);
                return (
                  <div
                    key={i}
                    className={`flex items-stretch ${isWeekend(d) ? "bg-muted/40" : ""}`}
                  >
                    <div className="w-24 shrink-0 px-2 py-2.5 border-r border-border text-xs font-semibold">
                      {formatDayLabel(d)}
                    </div>
                    <div className="flex-1 px-2 py-2 space-y-2">
                      <div className="border-b border-border/50 h-3" />
                      <div className="border-b border-border/50 h-3" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[520px]">
              <div className="bg-foreground text-background text-xs font-bold px-3 py-2 rounded-t-md">
                Week of {formatShort(previewWeek)} –{" "}
                {formatShort(addDays(previewWeek, 6))}
              </div>
              <div className="grid grid-cols-7 border border-t-0 border-border rounded-b-md divide-x divide-border">
                {DAYS.map((_, i) => {
                  const d = addDays(previewWeek, i);
                  return (
                    <div key={i} className="flex flex-col">
                      <div
                        className={`text-center py-1.5 border-b border-border ${isWeekend(d) ? "bg-muted/40" : "bg-muted/30"}`}
                      >
                        <div className="text-xs font-semibold">
                          {WEEKDAY_NAMES[d.getDay()]}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {formatShort(d)}
                        </div>
                      </div>
                      {Array.from({ length: 5 }, (_, l) => (
                        <div key={l} className="border-b border-border/50 py-3" />
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }}
    </TemplateShell>
  );
}

interface Region {
  left: number;
  right: number;
  top: number;
  bottom: number;
  height: number;
}

// Vertical layout: the 7 days are stacked as horizontal rows running DOWN the
// page. Each row is labeled with the weekday + real date (e.g. "Mon 6 Jan") in
// a left gutter, with ruled writing lines filling the remaining row width. Rows
// auto-fit the available page height. Weekends get a subtle background tint.
function drawVertical(
  doc: import("jspdf").jsPDF,
  weekBegin: Date,
  region: Region
) {
  const { left, right, top, bottom, height } = region;
  const rowH = height / 7;
  const gutterW = 78;

  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(weekBegin, i);
    const rowTop = top + i * rowH;

    // Subtle weekend tint across the whole row.
    if (isWeekend(dayDate)) {
      const [fr, fg, fb] = COLORS.headerBg;
      doc.setFillColor(fr, fg, fb);
      doc.rect(left, rowTop, right - left, rowH, "F");
    }

    // Day label in the left gutter.
    doc.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(WEEKDAY_NAMES[dayDate.getDay()], left + 6, rowTop + 14);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(
      COLORS.textMedium[0],
      COLORS.textMedium[1],
      COLORS.textMedium[2]
    );
    doc.text(
      `${dayDate.getDate()} ${MONTH_NAMES[dayDate.getMonth()]}`,
      left + 6,
      rowTop + 24
    );
    doc.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);

    // Gutter divider.
    doc.setDrawColor(
      COLORS.lineMedium[0],
      COLORS.lineMedium[1],
      COLORS.lineMedium[2]
    );
    doc.setLineWidth(0.4);
    doc.line(left + gutterW, rowTop + 4, left + gutterW, rowTop + rowH - 4);

    // Ruled writing lines in the row body.
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    const lineSpacing = 18;
    let y = rowTop + lineSpacing;
    while (y < rowTop + rowH - 4) {
      doc.line(left + gutterW + 8, y, right, y);
      y += lineSpacing;
    }
  }

  // Outer + row-separator borders.
  doc.setDrawColor(
    COLORS.lineMedium[0],
    COLORS.lineMedium[1],
    COLORS.lineMedium[2]
  );
  doc.setLineWidth(0.5);
  for (let i = 0; i <= 7; i++) {
    const y = top + i * rowH;
    doc.line(left, y, right, y);
  }
  doc.line(left, top, left, bottom);
  doc.line(right, top, right, bottom);
}

// Horizontal layout: 7 columns across the page (like the existing planner),
// each with a dated header (weekday + real date) and ruled writing lines
// beneath. Weekends get a subtle header tint.
function drawHorizontal(
  doc: import("jspdf").jsPDF,
  weekBegin: Date,
  region: Region
) {
  const { left, right, top, bottom } = region;
  const colW = (right - left) / 7;
  const headerH = 24;
  const bodyTop = top + headerH;

  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(weekBegin, i);
    const x = left + i * colW;

    if (isWeekend(dayDate)) {
      const [fr, fg, fb] = COLORS.headerBg;
      doc.setFillColor(fr, fg, fb);
      doc.rect(x, top, colW, headerH, "F");
    }

    doc.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(WEEKDAY_NAMES[dayDate.getDay()], x + colW / 2, top + 10, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(
      COLORS.textMedium[0],
      COLORS.textMedium[1],
      COLORS.textMedium[2]
    );
    doc.text(
      `${dayDate.getDate()} ${MONTH_NAMES[dayDate.getMonth()]}`,
      x + colW / 2,
      top + 19,
      { align: "center" }
    );
    doc.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);
  }

  // Column dividers + outer frame.
  doc.setDrawColor(
    COLORS.lineMedium[0],
    COLORS.lineMedium[1],
    COLORS.lineMedium[2]
  );
  doc.setLineWidth(0.5);
  for (let i = 0; i <= 7; i++) {
    const x = left + i * colW;
    doc.line(x, top, x, bottom);
  }
  doc.line(left, top, right, top);
  doc.line(left, bodyTop, right, bodyTop);
  doc.line(left, bottom, right, bottom);

  // Ruled writing lines across the body.
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.3);
  const lineSpacing = 22;
  let y = bodyTop + lineSpacing;
  while (y < bottom - 4) {
    doc.line(left, y, right, y);
    y += lineSpacing;
  }
}
