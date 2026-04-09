"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Toggle } from "@/components/templates/variant-controls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { createDoc, drawPageNumber } from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  variantSuffix,
} from "@/lib/templates/variants";

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toWeekStart(date: Date, weekStart: "monday" | "sunday") {
  const d = new Date(date);
  const day = d.getDay();
  if (weekStart === "sunday") {
    d.setDate(d.getDate() - day);
  } else {
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
  }
  return d;
}

function getDayLabels(weekStart: "monday" | "sunday") {
  return weekStart === "sunday"
    ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
}

export default function PlannerPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [weeks, setWeeks] = useState(4);
  const [timeSlots, setTimeSlots] = useState(false);

  async function generate(variants: TemplateVariants) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const margin = 24;
    const startDay = toWeekStart(
      new Date(startDate + "T00:00:00"),
      variants.weekStart
    );
    const DAYS = getDayLabels(variants.weekStart);
    const totalPages = weeks + 1;
    const overallEnd = addDays(startDay, weeks * 7 - 1);

    // Page 1: Summary / Overview
    doc.setFillColor(COLORS.headerBgDark[0], COLORS.headerBgDark[1], COLORS.headerBgDark[2]);
    doc.rect(margin, margin, w - margin * 2, 28, "F");
    doc.setTextColor(COLORS.white[0], COLORS.white[1], COLORS.white[2]);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Weekly Planner \u2014 ${formatDateLabel(startDay)} \u2013 ${formatDateLabel(overallEnd)}`,
      margin + 8,
      margin + 18
    );

    const tocStartY = margin + 48;
    const tocLineH = 22;

    for (let wi = 0; wi < weeks; wi++) {
      const wb = addDays(startDay, wi * 7);
      const we = addDays(wb, 6);
      const label = `Week ${wi + 1}  \u00b7  ${formatDateLabel(wb)} \u2013 ${formatDateLabel(we)}`;
      const y = tocStartY + wi * tocLineH;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(COLORS.black[0], COLORS.black[1], COLORS.black[2]);
      doc.text(label, margin + 8, y);

      const textW = doc.getTextWidth(label);
      doc.link(margin + 8, y - 10, textW, 14, { pageNumber: wi + 2 });

      doc.setDrawColor(COLORS.lineLight[0], COLORS.lineLight[1], COLORS.lineLight[2]);
      doc.setLineWidth(0.3);
      doc.line(margin + 8, y + 2, margin + 8 + textW, y + 2);
    }

    drawPageNumber(doc, 1, totalPages, variants);

    // Week pages (pages 2..N)
    for (let week = 0; week < weeks; week++) {
      doc.addPage();

      const weekBegin = addDays(startDay, week * 7);
      const weekEnd = addDays(weekBegin, 6);

      const [hr, hg, hb] = COLORS.headerBgDark;
      doc.setFillColor(hr, hg, hb);
      doc.rect(margin, margin, w - margin * 2, 28, "F");
      const [wr, wg, wb] = COLORS.white;
      doc.setTextColor(wr, wg, wb);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Week ${week + 1}  \u00b7  ${formatDateLabel(weekBegin)} \u2013 ${formatDateLabel(weekEnd)}`,
        margin + 8,
        margin + 18
      );

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      const backText = "< Overview";
      const backW = doc.getTextWidth(backText);
      doc.text(backText, w - margin - 8 - backW, margin + 18);
      doc.link(w - margin - 8 - backW, margin + 8, backW + 4, 16, { pageNumber: 1 });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      doc.setFont("helvetica", "normal");

      const headerBottom = margin + 28;
      const colW = (w - margin * 2) / 7;
      const bodyTop = headerBottom + 22;
      const bodyBottom = h - margin;
      const bodyH = bodyBottom - bodyTop;

      DAYS.forEach((day, i) => {
        const x = margin + i * colW;
        const dayDate = addDays(weekBegin, i);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.text(day, x + colW / 2, headerBottom + 10, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.text(formatDateLabel(dayDate), x + colW / 2, headerBottom + 19, {
          align: "center",
        });
      });

      const [lr, lg, lb] = COLORS.lineLight;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.5);
      for (let i = 0; i <= 7; i++) {
        const x = margin + i * colW;
        doc.line(x, headerBottom, x, bodyBottom);
      }
      doc.line(margin, bodyBottom, w - margin, bodyBottom);
      doc.line(margin, headerBottom, w - margin, headerBottom);

      if (timeSlots) {
        const hours = Array.from({ length: 17 }, (_, i) => i + 6);
        const slotH = bodyH / hours.length;
        hours.forEach((hr, idx) => {
          const y = bodyTop + idx * slotH;
          doc.setFontSize(5.5);
          const [tr, tg, tb] = COLORS.textLight;
          doc.setTextColor(tr, tg, tb);
          const label =
            hr < 12 ? `${hr}am` : hr === 12 ? "12pm" : `${hr - 12}pm`;
          doc.text(label, margin + 2, y + 7);
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.3);
          doc.line(margin, y, w - margin, y);
        });
        doc.setTextColor(br, bg, bb);
      } else {
        const lineSpacing = 24;
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        let y = bodyTop + lineSpacing;
        while (y < bodyBottom - 4) {
          doc.line(margin, y, w - margin, y);
          y += lineSpacing;
        }
      }

      drawPageNumber(doc, week + 2, totalPages, variants);
    }

    doc.save(`weekly-planner-${variantSuffix(variants)}-${weeks}w.pdf`);
  }

  const previewStart = toWeekStart(
    new Date(startDate + "T00:00:00"),
    "monday"
  );
  const DAYS_PREVIEW = getDayLabels("monday");

  return (
    <TemplateShell
      title="Weekly Planner"
      description="Seven-column weekly layout with optional hourly time slots."
      showWeekStart
      showPageCount={false}
      onGenerate={generate}
      downloadLabel={() =>
        `Generate & Download PDF (${weeks} week${weeks > 1 ? "s" : ""})`
      }
      extraControls={() => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="startDate">Start date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Number of weeks: {weeks}</Label>
            <Slider
              min={1}
              max={12}
              value={[weeks]}
              onValueChange={(v) => {
                const val = Array.isArray(v) ? v[0] : v;
                setWeeks(val);
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>12</span>
            </div>
          </div>
          <div className="pt-1">
            <Toggle
              checked={timeSlots}
              onToggle={() => setTimeSlots((v) => !v)}
              label="Include hourly time slots (6 am – 10 pm)"
            />
          </div>
        </div>
      )}
    >
      {() => (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[520px]">
            <div className="bg-foreground text-background text-xs font-bold px-3 py-2 rounded-t-md">
              Week 1 &middot; {formatDateLabel(previewStart)} –{" "}
              {formatDateLabel(addDays(previewStart, 6))}
            </div>
            <div className="grid grid-cols-7 border border-t-0 border-border rounded-b-md divide-x divide-border">
              {DAYS_PREVIEW.map((day, i) => (
                <div key={day} className="flex flex-col">
                  <div className="text-center py-1.5 bg-muted/30 border-b border-border">
                    <div className="text-xs font-semibold">{day}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatDateLabel(addDays(previewStart, i))}
                    </div>
                  </div>
                  {timeSlots
                    ? Array.from({ length: 6 }, (_, s) => (
                        <div
                          key={s}
                          className="border-b border-border/50 px-1 py-1.5 text-[9px] text-muted-foreground/60"
                        >
                          {s + 6 < 12
                            ? `${s + 6}am`
                            : s + 6 === 12
                              ? "12pm"
                              : `${s + 6 - 12}pm`}
                        </div>
                      ))
                    : Array.from({ length: 5 }, (_, l) => (
                        <div key={l} className="border-b border-border/50 py-3" />
                      ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </TemplateShell>
  );
}
