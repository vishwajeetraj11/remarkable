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
  drawHorizontalLines,
} from "@/lib/templates/pdf-utils";
import { COLORS } from "@/lib/templates/constants";
import {
  type TemplateVariants,
  getPageDimensions,
  getMargins,
  variantSuffix,
} from "@/lib/templates/variants";

export default function ProjectTimelinePage() {
  const [milestones, setMilestones] = useState(8);

  async function generate(variants: TemplateVariants, pageCount: number) {
    const doc = createDoc(variants);
    const { w, h } = getPageDimensions(variants);
    const m = getMargins(variants);
    const bodyW = w - m.left - m.right;

    // Page 1: Timeline overview
    drawHeader(doc, variants, { title: "Project Timeline", dark: true });

    let y = m.top + 48;
    const timelineX = m.left + 30;
    const dotR = 4;
    const availH = h - m.bottom - y - 20;
    const stepH = Math.min(availH / milestones, 60);

    for (let i = 0; i < milestones; i++) {
      const cy = y + i * stepH + dotR;

      // Vertical connector
      if (i < milestones - 1) {
        const [lr, lg, lb] = COLORS.lineLight;
        doc.setDrawColor(lr, lg, lb);
        doc.setLineWidth(1);
        doc.line(timelineX, cy + dotR, timelineX, cy + stepH);
      }

      // Milestone dot
      const [mr, mg, mb] = COLORS.textMedium;
      doc.setFillColor(mr, mg, mb);
      doc.circle(timelineX, cy, dotR, "F");

      // Milestone number
      doc.setFontSize(6);
      const [wr, wg, wb] = COLORS.white;
      doc.setTextColor(wr, wg, wb);
      doc.text(String(i + 1), timelineX, cy + 2, { align: "center" });

      // Date + description lines
      const [lr2, lg2, lb2] = COLORS.lineLight;
      doc.setDrawColor(lr2, lg2, lb2);
      doc.setLineWidth(0.3);
      doc.line(timelineX + 12, cy + 2, timelineX + 70, cy + 2);
      doc.line(timelineX + 12, cy + 14, w - m.right - 4, cy + 14);

      doc.setFontSize(6);
      const [tr, tg, tb] = COLORS.textLight;
      doc.setTextColor(tr, tg, tb);
      doc.text("Date:", timelineX + 12, cy);
    }

    const [br, bg, bb] = COLORS.black;
    doc.setTextColor(br, bg, bb);
    drawPageNumber(doc, 1, pageCount, variants);

    // Extra notes pages
    for (let p = 1; p < pageCount; p++) {
      addPage(doc, variants);
      drawHeader(doc, variants, { title: "Timeline — Notes" });
      drawSectionTitle(doc, `Milestone Details (Page ${p + 1})`, m.left + 4, m.top + 48);
      drawHorizontalLines(doc, variants, {
        startY: m.top + 52,
        endY: h - m.bottom,
        spacing: 18,
      });
      drawPageNumber(doc, p + 1, pageCount, variants);
    }

    doc.save(`project-timeline-${variantSuffix(variants)}-${pageCount}p.pdf`);
  }

  return (
    <TemplateShell
      title="Project Timeline"
      description="Visual milestone timeline with date and description fields for each milestone."
      onGenerate={generate}
      defaultPageCount={2}
      maxPages={10}
      extraControls={() => (
        <div className="space-y-2">
          <Label>Milestones: {milestones}</Label>
          <Slider
            min={3}
            max={15}
            value={[milestones]}
            onValueChange={(v) => {
              const val = Array.isArray(v) ? v[0] : v;
              setMilestones(val);
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3</span><span>15</span>
          </div>
        </div>
      )}
    >
      {() => (
        <div className="text-xs text-muted-foreground space-y-1.5">
          <div>{milestones} milestones on visual timeline</div>
          <div>Date & description fields per milestone</div>
          <div>Additional notes pages</div>
        </div>
      )}
    </TemplateShell>
  );
}
