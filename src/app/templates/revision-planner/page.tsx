"use client";

import { useState } from "react";
import { TemplateShell } from "@/components/templates/template-shell";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  createDoc,
  addPage,
  drawHeader,
  drawPageNumber,
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

export default function RevisionPlannerPage() {
  const [subjects, setSubjects] = useState(6);

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    const dayLabels =
      variants.weekStart === "sunday"
        ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Page 1: Subject overview
    drawHeader(doc, variants, { title: "Revision Planner", dark: true });

    let y = m.top + 48;
    drawSectionTitle(doc, "Subjects & Topics", m.left + 4, y);
    y += 12;

    const subjectH = Math.min(60, (h - m.bottom - y - 20) / subjects);
    for (let i = 0; i < subjects; i++) {
      const sy = y + i * subjectH;
      doc.setFontSize(8);
      const [tr, tg, tb] = COLORS.textMedium;
      doc.setTextColor(tr, tg, tb);
      doc.text(`${i + 1}.`, m.left + 6, sy + 10);
      const [llr, llg, llb] = COLORS.lineLight;
      doc.setDrawColor(llr, llg, llb);
      doc.setLineWidth(0.3);
      doc.line(m.left + 16, sy + 12, w - m.right - 4, sy + 12);
      // Confidence level
      doc.setFontSize(6);
      const [tl, tlg, tlb] = COLORS.textLight;
      doc.setTextColor(tl, tlg, tlb);
      doc.text("Confidence:  1  ○  2  ○  3  ○  4  ○  5", m.left + 16, sy + 24);

      // Topics lines
      doc.setDrawColor(llr, llg, llb);
      doc.setLineWidth(0.2);
      for (let t = 0; t < 2; t++) {
        doc.line(m.left + 16, sy + 32 + t * 14, w - m.right - 4, sy + 32 + t * 14);
      }
    }

    const [br, bg, bb] = COLORS.black;
    doc.setTextColor(br, bg, bb);
    drawPageNumber(doc, 1, pageCount, variants);

    // Weekly revision schedule pages
    for (let p = 1; p < pageCount; p++) {
      addPage(doc, variants);
      drawHeader(doc, variants, { title: `Revision Week ${p}` });

      const gridTop = m.top + 48;
      const subColW = bodyW * 0.2;
      const dayColW = (bodyW - subColW) / 7;
      const rowH = Math.min(28, (h - m.bottom - gridTop - 10) / (subjects + 1));

      // Header
      const [hbr, hbg, hbb] = COLORS.headerBg;
      doc.setFillColor(hbr, hbg, hbb);
      doc.rect(m.left, gridTop, bodyW, rowH, "F");

      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      const [tmr, tmg, tmb] = COLORS.textMedium;
      doc.setTextColor(tmr, tmg, tmb);
      doc.text("Subject", m.left + 4, gridTop + rowH / 2 + 2);

      dayLabels.forEach((day, i) => {
        const dx = m.left + subColW + i * dayColW;
        doc.text(day, dx + dayColW / 2, gridTop + rowH / 2 + 2, { align: "center" });
      });
      doc.setFont("helvetica", "normal");

      // Grid
      const [lr, lg, lb] = COLORS.lineMedium;
      doc.setDrawColor(lr, lg, lb);
      doc.setLineWidth(0.4);
      doc.rect(m.left, gridTop, bodyW, rowH * (subjects + 1), "S");
      doc.line(m.left + subColW, gridTop, m.left + subColW, gridTop + rowH * (subjects + 1));

      for (let d = 1; d < 7; d++) {
        const x = m.left + subColW + d * dayColW;
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.2);
        doc.line(x, gridTop, x, gridTop + rowH * (subjects + 1));
      }

      const [llr, llg, llb] = COLORS.lineLight;
      for (let r = 1; r <= subjects; r++) {
        const ry = gridTop + r * rowH;
        doc.setDrawColor(llr, llg, llb);
        doc.setLineWidth(0.3);
        doc.line(m.left, ry, w - m.right, ry);

        for (let d = 0; d < 7; d++) {
          const cx = m.left + subColW + d * dayColW + (dayColW - 7) / 2;
          drawCheckbox(doc, cx, ry + (rowH - 7) / 2, 7);
        }
      }

      // Notes below grid
      const notesY = gridTop + rowH * (subjects + 1) + 12;
      if (notesY < h - m.bottom - 40) {
        drawSectionTitle(doc, "Session Notes", m.left + 4, notesY);
        drawHorizontalLines(doc, variants, {
          startY: notesY + 4,
          endY: h - m.bottom,
          spacing: 16,
        });
      }

      doc.setTextColor(br, bg, bb);
      drawPageNumber(doc, p + 1, pageCount, variants);
    }

    doc.save(`revision-planner-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Revision Planner"
      description="Subject overview with confidence tracking and weekly revision schedule grids."
      showWeekStart
      onGenerate={generate}
      defaultPageCount={5}
      maxPages={12}
      extraControls={() => (
        <div className="space-y-2">
          <Label>Number of subjects: {subjects}</Label>
          <Slider
            min={3}
            max={12}
            value={[subjects]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setSubjects(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3</span><span>12</span>
          </div>
        </div>
      )}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>{subjects} subjects with confidence ratings</div>
          <div>Weekly revision schedule grids</div>
          <div>Checkbox per subject per day</div>
          <div>Session notes area</div>
        </div>
      )}
    </TemplateShell>
  );
}
