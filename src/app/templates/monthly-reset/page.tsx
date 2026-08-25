"use client";

import { useEffect, useState } from "react";
import { getLocalMonthInputValue } from "@/lib/client-date";
import { TemplateShell } from "@/components/templates/template-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addPage,
  createDoc,
  drawBox,
  drawCheckbox,
  drawHeader,
  drawPageNumber,
  drawSectionTitle,
  keepOnlyPage,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getMargins,
  getPageDimensions,
  variantSuffix,
} from "@/lib/templates/variants";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  return year && month ? `${MONTHS[month - 1]} ${year}` : "Monthly reset";
}

function drawWritingLines(
  doc: ReturnType<typeof createDoc>,
  x: number,
  y: number,
  width: number,
  height: number,
  spacing = 18,
) {
  doc.setDrawColor(COLORS.lineLight[0], COLORS.lineLight[1], COLORS.lineLight[2]);
  doc.setLineWidth(0.3);
  for (let lineY = y + spacing; lineY < y + height - 5; lineY += spacing) {
    doc.line(x + 8, lineY, x + width - 8, lineY);
  }
}

function drawLinedBox(
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

async function generateMonthlyReset(
  variants: TemplateVariants,
  startMonth: string,
  sampleOnly = false,
) {
  const doc = createDoc(variants);
  const { w, h } = getPageDimensions(variants);
  const m = getMargins(variants);
  const bodyW = w - m.left - m.right;
  const footerBottom = h - m.bottom - 22;
  const compact = h < 450;
  const gap = 12;
  const halfW = (bodyW - gap) / 2;
  const subtitle = monthLabel(startMonth);
  const total = 3;

  // Page 1: Reflection.
  drawHeader(doc, variants, { title: "Monthly reset - reflection", subtitle });
  let y = m.top + 48;
  const reflectionBoxH = compact ? 52 : 112;
  const reflectionGap = compact ? 8 : 12;
  drawLinedBox(doc, m.left, y, halfW, reflectionBoxH, "Wins");
  drawLinedBox(doc, m.left + halfW + gap, y, halfW, reflectionBoxH, "Friction");
  y += reflectionBoxH + reflectionGap;
  drawLinedBox(doc, m.left, y, bodyW, reflectionBoxH, "Lessons");
  y += reflectionBoxH + reflectionGap;
  drawLinedBox(doc, m.left, y, bodyW, Math.max(40, footerBottom - y), "What to carry forward");
  drawPageNumber(doc, 1, total, variants);

  // Page 2: Plan.
  addPage(doc, variants);
  drawHeader(doc, variants, { title: "Monthly reset - plan", subtitle });
  y = m.top + 48;
  const planTopH = compact ? 64 : 136;
  const planLowerH = compact ? 64 : 154;
  const planGap = compact ? 8 : 12;
  drawLinedBox(doc, m.left, y, bodyW, planTopH, "Top priorities");
  y += planTopH + planGap;
  drawLinedBox(doc, m.left, y, halfW, planLowerH, "Commitments");
  drawLinedBox(doc, m.left + halfW + gap, y, halfW, planLowerH, "Key dates");
  y += planLowerH + planGap;
  drawLinedBox(doc, m.left, y, bodyW, Math.max(40, footerBottom - y), "Monthly intention");
  drawPageNumber(doc, 2, total, variants);

  // Page 3: Habits and first actions.
  addPage(doc, variants);
  drawHeader(doc, variants, { title: "Monthly reset - routines", subtitle });
  y = m.top + 48;
  drawSectionTitle(doc, "Habits and routines", m.left + 4, y);
  y += 12;
  const rowH = compact ? 22 : 30;
  const habitRows = compact ? 6 : 8;
  const habitLabelW = bodyW * 0.42;
  const habitGridW = bodyW - habitLabelW;
  doc.setDrawColor(COLORS.lineMedium[0], COLORS.lineMedium[1], COLORS.lineMedium[2]);
  doc.setLineWidth(0.4);
  doc.rect(m.left, y, bodyW, rowH * habitRows, "S");
  doc.line(m.left + habitLabelW, y, m.left + habitLabelW, y + rowH * habitRows);
  for (let row = 1; row < habitRows; row += 1) {
    doc.setDrawColor(COLORS.lineLight[0], COLORS.lineLight[1], COLORS.lineLight[2]);
    doc.line(m.left, y + row * rowH, w - m.right, y + row * rowH);
  }
  for (let week = 1; week < 5; week += 1) {
    doc.line(m.left + habitLabelW + week * (habitGridW / 4), y, m.left + habitLabelW + week * (habitGridW / 4), y + rowH * habitRows);
  }
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.textMedium[0], COLORS.textMedium[1], COLORS.textMedium[2]);
  doc.text("Habit / routine", m.left + 5, y + 20);
  ["Week 1", "Week 2", "Week 3", "Week 4"].forEach((label, index) => {
    doc.text(label, m.left + habitLabelW + (index + 0.5) * (habitGridW / 4), y + 20, { align: "center" });
  });
  doc.setFont("helvetica", "normal");
  for (let row = 1; row < habitRows; row += 1) {
    for (let week = 0; week < 4; week += 1) {
      drawCheckbox(
        doc,
        m.left + habitLabelW + week * (habitGridW / 4) + habitGridW / 8 - 4,
        y + row * rowH + 10,
        8,
      );
    }
  }
  y += rowH * habitRows + (compact ? 12 : 18);
  drawLinedBox(doc, m.left, y, bodyW, Math.max(40, footerBottom - y), "First actions");
  drawPageNumber(doc, 3, total, variants);

  if (sampleOnly) keepOnlyPage(doc, 1);
  doc.save(`monthly-reset-${variantSuffix(variants)}-${sampleOnly ? "sample" : "full"}.pdf`);
}

export default function MonthlyResetPage() {
  const [startMonth, setStartMonth] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setStartMonth((value) => value || getLocalMonthInputValue());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <TemplateShell
      title="Monthly Reset"
      description="A three-page monthly reset for reflection, priorities, commitments, key dates, routines, and first actions."
      showPageCount={false}
      onGenerate={(variants) => generateMonthlyReset(variants, startMonth)}
      onSampleGenerate={(variants) => generateMonthlyReset(variants, startMonth, true)}
      downloadLabel={() => "Generate & Download 3-Page Reset"}
      extraControls={() => (
        <div className="space-y-1.5">
          <Label htmlFor="monthly-reset-start">Start month</Label>
          <Input
            id="monthly-reset-start"
            type="month"
            value={startMonth}
            onChange={(event) => setStartMonth(event.target.value)}
          />
        </div>
      )}
    >
      {() => (
        <div className="space-y-1.5 text-xs text-muted-foreground">
          <div>Reflection: wins, friction, and lessons</div>
          <div>Planning: priorities, commitments, and key dates</div>
          <div>Routines: habit grid and first actions</div>
        </div>
      )}
    </TemplateShell>
  );
}
