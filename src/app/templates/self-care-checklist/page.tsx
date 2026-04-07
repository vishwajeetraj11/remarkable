"use client";

import { TemplateShell } from "@/components/templates/template-shell";
import {
  createDoc,
  drawPageNumber,
  drawHeader,
  drawSectionTitle,
  drawCheckbox,
  drawHorizontalLines,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

const MORNING = ["Hydration", "Movement", "Skincare", "Mindfulness", "Breakfast"];
const AFTERNOON = ["Lunch", "Walk", "Stretch", "Connect with someone"];
const EVENING = ["Dinner", "Wind-down", "Gratitude", "Sleep prep"];

function drawChecklistSection(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  title: string,
  items: string[],
  x: number,
  y: number,
  width: number
) {
  drawSectionTitle(doc, title, x, y);
  const itemH = 16;
  const startY = y + 6;

  for (let i = 0; i < items.length; i++) {
    const iy = startY + i * itemH;
    drawCheckbox(doc, x + 2, iy, 8);
    const [tr, tg, tb] = COLORS.textDark;
    doc.setTextColor(tr, tg, tb);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(items[i], x + 14, iy + 7);

    if (i < items.length - 1) {
      const [lr, lg, lb] = COLORS.lineLight;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.2);
      doc.line(x, iy + itemH - 1, x + width, iy + itemH - 1);
    }
  }

  return startY + items.length * itemH;
}

function drawScaleCircles(
  doc: InstanceType<typeof import("jspdf").jsPDF>,
  label: string,
  x: number,
  y: number,
  count: number,
  labels?: string[]
) {
  drawSectionTitle(doc, label, x, y);
  const circleR = 8;
  const gap = 24;
  const startX = x + 4;
  const cy = y + 16;

  const [lmr, lmg, lmb] = COLORS.lineMedium;
  for (let i = 0; i < count; i++) {
    const cx = startX + i * gap + circleR;
    doc.setDrawColor(lmr, lmg, lmb);
    doc.setLineWidth(0.5);
    doc.circle(cx, cy, circleR, "S");

    const [tlr, tlg, tlb] = COLORS.textLight;
    doc.setTextColor(tlr, tlg, tlb);
    doc.setFontSize(6);
    const displayLabel = labels ? labels[i] : String(i + 1);
    doc.text(displayLabel, cx, cy + 2, { align: "center" });
  }

  return cy + circleR + 8;
}

export default function SelfCareChecklistPage() {
  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) doc.addPage();

      drawHeader(doc, variants, {
        title: "Self-Care Checklist",
        subtitle: `Day ${page + 1}`,
      });

      let y = m.top + 38;

      const colW = bodyW / 2 - 8;
      const leftX = m.left + 4;
      const rightX = m.left + bodyW / 2 + 8;

      let leftY = y;
      leftY = drawChecklistSection(doc, "Morning Routine", MORNING, leftX, leftY, colW);
      leftY += 10;
      leftY = drawChecklistSection(doc, "Afternoon", AFTERNOON, leftX, leftY, colW);
      leftY += 10;
      leftY = drawChecklistSection(doc, "Evening", EVENING, leftX, leftY, colW);

      let rightY = y;
      rightY = drawScaleCircles(doc, "Mood (1–5)", rightX, rightY, 5);
      rightY += 6;
      rightY = drawScaleCircles(doc, "Energy Level (1–5)", rightX, rightY, 5);
      rightY += 6;
      rightY = drawScaleCircles(doc, "Water Intake", rightX, rightY, 8, [
        "1", "2", "3", "4", "5", "6", "7", "8",
      ]);

      rightY += 10;
      drawSectionTitle(doc, "Notes", rightX, rightY);
      rightY += 6;

      const notesEndY = Math.max(leftY, h - m.bottom - 24);
      drawHorizontalLines(doc, variants, {
        startY: rightY,
        endY: notesEndY,
        spacing: 16,
      });

      const [br, bg, bb] = COLORS.black;
      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, page + 1, pageCount, variants);
    }

    doc.save(`self-care-checklist-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Self-Care Checklist"
      description="Daily self-care tracking with morning, afternoon, and evening routines plus mood, energy, and hydration logs."
      onGenerate={generate}
      defaultPageCount={7}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>Morning (5), Afternoon (4), Evening (4) checklists</div>
          <div>Mood + Energy 1–5 scale circles</div>
          <div>Water intake tracker (8 glasses)</div>
          <div>Notes section with lined area</div>
        </div>
      )}
    </TemplateShell>
  );
}
