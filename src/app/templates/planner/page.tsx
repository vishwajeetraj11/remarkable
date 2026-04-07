"use client";

import { useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function formatDateLabel(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Find the Monday on or before a date
function toMonday(date: Date) {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export default function PlannerPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [weeks, setWeeks] = useState(4);
  const [timeSlots, setTimeSlots] = useState(false);
  const [pageSize, setPageSize] = useState<PageSizeKey>("remarkable");
  const [generating, setGenerating] = useState(false);

  async function generate() {
    setGenerating(true);
    const { w, h } = PAGE_SIZES[pageSize];
    const doc = new jsPDF({ unit: "pt", format: [w, h] });

    const margin = 24;
    const startMonday = toMonday(new Date(startDate + "T00:00:00"));

    for (let week = 0; week < weeks; week++) {
      if (week > 0) doc.addPage();

      const weekStart = addDays(startMonday, week * 7);
      const weekEnd = addDays(weekStart, 6);

      // Header band
      doc.setFillColor(30, 30, 30);
      doc.rect(margin, margin, w - margin * 2, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Week ${week + 1}  ·  ${formatDateLabel(weekStart)} – ${formatDateLabel(weekEnd)}`,
        margin + 8,
        margin + 18
      );

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      const headerBottom = margin + 28;
      const colW = (w - margin * 2) / 7;
      const bodyTop = headerBottom + 22;
      const bodyBottom = h - margin;
      const bodyH = bodyBottom - bodyTop;

      // Day headers
      DAYS.forEach((day, i) => {
        const x = margin + i * colW;
        const dayDate = addDays(weekStart, i);
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "bold");
        doc.text(day, x + colW / 2, headerBottom + 10, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6.5);
        doc.text(formatDateLabel(dayDate), x + colW / 2, headerBottom + 19, {
          align: "center",
        });
      });

      // Column borders
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      for (let i = 0; i <= 7; i++) {
        const x = margin + i * colW;
        doc.line(x, headerBottom, x, bodyBottom);
      }
      doc.line(margin, bodyBottom, w - margin, bodyBottom);
      doc.line(margin, headerBottom, w - margin, headerBottom);

      if (timeSlots) {
        // Hours 6am – 10pm = 16 slots + header
        const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6..22
        const slotH = bodyH / hours.length;
        hours.forEach((hr, idx) => {
          const y = bodyTop + idx * slotH;
          doc.setFontSize(5.5);
          doc.setTextColor(140, 140, 140);
          const label = hr < 12 ? `${hr}am` : hr === 12 ? "12pm" : `${hr - 12}pm`;
          doc.text(label, margin + 2, y + 7);
          doc.setDrawColor(220, 220, 220);
          doc.setLineWidth(0.3);
          doc.line(margin, y, w - margin, y);
        });
        doc.setTextColor(0, 0, 0);
      } else {
        // Simple horizontal lines every ~24pt
        const lineSpacing = 24;
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        let y = bodyTop + lineSpacing;
        while (y < bodyBottom - 4) {
          doc.line(margin, y, w - margin, y);
          y += lineSpacing;
        }
      }
    }

    doc.save(`weekly-planner-${weeks}w.pdf`);
    setGenerating(false);
  }

  // Preview
  const previewWeekStart = toMonday(new Date(startDate + "T00:00:00"));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Weekly Planner</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Seven-column weekly layout with optional hourly time slots.
        </p>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 p-5 border border-border rounded-xl bg-muted/20">
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
            onValueChange={(v) => { const val = Array.isArray(v) ? v[0] : v; setWeeks(val); }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span><span>12</span>
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

        <div className="flex items-center gap-3 pt-6">
          <button
            type="button"
            onClick={() => setTimeSlots((v) => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full border-2 transition-colors focus:outline-none ${timeSlots ? "bg-foreground border-foreground" : "bg-muted border-border"}`}
          >
            <span
              className={`inline-block h-3 w-3 rounded-full bg-white transition-transform ${timeSlots ? "translate-x-4" : "translate-x-0.5"}`}
            />
          </button>
          <Label className="cursor-pointer" onClick={() => setTimeSlots((v) => !v)}>
            Include hourly time slots (6 am – 10 pm)
          </Label>
        </div>
      </div>

      {/* Preview */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground uppercase tracking-wide">Preview — Week 1</h2>
        <div className="border border-border rounded-xl overflow-hidden bg-white">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[520px] p-4">
              {/* Header */}
              <div className="bg-foreground text-background text-xs font-bold px-3 py-2 rounded-t-md">
                Week 1 &middot; {formatDateLabel(previewWeekStart)} – {formatDateLabel(addDays(previewWeekStart, 6))}
              </div>
              {/* Day columns */}
              <div className="grid grid-cols-7 border border-t-0 border-border rounded-b-md divide-x divide-border">
                {DAYS.map((day, i) => (
                  <div key={day} className="flex flex-col">
                    <div className="text-center py-1.5 bg-muted/30 border-b border-border">
                      <div className="text-xs font-semibold">{day}</div>
                      <div className="text-[10px] text-muted-foreground">{formatDateLabel(addDays(previewWeekStart, i))}</div>
                    </div>
                    {timeSlots ? (
                      Array.from({ length: 6 }, (_, s) => (
                        <div key={s} className="border-b border-border/50 px-1 py-1.5 text-[9px] text-muted-foreground/60">
                          {s + 6 < 12 ? `${s + 6}am` : s + 6 === 12 ? "12pm" : `${s + 6 - 12}pm`}
                        </div>
                      ))
                    ) : (
                      Array.from({ length: 5 }, (_, l) => (
                        <div key={l} className="border-b border-border/50 py-3" />
                      ))
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={generate} disabled={generating} size="lg">
        {generating ? "Generating…" : `Generate & Download PDF (${weeks} week${weeks > 1 ? "s" : ""})`}
      </Button>
    </div>
  );
}
